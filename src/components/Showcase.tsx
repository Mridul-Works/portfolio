"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import Stardust from "./Stardust";
import ProjectDemo from "./WorkDemos";

/**
 * Case studies, editorial style: one big outcome number per project,
 * a live demo instead of a screenshot, and the honesty toggle — the
 * single most trust-building toy on the site — kept front and centre.
 */

type Case = {
  seed: string;
  title: string;
  sector: string;
  year: string;
  metric: string;
  metricLabel: string;
  pro: string;
  honest: string;
  proTags: string[];
  honestTags: string[];
};

const CASES: Case[] = [
  {
    seed: "nova",
    title: "Nova Markets",
    sector: "FINTECH",
    year: "2026",
    metric: "0.4s",
    metricLabel: "CHART REFRESH AT 40K TICKS / MIN",
    pro: "A real-time trading dashboard that makes a firehose of data feel calm. Traders stopped complaining — in fintech, that's a standing ovation.",
    honest:
      "Line goes up, line goes down. I spent two weeks making the line go up and down smoothly.",
    proTags: ["NEXT.JS", "WEBSOCKETS", "CANVAS"],
    honestTags: ["CAFFEINE", "REDRAWS", "DOUBT"],
  },
  {
    seed: "aurora",
    title: "Aurora Configurator",
    sector: "E-COMMERCE",
    year: "2025",
    metric: "4:12",
    metricLabel: "AVERAGE TIME SPENT WITH ONE PRODUCT",
    pro: "An interactive 3D product configurator at 60fps on mobile. Four minutes of undivided attention per visitor — most brands get eight seconds.",
    honest:
      "You can spin a shoe. That's it. People spun the shoe for four minutes on average.",
    proTags: ["THREE.JS", "WEBGL", "GLTF"],
    honestTags: ["SHOE", "SPINNING", "4 MIN AVG"],
  },
  {
    seed: "papertrail",
    title: "Papertrail",
    sector: "EDITORIAL",
    year: "2025",
    metric: "100",
    metricLabel: "LIGHTHOUSE SCORE, EVERY PAGE",
    pro: "An editorial platform with a custom CMS and static generation. Loads before the reader finishes blinking — speed is the quietest luxury.",
    honest:
      "It's a blog. The fastest blog you've ever seen. Nobody asked for a blog this fast.",
    proTags: ["SSG", "CMS", "LIGHTHOUSE 100"],
    honestTags: ["A BLOG", "BUT FAST", "WHY THO"],
  },
  {
    seed: "orbit",
    title: "Orbit UI",
    sector: "PRODUCT",
    year: "2024",
    metric: "30+",
    metricLabel: "SCREENS, ONE DESIGN SYSTEM",
    pro: "A tokenised design system powering two products. Every button agrees with every other button — your brand, made structurally incapable of drifting.",
    honest:
      "I made buttons. Then I made the buttons agree with each other. It took months.",
    proTags: ["DESIGN TOKENS", "A11Y", "STORYBOOK"],
    honestTags: ["BUTTONS", "MEETINGS", "MONTHS"],
  },
];

export default function Showcase() {
  const [honest, setHonest] = useState(false);

  return (
    <section
      id="work"
      className="relative z-10 -mt-11 rounded-t-[2.5rem] bg-white text-zinc-900 sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <Stardust count={9} seed={17} className="text-zinc-300" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-36">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
                WORK — OUTCOMES, NOT SCREENSHOTS
              </p>
              <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Every preview below is{" "}
                <span className="font-script italic text-cobalt">alive</span>.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                No stock mockups — each panel runs a tiny working version of
                the thing it claims. And because trust is the whole game,
                there&apos;s a toggle that makes me describe my own work the
                way I would to a friend.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setHonest((h) => !h)}
              aria-pressed={honest}
              className="flex items-center gap-2.5 rounded-full border border-zinc-200 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900"
            >
              HONESTY: {honest ? "ON" : "OFF"}
              <span
                aria-hidden="true"
                className={`relative h-4 w-7 rounded-full transition-colors ${
                  honest ? "bg-accent" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
                    honest ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-20 sm:gap-28">
          {CASES.map((c, i) => (
            <Reveal key={c.seed} delay={60}>
              <article
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-zinc-200 shadow-[0_24px_60px_-30px_rgba(5,5,5,0.35)]">
                  <ProjectDemo seed={c.seed} honest={honest} title={c.title} />
                </div>

                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-400">
                    0{i + 1} — {c.sector} · {c.year}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-4xl">
                    {c.title}
                  </h3>

                  <div className="mt-6 flex items-baseline gap-4 border-l-2 border-cobalt pl-5">
                    <p className="font-display text-5xl font-bold tracking-tight text-cobalt sm:text-6xl">
                      {c.metric}
                    </p>
                    <p className="max-w-40 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-500">
                      {c.metricLabel}
                    </p>
                  </div>

                  <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
                    {honest ? c.honest : c.pro}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {(honest ? c.honestTags : c.proTags).map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.15em] transition-colors ${
                          honest
                            ? "border-accent-deep/40 text-accent-deep"
                            : "border-zinc-200 text-zinc-500"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-zinc-200 bg-paper px-6 py-6 sm:px-8">
            <p className="max-w-md text-sm leading-relaxed text-zinc-600">
              {honest
                ? "The truth: all of it was panic, coffee and 1am documentation. All of it also shipped. Your product will too."
                : "Code walkthroughs, deep dives and references on request — happy to defend every decision in an interview."}
            </p>
            <a
              href="#hire"
              className="group inline-flex items-center gap-3 rounded-full bg-cobalt px-7 py-3.5 font-mono text-xs font-bold tracking-[0.15em] text-white transition-colors hover:bg-cobalt-deep"
            >
              WANT THIS ON YOUR TEAM?
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
