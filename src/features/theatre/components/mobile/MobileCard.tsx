import { memo } from "react";
import { TheatreItem } from "../../../../types";
import { MobileSlot } from "../../engine/mobileClusterBuilder";
import {
  EditWork,
  PosterWork,
  ScriptWork,
  getWorkKind,
} from "../../../shared/work";

// ─── Mobile Card ────────────────────────────────────────────────────────────

interface MobileCardProps {
  slot: MobileSlot;
  /** When true, the card stretches to fill its parent height instead of using its aspect class. */
  forceFill?: boolean;
}

/**
 * A single card rendered inside a mobile cluster.
 * Uses the slot's `aspectClass` for sizing unless `forceFill` is set (used in
 * asymmetric layouts where a vertical card must match the height of its sibling stack).
 */
export const MobileCard = memo(function MobileCard({
  slot,
  forceFill = false,
}: MobileCardProps) {
  const { item } = slot;

  const renderWork = (work: TheatreItem) => {
    switch (getWorkKind(work)) {
      case "script":
        return <ScriptWork item={work} variant="theatre-mobile" priority="lazy" />;
      case "poster":
        return <PosterWork item={work} variant="theatre-mobile" priority="lazy" />;
      default:
        return <EditWork item={work} variant="theatre-mobile" priority="lazy" />;
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-zinc-900/40 border border-white/5 active:scale-[0.98] transition-transform ${
        forceFill ? "h-full" : slot.aspectClass
      } ${getWorkKind(item) === "script" ? "bg-[#f4f1ea] border-black/5" : ""}`}
    >
      {renderWork(item)}
    </div>
  );
});
