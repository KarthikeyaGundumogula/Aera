import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { ScriptWorkDetail } from "../../../types";
import { ViewerFrame, MediaSlotContext } from "./ViewerFrame";
import { parseMarkdownBold } from "../../../utils/markdown";

interface StoryboardViewerProps {
  work: ScriptWorkDetail;
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

interface StreamingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  active?: boolean;
  maxDuration?: number;
  minDuration?: number;
}

export function StreamingText({
  text,
  speed,
  delay = 200,
  active = true,
  maxDuration,
  minDuration = 400,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !text) {
      setDisplayedText(active && text ? text : "");
      return;
    }

    setDisplayedText("");

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    // Bounded maximum stabilization time: ~1.1s on mobile, ~1.4s on desktop
    const effectiveMaxDuration = maxDuration ?? (isMobile ? 1100 : 1400);

    // Adaptive duration calculation:
    // Scales smoothly with text length but enforces an upper bound so large scripts
    // stabilize rapidly without lagging or taking dozens of seconds.
    const calculatedDuration = speed
      ? Math.min(effectiveMaxDuration, Math.max(minDuration, text.length * speed))
      : Math.min(
          effectiveMaxDuration,
          Math.max(
            minDuration,
            minDuration + Math.sqrt(text.length) * (isMobile ? 24 : 32)
          )
        );

    const startTimer = setTimeout(() => {
      let startTime: number | null = null;
      let lastCount = 0;

      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / calculatedDuration);

        // Ease-out curve: dynamic stream rushes in and settles cleanly
        const eased = 1 - Math.pow(1 - progress, 2);
        const targetCount = Math.min(text.length, Math.ceil(eased * text.length));

        if (targetCount !== lastCount) {
          lastCount = targetCount;
          setDisplayedText(text.slice(0, targetCount));
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, speed, delay, active, maxDuration, minDuration]);

  // Tap-to-complete: tapping while streaming immediately reveals the full script
  const handleInstantReveal = (e: React.MouseEvent) => {
    if (displayedText.length < text.length) {
      e.stopPropagation();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      setDisplayedText(text);
    }
  };

  return (
    <span
      onClick={handleInstantReveal}
      className="inline cursor-pointer select-text"
      title={displayedText.length < text.length ? "Tap to reveal entire script" : undefined}
    >
      {parseMarkdownBold(displayedText)}
    </span>
  );
}

/**
 * StoryboardViewer — wraps ViewerFrame with a paginated
 * viewer as the media slot. All chrome lives in ViewerFrame.
 */
export function StoryboardViewer({ work, item }: StoryboardViewerProps & { item?: any }) {
  const activeWork = work || item;
  const [{ pageIndex, direction }, setPageState] = useState({ pageIndex: 0, direction: 1 });
  const [isFlipped, setIsFlipped] = useState(false);
  const isRevealed = isFlipped;
  const setIsRevealed = (val: any) => setIsFlipped(typeof val === "function" ? val(isFlipped) : val);
  const [imgAspect, setImgAspect] = useState<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const rawPages = activeWork?.images?.length
    ? activeWork.images
    : activeWork?.frames?.length
    ? activeWork.frames
    : (activeWork as any)?.srcId
    ? [(activeWork as any).srcId]
    : activeWork?.originals?.[0]?.coverPoster
    ? [activeWork.originals[0].coverPoster]
    : [];

  const displayPages = rawPages;
  const total = displayPages.length;
  const rawCaptions = activeWork?.captions?.length ? activeWork.captions : (activeWork?.thoughts?.length ? activeWork.thoughts : []);
  const captions = rawCaptions.length ? rawCaptions : FALLBACK_CAPTIONS.slice(0, Math.max(1, total));
  const caption = captions[pageIndex] || (total > 0 ? FALLBACK_CAPTIONS[pageIndex % FALLBACK_CAPTIONS.length] : FALLBACK_CAPTIONS[0]);

  useEffect(() => {
    if (!isRevealed) {
      setIsOverflowing(false);
      return;
    }
    const container = textContainerRef.current;
    const content = textContentRef.current;
    if (!container || !content) return;

    const checkOverflow = () => {
      setIsOverflowing(content.scrollHeight > container.clientHeight + 4);
    };

    checkOverflow();

    const ro = new ResizeObserver(checkOverflow);
    ro.observe(container);
    ro.observe(content);
    return () => ro.disconnect();
  }, [isRevealed, caption, pageIndex]);

  const goTo = (idx: number) => {
    setIsFlipped(false);
    setImgAspect(null);
    setPageState((prev) => ({
      pageIndex: idx,
      direction: idx > prev.pageIndex ? 1 : -1,
    }));
  };
  const prev = () => {
    if (total <= 0) return;
    setIsFlipped(false);
    setImgAspect(null);
    setPageState((prev) => ({
      pageIndex: (prev.pageIndex - 1 + total) % total,
      direction: -1,
    }));
  };
  const next = () => {
    if (total <= 0) return;
    setIsFlipped(false);
    setImgAspect(null);
    setPageState((prev) => ({
      pageIndex: (prev.pageIndex + 1) % total,
      direction: 1,
    }));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Only paginate on intentional horizontal swipe
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? next() : prev();
    }
  };

  return (
    <ViewerFrame
      work={work}
      mediaMaxWidth="min(460px,calc(100vw-2rem))"
      mediaSlot={({ doubleTapFlash, triggerDoubleTap }: MediaSlotContext) => (
        <div
          className="flex flex-col gap-4 w-full relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onPointerDown={triggerDoubleTap}
          style={{ touchAction: "pan-y" }}
        >
          {/* Image & Overlay Container */}
          <div
            className="relative w-full flex justify-center select-none group"
          >
            <div className="relative inline-block max-w-full">
              {/* Base Layer: Image */}
              <div
                className="overflow-hidden rounded-none border-[1.5px] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative grid place-items-center"
              >
                <AnimatePresence custom={direction} mode="popLayout">
                  <motion.img
                    key={pageIndex}
                    custom={direction}
                    variants={{
                      enter: (d: number) => ({
                        x: d > 0 ? "100%" : "-100%",
                        zIndex: 10,
                      }),
                      center: {
                        x: 0,
                        zIndex: 10,
                      },
                      exit: (d: number) => ({
                        x: d > 0 ? "-100%" : "100%",
                        zIndex: 0,
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    src={displayPages[pageIndex]}
                    alt={`Page ${pageIndex + 1}`}
                    className="row-start-1 col-start-1 w-auto h-auto max-w-full max-h-[70vh] lg:max-h-[calc(100vh-320px)] block select-none object-contain"
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
                {isRevealed && (
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
                      
                      <div 
                        ref={textContainerRef}
                        className={`flex-1 min-h-0 py-2 px-1 text-center no-scrollbar ${
                          isOverflowing ? "overflow-y-auto" : "overflow-hidden"
                        }`}
                        style={{ touchAction: isOverflowing ? "pan-y" : "auto" }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div ref={textContentRef} className="min-h-full flex flex-col justify-center my-auto">
                          <p className="text-sm sm:text-[15px] font-medium text-white leading-relaxed select-text">
                            <StreamingText text={caption} active={isRevealed} />
                          </p>
                        </div>
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

          {/* Bottom Controls: Page Numbers + Pagination + Story/Board toggle */}
          <div className="flex items-center justify-between gap-3 pt-2 px-1">
            <div className="flex items-center gap-2 min-w-[60px]">
              {total > 1 && (
                <button
                  onClick={prev}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
                  style={{ touchAction: "manipulation" }}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={13} />
                </button>
              )}
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 whitespace-nowrap">
                {total > 0 ? `${pageIndex + 1} / ${total}` : "1 / 1"}
              </span>
            </div>

            {total > 1 && (
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
            )}

            <div className="flex items-center justify-end gap-2 min-w-[60px]">
              <button
                onClick={() => setIsRevealed((r: boolean) => !r)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                  isRevealed
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/35 border-white/10 hover:border-white/25 hover:text-white/55"
                }`}
                style={{ touchAction: "manipulation" }}
              >
                <RotateCw size={10} strokeWidth={2.5} />
                {isRevealed ? "Story" : "Board"}
              </button>
              {total > 1 && (
                <button
                  onClick={next}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black transition-all active:scale-90 shrink-0"
                  style={{ touchAction: "manipulation" }}
                  aria-label="Next page"
                >
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}
