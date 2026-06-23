import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { X, Sparkles, ChevronLeft, Infinity, Film, Search } from "lucide-react";
import { RecommendationScore } from "./resonance/RecommendationScore";
import { GrainOverlay } from "./effects/GrainOverlay";
import { CinematicInput } from "./recommendation/CinematicInput";
import { OriginalsSearch } from "./recommendation/OriginalsSearch";
import { ORIGINALS } from "@/mock";

// ─── Design Token ─────────────────────────────────────────────────────────────
// Amber: cinematic projection light — the colour of the reel burning through.
const AMBER     = "#D97706";
const AMBER_DIM  = "rgba(217,119,6,0.12)";
const AMBER_GLOW = "rgba(217,119,6,0.30)";



// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Original = (typeof ORIGINALS)[0];



export function CreateRecommendationModal({
  isOpen,
  onClose,
}: CreateRecommendationModalProps) {
  // Form
  const [selectedOriginal, setSelectedOriginal] = useState<Original | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Score
  const [score, setScore] = useState(0);
  const [peakFlash, setPeakFlash] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedOriginal(null);
      setIsSearchOpen(false);
      setNotes("");
      setScore(0);
      setPeakFlash(false);
      setSubmitted(false);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // iOS scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const saved = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${saved}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, saved);
    };
  }, [isOpen]);

  // Esc
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSearchOpen) setIsSearchOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isSearchOpen, onClose]);



  const canSubmit = selectedOriginal !== null && score > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => onClose(), 1400);
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="crm-backdrop"
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
            onClick={onClose}
            aria-hidden
          />

          {/* Peak flash */}
          <AnimatePresence>
            {peakFlash && (
              <motion.div
                key="peak-flash"
                className="fixed inset-0 z-[220] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "linear" }}
                style={{
                  background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${AMBER_GLOW}, transparent 70%)`,
                }}
                aria-hidden
              />
            )}
          </AnimatePresence>

          {/* Modal card wrapper */}
          <motion.div
            key="crm-modal"
            role="dialog"
            aria-modal="true"
            aria-label="New Recommendation"
            className="fixed inset-0 z-[210] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* External Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              className="relative w-full max-w-[540px] overflow-hidden rounded-2xl bg-[#060504] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
              initial={{ scale: 0.96, y: 20, clipPath: "inset(6% 0% 6% 0% round 16px)" }}
              animate={{ scale: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
              exit={{ scale: 0.95, y: 12, opacity: 0, clipPath: "inset(5% 0% 5% 0% round 16px)" }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <GrainOverlay />

              {/* Ambient glow orb */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full opacity-[0.08]"
                style={{ background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)` }}
              />

              {/* ── Search overlay (slides in over the form) ─────────── */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    key="search-panel"
                    className="absolute inset-0 z-40 bg-[#060504] rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  >
                    <GrainOverlay />
                    <OriginalsSearch
                      onSelect={(o) => {
                        setSelectedOriginal(o);
                        setIsSearchOpen(false);
                      }}
                      onClose={() => setIsSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search overlay (slides in over the form) */}

              <div className="relative flex flex-row p-4 sm:p-6 gap-4 sm:gap-6">
                
                {/* ── LEFT COLUMN: Poster Selector ────────────────────── */}
                <div className="w-[38%] sm:w-[35%] shrink-0 flex flex-col gap-3 mt-1">
                  
                  {/* Subtle Top Label */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <Sparkles className="w-3 h-3 opacity-60" style={{ color: AMBER }} strokeWidth={2} />
                    <span
                      className="text-[9px] font-black uppercase tracking-[0.35em]"
                      style={{ color: `${AMBER}99` }}
                    >
                      New
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="relative w-full rounded-xl overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/50 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    style={{ aspectRatio: "2/3" }}
                  >
                    {selectedOriginal ? (
                      <>
                        <img
                          src={selectedOriginal.coverImage}
                          alt={selectedOriginal.title}
                          className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-500 group-hover:brightness-50"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <Search className="w-5 h-5 text-white/80 mb-2" />
                          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 border border-dashed border-white/20 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-white/30 transition-colors flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/20 group-hover:scale-110 transition-transform duration-300">
                          <Film className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center px-3 group-hover:text-white/60 transition-colors">
                          Select<br />Original
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Selected Original Info */}
                  <AnimatePresence>
                    {selectedOriginal && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-center px-1"
                      >
                        <h3 className="text-[12px] font-bold text-white/90 leading-tight line-clamp-2">
                          {selectedOriginal.title}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#D97706]/70 mt-1">
                          {selectedOriginal.genre?.[0] || "Film"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── RIGHT COLUMN: Notes & Score ─────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 pr-2 sm:pr-0">
                  
                  {/* Notes Area */}
                  <div className="mb-4 mt-1 flex-1 flex flex-col min-h-[100px]">
                    <CinematicInput
                      id="rec-notes"
                      label="Your Notes"
                      sublabel="Optional"
                      placeholder="You should see this Becooooooz......"
                      value={notes}
                      onChange={setNotes}
                      as="textarea"
                      maxLength={300}
                    />
                  </div>

                  {/* Score Area */}
                  <div className="relative pb-1">
                    <RecommendationScore
                      score={score}
                      peak={4200}
                      onChange={setScore}
                      onPeakFlash={() => {
                        setPeakFlash(true);
                        setTimeout(() => setPeakFlash(false), 700);
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* ── Divider ────────────────────────────────────────────── */}
              <div className="h-px w-full bg-white/[0.04]" />

              {/* Submit row */}
              <div className="px-6 py-4 flex items-center justify-between gap-3">
                <p className="text-[10px] text-white/15 leading-snug max-w-[55%]">
                  Visible to your community. Permanent.
                </p>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: AMBER }}
                    >
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                      Sent
                    </motion.div>
                  ) : (
                    <motion.button
                      key="submit"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      whileTap={{ scale: canSubmit ? 0.96 : 1 }}
                      className="px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 focus-visible:outline-none"
                      style={
                        canSubmit
                          ? {
                              backgroundColor: AMBER,
                              color: "#0A0806",
                              boxShadow: `0 4px 20px ${AMBER_GLOW}`,
                            }
                          : {
                              backgroundColor: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.15)",
                              cursor: "not-allowed",
                            }
                      }
                    >
                      Recommend
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
