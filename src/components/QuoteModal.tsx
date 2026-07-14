import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Pin, Star, Bookmark } from "lucide-react";
import { TheatreItem } from "../types";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TheatreItem;
  renderTop?: React.ReactNode;
}

const AMBER_GLOW = "rgba(217,119,6,0.30)";

export function QuoteModal({ isOpen, onClose, item, renderTop }: QuoteModalProps) {
  const [quoteText, setQuoteText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [peakFlash, setPeakFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuoteText("");
      setSubmitted(false);
      setPeakFlash(false);
    }
  }, [isOpen]);

  // iOS scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const saved = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${saved}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, saved);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const canSubmit = quoteText.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setPeakFlash(true);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="quote-modal-backdrop"
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "linear" }}
            onClick={onClose}
            aria-hidden
          />

          {/* Peak flash on submit */}
          <AnimatePresence>
            {peakFlash && (
              <motion.div
                key="peak-flash"
                className="fixed inset-0 z-[220] pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.15, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "linear" }}
                style={{
                  background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${AMBER_GLOW}, transparent 70%)`,
                }}
                aria-hidden
              />
            )}
          </AnimatePresence>

          {/* Modal wrapper */}
          <motion.div
            key="quote-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quote Work"
            className="fixed inset-0 z-[210] flex items-center justify-center px-4 md:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* External Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 z-50 p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              className="relative w-full max-w-[500px] overflow-hidden rounded-2xl bg-[#060504] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderTop ? (
                  <div className="w-full bg-[#0a0a0a] border-b border-white/[0.04]">
                    {renderTop}
                  </div>
                ) : (
                  <>
                    {/* Media Preview (Top) */}
                    <div className="relative w-full aspect-video overflow-hidden bg-[#0a0a0a]">
                      {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title ?? "Quoted work"}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                        {item.category === "Recommendation" ? "Recommendation" : "Work"}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {item.title && (
                    <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-white truncate block drop-shadow-md">
                        {item.title}
                      </span>
                      {item.category === "Recommendation" && (
                        <span className="px-1.5 py-0.5 rounded bg-[#B45309]/20 border border-[#B45309]/30 text-[#B45309] text-[8px] font-black uppercase tracking-widest ml-2">
                          REC
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Creator Banner (Middle) */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-[#0A0A0A]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                      {item.artistAvatar ? (
                        <img src={item.artistAvatar} alt={item.artist || "Artist"} className="w-full h-full object-cover" />
                      ) : (
                        item.artist?.slice(0, 2).toUpperCase() || "UN"
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/90">
                        {item.artist || "Unknown Artist"}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
                        {item.category === "Recommendation" ? "Recommender" : "Original Creator"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mock Action Buttons */}
                  <div className="flex items-center gap-1">
                    {item.category === "Recommendation" ? (
                      <div className="px-2.5 py-1.5 rounded-lg border border-[#B45309]/30 bg-[#B45309]/10 flex items-center gap-1.5 text-[#B45309] pointer-events-none">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Boost</span>
                      </div>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 text-white/40 pointer-events-none">
                        <Star size={12} />
                        <span className="text-[9px] font-bold">Star</span>
                      </div>
                    )}
                    <div className="px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center justify-center text-white/40 pointer-events-none">
                      <Bookmark size={12} />
                    </div>
                    <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/80 font-bold text-[9px] tracking-widest uppercase pointer-events-none">
                      View
                    </div>
                  </div>
                </div>
                </>
                )}

                {/* Quote Input (Bottom) */}
                <div className="p-5 pb-6">
                  <div className="flex">
                    {/* Orange Vertical Bar */}
                    <div className="w-[3px] bg-[#B45309] rounded-full shrink-0 mr-4" />
                    
                    <div className="flex flex-col flex-1 gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">
                        Quoted by You
                      </span>
                      
                      <textarea
                        autoFocus
                        placeholder="Add a thought..."
                        value={quoteText}
                        onChange={(e) => setQuoteText(e.target.value)}
                        className="w-full min-h-[80px] bg-transparent text-[15px] italic text-white/90 placeholder:text-white/20 resize-none focus:outline-none leading-relaxed"
                      />
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-mono text-white/20">
                          {quoteText.length} / 280
                        </span>
                        
                        <button
                          onClick={handleSubmit}
                          disabled={!canSubmit || submitted}
                          className={`
                            relative overflow-hidden flex items-center gap-2 h-9 px-5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all duration-300
                            ${
                              canSubmit && !submitted
                                ? "bg-[#B45309] text-white shadow-[0_0_20px_rgba(180,83,9,0.3)] hover:scale-[1.02] active:scale-95"
                                : "bg-white/5 text-white/30 cursor-not-allowed"
                            }
                          `}
                        >
                          <AnimatePresence mode="wait">
                            {submitted ? (
                              <motion.span
                                key="submitted"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2"
                              >
                                Quoted
                              </motion.span>
                            ) : (
                              <motion.span
                                key="default"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex items-center gap-2"
                              >
                                Post
                                <Send className="w-3 h-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
