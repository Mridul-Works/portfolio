/**
 * A field of four-point silver stars, scattered by a seeded PRNG so the
 * server and client always agree on where the sky is (Math.random would
 * cause hydration mismatches). Each star twinkles on its own delay,
 * duration and peak brightness via CSS custom properties — zero JS at
 * runtime, and the whole field ignores the pointer.
 *
 * Color rides on currentColor: wrap it in a text-* class per section
 * (silvery on cobalt, soft zinc on paper).
 */

const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export default function Stardust({
  count = 14,
  seed = 7,
  className = "",
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const rand = mulberry32(seed);
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rand() * 96 + 2,
    top: rand() * 94 + 3,
    size: 6 + rand() * 10,
    delay: rand() * 7,
    dur: 3.5 + rand() * 4.5,
    peak: 0.3 + rand() * 0.55,
  }));

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {stars.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          style={{
            left: `${s.left.toFixed(2)}%`,
            top: `${s.top.toFixed(2)}%`,
            width: `${s.size.toFixed(1)}px`,
            height: `${s.size.toFixed(1)}px`,
            "--star-delay": `${s.delay.toFixed(2)}s`,
            "--star-dur": `${s.dur.toFixed(2)}s`,
            "--star-peak": s.peak.toFixed(2),
          } as React.CSSProperties}
          className="star-twinkle absolute fill-current"
        >
          <path d="M12 0 C13.5 6.5 17.5 10.5 24 12 C17.5 13.5 13.5 17.5 12 24 C10.5 17.5 6.5 13.5 0 12 C6.5 10.5 10.5 6.5 12 0 Z" />
        </svg>
      ))}
    </div>
  );
}
