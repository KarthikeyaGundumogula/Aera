import React, { useMemo, useState, useCallback } from "react";
import { motion } from "motion/react";
import { WallPost } from "../../../types/wall";
import { WallPostCard } from "./WallPostCard";
import { WallSwiper, WallSwiperEntry } from "./WallSwiper";
import { GRID_ITEMS, ORIGINALS } from "../../../mock";

interface WallFeedProps {
  posts: WallPost[];
  /** When true, every card is flat (no tilt) with the Foyer amber strip */
  inFoyer?: boolean;
}

/**
 * WallFeed — 2-column masonry feed of WallPostCards.
 *
 * Layout:
 *   - 2 columns at ALL screen sizes (mobile included) per design spec.
 *   - LINE posts span both columns (always full-width) for text breathing room.
 *   - PIN posts fill one column.
 *   - Cards stagger in at 40ms intervals.
 *
 * Interaction:
 *   - Tapping any card opens WallSwiper — a full-screen feed-like viewer
 *     where the user can swipe through all wall posts.
 */
export const WallFeed: React.FC<WallFeedProps> = ({ posts, inFoyer = false }) => {
  const [swiperIndex, setSwiperIndex] = useState<number | null>(null);

  // O(1) lookup maps — resolved once, never re-computed unless posts change
  const worksById = useMemo(
    () => Object.fromEntries(GRID_ITEMS.map((w) => [String(w.id), w])),
    []
  );
  const originalsById = useMemo(
    () => Object.fromEntries(ORIGINALS.map((o) => [o.id, o])),
    []
  );

  // Pre-build resolved entries for the swiper so it doesn't resolve on each render
  const swiperEntries: WallSwiperEntry[] = useMemo(
    () =>
      posts.map((post) => ({
        post,
        resolvedWork: post.pinnedWorkId ? worksById[post.pinnedWorkId] : undefined,
        resolvedOriginal: post.pinnedOriginalId
          ? originalsById[post.pinnedOriginalId]
          : undefined,
      })),
    [posts, worksById, originalsById]
  );

  const openSwiper = useCallback((index: number) => setSwiperIndex(index), []);
  const closeSwiper = useCallback(() => setSwiperIndex(null), []);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          Nothing on the wall yet
        </p>
        <p className="text-[12px] text-white/15 max-w-[220px]">
          When the artist drops a Line or pins a Work, it appears here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Responsive Layout: Twitter-like feed on mobile, Masonry on desktop ── */}
      <div className="flex flex-col divide-y divide-white/[0.08] md:divide-none md:block md:columns-3 lg:columns-4 md:gap-4">
        {posts.map((post, index) => {
          const resolvedWork = post.pinnedWorkId
            ? worksById[post.pinnedWorkId]
            : undefined;
          const resolvedOriginal = post.pinnedOriginalId
            ? originalsById[post.pinnedOriginalId]
            : undefined;

          // Pure LINE posts always span both columns on desktop
          const isFullWidth = post.type === "LINE";

          return (
            <motion.div
              key={post.id}
              className={`break-inside-avoid md:mb-4 ${
                isFullWidth ? "md:column-span-all" : ""
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                ease: [0.23, 1, 0.32, 1],
                delay: index * 0.04,
              }}
            >
              <WallPostCard
                post={post}
                resolvedWork={resolvedWork}
                resolvedOriginal={resolvedOriginal}
                inFoyer={inFoyer}
                onClick={() => openSwiper(index)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── WallSwiper modal — opens on card tap ── */}
      {swiperIndex !== null && (
        <WallSwiper
          entries={swiperEntries}
          initialIndex={swiperIndex}
          onClose={closeSwiper}
        />
      )}
    </>
  );
};
