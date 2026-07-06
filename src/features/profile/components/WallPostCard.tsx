import React, { memo, useMemo } from "react";
import { motion } from "motion/react";
import { Pin } from "lucide-react";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { Original } from "../../../types/originals";
import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

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

/**
 * Generates a deterministic tilt in degrees from a post ID string.
 * Same card → same tilt every time, so it feels physically pinned.
 */
function getTiltDegrees(id: string): number {
  const hash = id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const raw = (hash % 29) / 10 - 1.4;
  return raw < 0 ? raw - 0.4 : raw + 0.4;
}

// ─── Shared header row ───────────────────────────────────────────────────────

interface PostHeaderProps {
  artistName: string;
  artistImage: string;
  postedAt: string;
}

const PostHeader: React.FC<PostHeaderProps> = ({ artistName, artistImage, postedAt }) => (
  <div className="flex items-center gap-2.5 px-4 pt-4 pb-0">
    <img
      src={artistImage}
      alt={artistName}
      className="w-7 h-7 rounded-md object-cover object-top flex-shrink-0 border border-white/10"
    />
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 flex-1 truncate">
      {artistName}
    </span>
    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 flex-shrink-0">
      {formatRelativeTime(postedAt)}
    </span>
  </div>
);

// ─── 1. Pure Line Variant ─────────────────────────────────────────────────────

interface LineVariantProps {
  text: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
}

const LineVariant: React.FC<LineVariantProps> = ({
  text,
  artistName,
  artistImage,
  postedAt,
}) => (
  <div className="flex flex-col">
    <PostHeader artistName={artistName} artistImage={artistImage} postedAt={postedAt} />
    {/* Conversational line — no oversized quote marks, tweet-like */}
    <p className="px-4 pt-3 pb-4 text-[15px] leading-[1.55] font-normal text-white/85">
      {text}
    </p>
  </div>
);

// ─── 2. Pin Media Preview ────────────────────────────────────────────────────

interface PinMediaPreviewProps {
  image?: string;
  title?: string;
  /** The resolved TheatreItem — needed for CategoryBadge */
  resolvedWork?: TheatreItem;
  isOriginal?: boolean;
}

const PinMediaPreview: React.FC<PinMediaPreviewProps> = ({
  image,
  title,
  resolvedWork,
  isOriginal = false,
}) => (
  <div className="relative w-full aspect-video overflow-hidden">
    {image ? (
      <img
        src={image}
        alt={title ?? "Pinned work"}
        className="w-full h-full object-cover object-top"
        loading="lazy"
      />
    ) : (
      <div className="w-full h-full bg-white/5 flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
          {isOriginal ? "Original" : "Work"}
        </span>
      </div>
    )}

    {/* Cinematic gradient — darkens bottom for text contrast */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

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

    {/* Pin icon — top-left corner (amber) */}
    <div className="absolute top-2.5 left-2.5 z-20">
      <Pin size={11} className="text-amber-500 fill-amber-500 drop-shadow-sm" aria-hidden="true" />
    </div>

    {/* Work title overlay at bottom */}
    {title && (
      <div className="absolute bottom-2 left-8 right-8">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/60 truncate block">
          {title}
        </span>
      </div>
    )}
  </div>
);

// ─── 3. Pin Variant (Work or Original) ───────────────────────────────────────

interface PinVariantProps {
  image?: string;
  pinnedTitle?: string;
  text?: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
  resolvedWork?: TheatreItem;
  isOriginal?: boolean;
}

const PinVariant: React.FC<PinVariantProps> = ({
  image,
  pinnedTitle,
  text,
  artistName,
  artistImage,
  postedAt,
  resolvedWork,
  isOriginal = false,
}) => (
  <div className="flex flex-col">
    {/* Media fills the top — no padding, edge-to-edge */}
    <PinMediaPreview
      image={image}
      title={pinnedTitle}
      resolvedWork={resolvedWork}
      isOriginal={isOriginal}
    />

    {/* PINNED BY attribution */}
    <div className="flex items-center gap-2 px-3 pt-3">
      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-500/70">
        Pinned by
      </span>
      <img
        src={artistImage}
        alt={artistName}
        className="w-5 h-5 rounded-[4px] object-cover object-top border border-white/10"
      />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 truncate flex-1">
        {artistName}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 flex-shrink-0">
        {formatRelativeTime(postedAt)}
      </span>
    </div>

    {/* Optional artist Line */}
    {text && (
      <>
        <div className="mx-3 mt-2.5 h-px bg-amber-500/20" />
        <p className="px-3 pt-2.5 pb-4 text-[14px] leading-[1.55] font-normal text-white/75">
          {text}
        </p>
      </>
    )}

    {!text && <div className="pb-3" />}
  </div>
);

// ─── 4. Foyer Wrapper ─────────────────────────────────────────────────────────

interface FoyerWrapperProps {
  artistName: string;
  children: React.ReactNode;
}

const FoyerWrapper: React.FC<FoyerWrapperProps> = ({ artistName, children }) => (
  <div>
    <div
      className="flex items-center gap-2 px-3 py-2 border-l-2 border-amber-500"
      style={{ backgroundColor: "rgba(245, 158, 11, 0.08)" }}
    >
      <Pin size={10} className="text-amber-500 fill-amber-500 flex-shrink-0" aria-hidden="true" />
      <span className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-400">
        From {artistName}'s Wall
      </span>
    </div>
    {children}
  </div>
);

// ─── Root compound component ──────────────────────────────────────────────────

export interface WallPostCardProps {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  inFoyer?: boolean;
  className?: string;
  /** Called when the card is tapped — parent opens the swiper */
  onClick?: () => void;
}

export const WallPostCard = memo<WallPostCardProps>(
  ({ post, resolvedWork, resolvedOriginal, inFoyer = false, className, onClick }) => {
    const isMobile = useMediaQuery();
    const tilt = useMemo(() => getTiltDegrees(post.id), [post.id]);

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
        {post.type === "LINE" && (
          <LineVariant
            text={post.text!}
            artistName={post.artistName}
            artistImage={post.artistImage}
            postedAt={post.postedAt}
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
            resolvedWork={resolvedWork}
            isOriginal={post.type === "PIN_ORIGINAL"}
          />
        )}
      </>
    );

    return (
      <motion.div
        className={`
          relative cursor-pointer select-none
          py-2 md:py-0
          md:rounded-xl md:overflow-hidden
          md:bg-[#0d0d0d] md:border md:border-white/[0.06]
          md:shadow-[0_4px_24px_rgba(0,0,0,0.5)]
          ${className ?? ""}
        `}
        style={{ rotate: (inFoyer || isMobile) ? 0 : tilt }}
        onClick={onClick}
        whileHover={
          isMobile
            ? undefined
            : {
                rotate: 0,
                scale: 1.02,
                boxShadow: "0 8px_40px_rgba(0,0,0,0.7)",
                transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
              }
        }
        whileTap={{ scale: 0.98 }}
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
        {inFoyer ? (
          <FoyerWrapper artistName={post.artistName}>{cardContent}</FoyerWrapper>
        ) : (
          cardContent
        )}
      </motion.div>
    );
  }
);

WallPostCard.displayName = "WallPostCard";
