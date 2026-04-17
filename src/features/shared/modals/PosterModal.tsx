import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { Info, Eye, EyeOff, RotateCw, ArrowUpRight } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";

interface PosterModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

export function PosterModal({ item, onClose }: PosterModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClutterFree, setIsClutterFree] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [naturalAspect, setNaturalAspect] = useState(item?.aspectRatio || 2 / 3);
  const navigate = useNavigate();

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setNaturalAspect(naturalWidth / naturalHeight);
    }
  };

  if (!item) return null;

  const containerStyle = {
    width: `min(92vw, calc(75vh * ${naturalAspect}))`,
    aspectRatio: `${naturalAspect}`,
    maxHeight: "75vh",
    maxWidth: "92vw",
  };

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      <div className="relative group/modal-item flex flex-col items-center justify-center w-fit max-w-full gap-4 sm:gap-8" onClick={(e) => e.stopPropagation()}>
        <div 
          className="relative perspective-1000 shrink-0 min-w-[300px]"
          style={containerStyle}
        >
          <motion.div
             animate={{ rotateY: isFlipped ? 180 : 0 }}
             transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
             className="w-full h-full relative preserve-3d"
          >
            {/* Front Side: Immersive Poster */}
            <div className="absolute inset-0 backface-hidden rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0a0a]">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-contain" 
                onLoad={handleImageLoad}
              />
              
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
              onClick={() => setIsFlipped(false)}
              className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-white/5 bg-[#0D0D0D] p-5 sm:p-8 flex flex-col justify-center cursor-pointer group/back"
            >
               <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover blur-2xl scale-150" alt="" />
               </div>

               <div className="relative z-10 space-y-4 sm:space-y-8">
                  <div>
                     <span className="inline-block px-1.5 py-0.5 rounded-[4px] bg-white/5 border border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mb-2 sm:mb-3">
                        Poster Info
                     </span>
                     <div className="flex justify-between items-start">
                        <h2 
                          className="font-black text-white uppercase tracking-tighter leading-[0.85] mb-2"
                          style={{
                            fontSize: !item.title.includes(" ") 
                              ? `clamp(1.2rem, ${Math.min(6, 50 / (item.title.length * 0.8))}vw, 2rem)`
                              : `clamp(1.2rem, ${Math.max(2.5, 8 - item.title.length * 0.2)}vw, 2.5rem)`,
                          }}
                        >
                           {item.title || "Untitled Fragment"}
                        </h2>
                        <div 
                          onClick={() => setIsFlipped(false)}
                          className="cursor-pointer pointer-events-auto p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 hover:rotate-180 transition-all duration-500 active:scale-90 shrink-0"
                        >
                           <RotateCw size={12} className="text-white/40" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-8">
                      <div 
                        className="cursor-pointer group/artist"
                        onClick={(e) => {
                          e.stopPropagation();
                          const artistData = ARTISTS_MOCK.find(a => a.name === item.artist);
                          setSelectedArtist(artistData || {
                            id: String(item.id),
                            name: item.artist || "Anonymous",
                            avatar: item.artistAvatar,
                            presence: item.presence || 0,
                            role: "Collective Artist",
                            image: item.artistAvatar || item.image
                          });
                        }}
                      >
                         <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 group-hover/artist:text-white/50 transition-colors">Artist</p>
                         <div className="flex items-center gap-1.5">
                           <p className="text-xs sm:text-sm font-bold text-[#EAEAEA] truncate group-hover/artist:text-yellow-400 transition-colors underline decoration-white/0 group-hover/artist:decoration-yellow-400/30 underline-offset-4">{item.artist || "Aera Collective"}</p>
                           <ArrowUpRight size={10} className="text-white/10 group-hover/artist:text-yellow-400/50 transition-colors" />
                         </div>
                      </div>
                      <div 
                        className="cursor-pointer group/orig"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.originalId) {
                            onClose();
                            navigate(`/originals/${item.originalId}`);
                          }
                        }}
                      >
                         <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1 sm:mb-2 group-hover/orig:text-white/50 transition-colors">Original</p>
                         <div className="flex items-center gap-1.5">
                           <p className="text-xs sm:text-sm font-bold text-[#EAEAEA] truncate group-hover/orig:text-yellow-400 transition-colors uppercase tracking-widest">{item.origins || "Independent"}</p>
                           <ArrowUpRight size={10} className="text-white/10 group-hover/orig:text-yellow-400/50 transition-colors" />
                         </div>
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

        {/* Title & Metadata (Below Card) */}
        {!isClutterFree && !isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-white/90 drop-shadow-lg text-center px-4">
              {item.title}
            </h3>
            <div className="h-[1px] w-4 sm:w-6 bg-white/20 rounded-full" />
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-6 mt-2">
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
      
      {/* Artist Profile Integration */}
      <ArtistProfile 
        artist={selectedArtist} 
        onClose={() => setSelectedArtist(null)} 
      />
    </ModalWrapper>
  );
}
