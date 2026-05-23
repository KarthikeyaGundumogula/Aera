import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../../types";
import { WorkModal } from "../../shared/modals/WorkModal";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { motion, AnimatePresence } from "motion/react";

interface WorkSwiperProps {
  initialItem: TheatreItem;
  feedContext: TheatreItem[];
  onClose: () => void;
}

export function WorkSwiper({ initialItem, feedContext, onClose }: WorkSwiperProps) {
  const navigate = useNavigate();
  
  // page is an absolute integer that can grow infinitely
  const [page, setPage] = useState(() => {
    const idx = feedContext.findIndex((i) => i.id === initialItem.id);
    return idx === -1 ? 0 : idx;
  });
  
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    return localStorage.getItem("framehouse_swipe_hint") !== "true";
  });

  // Safely wrap the absolute page back to a valid array index
  const activeIndex = ((page % feedContext.length) + feedContext.length) % feedContext.length;
  const activeWork = feedContext[activeIndex];

  // Sync URL when swiping (Debounced to prevent history thrashing)
  useEffect(() => {
    if (!activeWork || activeWork.id === initialItem.id) return;

    const timer = setTimeout(() => {
      navigate(`/works/${activeWork.id}`, {
        replace: true,
        state: { backgroundLocation: window.history.state?.usr?.backgroundLocation, item: activeWork, feedContext },
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [activeIndex, feedContext, navigate, initialItem.id, activeWork]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedContext.length <= 1) return;
      if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [feedContext.length]);

  const paginate = useCallback((newDirection: number) => {
    if (showSwipeHint) {
      // Defer synchronous I/O so it doesn't hitch the animation loop
      setTimeout(() => {
        localStorage.setItem("framehouse_swipe_hint", "true");
      }, 0);
      setShowSwipeHint(false);
    }
    setPage((p) => p + newDirection);
  }, [showSwipeHint]);

  if (!activeWork) return null;

  const isDraggable = feedContext.length > 1;

  return (
    <ModalWrapper isOpen={true} onClose={onClose} className="overflow-hidden" isImmersive={true}>
      <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden pointer-events-none p-4 sm:p-8">
        {/* The Infinite Sliding Track */}
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-auto"
          animate={{ x: `-${page * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          drag={isDraggable ? "x" : false}
          dragElastic={1}
          dragDirectionLock
          dragMomentum={false}
          style={{ touchAction: "pan-y", willChange: "transform" }}
          onDragEnd={(e, { offset, velocity }) => {
            const swipePower = offset.x + velocity.x * 0.2;
            if (swipePower < -100) {
              paginate(1);
            } else if (swipePower > 100) {
              paginate(-1);
            }
          }}
        >
          {/* Virtual rendering: only render -1, 0, +1 relative to current page */}
          {(isDraggable ? [-1, 0, 1] : [0]).map((offset) => {
            const virtualPage = page + offset;
            const itemIndex = ((virtualPage % feedContext.length) + feedContext.length) % feedContext.length;
            const item = feedContext[itemIndex];

            if (!item) return null;

            return (
              <div
                key={`${item.id}-${virtualPage}`}
                className="absolute inset-y-0 flex items-center justify-center px-[2px] sm:px-0"
                style={{ left: `${virtualPage * 100}%`, width: "100%" }}
              >
                <div className="w-full h-full max-w-[800px] pointer-events-auto flex items-center justify-center">
                  <WorkModal item={item} onClose={onClose} standalone={false} isActive={offset === 0} />
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Navigation Chevrons (Desktop Only) */}
        {isDraggable && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-[200] p-4 text-white/40 hover:text-white transition-colors pointer-events-auto"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-[200] p-4 text-white/40 hover:text-white transition-colors pointer-events-auto"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}

        {/* Swipe Hint (Mobile Only, First Time) */}
        <AnimatePresence>
          {showSwipeHint && feedContext.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bottom-28 inset-x-0 z-[300] pointer-events-none flex justify-center sm:hidden"
            >
              <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md shadow-2xl">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">Swipe to explore</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalWrapper>
  );
}
