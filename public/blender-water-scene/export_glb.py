import bpy, os

blend_dir = os.path.dirname(bpy.data.filepath)
out = os.path.join(blend_dir, "ocean_scene.glb")

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_apply=True,          # apply modifiers
    export_yup=True,            # three.js is Y-up
    export_cameras=False,
    export_lights=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
print("EXPORTED_OK", out, os.path.getsize(out))
