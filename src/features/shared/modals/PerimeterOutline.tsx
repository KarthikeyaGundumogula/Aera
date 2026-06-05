import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PerimeterOutlineProps {
  /** When true the outline traces itself around the frame */
  isActive: boolean;
  /** Border radius of the parent card — must match the card's rounded-[Xpx] value */
  radius?: number;
}

/**
 * PerimeterOutline — Cinematic Crimson (#E11D48) SVG outline that traces
 * the perimeter of its positioned parent when isActive = true.
 *
 * Mount this as a direct child of the modal card div (position: relative).
 * It is absolute-inset and pointer-events-none so it never interferes with UX.
 *
 * Animation:
 *   ON  → line draws clockwise in ~600ms, then dims to a soft persistent glow.
 *   OFF → line un-draws and fades out.
 */
export const PerimeterOutline: React.FC<PerimeterOutlineProps> = ({
  isActive,
  radius = 28,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  // Track the parent's exact pixel dimensions
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;

    const measure = () => {
      setDims({ w: el.offsetWidth, h: el.offsetHeight });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;

  // SVG rect perimeter = 2*(w + h) − 8*radius*(1 − π/4)
  // For simplicity we use 2*(w-1 + h-1) as close-enough (±1% error)
  const perimeter = w > 0 && h > 0 ? 2 * (w - 1 + h - 1) : 0;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 rounded-[28px] pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      <AnimatePresence>
        {isActive && w > 0 && h > 0 && (
          <motion.svg
            key="perimeter-svg"
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            {/* Soft outer glow layer (static while active) */}
            <motion.rect
              x={2}
              y={2}
              width={w - 4}
              height={h - 4}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="#E11D48"
              strokeWidth={6}
              strokeOpacity={0}
              initial={{ strokeOpacity: 0 }}
              animate={{ strokeOpacity: 0.12 }}
              exit={{ strokeOpacity: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{
                filter: "blur(8px)",
              }}
            />

            {/* Main tracing line */}
            <motion.rect
              x={1}
              y={1}
              width={w - 2}
              height={h - 2}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="#E11D48"
              strokeWidth={1.5}
              strokeLinecap="round"
              initial={{
                strokeDasharray: perimeter,
                strokeDashoffset: perimeter,
                strokeOpacity: 0.9,
              }}
              animate={{
                strokeDashoffset: 0,
                strokeOpacity: [0.9, 0.9, 0.3],
              }}
              exit={{
                strokeDashoffset: -perimeter,
                strokeOpacity: 0,
              }}
              transition={{
                strokeDashoffset: {
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                },
                strokeOpacity: {
                  duration: 1.2,
                  times: [0, 0.5, 1],
                  ease: "easeOut",
                },
              }}
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </div>
  );
};
