import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Share2, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TheatreItem } from "../../../types";
import { CurateOverlay } from "../../shared/modals/CurateOverlay";
import { CinematicToast } from "../../shared/modals/CinematicToast";

interface ViewerNavProps {
  item: TheatreItem;
}

function copyLink(id: string | number, onDone: () => void) {
  const url = `${window.location.origin}/works/${id}`;
  
  const fallbackCopy = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.cssText = "position:fixed;opacity:0;left:-9999px;top:-9999px;";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onDone();
    } catch (e) {
      console.warn("Fallback copy failed", e);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(onDone).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
}

/**
 * ViewerNav — ultra-minimal floating chrome.
 * Back pill top-left · Share + Originals top-right.
 * No backgrounds on the bar itself — it floats over the atmosphere.
 */
export function ViewerNav({ item }: ViewerNavProps) {
  const navigate = useNavigate();
  const [showCurate, setShowCurate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  return (
    <>
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-4 pt-5 sm:px-7 sm:pt-6 pointer-events-none">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="pointer-events-auto flex items-center gap-1.5 h-8 pl-2 pr-3.5 rounded-xl bg-black/55 backdrop-blur-md border border-white/8 text-white/50 hover:text-white hover:border-white/20 transition-all duration-200 active:scale-[0.95]"
          style={{ touchAction: "manipulation" }}
        >
          <ArrowLeft size={13} strokeWidth={2} />
          <span className="text-[8.5px] font-black uppercase tracking-[0.25em]">Back</span>
        </motion.button>

        {/* Right actions */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="pointer-events-auto flex items-center gap-1.5"
        >
          {(item.originalIds?.length ?? 0) > 0 && (
            <button
              onClick={() => setShowCurate(true)}
              aria-label="Originals"
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-black/55 backdrop-blur-md border border-white/8 text-white/40 hover:text-white hover:border-white/20 transition-all duration-200 active:scale-[0.95]"
              style={{ touchAction: "manipulation" }}
            >
              <Layers size={12} strokeWidth={2} />
              <span className="text-[8.5px] font-black uppercase tracking-[0.22em] hidden sm:inline">Originals</span>
            </button>
          )}
          <button
            onClick={() => copyLink(item.id, () => showToast("LINK COPIED"))}
            aria-label="Share"
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-black/55 backdrop-blur-md border border-white/8 text-white/40 hover:text-white hover:border-white/20 transition-all duration-200 active:scale-[0.95]"
            style={{ touchAction: "manipulation" }}
          >
            <Share2 size={12} strokeWidth={2} />
            <span className="text-[8.5px] font-black uppercase tracking-[0.22em] hidden sm:inline">Share</span>
          </button>
        </motion.div>
      </div>

      {/* CurateOverlay sits as a portal-like absolute layer */}
      {showCurate && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCurate(false)}
        >
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md">
            <CurateOverlay
              isOpen={showCurate}
              onClose={() => setShowCurate(false)}
              originalIds={item.originalIds || []}
              onShowToast={showToast}
            />
          </div>
        </div>
      )}

      <CinematicToast message={toast} />
    </>
  );
}
