"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 12000;

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aShapeB;
  attribute vec3 aShapeC;
  attribute float aRandom;

  uniform float uTime;
  uniform float uMorph;
  uniform vec3 uMouse;
  uniform float uPixelRatio;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // position holds shape A; blend A -> B -> C -> A as uMorph runs 0..3
    float seg = mod(uMorph, 3.0);
    vec3 p;
    if (seg < 1.0) {
      p = mix(position, aShapeB, smoothstep(0.0, 1.0, seg));
    } else if (seg < 2.0) {
      p = mix(aShapeB, aShapeC, smoothstep(0.0, 1.0, seg - 1.0));
    } else {
      p = mix(aShapeC, position, smoothstep(0.0, 1.0, seg - 2.0));
    }

    // organic drift so the cloud never sits still
    float t = uTime;
    p.x += sin(t * 0.8 + aRandom * 6.2831 + p.y * 1.6) * 0.055;
    p.y += cos(t * 0.7 + aRandom * 12.566 + p.z * 1.6) * 0.055;
    p.z += sin(t * 0.9 + aRandom * 9.424 + p.x * 1.6) * 0.055;

    // shove particles away from the cursor
    vec3 away = p - uMouse;
    float dist = length(away);
    float force = exp(-dist * dist * 2.6) * 0.9;
    p += (away / max(dist, 0.0001)) * force;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.3 + aRandom * 2.4) * uPixelRatio * (5.5 / -mv.z);

    vec3 col = mix(uColorA, uColorB, clamp((p.y + 2.6) / 5.2, 0.0, 1.0));
    // particles being pushed flare up in the accent color
    vColor = mix(col, uColorC, clamp(force * 1.1, 0.0, 0.85));
    vAlpha = 0.65 + 0.35 * sin(t * 2.0 + aRandom * 40.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * a * (0.35 + 0.65 * vAlpha) * 0.85);
  }
`;

function sphereShape(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    arr[i * 3] = Math.cos(theta) * r * 2.2 + (Math.random() - 0.5) * 0.06;
    arr[i * 3 + 1] = y * 2.2 + (Math.random() - 0.5) * 0.06;
    arr[i * 3 + 2] = Math.sin(theta) * r * 2.2 + (Math.random() - 0.5) * 0.06;
  }
  return arr;
}

function torusKnotShape(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  const p = 2;
  const q = 5;
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const r = 2 + Math.cos(q * t);
    // random offset fattens the curve into a glowing tube
    const tube = 0.16;
    arr[i * 3] = r * Math.cos(p * t) * 0.72 + (Math.random() - 0.5) * tube;
    arr[i * 3 + 1] = Math.sin(q * t) * 0.72 + (Math.random() - 0.5) * tube;
    arr[i * 3 + 2] = r * Math.sin(p * t) * 0.72 + (Math.random() - 0.5) * tube;
  }
  return arr;
}

function galaxyShape(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  const arms = 3;
  for (let i = 0; i < count; i++) {
    const radius = Math.pow(Math.random(), 0.65) * 2.8;
    const armAngle = ((i % arms) / arms) * Math.PI * 2;
    const spin = radius * 1.9;
    const spread = (1 - radius / 2.8) * 0.45 + 0.06;
    const angle = armAngle + spin;
    arr[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread * 2;
    arr[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.6;
    arr[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread * 2;
  }
  return arr;
}

export default function HeroCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    const geometry = new THREE.BufferGeometry();
    const randoms = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) randoms[i] = Math.random();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(sphereShape(PARTICLE_COUNT), 3)
    );
    geometry.setAttribute(
      "aShapeB",
      new THREE.BufferAttribute(torusKnotShape(PARTICLE_COUNT), 3)
    );
    geometry.setAttribute(
      "aShapeC",
      new THREE.BufferAttribute(galaxyShape(PARTICLE_COUNT), 3)
    );
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uMouse: { value: new THREE.Vector3(99, 99, 99) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColorA: { value: new THREE.Color("#52525b") },
        uColorB: { value: new THREE.Color("#e4e4e7") },
        uColorC: { value: new THREE.Color("#d9ff3d") },
      },
    });

    const points = new THREE.Points(geometry, material);
    points.scale.setScalar(0.92);
    scene.add(points);

    const mouseNdc = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector3(99, 99, 99);
    let hasMouse = false;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      hasMouse = true;
      // project the cursor onto the z = 0 plane the particles live around
      const v = new THREE.Vector3(mouseNdc.x, mouseNdc.y, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      mouseTarget
        .copy(camera.position)
        .addScaledVector(dir, -camera.position.z / dir.z);
    };
    const onPointerLeave = () => {
      hasMouse = false;
      mouseTarget.set(99, 99, 99);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    const startTime = performance.now();
    let raf = 0;
    const HOLD = 5; // seconds a shape holds before morphing
    const TRANSITION = 1.8;
    const CYCLE = HOLD + TRANSITION;

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const time = reducedMotion ? 0 : elapsed;

      const idx = Math.floor(elapsed / CYCLE);
      const local = elapsed % CYCLE;
      const trans = THREE.MathUtils.smoothstep(local, HOLD, CYCLE);
      material.uniforms.uTime.value = time;
      material.uniforms.uMorph.value = reducedMotion ? 0 : idx + trans;

      material.uniforms.uMouse.value.lerp(mouseTarget, hasMouse ? 0.08 : 0.02);

      points.rotation.y = time * 0.06;

      camera.position.x += (mouseNdc.x * 0.55 - camera.position.x) * 0.03;
      camera.position.y += (mouseNdc.y * 0.35 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}
