"use client";

import { useEffect, useRef } from "react";

/**
 * Live project previews — because a portfolio that says "interactive
 * dashboards" should not prove it with a stock photo. Each card runs a
 * tiny working demo of the thing it claims.
 */

/* Nova Markets — a streaming chart drawn on canvas */
function NovaChart({ honest }: { honest: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const N = 90;
    let v = 0.5;
    let phase = 0;
    const next = () => {
      if (honest) {
        phase += 0.32;
        return 0.5 + Math.sin(phase) * 0.33;
      }
      v = Math.min(
        0.92,
        Math.max(0.08, v + (Math.random() - 0.5) * 0.075 + 0.0035)
      );
      return v;
    };
    const data: number[] = Array.from({ length: N }, next);

    let pointerX = -1;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
    };
    const onLeave = () => {
      pointerX = -1;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const top = 14;
      const bottom = height - 30;
      const y = (val: number) => top + (1 - val) * (bottom - top);
      const x = (i: number) => (i / (N - 1)) * width;

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        const gy = top + ((bottom - top) / 3) * g;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(width, gy);
        ctx.stroke();
      }

      // area fill
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      grad.addColorStop(0, "rgba(217,255,61,0.22)");
      grad.addColorStop(1, "rgba(217,255,61,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, bottom);
      data.forEach((val, i) => ctx.lineTo(x(i), y(val)));
      ctx.lineTo(width, bottom);
      ctx.closePath();
      ctx.fill();

      // line
      ctx.strokeStyle = "#d9ff3d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      data.forEach((val, i) =>
        i === 0 ? ctx.moveTo(x(i), y(val)) : ctx.lineTo(x(i), y(val))
      );
      ctx.stroke();

      // live tip
      const tipY = y(data[N - 1]);
      ctx.fillStyle = "rgba(217,255,61,0.25)";
      ctx.beginPath();
      ctx.arc(width - 1, tipY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d9ff3d";
      ctx.beginPath();
      ctx.arc(width - 1, tipY, 3, 0, Math.PI * 2);
      ctx.fill();

      // crosshair
      if (pointerX >= 0) {
        const i = Math.min(
          N - 1,
          Math.max(0, Math.round((pointerX / width) * (N - 1)))
        );
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.moveTo(x(i), top);
        ctx.lineTo(x(i), bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x(i), y(data[i]), 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        const price = (data[i] * 4200 + 800).toFixed(2);
        ctx.fillText(
          honest ? "it's going somewhere" : `₹${price}`,
          Math.min(x(i) + 6, width - 92),
          top + 10
        );
      }
    };

    if (reducedMotion) {
      draw();
      const ro = new ResizeObserver(() => {
        resize();
        draw();
      });
      ro.observe(wrap);
      return () => {
        ro.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
      };
    }

    let raf = 0;
    let acc = 0;
    let last = 0;
    const loop = (t: number) => {
      const dt = last ? t - last : 16;
      last = t;
      acc += dt;
      while (acc > 70) {
        acc -= 70;
        data.push(next());
        data.shift();
      }
      draw();
      raf = requestAnimationFrame(loop);
    };

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
    observer.observe(wrap);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [honest]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
      <p className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
        {honest ? "LINE. GOING. PLACES." : "40K TICKS/MIN — SIMULATED FEED"}
      </p>
    </div>
  );
}

/* Aurora — the legendary spinning shoe, as CSS 3D */
const CUBE_FACES = [
  "translateZ(48px)",
  "rotateY(180deg) translateZ(48px)",
  "rotateY(90deg) translateZ(48px)",
  "rotateY(-90deg) translateZ(48px)",
  "rotateX(90deg) translateZ(48px)",
  "rotateX(-90deg) translateZ(48px)",
];

function AuroraSpin({ honest }: { honest: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center [perspective:640px]">
      <div className="demo-cube relative h-24 w-24 [transform-style:preserve-3d]">
        {CUBE_FACES.map((t) => (
          <div
            key={t}
            style={{ transform: t }}
            className="absolute inset-0 rounded-xl border border-accent/35 bg-accent/[0.04]"
          />
        ))}
      </div>
      <span className="demo-float absolute text-5xl" aria-hidden="true">
        👟
      </span>
      <p className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
        {honest ? "AVG SESSION: 4 MIN OF THIS" : "60FPS ON MOBILE — PBR SOLD SEPARATELY"}
      </p>
    </div>
  );
}

/* Papertrail — the fastest blog alive */
function PapertrailSpeed({ honest }: { honest: boolean }) {
  const widths = [66, 100, 90, 96, 58, 84, 71];
  return (
    <div className="flex h-full w-full gap-5 p-5 pb-9">
      <div className="min-w-0 flex-1 space-y-2.5 pt-1">
        {widths.map((w, i) => (
          <div
            key={i}
            style={{ width: `${w}%`, animationDelay: `${i * 140}ms` }}
            className={`demo-stream origin-left rounded-full ${
              i === 0 ? "h-3 bg-white/30" : "h-2 bg-white/12"
            }`}
          />
        ))}
      </div>
      <div className="relative flex w-20 items-center justify-center">
        <svg viewBox="0 0 56 56" className="h-16 w-16 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            strokeWidth="4"
            className="fill-none stroke-white/10"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="151"
            className="demo-ring fill-none stroke-accent"
          />
        </svg>
        <span className="absolute font-mono text-sm text-accent">100</span>
      </div>
      <p className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
        {honest ? "A BLOG. BUT LOOK HOW FAST." : "STATIC — SERVED BEFORE YOU ASKED"}
      </p>
    </div>
  );
}

/* Orbit UI — buttons that agree with each other (mostly) */
const RIPPLE_DELAYS = [0, 60, 120, 60, 120, 180, 120, 180, 240];

function OrbitButtons({ honest }: { honest: boolean }) {
  return (
    <div className="group/orbit h-full w-full p-6 pb-9">
      <div className="grid h-full grid-cols-3 gap-2">
        {RIPPLE_DELAYS.map((delay, i) => {
          const rebel = honest && i === 5;
          return (
            <div
              key={i}
              style={{ transitionDelay: `${rebel ? 420 : delay}ms` }}
              className={`flex items-center justify-center rounded-lg border font-mono text-[9px] tracking-[0.15em] transition-all duration-300 ${
                rebel
                  ? "border-red-400/60 text-red-300 group-hover/orbit:rotate-6 group-hover/orbit:bg-red-500/20"
                  : "border-white/15 text-white/40 group-hover/orbit:border-accent group-hover/orbit:bg-accent group-hover/orbit:text-ink"
              }`}
            >
              {rebel ? "NO." : "BTN"}
            </div>
          );
        })}
      </div>
      <p className="pointer-events-none absolute bottom-2.5 left-3 font-mono text-[9px] tracking-[0.2em] text-white/35">
        {honest ? "THERE'S ALWAYS ONE" : "HOVER — WATCH THEM AGREE"}
      </p>
    </div>
  );
}

const STAMPS: Record<string, string> = {
  nova: "LINE GOES UP",
  aurora: "IT'S A SHOE",
  papertrail: "IT'S A BLOG",
  orbit: "THEY'RE BUTTONS",
};

export default function ProjectDemo({
  seed,
  honest,
  title,
}: {
  seed: string;
  honest: boolean;
  title: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${title} — live preview`}
      className="relative h-full w-full overflow-hidden bg-[#0b0b0e]"
    >
      {seed === "nova" && <NovaChart honest={honest} />}
      {seed === "aurora" && <AuroraSpin honest={honest} />}
      {seed === "papertrail" && <PapertrailSpeed honest={honest} />}
      {seed === "orbit" && <OrbitButtons honest={honest} />}
      {honest && STAMPS[seed] && (
        <span className="absolute right-3 top-3 -rotate-6 rounded border-2 border-red-500/70 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-red-400">
          {STAMPS[seed]}
        </span>
      )}
    </div>
  );
}
