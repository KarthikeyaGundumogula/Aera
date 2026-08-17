import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from "react";

import { buildMobileClusters, MobileCluster } from "../../engine/mobileClusterBuilder";
import { MobileClusterView } from "./MobileClusterView";
import { FeedContext } from "../../../../context/FeedContext";
import { apiFetch } from "../../../../lib/api";
import type { TheatreItem } from "../../../../types";

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileCanvas() {
  const [clusters, setClusters] = useState<MobileCluster[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const isLoadingRef = useRef(true);
  const pageRef      = useRef(0);
  const sentinelRef  = useRef<HTMLDivElement>(null);
  const nextCursorRef = useRef<string | null>(null);

  useEffect(() => {
    nextCursorRef.current = nextCursor;
  }, [nextCursor]);

  useEffect(() => {
    isLoadingRef.current = true;
    apiFetch("/theatre")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const items: TheatreItem[] = json.items || json.data || [];
          const cursor: string | null = json.meta?.nextCursor || null;
          const built = buildMobileClusters(items).map((c, i) => ({ ...c, id: `${c.id}-p0-${i}` }));
          setClusters(built);
          setNextCursor(cursor);
        }
      })
      .catch((err) => {
        console.error("[MobileCanvas] Failed to fetch theatre items:", err);
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
  }, []);

  // ── Load next page ─────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    const cursor = nextCursorRef.current;
    if (isLoadingRef.current || !cursor) return;
    isLoadingRef.current = true;

    const page = pageRef.current + 1;
    pageRef.current = page;

    apiFetch(`/theatre?cursor=${encodeURIComponent(cursor)}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const items: TheatreItem[] = json.items || json.data || [];
          const newCursor: string | null = json.meta?.nextCursor || null;

          if (items.length > 0) {
            const built = buildMobileClusters(items).map((c, i) => ({ ...c, id: `${c.id}-p${page}-${i}` }));
            startTransition(() => {
              setClusters(prev => [...prev, ...built]);
              setNextCursor(newCursor);
              isLoadingRef.current = false;
            });
          } else {
            setNextCursor(null);
            isLoadingRef.current = false;
          }
        } else {
          isLoadingRef.current = false;
        }
      })
      .catch((err) => {
        console.error("[MobileCanvas] Failed to load more theatre items:", err);
        isLoadingRef.current = false;
      });
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

          {/* Infinite scroll sentinel when nextCursor exists, or End of Feed message when depleted */}
          {nextCursor ? (
            <div
              ref={sentinelRef}
              className="h-16 w-full flex items-center justify-center mt-2"
              aria-hidden="true"
            >
              <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-xl animate-spin" />
            </div>
          ) : (
            clusters.length > 0 && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-40">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white">No More Works</p>
              </div>
            )
          )}
        </div>
      </div>
    </FeedContext.Provider>
  );
}
