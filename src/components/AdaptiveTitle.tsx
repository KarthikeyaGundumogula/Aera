/**
 * AdaptiveTitle — Implements the 95% Adaptive Containment Rule (fe-context.md)
 *
 * Rules:
 * - Container is always capped at max-w-[95%] of its parent.
 * - Names and titles MUST NEVER be split, hyphenated, or overflow.
 * - Single-word titles: shrink-to-fit via CSS clamp().
 * - Multi-word titles: wrap to new lines (height expands, font stays).
 */

interface AdaptiveTitleProps {
  /** The title string to display */
  title: string;
  /** Base Tailwind text size for multi-word titles (e.g. "text-2xl sm:text-4xl") */
  multiWordClass?: string;
  /** CSS clamp() value for single-word titles (e.g. "clamp(1.5rem, 10vw, 3.5rem)") */
  singleWordClamp?: string;
  /** Additional Tailwind classes applied to the heading element */
  className?: string;
  /** HTML heading level. Defaults to "h2". */
  as?: "h1" | "h2" | "h3" | "h4" | "span";
}

export function AdaptiveTitle({
  title,
  multiWordClass = "text-2xl sm:text-4xl",
  singleWordClamp = "clamp(1.5rem, 10vw, 3.5rem)",
  className = "",
  as: Tag = "h2",
}: AdaptiveTitleProps) {
  const isMultiWord = title.includes(" ");

  const base =
    "max-w-[95%] font-black uppercase tracking-tighter text-white leading-[0.9] drop-shadow-2xl";

  if (isMultiWord) {
    return (
      <Tag className={`${base} ${multiWordClass} whitespace-normal break-words ${className}`}>
        {title}
      </Tag>
    );
  }

  return (
    <Tag
      className={`${base} whitespace-nowrap ${className}`}
      style={{ fontSize: singleWordClamp }}
    >
      {title}
    </Tag>
  );
}
