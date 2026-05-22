import { motion } from "motion/react";
import React, { useState, useRef } from "react";
import { LayoutPanelLeft, X, Layers } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";
import { CurateOverlay } from "./CurateOverlay";
import { AdaptiveTitle } from "../../../components/AdaptiveTitle";
import { WorkActionBar } from "./WorkActionBar";
import { CinematicToast } from "./CinematicToast";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { buildEmbedUrl } from "../../../utils/embed";
import { FHLoader } from "../../../components/FHLoader";

interface EditFrameProps {
  item: TheatreItem;
  onClose: () => void;
  archiveLabel?: string;
}

/**
 * EditFrame — Unified frame for dynamic media (YouTube, Twitter).
 * 
 * Layout:
 * ┌──────────────────────────────────────────────────┐
 * │  Header: Label · Title · ActionBar · Close       │
 * ├──────────────────────────────────────────────────┤
 * │  Media Area (Wide layout for 16:9 videos)        │
 * ├──────────────────────────────────────────────────┤
 * │  Footer: Artist · View Originals                 │
 * └──────────────────────────────────────────────────┘
 */
export function EditFrame({
  item,
  onClose,
  archiveLabel = "Edit Archive",
}: EditFrameProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [showCurate, setShowCurate] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { containerRef: twitterContainerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    item.platform === "twitter" ? item.srcId : undefined,
    false // no flipping for edits anymore
  );

  const [isYoutubeLoaded, setIsYoutubeLoaded] = useState(false);

  const isYoutube = item.platform === "youtube";
  const isLoaded = isYoutube ? isYoutubeLoaded : isTwitterLoaded;

  const youtubeEmbedUrl =
    isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  // ── Artist click handler ───────────────────────────────────────────
  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
    setSelectedArtist(
      artistData || {
        id: String(item.id),
        name: item.artist || "Anonymous",
        presence: 0,
        works: 0,
        image: item.artistAvatar || item.image || "",
      },
    );
  };

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose} className="!p-[2px] [&>div]:!p-0">
      <motion.div
        key="edit-frame-card"
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-[calc(100vw-4px)] overflow-hidden rounded-[28px] border border-white/8 bg-[#0d0c0a] shadow-2xl flex-col"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,204,184,0.07),transparent_40%)] pointer-events-none" />

        <div className="relative flex flex-1 flex-col bg-[#0d0c0a]">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 sm:px-7">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.34em] text-white/25">
                {archiveLabel}
              </p>
              <AdaptiveTitle
                title={item.title || "Untitled"}
                as="h3"
                multiWordClass="text-sm sm:text-base tracking-tight"
                singleWordClamp="clamp(0.85rem, 4vw, 1.15rem)"
                className="text-white/80"
              />
            </div>

            {/* Header Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <WorkActionBar
                isLiked={isLiked}
                setIsLiked={setIsLiked}
                setToastMessage={setToastMessage}
                workId={item.id}
                variant="edit"
              />

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white hover:text-black active:scale-95"
                aria-label="Close modal"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Media Area ──────────────────────────────────────────── */}
          <div className={`relative flex flex-col items-center justify-center w-full h-auto ${isYoutube ? "" : (!isLoaded ? "min-h-[250px] sm:min-h-[300px]" : "")}`}>
            {!isLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0d0c0a]/80 backdrop-blur-sm">
                <FHLoader label="Loading Media" />
              </div>
            )}

            {isYoutube ? (
              <div className="w-full aspect-video bg-black relative h-auto">
                <iframe
                  ref={iframeRef}
                  id={`yt-player-${item.id}`}
                  src={youtubeEmbedUrl}
                  className="w-full h-full border-none absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={item.title}
                  onLoad={() => setIsYoutubeLoaded(true)}
                />
              </div>
            ) : (
              <div className="w-full flex justify-center h-auto">
                <div
                  ref={twitterContainerRef}
                  className="w-full max-w-[560px] flex justify-center h-auto"
                />
              </div>
            )}
          </div>

          {/* ── Footer ─────────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-white/6 px-5 py-4 sm:px-7">
            <div
              className="flex items-center gap-3 text-white/70 cursor-pointer group/artist"
              onClick={handleArtistClick}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 group-hover/artist:bg-white group-hover/artist:text-black transition-all">
                <LayoutPanelLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/25 group-hover/artist:text-white/40 transition-colors">
                  Artist
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60 group-hover/artist:text-white transition-colors">
                  {item.artist || "Collective"}
                </p>
              </div>
            </div>

            <div
              className="relative z-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowCurate(true);
              }}
            >
              <div className="cursor-pointer pointer-events-auto group flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 hover:border-white transition-all duration-300 rounded-xl">
                <Layers
                  size={14}
                  className="group-hover:fill-current pointer-events-none"
                />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none sm:inline hidden">
                  View Associated Originals
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] pointer-events-none sm:hidden">
                  Originals
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
