"use client";

import { useState } from "react";
import Magnetic from "./Magnetic";
import Reveal from "./Reveal";
import Sparkle from "./Sparkle";

/**
 * The conversion section: after seven sections of toys, this one flips
 * (mostly) serious — offers, process, proof, and a fit-check that
 * unlocks the CTA. Playful shell, dead-serious pitch.
 */

const STATS = [
  { label: "FIRST REPLY", value: "< 24 HRS" },
  { label: "FIXED QUOTE", value: "48 HRS AFTER CALL" },
  { label: "PROGRESS", value: "DEMO EVERY WEEK" },
  { label: "AFTER LAUNCH", value: "30 DAYS OF FIXES, FREE" },
];

const OFFERS = [
  {
    n: "01",
    name: "The Landing Page",
    pitch: "One page that makes people stop scrolling and start reading.",
    time: "1–2 WEEKS",
    includes: ["Design + build, no handoffs", "Motion baked in, not bolted on", "Lighthouse 95+, actually", "Copy polish included"],
    tag: null,
  },
  {
    n: "02",
    name: "The Full Site",
    pitch: "Multi-page site or product front-end. CMS, forms, the works.",
    time: "3–6 WEEKS",
    includes: ["Everything in 01", "CMS your team can't break", "Analytics that respect people", "A design system, documented"],
    tag: "MOST BOOKED",
  },
  {
    n: "03",
    name: "The Showpiece",
    pitch: "Three.js / WebGL experience — like this site, but it's yours.",
    time: "SCOPED PER DREAM",
    includes: ["3D / particles / shaders", "Runs on phones, not just demos", "Falls back gracefully", "People will screenshot it"],
    tag: "THE FUN ONE",
  },
];

const STEPS = [
  { n: "01", name: "CALL", detail: "20 minutes. You talk, I ask annoying questions." },
  { n: "02", name: "SCOPE", detail: "Fixed quote in 48h. No hourly mystery meat." },
  { n: "03", name: "BUILD", detail: "A clickable demo every week. You always know." },
  { n: "04", name: "SHIP", detail: "Launch day + 30 days of fixes on me." },
];

const QUOTES = [
  "NOVA MARKETS — “traders stopped complaining about the dashboard. that's five stars here.”",
  "AURORA — “four minutes average on a shoe. he warned us. we didn't believe him.”",
  "PAPERTRAIL — “our blog loads before the coffee order is done. we timed it.”",
  "ORBIT UI — “the buttons agree with each other now. the team, almost.”",
];

const FIT_CHECKS = [
  "I want a website people screenshot and send to their friends",
  "I have something real — a product, a story, a reason to exist",
  "I can look at a weekly demo and reply within a few days",
  "My nephew will not be the art director",
];

const MAILTO = `mailto:hello@mridul.dev?subject=${encodeURIComponent(
  "New project — let's scope it"
)}&body=${encodeURIComponent(
  `What I'm building:\n\nWho it's for:\n\nDeadline (if any):\n\nBudget ballpark (rough is fine):\n\nAnything existing (links welcome):\n`
)}`;

export default function Hire() {
  const [checked, setChecked] = useState<boolean[]>(
    FIT_CHECKS.map(() => false)
  );
  const fit = checked.filter(Boolean).length;
  const allFit = fit === FIT_CHECKS.length;

  return (
    <section
      id="hire"
      className="relative z-10 rounded-t-[2.5rem] bg-paper text-zinc-900 sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
            FOR CLIENTS — THE SERIOUS SECTION (MOSTLY)
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            You&apos;ve seen the toys.
            <br />
            Here&apos;s how we build{" "}
            <span className="font-script italic text-accent-deep">yours</span>.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Everything above was me showing off. This part is for you: what I
            build, how long it takes, and what working together actually feels
            like. No discovery-phase fog, no surprise invoices — I run projects
            the way I animate springs: with damping.
          </p>
        </Reveal>

        {/* trust stats */}
        <Reveal delay={80} className="mt-12">
          <div className="grid grid-cols-2 gap-3 font-mono sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <p className="text-[9px] tracking-[0.2em] text-zinc-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm leading-snug">{stat.value}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* the offers */}
        <Reveal delay={120} className="mt-14">
          <div className="grid gap-4 lg:grid-cols-3">
            {OFFERS.map((offer) => (
              <div
                key={offer.n}
                className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-900 hover:shadow-[0_18px_40px_-18px_rgba(5,5,5,0.35)]"
              >
                {offer.tag && (
                  <span
                    className={`absolute -top-2.5 right-5 rounded-full px-3 py-1 font-mono text-[8px] tracking-[0.2em] ${
                      offer.tag === "MOST BOOKED"
                        ? "bg-zinc-900 text-accent"
                        : "bg-accent text-ink"
                    }`}
                  >
                    {offer.tag}
                  </span>
                )}
                <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-400">
                  {offer.n} — {offer.time}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {offer.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {offer.pitch}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-zinc-100 pt-5">
                  {offer.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-zinc-700"
                    >
                      <span className="mt-0.5 font-mono text-[10px] text-accent-deep">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-zinc-400">
            YES, PRICES EXIST — YOU GET A FIXED QUOTE 48 HOURS AFTER THE CALL.
            IT DOESN&apos;T CHANGE UNLESS THE SCOPE DOES.
          </p>
        </Reveal>

        {/* the process */}
        <Reveal delay={140} className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
            THE WHOLE PROCESS — NO FOG
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-5 hidden font-mono text-xs text-zinc-300 sm:block"
                  >
                    →
                  </span>
                )}
                <div className="h-full rounded-xl border border-zinc-200 bg-white px-4 py-4 transition-colors hover:border-accent-deep">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">
                    {step.n}
                  </p>
                  <p className="mt-1.5 font-display text-sm font-bold tracking-tight">
                    {step.name}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* the marquee of (fictional) praise */}
        <Reveal delay={160} className="mt-16">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white py-3">
            <div className="fb-marquee flex w-max whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-zinc-500">
              {[...QUOTES, ...QUOTES].map((quote, i) => (
                <span key={i} className="px-6">
                  ★ {quote}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 font-mono text-[9px] tracking-[0.15em] text-zinc-400">
            (CLIENTS FICTIONAL. THE WORK ETHIC ISN&apos;T.)
          </p>
        </Reveal>

        {/* the fit check → CTA */}
        <Reveal delay={180} className="mt-16">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
                THE FIT CHECK
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-zinc-400">
                {fit} / {FIT_CHECKS.length}
              </p>
            </div>

            <div className="grid gap-1 px-3 py-3 sm:grid-cols-2">
              {FIT_CHECKS.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={checked[i]}
                  onClick={() =>
                    setChecked((prev) =>
                      prev.map((v, j) => (j === i ? !v : v))
                    )
                  }
                  className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left text-sm leading-snug transition-colors ${
                    checked[i]
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[9px] transition-colors ${
                      checked[i]
                        ? "border-accent bg-accent text-ink"
                        : "border-zinc-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  {item}
                </button>
              ))}
            </div>

            <div className="relative flex flex-col items-start gap-4 border-t border-zinc-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              {allFit && (
                <>
                  <Sparkle className="left-4 top-2 h-4 w-4" delay={0.1} />
                  <Sparkle className="right-8 top-3 h-5 w-5" delay={1.2} />
                </>
              )}
              <p className="max-w-xs font-mono text-[10px] leading-relaxed tracking-[0.15em] text-zinc-500">
                {allFit
                  ? "ALL FOUR. WE'RE GOING TO GET ALONG DANGEROUSLY WELL."
                  : "TICK WHAT'S TRUE. HONESTY NOW SAVES EMAILS LATER."}
              </p>
              <Magnetic strength={0.25}>
                <a
                  href={MAILTO}
                  className={`inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-mono text-xs font-bold tracking-[0.15em] transition-all duration-300 ${
                    allFit
                      ? "bg-accent text-ink shadow-[0_10px_30px_-10px_rgba(157,184,0,0.8)]"
                      : "bg-zinc-900 text-white"
                  }`}
                >
                  {allFit ? "BOOK THE 20-MIN CALL" : "TALK ANYWAY"}
                  <span aria-hidden="true">→</span>
                </a>
              </Magnetic>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            The button opens an email with the five questions I&apos;ll ask
            anyway — fill in what you know, skip what you don&apos;t. Allergic
            to email? The next section has eyes and they&apos;re already
            looking at you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
