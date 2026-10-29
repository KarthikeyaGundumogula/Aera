import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UnifiedTheatre } from "./components/UnifiedTheatre";
import { TheatreItem } from "../../types";
import { apiFetch } from "@/lib/api";
import { mapBackendWorkToTheatreItem } from "@/context/AuthContext";

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
    setIsLoading(true);

    if (type === "original") {
      apiFetch(`/originals/${id}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const remote = json.data;
            if (remote?.title && isMounted) {
              setSubtitle(remote.title);
            }
          }
        })
        .catch(() => undefined);

      apiFetch(`/originals/${id}/theatre?limit=30`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const theatreCards = json.data ?? [];
            if (Array.isArray(theatreCards) && isMounted) {
              const mappedWorks: TheatreItem[] = theatreCards.map(mapBackendWorkToTheatreItem);
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
      apiFetch(`/sets/${id}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const data = json.data;
            if (isMounted && data?.title) setSubtitle(data.title);
          }
        })
        .catch((err) => {
          console.error("[ContextualTheatrePage] Failed to fetch set detail:", err);
        });

      apiFetch(`/sets/${id}/theatre`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const items = json.data ?? [];
            if (Array.isArray(items) && isMounted) {
              const mappedWorks: TheatreItem[] = items.map(mapBackendWorkToTheatreItem);
              setVisibleWorks(mappedWorks);
            }
          }
        })
        .catch((err) => console.warn("[ContextualTheatrePage] Failed to fetch set theatre:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else if (type === "festival") {
      apiFetch(`/festivals/${id}`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const data = json.data;
            if (isMounted && data?.title) setSubtitle(data.title);
          }
        })
        .catch((err) => {
          console.error("[ContextualTheatrePage] Failed to fetch festival detail:", err);
        });

      apiFetch(`/festivals/${id}/works`)
        .then(async (res) => {
          if (res.ok) {
            const json = await res.json();
            const items = json.data ?? [];
            if (Array.isArray(items) && isMounted) {
              const mappedWorks: TheatreItem[] = items.map(mapBackendWorkToTheatreItem);
              setVisibleWorks(mappedWorks);
            }
          }
        })
        .catch((err) => console.warn("[ContextualTheatrePage] Failed to fetch festival works:", err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
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
