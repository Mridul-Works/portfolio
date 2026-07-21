"use client";

import { useEffect, useRef } from "react";

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

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const pupilL = useRef<HTMLSpanElement>(null);
  const pupilR = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
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

    // only track the cursor while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative z-10 rounded-t-[2.5rem] bg-ink text-white sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-mono text-[11px] tracking-[0.3em] text-white/55">
          GOT AN IDEA? — LET&apos;S BUILD IT
        </p>

        <h2
          aria-label="Contact me"
          className="mt-10 font-display font-bold uppercase leading-[0.95] tracking-tight"
        >
          <span aria-hidden="true" className="block text-[clamp(3rem,10vw,8.5rem)]">
            Contact
          </span>
          <span
            aria-hidden="true"
            className="mt-[0.05em] flex items-center justify-center gap-[0.08em] text-[clamp(3rem,10vw,8.5rem)]"
          >
            M
            <Eye pupilRef={pupilL} />
            <Eye pupilRef={pupilR} />
          </span>
        </h2>

        <a
          href="mailto:hello@mridul.dev"
          className="group mt-12 inline-flex items-center gap-3 text-lg text-white/70 transition-colors hover:text-white sm:text-2xl"
        >
          <span className="border-b border-white/25 pb-1 transition-colors group-hover:border-accent">
            hello@mridul.dev
          </span>
          <span className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </a>

        <div className="mt-14 flex items-center gap-8 font-mono text-xs tracking-[0.2em] text-white/55">
          <a href="#" className="transition-colors hover:text-accent">
            GITHUB
          </a>
          <a href="#" className="transition-colors hover:text-accent">
            LINKEDIN
          </a>
          <a href="#" className="transition-colors hover:text-accent">
            TWITTER
          </a>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-white/10 px-6 py-6 font-mono text-[10px] tracking-[0.2em] text-white/45 sm:px-10">
        <p>© 2026 MRIDUL</p>
        <p className="hidden sm:block">DESIGNED & BUILT WITH NEXT.JS + THREE.JS</p>
        <p>INDIA</p>
      </footer>
    </section>
  );
}
