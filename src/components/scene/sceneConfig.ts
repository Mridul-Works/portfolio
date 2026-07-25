// Shared, dependency-free constants used by both the 3D desert scene and the
// plain-DOM intro gate. Kept separate from DesertCanvas.tsx so the intro
// screen doesn't have to pull in three.js just to know where the blob sits.

// Where on screen (NDC, -1..1) the blob rests — near foreground, left of
// center. The intro's portal-collapse converges on this same screen point so
// it looks like the gate is draining directly into the blob.
export const BLOB_NDC = { x: -0.34, y: -0.78 };

/** NDC (-1..1, y-up) -> CSS percentage (0..100, y-down) for clip-path origins. */
export function ndcToCssPercent(ndc: { x: number; y: number }) {
  return {
    xPct: ((ndc.x + 1) / 2) * 100,
    yPct: ((1 - ndc.y) / 2) * 100,
  };
}
