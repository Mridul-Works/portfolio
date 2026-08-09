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

// the reference letters: written as drafts mid-edit — strikethroughs show
// weaker words losing to the true ones, highlighter marks the upgrades.
// Swap wording with the real people's blessing before this goes live.
function Strike({ children }: { children: React.ReactNode }) {
  return (
    <s className="mx-0.5 text-zinc-400 decoration-zinc-400/80 decoration-1">
      {children}
    </s>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded-sm bg-accent/80 px-1 text-ink">{children}</mark>
  );
}

const DRAFTS = [
  {
    to: "Whoever hires Mridul next",
    from: "Marketing Team — Masters' Union",
    subject: "re: reference (honest version)",
    saved: "6:41 PM",
    tilt: "lg:-rotate-1",
    body: (
      <>
        <p>To whoever gets to work with him next,</p>
        <p className="mt-4">
          Mridul built our campaign pages <Strike>on time</Strike>{" "}
          <Mark>before the ads went live</Mark>. Every single time.
        </p>
        <p className="mt-4">
          We&apos;d keep him if we could
          <Strike>, so we&apos;re not sending this</Strike>.
        </p>
      </>
    ),
  },
  {
    to: "Whoever's asking about him",
    from: "Campaign Lead — Masters' Union",
    subject: "re: is he any good?",
    saved: "7:12 AM",
    tilt: "lg:rotate-1",
    body: (
      <>
        <p>Short answer —</p>
        <p className="mt-4">
          Brief him at 6pm and it&apos;s live by morning, looking like a{" "}
          <Strike>decent</Strike> <Strike>good</Strike>{" "}
          <Mark>full design team</Mark> spent a week on it.
        </p>
        <p className="mt-4">
          Hire him <Strike>if you must</Strike>{" "}
          <Mark>before someone else does</Mark>
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-cobalt align-middle motion-reduce:animate-none"
          />
        </p>
      </>
    ),
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

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-32">
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
            BORROWED VOICES — REFERENCE LETTERS, STILL IN DRAFTS
          </p>

          {/* two compose windows on the desk — caught mid-edit, honesty
              winning each pass. Paper-white so they read as real drafts. */}
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            {DRAFTS.map((draft) => (
              <div
                key={draft.subject}
                className={`overflow-hidden rounded-xl bg-paper text-zinc-800 shadow-[0_24px_60px_-24px_rgba(4,6,60,0.9)] transition-transform duration-500 hover:rotate-0 ${draft.tilt}`}
              >
                {/* gmail-style title bar */}
                <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5">
                  <p className="font-mono text-[10px] tracking-[0.15em] text-white/80">
                    NEW MESSAGE — DRAFT
                  </p>
                  <p
                    aria-hidden="true"
                    className="font-mono text-xs tracking-widest text-white/50"
                  >
                    — ✕
                  </p>
                </div>

                {/* address fields */}
                <div className="px-5 pt-3 font-mono text-[10px] tracking-[0.12em]">
                  <p className="border-b border-zinc-200 py-2 text-zinc-400">
                    To: <span className="text-zinc-700">{draft.to}</span>
                  </p>
                  <p className="border-b border-zinc-200 py-2 text-zinc-400">
                    From: <span className="text-zinc-700">{draft.from}</span>
                  </p>
                  <p className="border-b border-zinc-200 py-2 text-zinc-400">
                    Subject:{" "}
                    <span className="font-bold text-zinc-800">{draft.subject}</span>
                  </p>
                </div>

                {/* the letter, mid-edit */}
                <div className="px-5 py-5 text-[15px] leading-relaxed text-zinc-700">
                  {draft.body}
                </div>

                {/* footer — the send button nobody presses */}
                <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5">
                  <span className="rounded-full bg-cobalt px-5 py-2 font-mono text-[10px] font-bold tracking-[0.15em] text-white opacity-90">
                    SEND
                  </span>
                  <p className="font-mono text-[9px] tracking-[0.15em] text-zinc-400">
                    SAVED {draft.saved} · NEVER SENT, ALWAYS TRUE
                  </p>
                </div>
              </div>
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
