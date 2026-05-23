import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { GRID_ITEMS } from "../../../../mock";
import { buildMobileClusters, MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileClusterView } from "./MobileClusterView";
import { FeedContext } from "../../../../context/FeedContext";

export function MobileCanvas() {
  const [clusters, setClusters] = useState<MobileCluster[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load ────────────────────────────────────────────────────
  useEffect(() => {
    const initial = buildMobileClusters(GRID_ITEMS).map((c) => ({
      ...c,
      id: `${c.id}-page-0`,
    }));
    setClusters(initial);
  }, []);

  // ── Load next page ──────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    pageRef.current += 1;
    const page = pageRef.current;

    timerRef.current = setTimeout(() => {
      const next = buildMobileClusters(GRID_ITEMS).map((c) => ({
        ...c,
        id: `${c.id}-page-${page}`,
      }));
      setClusters((prev) => [...prev, ...next]);
    }, 400);
  }, []);

  // ── Sentinel observer ─────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "400px" },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadMore]);

  // ── Compute flat items for FeedContext ────────────────────────────
  const flatItems = useMemo(() => clusters.flatMap((c) => c.slots.map((s) => s.item).filter(Boolean) as any[]), [clusters]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <FeedContext.Provider value={flatItems}>
      <div className="w-full h-full bg-transparent overflow-y-auto pt-16 pb-32">
        <div className="flex flex-col gap-1 w-full">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="w-full"
          >
            <MobileClusterView
              cluster={cluster}
            />
          </div>
        ))}

        {/* Infinite scroll sentinel */}
        <div
          ref={sentinelRef}
          className="h-20 w-full flex items-center justify-center mt-4"
        >
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
        </div>
      </div>
    </FeedContext.Provider>
  );
}
