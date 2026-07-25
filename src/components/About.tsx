"use client";

import { useState, type ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * The story styles itself: every chapter is rendered by the era it
 * describes — raw 1999 HTML, the first typed tag, CSS arriving live,
 * JavaScript acquiring too much power, and React finding peace.
 */

function Window({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="h-2 w-2 rounded-full bg-zinc-300" />
        <span className="ml-2 truncate font-mono text-[9px] text-zinc-400">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/* 01 — the internet as I found it */
function EraHomepage() {
  return (
    <Window url="geocities.com/~mridul/home.html">
      <div className="px-4 py-6 text-center [font-family:'Times_New_Roman',Times,serif]">
        <p className="text-lg font-bold text-[#000080]">
          ★ WELCOME TO MY HOME PAGE ★
        </p>
        <p className="mt-2 text-sm italic text-[#008000]">
          the kind of website that started the question
        </p>
        <p className="mt-3 text-xs">
          <span className="cursor-pointer text-[#0000ee] underline">
            click here
          </span>
          {" · "}
          <span className="cursor-pointer text-[#551a8b] underline">
            my dog
          </span>
          {" · "}
          <span className="cursor-pointer text-[#0000ee] underline">
            guestbook
          </span>
        </p>
        <table className="mx-auto mt-4 border-collapse">
          <tbody>
            <tr>
              <td className="border-2 bg-[#c0c0c0] px-3 py-1 font-mono text-[10px] [border-style:outset]">
                Visitors: 000042
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 font-mono text-[9px] text-zinc-500">
          <span className="fb-blink inline-block">🚧</span> UNDER CONSTRUCTION
          SINCE 2009 <span className="fb-blink inline-block">🚧</span> — best
          viewed in 800×600
        </p>
      </div>
    </Window>
  );
}

/* 02 — the first tag, typed live; refresh replays the miracle */
function EraHtml() {
  const [run, setRun] = useState(0);
  return (
    <Window url="file:///C:/Desktop/first.html">
      <div key={run} className="grid sm:grid-cols-2">
        <div className="flex items-center bg-[#0d0d10] px-4 py-5 font-mono text-xs text-zinc-300">
          <span className="era-type text-accent">
            &lt;h1&gt;hello, world&lt;/h1&gt;
          </span>
          <span className="fb-blink text-zinc-500">▌</span>
        </div>
        <div className="flex items-center justify-center px-4 py-5">
          <p className="era-appear text-2xl font-bold [font-family:'Times_New_Roman',Times,serif]">
            hello, world
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-200 px-3 py-2 text-right">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ⟳ HIT REFRESH. FEEL IT AGAIN.
        </button>
      </div>
    </Window>
  );
}

/* 03 — CSS arrives: restyle the same page, live */
const CSS_RULES = [
  { key: "type", label: "font-family" },
  { key: "color", label: "color" },
  { key: "space", label: "white-space" },
] as const;
type CssKey = (typeof CSS_RULES)[number]["key"];

function EraCss() {
  const [on, setOn] = useState<Record<CssKey, boolean>>({
    type: false,
    color: false,
    space: false,
  });
  const all = on.type && on.color && on.space;
  return (
    <Window url="style.css — three rules, infinite power">
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 px-3 py-2.5">
        {CSS_RULES.map((rule) => (
          <button
            key={rule.key}
            type="button"
            aria-pressed={on[rule.key]}
            onClick={() => setOn((f) => ({ ...f, [rule.key]: !f[rule.key] }))}
            className={`rounded-full border px-3 py-1 font-mono text-[9px] tracking-[0.15em] transition-colors ${
              on[rule.key]
                ? "border-zinc-900 bg-zinc-900 text-accent"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
            }`}
          >
            {rule.label}: {on[rule.key] ? "on" : "off"}
          </button>
        ))}
      </div>
      <div
        className={`transition-all duration-500 ${
          on.space ? "px-8 py-12 text-center" : "px-4 py-6 text-left"
        } ${on.color ? "bg-ink" : "bg-white"}`}
      >
        <p
          className={`transition-all duration-500 ${
            on.type
              ? "font-display text-2xl font-bold tracking-tight"
              : "text-xl [font-family:'Times_New_Roman',Times,serif]"
          } ${on.color ? "text-accent" : "text-zinc-800"}`}
        >
          hello, world
        </p>
        {all && (
          <p className="mt-2 font-mono text-[9px] tracking-[0.25em] text-white/50">
            SUDDENLY — ON TOP OF THE WORLD
          </p>
        )}
      </div>
    </Window>
  );
}

/* 04 — JavaScript: power, then too much power */
const JS_LOGS = [
  "> alert('I can DO things')",
  "> document.getElementById('everything')",
  "> setInterval(moreChaos, 16)",
  "> // okay. maybe too much power.",
];
const JS_TRANSFORMS = [
  "rotate(0deg) scale(1)",
  "rotate(-3deg) scale(1.07)",
  "rotate(2.5deg) scale(1.15)",
  "rotate(-5deg) scale(1.24)",
  "rotate(-5deg) scale(1.24)",
];

function EraJs() {
  const [n, setN] = useState(0);
  return (
    <Window url="chaos.js">
      <div className="flex items-center justify-center overflow-hidden px-4 py-8">
        <p
          style={{ transform: JS_TRANSFORMS[n] }}
          className={`font-display text-3xl font-bold tracking-tight transition-transform duration-300 ${
            n >= 3 ? "fb-jitter" : ""
          }`}
        >
          anything<span className="text-accent-deep">.</span>
        </p>
      </div>
      <div className="min-h-20 border-t border-zinc-200 bg-[#0d0d10] px-4 py-3 font-mono text-[10px] leading-relaxed text-zinc-400">
        {n === 0 ? (
          <p className="text-zinc-600">
            {"// console idle. press the button."}
          </p>
        ) : (
          JS_LOGS.slice(0, n).map((l) => <p key={l}>{l}</p>)
        )}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2">
        <button
          type="button"
          onClick={() => setN((x) => Math.min(x + 1, 4))}
          disabled={n >= 4}
          className="rounded-full bg-zinc-900 px-4 py-1.5 font-mono text-[10px] tracking-[0.15em] text-white transition-transform enabled:hover:scale-[1.03] disabled:opacity-40"
        >
          ▶ RUN moreJavaScript()
        </button>
        {n >= 4 && (
          <button
            type="button"
            onClick={() => setN(0)}
            className="font-mono text-[10px] tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            ↺ CTRL+Z
          </button>
        )}
      </div>
    </Window>
  );
}

/* 05 — React: one state, three components, peace */
function EraReact() {
  const [peace, setPeace] = useState(false);
  return (
    <Window url="localhost:3000 — it finally makes sense">
      <div className="px-4 py-4">
        <p className="font-mono text-[10px] text-zinc-500">
          const [vibe, setVibe] = useState(
          <span className="text-accent-deep">
            &quot;{peace ? "peace" : "chaos"}&quot;
          </span>
          )
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Header", "Card", "Footer"].map((name, i) => (
            <div
              key={name}
              style={{ transitionDelay: `${i * 90}ms` }}
              className={`rounded-lg border px-2 py-3 text-center transition-all duration-500 ${
                peace
                  ? "border-zinc-200 bg-zinc-50"
                  : "fb-jitter border-red-300 bg-red-50"
              }`}
            >
              <p className="font-mono text-[9px] text-zinc-500">
                &lt;{name} /&gt;
              </p>
              <p className="mt-1 text-[10px]">
                {peace ? "· calm ·" : "· on fire ·"}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPeace((p) => !p)}
            className={`rounded-full px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.15em] transition-colors ${
              peace
                ? "bg-zinc-900 text-accent"
                : "bg-red-600 text-white"
            }`}
          >
            setVibe(&quot;{peace ? "chaos" : "peace"}&quot;)
          </button>
          <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-400">
            {peace ? "EVERYTHING UPDATES. NOTHING BREAKS." : "PRESS IT. PLEASE."}
          </p>
        </div>
      </div>
    </Window>
  );
}

const CHAPTERS = [
  {
    n: "01",
    tag: "THE QUESTION",
    text: "As a kid, I couldn't look at a website without wondering — how is this even made?",
    Demo: EraHomepage,
  },
  {
    n: "02",
    tag: "HTML",
    text: "I wrote my first tag, hit refresh, and felt like a god.",
    Demo: EraHtml,
  },
  {
    n: "03",
    tag: "CSS",
    text: "Then I learned CSS, and suddenly I was on top of the world.",
    Demo: EraCss,
  },
  {
    n: "04",
    tag: "JAVASCRIPT",
    text: "JavaScript changed everything — now I could build anything in the world.",
    Demo: EraJs,
  },
  {
    n: "05",
    tag: "REACT, NEXT & BEYOND",
    text: "Then came React, Next.js and the frameworks. And with them, something unexpected — peace.",
    Demo: EraReact,
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative z-10 rounded-t-[2.5rem] bg-paper text-zinc-900 sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
            ABOUT — THE STORY, PLAYABLE
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            It all started with one question&nbsp;—
            <br />
            <span className="text-zinc-500">
              &ldquo;how is a website even made?&rdquo;
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
            Each chapter below doesn&apos;t just describe an era of the web —
            it <em>is</em> one. Click things. That&apos;s the whole point of
            the medium.
          </p>
        </Reveal>

        <div className="mt-16 sm:mt-20">
          {CHAPTERS.map((chapter, i) => (
            <Reveal key={chapter.n} delay={i * 80}>
              <div className="flex gap-6 border-t border-zinc-200 py-8 sm:gap-10 sm:py-10">
                <span className="font-mono text-xs text-zinc-500">
                  {chapter.n}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
                    {chapter.tag}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-zinc-700 sm:text-xl">
                    {chapter.text}
                  </p>
                  <chapter.Demo />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 sm:mt-24">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
            I&apos;d found my own canvas —
            <br />
            and a creative vision to paint on it
            <span className="text-accent-deep">.</span>
          </p>
          <p className="mt-8 font-mono text-xs tracking-[0.2em] text-zinc-500">
            — MRIDUL
          </p>
        </Reveal>
      </div>
    </section>
  );
}
