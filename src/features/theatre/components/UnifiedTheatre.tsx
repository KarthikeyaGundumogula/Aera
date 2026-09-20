import React, { useMemo, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { TheatreItem } from "../../../types";
import { buildClustersWithRemainder } from "../engine/clusterBuilder";
import { buildMobileClustersWithRemainder } from "../engine/mobileClusterBuilder";
import { StaticDesktopCluster } from "./desktop/StaticDesktopCluster";
import { MobileClusterView } from "./mobile/MobileClusterView";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { FeedContext } from "../../../context/FeedContext";
import { EmptyState, EMPTY_PRESETS } from "../../../components/EmptyState";
import {
  EditWork,
  PosterWork,
  StoryboardWork,
  RecommendationWork,
  getWorkKind,
} from "../../shared/work";

const RenderPartialWork = ({ item, isMobile }: { item: TheatreItem; isMobile: boolean }) => {
  const kind = getWorkKind(item);
  const variant = isMobile ? "theatre-mobile" : "theatre-desktop";

  let containerStyle = "w-full max-w-xl aspect-[16/9]";
  if (kind === "poster") {
    containerStyle = isMobile
      ? "w-full max-w-sm aspect-[2/3] mx-auto"
      : "w-[280px] h-[420px] aspect-[2/3]";
  } else if (kind === "storyboard") {
    containerStyle = isMobile
      ? "w-full max-w-sm aspect-[3/4] mx-auto"
      : "w-[320px] h-[420px] aspect-[3/4]";
  } else if (kind === "edit") {
    containerStyle = isMobile
      ? "w-full aspect-[16/9]"
      : "w-[540px] h-[303px] aspect-[16/9]";
  } else if (kind === "recommendation") {
    containerStyle = isMobile
      ? "w-full max-w-sm aspect-[3/4] mx-auto"
      : "w-[340px] h-[420px] aspect-[3/4]";
  }

  return (
    <div className={`relative overflow-hidden rounded-none border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-[1.02] ${containerStyle}`}>
      {kind === "recommendation" && <RecommendationWork item={item} variant={variant} />}
      {kind === "storyboard" && <StoryboardWork item={item} variant={variant} />}
      {kind === "poster" && <PosterWork item={item} variant={variant} />}
      {kind === "edit" && <EditWork item={item} variant={variant} />}
    </div>
  );
};

interface UnifiedTheatreProps {
  works: TheatreItem[];
  variant?: "preview" | "full";
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
  onExit?: () => void;
  maxClusters?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  disablePadding?: boolean;
}

/**
 * UnifiedTheatre — A shared engine for rendering cinematic cluster grids.
 * Used in: Profile previews, Originals Theatre, Artist Theatre, and Global Theatre.
 */
export const UnifiedTheatre: React.FC<UnifiedTheatreProps> = ({
  works,
  variant = "full",
  showHeader: explicitShowHeader,
  title,
  subtitle,
  onExit,
  maxClusters,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  disablePadding = false,
}) => {
  const isMobile = useMediaQuery();
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  const isFull = variant === "full";
  const showHeader = explicitShowHeader ?? (isFull && Boolean(onExit || subtitle));
  const safeWorks = useMemo(() => (Array.isArray(works) ? works : []), [works]);

  // Build clusters & stacked remainders from the provided works
  const allClusters = useMemo(() => {
    if (!safeWorks.length) return {
      desktop: { clusters: [], stackedItems: [] },
      mobile: { clusters: [], stackedItems: [] }
    };
    
    let dResult = buildClustersWithRemainder(safeWorks, "flow");
    let mResult = buildMobileClustersWithRemainder(safeWorks);

    if (maxClusters && maxClusters > 0) {
      dResult.clusters = dResult.clusters.slice(0, maxClusters);
      mResult.clusters = mResult.clusters.slice(0, maxClusters);
    }

    return {
      desktop: dResult,
      mobile: mResult,
    };
  }, [safeWorks, maxClusters]);

  // Flatten the clustered items so the modal reels navigate them sequentially
  const desktopFlatItems = useMemo(() => {
    const list: TheatreItem[] = [];
    allClusters.desktop.clusters.forEach(c => {
      c.slots.forEach(s => {
        if (s.item) list.push(s.item);
      });
    });
    list.push(...allClusters.desktop.stackedItems);
    return list;
  }, [allClusters.desktop]);

  const mobileFlatItems = useMemo(() => {
    const list: TheatreItem[] = [];
    allClusters.mobile.clusters.forEach(c => {
      c.slots.forEach(s => {
        if (s.item) list.push(s.item);
      });
    });
    list.push(...allClusters.mobile.stackedItems);
    return list;
  }, [allClusters.mobile]);

  // Infinite Scroll Trigger via Intersection Observer
  useEffect(() => {
    if (!isFull || !onLoadMore || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "600px" }
    );

    if (bottomObserverTarget.current) {
      observer.observe(bottomObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [isFull, onLoadMore, hasMore, isLoading]);

  if (!safeWorks.length && !isLoading) {
    return (
      <div className="py-12 px-4">
        <EmptyState {...EMPTY_PRESETS.theatre} />
      </div>
    );
  }

  return (
    <div className={`w-full ${isFull ? "min-h-screen bg-surface-deep text-white" : ""}`}>
      {/* FULL PAGE HEADER */}
      {isFull && showHeader && (
        <header className="sticky top-0 z-40 bg-surface-deep/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-white/40 font-semibold tracking-widest">Back to</span>
              {subtitle && <span className="text-xs font-black uppercase tracking-tight">{subtitle}</span>}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-xl bg-brand-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title || "Theatre"}</span>
          </div>
        </header>
      )}

      {/* THEATRE CANVAS */}
      <main className={isFull && showHeader && !disablePadding ? "pt-24 pb-20" : ""}>
        {isMobile ? (
          <FeedContext.Provider value={mobileFlatItems.length > 0 ? mobileFlatItems : safeWorks}>
            <div className="flex flex-col gap-0 w-full">
              {/* 1. Mobile Clusters */}
              {allClusters.mobile.clusters.map((cluster) => (
                <div key={cluster.id} className="w-full h-[40dvh] min-h-[260px] relative">
                  <MobileClusterView cluster={cluster} />
                </div>
              ))}

              {/* 2. Mobile Stacked Remaining Items */}
              {allClusters.mobile.stackedItems.length > 0 && (
                <div className="flex flex-col gap-0 w-full max-w-xl mx-auto px-4">
                  {allClusters.mobile.stackedItems.map((item) => (
                    <RenderPartialWork key={item.id} item={item} isMobile={true} />
                  ))}
                </div>
              )}
            </div>
          </FeedContext.Provider>
        ) : (
          <FeedContext.Provider value={desktopFlatItems.length > 0 ? desktopFlatItems : safeWorks}>
            <div className="flex flex-col gap-0 w-full">
              {/* 1. Desktop Clusters */}
              {allClusters.desktop.clusters.map((cluster, idx) => (
                <StaticDesktopCluster key={cluster.id || `dc-${idx}`} cluster={cluster} />
              ))}

              {/* 2. Desktop Stacked Remaining Items */}
              {allClusters.desktop.stackedItems.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-0 w-full max-w-6xl mx-auto px-4 md:px-8 py-4">
                  {allClusters.desktop.stackedItems.map((item) => (
                    <div key={item.id} className="flex-shrink-0">
                      <RenderPartialWork item={item} isMobile={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FeedContext.Provider>
        )}

        {/* LOADING / SENTINEL */}
        {isFull && (onLoadMore || isLoading) && (
          <div ref={bottomObserverTarget} className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            {isLoading ? (
              <>
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-xl animate-spin" />
                <p className="text-[8px] font-bold uppercase tracking-[0.2em]">loading</p>
              </>
            ) : hasMore ? (
              <div className="h-20" /> 
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-[8px] font-bold uppercase tracking-[0.2em]">End</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
