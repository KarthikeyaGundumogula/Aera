import { motion } from "motion/react";
import React, { useState, useRef } from "react";
import { LayoutPanelLeft, X, ArrowUpRight, ChevronLeft, ChevronRight, RotateCw, BookOpen } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";

interface ScriptModalProps {
  item: TheatreItem | null;
  onClose: () => void;
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

export function ScriptModal({ item, onClose }: ScriptModalProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const navigate = useNavigate();

  if (!item) return null;

  const pages = (item.images ?? []).slice(0, 10);
  const total = pages.length;
  const caption = item.captions?.[pageIndex] || PAGE_CAPTIONS[pageIndex % PAGE_CAPTIONS.length];

  const goTo = (idx: number) => {
    setIsFlipped(false);
    setPageIndex(idx);
    setImgAspect(null); // reset until new image loads
  };
  const prev = () => goTo((pageIndex - 1 + total) % total);
  const next = () => goTo((pageIndex + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      <motion.div
        key="script-modal-card"
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 sm:px-7">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.34em] text-white/25">
                Script Archive
              </p>
              <h3 className="truncate text-sm font-bold uppercase tracking-tight text-white/80 sm:text-base">
                {item.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white hover:text-black active:scale-95"
              aria-label="Close script modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Comic-book pager */}
          <div
            className="flex-1 p-4 sm:p-5 flex flex-col gap-3"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Page counter row */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
                <BookOpen size={10} />
                Page {pageIndex + 1} / {total}
              </span>
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
            </div>

            {/* Flip card — no page-change animation, instant swap */}
            <div className="relative w-full" style={{ perspective: "1200px" }}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 200 }}
                className="relative w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Shared card height — driven by detected image aspect ratio */}
                {(() => {
                  const cardStyle: React.CSSProperties = imgAspect
                    ? { aspectRatio: String(imgAspect) }
                    : {}; // collapses until image reports its size

                  return (
                    <>
                      {/* Front — image at natural dimensions, no crop */}
                      <div
                        className="w-full rounded-[18px] overflow-hidden border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#0d0c0a] cursor-pointer relative"
                        style={{ ...cardStyle, backfaceVisibility: "hidden" }}
                        onClick={() => setIsFlipped(true)}
                      >
                        {/* Top-left flip hint */}
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
                          <RotateCw size={8} className="text-white/40" />
                          <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/35">Details</span>
                        </div>

                        <img
                          key={pageIndex}
                          src={pages[pageIndex]}
                          alt={`Page ${pageIndex + 1}`}
                          className="w-full h-auto block"
                          onLoad={(e) => {
                            const { naturalWidth, naturalHeight } = e.currentTarget;
                            if (naturalWidth && naturalHeight) {
                              setImgAspect(naturalWidth / naturalHeight);
                            }
                          }}
                        />
                      </div>

                      {/* Back — page details, same aspect ratio as front */}
                      <div
                        className="absolute inset-0 w-full h-full rounded-[18px] overflow-hidden border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#111] p-6 flex flex-col justify-between cursor-pointer"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                        }}
                        onClick={() => setIsFlipped(false)}
                      >
                        {/* Blurred bg */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-[18px]">
                          <img
                            src={pages[pageIndex]}
                            className="w-full h-full object-cover blur-2xl scale-125"
                            alt=""
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                        </div>

                        <div className="relative z-10 space-y-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/25">Page Notes</p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{item.title}</p>
                            </div>
                            <span className="text-[9px] font-black font-mono text-white/20">
                              {String(pageIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                            </span>
                          </div>

                          <p className="text-sm sm:text-base font-medium text-white/75 leading-relaxed italic">
                            &ldquo;{caption}&rdquo;
                          </p>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 mt-4">
                          <div className="h-px flex-1 bg-white/8" />
                          <span className="text-[7px] font-black uppercase tracking-[0.5em] text-white/15">Aera Script</span>
                          <div className="h-px flex-1 bg-white/8" />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </div>

            {/* Navigation row — only when more than 1 page */}
            {total > 1 && (
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

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-white/6 px-5 py-4 sm:px-7">
            <div
              className="flex items-center gap-3 text-white/70 cursor-pointer group/artist"
              onClick={(e) => {
                e.stopPropagation();
                const artistData = ARTISTS_MOCK.find(a => a.name === item.artist);
                setSelectedArtist(artistData || {
                  id: String(item.id),
                  name: item.artist || "Anonymous",
                  presence: 0,
                  works: 0,
                  image: item.artistAvatar || item.image || ""
                });
              }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 group-hover/artist:bg-white group-hover/artist:text-black transition-all">
                <LayoutPanelLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 group-hover/artist:text-white/40 transition-colors">
                  Artist Credits
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 group-hover/artist:text-white transition-colors">
                  {item.artist || "Aera Collective"}
                </p>
              </div>
            </div>

            <div
              className="max-w-[45%] text-right cursor-pointer group/orig relative"
              onClick={(e) => {
                e.stopPropagation();
                if (item.originalIds?.[0]) {
                  onClose();
                  navigate(`/originals/${item.originalIds[0]}`);
                }
              }}
            >
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mb-1 group-hover/orig:text-white/35 transition-colors">Original</p>
              <div className="flex items-center justify-end gap-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/30 group-hover/orig:text-white transition-colors">
                  Archive
                </p>
                <ArrowUpRight size={10} className="text-white/15 group-hover/orig:text-white/50 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Artist Profile Integration */}
      <ArtistProfile
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </ModalWrapper>
  );
}
