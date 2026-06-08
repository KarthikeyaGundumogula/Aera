import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clapperboard } from "lucide-react";
import { RecommendationModal } from "./RecommendationModal";

/**
 * Emil skill — animation decision:
 * Frequency: Occasional (weekly rec reveal) → delight is justified.
 * Purpose:   State indication + a memorable moment.
 * Easing:    cubic-bezier(0.23, 1, 0.32, 1) — Emil's strong ease-out.
 *
 * FAB click sequence:
 *   1. Press: scale(0.9) + clapperboard arm snaps down (100ms)
 *   2. Frame flash: full-screen amber filmstrip pulse (80ms)
 *   3. Modal opens with clip-path letterbox reveal
 */
export function RecommendationFAB() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);

  function handleOpen() {
    if (isModalOpen) return;

    // Phase 1: snap the clapperboard arm
    setIsSnapping(true);

    // Phase 2: flash at ~80ms (arm is mid-snap)
    setTimeout(() => setFlashVisible(true), 80);

    // Phase 3: flash gone + modal opens at ~160ms
    setTimeout(() => {
      setFlashVisible(false);
      setIsModalOpen(true);
      setIsSnapping(false);
    }, 200);
  }

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────── */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 z-[100] group flex items-center justify-center w-14 h-14 rounded-full bg-[#0A0806]/90 backdrop-blur-xl border border-white/[0.10] shadow-[0_8px_40px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/60"
        aria-label="View this week's recommendation"
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 500, damping: 18, duration: 0.1 }}
      >
        {/*
          Clapperboard icon.
          Idle: slow periodic snap loop (arm rotates -12deg, like a clapper marking takes).
          On click (isSnapping): hard fast snap — arm rotates -22deg and back in 200ms.
          Emil: spring for "alive" feel on snap; asymmetric timing (snap down fast, return slow).
        */}
        <motion.div
          animate={
            isSnapping
              ? { rotate: [0, -24, -8, 0], y: [0, -3, -1, 0] }
              : { rotate: [0, -12, 0, 0, 0], y: [0, -2, 0, 0, 0] }
          }
          transition={
            isSnapping
              ? { duration: 0.18, ease: [0.23, 1, 0.32, 1] }
              : {
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut",
                }
          }
          className="relative"
        >
          <Clapperboard
            className="w-6 h-6 text-white/70 group-hover:text-[#D97706] transition-colors duration-300"
            strokeWidth={1.75}
          />
        </motion.div>

        {/* Amber ambient glow — grows on hover */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ boxShadow: "0 0 0px 0px rgba(217,119,6,0)" }}
          whileHover={{ boxShadow: "0 0 28px 8px rgba(217,119,6,0.28)" }}
          transition={{ duration: 0.4 }}
        />

        {/* Border pulse on hover */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#D97706]/0 group-hover:border-[#D97706]/35 transition-all duration-400 pointer-events-none"
        />
      </motion.button>

      {/* ── Filmstrip flash ─────────────────────────────────────
          A full-viewport amber/white horizontal band that expands
          from the FAB position center, like a projector gate flash.
          Uses clip-path: inset() — Emil's recommended tool for reveals.
          Duration: 80ms in, immediate out — purely perceptual bridge.
      ── */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[190] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06, ease: "linear" }}
            style={{
              background:
                "linear-gradient(180deg, transparent 35%, rgba(217,119,6,0.07) 50%, transparent 65%)",
            }}
          >
            {/* Center horizontal slit — the projector gate */}
            <motion.div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
              initial={{ scaleX: 0, height: "2px", opacity: 1 }}
              animate={{ scaleX: 1, height: "2px", opacity: 0 }}
              transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D97706 20%, #fff 50%, #D97706 80%, transparent)",
                boxShadow: "0 0 60px 20px rgba(217,119,6,0.6)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ───────────────────────────────────────────── */}
      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
