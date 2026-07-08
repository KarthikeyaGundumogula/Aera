import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send } from "lucide-react";

interface PostLineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AMBER_GLOW = "rgba(217,119,6,0.30)";

export function PostLineModal({ isOpen, onClose }: PostLineModalProps) {
  const [lineText, setLineText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [peakFlash, setPeakFlash] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLineText("");
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

  const canSubmit = lineText.trim().length > 0;

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
            key="post-line-backdrop"
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
            key="post-line-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Post a Line"
            className="fixed inset-0 z-[210] flex items-center justify-center px-4"
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
              className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-[#060504] border border-white/[0.06] shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 10, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="p-6 sm:p-8 flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B45309]">
                    Publish to Wall
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white/90">
                    Post a Line
                  </h2>
                </div>

                <div className="flex flex-col gap-2">
                  <textarea
                    autoFocus
                    placeholder="What's on your mind? Drop a line..."
                    value={lineText}
                    onChange={(e) => setLineText(e.target.value)}
                    className="w-full h-32 bg-white/[0.02] border border-white/10 rounded-xl p-4 text-[15px] sm:text-[16px] text-white/90 placeholder:text-white/20 resize-none focus:outline-none focus:border-[#B45309]/50 transition-colors leading-relaxed"
                  />
                  <div className="flex justify-end pr-1 text-[11px] font-mono text-white/20">
                    {lineText.length} / 280
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitted}
                    className={`
                      relative overflow-hidden flex items-center gap-2 h-11 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300
                      ${
                        canSubmit && !submitted
                          ? "bg-[#B45309] text-white shadow-[0_0_24px_rgba(180,83,9,0.3)] hover:shadow-[0_0_32px_rgba(180,83,9,0.5)] hover:scale-[1.02] active:scale-95"
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
                          Posted
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-2"
                        >
                          Post Line
                          <Send className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
