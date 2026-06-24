import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SurgeScore } from "./SurgeScore";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SurgeInputSectionProps {
  score: number;
  peak?: number;
  onChange: (v: number) => void;
  /** Optional divider rendered above the score section (for use in Ledger) */
  withDivider?: boolean;
}

/**
 * SurgeInputSection
 *
 * Single source of truth for the score-input UI used in both
 * CreateRecommendationModal and LedgerEntryModal.
 *
 * Owns the peakFlash state so callers don't have to duplicate it.
 */
export function SurgeInputSection({
  score,
  peak,
  onChange,
  withDivider = false,
}: SurgeInputSectionProps) {
  const [peakFlash, setPeakFlash] = useState(false);

  return (
    <>
      {/* Optional divider (Ledger uses it) */}
      {withDivider && <div className="h-px bg-white/[0.04]" aria-hidden />}

      {/* Peak crossed flash overlay — rendered at the section level */}
      <AnimatePresence>
        {peakFlash && (
          <motion.div
            key="peak-flash"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="pointer-events-none absolute inset-0 z-50 rounded-2xl"
            style={{ background: "radial-gradient(circle at 70% 80%, rgba(239,68,68,0.18) 0%, transparent 70%)" }}
          />
        )}
      </AnimatePresence>

      {/* Score Component */}
      <div className="relative pb-1">
        <SurgeScore
          score={score}
          peak={peak}
          onChange={onChange}
          onPeakFlash={() => {
            setPeakFlash(true);
            setTimeout(() => setPeakFlash(false), 700);
          }}
        />
      </div>
    </>
  );
}
