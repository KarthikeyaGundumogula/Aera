import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { TheatreItem } from "../../types";
import { EditViewer } from "./layouts/EditViewer";
import { PosterViewer } from "./layouts/PosterViewer";
import { StoryboardViewer } from "./layouts/StoryboardViewer";
import { RecommendationViewer } from "./layouts/RecommendationViewer";
import { FHLoader } from "@/components/FHLoader";

export default function WorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userWorks } = useAuth();
  const [fetchedItem, setFetchedItem] = useState<TheatreItem | null>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(false);

  // Resolve item: state (instant) → userWorks → fetchedItem
  const stateItem = location.state?.item;
  const localItem =
    stateItem ||
    userWorks.find((w) => String(w.id) === id) ||
    fetchedItem ||
    null;

  // On direct URL load for UUID works, fetch on-demand if not present locally
  useEffect(() => {
    if (localItem || !id) return;
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(id);
    if (!isUuid) return;

    let isMounted = true;
    (async () => {
      setIsLoadingBackend(true);
      try {
        const res = await apiFetch(`/works/${id}`);
        if (res.ok && isMounted) {
          const raw = await res.json();
          const itemData = raw.data || raw;
          setFetchedItem({
            id: itemData.id,
            title: itemData.title || undefined,
            category: itemData.work_type || itemData.category || "Edit",
            image: itemData.thumbnail || itemData.image || undefined,
            srcId: itemData.src_id || itemData.srcId || undefined,
            platform: itemData.platform || undefined,
            artist: itemData.artist_name || itemData.artist || undefined,
            artistAvatar: itemData.artist_avatar || itemData.artistAvatar || undefined,
          });
        }
      } catch (e) {
        console.warn("Failed to fetch work directly from backend:", e);
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, localItem]);

  if (isLoadingBackend) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#080807]">
        <FHLoader label="Retrieving Work Scene..." />
      </div>
    );
  }

  const item = localItem;

  // Not found
  if (!item) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080807]">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">
          Work not found
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-2.5 rounded-xl border border-white/15 text-white/50 text-[9px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all"
        >
          Return to Theatre
        </button>
      </div>
    );
  }

  const category = item.category ?? "Edit";

  switch (category) {
    case "Poster":
      return <PosterViewer item={item} />;
    case "Storyboard":
      return <StoryboardViewer item={item} />;
    case "Recommendation":
      return <RecommendationViewer item={item} />;
    case "Edit":
    case "Call":
    default:
      return <EditViewer item={item} />;
  }
}
