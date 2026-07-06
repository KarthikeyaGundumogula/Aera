import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Pin } from "lucide-react";
import { createPortal } from "react-dom";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { Original } from "../../../types/originals";
import { WorkModal } from "../../shared/modals/WorkModal";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Full-screen Line viewer ──────────────────────────────────────────────────

interface LineFullProps {
  post: WallPost;
}

const LineFull: React.FC<LineFullProps> = ({ post }) => (
  <div className="flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto px-8 text-center gap-6">
    <img
      src={post.artistImage}
      alt={post.artistName}
      className="w-12 h-12 rounded-lg object-cover object-top border border-white/15"
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
  // If we have a proper TheatreItem (PIN_WORK), render the full WorkModal embed
  if (post.type === "PIN_WORK" && resolvedWork) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-[800px] flex items-center justify-center flex-1 min-h-0">
          <WorkModal item={resolvedWork} onClose={onClose} standalone={false} isActive={isActive} />
        </div>
        {/* Artist Line below the embed */}
        {post.text && (
          <div className="flex flex-col items-center gap-2 px-8 text-center max-w-lg">
            <div className="flex items-center gap-2">
              <Pin size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/70">
                Pinned by {post.artistName}
              </span>
            </div>
            <p className="text-[14px] leading-[1.55] text-white/60">{post.text}</p>
          </div>
        )}
      </div>
    );
  }

  // For PIN_ORIGINAL or when resolved work has only a cover image
  const image =
    resolvedWork?.image ?? resolvedOriginal?.coverImage;
  const title = resolvedWork?.title ?? resolvedOriginal?.title;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 px-4">
      {image && (
        <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
          <img
            src={image}
            alt={title ?? "Pinned"}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      {title && (
        <p className="text-[14px] font-black uppercase tracking-[0.15em] text-white/60">
          {title}
        </p>
      )}
      {post.text && (
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Pin size={10} className="text-amber-500 fill-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/70">
              Pinned by {post.artistName}
            </span>
          </div>
          <p className="text-[15px] leading-[1.55] text-white/70">{post.text}</p>
        </div>
      )}
    </div>
  );
};

// ─── Progress indicator ───────────────────────────────────────────────────────

interface ProgressDotsProps {
  total: number;
  current: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ total, current }) => {
  if (total <= 1) return null;
  // Show max 7 dots; compress if more
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
              isActive
                ? "w-4 h-1.5 bg-amber-400"
                : "w-1.5 h-1.5 bg-white/20"
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
}

interface WallSwiperProps {
  entries: WallSwiperEntry[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * WallSwiper — Full-screen swipeable viewer for Wall posts.
 *
 * Opens when a WallPostCard is tapped. Users can swipe left/right
 * (or use arrow keys / nav chevrons on desktop) to browse all wall posts.
 *
 * - LINE posts: render the text in large readable typography
 * - PIN_WORK posts: render the full WorkModal embed (video / poster / script)
 * - PIN_ORIGINAL: render the cover image with title and optional Line
 */
export function WallSwiper({ entries, initialIndex, onClose }: WallSwiperProps) {
  const [page, setPage] = useState(initialIndex);

  const activeIndex =
    ((page % entries.length) + entries.length) % entries.length;
  const { post, resolvedWork, resolvedOriginal } = entries[activeIndex];

  const paginate = useCallback((direction: number) => {
    setPage((p) => p + direction);
  }, []);

  // Keyboard nav — per Emil: no animation on keyboard, but we do need navigation
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [paginate, onClose]);

  const isDraggable = entries.length > 1;

  return createPortal(
    <ModalWrapper isOpen={true} onClose={onClose} isImmersive={true}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="
          fixed top-4 right-4 z-[300]
          w-9 h-9 rounded-xl
          bg-black/60 backdrop-blur-md border border-white/10
          flex items-center justify-center
          text-white/60 hover:text-white
          transition-colors duration-150
        "
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Header: Artist info + post type */}
      <div className="fixed top-4 left-4 z-[300] flex items-center gap-2.5">
        <img
          src={post.artistImage}
          alt={post.artistName}
          className="w-7 h-7 rounded-md object-cover object-top border border-white/10"
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            {post.artistName}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
            {post.type === "LINE" ? "Line" : "Pin"} · {formatRelativeTime(post.postedAt)}
          </span>
        </div>
      </div>

      {/* Swipeable content track */}
      <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ x: `-${page * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          drag={isDraggable ? "x" : false}
          dragElastic={0.15}
          dragDirectionLock
          dragMomentum={false}
          style={{ touchAction: "pan-y", willChange: "transform" }}
          onDragEnd={(_, { offset, velocity }) => {
            const power = offset.x + velocity.x * 0.2;
            if (power < -80) paginate(1);
            else if (power > 80) paginate(-1);
          }}
        >
          {(isDraggable ? [-1, 0, 1] : [0]).map((offset) => {
            const virtualPage = page + offset;
            const idx =
              ((virtualPage % entries.length) + entries.length) %
              entries.length;
            const entry = entries[idx];
            if (!entry) return null;

            return (
              <div
                key={`${entry.post.id}-${virtualPage}`}
                className="absolute inset-0 w-full h-full flex items-center justify-center px-4 pt-20 pb-16"
                style={{ left: `${virtualPage * 100}%` }}
                onClick={(e) => e.stopPropagation()}
              >
                {entry.post.type === "LINE" ? (
                  <LineFull post={entry.post} />
                ) : (
                  <PinFull
                    post={entry.post}
                    resolvedWork={entry.resolvedWork}
                    resolvedOriginal={entry.resolvedOriginal}
                    isActive={offset === 0}
                    onClose={onClose}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Desktop nav chevrons */}
      {isDraggable && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            className="
              hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 z-[300]
              w-10 h-10 rounded-xl
              bg-black/50 backdrop-blur-md border border-white/10
              items-center justify-center
              text-white/50 hover:text-white hover:bg-black/70
              transition-all duration-150
            "
            aria-label="Previous post"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); paginate(1); }}
            className="
              hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-[300]
              w-10 h-10 rounded-xl
              bg-black/50 backdrop-blur-md border border-white/10
              items-center justify-center
              text-white/50 hover:text-white hover:bg-black/70
              transition-all duration-150
            "
            aria-label="Next post"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Progress indicator at the bottom */}
      <div className="fixed bottom-6 sm:bottom-8 inset-x-0 z-[300] flex justify-center pointer-events-none">
        <ProgressDots total={entries.length} current={activeIndex} />
      </div>
    </ModalWrapper>,
    document.body
  );
}
