import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string; // Additional classes for the backdrop
  isImmersive?: boolean; // If true, removes padding on mobile for edge-to-edge
}

export function ModalWrapper({ 
  isOpen, 
  onClose, 
  children, 
  className = "",
  isImmersive = false
}: ModalWrapperProps) {
  // Global scroll lock and Escape listener
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-3xl ${isImmersive ? 'p-0 sm:p-8' : 'p-4 sm:p-8'} ${className}`}
          onClick={onClose}
        >
          {/* Cinematic Noise Texture Layer */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.4%22/%3E%3C/svg%3E')]" />
          
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_bottom,rgba(202,168,121,0.05),transparent_40%)]" />
 
          {/* Modal Content - Centers content and provides layout canvas */}
          <div className={`relative z-10 w-full flex justify-center ${isImmersive ? 'p-0 sm:p-2' : 'p-2'}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
