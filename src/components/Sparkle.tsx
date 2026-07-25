import type { CSSProperties } from "react";

/** Four-point chrome glint. Position with `className`, stagger with `delay`. */
export default function Sparkle({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const style: CSSProperties = delay ? { animationDelay: `${delay}s` } : {};
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={style}
      className={`glint-star pointer-events-none absolute ${className}`}
    >
      <path
        d="M50 0C54 33 67 46 100 50C67 54 54 67 50 100C46 67 33 54 0 50C33 46 46 33 50 0Z"
        fill="#fff"
      />
    </svg>
  );
}
