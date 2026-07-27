"use client";

import { useEffect, useState } from "react";

/**
 * The quiet closer: a booking pill that appears once the hero is gone and
 * gets out of the way when the hire/contact sections (which already sell)
 * are on screen. One job — never let a convinced visitor hunt for the CTA.
 */
export default function FloatingCta() {
  const [pastHero, setPastHero] = useState(false);
  const [pitchVisible, setPitchVisible] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setPastHero(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = ["invest", "contact"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting
            ? visible.add(entry.target)
            : visible.delete(entry.target)
        );
        setPitchVisible(visible.size > 0);
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    targets.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const shown = pastHero && !pitchVisible;

  return (
    <a
      href="#invest"
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-cobalt px-5 py-3 font-mono text-[10px] font-bold tracking-[0.15em] text-white shadow-[0_12px_35px_-12px_rgba(4,6,60,0.9)] transition-all duration-500 hover:bg-cobalt-deep sm:bottom-8 sm:right-8 ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="hidden sm:inline">SLOTS OPEN — </span>
      START A PROJECT
    </a>
  );
}
