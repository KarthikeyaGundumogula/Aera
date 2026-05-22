import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef } from "react";
import {
  LayoutPanelLeft,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookOpen,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";
import { CurateOverlay } from "./CurateOverlay";
import { AdaptiveTitle } from "../../../components/AdaptiveTitle";
import { WorkActionBar } from "./WorkActionBar";
import { CinematicToast } from "./CinematicToast";

interface StaticFrameProps {
  item: TheatreItem;
  onClose: () => void;
  /** Header label e.g. "Script Archive" or "Poster" */
  archiveLabel: string;
  /** Show multi-page navigation (prev/next, dots, page counter) */
  showPages: boolean;
  /** Show the flip-to-details back side and flip button */
  showDetails: boolean;
  /** Show eye toggle for clutter-free mode (hides header + footer, image only) */
  showClutterFreeToggle?: boolean;
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
 * StaticFrame — Unified frame for static content (Scripts & Posters).
 *
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │  Header: Label · Title · ActionBar · Close       │
 * ├──────────────────────────────────────────────────┤
 * │  Image Area (flip-card if showDetails)            │
 * │  [Page counter + flip btn]  (if showPages/Details)│
 * │  [Prev/Next + dots]         (if showPages)        │
 * ├──────────────────────────────────────────────────┤
 * │  Footer: Artist · View Originals                  │
 * └──────────────────────────────────────────────────┘
 */
export function StaticFrame({
  item,
  onClose,
  archiveLabel,
  showPages,
  showDetails,
  showClutterFreeToggle = false,
}: StaticFrameProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCurate, setShowCurate] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const [isClutterFree, setIsClutterFree] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // ── Page data ───────────────────────────────────────────────────────
  const pages = showPages ? (item.images ?? []).slice(0, 10) : [item.image || ""];
  const total = pages.length;
  const caption =
    item.captions?.[pageIndex] || PAGE_CAPTIONS[pageIndex % PAGE_CAPTIONS.length];

  // ── Navigation ──────────────────────────────────────────────────────
  const goTo = (idx: number) => {
    setIsFlipped(false);
    setPageIndex(idx);
    setImgAspect(null);
  };
  const prev = () => goTo((pageIndex - 1 + total) % total);
  const next = () => goTo((pageIndex + 1) % total);

  // ── Touch swipe (scripts only) ─────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    if (!showPages) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!showPages || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  // ── Artist click handler ───────────────────────────────────────────
  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
    setSelectedArtist(
      artistData || {
        id: String(item.id),
        name: item.artist || "Anonymous",
        presence: 0,
        works: 0,
        image: item.artistAvatar || item.image || "",
      },
    );
  };

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      <motion.div
        key="static-frame-card"
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-lg overflow-hidden rounded-[28px] border border-white/8 bg-[#0d0c0a] shadow-2xl"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,204,184,0.07),transparent_40%)] pointer-events-none" />

        {/* Main Content Area */}
        <div className="relative flex flex-1 flex-col bg-[#0d0c0a]">
          {/* ── Header ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {!isClutterFree && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 sm:px-7">
                  <div className="min-w-0">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.34em] text-white/25">
                      {archiveLabel}
                    </p>
                    <AdaptiveTitle
                      title={item.title || "Untitled"}
                      as="h3"
                      multiWordClass="text-sm sm:text-base tracking-tight"
                      singleWordClamp="clamp(0.85rem, 4vw, 1.15rem)"
                      className="text-white/80"
                    />
                  </div>

                  {/* Header Action Bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <WorkActionBar
                      isLiked={isLiked}
                      setIsLiked={setIsLiked}
                      setToastMessage={setToastMessage}
                      workId={item.id}
                      variant="script"
                    />

                    <button
                      onClick={onClose}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white hover:text-black active:scale-95"
                      aria-label="Close modal"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Image Area ──────────────────────────────────────────── */}
          <div
            className="flex-1 p-4 sm:p-5 flex flex-col gap-3"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Page counter + flip button (only for scripts) */}
            {showPages && (
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
                  <BookOpen size={10} />
                  Page {pageIndex + 1} / {total}
                </span>
                <div className="flex items-center gap-2">
                  {showDetails && (
                    <button
                      onClick={() => setIsFlipped((f) => !f)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.25em] transition-all ${
                        isFlipped
                          ? "bg-white/90 text-black border-white/90"
                          : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <RotateCw size={9} />
                      {isFlipped ? "Image" : "Details"}
                    </button>
                  )}
                  {showClutterFreeToggle && (
                    <button
                      onClick={() => setIsClutterFree((v) => !v)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
                        isClutterFree
                          ? "bg-white/90 text-black shadow-lg"
                          : "bg-white/5 text-white/30 border border-white/10 hover:text-white/60 hover:bg-white/10"
                      }`}
                      aria-label={isClutterFree ? "Show frame details" : "Focus on image"}
                      title={isClutterFree ? "Show details" : "Focus mode"}
                    >
                      {isClutterFree ? (
                        <EyeOff size={11} strokeWidth={2.5} />
                      ) : (
                        <Eye size={11} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                  {isClutterFree && (
                    <button
                      onClick={onClose}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/30 border border-white/10 hover:text-white/60 hover:bg-white/10 transition-all duration-300 active:scale-90"
                      aria-label="Close modal"
                      title="Close"
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Flip card (or static image for posters) */}
            {showDetails ? (
              /* ── Flip card for scripts ─────────────────────────── */
              <div className="relative w-full" style={{ perspective: "1200px" }}>
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", damping: 26, stiffness: 200 }}
                  className="relative w-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {(() => {
                    const cardStyle: React.CSSProperties = imgAspect
                      ? { aspectRatio: String(imgAspect) }
                      : {};

                    return (
                      <>
                        {/* Front — image */}
                        <div
                          className={`w-full rounded-[18px] overflow-hidden border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#0d0c0a] relative ${
                            isClutterFree ? "" : "cursor-pointer"
                          }`}
                          style={{ ...cardStyle, backfaceVisibility: "hidden" }}
                          onClick={() => !isClutterFree && setIsFlipped(true)}
                        >
                          <img
                            loading="lazy"
                            key={pageIndex}
                            src={pages[pageIndex]}
                            alt={`Page ${pageIndex + 1}`}
                            className="w-full h-auto block"
                            onLoad={(e) => {
                              const { naturalWidth, naturalHeight } =
                                e.currentTarget;
                              if (naturalWidth && naturalHeight) {
                                setImgAspect(naturalWidth / naturalHeight);
                              }
                            }}
                          />
                        </div>

                        {/* Back — page details */}
                        <div
                          className={`absolute inset-0 w-full h-full rounded-[18px] overflow-hidden border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#111] p-6 flex flex-col justify-start ${
                            isClutterFree ? "" : "cursor-pointer"
                          }`}
                          style={{
                            transform: "rotateY(180deg)",
                            backfaceVisibility: "hidden",
                          }}
                          onClick={() => !isClutterFree && setIsFlipped(false)}
                        >
                          {/* Blurred bg */}
                          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-[18px]">
                            <img
                              loading="lazy"
                              src={pages[pageIndex]}
                              className="w-full h-full object-cover blur-2xl scale-125"
                              alt=""
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                          </div>

                          <div className="relative z-10 space-y-5">
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/25">
                                  Page Notes
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                  {item.title}
                                </p>
                              </div>
                              <span className="text-[9px] font-black font-mono text-white/20">
                                {String(pageIndex + 1).padStart(2, "0")} /{" "}
                                {String(total).padStart(2, "0")}
                              </span>
                            </div>

                            <p className="text-sm sm:text-base font-medium text-white/75 leading-relaxed italic">
                              &ldquo;{caption}&rdquo;
                            </p>
                          </div>

                          <div className="relative z-10 flex items-center gap-2">
                            <div className="h-px flex-1 bg-white/8" />
                            <span className="text-[7px] font-black uppercase tracking-[0.5em] text-white/15">
                              Script
                            </span>
                            <div className="h-px flex-1 bg-white/8" />
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </div>
            ) : (
              /* ── Static image for posters (no flip) ────────────── */
              <div className="relative w-full flex justify-center">
                <div
                  className="relative rounded-[18px] overflow-hidden border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#0d0c0a] inline-block max-w-full"
                >
                  <img
                    loading="lazy"
                    src={pages[0]}
                    alt={item.title || "Poster"}
                    className="max-w-full h-auto block"
                    onLoad={(e) => {
                      const { naturalWidth, naturalHeight } = e.currentTarget;
                      if (naturalWidth && naturalHeight) {
                        setImgAspect(naturalWidth / naturalHeight);
                      }
                    }}
                  />

                  {/* Clutter-free eye toggle — subtle, bottom-right corner of the image */}
                  {showClutterFreeToggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClutterFree((v) => !v);
                      }}
                      className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 active:scale-90 ${
                        isClutterFree
                          ? "bg-white/90 text-black shadow-lg"
                          : "bg-black/40 text-white/30 hover:text-white/60 hover:bg-black/60 backdrop-blur-sm"
                      }`}
                      aria-label={isClutterFree ? "Show frame details" : "Focus on image"}
                      title={isClutterFree ? "Show details" : "Focus mode"}
                    >
                      {isClutterFree ? (
                        <EyeOff size={13} strokeWidth={2.5} />
                      ) : (
                        <Eye size={13} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation row — only for multi-page scripts */}
            {showPages && total > 1 && (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all active:scale-90"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === pageIndex
                          ? "w-4 h-1.5 bg-white/60"
                          : "w-1.5 h-1.5 bg-white/15 hover:bg-white/35"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 hover:bg-white hover:text-black transition-all active:scale-90"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {!isClutterFree && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between border-t border-white/6 px-5 py-4 sm:px-7">
                  <div
                    className="flex items-center gap-3 text-white/70 cursor-pointer group/artist"
                    onClick={handleArtistClick}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover/artist:bg-white group-hover/artist:text-black transition-all">
                      <LayoutPanelLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 group-hover/artist:text-white/40 transition-colors">
                        Artist
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 group-hover/artist:text-white transition-colors">
                        {item.artist || "Collective"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="relative z-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCurate(true);
                    }}
                  >
                    <div className="cursor-pointer pointer-events-auto group flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300 rounded-xl">
                      <Layers
                        size={14}
                        className="group-hover:fill-current pointer-events-none"
                      />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none sm:inline hidden">
                        View Associated Originals
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none sm:hidden">
                        Originals
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clutter-free: minimal close button */}
          {isClutterFree && !showPages && (
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/30 hover:text-white/60 hover:bg-black/60 backdrop-blur-sm transition-all active:scale-90"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Artist Profile Integration */}
      <ArtistProfile
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      <CurateOverlay
        isOpen={showCurate}
        onClose={() => setShowCurate(false)}
        originalIds={item.originalIds || []}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Visual Hit Toast */}
      <CinematicToast message={toastMessage} />
    </ModalWrapper>
  );
}
