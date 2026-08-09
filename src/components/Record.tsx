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

// the reference letter: written as a draft mid-edit — strikethroughs show
// weaker words being upgraded to the true ones. Swap wording with the real
// person's blessing before this goes live.
function Strike({ children }: { children: React.ReactNode }) {
  return (
    <s className="mx-0.5 text-white/30 decoration-white/40 decoration-1">
      {children}
    </s>
  );
}

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
            BORROWED VOICES — A REFERENCE LETTER, STILL IN DRAFTS
          </p>

          {/* the compose window — caught mid-edit, honesty winning each pass */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[10px] tracking-[0.15em] text-white/50">
                NEW MESSAGE — DRAFT
              </p>
              <p className="font-mono text-[9px] tracking-[0.15em] text-white/35">
                AUTOSAVED 6:41 PM
              </p>
            </div>

            <div className="border-b border-white/10 px-5 py-3 font-mono text-[10px] tracking-[0.15em] text-white/45 sm:px-6">
              <p>
                TO: <span className="text-white/70">WHOEVER HIRES MRIDUL NEXT</span>
              </p>
              <p className="mt-1.5">
                FROM:{" "}
                <span className="text-white/70">
                  MARKETING TEAM — MASTERS&apos; UNION
                </span>
              </p>
              <p className="mt-1.5">
                SUBJECT: <span className="text-accent">re: reference (honest version)</span>
              </p>
            </div>

            <div className="max-w-2xl px-5 py-6 text-[15px] leading-loose text-white/85 sm:px-6 sm:text-base">
              <p>To whoever gets to work with him next,</p>
              <p className="">
                Mridul built our campaign pages{" "}
                <Strike>on time</Strike>{" "}
                <span className="text-accent">before the ads went live</span>.
                Every single time.
              </p>
              <p className="">
                Brief him at 6pm and it&apos;s live by morning, looking like a{" "}
                <Strike>decent</Strike> <Strike>good</Strike>{" "}
                <span className="text-accent">full design team</span> spent a
                week on it.
              </p>
              <p className="">
                We&apos;d keep him if we could
                <Strike>, so we&apos;re not sending this</Strike>
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-accent align-middle motion-reduce:animate-none"
                />
              </p>
            </div>
          </div>
          <p className="mt-4 font-mono text-[9px] tracking-[0.15em] text-white/45">
            REFERENCES WITH NAMES AND NUMBERS — AVAILABLE THE MOMENT YOU ASK.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
