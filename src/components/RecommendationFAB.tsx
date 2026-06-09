import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clapperboard, X } from "lucide-react";
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
  const [showHint, setShowHint] = useState(true);

  function handleOpen() {
    setShowHint(false);
    if (isModalOpen) return;

    // Phase 1: snap the clapperboard arm
    setIsSnapping(true);

    // Phase 2: flash fires at 120ms (arm hits the board)
    setTimeout(() => setFlashVisible(true), 120);

    // Phase 3: Modal opens at ~400ms — just before the line reaches full width
    // (line peaks at t=0.22 of 1400ms = 308ms + 120ms offset = ~428ms)
    // Card tears open AS the light blazes across, not after.
    setTimeout(() => {
      setIsModalOpen(true);
      setIsSnapping(false);
    }, 400);

    // Phase 4: Flash unmounts at 1520ms — after its full 1.4s animation completes
    // By this point the flash is already opacity:0 so unmount is invisible.
    setTimeout(() => {
      setFlashVisible(false);
    }, 1520);
  }

  return (
    <>
      {/* ── First-Time Hint Bubble ────────────────────────────── */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-[164px] right-5 md:bottom-[108px] md:right-10 z-[90] flex items-center gap-3 bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-2xl py-3 px-4 shadow-[0_8px_32px_rgba(180,83,9,0.2)] origin-bottom-right pointer-events-auto"
          >
            <div className="flex flex-col pr-1 cursor-pointer" onClick={() => handleOpen()}>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#B45309] mb-0.5">Discover</span>
              <span className="text-[11px] font-medium text-white/90 whitespace-nowrap">This Week's Picks</span>
            </div>
            <span className="relative flex h-2 w-2 shrink-0 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B45309] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B45309]"></span>
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
              className="p-1 -mr-2 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Dismiss hint"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            {/* Small tail pointing down to the FAB */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0A0806] border-b border-r border-[#B45309]/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* Amber ambient glow — grows on hover. Also pulses gently if hint is visible. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ boxShadow: "0 0 0px 0px rgba(180,83,9,0)" }}
          animate={showHint ? { 
            boxShadow: ["0 0 0px 0px rgba(180,83,9,0)", "0 0 24px 4px rgba(180,83,9,0.25)", "0 0 0px 0px rgba(180,83,9,0)"] 
          } : {}}
          whileHover={{ boxShadow: "0 0 28px 8px rgba(180,83,9,0.35)" }}
          transition={showHint ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
        />

        {/* Persistent amber border */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-[#B45309]/40 group-hover:border-[#B45309]/70 transition-all duration-400 pointer-events-none"
        />
      </motion.button>

      {/*
        ── Filmstrip flash ──────────────────────────────────────
        ONE unified element — not a wrapper + inner line.

        Sequence (1.4s total):
          t=0.00 – 0.20:  Line shoots from center outward. Ambient bloom builds.
          t=0.20 – 0.50:  Line at full width. Both at peak brightness.
          t=0.50 – 1.00:  Card is tearing open beneath. Flash fades together.
                          No separate "line disappears then glow disappears" cut.

        The card reveal starts when this element is at peak (t=0.25 absolute
        timeline, i.e. 120ms offset + 1400*0.25 ≈ 470ms — we trigger at 400ms
        so the card tears open just as the line blazes fully across).

        Key: height stays CONSTANT at 1px. Opacity is the ONLY thing that fades.
        No height collapse, no scaleX overshoot — just a clean arc in, hold, out.
      ── */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[210] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.6,
              /**
               * Linear easing on the wrapper so the ambient bloom fades at a
               * perfectly constant rate — no acceleration mid-fade that would
               * make the cutover to the card feel abrupt.
               */
              ease: "linear",
              times: [0, 0.18, 0.62, 1],
            }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            style={{
              background:
                "radial-gradient(ellipse 90% 35% at 50% 50%, rgba(180,83,9,0.18) 0%, transparent 70%)",
            }}
          >
            {/* The razor slit — shoots across cleanly, no bounce, no height change */}
            <motion.div
              className="absolute left-0 right-0"
              style={{
                top: "50%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(180,83,9,0.9) 20%, #fff3e0 50%, rgba(180,83,9,0.9) 80%, transparent)",
                boxShadow: "0 0 100px 32px rgba(180,83,9,0.85)",
                filter: "brightness(1.6)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 1, 1],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.6,
                /**
                 * Strong ease-out for the shoot-across phase (fast start),
                 * then linear for the fade so it bleeds out at a constant
                 * rate in sync with the wrapper — no visual discontinuity.
                 */
                ease: [0.23, 1, 0.32, 1],
                times: [0, 0.18, 0.62, 1],
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
