import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FoyerSwiper, FoyerArtistGroup } from "../hall/components/FoyerSwiper";
import { apiFetch } from "@/lib/api";

export default function WallPostPage() {
  const { artistId, postId } = useParams<{ artistId: string; postId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<FoyerArtistGroup | null>(null);

  useEffect(() => {
    if (!artistId || !postId) return;
    apiFetch(`/wall/${artistId}/${postId}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setGroup(json.data || json);
        }
      })
      .catch(() => {});
  }, [artistId, postId]);
  const initialPostIndices = useMemo(() => {
    if (!group || !postId) return {};
    const idx = (group.entries || []).findIndex((e: any) => e.post?.id === postId || e.id === postId);
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
      <FoyerSwiper
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
