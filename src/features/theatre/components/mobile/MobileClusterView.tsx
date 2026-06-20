import { memo } from "react";
import { MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileCard } from "./MobileCard";

interface MobileClusterViewProps {
  cluster: MobileCluster;
}

/**
 * Renders a single mobile cluster inside a fixed-height parent container.
 *
 * All templates share a `grid-cols-2 grid-rows-6` base. The parent div
 * (set to `40dvh` in MobileCanvas) controls total cluster height.
 * CSS Grid handles all aspect-ratio geometry — no inline styles needed.
 *
 * Slot → grid span mapping (3-type model):
 *   Wide     → col-span-2 row-span-3  (full-width banner)
 *   Vertical → col-span-1 row-span-6  (tall portrait)
 *   Square   → col-span-1 row-span-3  (half-width square)
 */
export const MobileClusterView = memo(function MobileClusterView({
  cluster,
}: MobileClusterViewProps) {
  const [s0, s1, s2] = cluster.slots;

  // Render a card that fills its grid cell exactly.
  // The `relative` wrapper gives the `absolute inset-0` card a sizing context.
  const cell = (slot: typeof s0, spanClass: string) => (
    <div className={`relative ${spanClass}`}>
      <MobileCard slot={slot} className="absolute inset-0" />
    </div>
  );

  switch (cluster.type) {
    // ── A: Feature Presentation ──────────────────────────────────────────────
    // Wide banner top (3 rows) + two squares below (3 rows each)
    case "A":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {cell(s0, "col-span-2 row-span-3")}
          {cell(s1, "col-span-1 row-span-3")}
          {cell(s2, "col-span-1 row-span-3")}
        </div>
      );

    // ── B: Asymmetric Left ───────────────────────────────────────────────────
    // Vertical left (6 rows) + two squares stacked right (3 rows each)
    case "B":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {cell(s0, "col-span-1 row-span-6")}
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            {cell(s1, "row-span-3")}
            {cell(s2, "row-span-3")}
          </div>
        </div>
      );

    // ── C: Asymmetric Right ──────────────────────────────────────────────────
    // Two squares stacked left (3 rows each) + vertical right (6 rows)
    case "C":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            {cell(s0, "row-span-3")}
            {cell(s2, "row-span-3")}
          </div>
          {cell(s1, "col-span-1 row-span-6")}
        </div>
      );

    // ── D: Pacing Block ──────────────────────────────────────────────────────
    // Two squares top (3 rows each) + wide banner bottom (3 rows)
    case "D":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {cell(s0, "col-span-1 row-span-3")}
          {cell(s1, "col-span-1 row-span-3")}
          {cell(s2, "col-span-2 row-span-3")}
        </div>
      );

    // ── E: The Gallery ───────────────────────────────────────────────────────
    // Two verticals side by side — poster / portrait showcase
    case "E":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {cell(s0, "col-span-1 row-span-6")}
          {cell(s1, "col-span-1 row-span-6")}
        </div>
      );

    default:
      return null;
  }
});
