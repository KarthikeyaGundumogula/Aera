import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { ORIGINALS_DATA } from "../../mock";
import { buildClusters } from "../theatre/engine/clusterBuilder";
import { buildMobileClusters } from "../theatre/engine/mobileClusterBuilder";
import { StaticDesktopCluster } from "../theatre/components/desktop/StaticDesktopCluster";
import { MobileClusterView } from "../theatre/components/mobile/MobileClusterView";
import { PosterModal, ScriptModal, EditModal } from "../shared/modals";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { TheatreItem } from "../../types";


export function OriginalsTheatrePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery();
  const [selectedItem, setSelectedItem] = useState<TheatreItem | null>(null);

  const original = id ? ORIGINALS_DATA[id] : null;

  const originalContent = original?.works || [];

  const handleSelectItem = useCallback((item: TheatreItem | null) => {
    setSelectedItem(item);
  }, []);

  const clusters = useMemo(() => {
    if (!originalContent.length) return { desktop: [], mobile: [] };
    return {
      desktop: buildClusters(originalContent, 'flow'),
      mobile: buildMobileClusters(originalContent)
    };
  }, [originalContent]);

  const [visibleDesktop, setVisibleDesktop] = useState<any[]>([]);
  const [visibleMobile, setVisibleMobile] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomObserverTarget = useRef<HTMLDivElement>(null);

  // Initialize visible clusters
  useEffect(() => {
    if (clusters.desktop.length > 0) {
      setVisibleDesktop(clusters.desktop);
      setVisibleMobile(clusters.mobile);
    }
  }, [clusters]);

  const loadMore = useCallback(() => {
    if (isLoading || !originalContent.length) return;
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setVisibleDesktop(prev => [
        ...prev, 
        ...clusters.desktop.map(c => ({ ...c, id: `${c.id}-clone-${Math.random()}` }))
      ]);
      setVisibleMobile(prev => [
        ...prev, 
        ...clusters.mobile.map(c => ({ ...c, id: `${c.id}-clone-${Math.random()}` }))
      ]);
      setIsLoading(false);
    }, 600);
  }, [isLoading, clusters, originalContent.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (bottomObserverTarget.current) {
      observer.observe(bottomObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!original) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Fixed Sticky Header */}
      <header className="fixed top-0 left-0 w-full z-50 p-6 flex items-center justify-between backdrop-blur-md bg-black/20 border-b border-white/5">
        <button 
          onClick={() => navigate(`/originals/${original.id}`)}
          className="group flex items-center gap-3 hover:text-white/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">EXIT THEATRE</span>
            <span className="text-xs font-black uppercase tracking-tight">{original.title}</span>
          </div>
        </button>

        <div className="flex items-center gap-4">
           {/* Minimalist Theatre Indicator */}
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Originals Theatre</span>
           </div>
        </div>
      </header>

      {/* Vertical Scroll Canvas */}
      <main className="pt-20 pb-24">
        <div className="flex flex-col" style={{ gap: "2px" }}>
          {isMobile ? (
            visibleMobile.map((cluster) => (
              <MobileClusterView 
                key={cluster.id} 
                cluster={cluster} 
                setSelectedItem={handleSelectItem} 
              />
            ))
          ) : (
            visibleDesktop.map((cluster, idx) => (
              <StaticDesktopCluster 
                key={cluster.id || idx} 
                cluster={cluster} 
                setSelectedItem={handleSelectItem} 
              />
            ))
          )}
        </div>

        {/* Sentinel for Infinite Scroll */}
        <div 
          ref={bottomObserverTarget} 
          className="h-40 flex items-center justify-center opacity-20"
        >
          {originalContent.length > 0 && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              <p className="text-[8px] font-bold uppercase tracking-[0.2em]">Curating More Content</p>
            </div>
          )}
        </div>

        {/* Empty state if no items at all */}
        {originalContent.length === 0 && (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center opacity-40">
                <p className="text-sm uppercase tracking-widest">End of Archive</p>
                <div className="w-12 h-px bg-white/20 mt-4" />
            </div>
        )}
      </main>

      {selectedItem?.category === "Edit" && (
        <EditModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.category === "Poster" && (
        <PosterModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      {selectedItem?.category === "Script" && (
        <ScriptModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Footer Branding */}
      <footer className="p-12 border-t border-white/5 flex flex-col items-center gap-6 opacity-30">
         <div className="h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent" />
         <p className="text-[10px] uppercase font-bold tracking-[0.4em]">Framehouse Theatre Engine v2.0</p>
      </footer>
    </div>
  );
}
