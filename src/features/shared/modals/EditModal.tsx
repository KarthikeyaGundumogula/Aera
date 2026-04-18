import { motion } from "motion/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { RotateCw, ArrowUpRight } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { Logo } from "../../../components/Logo";
import { ModalWrapper } from "./ModalWrapper";
import { useNavigate } from "react-router-dom";
import { ARTISTS_MOCK } from "../../../mock";
import { ArtistProfile } from "../profile";
import { buildEmbedUrl } from "../../../utils/embed";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(
    null,
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const twitterContainerRef = useRef<HTMLDivElement>(null);
  // Incremented on every renderTweet call; async callbacks compare against
  // current value before running — discards stale calls from previous renders.
  const renderGenRef = useRef(0);
  const navigate = useNavigate();

  // Reset states when item changes
  useEffect(() => {
    if (item) {
      setIsLoaded(false);
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

  // ─── Twitter: blockquote + scoped widgets.load(el) ───────────────────
  // Matches the reference embed format in mock-embed-codes.md.
  // data-media-max-width="560" + video-only tweets = immersive video display.
  // renderGenRef guards against React re-render races: each call gets a
  // generation number; the async doLoad checks it before touching the DOM.
  const renderTweet = useCallback(() => {
    const container = twitterContainerRef.current;
    if (!container || !item?.srcId) return;

    const generation = ++renderGenRef.current;

    // Write the blockquote HTML — url format twitter.com/{user}/status/{id}
    // is the only pattern widgets.js recognises; username is ignored at lookup.
    container.innerHTML = [
      `<blockquote`,
      `  class="twitter-tweet"`,
      `  data-media-max-width="560"`,
      `  data-conversation="none"`,
      `  data-theme="dark"`,
      `  data-dnt="true"`,
      `>`,
      `  <a href="https://twitter.com/twitter/status/${item.srcId}"></a>`,
      `</blockquote>`,
    ].join(" ");

    const doLoad = () => {
      // If a newer renderTweet call has started, this one is stale — bail
      if (renderGenRef.current !== generation) return;
      if (!window.twttr?.widgets || !twitterContainerRef.current) return;
      window.twttr.widgets.load(twitterContainerRef.current);
      setTimeout(() => {
        if (renderGenRef.current === generation) setIsLoaded(true);
      }, 1000);
    };

    if (window.twttr?.widgets) {
      doLoad();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="platform.twitter.com/widgets.js"]',
      );
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        script.onload = doLoad;
        document.body.appendChild(script);
      } else {
        const poll = setInterval(() => {
          if (window.twttr?.widgets) {
            clearInterval(poll);
            doLoad();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(poll);
          if (renderGenRef.current === generation) setIsLoaded(true);
        }, 5000);
      }
    }
  }, [item?.srcId]);

  useEffect(() => {
    if (!item || item.platform !== "twitter") return;
    const fallback = setTimeout(() => setIsLoaded(true), 5000);
    renderTweet();
    return () => clearTimeout(fallback);
  }, [item?.id, item?.platform, renderTweet, isFlipped]);

  if (!item) return null;

  const isYoutube = item.platform === "youtube";
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
                <div className="relative">
                  <Logo showText={false} className="scale-[1.5]" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
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
              {isYoutube ? (
                <div className="w-full aspect-video rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                  <iframe
                    ref={iframeRef}
                    id={`yt-player-${item.id}`}
                    src={youtubeEmbedUrl}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={item.title}
                    onLoad={() => setIsLoaded(true)}
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
                {item.artist || "Aera Artist"}
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
                  className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* ── BACK SIDE (The Archive Details) ─────────────────────────── */}
          <div
            onClick={() => setIsFlipped(false)}
            className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-white/10 p-5 sm:p-8 flex flex-col justify-center cursor-pointer group/back overflow-y-auto no-scrollbar scroll-smooth"
          >
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
              <img
                src={item.image}
                className="w-full h-full object-cover blur-3xl scale-125"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 space-y-6 sm:space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">
                    Work Archive
                  </span>
                  <h2
                    className="font-black uppercase tracking-tighter text-white leading-[0.85]"
                    style={{
                      fontSize: !item.title?.includes(" ")
                        ? `clamp(1.5rem, ${Math.min(8, 60 / ((item.title?.length ?? 8) * 0.8))}vw, 2.5rem)`
                        : `clamp(1.5rem, ${Math.max(3, 10 - (item.title?.length ?? 8) * 0.2)}vw, 3.2rem)`,
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
                    <p className="text-xs sm:text-sm font-bold text-white/90 truncate group-hover/artist:text-yellow-400 transition-colors underline decoration-white/0 group-hover/artist:decoration-yellow-400/30 underline-offset-4">
                      {item.artist || "Aera Collective"}
                    </p>
                    <ArrowUpRight
                      size={10}
                      className="text-white/10 group-hover/artist:text-yellow-400/50 transition-colors"
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

                {/* Original */}
                <div
                  className="space-y-1.5 cursor-pointer group/orig"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.originalIds?.[0]) {
                      onClose();
                      navigate(`/originals/${item.originalIds[0]}`);
                    }
                  }}
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 group-hover/orig:text-white/40 transition-colors">
                    Original
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white/90 uppercase tracking-widest group-hover/orig:text-yellow-400 transition-colors truncate">
                      Archive
                    </p>
                    <ArrowUpRight
                      size={10}
                      className="text-white/10 group-hover/orig:text-yellow-400/50 transition-colors"
                    />
                  </div>
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
            </div>

            <div className="absolute bottom-6 left-8 flex items-center gap-3 opacity-20">
              <div className="h-px w-8 bg-white" />
              <span className="text-[8px] font-black uppercase tracking-[0.5em]">
                FrameHouse Collection
              </span>
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
