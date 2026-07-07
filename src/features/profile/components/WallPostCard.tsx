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

// ─── Shared Twitter-style Layout ──────────────────────────────────────────────

interface CardLayoutProps {
  artistName: string;
  artistImage: string;
  postedAt: string;
  text?: string;
  themeGradient?: [string, string];
  children?: React.ReactNode;
}

const CardLayout: React.FC<CardLayoutProps> = ({
  artistName,
  artistImage,
  postedAt,
  text,
  themeGradient,
  children,
}) => (
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
        <div className="rounded-[10px] overflow-hidden border border-white/10 bg-white/[0.02] shadow-sm">
          {children}
        </div>
      )}
    </div>
  </div>
);

// ─── 1. Pure Line Variant ─────────────────────────────────────────────────────

interface LineVariantProps {
  text: string;
  artistName: string;
  artistImage: string;
  postedAt: string;
  themeGradient?: [string, string];
}

const LineVariant: React.FC<LineVariantProps> = ({
  text,
  artistName,
  artistImage,
  postedAt,
  themeGradient,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
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
  isOriginal?: boolean;
  themeGradient?: [string, string];
}

const PinMediaPreview: React.FC<PinMediaPreviewProps> = ({
  image,
  title,
  resolvedWork,
  isOriginal = false,
  themeGradient,
}) => (
  <div className="relative w-full aspect-video overflow-hidden bg-[#0a0a0a]">
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
      <Pin size={10} className="text-amber-500 fill-amber-500" aria-hidden="true" />
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
  themeGradient?: [string, string];
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
  themeGradient,
}) => (
  <CardLayout
    artistName={artistName}
    artistImage={artistImage}
    postedAt={postedAt}
    text={text}
    themeGradient={themeGradient}
  >
    <PinMediaPreview
      image={image}
      title={pinnedTitle}
      resolvedWork={resolvedWork}
      isOriginal={isOriginal}
      themeGradient={themeGradient}
    />
  </CardLayout>
);

// ─── 4. Foyer Wrapper ─────────────────────────────────────────────────────────

interface FoyerWrapperProps {
  artistName: string;
  themeGradient?: [string, string];
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
  themeGradient?: [string, string];
  className?: string;
  /** Called when the card is tapped — parent opens the swiper */
  onClick?: () => void;
}

export const WallPostCard = memo<WallPostCardProps>(
  ({ post, resolvedWork, resolvedOriginal, inFoyer = false, themeGradient, className, onClick }) => {
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
            resolvedWork={resolvedWork}
            isOriginal={post.type === "PIN_ORIGINAL"}
            themeGradient={themeGradient}
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
          <FoyerWrapper artistName={post.artistName} themeGradient={themeGradient}>
            {cardContent}
          </FoyerWrapper>
        ) : (
          cardContent
        )}
      </motion.div>
    );
  }
);

WallPostCard.displayName = "WallPostCard";
