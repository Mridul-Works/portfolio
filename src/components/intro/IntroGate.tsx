"use client";

import { useState } from "react";
import { BLOB_NDC, ndcToCssPercent } from "../scene/sceneConfig";

interface Props {
  /** Called once the portal-collapse animation has fully finished. */
  onEntered: () => void;
}

const COLLAPSE_MS = 1250;
const FLASH_MS = 550;

const { xPct, yPct } = ndcToCssPercent(BLOB_NDC);
const portalVars = { "--bx": `${xPct}%`, "--by": `${yPct}%` } as React.CSSProperties;

// The threshold before the desert: a dark, serious landing that asks the
// visitor in, then "sucks" the screen into the neon blob on the sand — the
// same anomaly that's already glowing, waiting, behind this gate.
export default function IntroGate({ onEntered }: Props) {
  const [collapsing, setCollapsing] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleEnter = () => {
    if (collapsing) return;
    setCollapsing(true);

    // Flash right as the hole reaches the blob, then hand off.
    window.setTimeout(() => setFlash(true), COLLAPSE_MS - 180);
    window.setTimeout(() => {
      onEntered();
    }, COLLAPSE_MS + FLASH_MS);
  };

  return (
    <div
      className={`portal-collapse fixed inset-0 z-40 flex flex-col items-center justify-center gap-10 bg-black px-6 text-center ${
        collapsing ? "portal-collapsed" : ""
      }`}
      style={portalVars}
    >
      <div
        className="max-w-xl transition-opacity duration-300"
        style={{ opacity: collapsing ? 0 : 1 }}
      >
        <p className="horror-title text-2xl leading-relaxed sm:text-3xl">
          ARE YOU READY TO EXPERIENCE
          <br />
          MRIDUL&apos;S PATH?
        </p>
        <p className="mt-5 font-mono text-xs tracking-[0.3em] text-white/30">
          THERE IS NO TURNING BACK
        </p>

        <button
          type="button"
          onClick={handleEnter}
          className="horror-enter-btn mt-12 rounded-full border border-[#b026ff]/40 bg-[#0d0710] px-10 py-3 font-mono text-sm tracking-[0.35em] text-[#e6d3ff] transition-colors hover:bg-[#1a0e22]"
        >
          ENTER
        </button>
      </div>

      {/* Flash at the moment the gate drains into the blob. */}
      <div
        className={`portal-flash pointer-events-none fixed inset-0 ${
          flash ? "portal-flash-show" : ""
        }`}
        style={portalVars}
      />
    </div>
  );
}
