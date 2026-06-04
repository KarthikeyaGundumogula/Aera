import { memo } from "react";
import { MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileCard } from "./MobileCard";

interface MobileClusterViewProps {
  cluster: MobileCluster;
}

/**
 * Renders a single mobile cluster with perfect 2x6 geometric height constraint.
 *
 * All templates use h-full on the root so the parent container controls
 * the total cluster height. The CSS Grid inherently dictates all dimensions
 * and aspect ratios perfectly based on the grid geometry.
 */
export const MobileClusterView = memo(function MobileClusterView({
  cluster,
}: MobileClusterViewProps) {
  const [s0, s1, s2] = cluster.slots;

  // Helper to render a card within a grid cell.
  // The relative wrapper + absolute card ensures it fills the exact grid cell dimensions.
  const gridCard = (slot: typeof s0, spanClass: string) => (
    <div className={`relative ${spanClass}`}>
      <MobileCard slot={slot} className="absolute inset-0" />
    </div>
  );

  switch (cluster.type) {
    // ── A: Feature Presentation ─────────────────────────────────────────────
    // IMAX (16:9) top (3 rows), Two squares below (3 rows each)
    case "A":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {gridCard(s0, "col-span-2 row-span-3")}
          {gridCard(s1, "col-span-1 row-span-3")}
          {gridCard(s2, "col-span-1 row-span-3")}
        </div>
      );

    // ── B: Asymmetric Left ──────────────────────────────────────────────────
    // Vertical left (6 rows). Right: Two squares (3 rows each).
    case "B":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {gridCard(s0, "col-span-1 row-span-6")}
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            {gridCard(s1, "row-span-3")}
            {gridCard(s2, "row-span-3")}
          </div>
        </div>
      );

    // ── C: Asymmetric Right ─────────────────────────────────────────────────
    // Left: Two squares (3 rows each). Vertical right (6 rows).
    case "C":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            {gridCard(s0, "row-span-3")}
            {gridCard(s2, "row-span-3")}
          </div>
          {gridCard(s1, "col-span-1 row-span-6")}
        </div>
      );

    // ── D: Pacing Block ─────────────────────────────────────────────────────
    // Two squares top (3 rows each), IMAX bottom (3 rows)
    case "D":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {gridCard(s0, "col-span-1 row-span-3")}
          {gridCard(s1, "col-span-1 row-span-3")}
          {gridCard(s2, "col-span-2 row-span-3")}
        </div>
      );

    // ── E: The Gallery ──────────────────────────────────────────────────────
    // Two poster-format cards, side by side (6 rows each)
    case "E":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          {gridCard(s0, "col-span-1 row-span-6")}
          {gridCard(s1, "col-span-1 row-span-6")}
        </div>
      );

    default:
      return null;
  }
});
