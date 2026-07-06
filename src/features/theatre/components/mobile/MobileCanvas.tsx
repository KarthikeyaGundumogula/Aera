import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from "react";

import { GRID_ITEMS } from "../../../../mock";
import { buildMobileClusters, MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileClusterView } from "./MobileClusterView";
import { FeedContext } from "../../../../context/FeedContext";
import type { TheatreItem } from "../../../../types";

// ─── Module-level cluster cache ───────────────────────────────────────────────
// buildMobileClusters is pure and deterministic for the same GRID_ITEMS input.
// Pre-computing it once at module load avoids blocking the first paint on mount.
const INITIAL_CLUSTERS: MobileCluster[] = buildMobileClusters(GRID_ITEMS).map(
  (c, i) => ({ ...c, id: `${c.id}-p0-${i}` }),
);

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileCanvas() {
  const [clusters, setClusters] = useState<MobileCluster[]>(INITIAL_CLUSTERS);

  // isLoadingRef: mutable flag that guards against sentinel firing twice
  // while a page is being appended. Using a ref (not state) avoids a re-render.
  const isLoadingRef = useRef(false);
  const pageRef      = useRef(0);
  const sentinelRef  = useRef<HTMLDivElement>(null);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load next page ─────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    // Hard gate: ignore the sentinel if a load is already in flight.
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    pageRef.current += 1;
    const page = pageRef.current;

    timerRef.current = setTimeout(() => {
      const next = buildMobileClusters(GRID_ITEMS).map(
        (c, i) => ({ ...c, id: `${c.id}-p${page}-${i}` }),
      );

      // startTransition marks the append as non-urgent so the browser can
      // keep the current frame interactive while React schedules the update.
      startTransition(() => {
        setClusters(prev => [...prev, ...next]);
        isLoadingRef.current = false;
      });
    }, 300);
  }, []);

  // ── Sentinel IntersectionObserver ──────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      // rootMargin pre-loads the next page before the user hits the bottom.
      { threshold: 0.05, rootMargin: "600px" },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadMore]);

  // ── FeedContext flat items ─────────────────────────────────────────────────
  // Only recomputed when the clusters array reference changes (i.e. on append).
  const flatItems = useMemo<TheatreItem[]>(
    () => clusters.flatMap(c => c.slots.map(s => s.item).filter((item): item is TheatreItem => item != null)),
    [clusters],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <FeedContext.Provider value={flatItems}>
      <div className="w-full h-full bg-transparent overflow-y-auto pt-16 pb-32">
        <div className="flex flex-col gap-0 w-full">
          {clusters.map((cluster) => (
            // `content-visibility: auto` tells the browser it can skip layout
            // and paint for off-screen clusters entirely, which is the single
            // biggest GPU/CPU win on a long mobile scroll list.
            <div
              key={cluster.id}
              className="w-full"
              style={{ height: "40dvh", contentVisibility: "auto", containIntrinsicSize: "0 40dvh" }}
            >
              <MobileClusterView cluster={cluster} />
            </div>
          ))}

          {/* Infinite scroll sentinel — kept small, spinner hidden by default */}
          <div
            ref={sentinelRef}
            className="h-16 w-full flex items-center justify-center mt-2"
            aria-hidden="true"
          >
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-xl animate-spin" />
          </div>
        </div>
      </div>
    </FeedContext.Provider>
  );
}
