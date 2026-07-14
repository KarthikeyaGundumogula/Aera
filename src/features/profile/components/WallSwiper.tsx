import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as motionAnimate,
  type MotionValue,
} from "motion/react";
import {
  X,
  ChevronRight,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { Original } from "../../../types/originals";
import { Recommendation } from "../../../mock/recommendations";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { buildEmbedUrl } from "../../../utils/embed";
import { StarAction } from "../../../components/actions/StarAction";
import { SaveAction } from "../../../components/actions/SaveAction";
import { FeedRecommendationCard } from "../../../components/FeedRecommendationCard";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { FHLoader } from "../../../components/FHLoader";

function AvatarFallback({ className }: { className: string }) {
  const baseClasses = className
    .replace(/object-cover|object-top|border-white\/[0-9]+|shadow-[^ ]+/g, "")
    .trim();
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-white/6 border border-white/15 shadow-xl transition-transform ${baseClasses}`}
    >
      <div className="absolute inset-[15%] rounded-[9px] border border-white/10" />
      <div className="relative flex items-center gap-[2px] text-[11px] font-black uppercase tracking-tight text-white">
        <span>F</span>
        <span className="text-white/45">H</span>
      </div>
    </div>
  );
}

function AvatarImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className: string;
}) {
  const [error, setError] = useState(!src);
  if (error) return <AvatarFallback className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      onError={() => setError(true)}
    />
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Inline action row (Honour + Share + Open Exhibition) ────────────────────

interface WorkActionsProps {
  item: TheatreItem;
  onNavigate: () => void;
}

function WorkActions({ item, onNavigate }: WorkActionsProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="flex items-center justify-between w-full pt-2 relative z-[310]">
      {/* Original Artist Info */}
      <div className="flex items-center gap-2 cursor-pointer group">
        {item.artistAvatar ? (
          <img
            src={item.artistAvatar}
            alt={item.artist || ""}
            className="w-7 h-7 rounded-xl object-cover object-top border border-white/10 group-hover:border-white/30 transition-colors shrink-0"
            draggable={false}
          />
        ) : (
          <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-black uppercase text-white/50 shrink-0">
            {item.artist ? item.artist.substring(0, 2) : "FH"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/90 group-hover:text-white transition-colors">
            {item.artist || "Framehouse Artist"}
          </span>
          <span className="text-[8px] font-medium text-white/40 uppercase tracking-widest">
            Original Creator
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <StarAction
          isActive={isStarred}
          onClick={(e) => {
            e?.stopPropagation();
            setIsStarred(!isStarred);
          }}
          variant="exhibition"
        />
        <SaveAction
          isActive={isSaved}
          onClick={(e) => {
            e?.stopPropagation();
            setIsSaved(!isSaved);
          }}
          variant="exhibition"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
          className="h-8 px-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center"
        >
          View
        </button>
      </div>
    </div>
  );
}

// ─── Inline Edit embed (YouTube / Twitter) ───────────────────────────────────

interface EditEmbedProps {
  item: TheatreItem;
  isActive: boolean;
  onNavigate: () => void;
}

function EditEmbed({ item, isActive, onNavigate }: EditEmbedProps) {
  const isYoutube = item.platform === "youtube";
  const [ytLoaded, setYtLoaded] = useState(false);
  const { containerRef: twitterRef, isLoaded: twitterLoaded } =
    useTwitterWidgets(
      !isYoutube && item.srcId ? item.srcId : undefined,
      isActive,
    );
  const isLoaded = isYoutube ? ytLoaded : twitterLoaded;
  const embedUrl =
    isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className={`relative w-full ${isYoutube ? "aspect-video" : ""} rounded-xl overflow-hidden bg-black/40`}
      >
        {!isLoaded && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-xl pointer-events-none">
            <FHLoader label="Loading" />
          </div>
        )}
        {isActive &&
          (isYoutube ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-none relative z-[310] pointer-events-auto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={item.title}
              loading="lazy"
              onLoad={() => setYtLoaded(true)}
            />
          ) : (
            <div className="w-full flex justify-center py-2 relative z-[310] pointer-events-auto">
              <div ref={twitterRef} className="w-full max-w-[540px]" />
            </div>
          ))}
        {!isActive && (
          <div className="w-full aspect-video bg-black/40 rounded-xl" />
        )}
      </div>
      <div className="w-full pointer-events-auto">
        <WorkActions item={item} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ─── Cover card (Poster / Script / Recommendation) ───────────────────────────

interface CoverCardProps {
  item: TheatreItem;
  onNavigate: () => void;
}

function CoverCard({ item, onNavigate }: CoverCardProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="group relative w-full block aspect-[4/5] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] pointer-events-none">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title || ""}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
              {item.category}
            </span>
          </div>
        )}
      </div>
      <div className="w-full pointer-events-auto">
        <WorkActions item={item} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ─── Full-screen Line viewer ──────────────────────────────────────────────────

const LineFull: React.FC<{ post: WallPost }> = ({ post }) => (
  <div className="flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto px-8 text-center gap-6 pointer-events-none">
    <AvatarImage
      src={post.artistImage}
      alt={post.artistName}
      className="w-12 h-12 rounded-xl object-cover object-top border border-white/15 shrink-0"
    />
    <p className="text-[18px] sm:text-[22px] leading-[1.6] font-normal text-white/90">
      {post.text}
    </p>
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
        {post.artistName}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20">
        {formatRelativeTime(post.postedAt)}
      </span>
    </div>
  </div>
);

// ─── Full-screen Pin viewer ───────────────────────────────────────────────────

interface PinFullProps {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isActive: boolean;
  onClose: () => void;
}

const PinFull: React.FC<PinFullProps> = ({
  post,
  resolvedWork,
  resolvedOriginal,
  isActive,
  onClose,
}) => {
  const navigate = useNavigate();

  const openExhibition = useCallback(
    (item: TheatreItem) => {
      onClose();
      navigate(`/works/${item.id}`, { state: { item } });
    },
    [navigate, onClose],
  );

  if (post.type === "PIN_WORK" && resolvedWork) {
    const isEdit =
      !resolvedWork.category ||
      resolvedWork.category === "Edit" ||
      resolvedWork.category === "Call";
    return (
      <div className="w-full flex flex-col gap-4 max-w-[700px] mx-auto pointer-events-none">
        <div className="w-full text-left px-1 pointer-events-none mb-1">
          <h2 className="text-[20px] sm:text-[24px] font-black uppercase tracking-tight text-white leading-none">
            {resolvedWork.title || "Untitled"}
          </h2>
          {resolvedWork.category && (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2 block">
              {resolvedWork.category}
            </span>
          )}
        </div>

        {isEdit ? (
          <EditEmbed
            item={resolvedWork}
            isActive={isActive}
            onNavigate={() => openExhibition(resolvedWork)}
          />
        ) : (
          <CoverCard
            item={resolvedWork}
            onNavigate={() => openExhibition(resolvedWork)}
          />
        )}

        {post.text && (
          <div className="flex flex-col items-start gap-1.5 px-1 py-0.5 border-l-2 border-amber-500 pl-3 pointer-events-none mt-2">
            <p className="text-[14px] sm:text-[15px] leading-[1.6] text-white/80 italic">
              "{post.text}"
            </p>
          </div>
        )}
      </div>
    );
  }

  // PIN_ORIGINAL or unresolved
  const image = resolvedWork?.image ?? resolvedOriginal?.coverImage;
  const title = resolvedWork?.title ?? resolvedOriginal?.title;

  return (
    <div className="w-full flex flex-col gap-4 px-4 max-w-[700px] mx-auto pointer-events-none">
      <div className="w-full text-left px-1 mb-1">
        <h2 className="text-[20px] sm:text-[24px] font-black uppercase tracking-tight text-white leading-none">
          {title || "Untitled"}
        </h2>
      </div>
      {image && (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
          <img
            src={image}
            alt={title ?? "Pinned"}
            className="w-full h-auto object-cover object-top"
            draggable={false}
          />
        </div>
      )}
      {post.text && (
        <div className="w-full flex flex-col items-start gap-1.5 px-1 py-0.5 border-l-2 border-amber-500 pl-3 pointer-events-none mt-2 text-left">
          <p className="text-[14px] sm:text-[15px] leading-[1.6] text-white/80 italic">
            "{post.text}"
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Full-screen Recommendation viewer ────────────────────────────────────────

const RecommendationFull: React.FC<{ post: WallPost; rec?: Recommendation }> = ({
  post,
  rec,
}) => {
  const navigate = useNavigate();

  if (!rec) return null;

  return (
    <div className="w-full flex flex-col gap-6 px-4 max-w-[500px] mx-auto">
      {/* Use the exact Feed recommendation card but visually isolate it */}
      <div className="pointer-events-auto bg-[#0d0d0d] rounded-xl border border-white/5 shadow-2xl p-1 overflow-hidden">
        <FeedRecommendationCard rec={rec} variant="wall-embed" />
      </div>

      {post.text && (
        <div className="w-full flex flex-col items-start gap-1.5 px-1 py-0.5 border-l-2 border-amber-500 pl-3 mt-1 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 opacity-80 mb-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              Quoted by {post.artistName}
            </span>
          </div>
          <p className="text-[14px] sm:text-[15px] leading-[1.6] text-white/80 italic">
            "{post.text}"
          </p>
        </div>
      )}

      {/* Subtle view option */}
      <button
        onClick={(e) => {
          e.stopPropagation();
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
          navigate(`/works/rec-${rec.id}`, { state: { item: theatreItem } });
        }}
        className="mx-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/60 hover:text-white text-xs font-black uppercase tracking-widest transition-all pointer-events-auto"
      >
        <span>View Exhibition</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ total: number; current: number }> = ({
  total,
  current,
}) => {
  if (total <= 1) return null;
  const maxDots = 7;
  const dots = Math.min(total, maxDots);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: dots }).map((_, i) => {
        const isActive =
          dots === total
            ? i === current
            : i === Math.round((current / (total - 1)) * (dots - 1));
        return (
          <div
            key={i}
            className={`rounded-xl transition-all duration-200 ${
              isActive ? "w-4 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/20"
            }`}
          />
        );
      })}
    </div>
  );
};

// ─── WallSwiper ───────────────────────────────────────────────────────────────

export interface WallSwiperEntry {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedRecommendation?: Recommendation;
}

export interface WallSwiperArtistGroup {
  artistId: string;
  artistName: string;
  artistImage: string;
  entries: WallSwiperEntry[];
  hasMore: boolean;
}

interface WallSwiperProps {
  groups: WallSwiperArtistGroup[];
  initialGroupIndex: number;
  initialPostIndices?: Record<string, number>;
  onFetchOlder?: (artistId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * WallSwiper — Full-screen story-like viewer for Wall posts.
 *
 * Swipe architecture: "treadmill" pattern.
 * - Three slides are always in the DOM at fixed positions: -100%, 0%, +100%.
 * - A shared `dragX` MotionValue tracks the live drag offset (always ~0 at rest).
 * - On drag-end, if threshold is met we commit the group change and reset dragX
 *   to 0 in the same tick — so the spring NEVER fights an accumulated offset.
 * - This is how Instagram Stories, TikTok, and Reddit's image-viewer handle
 *   infinite swipe without performance degradation.
 */
export function WallSwiper({
  groups,
  initialGroupIndex,
  initialPostIndices = {},
  onFetchOlder,
  onClose,
}: WallSwiperProps) {
  const navigate = useNavigate();

  // Normalised index: always in [0, groups.length)
  const [groupIndex, setGroupIndex] = useState(
    ((initialGroupIndex % groups.length) + groups.length) % groups.length,
  );

  // Track which post we are on for each artist group
  const [postIndices, setPostIndices] =
    useState<Record<string, number>>(initialPostIndices);

  const [isFetching, setIsFetching] = useState(false);

  // Treadmill drag value — always resets to 0 after each committed swipe.
  const dragX = useMotionValue(0);

  // Whether a group-level transition is currently animating (lock-out guard).
  const isTransitioning = useRef(false);

  // Raw gesture tracking — owns pointer events directly so we can
  // unambiguously distinguish a TAP (tiny movement, quick release)
  // from a SWIPE (large movement or high velocity).
  const gesture = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    lastX: number;
    lastDx: number;   // movement since last pointermove (for velocity)
    lastTs: number;   // timestamp of last pointermove
    active: boolean;
    isDrag: boolean;  // true once pointer moves past 6px threshold
  } | null>(null);

  const W = typeof window !== "undefined" ? window.innerWidth : 390;
  const SWIPE_THRESHOLD = W * 0.22; // 22% of screen width
  const VELOCITY_THRESHOLD = 380;   // px/s

  const wrap = (idx: number) =>
    ((idx % groups.length) + groups.length) % groups.length;

  const activeGroup = groups[groupIndex];
  const prevGroup = groups[wrap(groupIndex - 1)];
  const nextGroup = groups[wrap(groupIndex + 1)];

  const activePostIndex = postIndices[activeGroup.artistId] || 0;
  const isShowingOlderCard = activePostIndex === activeGroup.entries.length;

  // Animate dragX to a target then commit the index change and snap back to 0.
  const commitGroupChange = useCallback(
    (dir: number) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;

      const target = -dir * W;
      motionAnimate(dragX, target, {
        type: "spring",
        stiffness: 380,
        damping: 36,
        mass: 0.9,
        onComplete: () => {
          // Snap x to 0 *before* React re-renders the new index so the
          // incoming slide is already in position — no visible jump.
          dragX.set(0);
          setGroupIndex((prev) => wrap(prev + dir));
          isTransitioning.current = false;
        },
      });
    },
    [dragX, W, wrap],
  );

  const paginateGroup = useCallback(
    (dir: number) => commitGroupChange(dir),
    [commitGroupChange],
  );

  // Declared before handleTap so it can be referenced in the tap handler.
  const fetchOlder = useCallback(async () => {
    if (!onFetchOlder || isFetching) return;
    setIsFetching(true);
    await onFetchOlder(activeGroup.artistId);
    setIsFetching(false);
  }, [onFetchOlder, isFetching, activeGroup.artistId]);

  const handleTap = useCallback(
    (dir: number) => {
      setPostIndices((prev) => {
        const current = prev[activeGroup.artistId] || 0;
        const next = current + dir;

        const isOnOlderCard = current === activeGroup.entries.length;

        // ── Tapping RIGHT on the "older posts" card → fetch more posts
        if (dir === 1 && isOnOlderCard) {
          fetchOlder();
          return prev; // postIndex stays at older-card position until posts load
        }

        // ── Tap LEFT at post 0 → go to previous artist, land on their last post
        if (next < 0) {
          const target = groups[wrap(groupIndex - 1)];
          const landingIdx = Math.max(0, target.entries.length - 1);
          paginateGroup(-1);
          return { ...prev, [target.artistId]: landingIdx };
        }

        // ── Tap RIGHT past the "older" card → next artist, post 0
        if (next > activeGroup.entries.length) {
          const target = groups[wrap(groupIndex + 1)];
          paginateGroup(1);
          return { ...prev, [target.artistId]: 0 };
        }

        // ── Tap RIGHT at the last post when no older → next artist, post 0
        if (next === activeGroup.entries.length && !activeGroup.hasMore) {
          const target = groups[wrap(groupIndex + 1)];
          paginateGroup(1);
          return { ...prev, [target.artistId]: 0 };
        }

        return { ...prev, [activeGroup.artistId]: next };
      });
    },
    [activeGroup, groupIndex, groups, wrap, paginateGroup, fetchOlder],
  );

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleTap(1);
      else if (e.key === "ArrowLeft") handleTap(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [handleTap, onClose]);



  // Per-slide x MotionValues derived from the shared dragX.
  // Prev is at -W + drag, Current is at 0 + drag, Next is at +W + drag.
  const prevX = useTransform(dragX, (v) => -W + v);
  const currX = useTransform(dragX, (v) => v);
  const nextX = useTransform(dragX, (v) => W + v);

  // Scale/opacity for adjacent slides — gives depth cue while dragging.
  const prevScale = useTransform(dragX, [-W, 0], [1, 0.88]);
  const nextScale = useTransform(dragX, [0, W], [0.88, 1]);
  const prevOpacity = useTransform(dragX, [-W, -W * 0.3], [1, 0.3]);
  const nextOpacity = useTransform(dragX, [W * 0.3, W], [0.3, 1]);
  const currOpacity = useTransform(dragX, [-W * 0.4, 0, W * 0.4], [0.5, 1, 0.5]);

  // Slide renderer — used for all three treadmill slots.
  function SlideContent({
    group,
    xMotion,
    scaleMotion,
    opacityMotion,
    isActive,
  }: {
    group: WallSwiperArtistGroup;
    xMotion: MotionValue<number>;
    scaleMotion?: MotionValue<number>;
    opacityMotion?: MotionValue<number>;
    isActive: boolean;
  }) {
    const postIdx = postIndices[group.artistId] || 0;
    const isOlderCard = postIdx === group.entries.length;
    const entry = group.entries[postIdx];

    return (
      <motion.div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          x: xMotion,
          scale: scaleMotion,
          opacity: opacityMotion,
          touchAction: "pan-y",
        }}
      >
        <div
          className="absolute inset-0 w-full h-full flex flex-col px-4 pt-20 pb-16 overflow-y-auto overflow-x-hidden transform-gpu pointer-events-none"
        >
          <div className="w-full my-auto pointer-events-none shrink-0">
            {isOlderCard ? (
              <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto text-center gap-5 pointer-events-none my-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {isFetching ? (
                    <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                  ) : (
                    <ChevronRight className="w-7 h-7 text-white/50" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/90 mb-1.5">
                    Earlier posts
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed max-w-[220px] mx-auto">
                    These posts stay on {group.artistName}'s wall until they remove them.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchOlder();
                  }}
                  disabled={isFetching}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50 pointer-events-auto"
                >
                  {isFetching ? "Loading..." : "Load earlier posts"}
                </button>
              </div>
            ) : (
              entry &&
              (entry.post.type === "LINE" ? (
                <div className="w-full pointer-events-none">
                  <LineFull post={entry.post} />
                </div>
              ) : entry.post.type === "RECOMMENDATION" ? (
                <div className="w-full pointer-events-none">
                  <RecommendationFull
                    post={entry.post}
                    rec={entry.resolvedRecommendation}
                  />
                </div>
              ) : (
                <div className="w-full pointer-events-none">
                  <PinFull
                    post={entry.post}
                    resolvedWork={entry.resolvedWork}
                    resolvedOriginal={entry.resolvedOriginal}
                    isActive={isActive}
                    onClose={onClose}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return createPortal(
    <ModalWrapper isOpen={true} onClose={onClose} isImmersive={true}>
      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[300] w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Artist header */}
      <div className="fixed top-5 left-4 z-[300]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.artistId}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="flex items-center gap-2.5 cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              navigate(`/profile/${activeGroup.artistId}`);
            }}
          >
            <AvatarImage
              src={activeGroup.artistImage}
              alt={activeGroup.artistName}
              className="w-7 h-7 rounded-lg object-cover object-top border border-white/10 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                {activeGroup.artistName}
              </span>
              {!isShowingOlderCard && activeGroup.entries[activePostIndex] && (
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">
                  {activeGroup.entries[activePostIndex].post.type === "LINE"
                    ? "Line"
                    : "Pin"}{" "}
                  ·{" "}
                  {formatRelativeTime(
                    activeGroup.entries[activePostIndex].post.postedAt,
                  )}
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/*
       * Treadmill track — three fixed-position slots.
       * The shared dragX MotionValue drives all three via useTransform.
       * After each committed swipe, dragX snaps back to 0 and group content
       * is swapped — the spring never accumulates offset.
       *
       * Gesture system: raw pointer events own all input.
       * - onPointerDown: record start position + timestamp
       * - onPointerMove: live-update dragX for visual feedback;
       *                  mark as drag once movement exceeds 6px
       * - onPointerUp:
       *     • isDrag=false AND movement < 10px → TAP → handleTap
       *     • isDrag=true AND (distance > threshold OR velocity > threshold) → SWIPE
       *     • else → snap back to 0
       *
       * This pattern (used by Embla Carousel, Swiper.js, Reddit's viewer)
       * gives 100% reliable tap detection because we never depend on
       * Framer Motion's gesture recognizer to call onDragEnd for zero-movement events.
       */}
      <div
        className="fixed inset-0 w-full h-[100dvh] overflow-hidden cursor-pointer select-none"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => {
          // Don't intercept clicks on interactive elements (buttons, links, etc.).
          // Those elements handle their own click events; we must not also
          // treat the same pointer-down as a gesture start.
          const target = e.target as HTMLElement;
          if (target.closest('button, a, [role="button"], input, select, textarea')) return;

          // Only track primary pointer (ignore secondary touches)
          if (e.button !== 0 && e.pointerType === "mouse") return;
          if (isTransitioning.current) return;

          // Capture so pointermove/up fire even if pointer leaves the element
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

          gesture.current = {
            startX: e.clientX,
            startY: e.clientY,
            startTime: e.timeStamp,
            lastX: e.clientX,
            lastDx: 0,
            lastTs: e.timeStamp,
            active: true,
            isDrag: false,
          };
        }}
        onPointerMove={(e) => {
          const g = gesture.current;
          if (!g || !g.active) return;

          const dx = e.clientX - g.startX;
          const dy = e.clientY - g.startY;

          // Ignore if primarily vertical (let the page scroll)
          if (!g.isDrag && Math.abs(dy) > Math.abs(dx) + 4) {
            gesture.current = null;
            return;
          }

          // Mark as a real drag once horizontal movement exceeds 6px
          if (!g.isDrag && Math.abs(dx) > 6) {
            g.isDrag = true;
            e.preventDefault(); // prevent page scroll once we own the gesture
          }

          if (g.isDrag) {
            // Track velocity: px moved since last event / time delta
            g.lastDx = e.clientX - g.lastX;
            g.lastTs = e.timeStamp;
            g.lastX = e.clientX;

            // Drive the slide position directly — feels 1:1 with finger
            dragX.set(dx);
          }
        }}
        onPointerUp={(e) => {
          const g = gesture.current;
          gesture.current = null;
          if (!g || !g.active) return;

          const totalDx = e.clientX - g.startX;
          const dt = e.timeStamp - g.lastTs;
          // Velocity in px/s from last few pointermove events
          const velocity = dt > 0 ? (g.lastDx / dt) * 1000 : 0;

          if (!g.isDrag) {
            // Pure tap — zero drag movement → navigate post
            handleTap(g.startX < window.innerWidth / 2 ? -1 : 1);
            return;
          }

          // Was a drag — decide swipe or snap-back
          const isSwipe =
            Math.abs(totalDx) > SWIPE_THRESHOLD ||
            Math.abs(velocity) > VELOCITY_THRESHOLD;

          if (isSwipe) {
            commitGroupChange(totalDx < 0 ? 1 : -1);
          } else {
            // Snap back to centre
            motionAnimate(dragX, 0, {
              type: "spring",
              stiffness: 500,
              damping: 40,
            });
          }
        }}
        onPointerCancel={() => {
          gesture.current = null;
          motionAnimate(dragX, 0, { type: "spring", stiffness: 500, damping: 40 });
        }}
      >
        {/* Three treadmill slides */}
        <SlideContent
          group={prevGroup}
          xMotion={prevX}
          scaleMotion={prevScale}
          opacityMotion={prevOpacity}
          isActive={false}
        />
        <SlideContent
          group={activeGroup}
          xMotion={currX}
          opacityMotion={currOpacity}
          isActive={true}
        />
        <SlideContent
          group={nextGroup}
          xMotion={nextX}
          scaleMotion={nextScale}
          opacityMotion={nextOpacity}
          isActive={false}
        />
      </div>

      {/* Progress dots */}
      <div className="fixed bottom-6 sm:bottom-8 inset-x-0 z-[300] flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.artistId}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <ProgressDots
              total={
                activeGroup.hasMore
                  ? activeGroup.entries.length + 1
                  : activeGroup.entries.length
              }
              current={activePostIndex}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </ModalWrapper>,
    document.body,
  );
}
