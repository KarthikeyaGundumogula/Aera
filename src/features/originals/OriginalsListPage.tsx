import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { OriginalPosterCard } from "./components/OriginalPosterCard";
import { EmptyState, EMPTY_PRESETS } from "../../components/EmptyState";
import { usePaginatedOriginals } from "@/hooks/usePaginatedOriginals";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { DesktopHeader } from "../navigation/DesktopHeader";

export function OriginalsListPage() {
  // Page size 24 cleanly fills 8, 6, 4, 3, and 2 column responsive layouts without row gaps
  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedOriginals(24);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  // Automated infinite scroll triggered when scrolling near the end of the list
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "600px" }
    );

    if (bottomObserverTarget.current) {
      observer.observe(bottomObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, loadMore]);

  return (
    <div
      className="min-h-screen bg-black text-white overflow-y-auto no-scrollbar"
      style={{ touchAction: "manipulation" }}
    >
      <MobileTopHeader />
      <DesktopHeader />

      {/* ── POSTER GRID ──────────────────────────────────────────────── */}
      <main
        className="pt-20 md:pt-24 px-4 md:px-8 pb-28"
        aria-label="Originals poster grid"
      >
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
              Fetching Originals Archive…
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-4 md:gap-5 items-stretch">
              {items.map((original, index) => (
                <OriginalPosterCard
                  key={original.id}
                  original={original}
                  index={index}
                />
              ))}
            </div>

            {/* Automated Infinite Scroll Sentinel & Loading Indicator */}
            {hasMore && (
              <div ref={bottomObserverTarget} className="py-10 flex justify-center items-center">
                {loadingMore && (
                  <div className="flex items-center gap-2.5 text-white/50">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em]">
                      Loading Next Originals Reel…
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state (defensive) */}
        {!loading && items.length === 0 && (
          <div className="py-12">
            <EmptyState {...EMPTY_PRESETS.originals} />
          </div>
        )}
      </main>
    </div>
  );
}
