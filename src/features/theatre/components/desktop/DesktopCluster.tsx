import { motion, useTransform, MotionValue } from "motion/react";
import { memo } from "react";
import { SetSelectedItem } from "../../../../types";
import { Cluster } from "../../engine/clusterBuilder";
import { DesktopCanvasCard } from "./DesktopCanvasCard";
import { CLUSTER_WIDTH, CLUSTER_HEIGHT, CLUSTER_GAP } from "../../constants";

interface DesktopClusterProps {
  /** Grid coordinate of this cluster in the infinite world. */
  gridX: number;
  gridY: number;
  /** The pre-computed cluster data (template type + filled slots). */
  cluster: Cluster;
  /** Spring-animated camera position supplied by the parent canvas. */
  camX: MotionValue<number>;
  camY: MotionValue<number>;
  setSelectedItem: SetSelectedItem;
}

/**
 * Renders one cluster block on the infinite canvas.
 *
 * World-position is derived from (gridX, gridY) × cluster dimensions,
 * then offset by the camera's current position via `useTransform`.
 */
export const DesktopCluster = memo(function DesktopCluster({
  gridX,
  gridY,
  cluster,
  camX,
  camY,
  setSelectedItem,
}: DesktopClusterProps) {
  const worldX = gridX * (CLUSTER_WIDTH + CLUSTER_GAP);
  const worldY = gridY * (CLUSTER_HEIGHT + CLUSTER_GAP);

  const screenX = useTransform(camX, (cam: number) => cam + worldX);
  const screenY = useTransform(camY, (cam: number) => cam + worldY);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-0 left-0"
      style={{
        x: screenX,
        y: screenY,
        width: CLUSTER_WIDTH,
        height: CLUSTER_HEIGHT,
      }}
    >
      <div className="grid grid-cols-12 grid-rows-9 w-full h-full gap-1">
        {cluster.slots.map(
          (slot) =>
            slot.item && (
              <DesktopCanvasCard
                key={`${slot.x}-${slot.y}`}
                slot={slot}
                item={slot.item}
                setSelectedItem={setSelectedItem}
              />
            ),
        )}
      </div>
    </motion.div>
  );
});
