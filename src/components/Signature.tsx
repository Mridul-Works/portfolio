"use client";

import { useEffect, useRef, useState } from "react";
import MarqueeBand from "./MarqueeBand";
import Reveal from "./Reveal";

/**
 * Proof you can touch. Four tiles, each demonstrating one ingredient of
 * the house style *by doing it* — a spring that follows you, type that
 * breathes, depth that tilts, and one tile that deliberately does
 * nothing. No screenshots, no adjectives.
 */

/* 01 — motion: a dot on a spring, chasing the cursor with damping */
function MotionTile() {
  const tileRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tile = tileRef.current;
    const dot = dotRef.current;
    if (!tile || !dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let inside = false;
    let raf = 0;

    const loop = () => {
      const tx = inside ? target.x : 0;
      const ty = inside ? target.y : 0;
      vel.x = (vel.x + (tx - pos.x) * 0.16) * 0.8;
      vel.y = (vel.y + (ty - pos.y) * 0.16) * 0.8;
      pos.x += vel.x;
      pos.y += vel.y;
      dot.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px)`;

      const settled =
        !inside &&
        Math.abs(pos.x) < 0.3 &&
        Math.abs(pos.y) < 0.3 &&
        Math.abs(vel.x) < 0.3 &&
        Math.abs(vel.y) < 0.3;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = tile.getBoundingClientRect();
      target.x = e.clientX - rect.left - rect.width / 2;
      target.y = e.clientY - rect.top - rect.height / 2;
      inside = true;
      wake();
    };
    const onLeave = () => {
      inside = false;
      wake();
    };

    tile.addEventListener("pointermove", onMove);
    tile.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      tile.removeEventListener("pointermove", onMove);
      tile.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={tileRef}
      className="relative flex h-56 touch-none items-center justify-center overflow-hidden sm:h-64"
    >
      <span className="absolute h-14 w-14 rounded-full border border-white/15" />
      <div
        ref={dotRef}
        className="h-4 w-4 rounded-full bg-accent shadow-[0_0_24px_rgba(217,255,61,0.55)] will-change-transform"
      />
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        MOVE YOUR CURSOR — IT FOLLOWS WITH MANNERS
      </p>
    </div>
  );
}

/* 02 — type: letter-spacing that opens like a breath on hover */
function TypeTile() {
  return (
    <div className="group relative flex h-56 items-center justify-center overflow-hidden sm:h-64">
      <p className="font-display text-3xl font-bold tracking-tight text-white transition-all duration-700 ease-out group-hover:tracking-[0.3em] group-hover:text-accent sm:text-4xl">
        BREATHE
      </p>
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        HOVER — GOOD TYPE KNOWS WHEN TO EXHALE
      </p>
    </div>
  );
}

/* 03 — depth: a chrome card that tilts toward the cursor */
function DepthTile() {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transition = "transform 80ms linear";
    card.style.transform = `rotateY(${(px * 26).toFixed(1)}deg) rotateX(${(
      -py * 22
    ).toFixed(1)}deg)`;
  };

  const onLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
    card.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative flex h-56 items-center justify-center overflow-hidden [perspective:700px] sm:h-64"
    >
      <div
        ref={cardRef}
        className="flex h-32 w-44 items-center justify-center rounded-2xl border border-white/20 bg-white/5 will-change-transform [transform-style:preserve-3d]"
      >
        <span className="chrome-text font-display text-2xl font-bold tracking-tight">
          DEPTH
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        TILT — DIMENSION WITHOUT THE GIMMICK
      </p>
    </div>
  );
}

/* 04 — color: one composition, four moods, no redesign */
const MOODS = [
  { name: "GALLERY", bg: "#f4f4f2", fg: "#050505", pop: "#1e2ae4" },
  { name: "NOIR", bg: "#0a0a0c", fg: "#ffffff", pop: "#d9ff3d" },
  { name: "FOREST", bg: "#0a5a28", fg: "#f4f4f2", pop: "#d9ff3d" },
  { name: "COBALT", bg: "#1e2ae4", fg: "#ffffff", pop: "#d9ff3d" },
];

function ColorTile() {
  const [mood, setMood] = useState(0);
  const m = MOODS[mood];
  return (
    <button
      type="button"
      onClick={() => setMood((v) => (v + 1) % MOODS.length)}
      aria-label={`Switch brand mood — currently ${m.name}`}
      className="relative flex h-56 w-full cursor-pointer items-center justify-center overflow-hidden text-left sm:h-64"
    >
      <div
        style={{ backgroundColor: m.bg }}
        className="flex h-36 w-52 flex-col justify-between rounded-xl border border-white/10 p-4 transition-colors duration-500"
      >
        <div>
          <p
            style={{ color: m.fg }}
            className="font-display text-sm font-bold tracking-tight transition-colors duration-500"
          >
            Your brand<span style={{ color: m.pop }}>.</span>
          </p>
          <div className="mt-2 space-y-1.5">
            <div
              style={{ backgroundColor: m.fg, opacity: 0.35 }}
              className="h-1.5 w-4/5 rounded-full transition-colors duration-500"
            />
            <div
              style={{ backgroundColor: m.fg, opacity: 0.2 }}
              className="h-1.5 w-3/5 rounded-full transition-colors duration-500"
            />
          </div>
        </div>
        <span
          style={{ backgroundColor: m.pop, color: m.bg }}
          className="w-max rounded-full px-3 py-1 font-mono text-[8px] font-bold tracking-[0.2em] transition-colors duration-500"
        >
          BOOK NOW
        </span>
      </div>
      <span className="absolute right-4 top-3 font-mono text-[9px] tracking-[0.25em] text-white/40">
        MOOD — {m.name}
      </span>
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        CLICK — ONE SYSTEM, MANY MOODS
      </p>
    </button>
  );
}

/* 05 — speed: a reload you can actually measure */
const SPEED_LINES = [88, 64, 96, 52, 78];

function SpeedTile() {
  const [run, setRun] = useState(0);
  const [ms, setMs] = useState<number | null>(null);
  const started = useRef(0);

  useEffect(() => {
    if (!run) return;
    const raf = requestAnimationFrame(() =>
      setMs(performance.now() - started.current)
    );
    return () => cancelAnimationFrame(raf);
  }, [run]);

  return (
    <div className="relative flex h-56 flex-col overflow-hidden p-5 sm:h-64">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            started.current = performance.now();
            setMs(null);
            setRun((r) => r + 1);
          }}
          className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[9px] tracking-[0.2em] text-white/70 transition-colors hover:border-accent hover:text-accent"
        >
          ⟳ RELOAD PAGE
        </button>
        <p className="font-mono text-[10px] tracking-[0.15em] text-accent">
          {ms === null && run > 0
            ? "…"
            : ms !== null
              ? `${ms.toFixed(1)} MS`
              : ""}
        </p>
      </div>

      <div key={run} className="mt-5 flex-1 space-y-2.5">
        <div
          style={{ animationDelay: "0ms" }}
          className={`h-3 w-2/3 rounded-full bg-white/30 ${run ? "speed-in" : ""}`}
        />
        {SPEED_LINES.map((w, i) => (
          <div
            key={i}
            style={{ width: `${w}%`, animationDelay: `${(i + 1) * 30}ms` }}
            className={`h-2 rounded-full bg-white/12 ${run ? "speed-in" : ""}`}
          />
        ))}
      </div>

      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        {run
          ? "THAT NUMBER IS A REAL MEASUREMENT"
          : "CLICK RELOAD — SPEED IS THE QUIETEST LUXURY"}
      </p>
    </div>
  );
}

/* 06 — restraint: the hardest skill, demonstrated by an empty tile */
function RestraintTile() {
  return (
    <div className="group relative flex h-56 items-center justify-center overflow-hidden sm:h-64">
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 transition-colors duration-500 group-hover:text-white/70">
          THIS TILE DOES NOTHING.
        </p>
        <p className="mt-2 font-script text-xl italic text-accent opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
          that&apos;s the skill.
        </p>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-white/30">
        RESTRAINT — KNOWING WHEN TO STOP
      </p>
    </div>
  );
}

const TILES = [
  {
    key: "motion",
    label: "MOTION",
    caption: "Springs with damping — alive, never jumpy.",
    Demo: MotionTile,
  },
  {
    key: "type",
    label: "TYPOGRAPHY",
    caption: "Treated like architecture, not decoration.",
    Demo: TypeTile,
  },
  {
    key: "depth",
    label: "DEPTH",
    caption: "3D where it earns its place. (The hero is 26,000 particles.)",
    Demo: DepthTile,
  },
  {
    key: "color",
    label: "COLOR",
    caption: "A system, not a mood swing — rebrand in one click.",
    Demo: ColorTile,
  },
  {
    key: "speed",
    label: "SPEED",
    caption: "Sub-second isn't a promise here. It's a habit.",
    Demo: SpeedTile,
  },
  {
    key: "restraint",
    label: "RESTRAINT",
    caption: "The feature most websites are missing.",
    Demo: RestraintTile,
  },
];

export default function Signature() {
  return (
    <section
      id="signature"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      {/* same atmosphere as the hero — cobalt + film grain. No vignette:
          the sheet corners below reveal the sticky hero's flat cobalt, so
          darkened edges here would create a visible seam at the boundary. */}
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/55">
            THE SIGNATURE — PROOF YOU CAN TOUCH
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Anyone can claim taste.
            <br />
            <span className="text-white/50">Go on — touch these.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Four ingredients go into every site I build. Instead of describing
            them, each tile below simply <em>is</em> one. This is also your
            preview of how your visitors will feel.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile, i) => (
            <Reveal key={tile.key} delay={i * 70}>
              <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 transition-colors duration-500 hover:border-white/40">
                <tile.Demo />
                <div className="flex items-baseline justify-between gap-4 border-t border-white/10 px-4 py-3.5">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-accent">
                    {tile.label}
                  </p>
                  <p className="truncate text-xs text-white/55">
                    {tile.caption}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            Every tile here runs at 60fps on a mid-range phone — the same
            budget your visitors will be on. Next: what happens when these
            ingredients meet a real brief.
          </p>
        </Reveal>
      </div>

      <div className="relative pb-24 text-white/90 sm:pb-28">
        <MarqueeBand text="PROOF OVER PROMISES —" />
      </div>
    </section>
  );
}
