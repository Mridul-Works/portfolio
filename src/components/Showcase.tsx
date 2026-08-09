import Reveal from "./Reveal";
import Stardust from "./Stardust";
import ProjectDemo from "./WorkDemos";

/**
 * Case studies, editorial style: one big outcome number per project and
 * a live demo instead of a screenshot — real production work, linked.
 */

type Case = {
  seed: string;
  title: string;
  sector: string;
  year: string;
  metric: string;
  metricLabel: string;
  pro: string;
  proTags: string[];
  link: string;
  linkLabel: string;
};

const CASES: Case[] = [
  {
    seed: "mastersunion",
    title: "Masters' Union",
    sector: "EDTECH",
    year: "CURRENT ROLE",
    metric: "ASAP",
    metricLabel: "THE ONLY DEADLINE MARKETING EVER GAVE ME",
    pro: "The website of Masters' Union, one of India's most ambitious business schools. I build the program and campaign pages the marketing team points paid ads at — briefed tight, content shaped around the campaign, and live before the ad spend starts.",
    proTags: ["CAMPAIGN PAGES", "PAID TRAFFIC", "TIGHT DEADLINES"],
    link: "https://mastersunion.org",
    linkLabel: "MASTERSUNION.ORG",
  },
  {
    seed: "masterscamp",
    title: "Masters' Camp",
    sector: "EDTECH",
    year: "LIVE",
    metric: "0",
    metricLabel: "CAMPAIGNS THAT LAUNCHED BEFORE THEIR PAGE WAS READY",
    pro: "Masters' Union's program for younger builders. Same playbook, faster cycles — landing pages written around what each ad promised, so the click and the page always told the same story.",
    proTags: ["LANDING PAGES", "ADS + CONTENT", "FAST TURNAROUND"],
    link: "https://masterscamp.org",
    linkLabel: "MASTERSCAMP.ORG",
  },
];

export default function Showcase() {
  return (
    <section
      id="work"
      className="relative z-10 -mt-11 rounded-t-[2.5rem] bg-white text-zinc-900 sm:-mt-16 sm:rounded-t-[3.5rem]"
    >
      <Stardust count={9} seed={17} className="text-zinc-300" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-36">
        <Reveal>
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-zinc-500">
              WORK — OUTCOMES, NOT SCREENSHOTS
            </p>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Every preview below is{" "}
              <span className="font-script italic text-cobalt">alive</span>.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              No stock mockups — each panel runs a tiny working version of
              the real production rhythm, and every project links straight
              to the live site.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col gap-20 sm:gap-28">
          {CASES.map((c, i) => (
            <Reveal key={c.seed} delay={60}>
              <article
                className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-zinc-200 shadow-[0_24px_60px_-30px_rgba(5,5,5,0.35)]">
                  <ProjectDemo seed={c.seed} title={c.title} />
                </div>

                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-400">
                    0{i + 1} — {c.sector} · {c.year}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-4xl">
                    {c.title}
                  </h3>

                  <div className="mt-6 flex items-baseline gap-4 border-l-2 border-cobalt pl-5">
                    <p className="font-display text-5xl font-bold tracking-tight text-cobalt sm:text-6xl">
                      {c.metric}
                    </p>
                    <p className="max-w-40 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-500">
                      {c.metricLabel}
                    </p>
                  </div>

                  <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
                    {c.pro}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.proTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-200 px-3 py-1 font-mono text-[9px] tracking-[0.15em] text-zinc-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.2em] text-cobalt transition-colors hover:text-cobalt-deep"
                  >
                    {c.linkLabel}
                    <span className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
                      ↗
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-zinc-200 bg-paper px-6 py-6 sm:px-8">
            <p className="max-w-md text-sm leading-relaxed text-zinc-600">
              Code walkthroughs, deep dives and references on request — happy
              to defend every decision in an interview.
            </p>
            <a
              href="#hire"
              className="group inline-flex items-center gap-3 rounded-full bg-cobalt px-7 py-3.5 font-mono text-xs font-bold tracking-[0.15em] text-white transition-colors hover:bg-cobalt-deep"
            >
              WANT THIS ON YOUR TEAM?
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
