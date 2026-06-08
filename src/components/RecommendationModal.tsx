import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { BookOpen, X, Zap, ChevronDown, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModalWrapper } from "../features/shared/modals/ModalWrapper";
import { StageIcon } from "./icons/AppIcons";
import { MOCK_RECOMMENDATIONS, type Recommendation } from "../mock/recommendations";

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatScore(n: number): string {
  return n.toLocaleString("en-IN");
}

const NOTES_CLIP = 150;

/**
 * Emil skill — swipe mechanics:
 * Momentum-based: velocity > 0.3 OR distance > 100px triggers navigation.
 * Emil: "Don't require dragging past a threshold. Calculate velocity."
 */
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const SWIPE_DISTANCE_THRESHOLD = 100;

/** Card slide variants — enter from one side, exit to the other. */
const cardVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? -55 : 55,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? 140 : -140,
    opacity: 0,
  }),
};

/** Per-card interaction state (Boost + Ledger) keyed by rec id */
type CardState = Record<string, { boosted: boolean; inLedger: boolean; notesExpanded: boolean }>;

export function RecommendationModal({ isOpen, onClose }: RecommendationModalProps) {
  const navigate = useNavigate();
  const recs = MOCK_RECOMMENDATIONS;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = going left, 1 = going right
  const [cardState, setCardState] = useState<CardState>({});
  const [isEndScreen, setIsEndScreen] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; time: number } | null>(null);

  // Reset everything when modal opens
  useEffect(() => {
    if (isOpen) {
      setIndex(0);
      setDirection(0);
      setCardState({});
      setIsEndScreen(false);
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

  function navigate_to_index(next: number, dir: number) {
    if (next >= recs.length) {
      // End of stack — show end screen, then loop back
      setIsEndScreen(true);
      setTimeout(() => {
        setIndex(0);
        setDirection(-1);
        setIsEndScreen(false);
      }, 1800);
      return;
    }
    if (next < 0) return;
    setDirection(dir);
    setIndex(next);
  }

  function goNext() { navigate_to_index(index + 1, -1); }
  function goPrev() { if (index > 0) { setDirection(1); setIndex(index - 1); } }

  // Drag handlers — Emil momentum pattern
  function onDragStart(e: React.PointerEvent) {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, time: Date.now() };
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
    if (!isSwipe) return;

    if (dx < 0) goNext();  // swipe left → next
    else goPrev();          // swipe right → prev
  }

  if (!rec && !isEndScreen) return null;

  const notesIsLong = rec ? rec.notes.length > NOTES_CLIP : false;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} zIndex="z-[200]" isImmersive>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="relative w-full max-w-2xl mx-auto px-4 sm:px-0"
            initial={{ clipPath: "inset(48% 2% 48% 2% round 4px)", opacity: 0.6 }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 16px)", opacity: 1 }}
            exit={{ clipPath: "inset(48% 2% 48% 2% round 4px)", opacity: 0 }}
            transition={{
              clipPath: { duration: 0.42, ease: [0.23, 1, 0.32, 1] },
              opacity: { duration: 0.18, ease: "linear" },
            }}
          >
            {/* ── Above-card header: context label + genre tags ────── */}
            <AnimatePresence mode="wait">
              {!isEndScreen && rec && (
                <motion.div
                  key={`header-${index}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ delay: 0.35, duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center justify-between mb-3 px-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97706] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D97706]" />
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#D97706]">
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

            {/* ── CARD shell — drag target ──────────────────────────── */}
            <article
              className="relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080604] touch-pan-y"
              style={{ boxShadow: "0 48px 120px rgba(0,0,0,0.92), inset 0 0 0 1px rgba(255,255,255,0.03)" }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={() => { dragStart.current = null; }}
            >
              {/* Film grain */}
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
              >
                <X className="w-3 h-3" />
              </button>

              {/* ── CARD CONTENT — animates per swipe ─────────────── */}
              <AnimatePresence mode="wait" custom={direction}>
                {isEndScreen ? (
                  /* ── End screen ─────────────────────────────────── */
                  <motion.div
                    key="end-screen"
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                    className="flex flex-col items-center justify-center py-16 px-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Film className="w-8 h-8 text-[#D97706]/50 mx-auto mb-4" strokeWidth={1.5} />
                    </motion.div>
                    <motion.p
                      className="text-[8px] font-black uppercase tracking-[0.45em] text-[#D97706] mb-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                      All caught up
                    </motion.p>
                    <motion.p
                      className="text-[10px] text-white/25 leading-relaxed"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.24, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    >
                      Looping back to the first reel
                    </motion.p>
                  </motion.div>
                ) : (
                  /* ── Recommendation card content ─────────────────── */
                  <motion.div
                    key={`rec-${rec.id}`}
                    custom={direction}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.28,
                      ease: [0.23, 1, 0.32, 1],
                      opacity: { duration: 0.18 },
                    }}
                    /**
                     * Prevent clicks from firing when user was dragging.
                     * Emil: multi-touch protection & intent disambiguation.
                     */
                    onClickCapture={(e) => {
                      if (isDragging.current) {
                        e.stopPropagation();
                        isDragging.current = false;
                      }
                    }}
                  >
                    {/* ROW 1: Poster | Score + Artist + Notes */}
                    <div className="flex flex-row">
                      {/* Poster */}
                      <div
                        className="relative shrink-0 flex items-center justify-center bg-[#040302] py-5"
                        style={{ width: "36%", minWidth: "110px", maxWidth: "200px" }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-10" />
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
                          {/* Title overlay — centered */}
                          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 bg-black/55" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center px-2.5 text-center">
                              <p className="text-[7px] font-black uppercase tracking-[0.45em] text-[#D97706] leading-none mb-1.5">
                                {rec.original.format}
                              </p>
                              <h3
                                className="font-black text-white uppercase leading-[1.05]"
                                style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)", letterSpacing: "-0.01em", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
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
                      </div>

                      {/* Right column */}
                      <div className="flex-1 min-w-0 flex flex-col p-4 sm:p-6 pt-5">
                        {/* Score */}
                        <div className="mb-4">
                          <p className="text-[7px] font-black uppercase tracking-[0.45em] text-white/20 mb-1">
                            Recommendation Score
                          </p>
                          <span
                            className="block font-black text-white leading-none tracking-tight"
                            style={{ fontSize: "clamp(1.9rem, 4.5vw, 3rem)", textShadow: "0 0 28px rgba(255,255,255,0.07)" }}
                          >
                            {formatScore(rec.score)}
                          </span>
                        </div>

                        {/* Artist */}
                        <div className="flex items-center gap-2.5 mb-4">
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
                              <span className="text-[8px] font-black uppercase tracking-widest text-[#D97706]/70 shrink-0">
                                {rec.artist.presence.toLocaleString()} PRS
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="relative pl-3">
                          <div
                            className="absolute left-0 top-0 bottom-0 w-[1.5px] rounded-full"
                            style={{ background: "linear-gradient(to bottom, rgba(217,119,6,0.6), transparent)" }}
                          />
                          <p
                            className="text-[10px] sm:text-[11px] text-white/42 leading-relaxed"
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
                              className="flex items-center gap-0.5 mt-1.5 text-[8px] font-black uppercase tracking-widest text-[#D97706]/50 hover:text-[#D97706] transition-colors duration-150"
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
                        </div>
                      </div>
                    </div>

                    {/* ROW 2: Presence */}
                    <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/15 shrink-0">from</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/25 truncate">{rec.original.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <StageIcon className="w-3.5 h-3.5 text-[#D97706]/70" />
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[11px] font-black font-mono text-white/60 tabular-nums">
                            {rec.original.presence.toLocaleString()}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[#D97706]/60">PRS</span>
                        </div>
                      </div>
                    </div>

                    {/* ROW 3: Actions */}
                    <div
                      className="flex items-center gap-2 px-4 sm:px-6 pt-2 pb-4"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setRecState(rec.id, { boosted: !state.boosted })}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest active:scale-[0.97] ${
                          state.boosted
                            ? "bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/28 shadow-[0_0_14px_rgba(217,119,6,0.16)]"
                            : "bg-white/[0.03] text-white/35 border border-white/[0.06] hover:text-white/65 hover:bg-white/[0.05]"
                        }`}
                        style={{ transition: "color 150ms ease-out, background 150ms ease-out, border-color 150ms ease-out, transform 100ms ease-out" }}
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        {state.boosted ? `Boosted · ${rec.vouchCount + 1}` : `Boost · ${rec.vouchCount}`}
                      </button>
                      <button
                        onClick={() => setRecState(rec.id, { inLedger: !state.inLedger })}
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </article>

            {/* ── Dot indicators — below the card ────────────── */}
            {/*
              5 dots. Active = amber pill (wider). Inactive = ghost circle.
              Emil: state indication without noise.
            */}
            {!isEndScreen && (
              <motion.div
                className="flex items-center justify-center gap-1.5 mt-4"
                aria-label={`Recommendation ${index + 1} of ${recs.length}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                {recs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > index ? -1 : 1); setIndex(i); }}
                    aria-label={`Go to recommendation ${i + 1}`}
                    className="relative flex items-center justify-center"
                  >
                    <motion.span
                      animate={{
                        width: i === index ? 16 : 5,
                        background: i === index ? "#D97706" : "rgba(255,255,255,0.15)",
                        opacity: i === index ? 1 : i < index ? 0.4 : 0.2,
                      }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="block h-[5px] rounded-full"
                      style={{ minWidth: 5 }}
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </ModalWrapper>
  );
}
