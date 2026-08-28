import { memo, useMemo } from "react";
import { Cluster } from "../../engine/clusterBuilder";
import { DesktopCanvasCard } from "./DesktopCanvasCard";

interface StaticDesktopClusterProps {
  cluster: Cluster;
  compact?: boolean;
}

/**
 * Renders a cluster block for standard Y-axis page flow (non-canvas).
 * Height is computed from the deepest row that actually has a real item,
 * so partially-filled clusters shrink instead of leaving blank gap rows.
 */
export const StaticDesktopCluster = memo(function StaticDesktopCluster({
  cluster,
  compact = false,
}: StaticDesktopClusterProps) {
  const { cols, rows, filledRows, activeSlots } = useMemo(() => {
    const allRows  = cluster.slots.reduce((max, s) => Math.max(max, s.y + s.h), 0);
    const allCols  = cluster.slots.reduce((max, s) => Math.max(max, s.x + s.w), 0);
    const active   = cluster.slots.filter(s => !!s.item);
    const realRows = active.reduce((max, s) => Math.max(max, s.y + s.h), 0);
    return { cols: allCols, rows: allRows, filledRows: realRows, activeSlots: active };
  }, [cluster]);

  // No real items — render nothing (no height gap).
  if (activeSlots.length === 0) return null;

  // Single item in cluster -> render as 1 clean, full-width cinematic banner tile
  if (activeSlots.length === 1) {
    const singleSlot = activeSlots[0];
    return (
      <div className="w-full aspect-[2.2/1] max-h-[400px] min-h-[220px] relative overflow-hidden flex items-center justify-center rounded-none">
        <DesktopCanvasCard
          slot={{ ...singleSlot, x: 0, y: 0, w: cols || 16, h: filledRows || 4 }}
          item={singleSlot.item!}
          className="w-full h-full"
        />
      </div>
    );
  }

  const fullHeight  = compact ? `clamp(280px, 31.5vw, 465px)` : `clamp(360px, 42vw, 620px)`;
  // Scale height proportionally to only the filled rows.
  const heightStyle = filledRows === rows
    ? fullHeight
    : `calc(${fullHeight} * ${filledRows} / ${rows})`;

  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${filledRows}, 1fr)`,
        height: heightStyle,
        gap: "0px",
      }}
    >
      {cluster.slots.map((slot, idx) =>
        slot.item && slot.y < filledRows && (
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
