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
  className?: string;
}

/**
 * A single card rendered inside a mobile cluster.
 * The card stretches to fill its parent grid cell (`h-full`), as the CSS Grid
 * handles all geometric constraints and aspect ratios automatically.
 */
export const MobileCard = memo(function MobileCard({
  slot,
  className = "",
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
      className={`relative w-full h-full overflow-hidden bg-zinc-900/40 active:scale-[0.98] transition-transform ${
        getWorkKind(item) === "script" ? "bg-[#f4f1ea]" : ""
      } ${className}`}
    >
      {renderWork(item)}
    </div>
  );
});
