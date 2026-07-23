"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "./Reveal";

type Project = {
  seed: string;
  title: string;
  year: string;
  pro: string;
  honest: string;
  proTags: string[];
  honestTags: string[];
};

const PROJECTS: Project[] = [
  {
    seed: "nova",
    title: "Nova Markets",
    year: "2026",
    pro: "Real-time trading dashboard streaming 40k ticks a minute with sub-second chart updates.",
    honest:
      "Line goes up, line goes down. I spent two weeks making the line go up and down smoothly.",
    proTags: ["NEXT.JS", "WEBSOCKETS", "CANVAS"],
    honestTags: ["CAFFEINE", "REDRAWS", "DOUBT"],
  },
  {
    seed: "aurora",
    title: "Aurora Configurator",
    year: "2025",
    pro: "Interactive 3D product configurator with physically-based rendering and 60fps on mobile.",
    honest:
      "You can spin a shoe. That's it. People spun the shoe for four minutes on average.",
    proTags: ["THREE.JS", "WEBGL", "GLTF"],
    honestTags: ["SHOE", "SPINNING", "4 MIN AVG"],
  },
  {
    seed: "papertrail",
    title: "Papertrail",
    year: "2025",
    pro: "Editorial platform with a custom CMS, static generation and a 100/100 Lighthouse score.",
    honest:
      "It's a blog. The fastest blog you've ever seen. Nobody asked for a blog this fast.",
    proTags: ["SSG", "CMS", "LIGHTHOUSE 100"],
    honestTags: ["A BLOG", "BUT FAST", "WHY THO"],
  },
  {
    seed: "orbit",
    title: "Orbit UI",
    year: "2024",
    pro: "Design system with tokenized theming powering 30+ screens across two products.",
    honest:
      "I made buttons. Then I made the buttons agree with each other. It took months.",
    proTags: ["DESIGN TOKENS", "A11Y", "STORYBOOK"],
    honestTags: ["BUTTONS", "MEETINGS", "MONTHS"],
  },
];

export default function Work() {
  const [suited, setSuited] = useState(false);
  const [honest, setHonest] = useState(false);

  return (
    <section
      id="work"
      className={`relative z-10 rounded-t-[2.5rem] transition-colors duration-700 sm:rounded-t-[3.5rem] ${
        suited ? "bg-white text-zinc-900" : "bg-ink text-white"
      }`}
    >
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-36">
        {/* the intervention — stays visible as evidence */}
        <Reveal>
          <p
            className={`font-mono text-[11px] tracking-[0.3em] transition-colors duration-700 ${
              suited ? "text-zinc-400" : "text-white/55"
            }`}
          >
            {suited ? "WORK — FINALLY" : "AN INTERVENTION"}
          </p>

          <div
            className={`mt-8 flex max-w-2xl flex-col gap-5 transition-opacity duration-700 ${
              suited ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex gap-4">
              <span
                className={`font-mono text-[10px] tracking-[0.2em] ${
                  suited ? "text-zinc-400" : "text-white/40"
                }`}
              >
                YOU
              </span>
              <p className="text-base leading-relaxed sm:text-lg">
                okay… the eyes blink, the letters bounce, the grid explodes.
                genuinely fun. but this is a portfolio.{" "}
                <em>where is the actual work?</em>
              </p>
            </div>
            <div className="flex gap-4">
              <span
                className={`font-mono text-[10px] tracking-[0.2em] ${
                  suited ? "text-zinc-400" : "text-accent"
                }`}
              >
                ME
              </span>
              <p
                className={`text-base leading-relaxed sm:text-lg ${
                  suited ? "text-zinc-600" : "text-white/70"
                }`}
              >
                hehe. yeah. I get carried away once I start talking design.
                happens in meetings too. one second, let me put on a tie—
              </p>
            </div>
          </div>

          {!suited && (
            <button
              type="button"
              onClick={() => setSuited(true)}
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-3.5 font-mono text-xs font-bold tracking-[0.15em] text-ink transition-transform hover:scale-[1.03]"
            >
              👔 MAKE HIM PROFESSIONAL
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          )}
        </Reveal>

        {/* the sudden onset of professionalism */}
        {suited && (
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 pb-6">
              <div>
                <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  Selected Work
                </h2>
                <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-zinc-400">
                  2024 — 2026 · EVERYTHING BELOW IS LINKEDIN-APPROVED
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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

                <button
                  type="button"
                  onClick={() => {
                    setSuited(false);
                    setHonest(false);
                  }}
                  className="rounded-full border border-zinc-200 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-zinc-500 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                >
                  👔 TAKE OFF THE TIE
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {PROJECTS.map((project, i) => (
                <Reveal key={project.seed} delay={i * 90}>
                  <a href="#" className="group block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-zinc-100">
                      <Image
                        src={`https://picsum.photos/seed/${project.seed}/960/720`}
                        alt={`${project.title} — project preview`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className={`object-cover transition-all duration-500 group-hover:scale-[1.04] ${
                          honest ? "" : "grayscale group-hover:grayscale-0"
                        }`}
                      />
                    </div>

                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                        {project.title}
                      </h3>
                      <span className="font-mono text-xs text-zinc-400">
                        {project.year}
                      </span>
                    </div>

                    <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
                      {honest ? project.honest : project.pro}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(honest ? project.honestTags : project.proTags).map(
                        (tag) => (
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
                        )
                      )}
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-16">
              <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
                {honest
                  ? "There. The truth. Every project up there was mostly panic, coffee and reading documentation at 1 AM. They all shipped, though. That's the part that counts."
                  : "Case studies available on request. And yes — the tie comes off the moment the contract is signed."}
              </p>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
