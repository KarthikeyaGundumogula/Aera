import { useMotionValue, useSpring, AnimatePresence } from "motion/react";
import React, { useEffect, useRef, useMemo, useState } from "react";

import { GRID_ITEMS } from "../../../../mock";
import { buildClusters } from "../../engine/clusterBuilder";
import { DesktopCluster } from "./DesktopCluster";
import { CLUSTER_WIDTH, CLUSTER_HEIGHT, CLUSTER_GAP } from "../../constants";
import { FeedContext } from "../../../../context/FeedContext";
import type { TheatreItem } from "../../../../types";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DesktopCanvasProps {
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
export function DesktopCanvas({ onScroll }: DesktopCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // React state for sizing
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, w: 0, h: 0 });
  
  // Culling state: only updates when camera moves significantly to prevent 60fps re-renders
  const [cullingViewport, setCullingViewport] = useState<Viewport>({ x: 0, y: 0, w: 0, h: 0 });
  const lastCullingPos = useRef({ x: 0, y: 0 });

  // Pre-compute cluster pool once from mock data
  const clusterPool = useMemo(() => buildClusters(GRID_ITEMS), []);
  const flatItems = useMemo(
    () => clusterPool.flatMap((c) => c.slots.map((s) => s.item).filter((item): item is TheatreItem => item != null)),
    [clusterPool]
  );

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
      const initialViewport = { x: 0, y: 0, w: width, h: height };
      setViewport(initialViewport);
      setCullingViewport(initialViewport);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // ── Sync culling position with spring camera (THROTTLED) ────────────────
  useEffect(() => {
    const syncPos = () => {
      const x = -springX.get();
      const y = -springY.get();
      
      // Update header visibility on every frame (cheap, doesn't re-render Canvas)
      onScroll?.(-y);

      // Only update culling state if camera moved > 50px
      // This reduces React re-renders from 60fps to near-zero during slow pans
      const dx = Math.abs(x - lastCullingPos.current.x);
      const dy = Math.abs(y - lastCullingPos.current.y);
      
      if (dx > 50 || dy > 50) {
        lastCullingPos.current = { x, y };
        setCullingViewport(prev => ({ ...prev, x, y }));
      }
    };

    const unsubX = springX.on("change", syncPos);
    const unsubY = springY.on("change", syncPos);
    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY, onScroll]);

  // ── Visible cluster culling ───────────────────────────────────────────
  const visibleCells = useMemo(() => {
    const cellW = CLUSTER_WIDTH + CLUSTER_GAP;
    const cellH = CLUSTER_HEIGHT + CLUSTER_GAP;

    // Use cullingViewport (stable) instead of raw frame-by-frame position
    const startCol = Math.floor(cullingViewport.x / cellW) - 1;
    const endCol = Math.ceil((cullingViewport.x + cullingViewport.w) / cellW) + 1;
    const startRow = Math.floor((cullingViewport.y - 61) / cellH) - 1;
    const endRow = Math.ceil((cullingViewport.y + cullingViewport.h - 61) / cellH) + 1;

    const cells: { x: number; y: number }[] = [];
    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        if (row >= 0) {
          cells.push({ x: col, y: row });
        }
      }
    }
    return cells;
  }, [cullingViewport]);

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
    <FeedContext.Provider value={flatItems}>
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-transparent cursor-grab active:cursor-grabbing select-none overscroll-none touch-none"
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
      {visibleCells.map(({ x, y }) => {
        // Bit-mixing hash: spreads (x, y) more uniformly across the pool.
        // Uses Cantor pairing + multiplicative mixing to minimise adjacent collisions
        // even when clusterPool is small (e.g. 5–10 clusters).
        const cantor  = ((x + y) * (x + y + 1)) / 2 + y;
        const mixed   = Math.abs((cantor * 2654435761) >>> 0); // Knuth multiplicative hash
        const index = mixed % clusterPool.length;
        return (
          <DesktopCluster
            key={`${x}-${y}`}
            gridX={x}
            gridY={y}
            cluster={clusterPool[index]}
            camX={springX}
            camY={springY}
          />
        );
      })}

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
              location: {Math.floor(cullingViewport.x)}, {Math.floor(cullingViewport.y)}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
              Return to Origin
            </span>
          </p>
        </button>
      </div>
      </div>
    </FeedContext.Provider>
  );
}
