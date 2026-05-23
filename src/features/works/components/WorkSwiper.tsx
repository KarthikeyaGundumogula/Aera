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
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = feedContext.findIndex((i) => i.id === initialItem.id);
    return idx === -1 ? 0 : idx;
  });
  const [direction, setDirection] = useState(0);

  // Sync URL when swiping
  useEffect(() => {
    const currentWork = feedContext[currentIndex];
    if (currentWork && currentWork.id !== initialItem.id) {
      navigate(`/works/${currentWork.id}`, {
        replace: true,
        state: { backgroundLocation: window.history.state?.usr?.backgroundLocation, item: currentWork, feedContext },
      });
    }
  }, [currentIndex, feedContext, navigate, initialItem.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        paginate(1);
      } else if (e.key === "ArrowLeft") {
        paginate(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, feedContext.length]);

  const paginate = useCallback((newDirection: number) => {
    const nextIndex = currentIndex + newDirection;
    if (nextIndex >= 0 && nextIndex < feedContext.length) {
      setDirection(newDirection);
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, feedContext.length]);

  const activeWork = feedContext[currentIndex];

  if (!activeWork) return null;

  return (
    <ModalWrapper isOpen={true} onClose={onClose} className="!p-[2px] sm:!p-8 overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? "100%" : "-100%", scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? "-100%" : "100%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
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
            className="w-full h-full flex items-center justify-center max-w-[800px] cursor-grab active:cursor-grabbing"
          >
            <WorkModal item={activeWork} onClose={onClose} standalone={false} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Chevrons */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-[200] p-4 text-white/40 hover:text-white transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      )}
      {currentIndex < feedContext.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); paginate(1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-[200] p-4 text-white/40 hover:text-white transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      )}
    </ModalWrapper>
  );
}
