import Reveal from "./Reveal";

const CHAPTERS = [
  {
    n: "01",
    tag: "THE QUESTION",
    text: "As a kid, I couldn't look at a website without wondering — how is this even made?",
  },
  {
    n: "02",
    tag: "HTML",
    text: "I wrote my first tag, hit refresh, and felt like a god.",
  },
  {
    n: "03",
    tag: "CSS",
    text: "Then I learned CSS, and suddenly I was on top of the world.",
  },
  {
    n: "04",
    tag: "JAVASCRIPT",
    text: "JavaScript changed everything — now I could build anything in the world.",
  },
  {
    n: "05",
    tag: "REACT, NEXT & BEYOND",
    text: "Then came React, Next.js and the frameworks. And with them, something unexpected — peace.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative z-10 rounded-t-[2.5rem] bg-[#f4f4f2] text-zinc-900 sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-400">
            ABOUT — THE STORY
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            It all started with one question&nbsp;—
            <br />
            <span className="text-zinc-400">
              &ldquo;how is a website even made?&rdquo;
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 sm:mt-20">
          {CHAPTERS.map((chapter, i) => (
            <Reveal key={chapter.n} delay={i * 80}>
              <div className="flex gap-6 border-t border-zinc-200 py-7 sm:gap-10 sm:py-8">
                <span className="font-mono text-xs text-zinc-400">
                  {chapter.n}
                </span>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-400">
                    {chapter.tag}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-zinc-700 sm:text-xl">
                    {chapter.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 sm:mt-24">
          <p className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
            I&apos;d found my own canvas —
            <br />
            and a creative vision to paint on it
            <span className="text-[#9db800]">.</span>
          </p>
          <p className="mt-8 font-mono text-xs tracking-[0.2em] text-zinc-400">
            — MRIDUL
          </p>
        </Reveal>
      </div>
    </section>
  );
}
