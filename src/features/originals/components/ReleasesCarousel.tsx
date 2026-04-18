import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Maximize2, X, Play } from "lucide-react";
import { TheatreItem } from "../../../types";
import { buildEmbedUrl, getYoutubeFallbackThumbnail } from "../../../utils/embed";
import { WorkModal } from "../../shared/modals";

interface ReleasesCarouselProps {
  items: TheatreItem[];
  initialIndex?: number;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
}

export function ReleasesCarousel({ 
  items, 
  initialIndex = 0,
  isTheaterMode = false,
  onToggleTheater
}: ReleasesCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % items.length);
    setIsIframeLoaded(false);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsIframeLoaded(false);
  }, [items.length]);

  // Auto-rotation (12 seconds) - Disable in theater mode
  useEffect(() => {
    if (isTheaterMode) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, activeIndex, isTheaterMode]);

  // Swipe handlers: draggable and responsive
  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (isTheaterMode) return;
    
    // Lower threshold for a lighter swipe feel
    const SWIPE_THRESHOLD = 30;
    const VELOCITY_THRESHOLD = 400;

    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      nextSlide();
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      prevSlide();
    }
    
    // Clear drag state slightly after end to catch any pending tap events
    setTimeout(() => {
      isDragging.current = false;
    }, 100);
  };

  if (!items.length) return null;

  const activeItem = items[activeIndex];
  const isYouTube = activeItem.platform === 'youtube';

  // Build embed URL from srcId — no URL parsing needed
  const embedUrl =
    isYouTube && activeItem.srcId
      ? buildEmbedUrl("youtube", activeItem.srcId).replace("?enablejsapi=1", "?autoplay=0&rel=0&modestbranding=1")
      : null;

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
          drag={isTheaterMode ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={() => {
            if (!isDragging.current && !isTheaterMode && !String(activeItem.id).includes('main-poster')) {
              onToggleTheater?.();
            }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            {/* Ambient background blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isTheaterMode ? 0.4 : 0.6 }}
              className="absolute inset-0 w-full h-full z-0"
            >
              <img
                src={activeItem.image}
                className="w-full h-full object-cover blur-3xl scale-110"
                alt=""
              />
            </motion.div>

            {/* Main Content Area */}
            <div className={`relative w-full h-full flex items-center justify-center z-10 ${isTheaterMode ? "p-4 md:p-12" : "p-0"}`}>
               {/* Poster Image (Always visible as fallback/placeholder) */}
               <motion.img
                  src={activeItem.image}
                  className={`w-full h-full transition-all duration-700 ${
                    isTheaterMode ? "object-contain rounded-xl shadow-2xl" : "object-cover"
                  }`}
                  style={{ 
                    opacity: (isTheaterMode && isYouTube && isIframeLoaded) ? 0 : (isTheaterMode ? 1 : 0.8) 
                  }}
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth === 120 && img.src.includes("maxresdefault")) {
                      if (isYouTube && activeItem.srcId) {
                        img.src = getYoutubeFallbackThumbnail(activeItem.srcId);
                      }
                    }
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (isYouTube && activeItem.srcId) {
                      target.src = getYoutubeFallbackThumbnail(activeItem.srcId);
                    }
                  }}
                  alt={activeItem.title}
                />

                {/* YouTube Embed Layer */}
                {isYouTube && isTheaterMode && embedUrl && (
                  <div className="absolute inset-0 p-4 md:p-12 flex items-center justify-center">
                    <div className="w-full max-w-[1280px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-black">
                      <iframe
                        src={`${embedUrl}&autoplay=1`}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={activeItem.title}
                        onLoad={() => setIsIframeLoaded(true)}
                      />
                    </div>
                  </div>
                )}

                {/* Play Overlay Hint (Gallery Mode Only) */}
                {!isTheaterMode && isYouTube && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                     <motion.div
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
                     >
                       <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                     </motion.div>
                  </div>
                )}
            </div>

            {!isTheaterMode && (
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-20" />
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
                    setIsModalOpen(true);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black active:scale-95 pointer-events-auto"
                  aria-label="Open Archive Record"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <WorkModal 
            item={isModalOpen ? activeItem : null} 
            onClose={() => setIsModalOpen(false)} 
          />


          {/* Metadata Overlay & Pagination */}
          <AnimatePresence>
            {!isTheaterMode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-20 md:bottom-24 left-0 px-8 py-6 w-full z-30 pointer-events-none flex flex-col md:flex-row md:justify-between md:items-end gap-6"
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
                        : `clamp(2.5rem, ${Math.max(4.5, 14 - (activeItem.title?.length || 0) * 0.25)}vw, 7rem)`,
                      wordBreak: "normal",
                      overflowWrap: "normal"
                    }}
                  >
                    {activeItem.title}
                  </h1>

                  
                    <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed drop-shadow-md mt-4 max-w-2xl">
                      there will be a reckoning soon
                    </p>
                  
                </motion.div>

                {/* Visual pagination dots/dashes */}
                {items.length > 1 && (
                  <div className="flex gap-2 pointer-events-auto pb-1 md:pb-2">
                    {items.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeIndex === idx) return;
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
