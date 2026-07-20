import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { TheatreItem } from "../../../types";
import { ViewerFrame, MediaSlotContext } from "./ViewerFrame";

interface StoryboardViewerProps {
  item: TheatreItem;
}

const FALLBACK_CAPTIONS = [
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
 * StoryboardViewer — wraps ViewerFrame with a 3D flip-card paginated
 * viewer as the media slot. All chrome lives in ViewerFrame.
 */
export function StoryboardViewer({ item }: StoryboardViewerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const pages = (item.images ?? []).slice(0, 10);
  const displayPages = pages.length > 0 ? pages : item.image ? [item.image] : [];
  const total = displayPages.length;
  const captions = item.captions?.length ? item.captions : FALLBACK_CAPTIONS.slice(0, total);
  const caption = captions[pageIndex] || FALLBACK_CAPTIONS[pageIndex % FALLBACK_CAPTIONS.length];

  const goTo = (idx: number) => {
    setIsFlipped(false);
    setPageIndex(idx);
    setImgAspect(null);
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
    <ViewerFrame
      item={item}
      mediaMaxWidth="min(460px,calc(100vw-2rem))"
      mediaSlot={({ doubleTapFlash, triggerDoubleTap }: MediaSlotContext) => (
        <div
          className="flex flex-col gap-4 w-full relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onPointerDown={triggerDoubleTap}
          style={{ overscrollBehavior: "contain", touchAction: "manipulation" }}
        >
          {/* Controls row: page counter + Story/Visuals toggle (Hidden on mobile) */}
          <div className="hidden sm:flex items-center justify-between pb-0">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/25">
              {pageIndex + 1} / {total}
            </span>
            <button
              onClick={() => setIsFlipped((f) => !f)}
              className={`flex items-center gap-1.5 px-3 h-6 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.95] ${
                isFlipped
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/35 border-white/10 hover:border-white/25 hover:text-white/55"
              }`}
              style={{ touchAction: "manipulation" }}
            >
              <RotateCw size={8} strokeWidth={2.5} />
              {isFlipped ? "Story" : "Board"}
            </button>
          </div>

          {/* Image & Overlay Container */}
          <div className="relative w-full flex justify-center">
            <div className="relative inline-block max-w-full">
              {/* Base Layer: Image */}
              <div
                className="overflow-hidden rounded-none border-[1.5px] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative flex justify-center"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={pageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={displayPages[pageIndex]}
                    alt={`Page ${pageIndex + 1}`}
                    className="w-auto h-auto max-w-full max-h-[70vh] lg:max-h-[calc(100vh-320px)] block select-none object-contain"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    draggable={false}
                    onLoad={(e) => {
                      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                      if (w && h) setImgAspect(w / h);
                    }}
                    style={{
                      boxShadow:
                        "0 8px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
                    }}
                  />
                </AnimatePresence>
              </div>

              {/* Overlay Layer: Story Text */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute inset-0 z-10 overflow-hidden border-[1.5px] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                  >
                    {/* The frosted glass background animates its own opacity to fix browser bugs */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] } },
                        exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
                      }}
                      style={{ willChange: "transform, opacity" }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-md" 
                    />

                    {/* The text container animates independently but perfectly synced */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] } },
                        exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
                      }}
                      className="relative z-20 flex flex-col h-full gap-4 p-5 sm:p-7"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                          Page {String(pageIndex + 1).padStart(2, "0")} /{" "}
                          {String(total).padStart(2, "0")}
                        </p>
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center text-center">
                        <p className="text-sm sm:text-[15px] font-medium text-white leading-relaxed italic">
                          &ldquo;{caption}&rdquo;
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <div className="h-px flex-1 bg-white/20" />
                        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-white/40">
                          Storyboard
                        </span>
                        <div className="h-px flex-1 bg-white/20" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pagination */}
          {total > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center min-w-[60px]">
                <button
                  onClick={prev}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
                  style={{ touchAction: "manipulation" }}
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="flex sm:hidden text-[9px] font-bold uppercase tracking-[0.3em] text-white/25 whitespace-nowrap">
                  {pageIndex + 1} / {total}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center flex-1">
                {displayPages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`rounded-xl transition-all duration-300 ${
                      i === pageIndex
                        ? "w-5 h-1.5 bg-white/60"
                        : "w-1.5 h-1.5 bg-white/15 hover:bg-white/35"
                    }`}
                    aria-label={`Page ${i + 1}`}
                    style={{ touchAction: "manipulation" }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-end min-w-[60px]">
                <button
                  onClick={next}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
                  style={{ touchAction: "manipulation" }}
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setIsFlipped((f) => !f)}
                  className={`flex sm:hidden items-center gap-1.5 px-3 h-8 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                    isFlipped
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white/35 border-white/10 hover:border-white/25 hover:text-white/55"
                  }`}
                  style={{ touchAction: "manipulation" }}
                >
                  <RotateCw size={10} strokeWidth={2.5} />
                  {isFlipped ? "Story" : "board"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    />
  );
}
