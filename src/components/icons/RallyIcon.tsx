import React from "react";

interface RallyIconProps {
  size?: number;
  /** filled = active/rallied state */
  filled?: boolean;
  className?: string;
}

/**
 * RallyIcon — "Hanging Banner over Crowd" SVG icon.
 *
 * Matches the user's concept: a tall pole with a crossbar at the top,
 * a rectangular banner hanging DOWN from the crossbar (with a triangular
 * notch cut out of the bottom edge), and a crowd of silhouettes packed
 * tightly beneath.
 *
 * Inactive: outlined, current color (text-white/30)
 * Active:   filled solid Cinematic Crimson (#E11D48)
 */
export const RallyIcon: React.FC<RallyIconProps> = ({
  size = 20,
  filled = false,
  className = "",
}) => {
  const c = filled ? "#E11D48" : "currentColor";
  const sw = 1.5; // stroke-width

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Vertical pole ── */}
      <line x1="12" y1="1.5" x2="12" y2="14" stroke={c} strokeWidth={sw} strokeLinecap="round" />

      {/* ── Horizontal crossbar at top ── */}
      <line x1="8" y1="2.5" x2="16" y2="2.5" stroke={c} strokeWidth={sw} strokeLinecap="round" />

      {/*
        ── Hanging banner ──
        Hangs from crossbar (x: 9→15, y top: 2.5)
        Bottom has a triangular notch cut in the center:
          bottom-left corner  → (9, 10)
          notch left point    → (10.5, 8.5)
          notch apex (cut in) → (12, 10)
          notch right point   → (13.5, 8.5)
          bottom-right corner → (15, 10)
      */}
      <path
        d="M9 2.5 L15 2.5 L15 10 L13.5 8.5 L12 10 L10.5 8.5 L9 10 Z"
        fill={filled ? "#E11D48" : "none"}
        stroke={c}
        strokeWidth={sw}
        strokeLinejoin="round"
      />

      {/*
        ── Crowd silhouettes ──
        Three rows of overlapping head+shoulder lumps.
        Front row: 4 people, close together, larger
        Back row:  3 people, behind, smaller (depth)
        All solid-filled to read as a mass of people.
      */}

      {/* Back row — 3 heads, smaller, centered */}
      <ellipse cx="9"  cy="16.2" rx="1.5" ry="1.3" fill={c} />
      <ellipse cx="12" cy="15.8" rx="1.5" ry="1.3" fill={c} />
      <ellipse cx="15" cy="16.2" rx="1.5" ry="1.3" fill={c} />

      {/* Back row shoulders */}
      <path d="M6.5 18.5 Q9 16.8 11.5 18.5"  fill={c} />
      <path d="M9.5 18.2 Q12 16.4 14.5 18.2"  fill={c} />
      <path d="M12.5 18.5 Q15 16.8 17.5 18.5" fill={c} />

      {/* Front row — 4 heads, larger, spaced wider */}
      <ellipse cx="6.5" cy="18.2" rx="1.7" ry="1.5" fill={c} />
      <ellipse cx="10"  cy="17.6" rx="1.7" ry="1.5" fill={c} />
      <ellipse cx="14"  cy="17.6" rx="1.7" ry="1.5" fill={c} />
      <ellipse cx="17.5" cy="18.2" rx="1.7" ry="1.5" fill={c} />

      {/* Front row shoulders — merge into a dense crowd base */}
      <path d="M3.5 22 Q6.5 19.4 9.5 22"   fill={c} />
      <path d="M7.2 22 Q10 19 12.8 22"      fill={c} />
      <path d="M11 22 Q14 19 17 22"         fill={c} />
      <path d="M14.5 22 Q17.5 19.4 20.5 22" fill={c} />
    </svg>
  );
};
