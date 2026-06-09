import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, X, Zap, ChevronDown, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModalWrapper } from "../features/shared/modals/ModalWrapper";
import { StageIcon } from "./icons/AppIcons";
import { MOCK_RECOMMENDATIONS } from "../mock/recommendations";
import { ArtistProfile } from "../features/shared/profile/ArtistProfile";
import { OriginalArtist } from "../types";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatScore(n: number): string {
  return n.toString();
}

const NOTES_CLIP = 150;

/**
 * Emil skill — swipe mechanics:
 * Momentum-based: velocity > 0.11 OR distance > 100px triggers navigation.
 * Emil: "Don't require dragging past a threshold. Calculate velocity."
 * Note: Emil's skill specifies 0.11 as the velocity threshold.
 */
const SWIPE_VELOCITY_THRESHOLD = 0.11;
const SWIPE_DISTANCE_THRESHOLD = 100;

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

/**
 * Emil — stagger delays for initial card content reveal.
 * 30–80ms between elements. Stagger is decorative — never block interaction.
 * All delays are relative to the outer clip-path reveal completing (~1.1s).
 */
const STAGGER = {
  poster:   0.05,
  score:    0.12,
  artist:   0.19,
  notes:    0.26,
  presence: 0.33,
  actions:  0.40,
  dots:     0.46,
};

/** Per-card interaction state keyed by rec id */
type CardState = Record<string, { boosted: boolean; inLedger: boolean; notesExpanded: boolean }>;

export function RecommendationModal({ isOpen, onClose }: RecommendationModalProps) {
  const navigate = useNavigate();
  const recs = MOCK_RECOMMENDATIONS;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [cardState, setCardState] = useState<CardState>({});
  const [isEndScreen, setIsEndScreen] = useState(false);
  const [hasRevealedOnce, setHasRevealedOnce] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; time: number } | null>(null);
  // Ref mirror of index — avoids stale closure when rapid swipes fire
  // before React has committed the state update.
  const indexRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setDirection(0);
      setCardState({});
      setIsEndScreen(false);
      setHasRevealedOnce(false);
      setIsArtistModalOpen(false);
      // Mark reveal done after stagger completes so subsequent swipes don't re-stagger
      const t = setTimeout(() => setHasRevealedOnce(true), 1600);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const rec = recs[index];
  const state = cardState[rec?.id] ?? { boosted: false, inLedger: false, notesExpanded: false };

  function setRecState(id: string, patch: Partial<typeof state>) {
    setCardState((prev) => ({
      ...prev,
      [id]: { ...{ boosted: false, inLedger: false, notesExpanded: false }, ...prev[id], ...patch },
    }));
  }

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

  function goNext() { navigateToIndex(indexRef.current + 1, -1); }
  function goPrev() { navigateToIndex(indexRef.current - 1, 1); }

  // Emil: momentum-based drag — velocity > 0.11 OR distance > 100px.
  // setPointerCapture ensures we keep receiving pointer events even if the
  // pointer leaves the article boundary mid-swipe (critical for short swipes).
  function onDragStart(e: React.PointerEvent) {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, time: Date.now() };
    // Capture pointer so events keep firing even outside the element.
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onDragMove() {
    if (dragStart.current) isDragging.current = true;
  }

  function onDragEnd(e: React.PointerEvent) {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dt = Date.now() - dragStart.current.time;
    const velocity = Math.abs(dx) / dt;
    dragStart.current = null;

    const isSwipe = Math.abs(dx) > SWIPE_DISTANCE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
    if (!isSwipe) {
      isDragging.current = false;
      return;
    }

    if (dx < 0) goNext();
    else goPrev();
  }
  if (!rec && !isEndScreen) return null;

  const notesIsLong = rec ? rec.notes.length > NOTES_CLIP : false;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} zIndex="z-[200]" isImmersive>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative w-full max-w-2xl mx-auto px-4 sm:px-0"
            /**
             * Emil skill — clip-path letterbox reveal:
             * Initial: razor slit at center (inset 48% top/bottom).
             * Final: full card, rounded corners.
             * scale 0.92 → 1 + blur 12px → 0 makes the card "focus pull" into
             * existence rather than just expanding.
             * Exit: faster (200ms vs 1.1s enter) — Emil's asymmetric rule.
             */
            initial={{ clipPath: "inset(48% 2% 48% 2% round 4px)", opacity: 0, scale: 0.92, filter: "blur(12px)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 16px)", opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ clipPath: "inset(48% 2% 48% 2% round 4px)", opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            transition={{
              clipPath: { duration: 1.1, ease: [0.23, 1, 0.32, 1] },
              opacity:  { duration: 0.5, ease: "linear" },
              scale:    { duration: 1.1, ease: [0.23, 1, 0.32, 1] },
              filter:   { duration: 0.7, ease: "easeOut" },
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
                  transition={{ delay: hasRevealedOnce ? 0 : 0.85, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-between mb-3 px-1"
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
                    {rec.original.genres.map((genre) => (
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

            {/* ── CARD shell — drag target ──────────────────────── */}
            <article
              className="relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080604] touch-none"
              style={{ boxShadow: "0 48px 120px rgba(0,0,0,0.92), inset 0 0 0 1px rgba(255,255,255,0.03)" }}
            >
              {/* Film grain overlay */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none z-10 rounded-2xl opacity-[0.05]"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")",
                  mixBlendMode: "overlay",
                }}
              />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/70 border border-white/[0.06] text-white/30 hover:text-white hover:border-white/20 transition-all duration-200"
                aria-label="Close"
                onPointerDown={(e) => e.stopPropagation()}
                style={{ transition: "color 150ms ease-out, border-color 150ms ease-out, transform 100ms ease-out" }}
              >
                <X className="w-3 h-3" />
              </button>

              {/* ── CARD CONTENT — swipe-animated ────────────────── */}
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
                      x: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
                      opacity: { duration: 0.18 },
                      filter: { duration: 0.18 },
                    }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Film className="w-8 h-8 text-[#B45309]/50 mx-auto mb-4" strokeWidth={1.5} />
                    </motion.div>
                    <motion.p
                      className="text-[8px] font-black uppercase tracking-[0.45em] text-[#B45309] mb-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                      All caught up
                    </motion.p>
                    <motion.p
                      className="text-[10px] text-white/25 leading-relaxed"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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
                    /**
                     * Emil skill — spring for drag interactions:
                     * "Springs feel more natural than duration-based animations
                     *  because they simulate real physics."
                     * The card physically follows the finger (dragElastic: 0.12)
                     * and snaps/throws based on velocity — identical feel in both
                     * directions because it's physics, not a fixed curve.
                     *
                     * Thresholds match Works carousel:
                     *   offset > 50px OR velocity > 400px/s → navigate
                     */
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragStart={() => { isDragging.current = true; }}
                    onDragEnd={(_e, info) => {
                      const OFFSET = 50;
                      const VEL = 400;
                      if (info.offset.x < -OFFSET || info.velocity.x < -VEL) goNext();
                      else if (info.offset.x > OFFSET || info.velocity.x > VEL) goPrev();
                      else {
                        // Not a swipe — reset flag after brief delay
                        // so click events aren't swallowed
                        setTimeout(() => { isDragging.current = false; }, 80);
                      }
                    }}
                    transition={{
                      x: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
                      opacity: { duration: 0.18 },
                      filter: { duration: 0.18 },
                    }}
                    onClickCapture={(e) => {
                      if (isDragging.current) {
                        e.stopPropagation();
                        isDragging.current = false;
                      }
                    }}
                  >
                    {/* ROW 1: Poster | Score + Artist + Notes */}
                    <div className="flex flex-row">
                      {/* Poster column */}
                      <motion.div
                        className="relative shrink-0 flex items-center justify-center bg-[#040302] py-5"
                        style={{ width: "36%", minWidth: "110px", maxWidth: "200px" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: hasRevealedOnce ? 0 : STAGGER.poster,
                          duration: 0.4,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                      >
                        <button
                          onClick={() => { onClose(); navigate(`/originals/${rec.original.id}`); }}
                          className="relative z-20 group focus-visible:outline-none"
                          style={{ width: "78%", aspectRatio: "2/3" }}
                          aria-label={`Go to ${rec.original.title}`}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <img
                            src={rec.original.coverImage}
                            alt={rec.original.title}
                            className="w-full h-full object-cover rounded-lg transition-[filter] duration-300 group-hover:brightness-[0.75]"
                            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.75), 0 2px 6px rgba(0,0,0,0.5)" }}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
                          {/* Title overlay */}
                          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-black/55" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-2.5 text-center">
                              <p className="text-[7px] font-black uppercase tracking-[0.45em] text-[#B45309] leading-none mb-1.5">
                                {rec.original.format}
                              </p>
                              <h3
                                className="font-black text-white uppercase leading-[1.05] line-clamp-4"
                                style={{ fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)", letterSpacing: "-0.02em", textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
                              >
                                {rec.original.title}
                              </h3>
                            </div>
                          </div>
                          {/* Hover hint */}
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-black/60 rounded-full px-2.5 py-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-white">View</span>
                            </div>
                          </div>
                        </button>
                      </motion.div>

                      {/* Right column — staggered on initial open */}
                      <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 pt-5">

                        {/* Score */}
                        <motion.button
                          className="mb-4 relative group w-fit cursor-help text-left focus:outline-none"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: hasRevealedOnce ? 0 : STAGGER.score,
                            duration: 0.35,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[7px] font-black uppercase tracking-[0.45em] text-white/20">
                              Recommendation Score
                            </p>
                            <svg className="w-2.5 h-2.5 text-white/15 group-hover:text-[#B45309]/80 group-focus:text-[#B45309]/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span
                            className="block font-black text-white leading-none tracking-tight"
                            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", textShadow: "0 0 28px rgba(255,255,255,0.07)" }}
                          >
                            {formatScore(rec.score)}
                          </span>

                          {/* Tooltip */}
                          <div className="absolute left-0 top-full mt-2 w-48 sm:w-56 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all duration-200 pointer-events-none z-50 origin-top-left">
                            <div className="bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(180,83,9,0.2)]">
                              <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                                How strongly the artist recommends this original.
                              </p>
                            </div>
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#0A0806] border-t border-l border-[#B45309]/30 rotate-45" />
                          </div>
                        </motion.button>

                        {/* Artist */}
                        <motion.div
                          className="flex items-center gap-2.5 mb-4 group cursor-pointer hover:bg-white/[0.04] p-1.5 -ml-1.5 rounded-xl transition-colors"
                          onClick={() => setIsArtistModalOpen(true)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: hasRevealedOnce ? 0 : STAGGER.artist,
                            duration: 0.35,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                        >
                          <img
                            src={rec.artist.profilePicture}
                            alt={rec.artist.name}
                            className="w-8 h-8 rounded-full object-cover object-top shrink-0 border border-white/[0.10]"
                          />
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/85 truncate leading-none">
                              {rec.artist.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] font-mono text-white/28 truncate">{rec.artist.stageName}</span>
                              <span className="text-[8px] text-white/15 mx-0.5">·</span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-[#B45309]/70 shrink-0">
                                {rec.artist.presence.toLocaleString()} PRS
                              </span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Notes */}
                        <motion.div
                          className="relative pl-3"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: hasRevealedOnce ? 0 : STAGGER.notes,
                            duration: 0.35,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-[1.5px] rounded-full"
                            style={{ background: "linear-gradient(to bottom, rgba(180,83,9,0.6), transparent)" }}
                          />
                          <p
                            className="text-[13px] sm:text-[14px] text-white/50 leading-relaxed font-medium"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: notesIsLong && !state.notesExpanded ? 3 : "unset",
                              overflow: notesIsLong && !state.notesExpanded ? "hidden" : "visible",
                            }}
                          >
                            {rec.notes}
                          </p>
                          {notesIsLong && (
                            <button
                              onClick={() => setRecState(rec.id, { notesExpanded: !state.notesExpanded })}
                              className="flex items-center gap-0.5 mt-1.5 text-[8px] font-black uppercase tracking-widest text-[#B45309]/50 hover:text-[#B45309] transition-colors duration-150"
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <motion.span
                                animate={{ rotate: state.notesExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                className="flex items-center"
                              >
                                <ChevronDown className="w-2.5 h-2.5" />
                              </motion.span>
                              {state.notesExpanded ? "less" : "more"}
                            </button>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* ROW 2: Presence */}
                    <motion.div
                      className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: hasRevealedOnce ? 0 : STAGGER.presence,
                        duration: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/15 shrink-0">from</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/25 truncate">{rec.original.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <StageIcon className="w-3.5 h-3.5 text-[#B45309]/70" />
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[11px] font-black font-mono text-white/60 tabular-nums">
                            {rec.original.presence.toLocaleString()}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#B45309]/60">PRS</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* ROW 3: Actions */}
                    <motion.div
                      className="flex items-center gap-2 px-4 sm:px-6 pt-2 pb-3"
                      onPointerDown={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: hasRevealedOnce ? 0 : STAGGER.actions,
                        duration: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault(); // Prevents iOS double-tap hover bug
                          setRecState(rec.id, { boosted: !state.boosted });
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] ${
                          state.boosted
                            ? "bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/28 shadow-[0_0_14px_rgba(180,83,9,0.16)]"
                            : "bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/65 hover:bg-white/[0.05]"
                        }`}
                        style={{ transition: "color 150ms ease-out, background 150ms ease-out, border-color 150ms ease-out, transform 100ms ease-out" }}
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        {state.boosted ? `Boosted · ${rec.vouchCount + 1}` : `Boost · ${rec.vouchCount}`}
                      </button>
                      <button
                        onPointerDown={(e) => {
                          e.preventDefault(); // Prevents iOS double-tap hover bug
                          setRecState(rec.id, { inLedger: !state.inLedger });
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] ${
                          state.inLedger
                            ? "bg-white/[0.07] text-white/75 border border-white/[0.16]"
                            : "bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/65 hover:bg-white/[0.05]"
                        }`}
                        style={{ transition: "color 150ms ease-out, background 150ms ease-out, border-color 150ms ease-out, transform 100ms ease-out" }}
                      >
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {state.inLedger ? "In Ledger" : "Add to Ledger"}
                      </button>
                    </motion.div>

                    {/* ── Dot indicators — inside card, below actions ─── */}
                    {/*
                      Emil: state indication without noise.
                      Active dot = amber pill (width: 16px).
                      Past dots: opacity 0.4. Future: opacity 0.2.
                      All dots animate their width/opacity with 250ms ease-out.
                    */}
                    <motion.div
                      className="flex items-center justify-center gap-1.5 pb-3"
                      aria-label={`Recommendation ${index + 1} of ${recs.length}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: hasRevealedOnce ? 0 : STAGGER.dots,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      {recs.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setDirection(i > index ? -1 : 1); setIndex(i); }}
                          aria-label={`Go to recommendation ${i + 1}`}
                          className="relative flex items-center justify-center p-1"
                        >
                          <motion.span
                            animate={{
                              width: i === index ? 16 : 5,
                              background: i === index ? "#B45309" : "rgba(255,255,255,0.15)",
                              opacity: i === index ? 1 : i < index ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            className="block h-[4px] rounded-full"
                            style={{ minWidth: 5 }}
                          />
                        </button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Artist ID Card Modal overlay */}
      <ArtistProfile 
        artist={
          isArtistModalOpen && !isEndScreen && rec ? {
            id: rec.artist.id,
            name: rec.artist.name,
            image: rec.artist.profilePicture,
            presence: rec.artist.presence,
            works: 0,
          } : null
        } 
        onClose={() => setIsArtistModalOpen(false)} 
        zIndex="z-[250]"
      />
    </ModalWrapper>
  );
}
