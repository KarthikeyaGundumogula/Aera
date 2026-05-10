import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { FESTIVALS, GRID_ITEMS } from "../../mock";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";

export function FestivalTheatrePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const festival = id ? FESTIVALS.find((s) => s.id === id) : null;
  // Fallback to all GRID_ITEMS for the mock if we don't have a strict festival mapping
  const festivalWorks = festival ? GRID_ITEMS : [];

  const [visibleWorks, setVisibleWorks] = useState(festivalWorks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(festivalWorks.length > 0);

  const loadMore = useCallback(() => {
    if (isLoading || !festivalWorks.length) return;
    setIsLoading(true);

    // Simulate network delay for infinite scroll demonstration
    setTimeout(() => {
      setVisibleWorks(prev => [
        ...prev, 
        ...festivalWorks.map(w => ({ ...w, id: `${w.id}-clone-${Math.random().toString(36).substr(2, 9)}` }))
      ]);
      setIsLoading(false);
    }, 800);
  }, [isLoading, festivalWorks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!festival) return null;

  return (
    <UnifiedTheatre 
      works={visibleWorks}
      variant="full"
      title="Festival Archive"
      subtitle={festival.title}
      onExit={() => navigate(`/festivals/${festival.id}`)}
      isLoading={isLoading}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}
