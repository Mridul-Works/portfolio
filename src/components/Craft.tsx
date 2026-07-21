"use client";

import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

const DARK_GREEN = [10, 90, 40];
const PAPER = [255, 255, 255];
const GRID_LIGHT = [255, 255, 255];
const GRID_DARK = [20, 60, 30];

const FADE_START = 0.45; // bg flips to white as the color block arrives
const FADE_END = 0.58;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (a: number[], b: number[], t: number) =>
  a.map((v, i) => Math.round(lerp(v, b[i], t)));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const PALETTE = [
  { hex: "#050505", role: "INK" },
  { hex: "#F4F4F2", role: "PAPER", border: true },
  { hex: "#D9FF3D", role: "ACCENT" },
  { hex: "#71717A", role: "MUTED" },
];

export default function Craft() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const draw = (progress: number) => {
      const fade = clamp01((progress - FADE_START) / (FADE_END - FADE_START));

      const [br, bg, bb] = lerpColor(DARK_GREEN, PAPER, fade);
      ctx.fillStyle = `rgb(${br},${bg},${bb})`;
      ctx.fillRect(0, 0, width, height);

      const [gr, gg, gb] = lerpColor(GRID_LIGHT, GRID_DARK, fade);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.25)`;
      ctx.lineWidth = 1;

      // a slightly coarser grid on small screens keeps text areas calm
      const spacing = lerp(width < 640 ? 52 : 40, 120, progress);
      const cx = width / 2;
      const cy = height / 2;
      const max = Math.max(width, height);

      for (let i = -40; i <= 40; i++) {
        for (let j = -40; j <= 40; j++) {
          const x = i * spacing;
          const y = j * spacing;

          const dist = Math.sqrt(x * x + y * y);
          const push = progress * Math.pow(dist / max, 1.2) * 300;
          const angle = Math.atan2(y, x);

          const nx = cx + x + Math.cos(angle) * push;
          const ny = cy + y + Math.sin(angle) * push;

          // skip cells that land outside the viewport
          if (
            nx + spacing < 0 ||
            nx - spacing > width ||
            ny + spacing < 0 ||
            ny - spacing > height
          ) {
            continue;
          }

          ctx.strokeRect(nx - spacing / 2, ny - spacing / 2, spacing, spacing);
        }
      }
    };

    const getProgress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp01(-rect.top / total) : 0;
    };

    resize();

    let raf = 0;
    let lastProgress = -1;
    const loop = () => {
      const progress = getProgress();
      if (Math.abs(progress - lastProgress) > 0.0005) {
        lastProgress = progress;
        draw(progress);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => {
      resize();
      lastProgress = -1;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="craft"
      className="relative z-10 bg-forest"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </div>

      <div className="relative z-10 mt-[-100svh]">
        {/* 01 — hierarchy, demonstrated by its own typography (light on dark green) */}
        <div className="flex min-h-svh items-center px-6 text-white">
          <div className="mx-auto w-full max-w-3xl">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.3em] text-white/60">
                CRAFT — 01 / HIERARCHY
              </p>
            </Reveal>

            <div className="mt-10 flex flex-col gap-8">
              <Reveal delay={80}>
                <p
                  aria-hidden="true"
                  className="font-mono text-[10px] tracking-[0.2em] text-white/55"
                >
                  &lt;h1&gt;
                </p>
                <p className="mt-1 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
                  Hierarchy leads the eye.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <p
                  aria-hidden="true"
                  className="font-mono text-[10px] tracking-[0.2em] text-white/55"
                >
                  &lt;h2&gt;
                </p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-white/90 sm:text-4xl">
                  Structure tells the story.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <p
                  aria-hidden="true"
                  className="font-mono text-[10px] tracking-[0.2em] text-white/55"
                >
                  &lt;h3&gt;
                </p>
                <p className="mt-1 text-lg font-medium text-white/85 sm:text-2xl">
                  Details earn the trust.
                </p>
              </Reveal>
              <Reveal delay={320}>
                <p
                  aria-hidden="true"
                  className="font-mono text-[10px] tracking-[0.2em] text-white/55"
                >
                  &lt;p&gt;
                </p>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                  And body copy quietly does the heavy lifting — comfortable,
                  consistent, never competing for attention. Every size step
                  has a reason. That&apos;s the whole trick.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        {/* 02 — color, arriving right as the canvas flips the theme */}
        <div className="flex min-h-svh items-center px-6 text-zinc-900">
          <div className="mx-auto w-full max-w-3xl">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
                CRAFT — 02 / COLOR
              </p>
              <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Color sets the mood
                <br />
                before a single word is read.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
                You just watched it happen — deep green for attention, calm
                paper for reading. A theme isn&apos;t decoration, it&apos;s a
                system: calm neutrals doing most of the work, one rare accent
                earning every glance.
              </p>
            </Reveal>

            <Reveal delay={120} className="mt-12">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {PALETTE.map((swatch) => (
                  <div key={swatch.hex}>
                    <div
                      className={`h-20 rounded-xl ${
                        swatch.border ? "border border-zinc-200" : ""
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <p className="mt-2 font-mono text-[10px] tracking-[0.15em] text-zinc-500">
                      {swatch.role} — {swatch.hex}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={200} className="mt-12">
              <div className="flex h-3 overflow-hidden rounded-full border border-zinc-200">
                <div className="w-[60%] bg-paper" />
                <div className="w-[30%] bg-zinc-400" />
                <div className="w-[10%] bg-accent" />
              </div>
              <div className="mt-3 flex justify-between font-mono text-[10px] tracking-[0.15em] text-zinc-500">
                <span>NEUTRAL / 60</span>
                <span>SUPPORT / 30</span>
                <span>ACCENT / 10</span>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
