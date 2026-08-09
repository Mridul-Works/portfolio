import GuideCursor from "./GuideCursor";
import Magnetic from "./Magnetic";
import MarqueeBand from "./MarqueeBand";
import Sparkle from "./Sparkle";
import Stardust from "./Stardust";

// same brief as the hire section — teams land here ready to talk,
// the email arrives pre-filled with the questions that scope a role
const MAILTO = `mailto:Mridul2431@gmail.com?subject=${encodeURIComponent(
  "Opportunity — let's talk"
)}&body=${encodeURIComponent(
  `Company / team:\n\nThe role:\n\nYour stack:\n\nWhat I'd build first:\n\nNext step (call / task / coffee):\n`
)}`;

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative z-10 -mt-11 overflow-hidden rounded-t-[2.5rem] bg-cobalt text-white sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={16} seed={47} className="text-[#cfd8ea]" />

      <div className="relative pt-14 text-white/90 sm:pt-20">
        <MarqueeBand text="LET'S MAKE SOMETHING UNFORGETTABLE " />
      </div>

      <div className="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* the ghost cursor — can't stop drifting into the button */}
        <GuideCursor targetId="contact-cta" />
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-[10px] tracking-[0.25em] text-white/70">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          OPEN TO WORK — AVAILABLE NOW
        </p>

        <p className="mt-6 font-mono text-[11px] tracking-[0.3em] text-white/60">
          GOT A TEAM? — I&apos;D LIKE TO JOIN IT
        </p>

        <h2 className="relative mt-10 font-display font-bold uppercase leading-[0.95] tracking-tight">
          <Sparkle className="-top-6 left-[8%] h-6 w-6 sm:h-8 sm:w-8" delay={0.4} />
          <Sparkle className="right-[4%] top-[38%] h-4 w-4 sm:h-6 sm:w-6" delay={1.7} />
          <Sparkle className="-bottom-4 left-[30%] h-5 w-5 sm:h-7 sm:w-7" delay={2.9} />
          <span className="chrome-text block text-[clamp(3rem,10vw,8.5rem)]">
            Contact
          </span>
          <span className="chrome-text mt-[0.05em] block text-[clamp(3rem,10vw,8.5rem)]">
            Me
          </span>
        </h2>

        <Magnetic strength={0.25} className="mt-12">
          <a
            id="contact-cta"
            href={MAILTO}
            className="inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-mono text-xs font-bold tracking-[0.15em] text-ink shadow-[0_10px_30px_-10px_rgba(217,255,61,0.7)] transition-transform duration-300 hover:scale-[1.03]"
          >
            GET IN TOUCH
            <span aria-hidden="true">→</span>
          </a>
        </Magnetic>

        <a
          href="mailto:Mridul2431@gmail.com"
          className="group mt-8 inline-flex items-center gap-3 text-base text-white/70 transition-colors hover:text-white sm:text-xl"
        >
          <span className="border-b border-white/25 pb-1 transition-colors group-hover:border-accent">
            Mridul2431@gmail.com
          </span>
          <span className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
            ↗
          </span>
        </a>

        <div className="mt-14 flex items-center gap-8 font-mono text-xs tracking-[0.2em] text-white/55">
          <a
            href="https://github.com/Mridul-Works"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            GITHUB
          </a>
          <a
            href="https://www.linkedin.com/in/mridul-devat"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            LINKEDIN
          </a>
        </div>
      </div>

      <footer className="border-t border-white/10 px-6 py-6 font-mono text-[10px] tracking-[0.2em] text-white/45">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p>© 2026 MRIDUL</p>
          <p className="hidden sm:block">DESIGNED & BUILT WITH NEXT.JS + THREE.JS</p>
          <p>INDIA</p>
        </div>
      </footer>
    </section>
  );
}
