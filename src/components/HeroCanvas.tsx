"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Typographic particle engine — liquid chrome edition.
 *
 * Each word is rasterized to an offscreen 2D canvas (in its own font — Syne
 * caps or flowing Instrument Serif script), its inked pixels are sampled into
 * target positions, and ~26k silver particles assemble into the glyphs over a
 * cobalt field. Four-point glint stars twinkle on the letterforms like light
 * catching chrome. Words morph with per-particle stagger + swirl, the cloud
 * repels around the cursor, detonates on click, and dissolves upward as the
 * next section's sheet slides over the sticky hero.
 */

type WordDef = {
  text: string;
  varName: string; // CSS custom property holding the font family
  weight: string;
  style: string; // "" or "italic "
  size: number; // rasterization px — bigger for thin-stroke script fonts
};

const WORDS: WordDef[] = [
  { text: "MRIDUL", varName: "--font-syne", weight: "700", style: "", size: 170 },
  {
    text: "creative",
    varName: "--font-instrument",
    weight: "400",
    style: "italic ",
    size: 250,
  },
  { text: "DEVELOPER", varName: "--font-syne", weight: "700", style: "", size: 170 },
];

const INTRO_DURATION = 2.6;
const MORPH_DURATION = 1.7;
const HOLD_DURATION = 4.4;

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aRandom;

  uniform float uTime;
  uniform float uProgress;
  uniform float uScroll;
  uniform float uPixelRatio;
  uniform vec3 uMouse;      // in local text units
  uniform vec3 uShockPos;   // in local text units
  uniform float uShockTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying vec3 vColor;
  varying float vAlpha;

  float ease(float t) {
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    // staggered morph: each particle departs on its own schedule
    float stag = 0.35;
    float p = clamp(uProgress * (1.0 + stag) - aRandom * stag, 0.0, 1.0);
    p = ease(p);
    vec3 pos = mix(aFrom, aTo, p);

    // swirl while traveling — particles arc instead of moving in straight lines
    float travel = clamp(length(aTo - aFrom) * 0.6, 0.0, 1.0);
    float sw = sin(p * 3.14159) * travel;
    float ang = aRandom * 6.2831 + uTime * 0.15;
    pos += vec3(cos(ang), sin(ang * 1.31), sin(ang * 0.83)) * sw * (0.22 + aRandom * 0.4);

    // gentle drift so the letters shimmer instead of freezing
    // (phase depends only on aRandom so morph handoffs stay seamless)
    pos.x += sin(uTime * 0.7 + aRandom * 6.2831) * 0.018;
    pos.y += cos(uTime * 0.8 + aRandom * 12.566) * 0.018;
    pos.z += sin(uTime * 0.6 + aRandom * 9.4248) * 0.018;

    // light sweep travels across the word — a reflection rolling over chrome
    float sweep = mod(uTime * 1.1, 9.0) - 4.5;
    float band = exp(-pow((pos.x - sweep) * 1.7, 2.0));
    pos.z += band * 0.05;

    // cursor repulsion
    vec3 away = pos - uMouse;
    float md = length(away);
    float force = exp(-md * md * 3.2) * 0.5;
    pos += (away / max(md, 0.0001)) * force;

    // click shockwave: an expanding ring displaces particles it passes
    float age = uTime - uShockTime;
    if (age > 0.0 && age < 1.6) {
      vec3 sd = pos - uShockPos;
      float sdist = length(sd);
      float ring = age * 2.8;
      float hit = exp(-pow((sdist - ring) * 2.4, 2.0));
      pos += (sd / max(sdist, 0.0001)) * hit * 0.6 * (1.0 - age / 1.6);
    }

    // scroll dissolve: scatter up and away as the sheet covers the hero
    float sc = uScroll * uScroll;
    vec3 rdir = normalize(
      vec3(sin(aRandom * 78.233), cos(aRandom * 12.9898), sin(aRandom * 39.425)) + pos * 0.25
    );
    pos += rdir * sc * (1.6 + aRandom * 2.8);
    pos.y += sc * 1.4;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = (1.1 + aRandom * 1.9) * (1.0 + force * 1.6 + band * 0.7);
    gl_PointSize = size * uPixelRatio * (5.2 / -mv.z);

    // silver body shading — darker steel low, white-hot high, plus
    // white flares on interaction and a few permanent bright sparkles
    vec3 col = mix(uColorA, uColorB, clamp(pos.y * 0.7 + 0.65, 0.0, 1.0));
    float hot = step(0.95, aRandom) * 0.5 + clamp(force * 1.6, 0.0, 0.9) + band * 0.45;
    vColor = mix(col, uColorC, clamp(hot, 0.0, 0.95));
    vAlpha = (0.55 + 0.45 * sin(uTime * 2.4 + aRandom * 40.0)) * (1.0 - uScroll * 0.95);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor, core * core * (0.3 + 0.7 * vAlpha) * 0.68);
  }
`;

const DUST_VERTEX = /* glsl */ `
  attribute float aRandom;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vA;
  varying vec3 vC;

  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.14 + aRandom * 6.2831) * 0.4;
    p.x += cos(uTime * 0.1 + aRandom * 12.566) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.8 + aRandom * 1.5) * uPixelRatio * (5.2 / -mv.z);
    vA = 0.12 + 0.18 * (0.5 + 0.5 * sin(uTime * 1.5 + aRandom * 40.0));
    vC = mix(vec3(0.78, 0.82, 1.0), vec3(1.0), step(0.94, aRandom));
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  varying float vA;
  varying vec3 vC;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(vC, core * vA);
  }
`;

const GLINT_VERTEX = /* glsl */ `
  attribute float aRandom;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vA;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // each star flashes on its own rhythm, off most of the time
    float tw = pow(max(sin(uTime * (0.5 + aRandom * 0.8) + aRandom * 61.7), 0.0), 3.0);
    gl_PointSize = (14.0 + aRandom * 24.0) * (0.35 + 0.65 * tw) * uPixelRatio * (5.2 / -mv.z);
    vA = tw;
  }
`;

const GLINT_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uFade;
  uniform float uScroll;
  varying float vA;

  void main() {
    vec4 t = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(t.rgb, t.a * vA * uFade * (1.0 - uScroll));
  }
`;

type WordShape = {
  targets: Float32Array;
  width: number; // in text units
  height: number;
};

/** Rasterize a word in its own font and sample inked pixels into targets. */
function sampleWord(
  def: WordDef,
  family: string,
  particleCount: number
): WordShape {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const font = `${def.style}${def.weight} ${def.size}px ${family}`;
  if (!ctx) {
    return { targets: new Float32Array(particleCount * 3), width: 1, height: 1 };
  }

  ctx.font = font;
  const w = Math.ceil(ctx.measureText(def.text).width) + 100;
  const h = Math.ceil(def.size * 1.7);
  canvas.width = w;
  canvas.height = h;
  // resizing the canvas resets context state, so set the font again
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(def.text, w / 2, h / 2);

  const data = ctx.getImageData(0, 0, w, h).data;
  const samples: number[] = [];
  const step = 2;
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) {
        samples.push(x, y);
      }
    }
  }

  const targets = new Float32Array(particleCount * 3);
  const sampleCount = samples.length / 2;
  if (sampleCount === 0) return { targets, width: 1, height: 1 };

  // exact optical bounds so every word is centered identically
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < sampleCount; i++) {
    const x = samples[i * 2];
    const y = samples[i * 2 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  for (let i = 0; i < particleCount; i++) {
    const s = Math.floor(Math.random() * sampleCount);
    targets[i * 3] =
      (samples[s * 2] - cx) / def.size + (Math.random() - 0.5) * 0.016;
    targets[i * 3 + 1] =
      -(samples[s * 2 + 1] - cy) / def.size + (Math.random() - 0.5) * 0.016;
    targets[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
  }

  return {
    targets,
    width: (maxX - minX) / def.size,
    height: (maxY - minY) / def.size,
  };
}

/** Loose cloud the first word assembles from. */
function cloudShape(particleCount: number): Float32Array {
  const arr = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 2.5 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    arr[i * 3 + 2] = r * Math.cos(phi) * 0.6 - 1;
  }
  return arr;
}

/** Four-point star sprite: two soft streaks + a core glow, drawn on canvas. */
function makeGlintTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const tex = new THREE.CanvasTexture(canvas);
  if (!ctx) return tex;

  const c = size / 2;
  const streak = (sx: number, sy: number, r: number) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.scale(sx, sy);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  ctx.globalCompositeOperation = "lighter";
  streak(1, 0.08, c); // horizontal ray
  streak(0.08, 1, c); // vertical ray
  streak(0.3, 0.3, c * 0.45); // core glow
  tex.needsUpdate = true;
  return tex;
}

export default function HeroCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL — the HTML copy still tells the story
    }
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
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

    const small =
      Math.min(window.innerWidth, window.innerHeight) < 700 ||
      (navigator.hardwareConcurrency ?? 8) <= 4;
    const COUNT = small ? 10000 : 26000;

    // --- word particles ---
    const geometry = new THREE.BufferGeometry();
    const fromArr = new Float32Array(COUNT * 3);
    const toArr = new Float32Array(COUNT * 3);
    const randoms = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) randoms[i] = Math.random();
    // `position` is unused by the shader but Three needs it for draw count
    geometry.setAttribute("position", new THREE.BufferAttribute(fromArr, 3));
    geometry.setAttribute("aFrom", new THREE.BufferAttribute(fromArr, 3));
    geometry.setAttribute("aTo", new THREE.BufferAttribute(toArr, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uScroll: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uMouse: { value: new THREE.Vector3(99, 99, 99) },
        uShockPos: { value: new THREE.Vector3(0, 0, 0) },
        uShockTime: { value: -10 },
        uColorA: { value: new THREE.Color("#6a74c4") },
        uColorB: { value: new THREE.Color("#dfe3f2") },
        uColorC: { value: new THREE.Color("#ffffff") },
      },
    });

    const points = new THREE.Points(geometry, material);
    points.position.y = 0.45;
    points.frustumCulled = false;
    scene.add(points);

    // --- glint stars riding on the letterforms ---
    const GLINT_COUNT = small ? 12 : 20;
    const glintTexture = makeGlintTexture();
    const glintGeometry = new THREE.BufferGeometry();
    const glintPos = new Float32Array(GLINT_COUNT * 3);
    const glintRand = new Float32Array(GLINT_COUNT);
    glintGeometry.setAttribute("position", new THREE.BufferAttribute(glintPos, 3));
    glintGeometry.setAttribute("aRandom", new THREE.BufferAttribute(glintRand, 1));
    glintGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    const glintMaterial = new THREE.ShaderMaterial({
      vertexShader: GLINT_VERTEX,
      fragmentShader: GLINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uMap: { value: glintTexture },
        uFade: { value: 0 },
        uScroll: { value: 0 },
      },
    });
    const glints = new THREE.Points(glintGeometry, glintMaterial);
    glints.frustumCulled = false;
    points.add(glints); // inherits the word's position + fitted scale

    const reseedGlints = (targets: Float32Array) => {
      for (let i = 0; i < GLINT_COUNT; i++) {
        const j = Math.floor(Math.random() * COUNT) * 3;
        glintPos[i * 3] = targets[j];
        glintPos[i * 3 + 1] = targets[j + 1];
        glintPos[i * 3 + 2] = targets[j + 2] + 0.08;
        glintRand[i] = Math.random();
      }
      glintGeometry.attributes.position.needsUpdate = true;
      glintGeometry.attributes.aRandom.needsUpdate = true;
    };

    // --- background dust for depth ---
    const dustCount = small ? 600 : 1300;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustRand = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 18;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dustPos[i * 3 + 2] = -2 - Math.random() * 8;
      dustRand[i] = Math.random();
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeometry.setAttribute("aRandom", new THREE.BufferAttribute(dustRand, 1));
    const dustMaterial = new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
      },
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    dust.frustumCulled = false;
    scene.add(dust);

    // --- state ---
    let cancelled = false;
    let raf = 0;
    let shapes: WordShape[] = [];
    let wordIndex = 0;
    let morphStart = 0; // seconds, in elapsed-time space
    let morphDuration = INTRO_DURATION;
    let scaleCurrent = 1;
    let scaleTarget = 1;

    const startTime = performance.now();
    const now = () => (performance.now() - startTime) / 1000;

    /** World-units scale that fits a word into the viewport. */
    const fitScale = (shape: WordShape) => {
      const visH = 2 * Math.tan(THREE.MathUtils.degToRad(25)) * 7;
      const visW = visH * camera.aspect;
      const portrait = camera.aspect < 0.9;
      return Math.min(
        (visW * (portrait ? 0.92 : 0.84)) / shape.width,
        (visH * 0.3) / shape.height
      );
    };

    // --- pointer interaction ---
    const mouseNdc = new THREE.Vector2(0, 0);
    const mouseWorld = new THREE.Vector3(99, 99, 99);
    let hasMouse = false;

    const ndcToZ0Plane = (ndcX: number, ndcY: number, out: THREE.Vector3) => {
      const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      out.copy(camera.position).addScaledVector(dir, -camera.position.z / dir.z);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      hasMouse = true;
      ndcToZ0Plane(mouseNdc.x, mouseNdc.y, mouseWorld);
    };
    const onPointerLeave = () => {
      hasMouse = false;
      mouseWorld.set(99, 99, 99);
    };
    const shockWorld = new THREE.Vector3();
    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ndcToZ0Plane(nx, ny, shockWorld);
      material.uniforms.uShockPos.value
        .copy(shockWorld)
        .sub(points.position)
        .divideScalar(scaleCurrent);
      material.uniforms.uShockTime.value = now();
    };

    if (!reducedMotion) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
      container.addEventListener("pointerdown", onPointerDown);
    }

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      if (shapes.length) scaleTarget = fitScale(shapes[wordIndex]);
      if (reducedMotion && shapes.length) {
        scaleCurrent = scaleTarget;
        points.scale.setScalar(scaleCurrent);
        renderer.render(scene, camera);
      }
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // the hero is sticky, so it never scrolls away geometrically — once the
    // next sheet fully covers it, stop rendering until the next scroll
    const isCovered = () => window.scrollY > window.innerHeight * 1.15;
    const resume = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    const tmpMouse = new THREE.Vector3();

    const render = () => {
      if (cancelled) return;
      if (isCovered()) {
        raf = 0;
        window.addEventListener("scroll", resume, { once: true, passive: true });
        return;
      }

      const t = now();
      material.uniforms.uTime.value = t;
      dustMaterial.uniforms.uTime.value = t;
      glintMaterial.uniforms.uTime.value = t;

      // word cycle state machine
      const sinceMorph = t - morphStart;
      const progress = THREE.MathUtils.clamp(sinceMorph / morphDuration, 0, 1);
      material.uniforms.uProgress.value = progress;
      // stars only glint once the word has (mostly) formed
      glintMaterial.uniforms.uFade.value = THREE.MathUtils.smoothstep(
        progress,
        0.75,
        1
      );
      if (progress >= 1 && sinceMorph > morphDuration + HOLD_DURATION) {
        // hand off: current targets become the origin, next word becomes target
        const nextIndex = (wordIndex + 1) % WORDS.length;
        fromArr.set(toArr);
        toArr.set(shapes[nextIndex].targets);
        geometry.attributes.aFrom.needsUpdate = true;
        geometry.attributes.aTo.needsUpdate = true;
        wordIndex = nextIndex;
        morphStart = t;
        morphDuration = MORPH_DURATION;
        scaleTarget = fitScale(shapes[wordIndex]);
        material.uniforms.uProgress.value = 0;
        reseedGlints(shapes[wordIndex].targets);
      }

      // ease the word scale toward its fitted size
      scaleCurrent += (scaleTarget - scaleCurrent) * 0.06;
      points.scale.setScalar(scaleCurrent);

      // mouse world → local text units (shader space)
      tmpMouse.copy(mouseWorld).sub(points.position).divideScalar(scaleCurrent);
      material.uniforms.uMouse.value.lerp(tmpMouse, hasMouse ? 0.12 : 0.03);

      // scroll dissolve
      const scroll = THREE.MathUtils.clamp(
        window.scrollY / (window.innerHeight * 0.75),
        0,
        1
      );
      material.uniforms.uScroll.value = scroll;
      glintMaterial.uniforms.uScroll.value = scroll;

      // parallax
      camera.position.x += (mouseNdc.x * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (mouseNdc.y * 0.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0.3, 0);
      dust.rotation.z = t * 0.008;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    // --- async boot: wait for fonts, sample words, fade in, go ---
    (async () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const families = new Map<string, string>();
      for (const def of WORDS) {
        if (!families.has(def.varName)) {
          const fam = rootStyle.getPropertyValue(def.varName).trim();
          families.set(def.varName, fam || "sans-serif");
        }
      }
      try {
        await Promise.race([
          Promise.all(
            WORDS.map((def) =>
              document.fonts.load(
                `${def.style}${def.weight} ${def.size}px ${families.get(def.varName)}`
              )
            )
          ),
          new Promise((res) => setTimeout(res, 1800)),
        ]);
      } catch {
        // fall through with whatever font is available
      }
      if (cancelled) return;

      shapes = WORDS.map((def) =>
        sampleWord(def, families.get(def.varName) ?? "sans-serif", COUNT)
      );

      fromArr.set(cloudShape(COUNT));
      toArr.set(shapes[0].targets);
      geometry.attributes.aFrom.needsUpdate = true;
      geometry.attributes.aTo.needsUpdate = true;
      reseedGlints(shapes[0].targets);

      scaleTarget = fitScale(shapes[0]);
      scaleCurrent = scaleTarget * 0.9;
      morphStart = now();
      morphDuration = INTRO_DURATION;

      container.style.opacity = "1";

      if (reducedMotion) {
        // static: the first word, fully formed, no loop
        fromArr.set(shapes[0].targets);
        geometry.attributes.aFrom.needsUpdate = true;
        material.uniforms.uProgress.value = 1;
        material.uniforms.uTime.value = 3;
        dustMaterial.uniforms.uTime.value = 3;
        glintMaterial.uniforms.uTime.value = 3;
        glintMaterial.uniforms.uFade.value = 1;
        scaleCurrent = scaleTarget;
        points.scale.setScalar(scaleCurrent);
        renderer.render(scene, camera);
        return;
      }

      raf = requestAnimationFrame(render);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", resume);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
      geometry.dispose();
      material.dispose();
      glintGeometry.dispose();
      glintMaterial.dispose();
      glintTexture.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${className ?? ""} opacity-0 transition-opacity duration-1000`}
      aria-hidden="true"
    />
  );
}
