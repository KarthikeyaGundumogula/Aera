import { motion } from "motion/react";
import { memo } from "react";
import { TheatreItem, SetSelectedItem } from "../../../../types";
import { ClusterSlot } from "../../engine/clusterBuilder";
import {
  EditWork,
  PosterWork,
  ScriptWork,
  getWorkKind,
} from "../../../shared/work";

// ─── Desktop Canvas Card ────────────────────────────────────────────────────

interface DesktopCanvasCardProps {
  slot: ClusterSlot;
  item: TheatreItem;
  setSelectedItem: SetSelectedItem;
}

/**
 * A single card rendered inside a desktop cluster grid.
 * Positioned via CSS Grid using the slot's (x, y, w, h) values.
 */
export const DesktopCanvasCard = memo(function DesktopCanvasCard({
  slot,
  item,
  setSelectedItem,
}: DesktopCanvasCardProps) {
  const isPoster = getWorkKind(item) === "poster";

  const renderWork = (work: TheatreItem) => {
    switch (getWorkKind(work)) {
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
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(item, [item], 1);
      }}
      className={`relative group overflow-hidden border border-white/10 bg-zinc-900/20 rounded-sm transition-all duration-500 ${isPoster ? "ring-1 ring-white/5" : ""}`}
      style={{
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
      }}
    >
      {renderWork(item)}
    </motion.div>
  );
});
