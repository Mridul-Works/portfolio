"use client";

import { useEffect, useRef } from "react";

/**
 * A pair of eyes that blink and follow the cursor — the site's mascot
 * moment. Sized in em so the parent's font-size decides how big the face
 * is. Tracking only runs while the eyes are on screen.
 */

function Eye({
  pupilRef,
}: {
  pupilRef: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span className="eye-blink relative inline-flex h-[0.68em] w-[0.5em] items-center justify-center rounded-full bg-white align-baseline">
      <span
        ref={pupilRef}
        className="block h-[0.24em] w-[0.24em] rounded-full bg-ink will-change-transform"
      />
    </span>
  );
}

export default function Eyes({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const pupilL = useRef<HTMLSpanElement>(null);
  const pupilR = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onPointerMove);

    let raf = 0;
    const loop = () => {
      [pupilL.current, pupilR.current].forEach((pupil, i) => {
        if (!pupil) return;
        const eye = pupil.parentElement;
        if (!eye) return;

        const rect = eye.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = mouse.x - cx;
        const dy = mouse.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // pupils drift a little toward the cursor, clamped inside the eye
        const maxX = rect.width * 0.2;
        const maxY = rect.height * 0.24;
        const strength = Math.min(dist / 300, 1);
        const tx = (dx / dist) * maxX * strength;
        const ty = (dy / dist) * maxY * strength;

        current[i].x += (tx - current[i].x) * 0.12;
        current[i].y += (ty - current[i].y) * 0.12;
        pupil.style.transform = `translate(${current[i].x.toFixed(
          2
        )}px, ${current[i].y.toFixed(2)}px)`;
      });
      raf = requestAnimationFrame(loop);
    };

    // only track the cursor while the eyes are on screen
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <span
      ref={wrapRef}
      aria-hidden="true"
      className={`inline-flex items-center gap-[0.08em] ${className}`}
    >
      <Eye pupilRef={pupilL} />
      <Eye pupilRef={pupilR} />
    </span>
  );
}
