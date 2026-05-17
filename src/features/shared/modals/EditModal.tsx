import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState, useRef } from "react";
import { RotateCw, ArrowUpRight, X, Layers, Bookmark, Heart, Share2 } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { Logo } from "../../../components/Logo";
import { FHLoader } from "../../../components/FHLoader";
import { ModalWrapper } from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { ARTISTS_MOCK } from "../../../mock";
import { ArtistProfile } from "../profile";
import { buildEmbedUrl } from "../../../utils/embed";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { CurateOverlay } from "./CurateOverlay";
import { AdaptiveTitle } from "../../../components/AdaptiveTitle";
import { WorkActionBar } from "./WorkActionBar";
import { CinematicToast } from "./CinematicToast";

interface EditModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

// Extend window for Twitter widgets
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

export function EditModal({ item, onClose }: EditModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCurate, setShowCurate] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(
    null,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { containerRef: twitterContainerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    item?.platform === "twitter" ? item.srcId : undefined,
    isFlipped
  );
  
  const [isYoutubeLoaded, setIsYoutubeLoaded] = useState(false);
  const navigate = useNavigate();

  // Reset states when item changes
  useEffect(() => {
    if (item) {
      setIsYoutubeLoaded(false);
      setIsFlipped(false);
    }
  }, [item?.id]);

  // YouTube: pause video when flipping to back
  useEffect(() => {
    if (isFlipped && item?.platform === "youtube" && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*",
      );
    }
  }, [isFlipped, item?.platform]);



  if (!item) return null;

  const isYoutube = item.platform === "youtube";
  const isLoaded = isYoutube ? isYoutubeLoaded : isTwitterLoaded;
  const maxWidthClass = isYoutube ? "max-w-[1000px]" : "max-w-[560px]";

  // Build the YouTube embed URL from srcId (includes enablejsapi)
  const youtubeEmbedUrl =
    isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose} isImmersive>
      <div
        className={`relative w-full ${maxWidthClass} min-w-[300px] h-fit perspective-2000`}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full h-auto preserve-3d"
        >
          {/* ── FRONT SIDE (The Player) ─────────────────────────────────── */}
          <div className="relative w-full h-auto bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col backface-hidden">
            {!isLoaded && (
              <div className="absolute inset-x-0 bottom-0 top-[72px] z-50 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-3xl">
                <FHLoader label="Curating Archive" />
              </div>
            )}

            <div className="h-[72px] shrink-0" />

            <div className="w-full flex flex-col items-center pb-6 sm:px-4 px-0">
              {isYoutube ? (
                <div className="w-full aspect-video sm:rounded-lg rounded-none overflow-hidden border border-white/5 shadow-2xl">
                  <iframe
                    ref={iframeRef}
                    id={`yt-player-${item.id}`}
                    src={youtubeEmbedUrl}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={item.title}
                    onLoad={() => setIsYoutubeLoaded(true)}
                  />
                </div>
              ) : (
                <div className="w-full flex justify-center min-h-[250px] py-2">
                  {!isFlipped && (
                    <div
                      ref={twitterContainerRef}
                      className="w-full max-w-[560px] flex justify-center"
                    />
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
                {item.artist || "Artist"}
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-medium text-white tracking-tight truncate">
                  {item.title || "Untitled Edit"}
                </h3>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-white/60"
                />
              </div>
            </div>

            {/* Action Bar (FRONT Top Right) */}
            <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-[60]">
              <WorkActionBar
                isLiked={isLiked}
                setIsLiked={setIsLiked}
                setToastMessage={setToastMessage}
                workId={item.id}
                variant="edit"
              />

              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/50 backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-95 shadow-xl"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── BACK SIDE (The Archive Details) ─────────────────────────── */}
          <div
            onClick={() => setIsFlipped(false)}
            className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-white/10 p-5 sm:p-8 flex flex-col justify-start cursor-pointer group/back"
          >


            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <img loading="lazy"
                src={item.image}
                className="w-full h-full object-cover blur-3xl scale-125"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 space-y-4 sm:space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                    Work Archive
                  </span>
                  <AdaptiveTitle
                    title={item.title || "Untitled Edit"}
                    multiWordClass="text-2xl sm:text-[2rem]"
                    singleWordClamp="clamp(1.5rem, 8vw, 2.5rem)"
                    className="leading-[0.85]"
                  />
                </div>
                <div className="flex-1" />
                <div
                  onClick={() => setIsFlipped(false)}
                  className="cursor-pointer pointer-events-auto p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md hover:bg-white/10 hover:rotate-180 transition-all duration-500 active:scale-90 shrink-0"
                >
                  <RotateCw size={14} className="text-white/60" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-5 pb-2">
                {/* Artist */}
                <div
                  className="space-y-1 sm:space-y-1.5 cursor-pointer group/artist"
                  onClick={(e) => {
                    e.stopPropagation();
                    const artistData = ARTISTS_MOCK.find(
                      (a) => a.name === item.artist,
                    );
                    setSelectedArtist(
                      artistData || {
                        id: String(item.id),
                        name: item.artist || "Anonymous",
                        presence: 0,
                        works: 0,
                        image: item.artistAvatar || item.image || "",
                      },
                    );
                  }}
                >
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 group-hover/artist:text-white/40 transition-colors">
                    Artist
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-bold text-white/90 truncate group-hover/artist:text-white transition-colors underline decoration-white/0 group-hover/artist:decoration-white/30 underline-offset-4">
                      {item.artist || "Collective"}
                    </p>
                    <ArrowUpRight
                      size={10}
                      className="text-white/10 group-hover/artist:text-white/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Credits */}
                <div className="space-y-1 sm:space-y-1.5">
                  <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                    Credits
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-yellow-500 font-mono tracking-tighter">
                    {item.credits || 0}
                  </p>
                </div>

                {/* Format */}
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">
                    Format
                  </p>
                  <p className="text-sm font-bold text-white/90">
                    Fragment // Edit
                  </p>
                </div>
              </div>

              <div 
                className="pt-2 relative z-50 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCurate(true);
                }}
              >
                <div
                  className="w-full cursor-pointer pointer-events-auto group flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300 rounded-xl"
                >
                  <Layers size={14} className="group-hover:fill-current pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] pointer-events-none">Originals</span>
                </div>
              </div>


            </div>


          </div>
        </motion.div>
      </div>

      {/* Artist Profile Integration */}
      <ArtistProfile
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />

      <CurateOverlay
        isOpen={showCurate}
        onClose={() => setShowCurate(false)}
        originalIds={item.originalIds || []}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Visual Hit Toast */}
      <CinematicToast message={toastMessage} />

    </ModalWrapper>
  );
}
