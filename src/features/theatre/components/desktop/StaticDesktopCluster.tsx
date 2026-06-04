import { memo } from "react";
import { motion, useTransform, MotionValue } from "motion/react";
import { Cluster } from "../../engine/clusterBuilder";
import { DesktopCanvasCard } from "./DesktopCanvasCard";

interface StaticDesktopClusterProps {
  cluster: Cluster;
  compact?: boolean;
}

/**
 * Renders a cluster block for standard Y-axis page flow (non-canvas).
 * Dynamically computes grid dimensions from the cluster's slot data,
 * supporting both 12×9 (canvas) and 16×8 (flow) templates.
 */
export const StaticDesktopCluster = memo(function StaticDesktopCluster({
  cluster,
  compact = false,
}: StaticDesktopClusterProps) {
  // Derive grid dimensions from the template's own slot data
  const cols = cluster.slots.reduce((max, s) => Math.max(max, s.x + s.w), 0);
  const rows = cluster.slots.reduce((max, s) => Math.max(max, s.y + s.h), 0);

  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        height: compact ? `clamp(280px, 31.5vw, 465px)` : `clamp(360px, 42vw, 620px)`,
        gap: "0px",
      }}
    >
      {cluster.slots.map((slot, idx) =>
        slot.item && (
          <DesktopCanvasCard
            key={`${cluster.type}-${idx}-${slot.x}-${slot.y}`}
            slot={slot}
            item={slot.item}
          />
        )
      )}
    </div>
  );
});
