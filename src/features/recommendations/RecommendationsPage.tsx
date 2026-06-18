import React from "react";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { DesktopHeader } from "../navigation/DesktopHeader";
import { FeedRecommendationCard } from "../../components/FeedRecommendationCard";
import { MOCK_RECOMMENDATIONS } from "../../mock/recommendations";

export function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-surface-deep text-white pb-28">
      <MobileTopHeader />
      <DesktopHeader />

      <main className="pt-[61px] md:pt-[72px]">
        {/* Clean Feed Layout */}
        <section className="w-full max-w-2xl mx-auto flex flex-col pt-4">
          {MOCK_RECOMMENDATIONS.map((rec, idx) => (
            <div 
              key={rec.id} 
              className={`w-full px-4 md:px-8 py-3 ${
                idx !== MOCK_RECOMMENDATIONS.length - 1 ? "border-b border-white/[0.08]" : ""
              }`}
            >
              <FeedRecommendationCard rec={rec} />
            </div>
          ))}

          {MOCK_RECOMMENDATIONS.length === 0 && (
             <div className="text-center py-20">
               <p className="text-[11px] text-white/40 font-mono uppercase tracking-widest">
                 No recommendations available
               </p>
             </div>
          )}
        </section>
      </main>
    </div>
  );
}
