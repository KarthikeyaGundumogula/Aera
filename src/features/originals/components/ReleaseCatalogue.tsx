import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TheatreItem } from "../../../types";

interface ReleaseCatalogueProps {
  items: TheatreItem[];
  onSelect: (item: TheatreItem) => void;
}

export function ReleaseCatalogue({ items, onSelect }: ReleaseCatalogueProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Auto-rotation (10 seconds)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, activeIndex]); // Restart timer on any slide change

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  if (!items.length) return null;

  const activeItem = items[activeIndex];

  // Ensure the video plays immediately upon mounting
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (node) {
      node.currentTime = 0;
      node.play().catch(() => {
        /* Auto-play suppressed by browser policy */
      });
    }
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.05
    })
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden bg-[#050505] group ${
        String(activeItem.id).includes('main-poster') ? 'cursor-default' : 'cursor-pointer'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!String(activeItem.id).includes('main-poster')) {
          onSelect(activeItem);
        }
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 w-full h-full">
            {activeItem.videoUrl && !videoErrors[activeItem.videoUrl] ? (
              <video
                key={activeItem.videoUrl}
                ref={handleVideoRef}
                src={activeItem.videoUrl}
                poster={activeItem.image}
                muted
                playsInline
                loop
                autoPlay
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                onError={() => {
                  setVideoErrors(prev => ({ ...prev, [activeItem.videoUrl!]: true }));
                }}
              />
            ) : (
              <img
                src={activeItem.image}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700"
                alt={activeItem.title}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          </div>

          {/* Metadata Overlay & Pagination */}
          <div className="absolute bottom-0 left-0 p-8 w-full z-10 pointer-events-none flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                  {String(activeItem.id).includes('main-poster') ? 'Original Spotlight' : 'Featured Release'}
                </span>
                <div className="h-px w-8 bg-white/20" />
              </div>
              
              <h1
                className="font-black tracking-tighter mb-2 md:mb-4 uppercase leading-[0.82] break-words text-white"
                style={{
                  fontSize: `clamp(2.5rem, ${Math.max(5, 15 - activeItem.title.length * 0.3)}vw, 7rem)`,
                }}
              >
                {activeItem.title}
              </h1>
            </motion.div>

            {/* Visual pagination dots/dashes */}
            {items.length > 1 && (
              <div className="flex gap-2 pointer-events-auto pb-2">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDirection(idx > activeIndex ? 1 : -1);
                      setActiveIndex(idx);
                    }}
                    className={`h-1 rounded-full transition-all duration-500 ease-out ${
                      activeIndex === idx
                        ? "w-8 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
