import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TheatreItem } from "../../../types";
import { ExhibitionFrame, MediaSlotContext } from "./ExhibitionFrame";
import { Star } from "lucide-react";

interface PosterExhibitionProps {
  item: TheatreItem;
}

/**
 * PosterExhibition — wraps ExhibitionFrame with a full-size poster image as
 * the media slot. Double-tap fires the honour flash via ExhibitionFrame.
 */
export function PosterExhibition({ item }: PosterExhibitionProps) {
  const imageSrc = item.image ?? (item.images?.[0] || "");
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      {/* Subtle ambient bleed — very low opacity so the poster stays the star */}
      {imageSrc && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={imageSrc}
            alt=""
            aria-hidden
            className="w-full h-full object-cover scale-110 blur-[100px] opacity-[0.07] saturate-50"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[#070706]/60" />
        </div>
      )}

      <ExhibitionFrame
        item={item}
        mediaMaxWidth="min(680px,calc(100vw-2rem))"
        mediaSlot={({ doubleTapFlash, triggerDoubleTap }: MediaSlotContext) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center w-full"
            onPointerDown={triggerDoubleTap}
            style={{ touchAction: "manipulation" }}
          >
            {imageSrc ? (
              <div className="relative inline-block max-w-full">
                <img
                  src={imageSrc}
                  alt={item.title || "Poster"}
                  className="w-auto h-auto max-w-full max-h-[75vh] object-contain rounded-none select-none border-[1.5px] border-white/20 shadow-[0_8px_48px_rgba(0,0,0,0.6)]"
                  loading="eager"
                  style={{ backfaceVisibility: "hidden" }}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                  onLoad={() => setImgLoaded(true)}
                />

                {/* Double-tap honour flash */}
                <AnimatePresence>
                  {doubleTapFlash && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                      animate={{ opacity: 1, scale: 1.1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 1.4, filter: "blur(10px)" }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id="gold-metal-flash" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFF7D6" />
                            <stop offset="25%" stopColor="#FDE047" />
                            <stop offset="50%" stopColor="#D97706" />
                            <stop offset="75%" stopColor="#FBBF24" />
                            <stop offset="100%" stopColor="#FFF7D6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <Star 
                        size={80} 
                        strokeWidth={1} 
                        stroke="url(#gold-metal-flash)"
                        fill="url(#gold-metal-flash)"
                        className="drop-shadow-[0_0_32px_rgba(255,215,0,0.4)] opacity-90" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="w-full aspect-[2/3] bg-white/[0.02] flex items-center justify-center border-[1.5px] border-white/20 rounded-none max-w-[300px]">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center px-4">
                  No Image
                </div>
              </div>
            )}
          </motion.div>
        )}
      />
    </>
  );
}
