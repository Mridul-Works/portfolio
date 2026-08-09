import Reveal from "./Reveal";
import Stardust from "./Stardust";

/**
 * The factual skeleton: dates, role, and borrowed voices. The rest of
 * the site performs — this section just states the record, so a recruiter
 * never has to ask "so… how much experience?". Facts first, then the
 * people I ship for saying it in their own words.
 */

const TIMELINE = [
  {
    when: "JUN 2025 — NOW",
    role: "Frontend Developer — Masters' Union",
    detail:
      "Program and campaign pages for one of India's most ambitious business schools. Briefed tight, pointed at paid ad traffic, live on deadline — across mastersunion.org and masterscamp.org.",
  },
  // add earlier roles or education here, newest first:
  // { when: "…", role: "…", detail: "…" },
];

// drafts — swap in the real people's own words before this goes live
const VOICES = [
  {
    quote:
      "The ads go live on schedule whether the page exists or not. With Mridul, the page always exists  and it's usually the part of the campaign people compliment.",
    who: "MARKETING TEAM — MASTERS' UNION",
  },
  {
    quote:
      "Brief him at 6pm and it's live by morning, looking like a design team spent a week on it.",
    who: "CAMPAIGN LEAD — MASTERS' UNION",
  },
];

export default function Record() {
  return (
    <section
      id="record"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={10} seed={41} className="text-[#cfd8ea]" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/60">
            THE RECORD — FOR THE SKIMMERS
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Facts first.
            <br />
            <span className="text-white/50">Flair you&apos;ve already seen.</span>
          </h2>
        </Reveal>

        {/* the timeline — dates a recruiter never has to ask for */}
        <Reveal delay={80} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            {TIMELINE.map((row) => (
              <div
                key={row.when}
                className="flex flex-col gap-2 border-b border-white/10 px-6 py-6 last:border-b-0 sm:flex-row sm:gap-10 sm:px-8"
              >
                <p className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-accent sm:w-40 sm:pt-1">
                  {row.when}
                </p>
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                    {row.role}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/70">
                    {row.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* borrowed voices — other people saying it */}
        <Reveal delay={140} className="mt-14">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/60">
            BORROWED VOICES — THE PEOPLE I SHIP FOR
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {VOICES.map((v) => (
              <figure
                key={v.who}
                className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-7"
              >
                <blockquote className="text-sm leading-relaxed text-white/85 sm:text-base">
                  <span
                    aria-hidden="true"
                    className="font-script block text-3xl italic leading-none text-accent"
                  >
                    &ldquo;
                  </span>
                  {v.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-white/10 pt-4 font-mono text-[9px] tracking-[0.25em] text-white/50">
                  {v.who}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 font-mono text-[9px] tracking-[0.15em] text-white/45">
            REFERENCES WITH NAMES AND NUMBERS — AVAILABLE THE MOMENT YOU ASK.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
