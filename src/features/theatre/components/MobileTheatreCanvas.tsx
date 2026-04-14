import React, { useState, useEffect, useRef, useCallback } from "react";
import { TheatreItem, SetSelectedItem } from "../../../types";
import { GRID_ITEMS } from "../../../mock";
import { buildMobileClusters, MobileCluster, MobileSlot } from "../engine/mobileClusterBuilder";
import { EditsIcon, PostersIcon, ScriptsIcon } from "../../../components/icons/AppIcons";

interface MobileTheatreCanvasProps {
  setSelectedItem: SetSelectedItem;
}

export function MobileTheatreCanvas({ setSelectedItem }: MobileTheatreCanvasProps) {
  const [clusters, setClusters] = useState<MobileCluster[]>([]);
  const observerTarget = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);

  // Initial load
  useEffect(() => {
    const initialClusters = buildMobileClusters(GRID_ITEMS).map(c => ({
      ...c,
      id: `${c.id}-page-0`
    }));
    setClusters(initialClusters);
  }, []);

  const loadMore = useCallback(() => {
    pageRef.current += 1;
    const nextPage = pageRef.current;
    
    // Simulate slight delay for backend fetching
    setTimeout(() => {
      const moreClusters = buildMobileClusters(GRID_ITEMS).map(c => ({
        ...c,
        id: `${c.id}-page-${nextPage}`
      }));
      setClusters(current => [...current, ...moreClusters]);
    }, 400);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // Pre-load far in advance for seamless scrolling
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore]);

  return (
    <div className="w-full h-full bg-black overflow-y-auto pb-32 px-1">
      <div className="flex flex-col gap-1 w-full max-w-sm mx-auto">
        {clusters.map((cluster) => (
          <div 
            key={cluster.id} 
            className="w-full"
            style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 650px' }}
          >
            <MobileClusterView cluster={cluster} setSelectedItem={setSelectedItem} />
          </div>
        ))}
        {/* Infinite Scroll Sentinel */}
        <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-4">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

const MobileClusterView = ({ cluster, setSelectedItem }: { cluster: MobileCluster, setSelectedItem: SetSelectedItem }) => {
  // A: Feature Presentation
  if (cluster.type === 'A') {
    return (
      <div className="w-full flex flex-col gap-1">
        <MobileCard slot={cluster.slots[0]} setSelectedItem={setSelectedItem} />
        <div className="grid grid-cols-2 gap-1 w-full">
          <MobileCard slot={cluster.slots[1]} setSelectedItem={setSelectedItem} />
          <MobileCard slot={cluster.slots[2]} setSelectedItem={setSelectedItem} />
        </div>
      </div>
    );
  }
  
  // B: Asymmetric Focus (Vertical on Left, Stacked on Right)
  if (cluster.type === 'B') {
    return (
      <div className="flex w-full gap-1">
        <div className="w-1/2 flex flex-col">
          <MobileCard slot={cluster.slots[0]} setSelectedItem={setSelectedItem} forceFill />
        </div>
        <div className="w-1/2 flex flex-col gap-1">
          <MobileCard slot={cluster.slots[1]} setSelectedItem={setSelectedItem} />
          <MobileCard slot={cluster.slots[2]} setSelectedItem={setSelectedItem} />
        </div>
      </div>
    );
  }

  // C: The Stagger Flipped (Stacked on Left, Vertical on Right)
  if (cluster.type === 'C') {
    return (
      <div className="flex w-full gap-1">
        <div className="w-1/2 flex flex-col gap-1">
          <MobileCard slot={cluster.slots[0]} setSelectedItem={setSelectedItem} />
          <MobileCard slot={cluster.slots[2]} setSelectedItem={setSelectedItem} />
        </div>
        <div className="w-1/2 flex flex-col">
          <MobileCard slot={cluster.slots[1]} setSelectedItem={setSelectedItem} forceFill />
        </div>
      </div>
    );
  }
  
  // D: Pacing Block (Stacked top, IMAX bottom)
  if (cluster.type === 'D') {
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-1 w-full">
          <MobileCard slot={cluster.slots[0]} setSelectedItem={setSelectedItem} />
          <MobileCard slot={cluster.slots[1]} setSelectedItem={setSelectedItem} />
        </div>
        <MobileCard slot={cluster.slots[2]} setSelectedItem={setSelectedItem} />
      </div>
    );
  }
  
  // E: The Gallery (Two posters side by side)
  if (cluster.type === 'E') {
    return (
      <div className="grid grid-cols-2 gap-1 w-full">
        <MobileCard slot={cluster.slots[0]} setSelectedItem={setSelectedItem} />
        <MobileCard slot={cluster.slots[1]} setSelectedItem={setSelectedItem} />
      </div>
    );
  }

  return null;
}

const MobileCard = ({ slot, setSelectedItem, forceFill = false }: { slot: MobileSlot, setSelectedItem: SetSelectedItem, forceFill?: boolean }) => {
  const { item } = slot;
  const isScript = item.category === 'Script';
  const isPoster = item.category === 'Poster';
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      onClick={() => setSelectedItem(item)}
      className={`relative w-full overflow-hidden bg-zinc-900/40 border border-white/5 active:scale-[0.98] transition-transform ${forceFill ? 'h-full' : slot.aspectClass} ${isScript ? 'bg-[#f4f1ea] border-black/5' : ''}`}
    >
      {isScript ? (
        <div className="w-full h-full text-[#2a2a2a] p-4 font-mono text-[9px] leading-tight flex flex-col justify-center">
            <div className="uppercase mb-1 opacity-40 text-[6px] font-bold tracking-widest">Scene {item.id}</div>
            <div className="mb-2 font-bold uppercase tracking-tighter line-clamp-1">{item.origins || 'INT. THE CANVAS'}</div>
            <div className="mb-2 italic opacity-70 leading-relaxed line-clamp-3">
              {item.title?.split(':').length > 1 ? item.title.split(':')[1] : "A moment of cinematic reflection."}
            </div>
            <div className="text-center w-full mt-2 font-bold uppercase text-[7px] tracking-[0.2em]">{item.artist || 'DIRECTOR'}</div>
        </div>
      ) : isPoster ? (
        <div className="w-full h-full relative">
          <img 
            onLoad={() => setIsLoaded(true)}
            src={item.image} 
            alt={item.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-2 left-2 right-2 flex flex-col items-center">
            <h2 className="text-sm font-serif italic tracking-tighter text-white/90 leading-none mb-1 text-center line-clamp-1">{item.title}</h2>
            <div className="h-[1px] w-6 bg-white/30 mx-auto my-1" />
            <p className="text-[5px] uppercase tracking-[0.4em] text-white/50">{item.origins}</p>
          </div>
        </div>
      ) : (
        <img 
          onLoad={() => setIsLoaded(true)}
          src={item.image} 
          alt={item.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Video Indicator */}
      {(item.type === 'video' || item.category === 'Edit' || item.isPlay) && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
          <EditsIcon className="h-3 w-3 text-white fill-white/10 ml-0.5" />
        </div>
      )}

      {/* Poster Indicator */}
      {item.category === 'Poster' && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
          <PostersIcon className="h-2 w-2 text-white fill-white/10" />
        </div>
      )}

      {/* Script Indicator */}
      {item.category === 'Script' && (
        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-sm">
          <ScriptsIcon className="h-2 w-2 text-white fill-white/10" />
        </div>
      )}
    </div>
  );
};
