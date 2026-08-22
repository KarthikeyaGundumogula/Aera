import { useState } from "react";
import { Bookmark, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { INITIAL_SAVED_ITEMS, SavedItemEntry } from "../../mock/savedItems";
import { PostCard } from "../../components/PostCard";
import { useWorkNavigation } from "../../hooks/useWorkNavigation";

export default function SavedPage() {
  const { currentArtist } = useAuth();
  const navigate = useNavigate();
  const { openWork } = useWorkNavigation();
  const [savedItems, setSavedItems] = useState<SavedItemEntry[]>(INITIAL_SAVED_ITEMS);

  // Access Control: Accessible only to logged-in users
  if (!currentArtist) {
    return <Navigate to="/profile/login" replace />;
  }

  const handleUnsave = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemClick = (entry: SavedItemEntry) => {
    if (entry.resolvedWork) {
      openWork(entry.resolvedWork);
    } else if (entry.post.pinnedWorkId) {
      navigate(`/works/${entry.post.pinnedWorkId}`);
    } else if (entry.post.pinnedOriginalId) {
      navigate(`/originals/${entry.post.pinnedOriginalId}`);
    } else if (entry.post.id) {
      navigate(`/wall/${entry.post.artistId}/${entry.post.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white pb-24 pt-6 md:pt-10 px-4 sm:px-8 md:px-12">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5 fill-amber-400/20" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                Saved Items
              </h1>
              <p className="text-xs font-mono text-white/40 mt-0.5">
                {savedItems.length} {savedItems.length === 1 ? "item" : "items"} saved to your collection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Items Feed */}
      <div className="max-w-4xl mx-auto">
        {savedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {savedItems.map((entry) => (
              <div key={entry.id} className="w-full">
                <PostCard
                  post={entry.post}
                  artistOverride={entry.artistOverride}
                  resolvedWork={entry.resolvedWork}
                  resolvedOriginal={entry.resolvedOriginal}
                  resolvedRecommendation={entry.resolvedRecommendation}
                  isSaved={true}
                  onToggleSave={() => handleUnsave(entry.id)}
                  onClick={() => handleItemClick(entry)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                No Saved Items Yet
              </h3>
              <p className="text-xs font-mono text-white/40 mt-1 max-w-sm mx-auto">
                Items you bookmark across works, recommendations, and wall posts will appear here.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Explore Hall
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
