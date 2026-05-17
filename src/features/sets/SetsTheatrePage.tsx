import { useParams, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { SETS, GRID_ITEMS } from "../../mock";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";

export function SetsTheatrePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const set = id ? SETS.find((s) => s.id === id) : null;
  const setWorks = set ? GRID_ITEMS.filter((item) => item.srcId === set.id) : [];

  const [visibleWorks, setVisibleWorks] = useState(setWorks);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(setWorks.length > 0);

  const loadMore = useCallback(() => {
    if (isLoading || !setWorks.length) return;
    setIsLoading(true);

    // Simulate network delay for infinite scroll demonstration
    setTimeout(() => {
      setVisibleWorks(prev => [
        ...prev, 
        ...setWorks.map(w => ({ ...w, id: `${w.id}-clone-${Math.random().toString(36).substr(2, 9)}` }))
      ]);
      setIsLoading(false);
      // For mock purposes, keep hasMore true
    }, 800);
  }, [isLoading, setWorks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!set) return null;

  return (
    <UnifiedTheatre 
      works={visibleWorks}
      variant="full"
      title="Sets Theatre"
      subtitle={set.title}
      onExit={() => navigate(`/sets/${set.id}`)}
      isLoading={isLoading}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}
