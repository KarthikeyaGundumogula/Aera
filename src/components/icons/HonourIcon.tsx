import React from "react";

interface HonourIconProps {
  size?: number;
  /** filled = active/honoured state */
  filled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HonourIcon — "Radiant Nova" SVG icon for the Honour action.
 *
 * Concept: A sharp 4-pointed radiant star — a spark of brilliance and
 * highest esteem. Cinematic, minimal, ownable. No thumbs. No hearts.
 * No outer circles. The form works standalone because of its strong
 * geometric identity.
 *
 * The star is built from 4 primary diamond points (N, E, S, W) extended
 * at the cardinal directions, and 4 compressed secondary points between
 * them — creating a classic calligraphic ✦ (BLACK FOUR POINTED STAR) in SVG.
 *
 * Inactive : thin crisp outline stroke only, white/30
 * Active   : solid fill + drop-shadow glow (handled by parent via style)
 *
 * Animation is handled externally via className (scale-150 pop on click).
 */
export const HonourIcon: React.FC<HonourIconProps> = ({
  size = 20,
  filled = false,
  className = "",
  style,
}) => {
  /*
   * The star path is drawn in a 24×24 viewBox.
   * Cardinal tips reach far (cx±9, cy±9) for the dramatic "star" silhouette.
   * Diagonal inner points sit close to center (cx±2.4, cy±2.4)
   * giving the clean sharp pinch between each primary lobe.
   *
   * cx=12, cy=12 (center)
   */
  const cx = 12;
  const cy = 12;
  // Outer tip distance from center
  const outer = 9;
  // Inner pinch distance from center (diagonal 45°)
  const inner = 2.4;
  const d45 = inner * Math.SQRT1_2; // ≈ 1.697

  const starPath = [
    `M ${cx} ${cy - outer}`,          // Top tip (N)
    `L ${cx + d45} ${cy - d45}`,      // NE inner
    `L ${cx + outer} ${cy}`,          // Right tip (E)
    `L ${cx + d45} ${cy + d45}`,      // SE inner
    `L ${cx} ${cy + outer}`,          // Bottom tip (S)
    `L ${cx - d45} ${cy + d45}`,      // SW inner
    `L ${cx - outer} ${cy}`,          // Left tip (W)
    `L ${cx - d45} ${cy - d45}`,      // NW inner
    `Z`,
  ].join(" ");

  const crimson = "#E11D48";
  const fillColor = filled ? crimson : "none";
  const strokeColor = filled ? crimson : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={filled ? 0 : 1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={starPath} />
    </svg>
  );
};
