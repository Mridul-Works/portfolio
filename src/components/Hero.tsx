import HeroCanvas from "./HeroCanvas";
import HeroTime from "./HeroTime";
import Magnetic from "./Magnetic";
import Sparkle from "./Sparkle";
import Stardust from "./Stardust";

const NAV = [
  ["ABOUT", "#manifesto"],
  ["SIGNATURE", "#signature"],
  ["WORK", "#work"],
  ["METHOD", "#method"],
  ["CONTACT", "#contact"],
] as const;

export default function Hero() {
  return (
    <section className="sticky top-0 h-svh min-h-150 w-full overflow-hidden bg-cobalt text-white">
      {/* the name, in ~26k particles of liquid chrome */}
      <HeroCanvas className="absolute inset-0" />

      {/* edge vignette + film grain */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_44%,rgba(10,14,140,0.45)_78%,rgba(4,6,60,0.85)_100%)]" />
      <div className="grain pointer-events-none absolute inset-0" />
      <Stardust count={10} seed={3} className="text-[#cfd8ea]" />

      {/* corner registration marks */}
      <div
        className="pointer-events-none absolute inset-0 z-10 hidden font-mono text-sm text-white/20 sm:block"
        aria-hidden="true"
      >
        <span className="absolute left-6 top-19">+</span>
        <span className="absolute right-6 top-19">+</span>
        <span className="absolute bottom-8 left-6">+</span>
        <span className="absolute bottom-8 right-6">+</span>
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 sm:px-10">
        <a href="#" className="font-display text-xl font-bold tracking-tight">
          M<span className="text-accent">.</span>
        </a>
        <nav className="flex items-center gap-5 font-mono text-[10px] tracking-[0.18em] text-white/55 sm:gap-7">
          {/* text links don't fit a phone header — the pill carries mobile */}
          {NAV.map(([label, href], i) => (
            <a
              key={href}
              href={href}
              className={`group whitespace-nowrap transition-colors hover:text-white ${
                label === "SIGNATURE" || label === "METHOD"
                  ? "hidden lg:inline"
                  : "hidden sm:inline"
              }`}
            >
              <span className="text-white/30 transition-colors group-hover:text-accent">
                0{i + 1}
              </span>{" "}
              {label}
            </a>
          ))}
          <a
            href="#hire"
            className="whitespace-nowrap rounded-full bg-accent px-4 py-2 font-bold tracking-[0.15em] text-ink transition-transform hover:scale-[1.04]"
          >
            HIRE ME
          </a>
        </nav>
      </header>

      {/* real heading for screen readers & SEO — the visual one is particles */}
      <h1 className="sr-only">
        Mridul — creative developer building immersive web experiences with
        Three.js and WebGL
      </h1>

      

      {/* bottom cluster */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-8 px-6 pb-8 sm:px-10 sm:pb-10">
        <div className="max-w-md">
          <a
            href="#hire"
            className="group inline-flex items-center gap-2.5 font-mono text-[10px] tracking-[0.25em] text-white/60 transition-colors hover:text-white"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            OPEN TO WORK — FRONTEND / CREATIVE DEVELOPER ROLES
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>
          </a>

          <div className="relative mt-5">
            <Sparkle className="-left-4 -top-3 h-5 w-5" delay={0.9} />
            <Sparkle className="-right-2 bottom-1 h-4 w-4 sm:-right-6" delay={2.3} />
            <p className="chrome-text font-display text-[clamp(1.35rem,2.6vw,2rem)] font-bold leading-tight tracking-tight">
              Interfaces people remember —
              <br />
              built with code, motion and{" "}
              <span className="font-script text-[1.18em] italic">taste</span>
              <span className="text-accent">.</span>
            </p>
          </div>

          <p className="mt-5 font-mono text-[10px] tracking-[0.2em] text-white/55">
            BASED IN INDIA — <HeroTime />
            <span className="hidden sm:inline"> · THREE.JS / WEBGL / NEXT.JS</span>
          </p>
        </div>

        {/* orbiting work button */}
        <Magnetic className="shrink-0">
          <a
            href="#work"
            aria-label="View selected work"
            className="group relative block h-24 w-24 sm:h-28 sm:w-28"
          >
            <svg
              viewBox="0 0 100 100"
              className="orbit-spin absolute inset-0 h-full w-full motion-reduce:animate-none"
              aria-hidden="true"
            >
              <defs>
                <path
                  id="orbit-path"
                  d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0"
                />
              </defs>
              <text className="fill-white/55 font-mono text-[8px] tracking-[0.16em] transition-colors group-hover:fill-white">
                <textPath href="#orbit-path">
                  SELECTED WORK • SELECTED WORK • SELECTED WORK •
                </textPath>
              </text>
            </svg>
            <span className="absolute inset-[26%] flex items-center justify-center rounded-full border border-white/15 text-lg text-accent transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-ink">
              <span className="transition-transform duration-300 group-hover:translate-y-0.5">
                ↓
              </span>
            </span>
          </a>
        </Magnetic>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="font-mono text-[9px] tracking-[0.35em] text-white/40">
          SCROLL
        </span>
        <span className="scroll-beam" aria-hidden="true" />
      </div>
    </section>
  );
}
