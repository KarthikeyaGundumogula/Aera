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
        {/* Grid Layout for Desktop, List for Mobile */}
        <section className="w-full max-w-[2000px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-0 md:gap-4 lg:gap-5 px-0 md:px-4 lg:px-6 pb-4 lg:pb-8 pt-0 md:pt-3 lg:pt-4">
          {MOCK_RECOMMENDATIONS.map((rec, idx) => (
            <div 
              key={rec.id} 
              className={`w-full px-4 md:px-4 py-3 md:py-4 ${
                idx !== MOCK_RECOMMENDATIONS.length - 1 ? "border-b border-white/[0.08] md:border-transparent" : "md:border-transparent"
              } md:border md:border-white/10 md:rounded-2xl md:bg-[#0A0A0A]/50 md:shadow-lg`}
            >
              <div className="w-full max-w-2xl mx-auto md:max-w-none relative z-10">
                <FeedRecommendationCard rec={rec} />
              </div>
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
