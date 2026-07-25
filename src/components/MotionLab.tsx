"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Craft 03 — motion, demonstrated. Three dots chase the same target:
 * one linear, one eased, one on a real spring you can tune live.
 * Click or drag on the track to move the target.
 */

const LANES = [
  { label: "LINEAR", color: "#a1a1aa" },
  { label: "EASE-OUT", color: "#18181b" },
  { label: "SPRING", color: "#9db800" },
];

export default function MotionLab() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stiffness, setStiffness] = useState(170);
  const [damping, setDamping] = useState(14);
  const [reduced, setReduced] = useState(false);
  const physics = useRef({ stiffness: 170, damping: 14 });

  useEffect(() => {
    physics.current = { stiffness, damping };
  }, [stiffness, damping]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setReduced(reducedMotion);

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const PAD = 64;
    let target = 0.78; // as a fraction of the usable track
    const dots = [
      { x: 0.06, v: 0 }, // linear
      { x: 0.06, v: 0 }, // ease
      { x: 0.06, v: 0 }, // spring
    ];
    let lastInteract = 0;
    let nextAuto = 2200;

    const trackX = (frac: number) => PAD + frac * (width - PAD - 24);
    const fracFromEvent = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      return Math.min(
        1,
        Math.max(0, (clientX - rect.left - PAD) / (rect.width - PAD - 24))
      );
    };

    let down = false;
    const onDown = (e: PointerEvent) => {
      down = true;
      target = fracFromEvent(e.clientX);
      lastInteract = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      target = fracFromEvent(e.clientX);
      lastInteract = performance.now();
    };
    const onUp = () => {
      down = false;
    };
    if (!reducedMotion) {
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    const drawFrame = (trails: boolean) => {
      // translucent wash = motion trails
      ctx.fillStyle = trails ? "rgba(255,255,255,0.18)" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const tx = trackX(target);
      const laneY = (i: number) => height * (0.26 + i * 0.26);

      // target line
      ctx.strokeStyle = "#d9ff3d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tx, height * 0.12);
      ctx.lineTo(tx, height * 0.88);
      ctx.stroke();
      ctx.fillStyle = "#71717a";
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillText("TARGET", tx - 18, height * 0.08 + 2);

      LANES.forEach((lane, i) => {
        const y = laneY(i);
        // track
        ctx.strokeStyle = "rgba(24,24,27,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, y);
        ctx.lineTo(width - 24, y);
        ctx.stroke();
        // label
        ctx.fillStyle = "#a1a1aa";
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillText(lane.label, 10, y + 3);
        // dot
        ctx.fillStyle = lane.color;
        ctx.beginPath();
        ctx.arc(trackX(dots[i].x), y, 7, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    if (reducedMotion) {
      dots.forEach((d) => (d.x = target));
      drawFrame(false);
      const ro = new ResizeObserver(() => {
        resize();
        drawFrame(false);
      });
      ro.observe(wrap);
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.033) : 0.016;
      last = t;

      // idle? hop the target somewhere new so the demo sells itself
      if (t - lastInteract > 3000 && t > nextAuto) {
        target = 0.12 + Math.random() * 0.76;
        nextAuto = t + 2600;
      }

      // linear: constant velocity, then hard stop (that's the problem)
      const speed = 0.9 * dt;
      const d0 = dots[0];
      if (Math.abs(target - d0.x) <= speed) d0.x = target;
      else d0.x += Math.sign(target - d0.x) * speed;

      // ease-out: exponential decay toward the target
      dots[1].x += (target - dots[1].x) * Math.min(1, dt * 7);

      // spring: carries momentum, tuned by the sliders
      const { stiffness: S, damping: D } = physics.current;
      const s = dots[2];
      const accel = S * (target - s.x) - D * s.v;
      s.v += accel * dt;
      s.x += s.v * dt;

      drawFrame(true);
      raf = requestAnimationFrame(loop);
    };

    // run only while visible
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(loop);
        }
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(wrap);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef}>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <canvas
          ref={canvasRef}
          className="h-64 w-full cursor-crosshair touch-none sm:h-72"
          aria-label="Easing comparison: three dots chasing a target you can move"
        />
        <div className="grid gap-4 border-t border-zinc-200 px-5 py-4 sm:grid-cols-2">
          <label className="block">
            <span className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              STIFFNESS <span className="text-zinc-900">{stiffness}</span>
            </span>
            <input
              type="range"
              min={30}
              max={400}
              step={10}
              value={stiffness}
              disabled={reduced}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="mt-2 w-full accent-accent-deep"
            />
          </label>
          <label className="block">
            <span className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              DAMPING <span className="text-zinc-900">{damping}</span>
            </span>
            <input
              type="range"
              min={4}
              max={40}
              step={1}
              value={damping}
              disabled={reduced}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="mt-2 w-full accent-accent-deep"
            />
          </label>
        </div>
      </div>
      <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-zinc-500">
        {reduced
          ? "REDUCED MOTION IS ON — THE DOTS RESPECTFULLY STAY PUT."
          : "DRAG ON THE TRACK. LOW DAMPING = JELLY. HIGH STIFFNESS = CAFFEINE."}
      </p>
    </div>
  );
}
