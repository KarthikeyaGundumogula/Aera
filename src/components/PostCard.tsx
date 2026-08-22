import React, { memo, useState } from "react";
import { motion } from "motion/react";
import { Camera, Bookmark, Heart, Play } from "lucide-react";
import { WallPost } from "../types/wall";
import { TheatreItem } from "../types/theatre";
import { Recommendation, MOCK_RECOMMENDATIONS } from "../mock/recommendations";
import { FeedRecommendationCard } from "./FeedRecommendationCard";
import { Original } from "../types/originals";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ReactionAction } from "./actions/ReactionAction";
import { ReactionId } from "../types/reactions";
import { useNavigate } from "react-router-dom";
import { useWorkNavigation } from "../hooks/useWorkNavigation";
import { ShareAction } from "./actions/ShareAction";
import { LedgerItem } from "../mock/ledger";
import { LedgerWallCard } from "../features/profile/components/LedgerWallCard";
import { SpiritIcon } from "./icons/AppIcons";
import { ARTISTS_MOCK, GRID_ITEMS } from "../mock";
import { EmbeddedWorkBox } from "./EmbeddedWorkBox";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function generateStat(id: string | number, multiplier: number, offset: number = 0): number {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return (Math.abs(hash) % multiplier) + offset;
}

function formatStat(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export interface ArtistOverride {
  id?: string;
  name?: string;
  image?: string;
  handle?: string;
  followersCount?: number;
  spirit?: number;
}

// ─── Shared Layout Container ──────────────────────────────────────────────────

interface CardLayoutProps {
  artistName: string;
  artistImage: string;
  postedAt: string;
  postId: string;
  artistId: string;
  artistHandle?: string;
  text?: string;
  quoteHeader?: string;
  themeGradient?: [string, string];
  hideReactions?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
  children?: React.ReactNode;
}

const CardLayout: React.FC<CardLayoutProps> = ({
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  artistHandle,
  text,
  quoteHeader,
  themeGradient,
  hideReactions = false,
  isSaved: externalSaved,
  onToggleSave,
  children,
}) => {
  const [activeReaction, setActiveReaction] = useState<ReactionId | null>(null);
  const [internalSaved, setInternalSaved] = useState(false);
  const navigate = useNavigate();

  const saved = externalSaved !== undefined ? externalSaved : internalSaved;

  const viewsCount = artistName.length * 142 + 340;
  const reactionsCount = artistName.length * 12 + 15;

  const artistObj = ARTISTS_MOCK.find(
    (a) => a.id === artistId || a.name.toLowerCase() === artistName.toLowerCase()
  );
  const followersCount =
    (artistObj as any)?.followersCount ??
    generateStat(artistId || artistName || "a", 30000, 5000);
  const spiritCount =
    artistObj?.spirit ?? generateStat(artistId || artistName || "a", 2000, 500);

  const displayHandle =
    artistHandle ||
    (artistObj as any)?.handle ||
    `//${artistName.toUpperCase().replace(/\s+/g, "_")}`;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave();
    } else {
      setInternalSaved(!internalSaved);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-4 gap-3">
      {/* Header: Avatar + Name/Handle/Metrics (Left) & Timing (Right) */}
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={artistImage}
            alt={artistName}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${artistId}`);
            }}
            className="w-10 h-10 rounded-xl object-cover object-top border border-white/10 shadow-sm shrink-0 cursor-pointer hover:border-amber-500/50 transition-colors"
          />
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${artistId}`);
                }}
                className="text-[11px] font-black uppercase tracking-[0.15em] text-white/90 truncate leading-tight cursor-pointer hover:text-white transition-colors"
              >
                {artistName}
              </span>
              <span className="text-[9px] font-mono text-white/40 truncate">
                {displayHandle}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 mt-1 leading-tight">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-white/40" />
                {formatStat(followersCount)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <SpiritIcon className="w-3 h-3 text-white/70" />
                {spiritCount}
              </span>
            </div>
          </div>
        </div>

        {/* Timing on top right corner */}
        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 shrink-0 pt-0.5">
          {formatRelativeTime(postedAt)}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col w-full min-w-0">
        {/* Main Post Text / Quote */}
        {text && (
          <div
            className={children ? "mb-3 relative pl-3.5 py-0.5" : ""}
            style={
              children
                ? {
                    borderLeft: `2px solid ${
                      themeGradient ? themeGradient[0] : "#F59E0B"
                    }`,
                  }
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

        {/* Attached Media */}
        {children && <div className="mt-3 w-full">{children}</div>}

        {/* Unified Action Row: Reaction + Save + Share */}
        {!hideReactions && (
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
              onClick={handleSaveToggle}
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
        )}
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
  artistHandle?: string;
  themeGradient?: [string, string];
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const LineVariant: React.FC<LineVariantProps> = ({
  text,
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  artistHandle,
  themeGradient,
  isSaved,
  onToggleSave,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
    postId={postId}
    artistId={artistId}
    artistHandle={artistHandle}
    text={text}
    themeGradient={themeGradient}
    isSaved={isSaved}
    onToggleSave={onToggleSave}
  />
);

// ─── 2. Pin Media Preview ────────────────────────────────────────────────────

interface PinMediaPreviewProps {
  image?: string;
  title?: string;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isOriginal?: boolean;
  themeGradient?: [string, string];
  pinnedWorkId?: string;
  pinnedOriginalId?: string;
  hideReactions?: boolean;
}

const PinMediaPreview: React.FC<PinMediaPreviewProps> = ({
  image,
  title,
  resolvedWork,
  resolvedOriginal,
  isOriginal = false,
  pinnedWorkId,
  pinnedOriginalId,
  hideReactions = false,
}) => {
  const navigate = useNavigate();

  if (resolvedWork || (!isOriginal && pinnedWorkId)) {
    return (
      <div className="w-full">
        <EmbeddedWorkBox
          work={resolvedWork}
          workId={pinnedWorkId}
          variant="default"
          showCameraPin={!hideReactions}
        />
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resolvedOriginal) {
      navigate(`/originals/${resolvedOriginal.id}`);
    } else if (pinnedOriginalId) {
      navigate(`/originals/${pinnedOriginalId}`);
    }
  };

  const displayImage = image || resolvedOriginal?.coverImage;
  const displayTitle = title || resolvedOriginal?.title;

  return (
    <div
      onClick={handleClick}
      className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 cursor-pointer group/pin hover:opacity-95 transition-opacity"
    >
      {displayImage ? (
        <img
          src={displayImage}
          alt={displayTitle ?? "Pinned item"}
          className="w-full h-auto max-h-[360px] object-cover object-center group-hover/pin:scale-[1.01] transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-white/5 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
            Original
          </span>
        </div>
      )}

      {/* Cinematic gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Pin badge — top-left */}
      {!hideReactions && (
        <div className="absolute top-3 left-3 z-20 w-7 h-7 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center">
          <Camera size={12} className="text-amber-500 fill-amber-500 [&>circle]:fill-black" aria-hidden="true" />
        </div>
      )}

      {/* Category chip for Originals */}
      <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
          Original
        </span>
      </div>

      {/* Work Title overlay at bottom-left */}
      {displayTitle && (
        <div className="absolute bottom-3 left-4 right-4 z-10">
          <span className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.15em] text-white truncate block drop-shadow-md">
            {displayTitle}
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
  artistHandle?: string;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isOriginal?: boolean;
  themeGradient?: [string, string];
  pinnedWorkId?: string;
  pinnedOriginalId?: string;
  hideReactions?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
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
  artistHandle,
  resolvedWork,
  resolvedOriginal,
  isOriginal = false,
  themeGradient,
  pinnedWorkId,
  pinnedOriginalId,
  hideReactions,
  isSaved,
  onToggleSave,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
    postId={postId}
    artistId={artistId}
    artistHandle={artistHandle}
    text={text}
    themeGradient={themeGradient}
    hideReactions={hideReactions}
    isSaved={isSaved}
    onToggleSave={onToggleSave}
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
      hideReactions={hideReactions}
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
  artistHandle?: string;
  themeGradient?: [string, string];
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const RecommendationVariant: React.FC<RecommendationVariantProps> = ({
  rec,
  text,
  artistName,
  artistImage,
  postedAt,
  postId,
  artistId,
  artistHandle,
  themeGradient,
  isSaved,
  onToggleSave,
}) => {
  return (
    <CardLayout
      artistName={artistName}
      artistImage={artistImage}
      postedAt={postedAt}
      postId={postId}
      artistId={artistId}
      artistHandle={artistHandle}
      themeGradient={themeGradient}
      isSaved={isSaved}
      onToggleSave={onToggleSave}
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

// ─── Root Shared Component: PostCard ──────────────────────────────────────────

export interface PostCardProps {
  post: WallPost;
  artistOverride?: ArtistOverride;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedRecommendation?: Recommendation;
  resolvedLedgerEntry?: LedgerItem;
  themeGradient?: [string, string];
  className?: string;
  hideReactions?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onClick?: () => void;
}

export const PostCard = memo<PostCardProps>(
  ({
    post,
    artistOverride,
    resolvedWork,
    resolvedOriginal,
    resolvedRecommendation,
    resolvedLedgerEntry,
    themeGradient,
    className,
    hideReactions,
    isSaved,
    onToggleSave,
    onClick,
  }) => {
    const isMobile = useMediaQuery();

    const artistName = artistOverride?.name || post.artistName;
    const artistImage = artistOverride?.image || post.artistImage;
    const artistId = artistOverride?.id || post.artistId;
    const artistHandle = artistOverride?.handle;

    const effectiveWork =
      resolvedWork ||
      (post.pinnedWorkId
        ? GRID_ITEMS.find((w) => String(w.id) === String(post.pinnedWorkId))
        : undefined);

    const effectiveRecommendation =
      resolvedRecommendation ||
      (post.pinnedRecommendationId
        ? MOCK_RECOMMENDATIONS.find((r) => String(r.id) === String(post.pinnedRecommendationId))
        : undefined) ||
      (post.type === "RECOMMENDATION" ? MOCK_RECOMMENDATIONS[0] : undefined);

    const pinnedImage: string | undefined =
      effectiveWork?.image ||
      (post.type === "PIN_ORIGINAL" ? resolvedOriginal?.coverImage : undefined);

    const pinnedTitle: string | undefined =
      effectiveWork?.title ||
      (post.type === "PIN_ORIGINAL" ? resolvedOriginal?.title : undefined);

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
            artistName={artistName}
            artistImage={artistImage}
            postedAt={post.postedAt}
            postId={post.id}
            artistId={artistId}
            artistHandle={artistHandle}
            themeGradient={themeGradient}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
          />
        )}
        {(post.type === "PIN_WORK" || post.type === "PIN_ORIGINAL" || Boolean(effectiveWork)) &&
          post.type !== "RECOMMENDATION" &&
          post.type !== "LINE" &&
          post.type !== "LEDGER_ENTRY" && (
            <PinVariant
              image={pinnedImage}
              pinnedTitle={pinnedTitle}
              text={post.text}
              artistName={artistName}
              artistImage={artistImage}
              postedAt={post.postedAt}
              postId={post.id}
              artistId={artistId}
              artistHandle={artistHandle}
              resolvedWork={effectiveWork}
              resolvedOriginal={resolvedOriginal}
              isOriginal={post.type === "PIN_ORIGINAL"}
              themeGradient={themeGradient}
              pinnedWorkId={post.pinnedWorkId}
              pinnedOriginalId={post.pinnedOriginalId}
              hideReactions={hideReactions}
              isSaved={isSaved}
              onToggleSave={onToggleSave}
            />
          )}
        {post.type === "RECOMMENDATION" && effectiveRecommendation && (
          <RecommendationVariant
            rec={effectiveRecommendation}
            text={post.text || effectiveRecommendation.notes}
            artistName={artistName}
            artistImage={artistImage}
            postedAt={post.postedAt}
            postId={post.id}
            artistId={artistId}
            artistHandle={artistHandle}
            themeGradient={themeGradient}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
          />
        )}
      </>
    );

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
            ? `Line by ${artistName}`
            : `Pin by ${artistName}: ${pinnedTitle ?? ""}`
        }
      >
        {cardContent}
      </motion.div>
    );
  }
);

PostCard.displayName = "PostCard";
