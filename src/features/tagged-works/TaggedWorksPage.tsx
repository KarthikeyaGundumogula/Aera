import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { WallPostCard } from "@/features/profile/components/WallPostCard";
import { WallPost } from "@/types/wall";
import { TheatreItem } from "@/types/theatre";
import { apiFetch } from "@/lib/api";

export function TaggedWorksPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [original, setOriginal] = useState<any>(null);
  const [existingWorks, setExistingWorks] = useState<TheatreItem[]>([]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/originals/${id}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setOriginal(json.data || json);
        }
      })
      .catch(() => {});

    apiFetch(`/library/${id}/tagged_works`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setExistingWorks(json.data || json || []);
        }
      })
      .catch(() => {});
  }, [id]);

  const title = original?.title || original?.name || "Original";
  const posterUrl = original?.coverImage || original?.cover_image || "/posters/og.jpeg";

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Top Fixed Header */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
          {title} Collection
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 space-y-8">
        {/* Collection Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02] p-6 flex flex-col sm:flex-row items-center gap-6"
        >
          <img
            src={posterUrl}
            alt={title}
            className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-2xl border border-white/10 shadow-2xl shrink-0"
          />
          <div className="space-y-1.5 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {title} Collection
            </h1>
            <p className="text-xs font-mono text-white/40">
              {existingWorks.length} Existing Works Tagged
            </p>
          </div>
        </motion.div>

        {/* Real Existing Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {existingWorks.map((work, idx) => {
            const mockPost: WallPost = {
              id: `wall-tw-${work.id}-${idx}`,
              artistId: work.artistId || "fh-001",
              artistName: work.artist || "Artist",
              artistImage: work.artistAvatar || work.image || posterUrl,
              type: "PIN_WORK",
              pinnedWorkId: String(work.id),
              postedAt: "Collection Work",
            };

            return (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <WallPostCard
                  post={mockPost}
                  resolvedWork={work}
                  hideReactions={true}
                  onClick={() => navigate(`/works/${work.id}`)}
                />
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default TaggedWorksPage;
