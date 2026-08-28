import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Layers, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { useWorkNavigation } from "@/hooks/useWorkNavigation";
import { FHLoader } from "@/components/FHLoader";
import type { TheatreItem } from "@/types/theatre";
import type { WallPost } from "@/types/wall";

interface OriginalHeaderData {
  id: string;
  title: string;
  coverImage?: string;
}

export default function TaggedWorksPage() {
  const { originalId } = useParams<{ originalId: string }>();
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get("artistId") || searchParams.get("profileId") || "";

  const navigate = useNavigate();
  const { openWork } = useWorkNavigation();

  const [original, setOriginal] = useState<OriginalHeaderData | null>(null);
  const [works, setWorks] = useState<TheatreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch Original Header Details
  useEffect(() => {
    if (!originalId) return;
    apiFetch(`/originals/${originalId}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setOriginal({
            id: data.id || originalId,
            title: data.title || "Original",
            coverImage: data.coverImage || data.cover_img,
          });
        }
      })
      .catch(console.error);
  }, [originalId]);

  // Fetch Credited Works Batch
  const fetchCreditedWorks = (cursor?: string) => {
    if (!originalId) return;
    const isInitial = !cursor;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    let url = `/originals/${originalId}/credited_works?limit=20`;
    if (artistId) url += `&artist_id=${artistId}`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

    apiFetch(url)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const items: TheatreItem[] = json.data || json.items || [];
          const meta = json.meta || {};

          setWorks((prev) => (isInitial ? items : [...prev, ...items]));
          setNextCursor(meta.nextCursor || meta.next_cursor || null);
          if (meta.totalCount !== undefined) setTotalCount(meta.totalCount);
          else if (meta.total_count !== undefined) setTotalCount(meta.total_count);
          else if (isInitial) setTotalCount(items.length);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    fetchCreditedWorks();
  }, [originalId, artistId]);

  const handleItemClick = (work: TheatreItem) => {
    openWork(work);
  };

  // Convert TheatreItem to WallPost format for PostCard compatibility
  const buildPostObject = (work: TheatreItem): WallPost => {
    return {
      id: `post-work-${work.id}`,
      artistId: work.artistId || "",
      artistName: work.artist || "Artist",
      artistImage: work.artistAvatar || "",
      type: "PIN_WORK",
      pinnedWorkId: String(work.id),
      text: undefined,
      postedAt: "recently",
    };
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white pb-24 pt-6 md:pt-10 px-4 sm:px-8 md:px-12">
      {/* Top Header Navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-4">
            {original?.coverImage ? (
              <img
                src={original.coverImage}
                alt={original.title}
                className="w-12 h-16 object-cover rounded-xl border border-white/10 shadow-md"
              />
            ) : (
              <div className="w-12 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Collection Feed
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
                {original ? original.title : "Credited Collection"}
              </h1>
              <p className="text-xs font-mono text-white/40 mt-0.5">
                {totalCount} {totalCount === 1 ? "work" : "works"} credited to this original
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Collection Works Feed */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <FHLoader />
          </div>
        ) : works.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {works.map((work) => {
                const post = buildPostObject(work);
                return (
                  <div key={work.id} className="w-full">
                    <PostCard
                      post={post}
                      resolvedWork={work}
                      hideCameraPin={true}
                      hideReactions={true}
                      onClick={() => handleItemClick(work)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {nextCursor && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => fetchCreditedWorks(nextCursor)}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-xs font-black uppercase tracking-widest text-white/80 transition-all flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Layers className="w-4 h-4 text-amber-400" />
                  )}
                  {loadingMore ? "Loading..." : "Load More Works"}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white/80">
                No Credited Works Found
              </h3>
              <p className="text-xs font-mono text-white/40 mt-1 max-w-sm mx-auto">
                No works have been tagged or credited to this original yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
