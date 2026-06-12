import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { X, Film, Sparkles, Search, ChevronLeft, Infinity } from "lucide-react";
import { ORIGINALS } from "../mock";
import { RecommendationScore } from "./resonance/RecommendationScore";

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

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

// ─── Cinematic input ──────────────────────────────────────────────────────────

function CinematicInput({
  id,
  label,
  sublabel,
  placeholder,
  value,
  onChange,
  as = "input",
  maxLength,
  autoFocus,
}: {
  id: string;
  label: string;
  sublabel?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  as?: "input" | "textarea";
  maxLength?: number;
  autoFocus?: boolean;
}) {
  const Tag = as;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30"
        >
          {label}
        </label>
        {sublabel && (
          <span className="text-[9px] text-white/20 tracking-wide">{sublabel}</span>
        )}
      </div>
      <Tag
        id={id}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={as === "textarea" ? 3 : undefined}
        autoFocus={autoFocus}
        className={[
          "w-full bg-transparent text-white/90 placeholder-white/15",
          "border-0 border-b border-white/10 focus:border-[#D97706]/50",
          "py-2 text-sm font-light outline-none resize-none",
          "transition-colors duration-300",
          as === "textarea" ? "leading-relaxed" : "",
        ].join(" ")}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ─── Originals search panel ───────────────────────────────────────────────────

function OriginalsSearch({
  onSelect,
  onClose,
}: {
  onSelect: (o: Original) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [...ORIGINALS]
        .sort((a, b) => (b.stats?.presence ?? 0) - (a.stats?.presence ?? 0))
        .slice(0, 5);
    }
    const q = query.toLowerCase();
    return ORIGINALS.filter((o) => o.title.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <Search className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search originals…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none font-light"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={onClose}
          aria-label="Close search"
          className="p-1.5 rounded-full text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section label */}
      {!query.trim() && (
        <div className="px-5 pt-3 pb-1">
          <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20">
            Trending on FrameHouse
          </span>
        </div>
      )}

      {/* Results */}
      <div className="overflow-y-auto flex-1">
        {results.length > 0 ? (
          results.map((original) => (
            <button
              key={original.id}
              onClick={() => onSelect(original)}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors text-left border-b border-white/[0.03] last:border-0 focus:outline-none"
            >
              <img
                loading="lazy"
                src={original.coverImage}
                alt={original.title}
                className="w-9 h-13 rounded-lg object-cover object-top opacity-70 flex-shrink-0"
                style={{ aspectRatio: "2/3" }}
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-white/80 truncate">
                  {original.title}
                </span>
                <span className="block text-[9px] text-white/25 mt-0.5 tracking-wider">
                  {original.releaseDate}
                </span>
              </div>
              <Film className="w-3 h-3 text-white/10 flex-shrink-0" />
            </button>
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              No originals found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

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

          {/* Modal card */}
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
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#060504] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
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
                    className="absolute inset-0 z-10 bg-[#060504] rounded-2xl overflow-hidden"
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

              {/* ── Header ─────────────────────────────────────────────── */}
              <div className="relative flex items-start justify-between px-6 pt-6 pb-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 opacity-60" style={{ color: AMBER }} strokeWidth={2} />
                    <span
                      className="text-[9px] font-black uppercase tracking-[0.35em]"
                      style={{ color: `${AMBER}99` }}
                    >
                      Recommendation
                    </span>
                  </div>
                  <h2 className="text-white text-lg font-light tracking-wide leading-tight">
                    Pass it&nbsp;<span className="font-semibold italic">forward.</span>
                  </h2>
                  <p className="mt-1 text-[11px] text-white/30 leading-relaxed font-light">
                    Your score is a signal — not a rating.
                    <br />
                    It tells the next artist how much this moved you.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-full text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Form ───────────────────────────────────────────────── */}
              <div className="relative px-6 pt-6 flex flex-col gap-5">

                {/* Original selector */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                    Original
                  </span>
                  {selectedOriginal ? (
                    /* Selected pill */
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center gap-3 py-2 border-b border-white/10 hover:border-white/20 transition-colors text-left focus:outline-none group"
                    >
                      <img
                        src={selectedOriginal.coverImage}
                        alt={selectedOriginal.title}
                        loading="lazy"
                        className="w-7 h-10 rounded object-cover object-top opacity-80 flex-shrink-0"
                      />
                      <span className="flex-1 text-sm text-white/85 font-light truncate">
                        {selectedOriginal.title}
                      </span>
                      <ChevronLeft
                        className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 rotate-180 transition-colors flex-shrink-0"
                      />
                    </button>
                  ) : (
                    /* Empty trigger */
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className="flex items-center gap-2 py-2 border-b border-white/10 hover:border-white/20 transition-colors text-left focus:outline-none"
                    >
                      <Search className="w-3.5 h-3.5 text-white/15" />
                      <span className="text-sm text-white/20 font-light">
                        Search for a film or series…
                      </span>
                    </button>
                  )}
                </div>

                {/* Notes */}
                <CinematicInput
                  id="rec-notes"
                  label="Your Notes"
                  sublabel="Optional"
                  placeholder="What made this unforgettable…"
                  value={notes}
                  onChange={setNotes}
                  as="textarea"
                  maxLength={300}
                />
              </div>

              {/* ── Resonance Score ────────────────────────────────────── */}
              <div className="relative px-6 pt-7 pb-6">

                {/* Resonance Meter */}
                <div className="mb-6">
                  <RecommendationScore
                    score={score}
                    onChange={setScore}
                    onPeakFlash={() => {
                      setPeakFlash(true);
                      setTimeout(() => setPeakFlash(false), 700);
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px mx-6 bg-white/[0.04]" />

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
