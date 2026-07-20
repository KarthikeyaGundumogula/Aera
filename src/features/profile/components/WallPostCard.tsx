import React, { memo, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Camera, Star, Bookmark, Eye } from "lucide-react";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { Recommendation } from "../../../mock/recommendations";
import { FeedRecommendationCard } from "../../../components/FeedRecommendationCard";
import { Original } from "../../../types/originals";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { ReactionAction } from "../../../components/actions/ReactionAction";
import { ReactionId } from "../../../types/reactions";
import { useNavigate } from "react-router-dom";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { ShareAction } from "../../../components/actions/ShareAction";
import { LedgerItem } from "../../../mock/ledger";
import { LedgerWallCard } from "./LedgerWallCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Formats a posted-at ISO string into a relative time label. */
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}



// ─── Shared Twitter-style Layout ──────────────────────────────────────────────

interface CardLayoutProps {
  artistName: string;
  artistImage: string;
  postedAt: string;
  /** Used to construct the shareable wall-post URL */
  postId: string;
  artistId: string;
  text?: string;
  quoteHeader?: string;
  themeGradient?: [string, string];
  children?: React.ReactNode;
}

const CardLayout: React.FC<CardLayoutProps> = ({
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  text,
  quoteHeader,
  themeGradient,
  children,
}) => {
  const [activeReaction, setActiveReaction] = useState<ReactionId | null>(null);
  const [saved, setSaved] = useState(false);
  // generate stable random views based on artistName length for mock purposes
  const viewsCount = (artistName.length * 142) + 340;
  const reactionsCount = (artistName.length * 12) + 15;

  return (
  <div className="flex gap-3 px-4 pt-4 pb-4">
    {/* Left Column: Avatar */}
    <div className="flex-shrink-0">
      <img
        src={artistImage}
        alt={artistName}
        // Framehouse Rule: No perfectly circular avatars. Use rounded-xl.
        className="w-10 h-10 rounded-xl object-cover object-top border border-white/10 shadow-sm"
      />
    </div>

    {/* Right Column: Content */}
    <div className="flex flex-col flex-1 min-w-0 pt-0.5">
      {/* Header Row */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90 truncate">
          {artistName}
        </span>
        <span className="text-[10px] font-bold text-white/20">·</span>
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 flex-shrink-0">
          {formatRelativeTime(postedAt)}
        </span>
      </div>

      {/* Main Post Text / Quote */}
      {text && (
        <div
          className={children ? "mb-3 relative pl-3.5 py-0.5" : ""}
          style={
            children
              ? { borderLeft: `2px solid ${themeGradient ? themeGradient[0] : "#F59E0B"}` }
              : {}
          }
        >
          {quoteHeader && (
            <div className="flex items-center gap-1.5 opacity-80 mb-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                {quoteHeader}
              </span>
            </div>
          )}
          <p
            className={`text-[15px] leading-[1.55] text-white/85 ${
              children ? "italic" : "font-normal"
            }`}
          >
            {children ? `"${text}"` : text}
          </p>
        </div>
      )}

      {/* Attached Media (if any) */}
      {children && (
        <div className="mt-3 w-full">
          {children}
        </div>
      )}

      {/* Single Unified Action Row: Reaction + Save + Share */}
      <div className="flex items-center gap-2 mt-4 mb-1 w-full">
        <div className="flex-1 min-w-0">
          <ReactionAction 
            activeReaction={activeReaction}
            onReact={setActiveReaction}
            count={reactionsCount}
            variant="comment-bar"
          />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className={`h-11 px-3 rounded-2xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
            saved 
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]" 
              : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]"
          }`}
          aria-label={saved ? "Unsave post" : "Save post"}
        >
          <Bookmark className="w-3.5 h-3.5" fill={saved ? "currentColor" : "none"} />
          <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
        </button>

        <ShareAction
          title={`${artistName} on Aera`}
          text={`See this post by ${artistName}`}
          url={`${window.location.origin}/wall/${artistId}/${postId}`}
          variant="button"
        />
      </div>
    </div>
  </div>
  );
};

// ─── 1. Pure Line Variant ─────────────────────────────────────────────────────

interface LineVariantProps {
  text: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
  postId: string;
  artistId: string;
  themeGradient?: [string, string];
}

const LineVariant: React.FC<LineVariantProps> = ({
  text,
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  themeGradient,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
    postId={postId}
    artistId={artistId}
    text={text}
    themeGradient={themeGradient}
  />
);

// ─── 2. Pin Media Preview ────────────────────────────────────────────────────

interface PinMediaPreviewProps {
  image?: string;
  title?: string;
  /** The resolved TheatreItem — needed for CategoryBadge */
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isOriginal?: boolean;
  themeGradient?: [string, string];
  pinnedWorkId?: string;
  pinnedOriginalId?: string;
}

const PinMediaPreview: React.FC<PinMediaPreviewProps> = ({
  image,
  title,
  resolvedWork,
  resolvedOriginal,
  isOriginal = false,
  themeGradient,
  pinnedWorkId,
  pinnedOriginalId,
}) => {
  const navigate = useNavigate();
  const { openWork } = useWorkNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resolvedWork) {
      openWork(resolvedWork);
    } else if (pinnedWorkId) {
      navigate(`/works/${pinnedWorkId}`);
    } else if (resolvedOriginal) {
      navigate(`/originals/${resolvedOriginal.id}`);
    } else if (pinnedOriginalId) {
      navigate(`/originals/${pinnedOriginalId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer group/pin hover:opacity-95 transition-opacity"
    >
      {image ? (
        <img
          src={image}
          alt={title ?? "Pinned work"}
          className="w-full h-auto object-cover object-top group-hover/pin:scale-[1.01] transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-white/5 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            {isOriginal ? "Original" : "Work"}
          </span>
        </div>
      )}

      {/* Cinematic gradient — stronger at bottom for title contrast */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* ── Category type badge from existing CategoryBadge system ── */}
      {resolvedWork && (
        <CategoryBadge item={resolvedWork} variant="mobile" />
      )}

      {/* For Originals — show a simple "Original" chip */}
      {isOriginal && !resolvedWork && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-sm bg-black/60 backdrop-blur-md border border-white/10">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
            Original
          </span>
        </div>
      )}

      {/* Pin icon — top-left corner, wrapped in a glass badge for high visibility */}
      <div className="absolute top-2 left-2 z-20 w-[22px] h-[22px] rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center">
        <Camera size={10} className="text-amber-500 fill-amber-500 [&>circle]:fill-black" aria-hidden="true" />
      </div>

      {/* Work title overlay at bottom — highly visible */}
      {title && (
        <div className="absolute bottom-2.5 left-3 right-3 z-10">
          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/95 truncate block drop-shadow-md">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── 3. Pin Variant (Work or Original) ───────────────────────────────────────

interface PinVariantProps {
  image?: string;
  pinnedTitle?: string;
  text?: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
  postId: string;
  artistId: string;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isOriginal?: boolean;
  themeGradient?: [string, string];
  pinnedWorkId?: string;
  pinnedOriginalId?: string;
}

const PinVariant: React.FC<PinVariantProps> = ({
  image,
  pinnedTitle,
  text,
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  resolvedWork,
  resolvedOriginal,
  isOriginal = false,
  themeGradient,
  pinnedWorkId,
  pinnedOriginalId,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
    postId={postId}
    artistId={artistId}
    text={text}
    themeGradient={themeGradient}
  >
    <PinMediaPreview
      image={image}
      title={pinnedTitle}
      resolvedWork={resolvedWork}
      resolvedOriginal={resolvedOriginal}
      isOriginal={isOriginal}
      themeGradient={themeGradient}
      pinnedWorkId={pinnedWorkId}
      pinnedOriginalId={pinnedOriginalId}
    />
  </CardLayout>
);

// ─── 4. Recommendation Variant ────────────────────────────────────────────────

interface RecommendationVariantProps {
  rec: Recommendation;
  text?: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
  postId: string;
  artistId: string;
  themeGradient?: [string, string];
}

const RecommendationVariant: React.FC<RecommendationVariantProps> = ({
  rec,
  text,
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  themeGradient,
}) => {
  return (
    <CardLayout
      artistName={artistName}
      artistImage={artistImage}
      postedAt={postedAt}
      postId={postId}
      artistId={artistId}
      themeGradient={themeGradient}
    >
      {text && (
        <div
          className="relative pl-3.5 py-0.5 mb-3"
          style={{ borderLeft: `2px solid ${themeGradient ? themeGradient[0] : "#F59E0B"}` }}
        >
          <p className="text-[15px] leading-[1.55] text-white/85 italic">
            "{text}"
          </p>
        </div>
      )}

      <div className="pointer-events-auto bg-[#0d0d0d] rounded-xl border border-white/5 shadow-sm overflow-hidden mb-3">
        <FeedRecommendationCard rec={rec} variant="wall-embed" />
      </div>
    </CardLayout>
  );
};

// ─── Root compound component ──────────────────────────────────────────────────

interface WallPostCardProps {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedRecommendation?: Recommendation;
  resolvedLedgerEntry?: LedgerItem;
  themeGradient?: [string, string];
  className?: string;
  /** Called when the card is tapped — parent opens the swiper */
  onClick?: () => void;
}

export const WallPostCard = memo<WallPostCardProps>(
  ({ post, resolvedWork, resolvedOriginal, resolvedRecommendation, resolvedLedgerEntry, themeGradient, className, onClick }) => {
    const isMobile = useMediaQuery();

    const pinnedImage: string | undefined =
      post.type === "PIN_WORK"
        ? resolvedWork?.image
        : post.type === "PIN_ORIGINAL"
        ? resolvedOriginal?.coverImage
        : undefined;

    const pinnedTitle: string | undefined =
      post.type === "PIN_WORK"
        ? resolvedWork?.title
        : post.type === "PIN_ORIGINAL"
        ? resolvedOriginal?.title
        : undefined;

    const cardContent = (
      <>
        {post.type === "LEDGER_ENTRY" && resolvedLedgerEntry && (
          <LedgerWallCard
            post={post}
            entry={resolvedLedgerEntry}
            onClick={onClick}
          />
        )}
        {post.type === "LINE" && (
          <LineVariant
            text={post.text!}
            artistName={post.artistName}
            artistImage={post.artistImage}
            postedAt={post.postedAt}
            postId={post.id}
            artistId={post.artistId}
            themeGradient={themeGradient}
          />
        )}
        {(post.type === "PIN_WORK" || post.type === "PIN_ORIGINAL") && (
          <PinVariant
            image={pinnedImage}
            pinnedTitle={pinnedTitle}
            text={post.text}
            artistName={post.artistName}
            artistImage={post.artistImage}
            postedAt={post.postedAt}
            postId={post.id}
            artistId={post.artistId}
            resolvedWork={resolvedWork}
            resolvedOriginal={resolvedOriginal}
            isOriginal={post.type === "PIN_ORIGINAL"}
            themeGradient={themeGradient}
            pinnedWorkId={post.pinnedWorkId}
            pinnedOriginalId={post.pinnedOriginalId}
          />
        )}
        {post.type === "RECOMMENDATION" && resolvedRecommendation && (
          <RecommendationVariant
            rec={resolvedRecommendation}
            text={post.text || resolvedRecommendation.notes}
            artistName={post.artistName}
            artistImage={post.artistImage}
            postedAt={post.postedAt}
            postId={post.id}
            artistId={post.artistId}
            themeGradient={themeGradient}
          />
        )}
      </>
    );

    // LEDGER_ENTRY has its own self-contained layout — bypass the standard motion wrapper
    if (post.type === "LEDGER_ENTRY") {
      return <>{cardContent}</>;
    }

    return (
      <motion.div
        className={`
          relative select-none
          py-2 md:py-0
          md:rounded-xl md:overflow-hidden
          md:bg-[#0d0d0d] md:border md:border-white/[0.06]
          md:shadow-[0_4px_24px_rgba(0,0,0,0.5)]
          ${onClick ? "cursor-pointer" : "cursor-default"}
          ${className ?? ""}
        `}
        onClick={onClick}
        whileHover={
          isMobile || !onClick
            ? undefined
            : {
                rotate: 0,
                scale: 1.02,
                boxShadow: "0 8px_40px_rgba(0,0,0,0.7)",
                transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
              }
        }
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{
          rotate: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
          scale: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
        }}
        role="article"
        aria-label={
          post.type === "LINE"
            ? `Line by ${post.artistName}`
            : `Pin by ${post.artistName}: ${pinnedTitle ?? ""}`
        }
      >
        {cardContent}
      </motion.div>
    );
  }
);

WallPostCard.displayName = "WallPostCard";
