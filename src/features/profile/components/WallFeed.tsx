import React, { useMemo } from "react";
import { motion } from "motion/react";
import { WallPost } from "../../../types/wall";
import { WallPostCard } from "./WallPostCard";
import { GRID_ITEMS, ORIGINALS } from "../../../mock";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { mockLedger } from "../../../mock/ledger";

interface WallFeedProps {
  posts: WallPost[];
  themeGradient?: [string, string];
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
 *   - Inline interactions (Reaction bar, Save, Share, direct navigation to Work/Original/Ledger).
 */
export const WallFeed: React.FC<WallFeedProps> = ({ posts, themeGradient }) => {

  // O(1) lookup maps — resolved once, never re-computed unless posts change
  const worksById = useMemo(
    () => Object.fromEntries(GRID_ITEMS.map((w) => [String(w.id), w])),
    []
  );
  const originalsById = useMemo(
    () => Object.fromEntries(ORIGINALS.map((o) => [o.id, o])),
    []
  );
  const recommendationsById = useMemo(
    () => Object.fromEntries(MOCK_RECOMMENDATIONS.map((r) => [r.id, r])),
    []
  );
  const ledgerById = useMemo(
    () => Object.fromEntries(mockLedger.map((l) => [l.id, l])),
    []
  );



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
      <div className="flex flex-col md:block md:columns-3 lg:columns-4 md:gap-4">
        {posts.map((post, index) => {
          const resolvedWork = post.pinnedWorkId ? worksById[post.pinnedWorkId] : undefined;
          const resolvedOriginal = post.pinnedOriginalId ? originalsById[post.pinnedOriginalId] : undefined;
          const resolvedRecommendation = post.pinnedRecommendationId
            ? recommendationsById[post.pinnedRecommendationId]
            : undefined;
          const resolvedLedgerEntry = post.ledgerEntryId ? ledgerById[post.ledgerEntryId] : undefined;

          // LEDGER_ENTRY posts span full width like LINE posts
          const isFullWidth = post.type === "LINE" || post.type === "LEDGER_ENTRY";

          return (
            <React.Fragment key={post.id}>
              {index > 0 && <div className="mx-8 md:hidden h-px bg-white/[0.08]" />}
              <motion.div
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
                  resolvedRecommendation={resolvedRecommendation}
                  resolvedLedgerEntry={resolvedLedgerEntry}
                  themeGradient={themeGradient}
                />
            </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};
