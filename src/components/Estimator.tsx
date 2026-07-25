"use client";

import { useState } from "react";

/**
 * A ballpark in five seconds. Three questions, one honest range —
 * because "what does it cost?" shouldn't require a discovery call to
 * answer approximately. The exact number still takes the 20-minute
 * call; this just removes the fear of asking.
 */

const TYPES = [
  { key: "landing", label: "LANDING PAGE", base: 50000 },
  { key: "full", label: "FULL SITE", base: 150000 },
  { key: "showpiece", label: "3D SHOWPIECE", base: 300000 },
] as const;

const MOTION = [
  { key: "polished", label: "POLISHED", mult: 1 },
  { key: "cinematic", label: "CINEMATIC", mult: 1.35 },
] as const;

const fmt = (v: number) =>
  v >= 100000
    ? `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`
    : `₹${Math.round(v / 1000)}K`;

function Segmented<T extends { key: string; label: string }>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: string;
  onChange: (key: T["key"]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          aria-pressed={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.2em] transition-colors ${
            value === opt.key
              ? "border-accent bg-accent text-ink"
              : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Estimator() {
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("full");
  const [motion, setMotion] =
    useState<(typeof MOTION)[number]["key"]>("polished");
  const [care, setCare] = useState(false);

  const base = TYPES.find((t) => t.key === type)!.base;
  const mult = MOTION.find((m) => m.key === motion)!.mult;
  const low = base * mult;
  const high = low * 1.6;

  const mailto = `mailto:hello@mridul.dev?subject=${encodeURIComponent(
    `New project — ${TYPES.find((t) => t.key === type)!.label.toLowerCase()}, ballpark ${fmt(low)}–${fmt(high)}`
  )}&body=${encodeURIComponent(
    `What I'm building:\n\nWho it's for:\n\nDeadline (if any):\n\nAnything existing (links welcome):\n`
  )}`;

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-mono text-[9px] tracking-[0.25em] text-white/50">
              WHAT ARE WE BUILDING?
            </p>
            <div className="mt-2.5">
              <Segmented options={TYPES} value={type} onChange={setType} />
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[0.25em] text-white/50">
              HOW SHOULD IT MOVE?
            </p>
            <div className="mt-2.5">
              <Segmented options={MOTION} value={motion} onChange={setMotion} />
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[0.25em] text-white/50">
              AFTER LAUNCH?
            </p>
            <div className="mt-2.5">
              <button
                type="button"
                aria-pressed={care}
                onClick={() => setCare((c) => !c)}
                className={`rounded-full border px-4 py-2 font-mono text-[10px] tracking-[0.2em] transition-colors ${
                  care
                    ? "border-accent bg-accent text-ink"
                    : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                }`}
              >
                CARE PLAN — ₹15K/MO
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-left lg:min-w-64 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="font-mono text-[9px] tracking-[0.25em] text-white/50">
            YOUR BALLPARK
          </p>
          <p className="mt-2 font-display text-4xl font-bold tracking-tight text-accent sm:text-5xl">
            {fmt(low)}–{fmt(high)}
          </p>
          {care && (
            <p className="mt-1.5 font-mono text-[10px] tracking-[0.15em] text-white/60">
              + ₹15K/MO AFTER LAUNCH
            </p>
          )}
          <a
            href={mailto}
            className="group mt-5 inline-flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-white transition-colors hover:text-accent"
          >
            LOCK THE EXACT NUMBER IN 48H
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>

      <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[9px] leading-relaxed tracking-[0.15em] text-white/45">
        BALLPARK, NOT A CONTRACT — THE FIXED QUOTE TAKES ONE 20-MINUTE CALL
        AND DOESN&apos;T CHANGE AFTER THAT.
      </p>
    </div>
  );
}
