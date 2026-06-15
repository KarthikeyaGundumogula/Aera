import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Film, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModalWrapper } from "../features/shared/modals/ModalWrapper";
import { MOCK_RECOMMENDATIONS } from "../mock/recommendations";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}



/**
 * Emil skill — card swipe variants:
 * Enter: from ±60px off-screen edge — subtle, not theatrical.
 * Exit:  to ±160px — decisive, faster than enter (asymmetric).
 * blur(4px) on exit hides the crossfade overlap between old/new card.
 * Emil: "Use blur to mask imperfect transitions."
 */
const cardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    x: dir > 0 ? 160 : -160,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

export function RecommendationModal({
  isOpen,
  onClose,
}: RecommendationModalProps) {
  const navigate = useNavigate();
  const recs = MOCK_RECOMMENDATIONS;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isEndScreen, setIsEndScreen] = useState(false);
  const isDragging = useRef(false);
  // Ref mirror of index — avoids stale closure when rapid swipes fire
  // before React has committed the state update.
  const indexRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setDirection(0);
      setIsEndScreen(false);
    }
  }, [isOpen]);

  const rec = recs[index];

  function navigateToIndex(next: number, dir: number) {
    if (next >= recs.length) {
      setIsEndScreen(true);
      setTimeout(() => {
        indexRef.current = 0;
        setIndex(0);
        setDirection(-1);
        setIsEndScreen(false);
      }, 1800);
      return;
    }
    if (next < 0) return;
    setDirection(dir);
    indexRef.current = next;
    setIndex(next);
  }

  function goNext() {
    navigateToIndex(indexRef.current + 1, -1);
  }
  function goPrev() {
    navigateToIndex(indexRef.current - 1, 1);
  }

  if (!rec && !isEndScreen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[200]"
      isImmersive
    >
      {/* Close button positioned fixed outside the swipeable stack */}
      <AnimatePresence>
        {isOpen && (
          <motion.button
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-8 right-8 z-[210] p-2.5 rounded-full bg-black/60 border border-white/[0.08] text-white/50 hover:text-white hover:bg-black/80 hover:border-white/30 backdrop-blur-md transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-0 pointer-events-none"
            initial={{
              opacity: 0,
              scale: 0.92,
              filter: "blur(12px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              filter: "blur(6px)",
            }}
            transition={{
              opacity: { duration: 0.5, ease: "linear" },
              scale: { duration: 1.1, ease: [0.23, 1, 0.32, 1] },
              filter: { duration: 0.7, ease: "easeOut" },
            }}
          >
            {/* ── Above-card header: context label + genre tags ─── */}
            <AnimatePresence mode="wait">
              {!isEndScreen && rec && (
                <motion.div
                  key={`header-${index}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{
                    duration: 0.28,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className="flex items-center justify-between w-[360px] sm:w-[440px] mb-3 px-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B45309] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#B45309]" />
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#B45309]">
                      {rec.contextLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {rec.original.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="text-[7px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/28 bg-white/[0.02]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STATIC CARD SHELL ── */}
            <article
              className="relative w-[360px] sm:w-[440px] overflow-hidden rounded-2xl border border-white/15 bg-[#080604] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_70%)] touch-none pointer-events-auto"
              style={{
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <AnimatePresence mode="wait" custom={direction}>
              {isEndScreen ? (
                /* ── End screen ──────────────────────────────── */
                <motion.div
                  key="end-screen"
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: {
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                      mass: 0.8,
                    },
                    opacity: { duration: 0.18 },
                    filter: { duration: 0.18 },
                  }}
                  className="flex flex-col items-center justify-center py-16 px-8 text-center pointer-events-auto"
                >
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.08,
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <Film
                      className="w-8 h-8 text-[#B45309]/50 mx-auto mb-4"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <motion.p
                    className="text-[8px] font-black uppercase tracking-[0.45em] text-[#B45309] mb-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.16,
                      duration: 0.25,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    All caught up
                  </motion.p>
                  <motion.p
                    className="text-[10px] text-white/25 leading-relaxed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.22,
                      duration: 0.25,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    Looping back to the first reel
                  </motion.p>
                </motion.div>
              ) : (
                /* ── Recommendation card content ─────────────── */
                <motion.div
                  key={`rec-${rec.id}`}
                  custom={direction}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragStart={() => {
                    isDragging.current = true;
                  }}
                  onDragEnd={(_e, info) => {
                    const OFFSET = 50;
                    const VEL = 400;
                    if (info.offset.x < -OFFSET || info.velocity.x < -VEL)
                      goNext();
                    else if (info.offset.x > OFFSET || info.velocity.x > VEL)
                      goPrev();
                    else {
                      setTimeout(() => {
                        isDragging.current = false;
                      }, 80);
                    }
                  }}
                  transition={{
                    x: {
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                      mass: 0.8,
                    },
                    opacity: { duration: 0.18 },
                    filter: { duration: 0.18 },
                  }}
                  onClickCapture={(e) => {
                    if (isDragging.current) {
                      e.stopPropagation();
                      isDragging.current = false;
                    }
                  }}
                  className="flex flex-col items-center pointer-events-auto w-full"
                >
                  <RecommendationCard rec={rec} variant="modal" />
                </motion.div>
              )}
            </AnimatePresence>
            </article>

            {/* ── Dot indicators ─── */}
                  <div className="flex items-center justify-center gap-1.5 mt-6 w-full pointer-events-none">
                    {recs.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDirection(i > index ? -1 : 1);
                          setIndex(i);
                        }}
                        aria-label={`Go to recommendation ${i + 1}`}
                        className="relative flex items-center justify-center p-1 pointer-events-auto cursor-pointer hover:opacity-100 transition-opacity"
                        style={{ opacity: i === index ? 1 : i < index ? 0.4 : 0.2 }}
                      >
                        <motion.span
                          animate={{
                            width: i === index ? 16 : 5,
                            background:
                              i === index
                                ? "#B45309"
                                : "rgba(255,255,255,0.15)",
                          }}
                          transition={{
                            duration: 0.25,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          className="block h-[4px] rounded-full"
                          style={{ minWidth: 5 }}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
    </ModalWrapper>
  );
}
