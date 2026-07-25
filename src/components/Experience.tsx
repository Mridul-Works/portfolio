"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAssetDownload } from "./loader/useAssetDownload";
import IntroGate from "./intro/IntroGate";

// WebGL is client-only — skip SSR entirely to avoid hydration/window issues.
const DesertCanvas = dynamic(() => import("./scene/DesertCanvas"), { ssr: false });
const LoaderOverlay = dynamic(() => import("./loader/LoaderOverlay"), { ssr: false });
// IntroGate is plain DOM/CSS (no browser-only APIs at module scope), so it's
// imported directly rather than lazy-chunked.

export const DESERT_URL = "/blender-water-scene/ocean_scene.glb";

// Orchestrates the full intro:
//  1. The heavy desert *downloads* over the network while the sand loader plays
//     (the loader animates alone, so it stays buttery — no decode competing).
//  2. The loader dissolves once that download is truly done + a min hold; the
//     desert mounts and decodes behind it, already glowing with its blob.
//  3. A dark landing gate asks the visitor in ("ready to experience Mridul's
//     path?"). Entering drains the gate into the blob's screen position —
//     the desert (already live underneath) is revealed through that point.
export default function Experience() {
  const { progress, done: assetReady } = useAssetDownload(DESERT_URL);
  const [mountDesert, setMountDesert] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [entered, setEntered] = useState(false);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Mounted the instant the loader starts leaving, so it decodes cached
          bytes and is fully rendered by the time the gate reveals it. */}
      {mountDesert && <DesertCanvas />}

      {!loaderDone && (
        <LoaderOverlay
          assetReady={assetReady}
          progress={progress}
          onDissolveStart={() => setMountDesert(true)}
          onComplete={() => setLoaderDone(true)}
        />
      )}

      {loaderDone && !entered && <IntroGate onEntered={() => setEntered(true)} />}
    </div>
  );
}
