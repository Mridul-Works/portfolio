"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  sandVertexShader,
  sandFragmentShader,
  skyVertexShader,
  skyFragmentShader,
  blobVertexShader,
  blobFragmentShader,
} from "./desertShaders";
import { BLOB_NDC as BLOB_NDC_CONST } from "./sceneConfig";

const MODEL_URL = "/blender-water-scene/ocean_scene.glb";
const DRACO_PATH = "/draco/"; // local decoder, no CDN dependency

useGLTF.preload(MODEL_URL, DRACO_PATH);

// --- Desert palette: serious / horror. A dying blood-red moon low in a
// bruised, near-black sky; ash-grey dunes; the neon blob is the one surviving
// color, an unnatural glow against a dead world. ------------------------------
const SUN_DIR = new THREE.Vector3(-0.55, 0.3, -0.6).normalize();
const SUN_COLOR = new THREE.Color("#8a2b30"); // dim blood-red moon
const SKY_TOP = new THREE.Color("#07060b");
const SKY_HORIZON = new THREE.Color("#2c1418");
const FOG_COLOR = new THREE.Color("#1c1418");
const SAND_LIT = new THREE.Color("#5e5148");
const SAND_SHADOW = new THREE.Color("#0e0a08");
const ROCK_COLOR = new THREE.Color("#332b26");
const FOG_DENSITY = 0.045;

const BLOB_COLOR = new THREE.Color("#b026ff"); // neon purple — the anomaly

// Fixed camera vantage — no rotate, no user movement.
const CAM_POS = new THREE.Vector3(3.2, 1.35, 6.6);
const CAM_TARGET = new THREE.Vector3(0, 0.45, 0);
// Where on screen (NDC) the blob should rest — near foreground, left of center.
// Sourced from sceneConfig so the intro's portal-collapse converges on the
// exact same screen point without pulling three.js into that DOM-only bundle.
const BLOB_NDC = new THREE.Vector2(BLOB_NDC_CONST.x, BLOB_NDC_CONST.y);

const WATER_MATERIALS = new Set(["Deep", "Sea Water"]);
const HIDE_NODES = new Set(["Buoy"]);

interface BlobPlacement {
  center: [number, number, number];
  radius: number;
}

function SkyDome() {
  const uniforms = useMemo(
    () => ({
      uSkyTop: { value: SKY_TOP },
      uSkyHorizon: { value: SKY_HORIZON },
      uSunDir: { value: SUN_DIR },
      uSunColor: { value: SUN_COLOR },
    }),
    []
  );
  return (
    <mesh scale={300} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

function DesertModel({
  onReady,
  onBlobPlaced,
}: {
  onReady: () => void;
  onBlobPlaced: (p: BlobPlacement) => void;
}) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const { camera } = useThree();
  const sandMeshes = useRef<THREE.Mesh[]>([]);

  const sandMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: sandVertexShader,
        fragmentShader: sandFragmentShader,
        uniforms: {
          uCam: { value: new THREE.Vector3() },
          uSunDir: { value: SUN_DIR },
          uSunColor: { value: SUN_COLOR },
          uSandLit: { value: SAND_LIT },
          uSandShadow: { value: SAND_SHADOW },
          uFogColor: { value: FOG_COLOR },
          uFogDensity: { value: FOG_DENSITY },
          uRippleScale: { value: 6.0 },
          uBlobPos: { value: new THREE.Vector3(0, 0, 0) },
          uBlobColor: { value: BLOB_COLOR },
          uBlobRadius: { value: 1 },
          uGroundY: { value: 0 },
        },
      }),
    []
  );

  const rockMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: ROCK_COLOR,
        roughness: 1,
        metalness: 0,
      }),
    []
  );

  // Repaint the scene: water -> sand (collected for raycasting), rest -> rock.
  // Idempotent: recognizes already-converted sand so a re-run still collects it.
  useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if (HIDE_NODES.has(o.name)) {
        o.visible = false;
        return;
      }
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.Material & { name?: string };
      const isSand = mat === sandMaterial || WATER_MATERIALS.has(mat?.name ?? "");
      if (isSand) {
        mesh.material = sandMaterial;
        meshes.push(mesh);
      } else if (mat !== rockMaterial) {
        mesh.material = rockMaterial;
      }
    });
    sandMeshes.current = meshes;
  }, [scene, sandMaterial, rockMaterial]);

  // Drop the blob onto the *actual* sand: raycast from the camera and use the
  // real world hit point, so the glow + shadow land on the sand it's resting on.
  useEffect(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);
    camera.updateMatrixWorld(true);
    scene.updateMatrixWorld(true); // model matrices aren't set until first render

    const rc = new THREE.Raycaster();
    rc.setFromCamera(BLOB_NDC, camera);
    const hits = rc.intersectObjects(sandMeshes.current, false);

    const hit = hits[0]?.point.clone() ?? CAM_TARGET.clone();
    const radius = camera.position.distanceTo(hit) * 0.1;
    const center = hit.clone();
    center.y += radius * 0.35; // nestle into the surface

    sandMaterial.uniforms.uBlobPos.value.copy(center);
    sandMaterial.uniforms.uGroundY.value = hit.y;
    sandMaterial.uniforms.uBlobRadius.value = radius;

    onBlobPlaced({ center: [center.x, center.y, center.z], radius });
    onReady();
  }, [camera, sandMaterial, onReady, onBlobPlaced]);

  // Keep the sand's camera uniform current (for the distance haze).
  useFrame(() => {
    sandMaterial.uniforms.uCam.value.copy(camera.position);
  });

  return <primitive object={scene} />;
}

// A glowing, neon-purple, noise-morphed blob resting on the sand. The sand shader
// handles its glow + shadow on the ground; a halo sprite fakes the bloom and a
// real point light tints the nearby rocks.
function NeonBlob({ center, radius }: BlobPlacement) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: BLOB_COLOR },
      uCamPos: { value: new THREE.Vector3() },
    }),
    []
  );

  const haloTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    // Wide, gradual stops (no hard mid-ring) so the halo reads as a soft,
    // slightly out-of-focus haze rather than a crisp glow ring.
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(210,140,255,0.55)");
    grad.addColorStop(0.22, "rgba(180,90,255,0.4)");
    grad.addColorStop(0.5, "rgba(150,50,255,0.2)");
    grad.addColorStop(1, "rgba(120,20,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame((state) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uCamPos.value.copy(camera.position);
  });

  return (
    <group position={center} scale={radius}>
      {/* Unit icosphere; the group scale sets the real size. */}
      <mesh frustumCulled={false}>
        <icosahedronGeometry args={[1, 24]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={blobVertexShader}
          fragmentShader={blobFragmentShader}
          uniforms={uniforms}
          fog={false}
        />
      </mesh>

      {/* Bloom halo — a soft, blurred haze around the core. */}
      <sprite scale={6.2}>
        <spriteMaterial
          map={haloTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.75}
        />
      </sprite>

      {/* Real purple light so the sandstone rocks pick up the glow too. */}
      <pointLight color={BLOB_COLOR} intensity={12} distance={12} decay={2} />
    </group>
  );
}

// Runtime safety net: keep the camera locked every frame (no user movement).
function LockedCamera() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.copy(CAM_POS);
    camera.lookAt(CAM_TARGET);
  });
  return null;
}

// "Scene 1" — the desert. Fixed viewpoint, sand shader, warm sky + haze, blob.
export default function DesertCanvas() {
  const [ready, setReady] = useState(false);
  const [blob, setBlob] = useState<BlobPlacement | null>(null);

  return (
    <div
      className="fixed inset-0 z-0 bg-black transition-opacity duration-1000 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        camera={{ fov: 50, position: CAM_POS.toArray(), near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <fogExp2 attach="fog" args={[FOG_COLOR.getHex(), FOG_DENSITY]} />

        <hemisphereLight args={[SKY_HORIZON.getHex(), "#050403", 0.35]} />
        <directionalLight
          position={SUN_DIR.clone().multiplyScalar(30).toArray()}
          intensity={0.9}
          color={SUN_COLOR.getHex()}
        />

        <SkyDome />

        <Suspense fallback={null}>
          <DesertModel onReady={() => setReady(true)} onBlobPlaced={setBlob} />
        </Suspense>

        {blob && <NeonBlob center={blob.center} radius={blob.radius} />}

        <LockedCamera />
      </Canvas>

      {/* Atmospheric vignette — presses the dark in from the edges. */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
    </div>
  );
}
