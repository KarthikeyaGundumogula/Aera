import { motion } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { X, Layers, Share2 } from "lucide-react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ModalWrapper } from "./ModalWrapper";
import { ArtistProfile } from "../profile";
import { ARTISTS_MOCK } from "../../../mock";
import { CurateOverlay } from "./CurateOverlay";
import { CinematicToast } from "./CinematicToast";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { buildEmbedUrl } from "../../../utils/embed";
import { FHLoader } from "../../../components/FHLoader";
import { PerimeterOutline } from "./PerimeterOutline";
import { HonourIcon } from "../../../components/icons/HonourIcon";

interface EditFrameProps {
  item: TheatreItem;
  onClose: () => void;
  archiveLabel?: string;
  standalone?: boolean;
  isActive?: boolean;
}

/**
 * EditFrame — Dynamic media modal (YouTube / Twitter).
 *
 * ┌────────────────────────────────────────────────────────┐
 * │  [Avatar] Artist · Title                [Share]  [X]  │  header
 * ├────────────────────────────────────────────────────────┤
 * │                                                        │
 * │               VIDEO / TWEET EMBED                     │  media
 * │                                                        │
 * ├────────────────────────────────────────────────────────┤
 * │  [✦ HONOUR / HONOURED]              [⊞ Originals]     │  footer
 * └────────────────────────────────────────────────────────┘
 *
 * Double-tap anywhere on the frame → Honour (Instagram-style).
 * Implemented via native addEventListener so it works above iframes.
 */
export function EditFrame({
  item,
  onClose,
  archiveLabel: _archiveLabel,
  standalone = true,
  isActive = true,
}: EditFrameProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [showCurate, setShowCurate] = useState(false);
  const [isHonoured, setIsHonoured] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [titleGlow, setTitleGlow] = useState(false);
  const [honouring, setHonouring] = useState(false);
  const [doubleTapFlash, setDoubleTapFlash] = useState(false);

  // Refs for timeouts (stable, no stale-closure risk)
  const glowTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const honourTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Outer frame ref — native touchend listener attached here
  const frameRef = useRef<HTMLDivElement>(null);
  // Last tap timestamp for double-tap detection (module-scoped per instance)
  const lastTapRef = useRef(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { containerRef: twitterContainerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    item.platform === "twitter" ? item.srcId : undefined,
    isActive
  );
  const [isYoutubeLoaded, setIsYoutubeLoaded] = useState(false);

  const isYoutube = item.platform === "youtube";
  const isLoaded = isYoutube ? isYoutubeLoaded : isTwitterLoaded;
  const youtubeEmbedUrl = isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  // ── Native double-tap listener ────────────────────────────────────────────
  // Why native? React synthetic events don't fire inside iframes. The overlay
  // div above the iframe acts as the touch surface, and native listeners on
  // the outer frame catch bubbled touchend events from it.
  // All deps (setters, refs) are stable — empty dep array is intentional.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      const delta = now - lastTapRef.current;
      lastTapRef.current = now;

      if (delta < 280 && delta > 30) {
        // Double tap — always honour, like Instagram
        if (honourTimeoutRef.current) clearTimeout(honourTimeoutRef.current);
        if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);

        setIsHonoured(true);
        setHonouring(true);
        setTitleGlow(true);
        setDoubleTapFlash(true);

        honourTimeoutRef.current = setTimeout(() => setHonouring(false), 420);
        glowTimeoutRef.current = setTimeout(() => setTitleGlow(false), 700);
        flashTimeoutRef.current = setTimeout(() => setDoubleTapFlash(false), 600);
      }
    };

    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => el.removeEventListener("touchend", onTouchEnd);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      }
    );
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/works/${item.id}`;
    
    const showToast = () => {
      setToastMessage("LINK COPIED");
      setTimeout(() => setToastMessage(null), 2500);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(showToast)
        .catch((err) => {
          console.warn("Failed to copy link via navigator.clipboard, trying fallback:", err);
          const success = copyTextFallback(url);
          if (success) {
            showToast();
          }
        });
    } else {
      const success = copyTextFallback(url);
      if (success) {
        showToast();
      }
    }
  };

  const handleHonour = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (honourTimeoutRef.current) clearTimeout(honourTimeoutRef.current);
    const next = !isHonoured;
    setIsHonoured(next);
    setHonouring(true);
    honourTimeoutRef.current = setTimeout(() => setHonouring(false), 420);
    if (next) {
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
      setTitleGlow(true);
      glowTimeoutRef.current = setTimeout(() => setTitleGlow(false), 700);
    }
  };

  const content = (
    <>
      <motion.div
        ref={frameRef}
        key="edit-frame"
        initial={standalone ? { y: 20, opacity: 0, scale: 0.97 } : undefined}
        animate={standalone ? { y: 0, opacity: 1, scale: 1 } : undefined}
        exit={standalone ? { y: 20, opacity: 0, scale: 0.97 } : undefined}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-[calc(100vw-4px)] max-h-full overflow-hidden rounded-[24px] border border-white/8 bg-[#0d0d0b] shadow-2xl flex-col"
      >
        <PerimeterOutline isActive={isHonoured} radius={24} />

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 sm:px-6">
          {/* Left: Avatar (clickable only) + name + title (display only) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Avatar — ONLY this triggers artist modal */}
            <button
              onClick={handleArtistClick}
              className="h-8 w-8 rounded-[10px] shrink-0 overflow-hidden bg-white/6 border border-white/8 hover:border-white/25 transition-colors duration-200 flex items-center justify-center"
              aria-label={`Open ${item.artist || "artist"} profile`}
            >
              {item.artistAvatar ? (
                <img src={item.artistAvatar} alt={item.artist || ""} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-black text-white/40">
                  {(item.artist || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            {/* Artist name + title — display only, no click */}
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/30 leading-none mb-0.5 truncate">
                {item.artist || "Unknown Artist"}
              </p>
              <p
                className={`text-[13px] font-semibold leading-tight truncate transition-colors duration-500 ${
                  titleGlow ? "text-[#E11D48]" : isHonoured ? "text-[#E11D48]/50" : "text-white/85"
                }`}
              >
                {item.title || "Untitled"}
              </p>
            </div>
          </div>

          {/* Right utility buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              title="Copy link"
              aria-label="Share"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
            >
              <Share2 size={14} strokeWidth={2} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ── Media ────────────────────────────────────────────── */}
        <div className={`relative w-full ${isYoutube ? "" : !isLoaded ? "min-h-[220px] sm:min-h-[280px]" : ""}`}>
          {!isLoaded && isActive && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0d0d0b]/80 backdrop-blur-sm">
              <FHLoader label="Loading" />
            </div>
          )}
          {!isActive && <div className="w-full aspect-video bg-[#0d0d0b]" />}
          {isActive && (
            isYoutube ? (
              <div className="w-full aspect-video bg-black">
                <iframe
                  ref={iframeRef}
                  id={`yt-${item.id}`}
                  src={youtubeEmbedUrl}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={item.title}
                  loading="lazy"
                  onLoad={() => setIsYoutubeLoaded(true)}
                />
              </div>
            ) : (
              <div className="w-full flex justify-center py-2">
                <div ref={twitterContainerRef} className="w-full max-w-[540px]" />
              </div>
            )
          )}
        </div>

        {/* ── Footer — also the double-tap zone ───────────────── */}
        <div className="relative flex items-center justify-between gap-3 px-4 py-3 border-t border-white/6 sm:px-6">
          {/* Honour — left */}
          <button
            onClick={handleHonour}
            aria-label={isHonoured ? "Remove honour" : "Honour this work"}
            className={`flex items-center gap-2 rounded-full px-3.5 h-8 border transition-all duration-250 select-none active:scale-[0.96] ${
              isHonoured
                ? "border-[#E11D48]/25 bg-[#E11D48]/8 text-[#E11D48]"
                : "border-white/8 bg-white/3 text-white/35 hover:text-white/60 hover:border-white/15"
            }`}
            style={isHonoured ? { boxShadow: "0 0 12px rgba(225,29,72,0.15)" } : undefined}
          >
            <HonourIcon
              size={12}
              filled={isHonoured}
              className="shrink-0"
              style={{
                transform: honouring ? "scale(1.6)" : "scale(1)",
                transition: honouring
                  ? "transform 90ms cubic-bezier(0.23, 1, 0.32, 1)"
                  : "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            />
            <motion.span layout className="text-[9px] font-black uppercase tracking-[0.22em]">
              {isHonoured ? "Honoured" : "Honour"}
            </motion.span>
          </button>

          {/* Centre gap — double-tap hint */}
          <div className="flex-1 flex items-center justify-center select-none pointer-events-none">
            <span
              className="text-[9px] font-black uppercase tracking-[0.35em] transition-all duration-500"
              style={{ color: isHonoured ? "rgba(225,29,72,0.35)" : "rgba(255,255,255,0.08)" }}
            >
              ✦
            </span>
          </div>

          {/* Originals — right */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowCurate(true); }}
            className="flex items-center gap-1.5 rounded-full px-3.5 h-8 border border-white/8 bg-white/3 text-white/35 hover:bg-white hover:text-black hover:border-white transition-all duration-200 active:scale-[0.96]"
          >
            <Layers size={12} strokeWidth={2} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              Originals
            </span>
          </button>

          {/* Double-tap ✦ flash — appears in footer */}
          {doubleTapFlash && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-b-[24px]">
              <div style={{ animation: "honour-flash 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
                <HonourIcon size={40} filled={true} />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <ArtistProfile artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
      <CurateOverlay
        isOpen={showCurate}
        onClose={() => setShowCurate(false)}
        originalIds={item.originalIds || []}
        onShowToast={(msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); }}
      />
      <CinematicToast message={toastMessage} />
    </>
  );

  if (!standalone) return content;

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose} className="!p-[2px] [&>div]:!p-0">
      {content}
    </ModalWrapper>
  );
}

function copyTextFallback(text: string): boolean {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    return false;
  }
}
