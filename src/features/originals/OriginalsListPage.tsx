import { useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { OriginalPosterCard } from "./components/OriginalPosterCard";
import { EmptyState, EMPTY_PRESETS } from "../../components/EmptyState";
import { usePaginatedOriginals } from "@/hooks/usePaginatedOriginals";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { DesktopHeader } from "../navigation/DesktopHeader";

export function OriginalsListPage() {
  const navigate = useNavigate();
  const { items, loading, loadingMore, hasMore, totalCount, loadMore } = usePaginatedOriginals(12);

  const makers = useMemo(() => [], []);
  const stars = useMemo(() => [], []);

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
                  makers={makers}
                  stars={stars}
                  index={index}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-white/70 hover:text-white transition-all active:scale-95 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Loading Next Reel…</span>
                    </>
                  ) : (
                    <span>Load More Originals</span>
                  )}
                </button>
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
