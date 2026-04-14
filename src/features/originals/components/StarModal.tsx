import { motion, AnimatePresence } from "motion/react";
import { memo, useEffect } from "react";
import { StarProfileCardProps } from "./StarProfileCard";

interface StarModalProps {
  star: StarProfileCardProps | null;
  onClose: () => void;
}

export const StarModal = memo(({ star, onClose }: StarModalProps) => {
  // Lock body scroll tightly when the modal mounts
  useEffect(() => {
    if (star) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [star]);

  // Extract name parts safely
  const nameParts = star?.actorName ? star.actorName.split(" ") : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <AnimatePresence>
      {star && (
        <motion.div
          key="star-modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8"
          onClick={onClose}
        >
          {/* Central Modal Card - Scaled to max 40% of standard desktop screen */}
          <motion.div
            key="star-modal-card"
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[280px] sm:max-w-[320px] aspect-[2/3] bg-[#0A0A0A] rounded-[20px] overflow-hidden flex shadow-2xl border border-white/10"
          >
            {/* Top Title */}
            <div className="absolute top-6 w-full text-center z-30 pointer-events-none mix-blend-overlay">
              <span className="text-white/100 uppercase tracking-[0.4em] text-[10px] sm:text-xs font-bold">
                Star
              </span>
            </div>

            {/* Absolute Overlapping Name Container (Left Edge) */}
            <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col items-center justify-center z-40 pointer-events-none mix-blend-overlay sm:mix-blend-normal">
              {/* Main Stacked Outline Name */}
              <div className="absolute flex flex-col items-start -rotate-90 whitespace-nowrap origin-center scale-[105%] sm:scale-100">
                <style>
                  {`@import url('https://fonts.googleapis.com/css2?family=Londrina+Outline&display=swap');`}
                </style>
                <div
                  className="uppercase text-[42px] sm:text-[52px] tracking-wide leading-[0.85] drop-shadow-xl font-bold"
                  style={{
                    color: "rgba(255,255,255,0.95)",
                    fontFamily: "'Londrina Outline', sans-serif",
                  }}
                >
                  {firstName}
                </div>
                <div
                  className="uppercase text-[42px] sm:text-[52px] tracking-wide leading-[0.85] drop-shadow-xl font-bold"
                  style={{
                    color: "rgba(255, 255, 255, 0.57)",
                    fontFamily: "'Londrina Outline', sans-serif",
                  }}
                >
                  {lastName}
                </div>
              </div>
            </div>

            {/* Filmstrip (Spans 100% of Modal) */}
            <div className="w-full h-full relative z-10 overflow-hidden bg-[#020202] flex flex-col justify-between py-5 sm:py-6">
              {/* Horizontal Top Perforations */}
              <div className="flex justify-center gap-4 opacity-30 px-4 z-30 relative">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`tp-${i}`}
                    className="w-4 sm:w-5 h-2 rounded-sm bg-black border border-white/10"
                  />
                ))}
              </div>

              {/* Main Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={star.imageUrl}
                  alt={star.actorName}
                  className="w-full h-full object-cover scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
                {/* Subtle edge gradients */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#020202] via-[#020202]/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent pointer-events-none" />
              </div>

              {/* Horizontal Bottom Perforations */}
              <div className="flex justify-center gap-4 opacity-30 px-4 z-30 relative">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`bp-${i}`}
                    className="w-4 sm:w-5 h-2 rounded-sm bg-black border border-white/10"
                  />
                ))}
              </div>
            </div>

            {/* Bottom Footer Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 px-4 sm:px-6 flex items-center justify-between">
              <button className="bg-[#f0f0f0] text-[#111] px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-md">
                Follow +
              </button>

              <span className="text-[#999] font-bold text-[9px] tracking-widest uppercase text-right leading-tight max-w-[50%]">
                {star.characterName}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
