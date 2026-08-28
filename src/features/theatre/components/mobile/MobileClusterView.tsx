import { memo } from "react";
import { MobileCluster, MobileSlot } from "../../engine/mobileClusterBuilder";
import { MobileCard } from "./MobileCard";

interface MobileClusterViewProps {
  cluster: MobileCluster;
}

const Cell = memo(function Cell({ slot, spanClass }: { slot?: MobileSlot; spanClass: string }) {
  if (!slot || !slot.item) return null;
  return (
    <div className={`relative w-full h-full overflow-hidden ${spanClass}`}>
      <MobileCard slot={slot} className="w-full h-full" />
    </div>
  );
});

/**
 * Renders a single mobile cluster inside a fixed-height parent container.
 *
 * All templates share a `grid-cols-2 grid-rows-6` base. The parent div
 * controls total cluster height.
 * CSS Grid handles all aspect-ratio geometry — no inline styles needed.
 */
export const MobileClusterView = memo(function MobileClusterView({
  cluster,
}: MobileClusterViewProps) {
  if (!cluster || !Array.isArray(cluster.slots)) return null;

  const [s0, s1, s2] = cluster.slots;
  const hasMultiple = (s0?.item ? 1 : 0) + (s1?.item ? 1 : 0) + (s2?.item ? 1 : 0) > 1;

  // Single item in mobile cluster -> render as a clean 16:9 cinematic banner tile
  if (!hasMultiple) {
    const singleSlot = s0?.item ? s0 : s1?.item ? s1 : s2;
    if (!singleSlot || !singleSlot.item) return null;
    return (
      <div className="w-full aspect-[16/9] relative overflow-hidden rounded-none">
        <MobileCard slot={singleSlot} className="w-full h-full" />
      </div>
    );
  }

  switch (cluster.type) {
    // ── A: Feature Presentation ──────────────────────────────────────────────
    // Wide banner top (3 rows) + two squares below (3 rows each)
    case "A":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <Cell slot={s0} spanClass="col-span-2 row-span-3" />
          <Cell slot={s1} spanClass="col-span-1 row-span-3" />
          <Cell slot={s2} spanClass="col-span-1 row-span-3" />
        </div>
      );

    // ── B: Asymmetric Left ───────────────────────────────────────────────────
    // Vertical left (6 rows) + two squares stacked right (3 rows each)
    case "B":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <Cell slot={s0} spanClass="col-span-1 row-span-6" />
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            <Cell slot={s1} spanClass="row-span-3" />
            <Cell slot={s2} spanClass="row-span-3" />
          </div>
        </div>
      );

    // ── C: Asymmetric Right ──────────────────────────────────────────────────
    // Two squares stacked left (3 rows each) + vertical right (6 rows)
    case "C":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <div className="col-span-1 row-span-6 grid grid-cols-1 grid-rows-6 gap-0">
            <Cell slot={s0} spanClass="row-span-3" />
            <Cell slot={s2} spanClass="row-span-3" />
          </div>
          <Cell slot={s1} spanClass="col-span-1 row-span-6" />
        </div>
      );

    // ── D: Pacing Block ──────────────────────────────────────────────────────
    // Two squares top (3 rows each) + wide banner bottom (3 rows)
    case "D":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <Cell slot={s0} spanClass="col-span-1 row-span-3" />
          <Cell slot={s1} spanClass="col-span-1 row-span-3" />
          <Cell slot={s2} spanClass="col-span-2 row-span-3" />
        </div>
      );

    // ── E: The Gallery ───────────────────────────────────────────────────────
    // Two verticals side by side — poster / portrait showcase
    case "E":
      return (
        <div className="grid grid-cols-2 grid-rows-6 gap-0 w-full h-full">
          <Cell slot={s0} spanClass="col-span-1 row-span-6" />
          <Cell slot={s1} spanClass="col-span-1 row-span-6" />
        </div>
      );

    default:
      return null;
  }
});
