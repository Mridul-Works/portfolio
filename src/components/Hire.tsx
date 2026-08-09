import Eyes from "./Eyes";
import Magnetic from "./Magnetic";
import Reveal from "./Reveal";
import Stardust from "./Stardust";

/**
 * The close: what hiring me actually gets a team, an availability status
 * kept honest, and an FAQ that answers the questions recruiters are too
 * polite to ask on a first call. Everything a serious team needs to say
 * yes — nothing that wastes anyone's afternoon.
 */

const ROLES = [
  {
    n: "01",
    name: "The Creative Engineer",
    focus: "THREE.JS / WEBGL / MOTION",
    pitch:
      "The hero of this site is 34,000 particles of liquid chrome. I build the parts of the product people screenshot.",
    includes: [
      "Three.js, shaders, particles",
      "Motion baked in, not bolted on",
      "Runs on phones, not just demos",
      "Falls back gracefully",
    ],
    tag: null,
  },
  {
    n: "02",
    name: "The Frontend Engineer",
    focus: "REACT / NEXT.JS / TYPESCRIPT",
    pitch:
      "The unglamorous 90% — components, state, data, performance — shipped fast and built to be maintained.",
    includes: [
      "React 19 + Next.js, in production",
      "TypeScript, strictly",
      "Lighthouse 95+, actually",
      "PRs small enough to review",
    ],
    tag: "THE DAY JOB",
  },
  {
    n: "03",
    name: "The Design-Minded Dev",
    focus: "TYPOGRAPHY / SYSTEMS / A11Y",
    pitch:
      "I notice a bad typeface from across the room. Your designers get a developer who speaks their language.",
    includes: [
      "Design systems, documented",
      "Pixel-faithful implementation",
      "Accessibility as a habit",
      "Taste — see this entire site",
    ],
    tag: "RARE COMBO",
  },
];

const FAQ = [
  {
    q: "Designer or developer — which one are you?",
    a: "A developer with a designer's eye. Every pixel of this site — the design, the copy, the shaders, the code — is mine. On your team that means fewer handoffs, faster iterations, and mockups that survive contact with the browser.",
  },
  {
    q: "What's your core stack?",
    a: "React 19, Next.js, TypeScript and Tailwind for the day job; Three.js, WebGL and GLSL when the brief says 'make it unforgettable'. Comfortable with design tools too — I don't need a spec for every corner radius.",
  },
  {
    q: "Can you work inside an existing design system and team?",
    a: "Yes — and happily. A good system makes taste scalable. I've built tokenised design systems from scratch and worked inside ones I didn't create. Your conventions win over my preferences, every time.",
  },
  {
    q: "How do I know the polish isn't just this one site?",
    a: "Ask me to prove it. I'm happy to do a take-home task, a live pairing session, or a code walkthrough of anything in the work section — including every corner of this site.",
  },
  {
    q: "How soon can you start?",
    a: "Quickly — I'm available now. Remote, hybrid or on-site in India, and my timezone overlaps generously with most teams. The fastest way to find out is the 20-minute call below.",
  },
];

const MAILTO = `mailto:Mridul2431@gmail.com?subject=${encodeURIComponent(
  "Opportunity — let's talk"
)}&body=${encodeURIComponent(
  `Company / team:\n\nThe role:\n\nYour stack:\n\nWhat I'd build first:\n\nNext step (call / task / coffee):\n`
)}`;

export default function Hire() {
  return (
    <section
      id="hire"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt-deep text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={14} seed={31} className="text-[#cfd8ea]" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/60">
            HIRE ME — WHAT YOUR TEAM ACTUALLY GETS
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            One hire.
            <br />
            Three jobs quietly done
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Most teams hire a developer, then hire a motion person, then beg a
            designer to review the spacing. Below is what lands in your standup
            when all three arrive in one person.
          </p>
        </Reveal>

        {/* the availability line — rendered honest, updated when it changes */}
        <Reveal delay={60} className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4">
            <p className="font-mono text-[11px] tracking-[0.2em] text-white">
              STATUS — OPEN TO WORK · AVAILABLE NOW
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/60">
              REMOTE / HYBRID / ON-SITE · INDIA
            </p>
          </div>
        </Reveal>

        {/* the three hats */}
        <Reveal delay={100} className="mt-8">
          <div className="grid gap-4 lg:grid-cols-3">
            {ROLES.map((role) => (
              <div
                key={role.n}
                className="group relative flex flex-col rounded-2xl border border-white/15 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/60 hover:bg-white/10 hover:shadow-[0_18px_40px_-18px_rgba(0,0,20,0.8)]"
              >
                {role.tag && (
                  <span
                    className={`absolute -top-2.5 right-5 rounded-full px-3 py-1 font-mono text-[8px] tracking-[0.2em] ${
                      role.tag === "RARE COMBO"
                        ? "bg-accent text-ink"
                        : "bg-white text-ink"
                    }`}
                  >
                    {role.tag}
                  </span>
                )}
                <p className="font-mono text-[10px] tracking-[0.25em] text-white/50">
                  {role.n}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {role.name}
                </h3>
                <p className="mt-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-accent">
                  {role.focus}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {role.pitch}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2 border-t border-white/10 pt-5">
                  {role.includes.map((item) => (
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
            PROOF OF ALL THREE — YOU&apos;RE SCROLLING THROUGH IT. THIS SITE IS
            DESIGNED, WRITTEN AND BUILT BY ONE PERSON.
          </p>
        </Reveal>

        {/* the questions recruiters ask quietly */}
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
            <div className="flex items-center gap-5">
              {/* the eyes — watching you decide, blinking politely */}
              <Eyes className="shrink-0 text-4xl sm:text-5xl" />
              <div>
                <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  The 20-minute call costs nothing.
                </p>
                <p className="mt-1.5 text-sm text-white/60">
                  Worst case: you leave with a free second opinion on your
                  frontend and one fewer CV to read.
                </p>
              </div>
            </div>
            <Magnetic strength={0.25} className="shrink-0">
              <a
                href={MAILTO}
                className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-mono text-xs font-bold tracking-[0.15em] text-ink shadow-[0_10px_30px_-10px_rgba(217,255,61,0.7)] transition-transform duration-300 hover:scale-[1.03]"
              >
                GET IN TOUCH
                <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
