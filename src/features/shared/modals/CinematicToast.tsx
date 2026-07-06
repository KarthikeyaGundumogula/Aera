import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

interface CinematicToastProps {
  message: string | null;
}

export const CinematicToast: React.FC<CinematicToastProps> = ({ message }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none px-5 py-3 border border-white/20 bg-black/30 backdrop-blur-md rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.25em] pt-0.5 select-none text-white text-center">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
