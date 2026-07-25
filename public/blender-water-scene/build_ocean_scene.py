"""
build_ocean_scene.py
====================

Builds a completely procedural "moving water" 3D scene in Blender -- no external
assets, no external tools. Geometry, materials, sky, animation, rendering and the
final video encode all happen inside Blender.

The shot: a low camera skimming a golden-hour open sea. The water is driven by
Blender's Ocean modifier (animated over time, generating its own foam attribute),
shaded as genuinely transmissive water over a dark deep, with sea stacks and a
bobbing buoy to give the waves a sense of scale.

Written against Blender 5.1. Several things moved in 5.x and are handled here:
  * Scene.node_tree is gone -- the compositor is now Scene.compositing_node_group,
    a CompositorNodeTree node group fed by Group Input / Group Output.
  * CompositorNodeComposite no longer exists.
  * Glare / Lens Distortion settings are input SOCKETS now, not RNA properties.
  * Video output needs image_settings.media_type = 'VIDEO' before 'FFMPEG' becomes
    a valid file_format.
  * Sky texture: dust_density -> aerosol_density (plus turbidity, ground_albedo).
  * Multi-type nodes (Mix, Map Range) expose hidden sockets for every data type, so
    sockets must be matched among the *enabled* ones or you silently wire the wrong one.
  * The Attribute node's scalar output is 'Factor', not 'Fac'.

Usage (PowerShell):

    & "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" -b ^
        --factory-startup --python build_ocean_scene.py -- --stage all --quality preview
"""

import argparse
import math
import os
import sys
import time

import bpy
from mathutils import Vector

# --------------------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------------------

REPORT = []


def note(msg):
    REPORT.append(msg)
    print("[scene] " + msg)


def warn(msg):
    REPORT.append("WARN " + msg)
    print("[scene] WARN " + msg)


def set_attr(obj, name, value, label=""):
    if obj is None or not hasattr(obj, name):
        warn("%s.%s does not exist" % (label or type(obj).__name__, name))
        return False
    try:
        setattr(obj, name, value)
        return True
    except Exception as exc:
        warn("%s.%s = %r failed (%s)" % (label or type(obj).__name__, name, value, exc))
        return False


def try_set(obj, name, candidates, label=""):
    """Assign the first candidate that sticks. For dynamic enums whose valid values
    are not exposed through bl_rna (colour management, menu sockets)."""
    for cand in candidates:
        try:
            setattr(obj, name, cand)
            return cand
        except Exception:
            continue
    warn("none of %r accepted for %s.%s" % (candidates, label, name))
    return None


def _pick(sockets, key):
    """Match a socket among the ENABLED ones.

    Multi-type nodes keep one hidden socket per data type, all sharing a name, so a
    plain inputs['A'] lookup can hand back the float socket on an RGBA node.
    """
    if isinstance(key, int):
        return sockets[key] if 0 <= key < len(sockets) else None
    live = [s for s in sockets if s.enabled] or list(sockets)
    for s in live:
        if s.name == key:
            return s
    low = key.lower()
    for s in live:
        if s.name.lower() == low:
            return s
    for s in live:
        if low in s.name.lower():
            return s
    return None


def sock(node, key):
    s = _pick(node.inputs, key)
    if s is None:
        warn("input %r not on %s (have %r)"
             % (key, node.bl_idname, [x.name for x in node.inputs if x.enabled]))
    return s


def set_sock(node, key, value):
    if node is None:
        return False
    s = sock(node, key)
    if s is None:
        return False
    try:
        s.default_value = value
        return True
    except Exception as exc:
        warn("%s input %r = %r failed (%s)" % (node.bl_idname, key, value, exc))
        return False


def set_menu(node, key, candidates):
    """Menu sockets (Blender 5.x) take a display string, e.g. 'Fog Glow'."""
    if node is None:
        return None
    s = sock(node, key)
    if s is None:
        return None
    for cand in candidates:
        try:
            s.default_value = cand
            return cand
        except Exception:
            continue
    warn("%s menu %r rejected all of %r (current %r)"
         % (node.bl_idname, key, candidates, getattr(s, "default_value", None)))
    return None


def link(tree, a, a_key, b, b_key):
    if a is None or b is None:
        warn("link skipped, missing node")
        return None
    out = _pick(a.outputs, a_key)
    inp = _pick(b.inputs, b_key)
    if out is None or inp is None:
        warn("link %s.%r -> %s.%r failed to resolve" % (a.bl_idname, a_key, b.bl_idname, b_key))
        return None
    try:
        return tree.links.new(out, inp)
    except Exception as exc:
        warn("link failed (%s)" % exc)
        return None


def new_node(tree, bl_idname, location=(0, 0), label=None):
    try:
        n = tree.nodes.new(bl_idname)
    except Exception as exc:
        warn("node %s unavailable (%s)" % (bl_idname, exc))
        return None
    n.location = location
    if label:
        n.label = label
    return n


def fcurves_of(id_block):
    """Actions gained slots/layers in 4.4; walk both shapes."""
    ad = getattr(id_block, "animation_data", None)
    action = ad.action if ad else None
    if not action:
        return []
    curves = list(getattr(action, "fcurves", []))
    if not curves and hasattr(action, "layers"):
        for layer in action.layers:
            for strip in layer.strips:
                for bag in getattr(strip, "channelbags", []):
                    curves.extend(bag.fcurves)
    return curves


def set_interp(id_block, path_contains, interp):
    for fc in fcurves_of(id_block):
        if path_contains in fc.data_path:
            for kp in fc.keyframe_points:
                kp.interpolation = interp


def keyframe(obj, data_path, frames_values, index=-1, interp="BEZIER"):
    for frame, value in frames_values:
        if index >= 0:
            getattr(obj, data_path)[index] = value
        else:
            setattr(obj, data_path, value)
        obj.keyframe_insert(data_path=data_path, index=index, frame=frame)
    for fc in fcurves_of(obj):
        if fc.data_path.endswith(data_path) and (index < 0 or fc.array_index == index):
            for kp in fc.keyframe_points:
                kp.interpolation = interp


def shade_smooth(obj):
    """Mesh.auto_smooth is gone; set the per-face flag directly."""
    for poly in obj.data.polygons:
        poly.use_smooth = True


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for coll in (bpy.data.objects, bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                 bpy.data.cameras, bpy.data.worlds, bpy.data.textures, bpy.data.node_groups):
        for item in list(coll):
            try:
                coll.remove(item)
            except Exception:
                pass
    note("scene cleared")


# --------------------------------------------------------------------------------------
# Render settings
# --------------------------------------------------------------------------------------

def setup_render(scene, cfg):
    r = scene.render
    engine = "BLENDER_EEVEE"

    if cfg.engine == "cycles":
        try:
            addon = bpy.context.preferences.addons.get("cycles")
            if addon is None:
                bpy.ops.preferences.addon_enable(module="cycles")
                addon = bpy.context.preferences.addons.get("cycles")
            r.engine = "CYCLES"          # registered dynamically, absent from the static enum
            engine = "CYCLES"

            prefs = addon.preferences
            chosen = None
            for backend in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
                try:
                    prefs.compute_device_type = backend
                    prefs.get_devices()
                    gpus = [d for d in prefs.devices if d.type == backend]
                    if gpus:
                        for d in prefs.devices:
                            d.use = (d.type == backend)
                        chosen = (backend, [d.name for d in gpus])
                        break
                except Exception:
                    continue
            scene.cycles.device = "GPU" if chosen else "CPU"
            note("cycles on %s: %s" % chosen if chosen else "cycles on CPU")
        except Exception as exc:
            warn("cycles unavailable (%s), using EEVEE" % exc)
            r.engine = "BLENDER_EEVEE"
            engine = "BLENDER_EEVEE"

    if engine == "CYCLES":
        c = scene.cycles
        set_attr(c, "samples", cfg.samples, "cycles")
        set_attr(c, "use_adaptive_sampling", True, "cycles")
        set_attr(c, "adaptive_threshold", 0.01, "cycles")
        set_attr(c, "use_denoising", True, "cycles")
        try_set(c, "denoiser", ["OPTIX", "OPENIMAGEDENOISE"], "cycles")
        try_set(c, "denoising_input_passes", ["RGB_ALBEDO_NORMAL"], "cycles")
        set_attr(c, "max_bounces", 8, "cycles")
        set_attr(c, "diffuse_bounces", 2, "cycles")
        set_attr(c, "glossy_bounces", 4, "cycles")
        set_attr(c, "transmission_bounces", 8, "cycles")
        set_attr(c, "transparent_max_bounces", 8, "cycles")
        set_attr(c, "volume_bounces", 0, "cycles")
        # Water is a firefly factory. Killing caustics and blurring glossy bounces
        # costs a little physical accuracy and saves an enormous amount of noise.
        set_attr(c, "caustics_reflective", False, "cycles")
        set_attr(c, "caustics_refractive", False, "cycles")
        set_attr(c, "blur_glossy", 1.5, "cycles")
        set_attr(c, "sample_clamp_indirect", 8.0, "cycles")
    else:
        e = scene.eevee
        set_attr(e, "taa_render_samples", max(48, cfg.samples), "eevee")
        set_attr(e, "use_raytracing", True, "eevee")
        set_attr(e, "use_shadows", True, "eevee")

    r.resolution_x = cfg.width
    r.resolution_y = cfg.height
    r.resolution_percentage = 100
    r.fps = cfg.fps
    r.fps_base = 1.0
    r.film_transparent = False
    set_attr(r, "use_persistent_data", True, "render")

    # Motion blur lives on render (not cycles) in 5.x.
    set_attr(r, "use_motion_blur", cfg.motion_blur, "render")
    set_attr(r, "motion_blur_shutter", 0.45, "render")
    try_set(r, "motion_blur_position", ["CENTER"], "render")

    scene.frame_start = 1
    scene.frame_end = cfg.frames

    # AgX holds onto the enormous dynamic range of a sun path on water; Standard
    # would just clip the whole glitter road to flat white.
    vs = scene.view_settings
    try_set(vs, "view_transform", ["AgX", "Filmic", "Standard"], "view_settings")
    try_set(vs, "look", ["AgX - Punchy", "Punchy", "None"], "view_settings")
    # Measured: the sky sits around 2.0 radiance and the sea mirrors it almost exactly,
    # so at exposure 0 the whole frame clips to white. Expose for the sky, as you would
    # with a real camera, and the sea drops into range.
    set_attr(vs, "exposure", -1.6, "view_settings")

    note("engine=%s %dx%d samples=%d frames=%d fps=%d mblur=%s"
         % (engine, cfg.width, cfg.height, cfg.samples, cfg.frames, cfg.fps, cfg.motion_blur))
    return engine


# --------------------------------------------------------------------------------------
# Sky and sun
#
# The sun sits just above the horizon, almost directly in front of the camera. That
# single choice produces the two cues that read instantly as open sea: a glitter path
# of specular highlights running toward the lens, and wave crests that glow where
# low light transmits through the thin water at their tips.
# --------------------------------------------------------------------------------------

SUN_ELEVATION = math.radians(1.5)    # sitting on the horizon
SUN_AZIMUTH = math.radians(94.0)     # ~ +Y, in front of a camera facing +Y


def setup_world(scene):
    world = bpy.data.worlds.new("Sky")
    scene.world = world
    world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()

    out = new_node(tree, "ShaderNodeOutputWorld", (420, 0))
    bg = new_node(tree, "ShaderNodeBackground", (220, 0))
    sky = new_node(tree, "ShaderNodeTexSky", (-120, 0), "Golden hour")

    if sky:
        # 'NISHITA' split into SINGLE_/MULTIPLE_SCATTERING; multiple scattering is
        # what gives a low sun its warm wrap-around glow near the horizon.
        try_set(sky, "sky_type", ["MULTIPLE_SCATTERING", "SINGLE_SCATTERING", "HOSEK_WILKIE"], "sky")
        set_attr(sky, "sun_elevation", SUN_ELEVATION, "sky")
        set_attr(sky, "sun_rotation", SUN_AZIMUTH, "sky")
        set_attr(sky, "sun_disc", True, "sky")
        set_attr(sky, "sun_size", math.radians(1.5), "sky")
        set_attr(sky, "sun_intensity", 1.2, "sky")
        set_attr(sky, "altitude", 5.0, "sky")
        # Clean air with little aerosol keeps the low sun's light warm instead of
        # scattering it into the flat grey haze that heavier settings produce.
        set_attr(sky, "air_density", 1.0, "sky")
        set_attr(sky, "aerosol_density", 0.8, "sky")   # was dust_density before 5.x
        set_attr(sky, "ozone_density", 0.6, "sky")
        set_attr(sky, "ground_albedo", 0.05, "sky")    # dark sea, not bright sand
        link(tree, sky, "Color", bg, "Color")

    set_sock(bg, "Strength", 1.0)
    link(tree, bg, "Background", out, "Surface")
    note("world sky built")


def create_sun():
    data = bpy.data.lights.new("Sun", type="SUN")
    data.energy = 12.0
    data.color = (1.0, 0.55, 0.26)
    # A wide angular size softens the specular response, widening the glitter into a
    # believable road of light instead of a row of hard dots.
    data.angle = math.radians(1.6)

    obj = bpy.data.objects.new("Sun", data)
    bpy.context.collection.objects.link(obj)

    to_sun = Vector((math.cos(SUN_ELEVATION) * math.cos(SUN_AZIMUTH),
                     math.cos(SUN_ELEVATION) * math.sin(SUN_AZIMUTH),
                     math.sin(SUN_ELEVATION)))
    # A sun lamp emits along local -Z, so its +Z must point back at the sun.
    obj.rotation_euler = Vector((0, 0, 1)).rotation_difference(to_sun).to_euler()
    obj.location = to_sun * 300.0
    note("sun aimed at %s" % [round(v, 3) for v in to_sun])
    return obj


# --------------------------------------------------------------------------------------
# Water material
# --------------------------------------------------------------------------------------

HAZE_COLOR = (0.62, 0.55, 0.52, 1.0)


def build_water_material(foam_attr):
    mat = bpy.data.materials.new("Sea Water")
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()

    out = new_node(tree, "ShaderNodeOutputMaterial", (1500, 0))

    # --- surface -------------------------------------------------------------------
    water = new_node(tree, "ShaderNodeBsdfPrincipled", (760, 220), "Water")
    set_sock(water, "Base Color", (0.015, 0.075, 0.095, 1.0))
    set_sock(water, "Roughness", 0.015)
    set_sock(water, "IOR", 1.333)
    set_sock(water, "Metallic", 0.0)
    set_sock(water, "Transmission Weight", 1.0)   # 'Transmission' pre-4.0

    # --- animated micro-ripples ----------------------------------------------------
    # The Ocean modifier resolves swell, not the fine chop riding on it. Two noise
    # layers scrolling at different rates supply that detail far more cheaply than
    # adding ocean geometry would.
    texco = new_node(tree, "ShaderNodeTexCoord", (-1100, -260))
    mapping = new_node(tree, "ShaderNodeMapping", (-900, -260), "Ripple drift")
    link(tree, texco, "Object", mapping, "Vector")

    noise_a = new_node(tree, "ShaderNodeTexNoise", (-680, -120), "Chop")
    set_sock(noise_a, "Scale", 7.0)
    set_sock(noise_a, "Detail", 9.0)
    set_sock(noise_a, "Roughness", 0.55)
    set_sock(noise_a, "Distortion", 0.4)
    link(tree, mapping, "Vector", noise_a, "Vector")

    noise_b = new_node(tree, "ShaderNodeTexNoise", (-680, -420), "Fine ripple")
    set_sock(noise_b, "Scale", 34.0)
    set_sock(noise_b, "Detail", 6.0)
    set_sock(noise_b, "Roughness", 0.65)
    link(tree, mapping, "Vector", noise_b, "Vector")

    ripple = new_node(tree, "ShaderNodeMath", (-430, -270), "Blend ripples")
    if ripple:
        ripple.operation = "ADD"
        ripple.use_clamp = False
        link(tree, noise_a, "Fac", ripple, 0)
        link(tree, noise_b, "Fac", ripple, 1)

    bump = new_node(tree, "ShaderNodeBump", (-180, -270))
    set_sock(bump, "Strength", 0.6)
    set_sock(bump, "Distance", 0.11)
    link(tree, ripple or noise_a, "Value" if ripple else "Fac", bump, "Height")
    link(tree, bump, "Normal", water, "Normal")

    # --- foam ----------------------------------------------------------------------
    # The Ocean modifier writes a per-corner foam value wherever choppiness pinches
    # a wave top past vertical.
    foam = new_node(tree, "ShaderNodeBsdfPrincipled", (760, -320), "Foam")
    set_sock(foam, "Base Color", (0.88, 0.91, 0.93, 1.0))
    set_sock(foam, "Roughness", 0.70)
    set_sock(foam, "Specular IOR Level", 0.25)
    set_sock(foam, "Transmission Weight", 0.0)
    set_sock(foam, "Subsurface Weight", 0.15)

    attr = new_node(tree, "ShaderNodeAttribute", (-1100, 420), "Ocean foam")
    set_attr(attr, "attribute_name", foam_attr, "attribute")

    foam_noise = new_node(tree, "ShaderNodeTexNoise", (-1100, 150), "Foam breakup")
    set_sock(foam_noise, "Scale", 48.0)
    set_sock(foam_noise, "Detail", 10.0)
    set_sock(foam_noise, "Roughness", 0.78)
    link(tree, mapping, "Vector", foam_noise, "Vector")

    # Multiplying by noise turns a smooth airbrushed mask into something that reads
    # as bubbles and streaks.
    foam_mul = new_node(tree, "ShaderNodeMath", (-800, 380), "foam x noise")
    if foam_mul:
        foam_mul.operation = "MULTIPLY"
        link(tree, attr, "Factor", foam_mul, 0)      # 'Fac' was renamed 'Factor'
        link(tree, foam_noise, "Fac", foam_mul, 1)

    foam_edge = new_node(tree, "ShaderNodeMapRange", (-560, 380), "Foam edge")
    if foam_edge:
        set_sock(foam_edge, "From Min", 0.05)
        set_sock(foam_edge, "From Max", 0.40)
        set_sock(foam_edge, "To Min", 0.0)
        set_sock(foam_edge, "To Max", 1.0)
        set_attr(foam_edge, "clamp", True, "maprange")
        link(tree, foam_mul, "Value", foam_edge, "Value")

    surface_mix = new_node(tree, "ShaderNodeMixShader", (1030, 60), "Foam over water")
    link(tree, foam_edge, "Result", surface_mix, 0)
    link(tree, water, "BSDF", surface_mix, 1)
    link(tree, foam, "BSDF", surface_mix, 2)

    # --- distance haze -------------------------------------------------------------
    # Real sea air desaturates toward the horizon. Faking it in the shader off camera
    # distance costs nothing, where a volume-scatter box would cost a lot.
    cam = new_node(tree, "ShaderNodeCameraData", (760, -700))
    haze_range = new_node(tree, "ShaderNodeMapRange", (980, -700), "Haze by distance")
    if haze_range:
        set_sock(haze_range, "From Min", 220.0)
        set_sock(haze_range, "From Max", 3000.0)
        set_sock(haze_range, "To Min", 0.0)
        set_sock(haze_range, "To Max", 0.5)
        set_attr(haze_range, "clamp", True, "maprange")
        link(tree, cam, "View Distance", haze_range, "Value")

    haze = new_node(tree, "ShaderNodeEmission", (1030, -900), "Sea haze")
    set_sock(haze, "Color", HAZE_COLOR)
    set_sock(haze, "Strength", 1.6)

    haze_mix = new_node(tree, "ShaderNodeMixShader", (1280, 0), "Atmosphere")
    link(tree, haze_range, "Result", haze_mix, 0)
    link(tree, surface_mix, "Shader", haze_mix, 1)
    link(tree, haze, "Emission", haze_mix, 2)
    link(tree, haze_mix, "Shader", out, "Surface")

    note("water material built (foam attribute %r)" % foam_attr)
    return mat, mapping


# --------------------------------------------------------------------------------------
# Ocean
# --------------------------------------------------------------------------------------

# A smaller tile repeated more times concentrates the mesh resolution where the camera
# can actually resolve it. At a 140 m tile and resolution 16 the quads are under a
# metre, which is what turns the sun path from a smear into individual glints.
OCEAN_TILE = 140.0
OCEAN_REPEAT = 5


def create_ocean(cfg):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0, 0, 0))
    ocean = bpy.context.object
    ocean.name = "Ocean"
    shade_smooth(ocean)

    mod = ocean.modifiers.new("Ocean", "OCEAN")
    # GENERATE builds its own grid and, crucially, emits the foam attribute.
    try_set(mod, "geometry_mode", ["GENERATE"], "ocean")
    set_attr(mod, "spatial_size", int(OCEAN_TILE), "ocean")
    set_attr(mod, "repeat_x", OCEAN_REPEAT, "ocean")
    set_attr(mod, "repeat_y", OCEAN_REPEAT, "ocean")
    set_attr(mod, "resolution", cfg.ocean_res, "ocean")
    set_attr(mod, "viewport_resolution", min(cfg.ocean_res, 10), "ocean")
    set_attr(mod, "random_seed", 7, "ocean")

    # JONSWAP is the fetch-limited spectrum: steeper, better-defined crests than
    # Phillips, which tends to wobble like a bedsheet.
    try_set(mod, "spectrum", ["JONSWAP", "PIERSON_MOSKOWITZ", "PHILLIPS"], "ocean")
    set_attr(mod, "wind_velocity", 14.0, "ocean")
    set_attr(mod, "wave_scale", 1.25, "ocean")
    set_attr(mod, "wave_scale_min", 0.02, "ocean")
    set_attr(mod, "choppiness", 1.3, "ocean")       # >1 pinches crests, which makes foam
    set_attr(mod, "wave_alignment", 0.6, "ocean")   # waves march roughly one way
    set_attr(mod, "wave_direction", 0.0, "ocean")
    set_attr(mod, "damping", 0.4, "ocean")
    set_attr(mod, "depth", 55.0, "ocean")
    set_attr(mod, "fetch_jonswap", 110.0, "ocean")
    set_attr(mod, "sharpen_peak_jonswap", 0.35, "ocean")
    set_attr(mod, "use_normals", True, "ocean")
    set_attr(mod, "use_foam", True, "ocean")
    set_attr(mod, "foam_coverage", 0.38, "ocean")
    # Naming the layer explicitly matters: left blank the attribute comes out as the
    # generic 'Attribute' and the shader cannot find it reliably.
    set_attr(mod, "foam_layer_name", "foam", "ocean")

    # --- animate the swell ---------------------------------------------------------
    # 'time' is the modifier's simulation clock. Keyframing it linearly from 0 to
    # (frames / fps) evolves the waves in real time with no bake step at all.
    duration = cfg.frames / float(cfg.fps)
    mod.time = 0.001
    ocean.keyframe_insert(data_path='modifiers["Ocean"].time', frame=1)
    mod.time = duration
    ocean.keyframe_insert(data_path='modifiers["Ocean"].time', frame=cfg.frames)
    set_interp(ocean, "time", "LINEAR")

    mat, mapping = build_water_material("foam")
    ocean.data.materials.append(mat)

    # Drift the shader ripples too, so the fine detail moves with the swell.
    if mapping:
        loc = sock(mapping, "Location")
        if loc:
            path = 'nodes["%s"].inputs[1].default_value' % mapping.name
            for frame, val in ((1, 0.0), (cfg.frames, 1.2)):
                loc.default_value[1] = val
                mat.node_tree.keyframe_insert(data_path=path, index=1, frame=frame)
            set_interp(mat.node_tree, "default_value", "LINEAR")

    note("ocean: res=%d tile=%dm repeat=%dx%d, time 0..%.2fs"
         % (cfg.ocean_res, OCEAN_TILE, OCEAN_REPEAT, OCEAN_REPEAT, duration))
    return ocean, mat


def create_horizon(water_mat):
    """A flat sheet filling the sliver between the ocean tile's edge and the horizon.

    The displaced ocean only reaches ~640 m. From a 1.15 m camera that edge lands
    about a tenth of a degree below the true horizon line -- a few pixels, but a few
    pixels of missing sea. This plane covers them; at that distance waves are far
    below a pixel anyway, so a flat glossy sheet is the correct answer.
    """
    bpy.ops.mesh.primitive_plane_add(size=40000, location=(0, 0, -0.35))
    far = bpy.context.object
    far.name = "Horizon Sea"
    far.data.materials.append(water_mat)
    return far


def create_deep():
    """A very dark plane far below the surface.

    Water looks deep because refracted rays find nothing to come back from. A dark
    seabed gives that read for a fraction of what a volume shader on an open surface
    would cost -- and open surfaces make volumes leak anyway.
    """
    bpy.ops.mesh.primitive_plane_add(size=6000, location=(0, 0, -45))
    deep = bpy.context.object
    deep.name = "Deep"
    mat = bpy.data.materials.new("Deep")
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    out = new_node(tree, "ShaderNodeOutputMaterial", (300, 0))
    bsdf = new_node(tree, "ShaderNodeBsdfPrincipled", (0, 0))
    set_sock(bsdf, "Base Color", (0.004, 0.018, 0.024, 1.0))
    set_sock(bsdf, "Roughness", 1.0)
    set_sock(bsdf, "Specular IOR Level", 0.0)
    link(tree, bsdf, "BSDF", out, "Surface")
    deep.data.materials.append(mat)
    set_attr(deep, "visible_camera", False, "deep")   # only ever seen through water
    return deep


# --------------------------------------------------------------------------------------
# Scale references
#
# Water with nothing in it reads as shiny plastic. A rock the eye can size and an
# object riding the swell are what tell you these are three-metre waves.
# --------------------------------------------------------------------------------------

def build_rock_material():
    mat = bpy.data.materials.new("Wet Rock")
    mat.use_nodes = True
    tree = mat.node_tree
    tree.nodes.clear()
    out = new_node(tree, "ShaderNodeOutputMaterial", (700, 0))
    bsdf = new_node(tree, "ShaderNodeBsdfPrincipled", (450, 0))

    geo = new_node(tree, "ShaderNodeNewGeometry", (-900, -220))
    sep = new_node(tree, "ShaderNodeSeparateXYZ", (-700, -220))
    link(tree, geo, "Position", sep, "Vector")

    # Everything near and below the waterline stays wet: darker and far glossier.
    wet = new_node(tree, "ShaderNodeMapRange", (-500, -220), "Waterline")
    if wet:
        set_sock(wet, "From Min", -0.5)
        set_sock(wet, "From Max", 3.5)
        set_sock(wet, "To Min", 0.0)
        set_sock(wet, "To Max", 1.0)
        set_attr(wet, "clamp", True, "maprange")
        link(tree, sep, "Z", wet, "Value")

    noise = new_node(tree, "ShaderNodeTexNoise", (-900, 260), "Rock grain")
    set_sock(noise, "Scale", 4.5)
    set_sock(noise, "Detail", 12.0)
    set_sock(noise, "Roughness", 0.62)

    ramp = new_node(tree, "ShaderNodeValToRGB", (-660, 260))
    if ramp:
        ramp.color_ramp.elements[0].position = 0.35
        ramp.color_ramp.elements[0].color = (0.012, 0.011, 0.010, 1.0)
        ramp.color_ramp.elements[1].position = 0.70
        ramp.color_ramp.elements[1].color = (0.075, 0.068, 0.060, 1.0)
        link(tree, noise, "Fac", ramp, "Fac")

    darken = new_node(tree, "ShaderNodeMix", (-260, 100), "Wet darkening")
    if darken:
        set_attr(darken, "data_type", "RGBA", "mix")
        set_attr(darken, "blend_type", "MULTIPLY", "mix")
        link(tree, wet, "Result", darken, "Factor")
        link(tree, ramp, "Color", darken, "A")
        set_sock(darken, "B", (1.6, 1.55, 1.5, 1.0))   # above water: lift back up
        link(tree, darken, "Result", bsdf, "Base Color")

    rough = new_node(tree, "ShaderNodeMapRange", (-260, -420), "Wet gloss")
    if rough:
        set_sock(rough, "From Min", 0.0)
        set_sock(rough, "From Max", 1.0)
        set_sock(rough, "To Min", 0.14)   # submerged, glossy
        set_sock(rough, "To Max", 0.82)   # dry above, matte
        link(tree, wet, "Result", rough, "Value")
        link(tree, rough, "Result", bsdf, "Roughness")

    bump = new_node(tree, "ShaderNodeBump", (180, -180))
    set_sock(bump, "Strength", 0.5)
    link(tree, noise, "Fac", bump, "Height")
    link(tree, bump, "Normal", bsdf, "Normal")

    link(tree, bsdf, "BSDF", out, "Surface")
    return mat


def create_sea_stacks(mat):
    """Displaced icospheres, squashed into weathered stacks."""
    specs = [
        # x, y, z, radius, vertical stretch, noise scale
        (-78.0, 168.0, -7.0, 15.0, 2.40, 0.55),
        (-52.0, 205.0, -9.0, 10.0, 3.00, 0.42),
        (96.0, 232.0, -10.0, 19.0, 2.15, 0.70),
        (62.0, 300.0, -12.0, 12.0, 2.70, 0.50),
    ]
    stacks = []
    for i, (x, y, z, s, stretch, nsize) in enumerate(specs):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=1.0, location=(x, y, z))
        rock = bpy.context.object
        rock.name = "SeaStack_%d" % (i + 1)
        rock.scale = (s, s * 0.82, s * stretch)
        rock.rotation_euler = (0, 0, i * 1.31)

        tex = bpy.data.textures.new("RockNoise_%d" % i, type="CLOUDS")
        set_attr(tex, "noise_scale", nsize, "texture")
        set_attr(tex, "noise_depth", 6, "texture")
        try_set(tex, "noise_basis", ["VORONOI_F2_F1", "IMPROVED_PERLIN"], "texture")

        disp = rock.modifiers.new("Displace", "DISPLACE")
        disp.texture = tex
        disp.strength = 0.6
        disp.mid_level = 0.42

        tex2 = bpy.data.textures.new("RockNoise_%db" % i, type="DISTORTED_NOISE")
        set_attr(tex2, "noise_scale", nsize * 0.3, "texture")
        disp2 = rock.modifiers.new("Displace2", "DISPLACE")
        disp2.texture = tex2
        disp2.strength = 0.16
        disp2.mid_level = 0.5

        sub = rock.modifiers.new("Subdiv", "SUBSURF")
        sub.levels = 1
        sub.render_levels = 2

        shade_smooth(rock)
        rock.data.materials.append(mat)
        stacks.append(rock)
    note("%d sea stacks built" % len(stacks))
    return stacks


def create_buoy(cfg):
    parts = []

    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.62, depth=1.5, location=(0, 0, 0.1))
    parts.append(bpy.context.object)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, radius=0.62, location=(0, 0, 0.85))
    cap = bpy.context.object
    cap.scale = (1, 1, 0.55)
    parts.append(cap)
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.055, depth=1.7, location=(0, 0, 1.8))
    mast = bpy.context.object
    parts.append(mast)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.68, minor_radius=0.065, location=(0, 0, 0.5))
    ring = bpy.context.object
    parts.append(ring)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=0.12, location=(0, 0, 2.7))
    lamp = bpy.context.object
    parts.append(lamp)

    paint = bpy.data.materials.new("Buoy Paint")
    paint.use_nodes = True
    pb = paint.node_tree.nodes.get("Principled BSDF")
    set_sock(pb, "Base Color", (0.62, 0.16, 0.03, 1.0))
    set_sock(pb, "Roughness", 0.38)
    set_sock(pb, "Coat Weight", 0.35)

    metal = bpy.data.materials.new("Buoy Metal")
    metal.use_nodes = True
    mb = metal.node_tree.nodes.get("Principled BSDF")
    set_sock(mb, "Base Color", (0.22, 0.22, 0.23, 1.0))
    set_sock(mb, "Metallic", 1.0)
    set_sock(mb, "Roughness", 0.42)

    glass = bpy.data.materials.new("Buoy Lamp")
    glass.use_nodes = True
    gb = glass.node_tree.nodes.get("Principled BSDF")
    set_sock(gb, "Emission Color", (1.0, 0.82, 0.42, 1.0))
    set_sock(gb, "Emission Strength", 25.0)

    for o in (parts[0], cap, ring):
        o.data.materials.append(paint)
    mast.data.materials.append(metal)
    lamp.data.materials.append(glass)
    for o in parts:
        shade_smooth(o)

    root = bpy.data.objects.new("Buoy", None)
    bpy.context.collection.objects.link(root)
    root.location = (-9.0, 34.0, 0.0)   # left of centre, clear of the sun path
    for o in parts:
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()

    # Baked as keyframes rather than a driver expression: Python-expression drivers
    # depend on the trusted-source setting and fail silently in background renders.
    heave, roll_x, roll_y = [], [], []
    for f in range(1, cfg.frames + 1, 2):
        t = f / float(cfg.fps)
        # Two periods beating against each other, so it never looks like a metronome.
        heave.append((f, 0.80 * math.sin(t * 1.30) + 0.30 * math.sin(t * 2.70 + 1.1) - 0.35))
        roll_x.append((f, math.radians(10.0 * math.sin(t * 1.30 + 0.5) + 3.5 * math.sin(t * 3.10))))
        roll_y.append((f, math.radians(7.0 * math.sin(t * 1.10 + 2.0) + 2.5 * math.sin(t * 2.30 + 0.7))))

    keyframe(root, "location", heave, index=2)
    keyframe(root, "rotation_euler", roll_x, index=0)
    keyframe(root, "rotation_euler", roll_y, index=1)
    note("buoy built and animated")
    return root


# --------------------------------------------------------------------------------------
# Camera
# --------------------------------------------------------------------------------------

def create_camera(scene, cfg, focus_target):
    data = bpy.data.cameras.new("Camera")
    data.lens = 55.0
    data.sensor_width = 36.0
    data.clip_start = 0.05
    data.clip_end = 60000.0
    data.dof.use_dof = True
    data.dof.focus_object = focus_target
    data.dof.aperture_fstop = 5.6

    cam = bpy.data.objects.new("Camera", data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    # Low, but above the crests. Sitting at 1 m among 1.5 m waves puts every visible
    # surface at a grazing angle, so the sea becomes a mirror of the sky and renders
    # as a white snowfield. Seven metres keeps the intimacy and restores the dark
    # troughs that make it read as water.
    base_z = 7.0
    pitch = 84.6                       # horizon lands in the upper third
    cam.rotation_euler = (math.radians(pitch), 0.0, 0.0)

    keyframe(cam, "location", [(1, 0.0), (cfg.frames, -0.8)], index=0)
    keyframe(cam, "location", [(1, -6.0), (cfg.frames, 1.5)], index=1)

    # A slow rise and fall, as if the camera itself were riding the swell.
    heave = []
    for f in range(1, cfg.frames + 1, 3):
        t = f / float(cfg.fps)
        heave.append((f, base_z + 0.30 * math.sin(t * 1.15) + 0.10 * math.sin(t * 2.7 + 0.4)))
    keyframe(cam, "location", heave, index=2)

    tilt = []
    for f in range(1, cfg.frames + 1, 6):
        t = f / float(cfg.fps)
        tilt.append((f, math.radians(pitch + 0.45 * math.sin(t * 0.85 + 1.2))))
    keyframe(cam, "rotation_euler", tilt, index=0)

    note("camera: %.0fmm at z~%.2f, f/%.1f, focus on %s"
         % (data.lens, base_z, data.dof.aperture_fstop, focus_target.name))
    return cam


# --------------------------------------------------------------------------------------
# Compositing
#
# Blender 5.x replaced Scene.node_tree with a compositing node GROUP: the render
# comes in through Group Input and must leave through Group Output. There is no
# Composite node any more.
# --------------------------------------------------------------------------------------

def setup_compositor(scene):
    try:
        ng = bpy.data.node_groups.new("Ocean Comp", "CompositorNodeTree")
    except Exception as exc:
        warn("compositor node group unavailable (%s)" % exc)
        return None

    ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    go = new_node(ng, "NodeGroupOutput", (700, 0))
    # The render must enter through a Render Layers node. Feeding the group's own
    # Image input instead compiles fine and silently renders pure black.
    gi = new_node(ng, "CompositorNodeRLayers", (-500, 0))

    glare = new_node(ng, "CompositorNodeGlare", (-150, 0), "Sun bloom")
    if glare:
        # In 5.x every Glare setting is an input socket, and the type/quality ones
        # are menu sockets taking their display string.
        set_menu(glare, "Type", ["Fog Glow", "Bloom", "Streaks"])
        set_menu(glare, "Quality", ["High", "Medium"])
        set_sock(glare, "Threshold", 0.75)
        set_sock(glare, "Smoothness", 0.25)
        set_sock(glare, "Strength", 0.42)
        set_sock(glare, "Size", 0.72)
        set_sock(glare, "Saturation", 1.1)
        link(ng, gi, "Image", glare, "Image")

    lens = new_node(ng, "CompositorNodeLensdist", (250, 0), "Slight CA")
    if lens:
        set_sock(lens, "Distortion", 0.004)
        set_sock(lens, "Dispersion", 0.005)
        set_sock(lens, "Fit", True)
        link(ng, glare or gi, "Image", lens, "Image")

    link(ng, lens or glare or gi, "Image", go, "Image")
    scene.compositing_node_group = ng
    note("compositor built (glare + chromatic aberration)")
    return ng


# --------------------------------------------------------------------------------------
# Output
# --------------------------------------------------------------------------------------

def render_still(scene, path, frame):
    scene.frame_set(frame)
    ims = scene.render.image_settings
    try_set(ims, "media_type", ["IMAGE"], "image_settings")
    ims.file_format = "PNG"
    set_attr(ims, "color_mode", "RGB", "image_settings")
    set_attr(ims, "compression", 15, "image_settings")
    scene.render.filepath = path
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    note("frame %d -> %s (%.1fs)" % (frame, os.path.basename(path), time.time() - t0))


def render_animation(scene, out_dir, cfg):
    r = scene.render
    ims = r.image_settings
    # 'FFMPEG' only becomes a valid file_format once media_type is VIDEO (new in 5.x).
    try_set(ims, "media_type", ["VIDEO"], "image_settings")
    ims.file_format = "FFMPEG"
    try_set(r.ffmpeg, "format", ["MPEG4"], "ffmpeg")
    try_set(r.ffmpeg, "codec", ["H264"], "ffmpeg")
    try_set(r.ffmpeg, "constant_rate_factor", ["HIGH", "PERC_LOSSLESS"], "ffmpeg")
    try_set(r.ffmpeg, "ffmpeg_preset", ["GOOD", "BEST"], "ffmpeg")
    set_attr(r.ffmpeg, "gopsize", 12, "ffmpeg")
    try_set(r.ffmpeg, "audio_codec", ["NONE"], "ffmpeg")
    r.filepath = os.path.join(out_dir, "renders", "ocean_water_")
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    note("animation done in %.1f min" % ((time.time() - t0) / 60.0))


# --------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------

def parse_args():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--stage", default="all", choices=["build", "still", "anim", "all"])
    p.add_argument("--quality", default="preview", choices=["preview", "final"])
    p.add_argument("--engine", default="cycles", choices=["cycles", "eevee"])
    p.add_argument("--frames", type=int, default=None)
    p.add_argument("--samples", type=int, default=None)
    p.add_argument("--ocean-res", type=int, default=None, dest="ocean_res")
    p.add_argument("--hero-frame", type=int, default=None, dest="hero_frame")
    p.add_argument("--tag", default=None)
    p.add_argument("--out", default=r"C:\Users\mridu\Desktop\blender-water-scene")
    p.add_argument("--motion-blur", dest="motion_blur", action="store_true", default=None)
    p.add_argument("--no-motion-blur", dest="motion_blur", action="store_false")
    cfg = p.parse_args(argv)

    if cfg.quality == "preview":
        cfg.width, cfg.height = 960, 540
        cfg.samples = cfg.samples or 32
        cfg.ocean_res = cfg.ocean_res or 12
        cfg.motion_blur = False if cfg.motion_blur is None else cfg.motion_blur
    else:
        cfg.width, cfg.height = 1920, 1080
        cfg.samples = cfg.samples or 128
        cfg.ocean_res = cfg.ocean_res or 16
        cfg.motion_blur = True if cfg.motion_blur is None else cfg.motion_blur

    cfg.fps = 24
    cfg.frames = cfg.frames or 120
    cfg.hero_frame = cfg.hero_frame or 72
    cfg.tag = cfg.tag or cfg.quality
    return cfg


def main():
    cfg = parse_args()
    t0 = time.time()

    clear_scene()
    scene = bpy.context.scene
    setup_render(scene, cfg)
    setup_world(scene)
    create_sun()

    create_deep()
    ocean, water_mat = create_ocean(cfg)
    create_horizon(water_mat)
    create_sea_stacks(build_rock_material())
    buoy = create_buoy(cfg)
    create_camera(scene, cfg, buoy)
    setup_compositor(scene)

    # Prove the surface actually deforms, and that foam actually lands on it.
    deps = bpy.context.evaluated_depsgraph_get()
    stats = []
    for f in (1, max(2, cfg.frames // 2)):
        scene.frame_set(f)
        deps.update()
        ev = ocean.evaluated_get(deps)
        mesh = ev.to_mesh()
        zs = [v.co.z for v in mesh.vertices]
        foam_max, foam_hits = 0.0, 0
        for a in mesh.color_attributes:
            if a.name == "foam":
                vals = [a.data[i].color[0] for i in range(len(a.data))]
                foam_max = max(vals) if vals else 0.0
                foam_hits = sum(1 for v in vals if v > 0.01)
        stats.append((f, len(zs), min(zs), max(zs), foam_max, foam_hits))
        ev.to_mesh_clear()
    for f, n, lo, hi, fm, fh in stats:
        note("frame %3d: %d verts, waves %.2f..%.2f m, foam max %.2f on %d corners"
             % (f, n, lo, hi, fm, fh))
    if len(stats) == 2 and abs(stats[0][3] - stats[1][3]) < 1e-4:
        warn("ocean identical between frames -- the animation is NOT working")
    if stats and stats[-1][5] == 0:
        warn("no foam generated -- raise choppiness or lower foam_coverage")

    out_dir = cfg.out
    os.makedirs(os.path.join(out_dir, "renders"), exist_ok=True)
    scene.frame_set(cfg.hero_frame)
    blend_path = os.path.join(out_dir, "ocean_scene.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    note("saved %s" % os.path.basename(blend_path))

    if cfg.stage in ("still", "all"):
        render_still(scene, os.path.join(out_dir, "renders", "hero_%s.png" % cfg.tag),
                     cfg.hero_frame)
    if cfg.stage == "anim":
        render_animation(scene, out_dir, cfg)

    note("total %.1fs" % (time.time() - t0))
    print("\n===== WARNINGS =====")
    warns = [r for r in REPORT if r.startswith("WARN")]
    print("  none" if not warns else "\n".join("  " + w for w in warns))
    print("===== END =====")


if __name__ == "__main__":
    main()
