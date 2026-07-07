import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FavoriteButton } from "../../../components/FavoriteButton";
import { HonourAction } from "../../../components/actions/HonourAction";
import { PinAction } from "../../../components/actions/PinAction";
import { SaveAction } from "../../../components/actions/SaveAction";
import { TheatreItem, OriginalArtist } from "../../../types";
import { ExhibitionNav } from "../components/ExhibitionNav";
import { ArtistProfile } from "../../shared/profile";
import { ArtistContextPanel } from "../components/ArtistContextPanel";
import { HonourIcon } from "../../../components/icons/HonourIcon";
import { Star, Pin, Bookmark, Heart } from "lucide-react";
import { ARTISTS_MOCK } from "../../../mock";
import { CinematicToast } from "../../shared/modals/CinematicToast";

// Simple deterministic stat generator based on ID
function generateStat(id: string | number, multiplier: number, offset: number = 0): number {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return (Math.abs(hash) % multiplier) + offset;
}

function formatStat(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + 'K';
  return num.toString();
}

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
  const honourTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  const followersCount = generateStat(item.artist || item.id, 50000, 1000);
  const honoursCount = generateStat(item.id, 10000, 500);
  const pinsCount = generateStat(item.id, 5000, 50);
  const savesCount = generateStat(item.id, 20000, 200);

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
        <div className="flex flex-col relative">
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
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={handleArtistClick}
                      className="shrink-0 active:scale-95 transition-transform"
                      aria-label={`View ${item.artist || "artist"} profile`}
                      style={{ touchAction: "manipulation" }}
                    >
                      {item.artistAvatar ? (
                        <img
                          src={item.artistAvatar}
                          alt={item.artist || ""}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover opacity-80 hover:opacity-100 transition-opacity border border-white/10"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center">
                          <span className="text-sm font-black text-white/35">
                            {(item.artist || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="flex flex-col items-start justify-center gap-1">
                      <button
                        onClick={handleArtistClick}
                        className="text-[14px] sm:text-[15px] font-bold text-white/80 hover:text-white transition-colors truncate max-w-[140px] sm:max-w-[200px]"
                      >
                        {item.artist || "Unknown Artist"}
                      </button>

                      {/* Favourite heart row */}
                      <FavoriteButton
                        isFavorited={favorited}
                        onFavorite={() => setFavorited((f) => !f)}
                        activeColor="#ef4444"
                        iconSize={13}
                        className="flex items-center gap-1.5 opacity-70 hover:opacity-100 active:scale-95 transition-all -ml-1.5 py-0.5 px-1.5 rounded-lg hover:bg-white/5"
                        hideRipple
                      >
                        <span className="text-[10px] font-bold text-white/50 mt-px">
                          {formatStat(favorited ? followersCount + 1 : followersCount)} favorites
                        </span>
                      </FavoriteButton>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <HonourAction
                      isActive={isHonoured}
                      onClick={handleHonourBtn}
                      count={formatStat(isHonoured ? honoursCount + 1 : honoursCount)}
                      variant="exhibition"
                      isHonouring={honouring}
                    />
                    
                    <PinAction
                      isActive={pinned}
                      onClick={() => setPinned((p) => !p)}
                      count={formatStat(pinned ? pinsCount + 1 : pinsCount)}
                      variant="exhibition"
                    />
                    
                    <SaveAction
                      isActive={saved}
                      onClick={() => setSaved((s) => !s)}
                      count={formatStat(saved ? savesCount + 1 : savesCount)}
                      variant="exhibition"
                    />
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
