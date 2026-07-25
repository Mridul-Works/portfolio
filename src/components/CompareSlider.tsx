"use client";

import { useState } from "react";

/**
 * Belief 04, demonstrated: a drag handle between the ₹5K template and
 * the site that could only belong to one brand. The argument makes
 * itself the moment the visitor pulls the handle — no copy needed.
 * The control is a full-bleed invisible range input, so it works with
 * mouse, touch and keyboard alike.
 */
export default function CompareSlider() {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative select-none overflow-hidden rounded-2xl border border-zinc-200 shadow-[0_24px_60px_-30px_rgba(5,5,5,0.35)]">
      <div className="relative aspect-16/10 sm:aspect-2/1">
        {/* yours — the bottom layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cobalt text-white">
          <div className="grain pointer-events-none absolute inset-0" />
          <p className="chrome-text px-4 text-center font-display text-3xl font-bold tracking-tight sm:text-5xl">
            UNMISTAKABLE
          </p>
          <span className="rounded-full bg-accent px-5 py-2.5 font-mono text-[10px] font-bold tracking-[0.2em] text-ink">
            EXPLORE →
          </span>
          <p className="absolute bottom-3 right-4 font-mono text-[9px] tracking-[0.25em] text-white/60">
            YOURS
          </p>
        </div>

        {/* the template — clipped top layer */}
        <div
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#e9e9e7] text-zinc-500"
        >
          <p className="px-4 text-center text-2xl [font-family:'Times_New_Roman',Times,serif] sm:text-4xl">
            Welcome to our website
          </p>
          <span className="border border-zinc-400 px-4 py-2 text-xs">
            Learn More
          </span>
          <p className="absolute bottom-3 left-4 font-mono text-[9px] tracking-[0.25em] text-zinc-400">
            THE ₹5K TEMPLATE
          </p>
        </div>

        {/* divider + handle */}
        <div
          style={{ left: `${pos}%` }}
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_18px_rgba(0,0,0,0.35)]"
        >
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white font-mono text-xs text-ink shadow-lg">
            ↔
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare a generic template with a custom design"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
