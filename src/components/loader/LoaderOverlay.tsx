"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** True once the heavy desert asset has finished downloading. */
  assetReady: boolean;
  /** Real download progress, 0..100. */
  progress: number;
  /** Fired when the loader starts leaving — cue Scene 1 to mount + decode. */
  onDissolveStart?: () => void;
  /** Called after the loader has faded out — parent unmounts it. */
  onComplete: () => void;
}

const MIN_MS = 1600; // minimum on-screen time so it never just flashes
const FADE_MS = 600; // fade-out duration (keep in sync with the class below)

// Minimal, typographic loader. No WebGL — just the name, a hairline progress
// bar riding the real download, and an honest counter. Fast and quiet.
export default function LoaderOverlay({
  assetReady,
  progress,
  onDissolveStart,
  onComplete,
}: Props) {
  const [leaving, setLeaving] = useState(false);
  const mountedAt = useRef<number>(0);
  const done = useRef(false);

  if (mountedAt.current === 0) mountedAt.current = Date.now();

  // Leave once the desert is downloaded and we've shown for the minimum beat.
  useEffect(() => {
    if (!assetReady || done.current) return;
    const wait = Math.max(0, MIN_MS - (Date.now() - mountedAt.current));
    const leaveTimer = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      onDissolveStart?.(); // mount Scene 1 behind the fade
      setLeaving(true);
      setTimeout(onComplete, FADE_MS);
    }, wait);
    return () => clearTimeout(leaveTimer);
  }, [assetReady, onDissolveStart, onComplete]);

  const pct = Math.round(Math.min(progress, 100));

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity ease-out"
      style={{ opacity: leaving ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
      aria-hidden={leaving}
      role="status"
      aria-label={`Loading, ${pct} percent`}
    >
      <h1 className="loader-name select-none text-neutral-100">MRIDUL</h1>

      {/* Hairline progress rail + fill. */}
      <div className="mt-9 h-px w-64 max-w-[70vw] overflow-hidden bg-white/10">
        <div
          className="h-full bg-[#8a2b6b] shadow-[0_0_8px_1px_rgba(176,38,255,0.5)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex w-64 max-w-[70vw] justify-between font-mono text-[11px] tracking-wide text-white/30">
        <span>Loading a desert</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
