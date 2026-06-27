import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clapperboard, X, BookPlus, Sparkles } from "lucide-react";
import { RecommendationModal } from "./RecommendationModal";
import { CreateRecommendationModal } from "./CreateRecommendationModal";
import { CollectionEntryModal } from "@/features/collection/components/CollectionEntryModal";
import { ActionNode, ARC_RADIUS } from "./fab/ActionNode";
import { useRecommendationContext } from "../context/RecommendationContext";


// SVG sweep for the film strip background (-80 to -190 degrees for a wide arc)
const sweepStart = -80 * (Math.PI / 180);
const sweepEnd = -190 * (Math.PI / 180);
const pStart = { x: Math.cos(sweepStart) * ARC_RADIUS, y: Math.sin(sweepStart) * ARC_RADIUS };
const pEnd = { x: Math.cos(sweepEnd) * ARC_RADIUS, y: Math.sin(sweepEnd) * ARC_RADIUS };
const filmPath = `M ${pStart.x} ${pStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 0 ${pEnd.x} ${pEnd.y}`;

// Outer and inner edges of the film strip (the double border)
const outerR = ARC_RADIUS + 22;
const innerR = ARC_RADIUS - 22;
const oStart = { x: Math.cos(sweepStart) * outerR, y: Math.sin(sweepStart) * outerR };
const oEnd = { x: Math.cos(sweepEnd) * outerR, y: Math.sin(sweepEnd) * outerR };
const outerPath = `M ${oStart.x} ${oStart.y} A ${outerR} ${outerR} 0 0 0 ${oEnd.x} ${oEnd.y}`;

const iStart = { x: Math.cos(sweepStart) * innerR, y: Math.sin(sweepStart) * innerR };
const iEnd = { x: Math.cos(sweepEnd) * innerR, y: Math.sin(sweepEnd) * innerR };
const innerPath = `M ${iStart.x} ${iStart.y} A ${innerR} ${innerR} 0 0 0 ${iEnd.x} ${iEnd.y}`;


export function GlobalActionFAB() {
  const {
    isOpen: isModalOpen,
    startIndex: recStartIndex,
    openRecommendation,
    closeRecommendation
  } = useRecommendationContext();

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isCreateRecOpen, setIsCreateRecOpen] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTracker = useRef(new WeakMap<EventTarget, number>());

  // Unified Auto-hide & Scroll Logic (Twitter style intent tracking)
  useEffect(() => {
    let lastTouchY = 0;
    let accumulatedDelta = 0;

    const isAtTop = () => {
      if (window.scrollY > 10) return false;
      // Also check nested scrolling containers taking up most of the screen
      const containers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll');
      for (let i = 0; i < containers.length; i++) {
        if (containers[i].clientHeight >= window.innerHeight * 0.5 && containers[i].scrollTop > 10) {
          return false;
        }
      }
      return true;
    };

    const startIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (isMenuOpen || isModalOpen) return;
      
      idleTimerRef.current = setTimeout(() => {
        if (!isAtTop()) {
          setIsVisible(false);
          setShowHint(false);
        }
      }, 3500);
    };

    const handleInteraction = () => {
      if (isMenuOpen || isModalOpen) return;
      setIsVisible(true);
      startIdleTimer();
    };

    // Desktop Wheel (Mouse/Trackpad)
    const handleWheel = (e: WheelEvent) => {
      if (isMenuOpen || isModalOpen) return;
      
      accumulatedDelta += e.deltaY;

      if (accumulatedDelta > 50) {
        setIsVisible(false);
        setShowHint(false);
        accumulatedDelta = 0;
      } else if (accumulatedDelta < -50) {
        setIsVisible(true);
        accumulatedDelta = 0;
      }
      startIdleTimer();
    };

    // Mobile Touch
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      accumulatedDelta = 0;
      setIsVisible(true);
      startIdleTimer();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isMenuOpen || isModalOpen) return;
      const currentTouchY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentTouchY;

      accumulatedDelta += deltaY;
      lastTouchY = currentTouchY;

      if (accumulatedDelta > 50) {
        setIsVisible(false);
        setShowHint(false);
        accumulatedDelta = 0;
      } else if (accumulatedDelta < -50) {
        setIsVisible(true);
        accumulatedDelta = 0;
      }
    };

    // Fallback for native scrollbar dragging or page jumps
    let lastScrollY = window.scrollY;
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      let currentScrollY = 0;

      if (target === document) {
        currentScrollY = window.scrollY;
      } else {
        currentScrollY = (target as HTMLElement).scrollTop;
      }

      if (currentScrollY > lastScrollY + 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 50) {
        setIsVisible(true);
      }
      
      if (currentScrollY < 20) {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    // Listeners
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    startIdleTimer();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isMenuOpen, isModalOpen, isCollectionModalOpen, isCreateRecOpen]);

  // Listen for global event to open Collection Modal
  useEffect(() => {
    const handleOpenCollection = () => setIsCollectionModalOpen(true);
    window.addEventListener("openCollectionModal", handleOpenCollection);
    return () => window.removeEventListener("openCollectionModal", handleOpenCollection);
  }, []);

  function handleOpen() {
    setShowHint(false);
    setIsMenuOpen(false); // Close menu if open
    if (isModalOpen) return;

    setIsSnapping(true);
    setTimeout(() => setFlashVisible(true), 120);
    setTimeout(() => {
      openRecommendation(0);
      setIsSnapping(false);
    }, 400);
    setTimeout(() => {
      setFlashVisible(false);
    }, 1520);
  }

  const handleTapStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      handleOpen();
      longPressTimerRef.current = null;
    }, 500);
  };

  const handleTapCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTap = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setIsMenuOpen((prev) => !prev);
    }
  };

  return (
    <>
      {/* First-Time Hint Bubble */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ duration: 0.5, delay: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-[164px] right-5 md:bottom-[108px] md:right-10 z-[90] flex items-center gap-3 bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-2xl py-3 px-4 shadow-[0_8px_32px_rgba(180,83,9,0.2)] origin-bottom-right pointer-events-auto"
          >
            <span className="relative flex h-2 w-2 shrink-0 mr-2 ml-0.5 mt-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B45309] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B45309]"></span>
            </span>
            <div className="flex flex-col pr-1 cursor-pointer" onClick={() => setShowHint(false)}>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#B45309] mb-0.5">Quick Actions</span>
              <span className="text-[11px] font-medium text-white/90 whitespace-nowrap">Tap to Create • Hold for Picks</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
              className="p-1 -mr-2 ml-1 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#0A0806] border-b border-r border-[#B45309]/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Wrapper */}
      <motion.div 
        className="fixed bottom-28 right-5 md:bottom-12 md:right-12 w-14 h-14 z-[100] touch-none origin-center"
        animate={{
          scale: isVisible ? 1 : 0,
          opacity: isVisible ? 1 : 0,
          rotate: isVisible ? 0 : 45,
          y: 0,
          filter: isVisible ? "blur(0px)" : "blur(8px)",
        }}
        initial={false}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
      >
        
        {/* Focus Pull Backdrop */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "linear" }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xxl z-[95]"
              style={{ top: "-100vh", left: "-100vw", right: "-100vw", bottom: "-100vh" }}
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* The True Arc Film Strip */}
        <AnimatePresence>
          {isMenuOpen && (
            <svg className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none z-[105]">
              <defs>
                <linearGradient id="arc-glow" x1="1" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                <linearGradient id="arc-glow-amber" x1="1" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="rgba(217,119,6,1.0)" />
                  <stop offset="100%" stopColor="rgba(217,119,6,0)" />
                </linearGradient>
                <linearGradient id="arc-ambient" x1="1" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
              </defs>

              {/* Ambient blurred backdrop for contrast */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                d={filmPath}
                stroke="url(#arc-ambient)"
                strokeWidth={70}
                filter="blur(12px)"
                fill="none"
              />
              
              {/* Sleek outer glowing cinematic arc (White) */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
                d={outerPath}
                stroke="url(#arc-glow)"
                strokeWidth={2}
                filter="drop-shadow(0px 0px 4px rgba(255,255,255,0.5))"
                fill="none"
              />

              {/* Sleek inner glowing cinematic arc (Amber) */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
                d={innerPath}
                stroke="url(#arc-glow-amber)"
                strokeWidth={2}
                filter="drop-shadow(0px 0px 6px rgba(217,119,6,0.8))"
                fill="none"
              />
            </svg>
          )}
        </AnimatePresence>

        {/* Cinematic Action Nodes */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <ActionNode
                icon={<Sparkles className="w-5 h-5" strokeWidth={2.5} />}
                label="New Recommendation"
                angleDeg={-105} 
                delay={0}
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCreateRecOpen(true);
                }}
              />
              <ActionNode
                icon={<BookPlus className="w-5 h-5" strokeWidth={2.5} />}
                label="Add to Collection"
                angleDeg={-165} 
                delay={0.05}
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCollectionModalOpen(true);
                }}
              />
            </>
          )}
        </AnimatePresence>

        {/* The FAB Core */}
        <motion.button
          onTapStart={handleTapStart}
          onTapCancel={handleTapCancel}
          onTap={handleTap}
          className="absolute inset-0 group flex items-center justify-center rounded-full bg-black/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]/60 touch-none select-none z-[120]"
          aria-label="Recommendation Actions"
          whileTap={{ scale: 0.88 }}
          animate={{ rotate: isMenuOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <motion.div
            animate={
              isMenuOpen
                ? { rotate: 0, y: 0 }
                : isSnapping
                ? { rotate: [0, -24, -8, 0], y: [0, -3, -1, 0] }
                : { rotate: [0, -16, 6, -12, 0], y: [0, -3, 0, -2, 0] }
            }
            transition={
              isMenuOpen
                ? { duration: 0.2 }
                : isSnapping
                ? { duration: 0.18, ease: [0.23, 1, 0.32, 1] }
                : { duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }
            }
            className="relative"
          >
            {isMenuOpen ? (
               <X className="w-6 h-6 text-[#D97706] transition-colors duration-300 pointer-events-none" strokeWidth={2} />
            ) : (
               <Clapperboard
                 className="w-6 h-6 text-white/70 group-hover:text-[#D97706] transition-colors duration-300 pointer-events-none"
                 strokeWidth={1.75}
               />
            )}
          </motion.div>

          {/* Amber ambient glow */}
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ boxShadow: "0 0 0px 0px rgba(180,83,9,0)" }}
            animate={showHint ? { 
              boxShadow: ["0 0 0px 0px rgba(180,83,9,0)", "0 0 24px 4px rgba(180,83,9,0.25)", "0 0 0px 0px rgba(180,83,9,0)"] 
            } : { boxShadow: "0 0 0px 0px rgba(180,83,9,0)" }}
            whileHover={{ boxShadow: "0 0 28px 8px rgba(180,83,9,0.35)" }}
            transition={showHint ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.6 }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full transition-all duration-400 pointer-events-none border border-[#B45309]/40 group-hover:border-[#B45309]/70"
          />
        </motion.button>
      </motion.div>

      {/* Filmstrip flash */}
      <AnimatePresence>
        {flashVisible && (
          <motion.div
            aria-hidden
            className="fixed inset-0 z-[210] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.6,
              ease: "linear",
              times: [0, 0.18, 0.62, 1],
            }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            style={{
              background: "radial-gradient(ellipse 90% 35% at 50% 50%, rgba(180,83,9,0.18) 0%, transparent 70%)",
            }}
          >
            <motion.div
              className="absolute left-0 right-0"
              style={{
                top: "50%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(180,83,9,0.9) 20%, #fff3e0 50%, rgba(180,83,9,0.9) 80%, transparent)",
                boxShadow: "0 0 100px 32px rgba(180,83,9,0.85)",
                filter: "brightness(1.6)",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 1, 1],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.6,
                ease: [0.23, 1, 0.32, 1],
                times: [0, 0.18, 0.62, 1],
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <RecommendationModal
        isOpen={isModalOpen}
        onClose={closeRecommendation}
        startIndex={recStartIndex}
      />

      <CreateRecommendationModal
        isOpen={isCreateRecOpen}
        onClose={() => setIsCreateRecOpen(false)}
      />

      <CollectionEntryModal 
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
      />
    </>
  );
}
