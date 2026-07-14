import { memo } from "react";
import { TheatreItem } from "../../../../types";
import { MobileSlot } from "../../engine/mobileClusterBuilder";
import {
  EditWork,
  PosterWork,
  StoryboardWork,
  RecommendationWork,
  getWorkKind,
} from "../../../shared/work";

// ─── Mobile Card ─────────────────────────────────────────────────────────────

interface MobileCardProps {
  slot: MobileSlot;
  className?: string;
}

/**
 * A single card rendered inside a mobile cluster grid cell.
 * Stretches to fill whatever space its parent gives it (`h-full`).
 * CSS Grid in MobileClusterView handles all geometry — no sizing logic here.
 */
export const MobileCard = memo(function MobileCard({
  slot,
  className = "",
}: MobileCardProps) {
  const { item } = slot;

  // Compute once per render — used for both the bg class and the render switch.
  const kind = getWorkKind(item);

  const renderWork = (work: TheatreItem) => {
    switch (kind) {
      case "recommendation":
        return <RecommendationWork item={work} variant="theatre-mobile" priority="lazy" />;
      case "storyboard":
        return <StoryboardWork item={work} variant="theatre-mobile" priority="lazy" />;
      case "poster":
        return <PosterWork item={work} variant="theatre-mobile" priority="lazy" />;
      default:
        return <EditWork item={work} variant="theatre-mobile" priority="lazy" />;
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-zinc-900/40 active:scale-[0.98] transition-transform ${
        kind === "storyboard" ? "bg-[#f4f1ea]" : ""
      } ${className}`}
    >
      {renderWork(item)}
    </div>
  );
});
