import HeroCanvas from "./HeroCanvas";

export default function Hero() {
  return (
    <section className="sticky top-0 h-svh min-h-150 w-full overflow-hidden bg-ink text-white">
      <HeroCanvas className="absolute inset-0" />

      {/* subtle vignette so the type stays readable over the particles */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,5,0.7)_100%)]" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <a href="#" className="font-display text-xl font-bold tracking-tight">
          M<span className="text-accent">.</span>
        </a>
        <nav className="flex items-center gap-6 text-xs tracking-[0.15em] text-white/60 sm:gap-8">
          <a href="#about" className="transition-colors hover:text-white">
            ABOUT
          </a>
          <a href="#craft" className="transition-colors hover:text-white">
            CRAFT
          </a>
          <a href="#contact" className="transition-colors hover:text-white">
            CONTACT
          </a>
        </nav>
      </header>

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 font-mono text-[11px] tracking-[0.3em] text-white/55">
          MRIDUL — CREATIVE DEVELOPER
        </p>

        <h1 className="max-w-5xl font-display text-[clamp(2.2rem,6.2vw,5.5rem)] font-bold uppercase leading-[1.05] tracking-tight">
          Building immersive
          <br />
          web experiences<span className="text-accent">.</span>
        </h1>

        <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          I design and build interactive websites with Three.js, WebGL and
          modern web technologies.
        </p>

        <div className="pointer-events-auto mt-10">
          <a
            href="#about"
            className="group inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm tracking-wide text-white/80 transition-colors hover:border-accent hover:text-white"
          >
            Read my story
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 py-6 font-mono text-[10px] tracking-[0.2em] text-white/45 sm:px-10">
        <p>BASED IN INDIA</p>
        <p className="hidden sm:block">THREE.JS / REACT / NEXT.JS</p>
        <p>SCROLL ↓</p>
      </footer>
    </section>
  );
}
