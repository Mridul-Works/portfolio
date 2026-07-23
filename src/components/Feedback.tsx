"use client";

import { useRef, useState, type CSSProperties } from "react";
import Reveal from "./Reveal";

type Request = {
  id: string;
  client: string;
  replies: string[];
  fee: number;
};

const REQUESTS: Request[] = [
  {
    id: "logo",
    client: "Can you make the logo bigger?",
    replies: [
      "Bigger. Done.",
      "Bigger than the headline now. Bold.",
      "It is the entire brand. Congratulations.",
    ],
    fee: 400,
  },
  {
    id: "pop",
    client: "It needs to pop more.",
    replies: ["Popping. I still don't know what that means."],
    fee: 900,
  },
  {
    id: "comic",
    client: "Can we try Comic Sans? Just to see.",
    replies: ["Seen. We have all seen."],
    fee: 1200,
  },
  {
    id: "colors",
    client: "Feels a bit flat — add more colours.",
    replies: ["All of them. I added all of them."],
    fee: 700,
  },
  {
    id: "animate",
    client: "My nephew says it needs animation.",
    replies: ["Your nephew is now the art director."],
    fee: 1500,
  },
  {
    id: "fold",
    client: "Everything should be above the fold.",
    replies: ["Everything. Above the fold. On a phone. Sure."],
    fee: 1100,
  },
  {
    id: "clone",
    client: "Make it like Apple's site. But original.",
    replies: ["An original copy. My favourite kind."],
    fee: 2000,
  },
];

const LOGO_SCALE = [1, 1.9, 3.2, 5.4];

const TASTEFUL_SWATCHES = ["#050505", "#F4F4F2", "#D9FF3D"];
const GARISH_SWATCHES = [
  "#ff004c",
  "#ff8a00",
  "#ffe600",
  "#00e05a",
  "#00b3ff",
  "#8a2be2",
  "#ff5ea8",
  "#00fff0",
];

type LogLine = { key: number; from: "client" | "me"; text: string };

export default function Feedback() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [log, setLog] = useState<LogLine[]>([]);
  const lineKey = useRef(0);

  const push = (lines: Omit<LogLine, "key">[]) =>
    setLog((prev) =>
      [...prev, ...lines.map((l) => ({ ...l, key: lineKey.current++ }))].slice(
        -6
      )
    );

  const applyRequest = (req: Request) => {
    const current = counts[req.id] ?? 0;
    const maxed = current >= req.replies.length;
    setCounts((prev) => ({
      ...prev,
      [req.id]: maxed ? current : current + 1,
    }));
    push([
      { from: "client", text: req.client },
      {
        from: "me",
        text: maxed ? "Already done. Twice, actually." : req.replies[current],
      },
    ]);
  };

  const reset = () => {
    setCounts({});
    push([
      { from: "client", text: "Actually, can we go back to the first one?" },
      { from: "me", text: "v1. The one approved three weeks ago. Restored." },
    ]);
  };

  const on = (id: string) => (counts[id] ?? 0) > 0;
  const logoLevel = Math.min(counts.logo ?? 0, LOGO_SCALE.length - 1);
  const revisions = Object.values(counts).reduce((a, b) => a + b, 0);
  const invoice = REQUESTS.reduce(
    (sum, r) => sum + r.fee * (counts[r.id] ?? 0),
    0
  );
  const appliedCount = REQUESTS.filter((r) => on(r.id)).length;
  const creep = Math.round((appliedCount / REQUESTS.length) * 100);
  const shipped = appliedCount === REQUESTS.length;

  const fold = on("fold");
  const swatches = on("colors") ? GARISH_SWATCHES : TASTEFUL_SWATCHES;

  const cardStyle: CSSProperties = {
    fontFamily: on("comic")
      ? '"Comic Sans MS", "Comic Sans", "Chalkboard SE", cursive'
      : undefined,
  };

  const canvasStyle: CSSProperties = on("colors")
    ? {
        backgroundImage:
          "linear-gradient(135deg,#ff5ea8 0%,#ffd166 25%,#06d6a0 50%,#4cc9f0 75%,#b892ff 100%)",
      }
    : { backgroundColor: "#ffffff" };

  return (
    <section
      id="feedback"
      className="relative z-10 rounded-t-[2.5rem] bg-paper text-zinc-900 sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
            CRAFT — 03 / THE FEEDBACK ROUND
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Every design survives
            <br />
            <span className="text-zinc-500">until the client opens it.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Below is a landing page I was genuinely happy with. Your turn — be
            the client. Click a note and watch taste quietly leave the building.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:gap-12">
          <Reveal delay={80}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
              FEEDBACK — PICK YOUR POISON
            </p>

            <ul className="mt-4 flex flex-col gap-2">
              {REQUESTS.map((req) => {
                const active = on(req.id);
                return (
                  <li key={req.id}>
                    <button
                      type="button"
                      onClick={() => applyRequest(req)}
                      aria-pressed={active}
                      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-colors ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-[0.15em] font-mono text-[10px] ${
                          active ? "text-accent" : "text-zinc-400"
                        }`}
                      >
                        {active ? "✕" : "＋"}
                      </span>
                      <span className="flex-1">&ldquo;{req.client}&rdquo;</span>
                      <span
                        className={`font-mono text-[10px] tracking-wider ${
                          active ? "text-white/50" : "text-zinc-400"
                        }`}
                      >
                        +${req.fee}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={reset}
              disabled={revisions === 0}
              className="mt-4 w-full rounded-xl border border-dashed border-zinc-300 px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-zinc-500 transition-colors enabled:hover:border-zinc-900 enabled:hover:text-zinc-900 disabled:opacity-40"
            >
              ↺ REVERT TO V1
            </button>
          </Reveal>

          <Reveal delay={160}>
            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-[9px] tracking-[0.2em] text-zinc-400">
                  REVISION
                </p>
                <p className="mt-1 text-lg text-zinc-900">
                  v{revisions + 1}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-[9px] tracking-[0.2em] text-zinc-400">
                  SCOPE CREEP
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-[width] duration-500 ease-out"
                    style={{ width: `${creep}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-zinc-500">{creep}%</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-[9px] tracking-[0.2em] text-zinc-400">
                  UNPAID
                </p>
                <p className="mt-1 text-lg text-zinc-900">
                  ${invoice.toLocaleString("en-US")}
                </p>
              </div>
            </div>

            {/* the live mockup — this is what the feedback actually does */}
            <div
              style={cardStyle}
              className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm"
            >
              <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="ml-3 font-mono text-[10px] text-zinc-400">
                  mridul.dev/final-FINAL-v{revisions + 1}
                </span>
              </div>

              <div
                style={canvasStyle}
                className={`relative transition-colors duration-500 ${
                  fold ? "px-4 py-4" : "px-6 py-10 sm:px-10 sm:py-14"
                } ${on("animate") ? "fb-jitter" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    style={{
                      fontSize: `${1.15 * LOGO_SCALE[logoLevel]}rem`,
                    }}
                    className="font-display font-bold leading-none tracking-tight text-zinc-900 transition-[font-size] duration-500 ease-out"
                  >
                    M<span className="text-accent-deep">.</span>
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-500">
                    WORK · ABOUT · SAY HI
                  </span>
                </div>

                <h3
                  className={`${fold ? "mt-2 text-lg" : "mt-8 text-2xl sm:text-4xl"} font-display font-bold leading-tight tracking-tight text-zinc-900 ${
                    on("pop") ? "fb-pop" : ""
                  }`}
                >
                  Design that gets out of the way.
                </h3>

                <p
                  className={`${
                    fold ? "mt-1 text-[11px]" : "mt-4 max-w-sm text-sm"
                  } leading-relaxed text-zinc-600`}
                >
                  One idea, room to breathe, and nothing on screen that
                  hasn&apos;t earned its place.
                </p>

                {on("clone") && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-zinc-900/10 bg-white/60 py-2">
                    <p
                      className={`whitespace-nowrap font-mono text-[10px] tracking-[0.3em] text-zinc-600 ${
                        on("animate") ? "fb-marquee" : ""
                      }`}
                    >
                      ★ THINK DIFFERENT. BUT DIFFERENTLY. ★ AWARD-WINNING ★
                      SYNERGY ★ THINK DIFFERENT. BUT DIFFERENTLY. ★
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`${
                    fold ? "mt-2 px-3 py-1.5 text-[10px]" : "mt-8 px-5 py-2.5 text-xs"
                  } rounded-full bg-zinc-900 font-mono tracking-[0.15em] text-white ${
                    on("animate") ? "fb-blink" : ""
                  }`}
                >
                  SEE THE WORK
                </button>

                <div
                  className={`${fold ? "mt-3" : "mt-8"} flex flex-wrap gap-1.5`}
                >
                  {swatches.map((hex) => (
                    <span
                      key={hex}
                      style={{ backgroundColor: hex }}
                      className="h-5 w-5 rounded-md border border-zinc-900/10"
                    />
                  ))}
                </div>

                {shipped && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <p className="-rotate-12 rounded-lg border-4 border-red-600/70 px-6 py-2 font-display text-2xl font-bold uppercase tracking-widest text-red-600/70 sm:text-4xl">
                      Approved
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              aria-live="polite"
              className="mt-4 min-h-30 rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-mono text-[11px] leading-relaxed"
            >
              {log.length === 0 ? (
                <p className="text-zinc-400">
                  No feedback yet. Enjoy it while it lasts.
                </p>
              ) : (
                log.map((line) => (
                  <p
                    key={line.key}
                    className={
                      line.from === "client"
                        ? "text-zinc-400"
                        : "text-zinc-900"
                    }
                  >
                    <span className="tracking-[0.15em]">
                      {line.from === "client" ? "CLIENT" : "ME    "}
                    </span>{" "}
                    — {line.text}
                  </p>
                ))
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-500">
              {shipped
                ? "Shipped Friday, 11:58 PM. The client's nephew called it fire. I no longer put it in my portfolio."
                : "Every one of these is real. I still build the first version — that's the part worth paying for."}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
