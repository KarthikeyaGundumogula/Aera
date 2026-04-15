import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useState } from "react";
import { Info, Eye, EyeOff, LayoutPanelLeft } from "lucide-react";

import { TheatreItem } from "../../types";
import { PosterWork, ScriptWork, getWorkKind } from "./work";

interface WorkModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

function PosterModalCard({
  item,
  onClose,
}: {
  item: TheatreItem;
  onClose: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClutterFree, setIsClutterFree] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState(item.aspectRatio || 2 / 3);

  // Function to snap container to exact image dimensions when it loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setNaturalAspect(naturalWidth / naturalHeight);
    }
  };

  // Sizing logic: We stay within 75vh height and 92vw width, 
  // but snap the other dimension to the exact aspect ratio.
  const containerStyle = {
    maxWidth: "92vw",
    maxHeight: "75vh",
    // Calculate width based on which constraint is tighter
    width: naturalAspect > (92 / 75) // if image is wider than viewport ratio
      ? "92vw" 
      : `calc(75vh * ${naturalAspect})`,
    aspectRatio: `${naturalAspect}`,
  };

  return (
    <div className="relative group/modal-item flex flex-col items-center justify-center min-h-screen w-full gap-4 sm:gap-8">
      {/* Immersive Poster Card with Flip Logic */}
      <div 
        className="relative perspective-1000 shrink-0"
        style={containerStyle}
      >
        <motion.div
           animate={{ rotateY: isFlipped ? 180 : 0 }}
           transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
           className="w-full h-full relative preserve-3d"
        >
          {/* Front Side: Immersive Poster */}
          <div className="absolute inset-0 backface-hidden rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-transparent">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover" // object-cover is safe now because container is snapped to naturalAspect
              onLoad={handleImageLoad}
            />
            
            {/* Clutter Overlay - Only visible if not clutter-free */}
            <AnimatePresence>
              {!isClutterFree && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-end justify-between">
                    <div className="space-y-0.5 sm:space-y-1">
                       <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 leading-none">Artist</p>
                       <p className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
                         {item.artist || item.origins || "Anonymous Artist"}
                       </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Back Side: Details (Flipped) */}
          <div 
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-[#0D0D0D] p-5 sm:p-8 flex flex-col justify-center"
          >
             {/* Backdrop subtle art */}
             <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <img src={item.image} className="w-full h-full object-cover blur-2xl scale-150" />
             </div>

             <div className="relative z-10 space-y-4 sm:space-y-8">
                <div>
                   <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 sm:mb-3">
                      Poster Info
                   </span>
                   <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                      {item.title || "Untitled Fragment"}
                   </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                   <div>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2">Artist</p>
                      <p className="text-xs sm:text-sm font-bold text-[#EAEAEA] truncate">{item.artist || item.origins || "Unknown"}</p>
                   </div>
                   <div>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2">Origins</p>
                      <p className="text-xs sm:text-sm font-bold text-[#EAEAEA] truncate">{item.origins || "Independent"}</p>
                   </div>
                   <div>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2">Credits</p>
                      <p className="text-xs sm:text-sm font-bold text-yellow-500 font-mono">{item.credits || 0}</p>
                   </div>
                   <div>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2">Format</p>
                      <p className="text-xs sm:text-sm font-bold text-[#EAEAEA]">Poster / Fragment</p>
                   </div>
                </div>

                {item.description && (
                   <div>
                      <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2">Description</p>
                      <p className="text-[10px] sm:text-xs text-white/60 leading-relaxed font-medium line-clamp-3 sm:line-clamp-4 italic">
                         "{item.description}"
                      </p>
                   </div>
                )}
             </div>
          </div>
        </motion.div>
      </div>

      {/* Title & Static Metadata (Placed below to not interfere) */}
      <AnimatePresence>
        {!isClutterFree && !isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-1"
          >
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-white/90 drop-shadow-lg text-center px-4">
              {item.title}
            </h3>
            <div className="h-[1px] w-4 sm:w-6 bg-white/20 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons - Unified Centered Bar below poster */}
      <div className="flex items-center justify-center gap-6 z-[130] mt-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsClutterFree(!isClutterFree); }}
            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl ${isClutterFree ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 backdrop-blur-xl'}`}
            title="Toggle Clutter"
          >
            {isClutterFree ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}
            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl ${isFlipped ? 'bg-yellow-400 text-black border-yellow-400 rotate-180' : 'bg-white/10 text-white border-white/20 backdrop-blur-xl'}`}
            title="Show Info"
          >
            <Info size={20} strokeWidth={2.5} />
          </button>
      </div>
    </div>
  );
}

function ScriptModalCard({
  item,
  onClose,
}: {
  item: TheatreItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      key="script-modal-card"
      initial={{ y: 24, scale: 0.96 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ y: 24, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#d7ccb8]/25 bg-[#11100d] shadow-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,232,204,0.16),transparent_32%),linear-gradient(135deg,rgba(244,241,234,0.05),transparent_42%)] pointer-events-none" />

      <div className="hidden w-32 shrink-0 border-r border-[#d7ccb8]/15 bg-[#161410] sm:flex sm:flex-col sm:justify-between">
        <div className="px-5 pt-6">
          <div className="mb-5 h-px w-10 bg-[#d7ccb8]/30" />
          <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#c7bda9]/55">
            Script
          </p>
        </div>
        <div className="px-5 pb-6">
          <div
            className="origin-bottom-left -rotate-90 whitespace-nowrap text-[42px] font-bold uppercase leading-none"
            style={{
              fontFamily: "'Londrina Outline', sans-serif",
              color: "rgba(215,204,184,0.34)",
            }}
          >
            {item.title || "FRAMEHOUSE"}
          </div>
        </div>
      </div>

      <div className="relative flex min-h-[560px] flex-1 flex-col bg-[#f4f1ea]">
        <div className="flex items-center justify-between border-b border-black/8 px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.34em] text-black/35">
              Script Archive
            </p>
            <h3 className="truncate text-sm font-bold uppercase tracking-tight text-[#1f1d19] sm:text-base">
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black/65 transition-all hover:bg-black hover:text-white active:scale-95"
            aria-label="Close script modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl rounded-[22px] border border-black/10 bg-[#f4f1ea] shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
            <ScriptWork item={item} variant="feed" priority="eager" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/8 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3 text-[#1f1d19]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5">
              <LayoutPanelLeft className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-black/35">
                Credits
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
                {item.credits || 0}
              </p>
            </div>
          </div>

          <p className="max-w-[45%] text-right text-[9px] font-bold uppercase tracking-[0.22em] text-black/35">
            {item.origins || "FrameHouse Script Archive"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

export const WorkModal = memo(function WorkModal({
  item,
  onClose,
}: WorkModalProps) {
  useEffect(() => {
    if (!item) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  const kind = item ? getWorkKind(item) : null;

  return (
    <AnimatePresence>
      {item && kind !== "edit" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black/90 p-4 backdrop-blur-xl sm:p-8"
          onClick={onClose}
        >
          {/* Subtle noise/texture overlay for cinematic feel */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%),radial-gradient(circle_at_bottom,rgba(202,168,121,0.05),transparent_40%)]" />

          {kind === "poster" ? (
            <PosterModalCard item={item} onClose={onClose} />
          ) : (
            <ScriptModalCard item={item} onClose={onClose} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
