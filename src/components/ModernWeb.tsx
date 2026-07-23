"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const TOTAL_STAGES = 5;

const STAGE_NAMES = [
  "COOKIES",
  "NEWSLETTER",
  "NOTIFICATIONS",
  "CAPTCHA",
  "PASSWORD",
];

/* --- password rules, escalating as fast as you satisfy them --- */

const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

// target is ES2017, so no \p{...} escapes — check codepoints instead
const EMOJI_RANGES: [number, number][] = [
  [0x1f000, 0x1faff],
  [0x2600, 0x27bf],
  [0x2b00, 0x2bff],
  [0xfe0f, 0xfe0f],
];

const hasEmoji = (value: string) =>
  Array.from(value).some((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return EMOJI_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
  });

const glyphs = (value: string) => Array.from(value).length;

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => glyphs(v) >= 8 },
  { label: "Contains a number", test: (v) => /\d/.test(v) },
  {
    label: "Contains a special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
  { label: "Contains an emoji", test: hasEmoji },
  {
    label: "Length must be a prime number",
    test: (v) => isPrime(glyphs(v)),
  },
];

/* --- captcha --- */

const TILES = ["🚗", "🚦", "🌳", "🚦", "🏠", "🚌", "🌳", "🚦", "🚗"];

const CAPTCHA_PROMPTS = [
  "Select all squares containing traffic lights",
  "Select all squares containing bicycles",
];

/* --- the dodge path for the reject button (deterministic, not random) --- */

const DODGES = [
  { x: -104, y: -14 },
  { x: 88, y: 18 },
  { x: -46, y: -26 },
];

export default function ModernWeb() {
  const [stage, setStage] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [sins, setSins] = useState<string[]>([]);

  const [dodges, setDodges] = useState(0);
  const [asks, setAsks] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(1);

  const bump = () => setClicks((c) => c + 1);

  const sin = (text: string) =>
    setSins((prev) => (prev.includes(text) ? prev : [...prev, text]));

  const next = () => setStage((s) => s + 1);

  const restart = () => {
    setStage(0);
    setClicks(0);
    setSins([]);
    setDodges(0);
    setAsks(0);
    setPicked([]);
    setAttempt(0);
    setPassword("");
    setRevealed(1);
  };

  const escaped = stage >= TOTAL_STAGES;

  /* stage 0 — the cookie banner */

  const dodgeReject = () => {
    if (dodges >= DODGES.length) return;
    setDodges((d) => d + 1);
  };

  // click.detail === 0 means Enter/Space, not a mouse — the button can only
  // dodge a cursor, so keyboard users are let straight through
  const rejectCookies = (viaKeyboard: boolean) => {
    bump();
    if (!viaKeyboard && dodges < DODGES.length) {
      dodgeReject();
      return;
    }
    sin(
      viaKeyboard && dodges < DODGES.length
        ? "Escaped the cookie banner by keyboard. It never saw you coming."
        : "Rejected all cookies. They kept them anyway."
    );
    next();
  };

  /* stage 3 — the captcha */

  const toggleTile = (i: number) => {
    bump();
    setPicked((prev) =>
      prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]
    );
  };

  const verifyCaptcha = () => {
    bump();
    if (attempt === 0) {
      setAttempt(1);
      setPicked([]);
      return;
    }
    next();
  };

  /* stage 4 — the password */

  const onPassword = (value: string) => {
    setPassword(value);
    let r = revealed;
    while (r < RULES.length && RULES.slice(0, r).every((rule) => rule.test(value)))
      r++;
    setRevealed(r);
  };

  const passwordDone =
    revealed === RULES.length && RULES.every((rule) => rule.test(password));

  const rejectOffset =
    dodges === 0
      ? { x: 0, y: 0 }
      : DODGES[Math.min(dodges, DODGES.length) - 1];

  return (
    <section
      id="modern-web"
      className="relative z-10 rounded-t-[2.5rem] bg-ink text-white sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/55">
            INTERMISSION — THE MODERN WEB
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Somewhere under all of this,
            <br />
            <span className="text-white/50">there was content.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Five obstacles stand between you and one paragraph of text. It is a
            game. It is also just an ordinary Tuesday. Good luck.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          {/* progress */}
          <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.2em] text-white/45">
            <p aria-live="polite">
              {escaped
                ? "ESCAPED"
                : `OBSTACLE ${stage + 1} / ${TOTAL_STAGES} — ${STAGE_NAMES[stage]}`}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {STAGE_NAMES.map((name, i) => (
                <span
                  key={name}
                  className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                    i < stage ? "bg-accent" : "bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* the fake site */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/3 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 truncate font-mono text-[10px] text-white/35">
                totallynormal.site/9-tips-for-better-sleep
              </span>
            </div>

            <div className="relative h-128 sm:h-108">
              {/* the article you are here for */}
              <div
                className={`h-full overflow-hidden px-6 py-8 transition-all duration-700 sm:px-10 ${
                  escaped ? "blur-0 opacity-100" : "blur-[3px] opacity-40"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.25em] text-white/40">
                  LIFESTYLE — 4 MIN READ
                </p>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  9 Tips For Better Sleep
                </h3>

                {escaped ? (
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70">
                    <p>
                      <span className="text-accent">1.</span> Stop opening
                      websites at 2am.
                    </p>
                    <p className="text-white/40">
                      Tips 2 through 9 are on the next page, behind another
                      banner, a video that autoplays, and a poll about which
                      biscuit you are.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3" aria-hidden="true">
                    {[100, 92, 97, 64, 88, 95, 71].map((w, i) => (
                      <div
                        key={i}
                        style={{ width: `${w}%` }}
                        className="h-2.5 rounded-full bg-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ——— obstacle 1: cookies ——— */}
              {stage === 0 && (
                <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#141416] px-5 py-5 sm:px-7">
                  <p className="font-display text-base font-bold sm:text-lg">
                    We value your privacy
                  </p>
                  <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/55 sm:text-sm">
                    We and our 1,847 carefully selected partners store cookies
                    to personalise the ads you were going to scroll past anyway.
                    Your choices will be remembered for approximately eleven
                    minutes.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        bump();
                        sin("Accepted 1,847 trackers without reading a word.");
                        next();
                      }}
                      className="rounded-full bg-accent px-7 py-3 font-mono text-xs font-bold tracking-[0.15em] text-ink transition-transform hover:scale-[1.03]"
                    >
                      ACCEPT ALL
                    </button>

                    <button
                      type="button"
                      onClick={(e) => rejectCookies(e.detail === 0)}
                      onPointerEnter={(e) => {
                        if (e.pointerType === "mouse") dodgeReject();
                      }}
                      style={{
                        transform: `translate(${rejectOffset.x}px, ${rejectOffset.y}px)`,
                      }}
                      className="text-[11px] text-white/25 underline decoration-white/20 underline-offset-4 transition-transform duration-200 ease-out hover:text-white/40 focus-visible:text-white"
                    >
                      {dodges >= DODGES.length
                        ? "reject all (fine, go on)"
                        : "reject all"}
                    </button>
                  </div>

                  {dodges > 0 && dodges < DODGES.length && (
                    <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-white/30">
                      HINT — IT CANNOT RUN FROM A KEYBOARD. TRY TAB.
                    </p>
                  )}
                </div>
              )}

              {/* ——— obstacle 2: newsletter ——— */}
              {stage === 1 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-5">
                  <div className="relative w-full max-w-sm rounded-xl border border-white/10 bg-[#141416] px-6 py-7 text-center">
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => {
                        bump();
                        sin("Found the close button. Genuinely impressive.");
                        next();
                      }}
                      className="absolute right-2 top-2 text-[7px] leading-none text-white/20 transition-colors hover:text-white"
                    >
                      ✕
                    </button>

                    <p className="font-display text-xl font-bold">
                      WAIT! Don&apos;t go!
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-white/55">
                      Join 12,000 readers who also could not find the close
                      button. One email a week. Sometimes four. Rarely nine.
                    </p>

                    <div className="mt-5 flex gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        aria-label="Email address"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          bump();
                          sin("Subscribed. One of them is in German.");
                          next();
                        }}
                        className="rounded-lg bg-accent px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] text-ink"
                      >
                        JOIN
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        bump();
                        sin("Declined a discount. Felt briefly powerful.");
                        next();
                      }}
                      className="mt-4 text-[10px] text-white/25 underline underline-offset-4 transition-colors hover:text-white/50"
                    >
                      No thanks, I enjoy paying full price
                    </button>
                  </div>
                </div>
              )}

              {/* ——— obstacle 3: notifications ——— */}
              {stage === 2 && (
                <div className="absolute inset-x-0 top-0 flex justify-start px-4 pt-4">
                  <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1b1b1e] px-5 py-4 shadow-2xl">
                    <p className="text-xs leading-relaxed text-white/80">
                      {asks === 0 &&
                        "totallynormal.site wants to show notifications"}
                      {asks === 1 &&
                        "Are you sure? It is only about forty a day."}
                      {asks === 2 &&
                        "totallynormal.site would REALLY like to show notifications"}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          bump();
                          if (asks < 2) {
                            setAsks((a) => a + 1);
                            return;
                          }
                          sin("Blocked notifications three times. Held firm.");
                          next();
                        }}
                        className="rounded-lg border border-white/15 px-4 py-2 font-mono text-[10px] tracking-[0.15em] text-white/70 transition-colors hover:border-white/40 hover:text-white"
                      >
                        BLOCK
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          bump();
                          sin("Allowed notifications. Bold. Forty a day.");
                          next();
                        }}
                        className="rounded-lg bg-accent px-4 py-2 font-mono text-[10px] font-bold tracking-[0.15em] text-ink"
                      >
                        ALLOW
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ——— obstacle 4: captcha ——— */}
              {stage === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-5">
                  <div className="w-full max-w-xs rounded-xl border border-white/10 bg-[#141416] p-4">
                    <p className="text-xs leading-relaxed text-white/80">
                      {CAPTCHA_PROMPTS[attempt]}
                    </p>
                    {attempt === 1 && (
                      <p className="mt-1.5 font-mono text-[10px] tracking-[0.15em] text-accent">
                        THAT WAS CORRECT. ONE MORE, TO BE SURE.
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {TILES.map((tile, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-pressed={picked.includes(i)}
                          aria-label={`Square ${i + 1}`}
                          onClick={() => toggleTile(i)}
                          className={`flex aspect-square items-center justify-center rounded-md border text-xl transition-colors ${
                            picked.includes(i)
                              ? "border-accent bg-accent/20"
                              : "border-white/10 bg-white/5 hover:border-white/30"
                          }`}
                        >
                          <span aria-hidden="true">{tile}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={verifyCaptcha}
                      className="mt-3 w-full rounded-lg bg-accent py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] text-ink"
                    >
                      VERIFY
                    </button>
                  </div>
                </div>
              )}

              {/* ——— obstacle 5: the password ——— */}
              {stage === 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-5">
                  <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#141416] px-6 py-6">
                    <p className="font-display text-lg font-bold">
                      Create a password
                    </p>
                    <p className="mt-1.5 text-xs text-white/50">
                      Last step. We promise. We are lying.
                    </p>

                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => onPassword(e.target.value)}
                        aria-label="Password"
                        placeholder="something you will forget"
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          bump();
                          onPassword(`${password}🙂`);
                        }}
                        aria-label="Insert an emoji"
                        className="rounded-lg border border-white/15 px-3 text-sm transition-colors hover:border-white/40"
                      >
                        🙂
                      </button>
                    </div>

                    <ul className="mt-4 space-y-1.5">
                      {RULES.slice(0, revealed).map((rule) => {
                        const ok = rule.test(password);
                        return (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-2 font-mono text-[10px] tracking-wide ${
                              ok ? "text-accent" : "text-white/40"
                            }`}
                          >
                            <span aria-hidden="true">{ok ? "✓" : "○"}</span>
                            {rule.label}
                            {rule.label.startsWith("Length") && (
                              <span className="text-white/25">
                                (currently {glyphs(password)})
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      type="button"
                      disabled={!passwordDone}
                      onClick={() => {
                        bump();
                        sin("Set a password. It expires in 30 days.");
                        next();
                      }}
                      className="mt-5 w-full rounded-lg bg-accent py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] text-ink transition-opacity disabled:opacity-25"
                    >
                      {passwordDone ? "SET PASSWORD" : "KEEP TRYING"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* the receipt */}
          {escaped ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/3 px-6 py-6">
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/40">
                YOU MADE IT — {clicks} CLICKS
              </p>
              <p className="mt-4 font-display text-xl font-bold leading-snug sm:text-2xl">
                Congratulations. You have reached the content
                <span className="text-accent">.</span> It was a listicle.
              </p>

              <ul className="mt-5 space-y-1.5 text-sm text-white/55">
                {sins.length === 0 ? (
                  <li>
                    Somehow, not a single concession. You are stronger than the
                    internet.
                  </li>
                ) : (
                  sins.map((s) => (
                    <li key={s} className="flex gap-3">
                      <span aria-hidden="true" className="text-white/25">
                        —
                      </span>
                      {s}
                    </li>
                  ))
                )}
              </ul>

              <p className="mt-7 max-w-xl text-sm leading-relaxed text-white/70">
                This portfolio has no cookie banner, no newsletter modal, no
                &ldquo;continue in app&rdquo;. You scrolled, and things
                appeared. That is not a missing feature — that is the whole
                job.
              </p>

              <button
                type="button"
                onClick={restart}
                className="mt-6 font-mono text-[11px] tracking-[0.2em] text-white/45 underline underline-offset-4 transition-colors hover:text-accent"
              >
                ↺ SUFFER AGAIN
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStage(TOTAL_STAGES);
                sin("Rage quit. Honestly, the correct call.");
              }}
              className="mt-4 font-mono text-[10px] tracking-[0.2em] text-white/30 underline underline-offset-4 transition-colors hover:text-white/60"
            >
              SKIP — I LIVE THIS EVERY DAY
            </button>
          )}
        </Reveal>
      </div>
    </section>
  );
}
