import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Layers,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";
import { CurateOverlay } from "./CurateOverlay";
import { CinematicToast } from "./CinematicToast";
import { PerimeterOutline } from "./PerimeterOutline";
import { HonourIcon } from "../../../components/icons/HonourIcon";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { RecommendationCard } from "../../../components/RecommendationCard";

interface StaticFrameProps {
  item: TheatreItem;
  onClose: () => void;
  archiveLabel: string;
  showPages: boolean;
  showDetails: boolean;
  showClutterFreeToggle?: boolean;
  standalone?: boolean;
  isActive?: boolean;
}

const PAGE_CAPTIONS = [
  "The first act begins in silence — before the storm finds its name.",
  "A single frame can hold the weight of a thousand unspoken lines.",
  "Between the cuts, the truth breathes. This is where cinema lives.",
  "The director's eye sees what the audience will feel three scenes later.",
  "Every still image is a word. Every sequence, a sentence. Read carefully.",
  "Chaos was always the plan. Order is just the audience's comfort.",
  "The lens doesn't lie — it simply chooses what not to show.",
  "Here the protagonist realizes what we already knew from frame one.",
  "Sound design carries the scene. The image is only half the story.",
  "End of reel. Begin again. The archive never forgets.",
];

/**
 * StaticFrame — Scripts & Posters.
 *
 * ┌────────────────────────────────────────────────────────┐
 * │  [Avatar] Artist · Title              [Share]  [X]     │  header
 * ├────────────────────────────────────────────────────────┤
 * │  [Page X/Y] [Story|Visuals]                    [Eye]   │  controls (scripts only)
 * │                                                        │
 * │              IMAGE  (or flip-card back)                │  content
 * │                                                        │
 * │           ← · · • · · →                               │  pagination (scripts)
 * ├────────────────────────────────────────────────────────┤
 * │  [✦ HONOUR / HONOURED]              [⊞ Originals]     │  footer
 * └────────────────────────────────────────────────────────┘
 */
export function StaticFrame({
  item,
  onClose,
  archiveLabel: _archiveLabel,
  showPages,
  showDetails,
  showClutterFreeToggle = false,
  standalone = true,
  isActive = true,
}: StaticFrameProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCurate, setShowCurate] = useState(false);
  const [isHonoured, setIsHonoured] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const [isClutterFree, setIsClutterFree] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [titleGlow, setTitleGlow] = useState(false);
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [honouring, setHonouring] = useState(false);
  const honourTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Poster drag constraints
  const posterConstraintsRef = useRef<HTMLDivElement>(null);
  // Outer frame ref — native double-tap listener attaches here
  const frameRef = useRef<HTMLDivElement>(null);
  // Double-tap flash
  const [doubleTapFlash, setDoubleTapFlash] = useState(false);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pages = showPages ? (item.images ?? []).slice(0, 10) : [item.image || ""];
  const total = pages.length;
  const caption = item.captions?.[pageIndex] || PAGE_CAPTIONS[pageIndex % PAGE_CAPTIONS.length];

  const goTo = (idx: number) => { setIsFlipped(false); setPageIndex(idx); setImgAspect(null); };
  const prev = () => goTo((pageIndex - 1 + total) % total);
  const next = () => goTo((pageIndex + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!showPages) return;
    // Stop propagation so the parent work-carousel swipe doesn't fire
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!showPages || touchStartX.current === null) return;
    // Stop propagation so the parent work-carousel swipe doesn't fire
    e.stopPropagation();
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
    setSelectedArtist(
      artistData || {
        id: String(item.id),
        name: item.artist || "Anonymous",
        spirit: 0,
        works: 0,
        image: item.artistAvatar || item.image || "",
      }
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/works/${item.id}`;
    
    const showToast = () => {
      setToastMessage("LINK COPIED");
      setTimeout(() => setToastMessage(null), 2500);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(showToast)
        .catch((err) => {
          console.warn("Failed to copy link via navigator.clipboard, trying fallback:", err);
          const success = copyTextFallback(url);
          if (success) {
            showToast();
          }
        });
    } else {
      const success = copyTextFallback(url);
      if (success) {
        showToast();
      }
    }
  };

  const fireHonour = () => {
    if (honourTimeoutRef.current) clearTimeout(honourTimeoutRef.current);
    // Double-tap always sets to honoured (never un-honours, like Instagram)
    setIsHonoured(true);
    setHonouring(true);
    honourTimeoutRef.current = setTimeout(() => setHonouring(false), 420);
    if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    setTitleGlow(true);
    glowTimeoutRef.current = setTimeout(() => setTitleGlow(false), 700);
  };

  const handleHonour = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (honourTimeoutRef.current) clearTimeout(honourTimeoutRef.current);
    const next = !isHonoured;
    setIsHonoured(next);
    setHonouring(true);
    honourTimeoutRef.current = setTimeout(() => setHonouring(false), 420);
    if (next) {
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      setTitleGlow(true);
      glowTimeoutRef.current = setTimeout(() => setTitleGlow(false), 700);
    }
  };

  // ── Native double-tap listener on the entire frame ───────────────────────
  // Why native? React synthetic events fight Framer Motion's drag and the
  // page-swipe handler. A native touchend listener on the outer frame ref
  // bypasses all of that and fires reliably for any tap anywhere on the modal.
  // All deps are stable (state setters, refs) — empty dep array is correct.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const lastTapRef = { current: 0 };

    const onTouchEnd = (_e: TouchEvent) => {
      const now = Date.now();
      const delta = now - lastTapRef.current;
      lastTapRef.current = now;

      if (delta < 280 && delta > 30) {
        // Double tap — always honour, like Instagram (never un-honours)
        if (honourTimeoutRef.current) clearTimeout(honourTimeoutRef.current);
        if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        setIsHonoured(true);
        setHonouring(true);
        setTitleGlow(true);
        setDoubleTapFlash(true);

        honourTimeoutRef.current = setTimeout(() => setHonouring(false), 420);
        glowTimeoutRef.current = setTimeout(() => setTitleGlow(false), 700);
        flashTimeoutRef.current = setTimeout(() => setDoubleTapFlash(false), 600);
      }
    };

    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => el.removeEventListener("touchend", onTouchEnd);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const content = (
    <>
      <motion.div
        key="static-frame"
        initial={standalone ? { y: 20, opacity: 0, scale: 0.97 } : undefined}
        animate={standalone ? { y: 0, opacity: 1, scale: 1 } : undefined}
        exit={standalone ? { y: 20, opacity: 0, scale: 0.97 } : undefined}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 flex flex-col w-full max-h-full max-w-lg overflow-hidden ${
          isClutterFree ? "rounded-none" : "rounded-[24px] border border-white/8 bg-[#0d0d0b] shadow-2xl"
        }`}
        style={{ touchAction: "pan-y" }}
        ref={frameRef}
      >
        {!isClutterFree && <PerimeterOutline isActive={isHonoured} radius={24} />}

        {/* ── Header ──────────────────────────────────────────── */}
        <AnimatePresence>
          {!isClutterFree && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden shrink-0"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 sm:px-6">
                {/* Left: Avatar (clickable only) + name + title (display only) */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Avatar — ONLY this triggers artist modal */}
                  <button
                    onClick={handleArtistClick}
                    className="h-8 w-8 rounded-[10px] shrink-0 overflow-hidden bg-white/6 border border-white/8 hover:border-white/25 transition-colors duration-200 flex items-center justify-center"
                    aria-label={`Open ${item.artist || 'artist'} profile`}
                  >
                    {item.artistAvatar ? (
                      <img src={item.artistAvatar} alt={item.artist || ""} className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-[10px] font-black text-white/40">
                        {(item.artist || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  {/* Artist name + title — display only */}
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30 leading-none mb-0.5 truncate">
                      {item.artist || "Unknown Artist"}
                    </p>
                    <p
                      className={`text-[13px] font-semibold leading-tight truncate transition-colors duration-500 ${
                        titleGlow ? "text-[#E11D48]" : isHonoured ? "text-[#E11D48]/50" : "text-white/85"
                      }`}
                    >
                      {item.title || "Untitled"}
                    </p>
                  </div>
                </div>

                {/* Utility buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleShare}
                    title="Copy link"
                    aria-label="Share"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
                  >
                    <Share2 size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Script controls row (pages + flip toggle + clutter-free) ── */}
        {showPages && !isClutterFree && (
          <div className="flex items-center justify-between px-4 pt-3 pb-1 sm:px-6">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">
              {pageIndex + 1} / {total}
            </span>
            <div className="flex items-center gap-2">
              {showDetails && (
                <button
                  onClick={() => setIsFlipped((f) => !f)}
                  className={`flex items-center gap-1.5 px-3 h-6 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                    isFlipped
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white/35 border-white/10 hover:border-white/25"
                  }`}
                >
                  <RotateCw size={8} />
                  {isFlipped ? "Visuals" : "Story"}
                </button>
              )}
              {showClutterFreeToggle && (
                <button
                  onClick={() => setIsClutterFree(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-xl text-white/25 hover:text-white/60 transition-colors"
                  aria-label="Focus mode"
                >
                  <Eye size={11} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Content (image / flip-card) ─────────────────────── */}
        <div
          className={`flex-1 overflow-y-auto flex flex-col gap-3 ${isClutterFree || item.recId ? "p-0" : "p-4 sm:p-5"} ${showPages ? "pt-2" : ""}`}
          style={{ overscrollBehavior: "contain" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {showDetails ? (
            /* Script flip-card — tap on image does NOT flip; flip button only */
            <div className="relative w-full" style={{ perspective: "1100px" }}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                className="relative w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front — image */}
                <div
                  className="w-full rounded-[16px] overflow-hidden bg-[#0d0d0b] border border-white/8"
                  style={{ backfaceVisibility: "hidden", ...(imgAspect ? { aspectRatio: String(imgAspect) } : {}) }}
                >
                  <img
                    key={pageIndex}
                    src={pages[pageIndex]}
                    alt={`Page ${pageIndex + 1}`}
                    className="w-full h-auto block"
                    loading={isActive ? "eager" : "lazy"}
                    fetchPriority={isActive ? "high" : "low"}
                    decoding="async"
                    onLoad={(e) => {
                      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                      if (w && h) setImgAspect(w / h);
                    }}
                  />
                </div>

                {/* Back — notes */}
                <div
                  className="absolute inset-0 rounded-[16px] overflow-hidden p-5 flex flex-col gap-4 bg-[#0d0d0b] border border-white/8"
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                >
                  {/* blurred bg */}
                  <div className="absolute inset-0 overflow-hidden rounded-[16px]">
                    <img
                      src={pages[pageIndex]}
                      className="absolute inset-0 w-full h-full object-cover object-top blur-3xl scale-110 opacity-15"
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0b]/80 to-[#0d0d0b]" />
                  </div>
                  <div className="relative z-10 flex items-start justify-between">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                      Page {String(pageIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                    </p>
                    <RotateCw size={10} className="text-white/15 mt-0.5" />
                  </div>
                  <p className="relative z-10 text-sm font-medium text-white/65 leading-relaxed italic flex-1">
                    &ldquo;{caption}&rdquo;
                  </p>
                  <div className="relative z-10 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/6" />
                    <span className="text-[7px] font-black uppercase tracking-[0.5em] text-white/12">Script</span>
                    <div className="h-px flex-1 bg-white/6" />
                  </div>
                </div>
              </motion.div>

              {/* Clutter-free exit, overlaid */}
              {showClutterFreeToggle && isClutterFree && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsClutterFree(false); }}
                  className="absolute bottom-3 right-3 z-50 flex h-7 w-7 items-center justify-center rounded-xl bg-black/60 text-white/60 hover:bg-white hover:text-black backdrop-blur-sm transition-all active:scale-90"
                >
                  <EyeOff size={12} />
                </button>
              )}
            </div>
          ) : (
            /* Poster — drag-to-pan + double-tap to honour */
            /* onTouchEnd is on the outer div, NOT the draggable, because
               Framer Motion's drag intercepts pointer events on the motion.div */
            item.recId ? (() => {
              const rec = MOCK_RECOMMENDATIONS.find((r) => r.id === item.recId);
              if (rec) {
                return (
                  <div className="w-full h-full pointer-events-auto">
                    <RecommendationCard rec={rec} variant="modal" />
                  </div>
                );
              }
              return null;
            })() : (
              <div
                ref={posterConstraintsRef}
                className="relative flex justify-center overflow-hidden rounded-[16px] w-full"
              >
                <motion.div
                  drag
                  dragConstraints={posterConstraintsRef}
                  dragElastic={0.08}
                  dragMomentum={false}
                  whileTap={{ cursor: "grabbing" }}
                  className="relative rounded-[16px] overflow-hidden border border-white/8 bg-[#0d0d0b] inline-block max-w-full cursor-grab"
                >
                  <img
                    src={pages[0]}
                    alt={item.title || "Poster"}
                    className="max-w-full h-auto block select-none"
                    draggable={false}
                    loading={isActive ? "eager" : "lazy"}
                    fetchPriority={isActive ? "high" : "low"}
                    decoding="async"
                    onLoad={(e) => {
                      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                      if (w && h) setImgAspect(w / h);
                    }}
                  />
                  
                  {showClutterFreeToggle && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsClutterFree((v) => !v); }}
                      className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-xl bg-black/50 text-white/40 hover:bg-white hover:text-black backdrop-blur-sm transition-all active:scale-90"
                      aria-label={isClutterFree ? "Show frame" : "Focus mode"}
                    >
                      {isClutterFree ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                </motion.div>
              </div>
            )
          )}

          {/* Pagination row */}
          {showPages && total > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={prev}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
              >
                <ChevronLeft size={13} />
              </button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-xl transition-all duration-300 ${
                      i === pageIndex
                        ? "w-5 h-1.5 bg-white/60"
                        : "w-1.5 h-1.5 bg-white/15 hover:bg-white/35"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <AnimatePresence>
          {!isClutterFree && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden shrink-0"
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-white/6 sm:px-6">
                {/* Honour — left */}
                <button
                  onClick={handleHonour}
                  aria-label={isHonoured ? "Remove honour" : "Honour this work"}
                  className={`flex items-center gap-2 rounded-xl px-3.5 h-8 border transition-all duration-250 select-none active:scale-[0.96] ${
                    isHonoured
                      ? "border-[#E11D48]/25 bg-[#E11D48]/8 text-[#E11D48]"
                      : "border-white/8 bg-white/3 text-white/35 hover:text-white/60 hover:border-white/15"
                  }`}
                  style={isHonoured ? { boxShadow: "0 0 12px rgba(225,29,72,0.15)" } : undefined}
                >
                  <HonourIcon
                    size={12}
                    filled={isHonoured}
                    className="shrink-0"
                    style={{
                      filter: isHonoured ? "drop-shadow(0 0 8px rgba(225,29,72,0.6))" : "none",
                      transform: honouring ? "scale(1.6)" : "scale(1)",
                      transition: honouring
                        ? "transform 90ms cubic-bezier(0.23, 1, 0.32, 1)"
                        : "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  />
                  <motion.span layout className="text-[9px] font-black uppercase tracking-[0.22em]">
                    {isHonoured ? "Honoured" : "Honour"}
                  </motion.span>
                </button>

                {/* Originals — right */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowCurate(true); }}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 h-8 border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black hover:border-white transition-all duration-200 active:scale-[0.96]"
                >
                  <Layers size={12} strokeWidth={2} />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Originals</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clutter-free: floating close */}
        {isClutterFree && (
          <div className="absolute top-2.5 right-2.5 z-20">
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-black/50 text-white/40 hover:bg-white hover:text-black backdrop-blur-sm transition-all active:scale-90"
              aria-label="Close"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Double-tap ✦ flash — frame level, covers the whole modal */}
        {doubleTapFlash && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none rounded-[24px] overflow-hidden">
            <div style={{ animation: "honour-flash 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
              <HonourIcon size={80} filled={true} />
            </div>
          </div>
        )}
      </motion.div>

      <ArtistProfile artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      <CurateOverlay
        isOpen={showCurate}
        onClose={() => setShowCurate(false)}
        originalIds={item.originalIds || []}
        onShowToast={(msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }}
      />
      <CinematicToast message={toastMessage} />
    </>
  );

  if (!standalone) return content;

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      {content}
    </ModalWrapper>
  );
}

function copyTextFallback(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    return false;
  }
}
