import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { TheatreItem } from "../../../types";
import { buildClusters, Cluster } from "../engine/clusterBuilder";
import { buildMobileClusters, MobileCluster } from "../engine/mobileClusterBuilder";
import { StaticDesktopCluster } from "./desktop/StaticDesktopCluster";
import { MobileClusterView } from "./mobile/MobileClusterView";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

interface UnifiedTheatreProps {
  works: TheatreItem[];
  variant?: "preview" | "full";
  title?: string;
  subtitle?: string;
  onExit?: () => void;
  maxClusters?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

/**
 * UnifiedTheatre — A shared engine for rendering cinematic cluster grids.
 * Used in: Profile previews, Originals Theatre, Artist Theatre, and Global Theatre.
 */
export const UnifiedTheatre: React.FC<UnifiedTheatreProps> = ({
  works,
  variant = "full",
  title,
  subtitle,
  onExit,
  maxClusters,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const isMobile = useMediaQuery();
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  const isFull = variant === "full";

  // Build clusters from the provided works
  const allClusters = useMemo(() => {
    if (!works.length) return { desktop: [], mobile: [] };
    
    let dClusters = buildClusters(works, "flow");
    let mClusters = buildMobileClusters(works);

    if (maxClusters) {
      dClusters = dClusters.slice(0, maxClusters);
      mClusters = mClusters.slice(0, maxClusters);
    }

    return {
      desktop: dClusters,
      mobile: mClusters,
    };
  }, [works, maxClusters]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isFull || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (bottomObserverTarget.current) {
      observer.observe(bottomObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [isFull, onLoadMore, hasMore, isLoading]);

  if (!works.length && !isLoading) {
    return (
      <div className="h-[40vh] flex flex-col items-center justify-center text-center opacity-40">
        <p className="text-xs uppercase tracking-[0.4em] font-black">Archive Empty</p>
        <div className="w-12 h-px bg-white/20 mt-4" />
      </div>
    );
  }

  return (
    <div className={`w-full ${isFull ? "min-h-screen bg-[#050505] text-white" : ""}`}>
      {/* FULL PAGE HEADER */}
      {isFull && (
        <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5">
          <button 
            onClick={onExit}
            className="group flex items-center gap-3 hover:text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1 text-white/40 group-hover:text-white" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">EXIT THEATRE</span>
              {subtitle && <span className="text-xs font-black uppercase tracking-tight">{subtitle}</span>}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title || "Theatre"}</span>
          </div>
        </header>
      )}

      {/* THEATRE CANVAS */}
      <main className={isFull ? "pt-24 pb-20" : ""}>
        <div className="flex flex-col" style={{ gap: "2px" }}>
          {isMobile ? (
            allClusters.mobile.map((cluster) => (
              <MobileClusterView key={cluster.id} cluster={cluster} />
            ))
          ) : (
            allClusters.desktop.map((cluster, idx) => (
              <StaticDesktopCluster key={cluster.id || idx} cluster={cluster} />
            ))
          )}
        </div>

        {/* LOADING / SENTINEL */}
        {isFull && (onLoadMore || isLoading) && (
          <div ref={bottomObserverTarget} className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            {isLoading ? (
              <>
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
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
