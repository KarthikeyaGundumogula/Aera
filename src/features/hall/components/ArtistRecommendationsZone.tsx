import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { RecommendationCard } from "./RecommendationCard";

export function ArtistRecommendationsZone() {
  if (!MOCK_RECOMMENDATIONS || MOCK_RECOMMENDATIONS.length === 0) return null;

  return (
    <div className="relative">
      <SectionHeader
        icon={Sparkles}
        title="Recommendations"
        containerClassName="px-6 md:px-12 mb-5 opacity-100"
      />

      {/* Horizontal Carousel */}
      <div className="overflow-x-auto no-scrollbar pb-6">
        <motion.div layout className="flex gap-4 w-max px-6 md:px-12 items-start">
          {MOCK_RECOMMENDATIONS.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
