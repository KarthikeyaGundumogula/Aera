import { memo } from "react";
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
  const item = slot?.item;

  // Slot has no item — return null (no empty box)
  if (!item) return null;

  const kind = getWorkKind(item);
  const isStoryboard = kind === "storyboard";

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-zinc-900/40 active:scale-[0.98] transition-transform ${
        isStoryboard ? "bg-[#f4f1ea]" : ""
      } ${className}`}
    >
      {kind === "recommendation" && <RecommendationWork item={item} variant="theatre-mobile" priority="lazy" />}
      {kind === "storyboard" && <StoryboardWork item={item} variant="theatre-mobile" priority="lazy" />}
      {kind === "poster" && <PosterWork item={item} variant="theatre-mobile" priority="lazy" />}
      {kind === "edit" && <EditWork item={item} variant="theatre-mobile" priority="lazy" />}
    </div>
  );
});
