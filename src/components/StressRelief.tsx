"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Reveal from "./Reveal";

const HEADLINE = "PIXEL PERFECT.";
const PLAQUE_TEXT = "DO NOT TOUCH";

let count = 0;
const ITEMS = Array.from(HEADLINE).map((ch) => ({
  ch,
  idx: ch === " " ? -1 : count++,
}));
const PLAQUE_IDX = count;
const TOTAL = count + 1; // letters + the warning sign

const GRAVITY = 2600; // px/s²
const BOUNCE = 0.55;
const MAX_V = 3200;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// passive-aggressive narrator, escalating with every grab
const LINES: [number, string][] = [
  [1, "Oh. Okay. Sure. Just — yeah. Throw it."],
  [2, "That one had sentimental value."],
  [4, "I kerned that for three hours."],
  [7, "You know what? Fine. Get it out of your system."],
  [10, "Most visitors stop at six. You're… thorough."],
  [14, "This is going in my analytics. I'll know."],
  [18, "I'm not mad. I'm impressed. Mostly mad."],
  [25, "There's nothing left. You're throwing rubble at rubble."],
];

const lineFor = (n: number) => {
  let line = LINES[0][1];
  for (const [t, l] of LINES) if (n >= t) line = l;
  return line;
};

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  homeX: number;
  homeY: number;
  w: number;
  h: number;
  grabbed: boolean;
  moved: boolean;
  returning: boolean;
  offX: number;
  offY: number;
  pt: number;
};

const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const m = window.matchMedia(motionQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const readMotion = () => window.matchMedia(motionQuery).matches;

const newBody = (): Body => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  a: 0,
  va: 0,
  homeX: 0,
  homeY: 0,
  w: 0,
  h: 0,
  grabbed: false,
  moved: false,
  returning: false,
  offX: 0,
  offY: 0,
  pt: 0,
});

export default function StressRelief() {
  const sectionRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const bodies = useRef<Body[]>(Array.from({ length: TOTAL }, newBody));
  const grabsRef = useRef(0);
  const lastDamage = useRef(0);

  const [grabs, setGrabs] = useState(0);
  const [topSpeed, setTopSpeed] = useState(0);
  const [damage, setDamage] = useState(0);
  const [narrator, setNarrator] = useState(
    "Go on. It says “do not touch”. It always says that."
  );
  const staticMode = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    () => false
  );

  useEffect(() => {
    if (staticMode) return;
    const section = sectionRef.current;
    const box = boxRef.current;
    if (!section || !box) return;

    const measure = () => {
      els.current.forEach((el, i) => {
        const b = bodies.current[i];
        if (!el || !b) return;
        b.homeX = el.offsetLeft;
        b.homeY = el.offsetTop;
        b.w = el.offsetWidth;
        b.h = el.offsetHeight;
      });
    };
    measure();
    // re-measure once webfonts settle, letter widths shift with Syne
    document.fonts?.ready.then(measure).catch(() => {});

    let raf = 0;
    let last = 0;
    let frame = 0;

    const loop = (t: number) => {
      const dt = last ? Math.min((t - last) / 1000, 0.033) : 0.016;
      last = t;
      const W = box.clientWidth;
      const H = box.clientHeight;

      bodies.current.forEach((b, i) => {
        const el = els.current[i];
        if (!el || b.grabbed) return;

        if (b.returning) {
          const k = Math.min(1, dt * 7);
          b.x += -b.x * k;
          b.y += -b.y * k;
          b.a += -b.a * k;
          if (
            Math.abs(b.x) < 0.5 &&
            Math.abs(b.y) < 0.5 &&
            Math.abs(b.a) < 0.5
          ) {
            b.x = b.y = b.a = b.vx = b.vy = b.va = 0;
            b.returning = false;
            b.moved = false;
          }
        } else if (b.moved) {
          b.vy += GRAVITY * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.a += b.va * dt;

          if (b.homeX + b.x < 0) {
            b.x = -b.homeX;
            b.vx = Math.abs(b.vx) * BOUNCE;
            b.va *= -0.7;
          }
          if (b.homeX + b.x + b.w > W) {
            b.x = W - b.w - b.homeX;
            b.vx = -Math.abs(b.vx) * BOUNCE;
            b.va *= -0.7;
          }
          if (b.homeY + b.y < 0) {
            b.y = -b.homeY;
            b.vy = Math.abs(b.vy) * BOUNCE;
          }
          if (b.homeY + b.y + b.h > H) {
            b.y = H - b.h - b.homeY;
            b.vy = -Math.abs(b.vy) * BOUNCE;
            b.vx *= 0.96;
            b.va *= 0.92;
            if (Math.abs(b.vy) < 60) b.vy = 0;
          }
        } else {
          return;
        }

        el.style.transform = `translate(${b.x.toFixed(2)}px, ${b.y.toFixed(
          2
        )}px) rotate(${b.a.toFixed(2)}deg)`;
      });

      // throttled damage-report sync — no per-frame re-renders
      if (++frame % 12 === 0) {
        const d = bodies.current.filter(
          (b) => b.moved && (Math.abs(b.x) > 6 || Math.abs(b.y) > 6)
        ).length;
        if (d !== lastDamage.current) {
          lastDamage.current = d;
          setDamage(d);
        }
      }
      raf = requestAnimationFrame(loop);
    };

    // physics only runs while the section is on screen
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(loop);
        }
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    observer.observe(section);

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [staticMode]);

  // handlers read their target index from data-idx, so no per-render closures
  const onGrab = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (staticMode) return;
    const i = Number(e.currentTarget.dataset.idx);
    const b = bodies.current[i];
    const box = boxRef.current;
    if (!b || !box) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = box.getBoundingClientRect();
    b.grabbed = true;
    b.moved = true;
    b.returning = false;
    b.offX = e.clientX - rect.left - b.homeX - b.x;
    b.offY = e.clientY - rect.top - b.homeY - b.y;
    b.vx = b.vy = 0;
    b.pt = e.timeStamp;
    const n = ++grabsRef.current;
    setGrabs(n);
    setNarrator(
      i === PLAQUE_IDX
        ? "You grabbed the warning sign. Genuinely bold."
        : lineFor(n)
    );
  };

  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const i = Number(e.currentTarget.dataset.idx);
    const b = bodies.current[i];
    const box = boxRef.current;
    if (!b || !box || !b.grabbed) return;
    const rect = box.getBoundingClientRect();
    const nx = clamp(
      e.clientX - rect.left - b.homeX - b.offX,
      -b.homeX,
      rect.width - b.w - b.homeX
    );
    const ny = clamp(
      e.clientY - rect.top - b.homeY - b.offY,
      -b.homeY,
      rect.height - b.h - b.homeY
    );
    const dt = (e.timeStamp - b.pt) / 1000;
    if (dt > 0) {
      b.vx = b.vx * 0.4 + ((nx - b.x) / dt) * 0.6;
      b.vy = b.vy * 0.4 + ((ny - b.y) / dt) * 0.6;
    }
    b.x = nx;
    b.y = ny;
    b.pt = e.timeStamp;
    e.currentTarget.style.transform = `translate(${nx}px, ${ny}px) rotate(${b.a}deg)`;
  };

  const onRelease = (e: React.PointerEvent<HTMLSpanElement>) => {
    const i = Number(e.currentTarget.dataset.idx);
    const b = bodies.current[i];
    if (!b || !b.grabbed) return;
    b.grabbed = false;
    // held still before letting go → it drops, no ghost throw
    if (e.timeStamp - b.pt > 120) b.vx = b.vy = 0;
    b.vx = clamp(b.vx, -MAX_V, MAX_V);
    b.vy = clamp(b.vy, -MAX_V, MAX_V);
    b.va = clamp(b.vx * 0.25, -320, 320);
    setTopSpeed((s) => Math.max(s, Math.round(Math.hypot(b.vx, b.vy))));
  };

  const reset = () => {
    bodies.current.forEach((b) => {
      if (b.moved) {
        b.grabbed = false;
        b.returning = true;
      }
    });
    setNarrator(
      "Rebuilt in 0.7 seconds. Don't tell my clients it's that easy — I bill by the hour."
    );
  };

  const grabbable = staticMode
    ? ""
    : "cursor-grab select-none touch-none active:cursor-grabbing";

  return (
    <section
      ref={sectionRef}
      id="stress-relief"
      className="relative z-10 rounded-t-[2.5rem] bg-accent text-ink sm:rounded-t-[3.5rem]"
    >
      <div className="mx-auto max-w-4xl px-6 py-24 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.3em] text-ink/60">
            AMENITY — COMPLIMENTARY STRESS RELIEF
          </p>
          <h2 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Deep breath.
            <br />
            <span className="text-ink/50">Now break something.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
            You&apos;ve made it through four sections of a stranger showing
            off. As a thank-you, here&apos;s a headline I hand-kerned and
            genuinely love. Grab the letters. Throw them. The reset button
            forgives everything — which is more than my clients do.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          {/* damage report */}
          <div className="grid grid-cols-2 gap-3 font-mono sm:grid-cols-4">
            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3">
              <p className="text-[9px] tracking-[0.2em] text-ink/50">
                DAYS WITHOUT INCIDENT
              </p>
              <p className="mt-1 text-lg">{grabs === 0 ? "247" : "0"}</p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3">
              <p className="text-[9px] tracking-[0.2em] text-ink/50">
                LETTERS GRABBED
              </p>
              <p className="mt-1 text-lg">{grabs}</p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3">
              <p className="text-[9px] tracking-[0.2em] text-ink/50">
                TOP THROW
              </p>
              <p className="mt-1 text-lg">{topSpeed} px/s</p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-paper px-4 py-3">
              <p className="text-[9px] tracking-[0.2em] text-ink/50">
                OBJECTS DISPLACED
              </p>
              <p className="mt-1 text-lg">
                {damage} / {TOTAL}
              </p>
            </div>
          </div>

          {/* the demolition zone */}
          <div
            ref={boxRef}
            className="relative mt-4 h-96 overflow-hidden rounded-2xl border border-ink/10 bg-white sm:h-112"
          >
            <div className="pointer-events-none absolute left-0 top-0 flex w-full justify-between px-4 pt-3 font-mono text-[9px] tracking-[0.2em] text-zinc-400">
              <p>MUSEUM OF OVERWORK — EXHIBIT A</p>
              <p className="hidden sm:block">EST. 3 HRS OF KERNING</p>
            </div>

            <div className="flex h-full flex-col items-center justify-center gap-10 px-4">
              <h3
                aria-label="Pixel perfect."
                className="font-display text-[clamp(2rem,7vw,4.25rem)] font-bold leading-none tracking-tight text-zinc-900"
              >
                {ITEMS.map((item, i) =>
                  item.idx === -1 ? (
                    <span key={i} className="inline-block w-[0.3em]" />
                  ) : (
                    <span
                      key={i}
                      ref={(el) => {
                        els.current[item.idx] = el;
                      }}
                      aria-hidden="true"
                      data-idx={item.idx}
                      onPointerDown={onGrab}
                      onPointerMove={onMove}
                      onPointerUp={onRelease}
                      onPointerCancel={onRelease}
                      className={`inline-block will-change-transform ${grabbable}`}
                    >
                      {item.ch}
                    </span>
                  )
                )}
              </h3>

              <span
                ref={(el) => {
                  els.current[PLAQUE_IDX] = el;
                }}
                aria-hidden="true"
                data-idx={PLAQUE_IDX}
                onPointerDown={onGrab}
                onPointerMove={onMove}
                onPointerUp={onRelease}
                onPointerCancel={onRelease}
                className={`inline-block rounded-md border border-red-600/40 px-3 py-1.5 font-mono text-[9px] tracking-[0.25em] text-red-600/70 will-change-transform ${grabbable}`}
              >
                {PLAQUE_TEXT}
              </span>
            </div>
          </div>

          {/* narrator + cleanup */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p
              aria-live="polite"
              className="min-h-10 flex-1 basis-64 font-mono text-[11px] leading-relaxed text-ink/80"
            >
              —{" "}
              {staticMode
                ? "Your system asked for reduced motion, so demolition day is cancelled. Honestly? The healthiest decision on this page."
                : narrator}
            </p>
            <button
              type="button"
              onClick={reset}
              disabled={staticMode || (grabs === 0 && damage === 0)}
              className="rounded-full border border-ink/30 px-5 py-2.5 font-mono text-[10px] font-bold tracking-[0.15em] transition-colors enabled:hover:bg-ink enabled:hover:text-accent disabled:opacity-40"
            >
              ↺ PUT IT BACK
            </button>
          </div>

          <p className="mt-8 max-w-xl text-sm leading-relaxed text-ink/60">
            Studies show that throwing someone else&apos;s typography reduces
            stress by 14%. I made that up — but so does every landing page
            you&apos;ve ever read.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
