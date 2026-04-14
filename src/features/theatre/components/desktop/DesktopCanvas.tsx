import { useMotionValue, useSpring, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { SetSelectedItem } from "../../../../types";
import { GRID_ITEMS } from "../../../../mock";
import { buildClusters } from "../../engine/clusterBuilder";
import { DesktopCluster } from "./DesktopCluster";
import { CLUSTER_WIDTH, CLUSTER_HEIGHT, CLUSTER_GAP } from "../../constants";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DesktopCanvasProps {
  setSelectedItem: SetSelectedItem;
  /** Receives the camera Y spring value — used by TheatreLayout for header auto-hide. */
  onScroll?: (y: number) => void;
}

interface Viewport {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/** Clamp helper: prevents camera from going above/left of origin. */
function clampOrigin(value: number) {
  return Math.min(0, value);
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * The desktop infinite 2D canvas.
 *
 * Interaction model:
 * - Wheel → pans camera
 * - Click-drag → pans camera
 * - Touch-drag → pans camera (tablet fallback)
 *
 * Performance model:
 * - Only clusters within the viewport (+ 1 buffer) are mounted.
 * - Camera position uses `useSpring` for 60fps interpolation.
 * - Cluster data is pre-computed once via `buildClusters`.
 */
export function DesktopCanvas({ setSelectedItem, onScroll }: DesktopCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, w: 0, h: 0 });

  // Pre-compute cluster pool once from mock data
  const clusterPool = useMemo(() => buildClusters(GRID_ITEMS), []);

  // ── Camera ──────────────────────────────────────────────────────────────
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const springX = useSpring(camX, { damping: 30, stiffness: 200 });
  const springY = useSpring(camY, { damping: 30, stiffness: 200 });

  // ── Container sizing ──────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setViewport((prev) => ({ ...prev, w: width, h: height }));
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // ── Sync viewport position with spring camera ─────────────────────────
  useEffect(() => {
    const syncPos = () =>
      setViewport((prev) => ({ ...prev, x: -springX.get(), y: -springY.get() }));

    const unsubX = springX.on("change", syncPos);
    const unsubY = springY.on("change", (v) => {
      syncPos();
      onScroll?.(v);
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY, onScroll]);

  // ── Visible cluster culling ───────────────────────────────────────────
  const visibleCells = useMemo(() => {
    const cellW = CLUSTER_WIDTH + CLUSTER_GAP;
    const cellH = CLUSTER_HEIGHT + CLUSTER_GAP;

    const startCol = Math.floor(viewport.x / cellW) - 1;
    const endCol = Math.ceil((viewport.x + viewport.w) / cellW) + 1;
    const startRow = Math.floor(viewport.y / cellH) - 1;
    const endRow = Math.ceil((viewport.y + viewport.h) / cellH) + 1;

    const cells: { x: number; y: number }[] = [];
    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        cells.push({ x: col, y: row });
      }
    }
    return cells;
  }, [viewport.x, viewport.y, viewport.w, viewport.h]);

  // ── Input Handlers ────────────────────────────────────────────────────
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onWheel = (e: React.WheelEvent) => {
    camX.set(clampOrigin(camX.get() - e.deltaX));
    camY.set(clampOrigin(camY.get() - e.deltaY));
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    isDragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    camX.set(clampOrigin(camX.get() + dx));
    camY.set(clampOrigin(camY.get() + dy));
    lastPos.current = { x: clientX, y: clientY };
  };

  const onPointerUp = () => {
    isDragging.current = false;
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black cursor-grab active:cursor-grabbing select-none overscroll-none touch-none"
      onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
      onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
      onMouseUp={onPointerUp}
      onMouseLeave={onPointerUp}
      onWheel={onWheel}
      onTouchStart={(e) => onPointerDown(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => onPointerMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={onPointerUp}
    >
      {/* Infinite cluster field */}
      <AnimatePresence mode="popLayout">
        {visibleCells.map(({ x, y }) => {
          const index = Math.abs((x * 31 + y * 17) % clusterPool.length);
          return (
            <DesktopCluster
              key={`${x}-${y}`}
              gridX={x}
              gridY={y}
              cluster={clusterPool[index]}
              camX={springX}
              camY={springY}
              setSelectedItem={setSelectedItem}
            />
          );
        })}
      </AnimatePresence>

      {/* Coordinate HUD */}
      <div className="absolute bottom-8 left-8 z-50">
        <button
          onClick={() => {
            camX.set(0);
            camY.set(0);
          }}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors flex items-center gap-2">
            <span>
              location: {Math.floor(viewport.x)}, {Math.floor(viewport.y)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              Return to Origin
            </span>
          </p>
        </button>
      </div>
    </div>
  );
}
