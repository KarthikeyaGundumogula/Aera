import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ORIGINALS_DATA, SETS, FESTIVALS, GRID_ITEMS } from "../../mock";
import { UnifiedTheatre } from "./components/UnifiedTheatre";
import { TheatreItem } from "../../types";
import { apiFetch } from "@/lib/api";

export interface ContextualTheatrePageProps {
  type: "original" | "set" | "festival";
}

export function ContextualTheatrePage({ type }: ContextualTheatrePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subtitle, setSubtitle] = useState<string>("");
  const [visibleWorks, setVisibleWorks] = useState<TheatreItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Initialize & fetch context data
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    if (type === "original") {
      const staticOriginal = ORIGINALS_DATA[id];
      if (staticOriginal) {
        setSubtitle(staticOriginal.title);
        setVisibleWorks(staticOriginal.works || []);
        setHasMore((staticOriginal.works || []).length > 0);
      }

      // Fetch dynamic details for subtitle
      apiFetch(`/originals/${id}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const remote = json.data || json;
            if (remote?.title && isMounted) {
              setSubtitle(remote.title);
            }
          }
        })
        .catch(() => undefined);

      // Fetch dynamic theatre works from GET /originals/{id}/theatre
      setIsLoading(true);
      apiFetch(`/originals/${id}/theatre?limit=30`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const theatreCards = json.data || json;
            if (Array.isArray(theatreCards) && isMounted) {
              const mappedWorks: TheatreItem[] = theatreCards.map((w: any) => ({
                id: w.id,
                title: w.title || "Untitled Work",
                category: w.workType || w.work_type || w.category || "Edit",
                image: w.thumbnail || "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
                platform: "youtube",
                srcId: w.id,
              }));
              setVisibleWorks(mappedWorks);
              setHasMore(mappedWorks.length >= 30);
            }
          }
        })
        .catch((err) => console.warn("[ContextualTheatrePage] Failed to fetch theatre:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else if (type === "set") {
      const set = SETS.find((s) => s.id === id);
      if (set) {
        setSubtitle(set.title);
        const works = GRID_ITEMS.filter((item) => item.srcId === id);
        setVisibleWorks(works);
        setHasMore(works.length > 0);
      }
    } else if (type === "festival") {
      const festival = FESTIVALS.find((f) => f.id === id);
      if (festival) {
        setSubtitle(festival.title);
        setVisibleWorks(GRID_ITEMS);
        setHasMore(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [id, type]);

  const backUrl = type === "original" ? `/originals/${id}` : type === "set" ? `/sets/${id}` : `/festivals/${id}`;
  const title = type === "original" ? "Originals Theatre" : type === "set" ? "Sets Theatre" : "Festival Archive";

  return (
    <UnifiedTheatre 
      works={visibleWorks}
      variant="full"
      title={title}
      subtitle={subtitle}
      onExit={() => navigate(backUrl)}
      isLoading={isLoading}
      onLoadMore={() => undefined}
      hasMore={hasMore}
    />
  );
}
