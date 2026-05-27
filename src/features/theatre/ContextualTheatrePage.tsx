import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { ORIGINALS_DATA, SETS, FESTIVALS, GRID_ITEMS } from "../../mock";
import { UnifiedTheatre } from "./components/UnifiedTheatre";
import { TheatreItem } from "../../types";

export interface ContextualTheatrePageProps {
  type: "original" | "set" | "festival";
}

export function ContextualTheatrePage({ type }: ContextualTheatrePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Resolve context
  const getContext = () => {
    if (!id) return null;
    switch (type) {
      case "original": {
        const original = ORIGINALS_DATA[id];
        return original ? { 
          title: "Originals Theatre", 
          subtitle: original.title, 
          works: original.works || [], 
          backUrl: `/originals/${id}` 
        } : null;
      }
      case "set": {
        const set = SETS.find((s) => s.id === id);
        return set ? {
          title: "Sets Theatre",
          subtitle: set.title,
          works: GRID_ITEMS.filter((item) => item.srcId === id),
          backUrl: `/sets/${id}`
        } : null;
      }
      case "festival": {
        const festival = FESTIVALS.find((f) => f.id === id);
        return festival ? {
          title: "Festival Archive",
          subtitle: festival.title,
          works: GRID_ITEMS, // Mock fallback
          backUrl: `/festivals/${id}`
        } : null;
      }
    }
  };

  const context = getContext();
  // Safe default for works
  const initialWorks = context?.works || [];

  const [visibleWorks, setVisibleWorks] = useState<TheatreItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore] = useState(initialWorks.length > 0);

  // Initialize works once context is resolved
  useEffect(() => {
    setVisibleWorks(initialWorks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const loadMore = useCallback(() => {
    if (isLoading || !initialWorks.length) return;
    setIsLoading(true);

    setTimeout(() => {
      setVisibleWorks(prev => [
        ...prev, 
        ...initialWorks.map(w => ({ ...w, id: `${w.id}-clone-${Math.random().toString(36).substr(2, 9)}` }))
      ]);
      setIsLoading(false);
    }, 800);
  }, [isLoading, initialWorks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!context) return null;

  return (
    <UnifiedTheatre 
      works={visibleWorks}
      variant="full"
      title={context.title}
      subtitle={context.subtitle}
      onExit={() => navigate(context.backUrl)}
      isLoading={isLoading}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}
