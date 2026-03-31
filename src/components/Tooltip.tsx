import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return '-top-8 left-1/2 -translate-x-1/2 -translate-y-2';
      case 'bottom':
        return '-bottom-8 left-1/2 -translate-x-1/2 translate-y-2';
      case 'left':
        return 'top-1/2 -left-2 -translate-x-full -translate-y-1/2';
      case 'right':
        return 'top-1/2 -right-2 translate-x-full -translate-y-1/2';
      default:
        return '-top-8 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[110] px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest text-white whitespace-nowrap pointer-events-none shadow-2xl ${getPositionClasses()}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
