import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, X } from "lucide-react";
import { TheatreItem } from "../../../types";

interface ReleaseCatalogueProps {
  items: TheatreItem[];
  onSelect: (item: TheatreItem) => void;
  initialIndex?: number;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function ReleaseCatalogue({ 
  items, 
  onSelect, 
  initialIndex = 0,
  isTheaterMode = false,
  onToggleTheater
}: ReleaseCatalogueProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
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

  // Auto-rotation (10 seconds) - Disable in theater mode
  useEffect(() => {
    if (isTheaterMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, activeIndex, isTheaterMode]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTheaterMode) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTheaterMode || !touchStart) return;
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
      node.play().catch(() => {});
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
        String(activeItem.id).includes('main-poster') && !isTheaterMode ? 'cursor-default' : 'cursor-pointer'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!isTheaterMode && !String(activeItem.id).includes('main-poster')) {
          onToggleTheater?.();
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
          <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            {/* Ambient background blur in theater mode */}
            {isTheaterMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={activeItem.image}
                  className="w-full h-full object-cover blur-3xl scale-110"
                  alt=""
                />
              </motion.div>
            )}

            {activeItem.videoUrl && !videoErrors[activeItem.videoUrl] ? (
              <video
                key={`${activeItem.videoUrl}-${isTheaterMode}`}
                ref={handleVideoRef}
                poster={activeItem.image}
                muted={!isTheaterMode}
                controls={isTheaterMode}
                crossOrigin="anonymous"
                playsInline
                loop
                autoPlay
                className={`w-full h-full transition-all duration-700 ${
                  isTheaterMode ? "object-contain pointer-events-auto" : "object-cover pointer-events-none"
                }`}
                style={{ opacity: isTheaterMode ? 1 : 0.8 }}
                onError={() => {
                  setVideoErrors(prev => ({ ...prev, [activeItem.videoUrl!]: true }));
                }}
              >
                <source src={activeItem.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                src={activeItem.image}
                className={`w-full h-full transition-all duration-700 ${
                  isTheaterMode ? "object-contain" : "object-cover"
                }`}
                style={{ opacity: isTheaterMode ? 0.9 : 0.6 }}
                alt={activeItem.title}
              />
            )}
            {!isTheaterMode && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
            )}
          </div>

          {/* Theater Controls Overlay */}
          <AnimatePresence>
            {isTheaterMode && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTheater?.();
                  }}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-black transition-all active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(activeItem);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black active:scale-95 pointer-events-auto"
                  aria-label="Open full screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metadata Overlay & Pagination */}
          <AnimatePresence>
            {!isTheaterMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 md:bottom-24 left-0 px-8 py-6 w-full z-10 pointer-events-none flex flex-col md:flex-row md:justify-between md:items-end gap-6"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-[95vw]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-sm border border-white/10">
                      {String(activeItem.id).includes('main-poster') ? 'Original Spotlight' : 'Featured Release'}
                    </span>
                    <div className="h-px w-8 bg-white/20" />
                  </div>
                  
                  <h1
                    className="font-black tracking-tighter mb-2 uppercase leading-[0.82] text-white whitespace-pre-wrap drop-shadow-2xl"
                    style={{
                      fontSize: !(activeItem.title || "").includes(" ") 
                        ? `clamp(2.5rem, ${Math.min(14, 90 / ((activeItem.title?.length || 1) * 0.8))}vw, 7rem)`
                        : `clamp(2.5rem, ${Math.max(5, 15 - (activeItem.title?.length || 0) * 0.3)}vw, 7rem)`,
                      wordBreak: "normal",
                      overflowWrap: "normal"
                    }}
                  >
                    {activeItem.title}
                  </h1>

                  {activeItem.description && (
                    <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed drop-shadow-md mt-4 max-w-2xl">
                      {activeItem.description}
                    </p>
                  )}
                </motion.div>

                {/* Visual pagination dots/dashes */}
                {items.length > 1 && (
                  <div className="flex gap-2 pointer-events-auto pb-1 md:pb-2">
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
