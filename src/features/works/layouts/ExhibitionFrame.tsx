import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ExhibitionNav } from "../components/ExhibitionNav";
import { ArtistProfile } from "../../shared/profile";
import { ArtistContextPanel } from "../components/ArtistContextPanel";
import { HonourIcon } from "../../../components/icons/HonourIcon";
import { Star, Pin, Bookmark, Heart } from "lucide-react";
import { ARTISTS_MOCK } from "../../../mock";

interface ExhibitionFrameProps {
  item: TheatreItem;
  /**
   * The unique media content for this work type.
   * Receives `{ isHonoured, honouring, doubleTapFlash, onDoubleTap }` so media
   * can trigger the honour flash on double-tap without managing it themselves.
   */
  mediaSlot: (ctx: MediaSlotContext) => React.ReactNode;
  /** Pass false for Recommendation which has its own identity block inside RecommendationCard */
  showIdentityBlock?: boolean;
  /** Max-width constraint for the media container. Defaults to min(900px, 100vw-2rem) */
  mediaMaxWidth?: string;
}

export interface MediaSlotContext {
  isHonoured: boolean;
  honouring: boolean;
  doubleTapFlash: boolean;
  /** Call this from your media to trigger a double-tap honour flash */
  triggerDoubleTap: () => void;
}

const DOUBLE_TAP_MS = 280;
const DOUBLE_TAP_MIN_MS = 30;

/**
 * ExhibitionFrame — the single, unified exhibition chrome.
 *
 * Handles:
 *  - Responsive two-column grid (desktop) / vertical stack (mobile)
 *  - ExhibitionNav (top bar)
 *  - YouTube-style identity block: Title → Avatar + Name + Favourite → Actions
 *  - Honour / Favourite state
 *  - ArtistProfile modal
 *  - ArtistContextPanel (right column)
 *
 * Each work type passes a `mediaSlot` render-prop with its unique media JSX.
 */
export function ExhibitionFrame({
  item,
  mediaSlot,
  showIdentityBlock = true,
  mediaMaxWidth,
}: ExhibitionFrameProps) {
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);
  const [isHonoured, setIsHonoured] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [honouring, setHonouring] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [saved, setSaved] = useState(false);
  const [doubleTapFlash, setDoubleTapFlash] = useState(false);
  const lastTapRef = useRef(0);
  const honourTimeout = useRef<ReturnType<typeof setTimeout>>();
  const flashTimeout = useRef<ReturnType<typeof setTimeout>>();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleArtistClick = () => {
    const a = ARTISTS_MOCK.find((a) => a.name === item.artist);
    setSelectedArtist(
      a || {
        id: String(item.id),
        name: item.artist || "Anonymous",
        spirit: 0,
        works: 0,
        image: item.artistAvatar || item.image || "",
      }
    );
  };

  const fireHonour = () => {
    if (honourTimeout.current) clearTimeout(honourTimeout.current);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setIsHonoured(true);
    setHonouring(true);
    setDoubleTapFlash(true);
    honourTimeout.current = setTimeout(() => setHonouring(false), 420);
    flashTimeout.current = setTimeout(() => setDoubleTapFlash(false), 600);
  };

  const handleHonourBtn = () => {
    if (honourTimeout.current) clearTimeout(honourTimeout.current);
    const next = !isHonoured;
    setIsHonoured(next);
    setHonouring(true);
    honourTimeout.current = setTimeout(() => setHonouring(false), 420);
  };

  const triggerDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS && now - lastTapRef.current > DOUBLE_TAP_MIN_MS) {
      fireHonour();
    }
    lastTapRef.current = now;
  };

  // ── Media slot context ─────────────────────────────────────────────────────
  const mediaCtx: MediaSlotContext = {
    isHonoured,
    honouring,
    doubleTapFlash,
    triggerDoubleTap,
  };

  const maxW = mediaMaxWidth ?? "min(900px,calc(100vw-2rem))";

  return (
    <div className="min-h-screen bg-[#070706] text-white overflow-x-hidden">

      {/* ── Two-column grid: media left, artist context right ─────────────── */}
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_380px] min-h-screen">

        {/* Left column ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col relative border-b lg:border-b-0 border-white/[0.04]">
          <ExhibitionNav item={item} />

          <div className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-20 pb-8 sm:pt-24 lg:justify-center">

            {/* Media container — max-width controlled per type */}
            <div style={{ width: "100%", maxWidth: maxW }}>
              {mediaSlot(mediaCtx)}
            </div>

            {/* ── YouTube-style identity block ─────────────────────────────── */}
            {showIdentityBlock && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
                style={{ width: "100%", maxWidth: maxW }}
                className="mt-5 flex flex-col gap-4"
              >
                {/* Title */}
                <h1
                  className={`text-xl sm:text-2xl font-bold leading-snug tracking-tight transition-colors duration-500 ${
                    isHonoured ? "text-[#E11D48]/80" : "text-white/90"
                  }`}
                >
                  {item.title || "Untitled"}
                </h1>

                {/* Artist row + actions row */}
                <div className="flex flex-row items-center justify-between gap-4 mt-2">

                  {/* Left: Avatar + Name + Favourite */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={handleArtistClick}
                      className="flex items-center gap-2 group active:scale-[0.97] transition-transform shrink-0"
                      aria-label={`View ${item.artist || "artist"} profile`}
                      style={{ touchAction: "manipulation" }}
                    >
                      {item.artistAvatar ? (
                        <img
                          src={item.artistAvatar}
                          alt={item.artist || ""}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover opacity-80 group-hover:opacity-100 transition-opacity border border-white/10"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center">
                          <span className="text-sm font-black text-white/35">
                            {(item.artist || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-[14px] sm:text-[15px] font-semibold text-white/70 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none">
                        {item.artist || "Unknown Artist"}
                      </span>
                    </button>

                    {/* Favourite heart */}
                    <button
                      onClick={() => setFavorited((f) => !f)}
                      className="p-1.5 active:scale-90 transition-transform shrink-0"
                      aria-label="Favourite Artist"
                    >
                      <motion.div
                        animate={{ scale: favorited ? [1, 1.3, 1] : 1 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                      >
                        <Heart
                          className="w-[16px] h-[16px] transition-all duration-200"
                          style={{
                            fill: favorited ? "#ef4444" : "transparent",
                            color: favorited ? "#ef4444" : "rgba(255,255,255,0.18)",
                            filter: favorited ? "drop-shadow(0 0 8px rgba(239,68,68,0.55))" : "none",
                          }}
                        />
                      </motion.div>
                    </button>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={handleHonourBtn}
                      aria-label={isHonoured ? "Remove honour" : "Honour this work"}
                      className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border transition-all active:scale-95 ${
                        isHonoured ? "border-[#E11D48]/30 bg-[#E11D48]/10 text-[#E11D48]" : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                      style={isHonoured ? { boxShadow: "0 0 16px rgba(225,29,72,0.15)" } : undefined}
                    >
                      <HonourIcon
                        size={13}
                        filled={isHonoured}
                        style={{
                          transform: honouring ? "scale(1.4)" : "scale(1)",
                          transition: honouring
                            ? "transform 90ms cubic-bezier(0.23,1,0.32,1)"
                            : "transform 320ms cubic-bezier(0.23,1,0.32,1)",
                        }}
                      />
                    </button>
                    <button
                      onClick={() => setPinned(p => !p)}
                      aria-label="Pin to Wall"
                      className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border transition-all active:scale-95 ${
                        pinned ? "border-blue-500/30 bg-blue-500/10 text-blue-500" : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Pin size={13} fill={pinned ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => setSaved(s => !s)}
                      aria-label="Save"
                      className={`flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border transition-all active:scale-95 ${
                        saved ? "border-white/30 bg-white/10 text-white" : "border-white/8 bg-white/3 text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right column — Artist context ────────────────────────────────── */}
        <ArtistContextPanel item={item} />
      </div>

      <ArtistProfile artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
    </div>
  );
}
