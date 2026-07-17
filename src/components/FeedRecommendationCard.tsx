import React, { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  BookOpen,
  Bookmark,
  Info,
  ChevronDown,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { Recommendation } from "../mock/recommendations";
import { BoostAction } from "./actions/BoostAction";
import { LibraryAction } from "./actions/LibraryAction";
import { SaveAction } from "./actions/SaveAction";
import { CameraAction } from "./actions/CameraAction";
import { ArtistProfile } from "../features/shared/profile/ArtistProfile";
import { SurgeBars } from "./SurgeBars";
import { PosterImage } from "./PosterImage";
import { QuoteModal } from "./QuoteModal";
import { formatRelativeTime } from "../utils/time";
import { useWorkNavigation } from "../hooks/useWorkNavigation";
import { TheatreItem } from "../types";

interface Props {
  rec: Recommendation;
  variant?: "default" | "modal" | "wall-embed";
}

export const FeedRecommendationCard = memo(function FeedRecommendationCard({
  rec,
  variant = "default",
}: Props) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [inLedger, setInLedger] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { openWork } = useWorkNavigation();

  const theatreItem: TheatreItem = {
    id: `rec-${rec.id}`,
    category: "Recommendation",
    recId: rec.id,
    image: rec.original.coverImage,
    title: rec.original.title,
    artist: rec.artist.name,
    artistId: rec.artist.id,
    artistAvatar: rec.artist.profilePicture,
    originalIds: [rec.original.id],
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWork(theatreItem);
  };

  const navigate = useNavigate();

  const textRef = useRef<HTMLParagraphElement>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && !notesExpanded) {
        setCanExpand(
          textRef.current.scrollHeight > textRef.current.clientHeight,
        );
      }
    };
    // Check initially and on resize
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [rec.notes, notesExpanded]);

  const highestScore = rec.artist.highestScore || 4500;
  const isHighestRated = rec.score >= highestScore;
  const ratio = rec.score / highestScore;

  return (
    <div className="flex flex-col gap-1.5 shrink-0 w-full">
      {/* ── The Card ── */}
      <div className="relative w-full h-auto">
        {/* ── Horizontal Layout: Poster (Left) + Content (Right) ── */}
        <div className="flex h-full">
          {/* LEFT: Portrait Poster Column — presented as a cinematic standalone poster */}
          <div className="w-[130px] sm:w-[150px] shrink-0 flex flex-col bg-transparent relative z-10 h-full">
            {/* Poster — fixed height so tall images don't inflate card */}
            <div className="px-2.5 pt-2.5 pb-2 shrink-0">
              <div
                className={`relative w-full h-[170px] overflow-hidden rounded-none border-2 border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)] ${variant === "default" ? "cursor-pointer group/poster" : ""}`}
                onClick={variant === "default" ? (e) => {
                  e.stopPropagation();
                  navigate(`/originals/${rec.original.id}`);
                } : undefined}
              >
                <PosterImage
                  src={rec.original.coverImage}
                  alt={rec.original.title}
                  className="w-full h-full object-cover object-top transition-[transform,filter] duration-700 group-hover/poster:scale-105 group-hover/poster:brightness-[0.6]"
                />

                {isHighestRated && (
                  <div className="absolute top-2 left-2 z-20 -rotate-[8deg] pointer-events-none opacity-95 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)]">
                    <div className="inline-block text-[7px] font-mono font-black uppercase tracking-[0.2em] text-[#EF4444] bg-[#050302]/40 border-[1.5px] border-[#EF4444]/90 px-1.5 py-0.5 rounded-[2px] backdrop-blur-md whitespace-nowrap">
                      PEAK EXP.
                    </div>
                  </div>
                )}

                {/* Gradient blend toward right */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050302]/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050302]/70 via-transparent to-transparent" />
              </div>
            </div>

            {/* Maker Credits + Stars */}
            <div className="px-2.5 pb-2.5 flex flex-col gap-1.5">
              {rec.original.director && (
                <div
                  className="group/credit cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${rec.original.director}`);
                  }}
                >
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">
                    Dir.
                  </p>
                  <div className="flex items-center gap-0.5">
                    <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/credit:text-white transition-colors">
                      {rec.original.director}
                    </p>
                    <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/credit:text-white/60 transition-colors shrink-0" />
                  </div>
                </div>
              )}
              {rec.original.dop && (
                <div
                  className="group/credit cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${rec.original.dop}`);
                  }}
                >
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-0.5">
                    DOP
                  </p>
                  <div className="flex items-center gap-0.5">
                    <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/credit:text-white transition-colors">
                      {rec.original.dop}
                    </p>
                    <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/credit:text-white/60 transition-colors shrink-0" />
                  </div>
                </div>
              )}
              {rec.original.stars && rec.original.stars.length > 0 && (
                <div>
                  <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">
                    Stars
                  </p>
                  <div className="flex flex-col gap-1">
                    {rec.original.stars.slice(0, 3).map((star) => (
                      <div
                        key={star}
                        className="group/star flex items-center gap-0.5 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${star}`);
                        }}
                      >
                        <p className="text-[9px] font-black text-white/80 leading-tight truncate group-hover/star:text-white transition-colors">
                          {star}
                        </p>
                        <ArrowUpRight className="w-2.5 h-2.5 text-white/20 group-hover/star:text-white/60 transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="w-[1px] bg-white/[0.05] shrink-0" />

          {/* RIGHT: Content Column */}
          <div
            className={`flex-1 min-w-0 flex flex-col relative z-10 ${variant === "default" ? "cursor-pointer" : ""}`}
            onClick={variant === "default" ? handleCardClick : undefined}
          >
            {/* TOP: Film Title */}
            <div className="px-3 pt-3 pb-2 border-b border-white/[0.04] flex items-start justify-between gap-2">
              <h3
                className="text-[17px] sm:text-[19px] font-black uppercase text-white tracking-tight leading-[1.05] line-clamp-2"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
              >
                {rec.original.title}
              </h3>
              {rec.postedAt && (
                <span className="text-[9px] font-medium tracking-wide text-white/20 shrink-0 pt-1">
                  {formatRelativeTime(rec.postedAt)}
                </span>
              )}
            </div>

            {/* MIDDLE + FOOTER Container */}
            <div className="flex flex-col">
              {/* Notes */}
              <motion.div
                layout
                className="px-3 py-2 shrink-0 w-full relative z-20"
              >
                <motion.p
                  ref={textRef}
                  layout
                  className={`leading-relaxed font-medium transition-colors duration-300 text-white/85 ${
                    notesExpanded
                      ? "text-[13px] sm:text-[14px]"
                      : "text-[12px] sm:text-[13px]"
                  }`}
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: notesExpanded ? "unset" : 5,
                    overflow: "hidden",
                  }}
                >
                  {rec.notes}
                </motion.p>
                {(canExpand || notesExpanded) && (
                  <motion.div
                    layout
                    className="mt-2 text-[8px] font-black uppercase tracking-widest text-amber-500/80 hover:text-amber-500 transition-colors w-fit cursor-pointer flex items-center gap-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotesExpanded(!notesExpanded);
                    }}
                  >
                    <motion.span
                      animate={{ rotate: notesExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.span>
                    {notesExpanded ? "LESS" : "MORE"}
                  </motion.div>
                )}
              </motion.div>

              {/* Artist Footer */}
              <motion.div
                layout
                className="px-3 py-2 flex flex-col gap-2 shrink-0 border-t border-white/[0.04] w-full relative z-10"
              >
                {/* Artist row: avatar + name + stats + artistLiked heart */}
                <div className="flex items-center gap-2.5">
                  {/* Artist Avatar — clickable */}
                  <button
                    className="shrink-0 hover:opacity-80 transition-opacity focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsArtistModalOpen(true);
                    }}
                  >
                    <img
                      src={rec.artist.profilePicture}
                      alt={rec.artist.name}
                      className="w-7 h-7 rounded-lg border border-white/[0.1] object-cover object-top"
                    />
                  </button>

                  {/* Name + Stage Name + Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/85 leading-none truncate">
                        {rec.artist.name}
                      </span>
                      {/* Artist's own liked status on this original */}
                      {rec.artistLiked && (
                        <Heart
                          className="w-2.5 h-2.5 shrink-0"
                          style={{
                            fill: "#ef4444",
                            color: "#ef4444",
                            filter: "drop-shadow(0 0 4px rgba(239,68,68,0.4))",
                          }}
                        />
                      )}
                      <span className="text-[8px] font-mono text-white/30 leading-none truncate">
                        {rec.artist.stageName}
                      </span>
                    </div>
                    {/* Artist stats */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[7px] font-black text-white/25 uppercase tracking-[0.15em]">
                        {rec.artist.spirit.toLocaleString()} spirit
                      </span>
                      {rec.artist.works != null && (
                        <>
                          <span className="text-[7px] text-white/15">·</span>
                          <span className="text-[7px] font-black text-white/25 uppercase tracking-[0.15em]">
                            {rec.artist.works} works
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Partition between artist info and score */}
                <div className="h-px bg-white/[0.05]" />

                {/* Score Row */}
                <div 
                  className="flex items-center gap-2.5 h-[28px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Bars block */}
                  <div
                    className="relative flex items-center gap-2 flex-1 cursor-help min-w-0 h-full"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(!showTooltip);
                    }}
                  >
                    {/* Bars */}
                    <SurgeBars
                      score={rec.score || 0}
                      highestScore={highestScore}
                      size="md"
                      colorVariant="amber"
                    />

                    {/* Score numbers */}
                    <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                      <span className="text-[14px] font-black text-white leading-none tracking-tighter">
                        {Math.round(((rec.score || 0) / highestScore) * 100)}%
                      </span>
                      <span className="text-[7px] font-black tracking-widest uppercase ml-1">
                        <span className="text-white/30">
                          {(rec.score || 0).toString()} /{" "}
                          {highestScore.toString()}
                        </span>
                      </span>
                    </div>

                    {/* Info icon */}
                    <Info
                      className={`w-3 h-3 shrink-0 transition-colors ${showTooltip ? "text-amber-500" : "text-white/15"}`}
                    />

                    {/* Tooltip */}
                    <div
                      className={`absolute left-0 bottom-full mb-3 w-56 origin-bottom-left z-30 transition-all duration-150 ease-out pointer-events-none ${
                        showTooltip
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-[0.97]"
                      }`}
                    >
                      <div className="bg-[#0A0806]/95 backdrop-blur-xl border border-[#B45309]/30 rounded-xl p-3 shadow-[0_8px_32px_rgba(180,83,9,0.2)]">
                        <span className="text-white/40 font-black uppercase tracking-widest text-[7px] block mb-1">
                          Personal Score
                        </span>
                        <p className="text-[10px] text-white/75 leading-relaxed font-medium">
                          How strongly {rec.artist.name} recommends this —
                          measured against their personal all-time peak.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vertical divider */}
                  {variant !== "wall-embed" && (
                    <div className="w-px self-stretch bg-white/[0.07] shrink-0 mx-0.5" />
                  )}

                  {/* Save Action (Moved from bottom) */}
                  {variant !== "wall-embed" && (
                    <button
                      className="shrink-0 p-1 rounded-lg hover:bg-white/[0.04] w-7 h-7 mr-3 flex items-center justify-center transition-colors text-white/30 hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaved(!saved);
                      }}
                      aria-label={saved ? "Saved" : "Save"}
                    >
                      <Bookmark
                        className="w-[18px] h-[18px] sm:w-5 sm:h-5"
                        fill={saved ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ACTION ROW (At the very bottom, fixed in flow) */}
            <div className="shrink-0 px-3 pb-2 bg-transparent relative z-20">
              <div
                className={`flex items-center justify-between gap-2 sm:gap-3 pt-1 border-t transition-colors duration-300 ${!notesExpanded ? "border-white/[0.04]" : "border-transparent"}`}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* Primary Actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <BoostAction isActive={boosted} onClick={() => setBoosted(!boosted)} variant="exhibition" className="!h-7 sm:!h-[30px] flex-1 justify-center rounded-lg" />
                  <LibraryAction isActive={inLedger} onClick={() => setInLedger(!inLedger)} variant="exhibition" className="!h-7 sm:!h-[30px] flex-1 justify-center rounded-lg" />
                </div>

                {/* Secondary Action */}
                {variant !== "wall-embed" && (
                  <div className="mr-1 translate-y-[1px] shrink-0">
                    <CameraAction 
                      isActive={pinned} 
                      isPinned={pinned}
                      onPin={() => setPinned(!pinned)} 
                      onQuote={() => setIsQuoteModalOpen(true)}
                      variant="exhibition" 
                      iconOnly
                      className="!w-7 !h-7 sm:!w-[30px] sm:!h-[30px] flex items-center justify-center !px-0 rounded-lg" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artist Profile Modal */}
      {isArtistModalOpen && (
        <ArtistProfile
          artist={{
            id: rec.artist.id,
            name: rec.artist.name,
            image: rec.artist.profilePicture,
            spirit: rec.artist.spirit,
            works: rec.artist.works ?? 0,
            socials: {
              instagram: "artist_ig",
              twitter: "artist_x",
              youtube: "artist_yt",
            },
          }}
          onClose={() => setIsArtistModalOpen(false)}
          zIndex="z-[250]"
        />
      )}

      <AnimatePresence>
        {isQuoteModalOpen && (
          <QuoteModal
            isOpen={isQuoteModalOpen}
            onClose={() => setIsQuoteModalOpen(false)}
            item={theatreItem}
            renderTop={
              <div className="p-4 sm:p-5 pointer-events-none bg-[#111111]/40 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-[#0a0a0a] pointer-events-none z-10" />
                <FeedRecommendationCard rec={rec} variant="modal" />
              </div>
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
});
