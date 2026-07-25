import CompareSlider from "./CompareSlider";
import Reveal from "./Reveal";
import Sparkle from "./Sparkle";
import Stardust from "./Stardust";

/**
 * The opening argument. Before showing anything, the site names exactly
 * who it's for — people whose taste outgrew their template — and states
 * the five beliefs every build here runs on. Editorial, unhurried,
 * zero features listed. Taste recognises taste.
 */

const AUDIENCE = [
  "DESIGN STUDIOS",
  "PHOTOGRAPHERS",
  "ARCHITECTS",
  "FASHION & BEAUTY",
  "GALLERIES",
  "FOUNDERS WITH TASTE",
];

const BELIEFS = [
  {
    n: "01",
    title: "Taste is a feature.",
    detail:
      "Not a garnish. The kerning, the pause before a fade, the white space — that's the product working.",
  },
  {
    n: "02",
    title: "Speed is respect.",
    detail:
      "A slow site tells your visitor their time is worth less than your JavaScript. Mine load before doubt does.",
  },
  {
    n: "03",
    title: "Motion is manners.",
    detail:
      "Nothing snaps, nothing jumps at you. Things arrive — the way a good host opens a door.",
  },
  {
    n: "04",
    title: "Templates are camouflage.",
    detail:
      "A template makes you look like everyone who bought it. You didn't build a distinctive brand to dress it in one.",
  },
  {
    n: "05",
    title: "A website is a salesperson.",
    detail:
      "The only one who works at 3am, never mumbles, and greets every client at their absolute best.",
  },
];

export default function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative z-10 rounded-t-[2.5rem] bg-paper text-zinc-900 sm:rounded-t-[3.5rem]"
    >
      <Stardust count={9} seed={5} className="text-zinc-300" />

      <div className="relative mx-auto max-w-3xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
            FIRST — WHO THIS IS FOR
          </p>
          <h2 className="relative mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            <Sparkle className="-top-5 right-[12%] h-6 w-6 text-cobalt sm:h-8 sm:w-8" delay={0.8} />
            Your work is beautiful.
            <br />
            <span className="text-zinc-500">
              Your website introduces it with a shrug.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            I build websites for people whose taste outgrew their template —
            the ones who notice a bad typeface from across the room and feel
            a slow page like a wet handshake. If that&apos;s you, keep
            scrolling. This whole site is the{" "}
            <span className="font-script text-[1.15em] italic text-cobalt">
              audition
            </span>
            .
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <div className="flex flex-wrap gap-2">
            {AUDIENCE.map((who) => (
              <span
                key={who}
                className="rounded-full border border-zinc-300 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-zinc-600 transition-colors hover:border-cobalt hover:bg-cobalt hover:text-white"
              >
                {who}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-20 sm:mt-24">
          <Reveal>
            <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
              FIVE BELIEFS — EVERY BUILD RUNS ON THEM
            </p>
          </Reveal>
          <div className="mt-6">
            {BELIEFS.map((belief, i) => (
              <Reveal key={belief.n} delay={i * 70}>
                <div className="group flex gap-6 border-t border-zinc-200 py-8 transition-colors last:border-b hover:bg-white sm:gap-10 sm:px-4">
                  <span className="font-mono text-xs text-zinc-400 transition-colors group-hover:text-cobalt">
                    {belief.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl font-bold tracking-tight sm:text-3xl">
                      {belief.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
                      {belief.detail}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="self-center font-mono text-sm text-zinc-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:text-cobalt group-hover:opacity-100"
                  >
                    →
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-20">
          <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500">
            BELIEF 04, DEMONSTRATED — DRAG THE HANDLE
          </p>
          <div className="mt-5">
            <CompareSlider />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            Same brand, same budget meeting. One of these gets remembered.
            Easy to write, harder to prove — the next section is proof you
            can touch.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
