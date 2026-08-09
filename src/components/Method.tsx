import Reveal from "./Reveal";
import Stardust from "./Stardust";

/**
 * The working rhythm, laid out like a shipping schedule. Teams don't
 * fear a new hire's skills as much as they fear fog — so this section
 * removes every bit of it: what joining me up actually looks like,
 * week by week.
 */

const STEPS = [
  {
    when: "DAY 1",
    name: "The setup",
    detail:
      "Repo cloned, env running, docs read — and a first PR before I log off. Small, real, and reviewable. No week-one warmup theatre.",
  },
  {
    when: "WEEK 1",
    name: "The first demo",
    detail:
      "A real link the team can click — not a promise in a standup. Direction locks early, surprises die early.",
  },
  {
    when: "EVERY FRIDAY",
    name: "A new demo",
    detail:
      "Something showable, further along, before the weekend. The team always knows exactly where my work stands.",
  },
  {
    when: "EVERY PR",
    name: "The paper trail",
    detail:
      "Small diffs, honest descriptions, screenshots for anything visual. Review should be a pleasure, not archaeology.",
  },
  {
    when: "SHIP DAY",
    name: "The polish pass",
    detail:
      "Lighthouse run, motion checked on a mid-range phone, edge cases hunted. 'Works on my machine' is not a definition of done.",
  },
  {
    when: "AFTER",
    name: "The ownership",
    detail:
      "I stay with what I ship — monitoring, fixes, docs for the next person. Code isn't done when it merges; it's done when it's boring.",
  },
];

const INBOX = [
  {
    unread: true,
    subject: "Demo 04 — checkout flow on staging, tap it on your phone",
    time: "FRI 5:47 PM",
  },
  {
    unread: true,
    subject: "Demo 03 — motion pass done, the dashboard breathes now",
    time: "LAST FRI",
  },
  {
    unread: false,
    subject: "Demo 02 — first real screens (yes, already)",
    time: "2 FRIDAYS AGO",
  },
  {
    unread: false,
    subject: "Demo 01 — direction locked, here's the proof",
    time: "3 FRIDAYS AGO",
  },
];

const PROMISES = [
  "LIGHTHOUSE 95+ ON EVERY BUILD — RUN IT YOURSELF",
  "SUB-SECOND FIRST LOAD, TESTED ON A MID-RANGE PHONE",
  "60FPS MOTION — THIS SITE IS THE DEMO",
  "PRS SMALL ENOUGH TO ACTUALLY REVIEW",
  "A CLICKABLE DEMO FOR THE TEAM EVERY WEEK",
  "DOCS WRITTEN WITHOUT BEING ASKED",
];

export default function Method() {
  return (
    <section
      id="method"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={12} seed={23} className="text-[#cfd8ea]" />

      <div className="relative mx-auto max-w-4xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-white/60">
            METHOD — HOW THE SAUSAGE ISN&apos;T MADE
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            No fog. No &ldquo;big reveal&rdquo;.
            <br />
            <span className="chrome-text">Just Fridays.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            The most expensive part of a new hire is the fog — the weeks of
            wondering what they&apos;re actually doing. My working rhythm is
            built to make fog impossible. Here&apos;s what my first stretch on
            your team looks like.
          </p>
        </Reveal>

        <div className="mt-16 border-l border-white/20 pl-8 sm:pl-12">
          {STEPS.map((step, i) => (
            <Reveal key={step.when} delay={i * 70}>
              <div className="relative pb-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-8 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-cobalt bg-accent sm:-left-12"
                />
                <p className="font-mono text-[10px] tracking-[0.3em] text-accent">
                  {step.when}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {step.name}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/70">
                  {step.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* the inbox, simulated — what "every Friday" actually looks like */}
        <Reveal className="mt-16">
          <p className="font-mono text-[10px] tracking-[0.25em] text-white/60">
            YOUR TEAM&apos;S INBOX, SIX WEEKS IN
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 truncate font-mono text-[10px] text-white/40">
                inbox — team@yourcompany.com
              </span>
            </div>
            {INBOX.map((mail) => (
              <div
                key={mail.subject}
                className="flex items-center gap-4 border-b border-white/10 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/5"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    mail.unread ? "bg-accent" : "bg-white/15"
                  }`}
                />
                <p
                  className={`min-w-0 flex-1 truncate text-sm ${
                    mail.unread ? "text-white" : "text-white/50"
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-[0.15em] text-white/40">
                    MRIDUL —{" "}
                  </span>
                  {mail.subject}
                </p>
                <span className="shrink-0 font-mono text-[9px] tracking-[0.15em] text-white/35">
                  {mail.time}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-[9px] tracking-[0.15em] text-white/45">
            NOT PICTURED — THE &ldquo;SORRY FOR THE DELAY&rdquo; EMAIL. IT
            NEVER GETS WRITTEN.
          </p>
        </Reveal>

        <Reveal className="mt-16">
          <div className="overflow-hidden rounded-xl border border-white/15 bg-white/5 py-3">
            <div className="fb-marquee flex w-max whitespace-nowrap font-mono text-[10px] tracking-[0.2em] text-white/60">
              {[...PROMISES, ...PROMISES].map((promise, i) => (
                <span key={i} className="px-6">
                  ★ {promise}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 font-mono text-[9px] tracking-[0.15em] text-white/45">
            NOT ASPIRATIONS — HABITS. EVERY ONE IS RUNNING ON THIS VERY PAGE.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
