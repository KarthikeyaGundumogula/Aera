import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark } from "lucide-react";

interface CinematicToastProps {
  message: string | null;
}

export const CinematicToast: React.FC<CinematicToastProps> = ({ message }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-none ${
            message === "ADDED TO VAULT"
              ? ""
              : "px-6 py-3.5 bg-white/[0.15] border border-white/20 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] gap-3 rounded-full"
          }`}
        >
          {message === "ADDED TO VAULT" ? (
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                rotate: [0, 15, -15, 0],
              }}
              transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center"
            >
              <Heart size={24} className="fill-current text-black" />
            </motion.div>
          ) : (
            <>
              <Bookmark size={14} className="fill-current text-white" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] pt-0.5 select-none text-white">
                {message}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
