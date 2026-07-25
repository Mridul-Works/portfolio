import Estimator from "./Estimator";
import Magnetic from "./Magnetic";
import Reveal from "./Reveal";
import Stardust from "./Stardust";

/**
 * The close: prices in the open, a slot counter that renders from a real
 * number, and an FAQ that answers the questions people are too polite to
 * ask on a call. Everything a serious client needs to say yes — nothing
 * a tyre-kicker can waste an afternoon on.
 */

// update SLOTS_TAKEN as projects get booked — keep this number honest
const SLOTS_TOTAL = 10;
const SLOTS_TAKEN = 0;

const OFFERS = [
  {
    n: "01",
    name: "The Landing Page",
    price: "FROM ₹50K",
    time: "1–2 WEEKS",
    pitch: "One page that makes people stop scrolling and start reading.",
    includes: [
      "Design + build, no handoffs",
      "Motion baked in, not bolted on",
      "Lighthouse 95+, actually",
      "Copy polish included",
    ],
    tag: null,
  },
  {
    n: "02",
    name: "The Full Site",
    price: "FROM ₹1.5L",
    time: "3–6 WEEKS",
    pitch: "Multi-page site or product front-end. CMS, forms, the works.",
    includes: [
      "Everything in 01",
      "CMS your team can't break",
      "Analytics that respect people",
      "A design system, documented",
    ],
    tag: "MOST BOOKED",
  },
  {
    n: "03",
    name: "The Showpiece",
    price: "FROM ₹3L",
    time: "SCOPED PER DREAM",
    pitch: "Three.js / WebGL experience — like this site, but it's yours.",
    includes: [
      "3D / particles / shaders",
      "Runs on phones, not just demos",
      "Falls back gracefully",
      "People will screenshot it",
    ],
    tag: "THE FUN ONE",
  },
];

const FAQ = [
  {
    q: "Why does it start at ₹50K when templates cost ₹5K?",
    a: "The template also costs you every client who's seen it on three other sites. You're not paying for pages — you're paying to be unmistakable. One extra project won from your website covers the difference; the rest is profit, forever.",
  },
  {
    q: "How exact is the quote?",
    a: "Exact. You get one fixed number in writing within 48 hours of the call, and it changes only if you change the scope. If I estimated wrong, that's my problem — that's the point of a fixed quote.",
  },
  {
    q: "Who owns everything when we're done?",
    a: "You do. Code, design files, domain, analytics, CMS — transferred on launch day. No hostage situations, no 'contact your developer to change a comma'.",
  },
  {
    q: "What if I hate the first version?",
    a: "You'll never meet a 'first version' six weeks in — you see a clickable demo every Friday from week one, so course corrections cost days, not budgets. Nothing has a chance to go quietly wrong.",
  },
  {
    q: "What happens after launch?",
    a: "Thirty days of fixes are free. After that, care plans start at ₹15K/month — updates, uptime, small changes, and no panic when something needs to ship on a Sunday.",
  },
];

const MAILTO = `mailto:hello@mridul.dev?subject=${encodeURIComponent(
  "New project — let's scope it"
)}&body=${encodeURIComponent(
  `What I'm building:\n\nWho it's for:\n\nDeadline (if any):\n\nBudget ballpark (rough is fine):\n\nAnything existing (links welcome):\n`
)}`;

export default function Invest() {
  const open = SLOTS_TOTAL - SLOTS_TAKEN;

  return (
    <section
      id="invest"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt-deep text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={14} seed={31} className="text-[#cfd8ea]" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/60">
            INVESTMENT — PRICES IN THE OPEN, LIKE ADULTS
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Taste is the only thing
            <br />I don&apos;t charge extra for
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Three ways to work together. Every number below is a floor, not a
            trap — your exact fixed quote arrives 48 hours after a 20-minute
            call, and it doesn&apos;t change unless the scope does.
          </p>
        </Reveal>

        {/* the slot counter — rendered from a real number, kept honest */}
        <Reveal delay={60} className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4">
            <p className="font-mono text-[11px] tracking-[0.2em] text-white">
              THIS MONTH — {open} OF {SLOTS_TOTAL} CLIENT SLOTS OPEN
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: SLOTS_TOTAL }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-5 rounded-full ${
                    i < SLOTS_TAKEN ? "bg-white/25" : "bg-accent"
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>

        {/* the offers */}
        <Reveal delay={100} className="mt-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {OFFERS.map((offer) => (
              <div
                key={offer.n}
                className="group relative flex flex-col rounded-2xl border border-white/15 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/60 hover:bg-white/10 hover:shadow-[0_18px_40px_-18px_rgba(0,0,20,0.8)]"
              >
                {offer.tag && (
                  <span
                    className={`absolute -top-2.5 right-5 rounded-full px-3 py-1 font-mono text-[8px] tracking-[0.2em] ${
                      offer.tag === "MOST BOOKED"
                        ? "bg-accent text-ink"
                        : "bg-white text-ink"
                    }`}
                  >
                    {offer.tag}
                  </span>
                )}
                <p className="font-mono text-[10px] tracking-[0.25em] text-white/50">
                  {offer.n} — {offer.time}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {offer.name}
                </h3>
                <p className="mt-1.5 font-mono text-sm font-bold tracking-widest text-accent">
                  {offer.price}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {offer.pitch}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-white/10 pt-5">
                  {offer.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-white/80"
                    >
                      <span className="mt-0.5 font-mono text-[10px] text-accent">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-[0.15em] text-white/50">
            AFTER LAUNCH — CARE PLANS FROM ₹15K/MO. UPDATES, UPTIME, AND NO
            PANIC ON SUNDAYS.
          </p>
        </Reveal>

        {/* the five-second ballpark */}
        <Reveal delay={120} className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/60">
            TOO EARLY FOR A CALL? — GET A BALLPARK IN FIVE SECONDS
          </p>
          <div className="mt-5">
            <Estimator />
          </div>
        </Reveal>

        {/* the questions people are too polite to ask */}
        <Reveal delay={140} className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/60">
            ASKED QUIETLY, ANSWERED LOUDLY
          </p>
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            {FAQ.map((item) => (
              <details key={item.q} className="group border-b border-white/10 last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-display text-base font-bold tracking-tight transition-colors hover:bg-white/5 sm:text-lg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 font-mono text-sm text-accent transition-transform duration-300 group-open:rotate-45"
                  >
                    ＋
                  </span>
                </summary>
                <p className="px-6 pb-6 max-w-2xl text-sm leading-relaxed text-white/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>

        {/* the close */}
        <Reveal delay={180} className="mt-16">
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-white/15 bg-white/5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                The 20-minute call costs nothing.
              </p>
              <p className="mt-1.5 text-sm text-white/60">
                Worst case: you leave with a fixed quote and a free second
                opinion on your current site.
              </p>
            </div>
            <Magnetic strength={0.25} className="shrink-0">
              <a
                href={MAILTO}
                className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-mono text-xs font-bold tracking-[0.15em] text-ink shadow-[0_10px_30px_-10px_rgba(217,255,61,0.7)] transition-transform duration-300 hover:scale-[1.03]"
              >
                START A PROJECT
                <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
