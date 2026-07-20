import React from "react";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";
import { ViewerFrame } from "./ViewerFrame";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { RecommendationCard } from "../../../components/RecommendationCard";

interface RecommendationViewerProps {
  item: TheatreItem;
}

/**
 * RecommendationViewer — wraps ViewerFrame with RecommendationCard as
 * the media slot. The identity block is suppressed because RecommendationCard
 * has its own artist/title display built in.
 */
export function RecommendationViewer({ item }: RecommendationViewerProps) {
  const rec = item.recId
    ? MOCK_RECOMMENDATIONS.find((r) => r.id === item.recId) ?? null
    : null;

  return (
    <ViewerFrame
      item={item}
      showIdentityBlock={false}
      mediaMaxWidth="min(600px,calc(100vw-2rem))"
      mediaSlot={() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {rec ? (
            <RecommendationCard rec={rec} variant="modal" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                Recommendation
              </p>
              <h1 className="text-2xl font-bold text-white/70 leading-tight">
                {item.title || "Untitled"}
              </h1>
              <p className="text-[10px] text-white/25">No resonance data available.</p>
            </div>
          )}
        </motion.div>
      )}
    />
  );
}
