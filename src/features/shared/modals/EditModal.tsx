import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState, useRef } from "react";
import { Info, Eye, EyeOff, RotateCw, ArrowUpRight } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { Logo } from "../../../components/Logo";
import { ModalWrapper } from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { ORIGINALS_DATA, ARTISTS_MOCK } from "../../../mock";
import { ArtistProfile } from "../profile";

interface EditModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

export function EditModal({ item, onClose }: EditModalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  // Reset states when item changes
  useEffect(() => {
    if (item) {
      setIsLoaded(false); 
      setIsFlipped(false);
    }
  }, [item]);

  // YouTube Pause Logic
  useEffect(() => {
    if (isFlipped && item?.platform === 'youtube' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*"
      );
    }
  }, [isFlipped, item]);

  // Twitter Script Hydration
  useEffect(() => {
    if (!item || item.platform !== 'twitter' || isFlipped) return;

    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout;

    // Safety fallback: if Twitter takes too long, just show the content
    fallbackTimeout = setTimeout(() => {
      if (isMounted && !isLoaded) {
        setIsLoaded(true);
      }
    }, 3500);

    const loadTwitter = () => {
      if (!isMounted) return;
      
      const twttr = (window as any).twttr;
      
      if (twttr?.widgets) {
        twttr.widgets.load().then(() => {
          if (isMounted) setIsLoaded(true);
        }).catch(() => {
          if (isMounted) setIsLoaded(true);
        });
      } else if (isMounted) {
        // If twttr is defined but not ready, check again in a moment
        setTimeout(loadTwitter, 100);
      }
    };

    const existingScript = document.querySelector('script[src*="platform.twitter.com/widgets.js"]');
    
    if (!(window as any).twttr && !existingScript) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = loadTwitter;
      document.body.appendChild(script);
    } else {
      loadTwitter();
    }

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [item, isFlipped]); // Re-run hydration when flipping back

  if (!item) return null;

  const maxWidthClass = item.platform === 'youtube' ? 'max-w-[1000px]' : 'max-w-[640px]';
  const youtubeUrl = item.platform === 'youtube' 
    ? `${item.embedUrl}${item.embedUrl.includes('?') ? '&' : '?'}enablejsapi=1` 
    : '';

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      <div 
        className={`relative w-full ${maxWidthClass} min-w-[300px] h-fit perspective-2000`}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full h-auto preserve-3d"
        >
          {/* FRONT SIDE (The Player) */}
          <div className="relative w-full h-auto bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col backface-hidden">
            {!isLoaded && (
              <div className="absolute inset-x-0 bottom-0 top-[72px] z-50 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-3xl">
                <div className="relative">
                  <Logo showText={false} className="scale-[1.5]" />
                  <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute -inset-4 border-t-2 border-white/20 rounded-full"
                  />
                </div>
                <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 animate-pulse">
                  Curating Archive
                </p>
              </div>
            )}

            <div className="h-[72px] shrink-0" />

            <div className="w-full flex flex-col items-center pb-6 px-4">
              {item.platform === 'youtube' ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                  <iframe
                    ref={iframeRef}
                    id={`yt-player-${item.id}`}
                    src={youtubeUrl}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={item.title}
                    onLoad={() => setIsLoaded(true)}
                  />
                </div>
              ) : (
                <div className="w-full flex justify-center min-h-[200px]">
                   {/* Twitter Smart Reset: Only render when not flipped to ensure silence on backside */}
                   {!isFlipped && (
                     <div key={`${item.id}-twitter`} className="w-full max-w-[560px] flex justify-center">
                       <blockquote className="twitter-tweet" data-theme="dark" data-media-max-width="560">
                         <a href={item.embedUrl}></a>
                       </blockquote>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Trigger Pill (FRONT) */}
            <div 
              onClick={() => setIsFlipped(true)}
              className="absolute top-3.5 left-3.5 flex flex-col cursor-pointer pointer-events-auto group gap-0.5 px-3 py-2 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md max-w-[280px] z-[60] transition-transform hover:scale-105 active:scale-95"
            >
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 truncate group-hover:text-white/70">
                 {item.artist || "Aera Artist"}
               </span>
               <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-medium text-white tracking-tight truncate">
                    {item.title || "Untitled Edit"}
                  </h3>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-yellow-400 transition-colors" />
               </div>
            </div>
          </div>

          {/* BACK SIDE (The Archive Details) */}
          <div 
            onClick={() => setIsFlipped(false)}
            className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-white/10 p-5 sm:p-8 flex flex-col justify-center cursor-pointer group/back overflow-y-auto no-scrollbar scroll-smooth"
          >
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <img src={item.image} className="w-full h-full object-cover blur-3xl scale-125" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
              </div>

              <div className="relative z-10 space-y-6 sm:space-y-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Work Archive</span>
                    <h2 
                      className="font-black uppercase tracking-tighter text-white leading-[0.85]"
                      style={{
                        fontSize: !item.title.includes(" ") 
                          ? `clamp(1.5rem, ${Math.min(8, 60 / (item.title.length * 0.8))}vw, 2.5rem)`
                          : `clamp(1.5rem, ${Math.max(3, 10 - item.title.length * 0.2)}vw, 3.2rem)`,
                      }}
                    >
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex-1" />
                  <div 
                    onClick={() => setIsFlipped(false)}
                    className="cursor-pointer pointer-events-auto p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 hover:rotate-180 transition-all duration-500 active:scale-90 shrink-0"
                  >
                     <RotateCw size={14} className="text-white/60" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-6 sm:gap-y-8 pb-4">
                  <div 
                    className="space-y-1 sm:space-y-1.5 cursor-pointer group/artist"
                    onClick={(e) => {
                      e.stopPropagation();
                      const artistData = ARTISTS_MOCK.find(a => a.name === item.artist);
                      setSelectedArtist(artistData || {
                        id: String(item.id),
                        name: item.artist || "Anonymous",
                        avatar: item.artistAvatar,
                        presence: item.presence || 0,
                        role: "Collective Artist",
                        image: item.artistAvatar || item.image // Fallback img
                      });
                    }}
                  >
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 group-hover/artist:text-white/40 transition-colors">Artist</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-bold text-white/90 truncate group-hover/artist:text-yellow-400 transition-colors underline decoration-white/0 group-hover/artist:decoration-yellow-400/30 underline-offset-4">
                        {item.artist || "Aera Collective"}
                      </p>
                      <ArrowUpRight size={10} className="text-white/10 group-hover/artist:text-yellow-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Credits</p>
                    <p className="text-xs sm:text-sm font-bold text-yellow-500 font-mono tracking-tighter">{item.credits || 0}</p>
                  </div>
                  <div 
                    className="space-y-1.5 cursor-pointer group/orig"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.originalId) {
                        onClose();
                        navigate(`/originals/${item.originalId}`);
                      }
                    }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 group-hover/orig:text-white/40 transition-colors">Original</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white/90 uppercase tracking-widest group-hover/orig:text-yellow-400 transition-colors truncate">
                        {item.origins || "Archive"}
                      </p>
                      <ArrowUpRight size={10} className="text-white/10 group-hover/orig:text-yellow-400/50 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Format</p>
                    <p className="text-sm font-bold text-white/90">Fragment // Edit</p>
                  </div>
                </div>

                {item.description && (
                  <div className="space-y-2 border-t border-white/5 pt-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Description</p>
                    <p className="text-xs text-white/50 leading-relaxed italic font-medium max-w-md line-clamp-3 sm:line-clamp-none">
                      "{item.description}"
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute bottom-6 left-8 flex items-center gap-3 opacity-20">
                 <div className="h-px w-8 bg-white" />
                 <span className="text-[8px] font-black uppercase tracking-[0.5em]">FrameHouse Collection</span>
              </div>
          </div>
        </motion.div>
      </div>
      
      {/* Artist Profile Integration */}
      <ArtistProfile 
        artist={selectedArtist} 
        onClose={() => setSelectedArtist(null)} 
      />
    </ModalWrapper>
  );
}
