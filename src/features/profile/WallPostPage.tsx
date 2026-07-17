import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWallPostsByArtist } from "../../mock/wall";
import { GRID_ITEMS, ORIGINALS } from "../../mock";
import { MOCK_RECOMMENDATIONS } from "../../mock/recommendations";
import { WallSwiper, WallSwiperArtistGroup } from "./components/WallSwiper";

/**
 * WallPostPage — Deep-link landing page for shared wall posts.
 *
 * Route: /wall/:artistId/:postId
 *
 * When a recipient opens a shared link they land here. The page builds a
 * WallSwiperArtistGroup for the artist and opens the full-screen WallSwiper
 * positioned at the exact post that was shared. Closing navigates back or home.
 */
export default function WallPostPage() {
  const { artistId, postId } = useParams<{ artistId: string; postId: string }>();
  const navigate = useNavigate();

  const worksById = useMemo(
    () => Object.fromEntries(GRID_ITEMS.map((w) => [String(w.id), w])),
    []
  );
  const originalsById = useMemo(
    () => Object.fromEntries(ORIGINALS.map((o) => [o.id, o])),
    []
  );
  const recommendationsById = useMemo(
    () => Object.fromEntries(MOCK_RECOMMENDATIONS.map((r) => [r.id, r])),
    []
  );

  const group = useMemo<WallSwiperArtistGroup | null>(() => {
    if (!artistId) return null;
    const posts = getWallPostsByArtist(artistId);
    if (posts.length === 0) return null;
    const first = posts[0];
    return {
      artistId: first.artistId,
      artistName: first.artistName,
      artistImage: first.artistImage,
      hasMore: false,
      entries: posts.map((post) => ({
        post,
        resolvedWork: post.pinnedWorkId ? worksById[post.pinnedWorkId] : undefined,
        resolvedOriginal: post.pinnedOriginalId ? originalsById[post.pinnedOriginalId] : undefined,
        resolvedRecommendation: post.pinnedRecommendationId
          ? recommendationsById[post.pinnedRecommendationId]
          : undefined,
      })),
    };
  }, [artistId, worksById, originalsById, recommendationsById]);

  const initialPostIndices = useMemo(() => {
    if (!group || !postId) return {};
    const idx = group.entries.findIndex((e) => e.post.id === postId);
    return { [group.artistId]: idx >= 0 ? idx : 0 };
  }, [group, postId]);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#050302]">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30">
          Post not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#050302]" />
      <WallSwiper
        groups={[group]}
        initialGroupIndex={0}
        initialPostIndices={initialPostIndices}
        onClose={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/");
          }
        }}
      />
    </>
  );
}
