import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeader } from "../../../components/SectionHeader";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { RecommendationCard } from "../../../components/RecommendationCard";

export function ArtistRecommendationsZone() {
  const navigate = useNavigate();
  if (!MOCK_RECOMMENDATIONS || MOCK_RECOMMENDATIONS.length === 0) return null;

  const displayRecs = MOCK_RECOMMENDATIONS.slice(0, 5);

  return (
    <div className="relative">
      <SectionHeader
        icon={Sparkles}
        title="Recommendations"
        containerClassName="px-6 md:px-12 mb-5 opacity-100"
        actionNode={
          <button
            onClick={() => navigate("/recommendations")}
            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors"
          >
            Check All <ChevronRight className="w-3 h-3" />
          </button>
        }
      />

      {/* Horizontal Carousel */}
      <div className="overflow-x-auto no-scrollbar pb-6">
        <motion.div
          layout
          className="flex gap-4 w-max px-6 md:px-12 items-start"
        >
          {displayRecs.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}

          {/* Aesthetic View All Card */}
          {MOCK_RECOMMENDATIONS.length >= 5 && (
            <button
              onClick={() => navigate("/recommendations")}
              className="flex-shrink-0 h-[310px] w-[140px] sm:w-[160px] flex flex-col items-center justify-center gap-4 transition-all hover:opacity-80 active:scale-[0.98] group"
            >
              <div className="w-12 h-12 rounded-full border border-white/15 flex items-center justify-center bg-transparent group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors">
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-amber-500 transition-colors" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 text-center leading-relaxed max-w-[120px] group-hover:text-white/80 transition-colors">
                Check all recommendations
              </span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
