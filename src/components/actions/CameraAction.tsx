import React, { useState, useRef, useEffect } from "react";
import { Camera, Frame, Edit3 } from "lucide-react";
import { ActionProps, getActionClasses } from "./utils";
import { AnimatePresence, motion } from "motion/react";

interface CameraActionProps extends Omit<ActionProps, 'onClick'> {
  onPin: () => void;
  onQuote: () => void;
  isPinned?: boolean;
  iconOnly?: boolean;
}

export const CameraAction: React.FC<CameraActionProps> = ({ 
  isActive, 
  onPin,
  onQuote,
  isPinned,
  count, 
  variant = "exhibition", 
  iconOnly = false,
  className = "" 
}) => {
  const isFeed = variant === "feed";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const idleClasses = isFeed
    ? "text-white/30 hover:text-white/90 hover:bg-white/[0.06]"
    : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10";
    
  const activeClasses = isFeed 
    ? "bg-[#B45309]/10 text-[#B45309] shadow-[0_0_14px_rgba(180,83,9,0.16)]"
    : "border-[#B45309]/30 bg-[#B45309]/10 text-[#B45309]";

  const classes = getActionClasses(variant, isActive, activeClasses, idleClasses, className);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onPin();
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onQuote();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button onPointerDown={(e) => e.stopPropagation()} onClick={handleToggle} className={classes} aria-label="Share Options">
        <Camera
          className={`${isFeed ? "w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" : "w-[13px] h-[13px] shrink-0"} ${isActive ? (isFeed ? "[&>circle]:fill-[#0d0d0d]" : "[&>circle]:fill-[#070706]") : ""}`}
          fill={isActive ? "currentColor" : "none"}
        />
        {!iconOnly && (isFeed ? (
          <span className="hidden sm:inline">{isActive ? "Pinned" : "Pin"}</span>
        ) : (
          <span className="text-[11px] font-bold">
            {count ?? (isActive ? "Pinned" : "Pin")}
          </span>
        ))}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 w-32 rounded-xl bg-[#111111] border border-white/10 shadow-2xl overflow-hidden z-50 flex flex-col py-1"
          >
            <button
              onClick={handlePin}
              className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Frame size={14} className={isPinned ? "text-[#B45309]" : ""} fill={isPinned ? "currentColor" : "none"} />
              Frame
            </button>
            <button
              onClick={handleQuote}
              className="flex items-center gap-3 w-full px-3 py-2 text-left text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Edit3 size={14} />
              Quote
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
