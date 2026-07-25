/**
 * A giant scrolling display band — solid and outlined type alternating,
 * inheriting the section's text color. The classic studio flex, used
 * sparingly so it stays a flex.
 */
export default function MarqueeBand({ text }: { text: string }) {
  return (
    <div aria-hidden="true" className="overflow-hidden">
      <div className="band-marquee flex w-max whitespace-nowrap">
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className="flex items-baseline px-4 font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold uppercase leading-none tracking-tight"
          >
            <span className="px-4">{text}</span>
            <span className="stroke-only px-4">{text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
