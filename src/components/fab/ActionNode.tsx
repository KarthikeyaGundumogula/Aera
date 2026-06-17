/**
 * ActionNode.tsx
 *
 * A single radial action node rendered on the FAB arc.
 * Positioned by angleDeg relative to the centre of the FAB.
 */
import React from "react";
import { motion } from "motion/react";

/** Radius of the arc in px — must match the parent FAB constants. */
export const ARC_RADIUS = 110;

interface ActionNodeProps {
  icon: React.ReactNode;
  label: string;
  angleDeg: number;
  delay: number;
  onClick: () => void;
}

export function ActionNode({ icon, label, angleDeg, delay, onClick }: ActionNodeProps) {
  const angleRad = angleDeg * (Math.PI / 180);
  const targetX = Math.cos(angleRad) * ARC_RADIUS;
  const targetY = Math.sin(angleRad) * ARC_RADIUS;

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
      animate={{ x: targetX, y: targetY, opacity: 1, scale: 1 }}
      exit={{ x: 0, y: 0, opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay }}
      className="absolute top-1/2 left-1/2 -mt-6 z-[110] flex items-center justify-end"
      // Shift 240px container so rightmost 48px is at the FAB center
      style={{ width: 240, marginLeft: -216 }}
    >
      {/* High-Contrast Telemetry Hint */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="mr-3 pointer-events-none flex flex-col items-end"
      >
        <div className="flex items-center gap-2 bg-[#050505]/60 px-2.5 py-1 rounded-sm backdrop-blur-xl border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <span className="text-[7px] font-mono font-bold text-[#D97706] uppercase tracking-widest opacity-80">
            {label.split(" ")[1] ? label.split(" ")[1].substring(0, 3) : "ACT"} //
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] whitespace-nowrap">
            {label}
          </span>
        </div>
      </motion.div>

      {/* Raw Icon (no background, blends perfectly into the arc) */}
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.15 }}
        className="w-12 h-12 shrink-0 flex items-center justify-center text-white/80 hover:text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] focus:outline-none transition-all duration-300"
      >
        {icon}
      </motion.button>
    </motion.div>
  );
}
