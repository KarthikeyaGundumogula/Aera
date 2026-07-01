import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  X,
  Search,
  Infinity,
  Film,
  Eye,
  Clock,
  BookmarkPlus,
  ChevronLeft,
} from "lucide-react";
import { ORIGINALS } from "../../../mock";
import { mockLibrary, CollectionItem } from "../../../mock/library";
import { SurgeScore } from "../../../components/surge/SurgeScore";
import { SurgeInputSection } from "../../../components/surge/SurgeInputSection";

// ─── Design Token ─────────────────────────────────────────────────────────────
const AMBER = "#D97706";
const AMBER_DIM = "rgba(217,119,6,0.10)";
const AMBER_GLOW = "rgba(217,119,6,0.28)";

interface LibraryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EntryStatus = "want_to_watch" | "watched";
type Original = (typeof ORIGINALS)[0];

// ─── Resonance colour helpers (module-level, not recreated on render) ─────────

function lerpRGB(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  t: number,
): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r1 + (r2 - r1) * t)},${clamp(g1 + (g2 - g1) * t)},${clamp(b1 + (b2 - b1) * t)})`;
}

function scoreRatioToColor(ratio: number): string {
  if (ratio <= 0) return "rgba(255,255,255,0.30)";
  if (ratio <= 0.3) return lerpRGB(200, 200, 200, 255, 255, 255, ratio / 0.3);
  if (ratio <= 0.6)
    return lerpRGB(255, 255, 255, 255, 220, 140, (ratio - 0.3) / 0.3);
  if (ratio <= 1.0)
    return lerpRGB(255, 220, 140, 217, 119, 6, (ratio - 0.6) / 0.4);
  return lerpRGB(217, 119, 6, 245, 158, 11, Math.min((ratio - 1) * 2, 1));
}

// ─── Grain overlay ────────────────────────────────────────────────────────────

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

// ─── Originals search panel ───────────────────────────────────────────────────

function OriginalsSearch({
  existingIds,
  onSelect,
  onClose,
}: {
  existingIds: string[];
  onSelect: (o: Original) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const results = useMemo(() => {
    const pool = ORIGINALS.filter((o) => !existingIds.includes(o.id));
    if (!query.trim()) {
      return [...pool]
        .sort((a, b) => (b.stats?.presence ?? 0) - (a.stats?.presence ?? 0))
        .slice(0, 5);
    }
    const q = query.toLowerCase();
    return pool.filter((o) => o.title.toLowerCase().includes(q)).slice(0, 5);
  }, [query, existingIds]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
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

      {!query.trim() && results.length > 0 && (
        <div className="px-5 pt-3 pb-1">
          <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white/20">
            Trending on FrameHouse
          </span>
        </div>
      )}

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
                className="w-9 rounded-lg object-cover object-top opacity-70 flex-shrink-0"
                style={{ aspectRatio: "2/3", height: "54px" }}
              />
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-light text-white/80 truncate">
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

// ─── Cinematic textarea ───────────────────────────────────────────────────────

function CinematicTextarea({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent text-white/80 placeholder-white/15 border-0 border-b border-white/10 focus:border-[#D97706]/40 py-2 text-sm font-light outline-none resize-none leading-relaxed transition-colors duration-300"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function LibraryEntryModal({ isOpen, onClose }: LibraryEntryModalProps) {
  const [existingIds] = useState<string[]>(() =>
    mockLibrary.map((l) => l.originalId),
  );
  const [selectedOriginal, setSelectedOriginal] = useState<Original | null>(
    null,
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [status, setStatus] = useState<EntryStatus>("want_to_watch");
  const [expectations, setExpectations] = useState("");
  const [afterThoughts, setAfterThoughts] = useState("");
  const [isAdded, setIsAdded] = useState(false);

  // ── Surge score (only used in "watched" mode) ──────────────────────────
  const [surgeScore, setSurgeScore] = useState(0);
  const [peakFlash, setPeakFlash] = useState(false); // kept for global flash overlay above modal

  // Reset everything on open
  useEffect(() => {
    if (isOpen) {
      setSelectedOriginal(null);
      setIsSearchOpen(false);
      setStatus("want_to_watch");
      setExpectations("");
      setAfterThoughts("");
      setIsAdded(false);
      setSurgeScore(0);
      setPeakFlash(false);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Also reset surge when switching away from "watched"
  useEffect(() => {
    if (status !== "watched") {
      setSurgeScore(0);
      setPeakFlash(false);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleConfirm = useCallback(() => {
    if (!selectedOriginal) return;
    const newEntry: CollectionItem = {
      id: `wl_${Date.now()}`,
      originalId: selectedOriginal.id,
      originalName: selectedOriginal.title,
      originalPosterUrl: selectedOriginal.coverImage,
      status,
      hypeText:
        status === "want_to_watch"
          ? expectations || "On the radar."
          : expectations || "Experienced.",
      afterThoughts:
        status === "watched" ? afterThoughts || undefined : undefined,
      taggedWorks: [],
      addedAt: new Date().toISOString(),
    };
    setIsAdded(true);
    mockLibrary.unshift(newEntry);
    window.dispatchEvent(new CustomEvent("libraryUpdated"));
    setTimeout(() => onClose(), 1300);
  }, [selectedOriginal, status, expectations, afterThoughts, onClose]);

  const canSubmit = selectedOriginal !== null;
  const submitLabel =
    status === "watched" ? "Seal the Verdict" : "Log to Library";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lem-backdrop"
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
            onClick={onClose}
            aria-hidden
          />

          {/* Peak flash (watched mode) */}
          <AnimatePresence>
            {peakFlash && (
              <motion.div
                key="lem-peak-flash"
                className="fixed inset-0 z-[220] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.14, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "linear" }}
                style={{
                  background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${AMBER_GLOW}, transparent 70%)`,
                }}
                aria-hidden
              />
            )}
          </AnimatePresence>

          {/* Modal */}
          <motion.div
            key="lem-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add to Library"
            className="fixed inset-0 z-[210] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-[#060504] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
              initial={{
                scale: 0.96,
                y: 20,
                clipPath: "inset(6% 0% 6% 0% round 16px)",
              }}
              animate={{
                scale: 1,
                y: 0,
                clipPath: "inset(0% 0% 0% 0% round 16px)",
              }}
              exit={{
                scale: 0.95,
                y: 12,
                opacity: 0,
                clipPath: "inset(5% 0% 5% 0% round 16px)",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            >
              <GrainOverlay />

              {/* Ambient glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full opacity-[0.07]"
                style={{
                  background: `radial-gradient(circle, ${AMBER} 0%, transparent 70%)`,
                }}
              />

              {/* ── Search overlay ──────────────────────────────────── */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    key="search-overlay"
                    className="absolute inset-0 z-10 bg-[#060504] rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  >
                    <GrainOverlay />
                    <OriginalsSearch
                      existingIds={existingIds}
                      onSelect={(o) => {
                        setSelectedOriginal(o);
                        setIsSearchOpen(false);
                      }}
                      onClose={() => setIsSearchOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Header ──────────────────────────────────────────── */}
              <div className="relative flex items-start justify-between px-6 pt-6 pb-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookmarkPlus
                      className="w-3 h-3 opacity-60"
                      style={{ color: AMBER }}
                      strokeWidth={2}
                    />
                    <span
                      className="text-[9px] font-black uppercase tracking-[0.35em]"
                      style={{ color: `${AMBER}99` }}
                    >
                      Library
                    </span>
                  </div>
                  <h2 className="text-white text-lg font-light tracking-wide leading-tight">
                    Chronicle&nbsp;
                    <span className="font-semibold italic">the watch.</span>
                  </h2>
                  <p className="mt-1 text-[11px] text-white/30 leading-relaxed font-light">
                    Mark what you've seen or what you intend to.
                    <br />
                    Your library is your theatre history.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="flex-shrink-0 mt-0.5 p-1.5 rounded-full text-white/20 hover:text-white/50 hover:bg-white/5 transition-colors focus-visible:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Scrollable body ─────────────────────────────────── */}
              <div
                className="relative overflow-y-auto"
                style={{ maxHeight: "calc(100dvh - 200px)" }}
              >
                <div className="px-6 pt-6 pb-2 flex flex-col gap-5">
                  {/* Original selector */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                      Original
                    </span>
                    {selectedOriginal ? (
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
                        <ChevronLeft className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 rotate-180 transition-colors flex-shrink-0" />
                      </button>
                    ) : (
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

                  {/* Status toggle */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                      Status
                    </span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {(
                        [
                          {
                            val: "want_to_watch",
                            icon: Clock,
                            label: "Want to Watch",
                          },
                          { val: "watched", icon: Eye, label: "Watched" },
                        ] as const
                      ).map(({ val, icon: Icon, label }) => {
                        const active = status === val;
                        return (
                          <button
                            key={val}
                            onClick={() => setStatus(val)}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] transition-all focus:outline-none"
                            style={{
                              borderColor: active
                                ? `${AMBER}44`
                                : "rgba(255,255,255,0.05)",
                              backgroundColor: active
                                ? AMBER_DIM
                                : "transparent",
                              color: active ? AMBER : "rgba(255,255,255,0.2)",
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic text fields + surge (watched) */}
                  <AnimatePresence mode="wait">
                    {status === "want_to_watch" ? (
                      <motion.div
                        key="expectations"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CinematicTextarea
                          id="lem-expectations"
                          label="Pre-Screening Expectations"
                          placeholder="What draws you to this one?…"
                          value={expectations}
                          onChange={setExpectations}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="watched-fields"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-5"
                      >
                        <CinematicTextarea
                          id="lem-expectations-watched"
                          label="Pre-Screening Expectations"
                          placeholder="What were your expectations going in?…"
                          value={expectations}
                          onChange={setExpectations}
                        />
                        <CinematicTextarea
                          id="lem-afterthoughts"
                          label="After Thoughts"
                          placeholder="How did it land? Document your verdict…"
                          value={afterThoughts}
                          onChange={setAfterThoughts}
                        />

                        {/* ── Surge Score (watched only) ─────────── */}
                        <SurgeInputSection
                          score={surgeScore}
                          peak={4200}
                          onChange={setSurgeScore}
                          withDivider
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px mx-6 mt-2 bg-white/[0.04]" />

              {/* Submit row */}
              <div className="px-6 py-4 flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="text-[9px] uppercase tracking-[0.25em] text-white/20 hover:text-white/40 transition-colors focus:outline-none"
                >
                  Cancel
                </button>

                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div
                      key="confirmed"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: AMBER }}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" strokeWidth={2} />
                      Logged
                    </motion.div>
                  ) : (
                    <motion.button
                      key="confirm-btn"
                      onClick={handleConfirm}
                      disabled={!canSubmit}
                      whileTap={{ scale: canSubmit ? 0.96 : 1 }}
                      className="px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none"
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
                      {submitLabel}
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
