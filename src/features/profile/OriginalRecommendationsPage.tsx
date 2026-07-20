import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { MOCK_RECOMMENDATIONS } from "../../mock/recommendations";
import { FeedRecommendationCard } from "../../components/FeedRecommendationCard";

export default function OriginalRecommendationsPage() {
  const { profileId, originalId } = useParams<{ profileId: string; originalId: string }>();
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    return MOCK_RECOMMENDATIONS.filter(
      (r) => r.artist.id === profileId && r.original.id === originalId
    );
  }, [profileId, originalId]);

  return (
    <div className="min-h-screen bg-[#080807] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#080807]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4 px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase">
              Recommendations
            </h1>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {recommendations.length > 0 ? (
          <div className="flex flex-col gap-12">
            {recommendations.map((rec) => (
              <FeedRecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              No recommendations found
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
