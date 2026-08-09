"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live project previews — because a portfolio that says "campaign pages
 * on tight deadlines" should not prove it with a stock screenshot. The
 * sprint demo *is* the job: a new landing page assembles itself every few
 * seconds while the ad clicks keep counting. That was the actual rhythm.
 */

type SprintProps = {
  site: string;
  slugs: string[];
  cta: string;
};

function PageSprint({ site, slugs, cta }: SprintProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cycle, setCycle] = useState(0);
  const [clicks, setClicks] = useState(1204);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let pageTimer = 0;
    let clickTimer = 0;
    const stop = () => {
      window.clearInterval(pageTimer);
      window.clearInterval(clickTimer);
      pageTimer = 0;
      clickTimer = 0;
    };

    // only ship pages while someone's watching
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!pageTimer) {
          pageTimer = window.setInterval(() => setCycle((c) => c + 1), 3800);
          clickTimer = window.setInterval(
            () => setClicks((v) => v + 1 + Math.floor(Math.random() * 3)),
            900
          );
        }
      } else {
        stop();
      }
    });
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  const slug = slugs[cycle % slugs.length];

  return (
    <div ref={wrapRef} className="flex h-full w-full flex-col">
      {/* browser chrome — the url changes because the pages kept coming */}
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-3.5 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="ml-2 truncate rounded-md bg-white/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-white/60">
          {site}
          <span className="text-accent">{slug}</span>
        </span>
      </div>

      {/* the page, assembling itself on deadline — again */}
      <div key={cycle} className="relative flex-1 p-4 pb-10 sm:p-5 sm:pb-10">
        <span
          style={{ animationDelay: "900ms" }}
          className="speed-in absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[8px] tracking-[0.2em] text-accent"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          LIVE
        </span>

        <div
          style={{ animationDelay: "40ms" }}
          className="speed-in h-7 w-3/5 rounded-md bg-white/30 sm:h-9"
        />
        <div
          style={{ animationDelay: "140ms" }}
          className="speed-in mt-2.5 h-2 w-4/5 rounded-full bg-white/12"
        />
        <div
          style={{ animationDelay: "220ms" }}
          className="speed-in mt-1.5 h-2 w-3/5 rounded-full bg-white/12"
        />

        <div className="mt-4 flex gap-3.5">
          <div
            style={{ animationDelay: "340ms" }}
            className="speed-in h-16 w-24 shrink-0 rounded-lg border border-white/10 bg-white/8 sm:h-20 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <div
              style={{ animationDelay: "420ms" }}
              className="speed-in h-2 w-full rounded-full bg-white/12"
            />
            <div
              style={{ animationDelay: "480ms" }}
              className="speed-in mt-1.5 h-2 w-5/6 rounded-full bg-white/12"
            />
            <span
              style={{ animationDelay: "620ms" }}
              className="speed-in mt-3 inline-block rounded-full bg-accent px-3.5 py-1.5 font-mono text-[8px] font-bold tracking-[0.2em] text-ink"
            >
              {cta}
            </span>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
        A NEW PAGE EVERY FEW SECONDS — BARELY AN EXAGGERATION
      </p>
      <p className="pointer-events-none absolute bottom-2.5 right-3 font-mono text-[9px] tracking-[0.15em] text-accent/80">
        AD CLICKS — {clicks.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function ProjectDemo({
  seed,
  title,
}: {
  seed: string;
  title: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${title} — live preview`}
      className="relative h-full w-full overflow-hidden bg-[#0b0b0e]"
    >
      {seed === "mastersunion" && (
        <PageSprint
          site="mastersunion.org"
          slugs={["/pgp-tbm", "/admissions-2026", "/masterclass", "/scholarships"]}
          cta="APPLY NOW"
        />
      )}
      {seed === "masterscamp" && (
        <PageSprint
          site="masterscamp.org"
          slugs={["/summer-2026", "/young-founders", "/bootcamp", "/apply"]}
          cta="JOIN THE CAMP"
        />
      )}
    </div>
  );
}
