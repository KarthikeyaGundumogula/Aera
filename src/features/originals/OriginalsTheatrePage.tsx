import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ORIGINALS_DATA } from "../../mock";
import { UnifiedTheatre } from "../theatre/components/UnifiedTheatre";


export function OriginalsTheatrePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const original = id ? ORIGINALS_DATA[id] : null;
  const originalContent = original?.works || [];

  const [visibleWorks, setVisibleWorks] = useState(originalContent);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(originalContent.length > 0);

  const loadMore = useCallback(() => {
    if (isLoading || !originalContent.length) return;
    setIsLoading(true);

    // Simulate network delay for infinite scroll demonstration
    setTimeout(() => {
      setVisibleWorks(prev => [
        ...prev, 
        ...originalContent.map(w => ({ ...w, id: `${w.id}-clone-${Math.random().toString(36).substr(2, 9)}` }))
      ]);
      setIsLoading(false);
      // For mock purposes, keep hasMore true
    }, 800);
  }, [isLoading, originalContent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!original) return null;

  return (
    <UnifiedTheatre 
      works={visibleWorks}
      variant="full"
      title="Originals Theatre"
      subtitle={original.title}
      onExit={() => navigate(`/originals/${original.id}`)}
      isLoading={isLoading}
      onLoadMore={loadMore}
      hasMore={hasMore}
    />
  );
}
