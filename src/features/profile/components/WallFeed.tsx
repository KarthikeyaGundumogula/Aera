import React, { useMemo } from "react";
import { motion } from "motion/react";
import { WallPost } from "../../../types/wall";
import { WallPostCard } from "./WallPostCard";
import { EmptyState, EMPTY_PRESETS } from "../../../components/EmptyState";

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

  const worksById = {};
  const originalsById = {};
  const recommendationsById = {};
  const ledgerById = {};



  if (posts.length === 0) {
    return (
      <div className="py-8 px-4">
        <EmptyState {...EMPTY_PRESETS.wall} />
      </div>
    );
  }

  return (
    <>
      {/* ── Responsive Layout: Twitter-like feed on mobile, Masonry on desktop ── */}
      <div className="flex flex-col md:block md:columns-3 lg:columns-4 md:gap-4">
        {posts.map((post, index) => {
          const resolvedWork = post.pinnedWorkId ? (worksById as any)[post.pinnedWorkId] : undefined;
          const resolvedOriginal = post.pinnedOriginalId ? (originalsById as any)[post.pinnedOriginalId] : undefined;
          const resolvedRecommendation = post.pinnedRecommendationId
            ? (recommendationsById as any)[post.pinnedRecommendationId]
            : undefined;
          const resolvedLedgerEntry = post.ledgerEntryId ? (ledgerById as any)[post.ledgerEntryId] : undefined;

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
