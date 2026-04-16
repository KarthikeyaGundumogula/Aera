import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, ReactNode } from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string; // Additional classes for the backdrop
}

export function ModalWrapper({ 
  isOpen, 
  onClose, 
  children, 
  className = "" 
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-black/90 p-4 backdrop-blur-xl sm:p-8 ${className}`}
          onClick={onClose}
        >
          {/* Cinematic Noise Texture Layer */}
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          {/* Subtle Ambient Glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_bottom,rgba(202,168,121,0.05),transparent_40%)]" />

          {/* Modal Content - Zenters content and provides full-width canvas for expansion */}
          <div className="relative z-10 w-full flex justify-center p-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
