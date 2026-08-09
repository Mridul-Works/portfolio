"use client";

import { useEffect, useRef } from "react";

/**
 * A compass for the contact section. A small dart rides just ahead of the
 * real cursor — always on the side facing the CTA, nose locked onto the
 * button — like a hunting dog straining at the leash. The closer you get,
 * the more excited the label. Pure theatre: pointer-events are off, and it
 * bows out the moment the real cursor reaches the button. Its job is done.
 */

const FAR_LABEL = "THE BUTTON IS THIS WAY";
const NEAR_LABEL = "RIGHT THERE — CLICK IT";
const NEAR_DIST = 180; // px from button where the label switches

const LEAD = 52; // how far ahead of the real cursor the dart floats

export default function GuideCursor({ targetId }: { targetId: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const ghost = ghostRef.current;
    const arrow = arrowRef.current;
    const label = labelRef.current;
    if (!overlay || !ghost || !arrow || !label) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const button = document.getElementById(targetId);
    if (!button) return;

    // everything runs in overlay-local coordinates
    const buttonPoint = () => {
      const o = overlay.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      return { x: b.left + b.width / 2 - o.left, y: b.top + b.height / 2 - o.top };
    };

    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let rot = 0;
    let seen = false; // no dart until the real cursor shows itself
    let near = false;

    const onPointerMove = (e: PointerEvent) => {
      const o = overlay.getBoundingClientRect();
      mouse.x = e.clientX - o.left;
      mouse.y = e.clientY - o.top;
      if (!seen) {
        seen = true;
        // materialize at the cursor instead of flying in from a corner
        pos.x = mouse.x;
        pos.y = mouse.y;
        overlay.style.opacity = "1";
      }
    };
    window.addEventListener("pointermove", onPointerMove);

    let raf = 0;
    const loop = () => {
      if (seen) {
        const b = buttonPoint();

        // sit LEAD px ahead of the cursor, on the side facing the button —
        // straining toward it without ever leaving your side
        const mdx = b.x - mouse.x;
        const mdy = b.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy) || 1;
        const lead = Math.min(LEAD, mdist * 0.5);
        const target = {
          x: mouse.x + (mdx / mdist) * lead,
          y: mouse.y + (mdy / mdist) * lead,
        };

        vel.x = (vel.x + (target.x - pos.x) * 0.014) * 0.84;
        vel.y = (vel.y + (target.y - pos.y) * 0.014) * 0.84;
        pos.x += vel.x;
        pos.y += vel.y;

        // nose stays locked on the button, wherever you wander
        const aim = (Math.atan2(b.y - pos.y, b.x - pos.x) * 180) / Math.PI;
        const delta = ((aim - rot + 540) % 360) - 180;
        rot += delta * 0.14;

        const isNear = mdist < NEAR_DIST;
        if (isNear !== near) {
          near = isNear;
          label.textContent = isNear ? NEAR_LABEL : FAR_LABEL;
        }

        ghost.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px)`;
        arrow.style.transform = `rotate(${rot.toFixed(1)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    // only perform while the section is watching
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(overlay);

    // the real cursor arriving on the button means the compass worked — exit
    let backTimer = 0;
    const onEnter = () => {
      window.clearTimeout(backTimer);
      overlay.style.opacity = "0";
    };
    const onLeave = () => {
      backTimer = window.setTimeout(() => {
        if (seen) overlay.style.opacity = "1";
      }, 700);
    };
    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.clearTimeout(backTimer);
      window.removeEventListener("pointermove", onPointerMove);
      button.removeEventListener("pointerenter", onEnter);
      button.removeEventListener("pointerleave", onLeave);
    };
  }, [targetId]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden opacity-0 transition-opacity duration-500 sm:block"
    >
      <div ref={ghostRef} className="absolute left-0 top-0 will-change-transform">
        {/* a dart, nose right by default — rotation aims it at the button */}
        <svg
          ref={arrowRef}
          width="26"
          height="26"
          viewBox="0 0 24 24"
          className="absolute -left-3.25 -top-3.25 will-change-transform drop-shadow-[0_3px_10px_rgba(4,6,60,0.6)]"
        >
          <path
            d="M22 12 L3 4 L8.5 12 L3 20 Z"
            fill="#d9ff3d"
            stroke="#050505"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        <span
          ref={labelRef}
          className="absolute left-4 top-4 whitespace-nowrap rounded-full bg-accent px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.15em] text-ink shadow-[0_4px_14px_-4px_rgba(4,6,60,0.8)]"
        >
          {FAR_LABEL}
        </span>
      </div>
    </div>
  );
}
