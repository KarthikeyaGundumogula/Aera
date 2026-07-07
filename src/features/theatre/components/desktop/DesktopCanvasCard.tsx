import { memo } from "react";
import { motion } from "motion/react";
import { TheatreItem } from "../../../../types";
import { ClusterSlot } from "../../engine/clusterBuilder";
import { EditWork } from "../../../shared/work/EditWork";
import { PosterWork } from "../../../shared/work/PosterWork";
import { ScriptWork } from "../../../shared/work/ScriptWork";
import { RecommendationWork } from "../../../shared/work/RecommendationWork";
import { getWorkKind } from "../../../shared/work/types";

// ─── Desktop Canvas Card ────────────────────────────────────────────────────

interface DesktopCanvasCardProps {
  slot: ClusterSlot;
  item: TheatreItem;
}

/**
 * A single card rendered inside a desktop cluster grid.
 * Positioned via CSS Grid using the slot's (x, y, w, h) values.
 */
export const DesktopCanvasCard = memo(function DesktopCanvasCard({
  slot,
  item,
}: DesktopCanvasCardProps) {
  const kind = getWorkKind(item);
  const isPosterOrScript = kind === "poster" || kind === "script";

  const renderWork = (work: TheatreItem) => {
    switch (kind) {
      case "recommendation":
        return (
          <RecommendationWork
            item={work}
            variant="theatre-desktop"
            priority="lazy"
          />
        );
      case "script":
        return (
          <ScriptWork
            item={work}
            variant="theatre-desktop"
            priority="lazy"
          />
        );
      case "poster":
        return (
          <PosterWork
            item={work}
            variant="theatre-desktop"
            priority="lazy"
          />
        );
      default:
        return (
          <EditWork
            item={work}
            variant="theatre-desktop"
            priority="lazy"
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        zIndex: 20,
      }}
      className={`relative group overflow-hidden bg-zinc-900/20 ${isPosterOrScript ? 'rounded-none' : 'rounded-sm'} transition-all duration-500`}
      style={{
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
      }}
    >
      {renderWork(item)}
    </motion.div>
  );
});
