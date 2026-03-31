import { motion, useMotionValue, useSpring, AnimatePresence, useTransform, MotionValue } from "motion/react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Sparkles, PenTool } from "lucide-react";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS } from "../data/mockData";
import { buildClusters, Cluster as ClusterData, ClusterSlot } from "../lib/clusterBuilder";
import { Tooltip } from "./Tooltip";

interface CinepoeticCanvasProps {
  setSelectedItem: SetSelectedItem;
  onScroll?: (y: number) => void;
}

const UNIT_SIZE = 62; // Tightened from 64
const GAP = 4; // Minimal spacing between clusters
const CLUSTER_WIDTH = 12 * UNIT_SIZE;
const CLUSTER_HEIGHT = 9 * UNIT_SIZE;

export function CinepoeticCanvas({ setSelectedItem, onScroll }: CinepoeticCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: 0, h: 0 });
  
  // Pre-calculate clusters using the new algorithm
  const clusterPool = useMemo(() => buildClusters(GRID_ITEMS), []);

  // Camera position
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  
  // Smooth camera
  const springX = useSpring(camX, { damping: 30, stiffness: 200 });
  const springY = useSpring(camY, { damping: 30, stiffness: 200 });

  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setViewport(prev => ({ ...prev, w: width, h: height }));
      }
    };
    
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Sync viewport with camera (using spring values for smooth culling)
  useEffect(() => {
    const updateViewportPos = () => {
      setViewport(prev => ({
        ...prev,
        x: -springX.get(),
        y: -springY.get()
      }));
    };

    const unsubX = springX.on("change", updateViewportPos);
    const unsubY = springY.on("change", (v) => {
      updateViewportPos();
      if (onScroll) onScroll(v);
    });

    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY]);

  // Handle wheel scrolling
  const onWheel = (e: React.WheelEvent) => {
    const nextX = camX.get() - e.deltaX;
    const nextY = camY.get() - e.deltaY;
    
    // Clamp to prevent scrolling left and top (only allow right and bottom)
    camX.set(Math.min(0, nextX));
    camY.set(Math.min(0, nextY));
  };

  // Handle panning
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    
    const nextX = camX.get() + dx;
    const nextY = camY.get() + dy;
    
    // Clamp to prevent scrolling left and top (only allow right and bottom)
    camX.set(Math.min(0, nextX));
    camY.set(Math.min(0, nextY));
    
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Calculate visible clusters based on camera position
  const visibleClusters = useMemo<{ x: number; y: number }[]>(() => {
    // Use a buffer for smoother infinite feel
    const startCol = Math.floor(viewport.x / (CLUSTER_WIDTH + GAP)) - 1;
    const endCol = Math.ceil((viewport.x + viewport.w) / (CLUSTER_WIDTH + GAP)) + 1;
    const startRow = Math.floor(viewport.y / (CLUSTER_HEIGHT + GAP)) - 1;
    const endRow = Math.ceil((viewport.y + viewport.h) / (CLUSTER_HEIGHT + GAP)) + 1;

    const clusters: { x: number; y: number }[] = [];
    for (let x = startCol; x <= endCol; x++) {
      for (let y = startRow; y <= endRow; y++) {
        clusters.push({ x, y });
      }
    }
    return clusters;
  }, [viewport.x, viewport.y, viewport.w, viewport.h]);

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    
    const nextX = camX.get() + dx;
    const nextY = camY.get() + dy;
    
    // Clamp to prevent scrolling left and top (only allow right and bottom)
    camX.set(Math.min(0, nextX));
    camY.set(Math.min(0, nextY));
    
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black cursor-grab active:cursor-grabbing select-none overscroll-none touch-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* Clusters rendered absolutely relative to the viewport */}
      <AnimatePresence mode="popLayout">
        {visibleClusters.map(({ x, y }) => {
          const clusterData = clusterPool[Math.abs((x * 31 + y * 17) % clusterPool.length)];
          return (
            <Cluster 
              key={`${x}-${y}`} 
              x={x} 
              y={y} 
              clusterData={clusterData}
              camX={springX}
              camY={springY}
              setSelectedItem={setSelectedItem}
            />
          );
        })}
      </AnimatePresence>

      {/* UI Overlay */}
      <div className="absolute bottom-8 left-8 z-50">
        <button 
          onClick={() => {
            camX.set(0);
            camY.set(0);
          }}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors flex items-center gap-2">
            <span>Coordinates: {Math.floor(viewport.x)}, {Math.floor(viewport.y)}</span>
            <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
            <span className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">Return to Origin</span>
          </p>
        </button>
      </div>
    </div>
  );
}

const Cluster: React.FC<{ 
  x: number; 
  y: number; 
  clusterData: ClusterData;
  camX: MotionValue<number>; 
  camY: MotionValue<number>; 
  setSelectedItem: SetSelectedItem 
}> = ({ x, y, clusterData, camX, camY, setSelectedItem }) => {
  const left = x * (CLUSTER_WIDTH + GAP);
  const top = y * (CLUSTER_HEIGHT + GAP);

  const posX = useTransform(camX, (v: number) => v + left);
  const posY = useTransform(camY, (v: number) => v + top);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute top-0 left-0"
      style={{
        x: posX,
        y: posY,
        width: CLUSTER_WIDTH,
        height: CLUSTER_HEIGHT,
      }}
    >
      <div className="grid grid-cols-12 grid-rows-9 w-full h-full gap-1">
        {clusterData.slots.map((slot, i) => (
          <Card 
            key={i} 
            slot={slot} 
            item={slot.item!}
            setSelectedItem={setSelectedItem}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Card: React.FC<{ slot: ClusterSlot; item: TheatreItem; setSelectedItem: SetSelectedItem }> = ({ slot, item, setSelectedItem }) => {
  const isScript = item.category === 'Script';
  const isPoster = item.category === 'Poster';
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: isPoster ? 1.05 : 1.02, 
        zIndex: 20,
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(item, [item], 1);
      }}
      className={`relative group overflow-hidden border border-white/10 bg-zinc-900/20 rounded-sm transition-all duration-500 ${isPoster ? 'ring-1 ring-white/5' : ''}`}
      style={{
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
      }}
    >
      {isScript ? (
        <div className="w-full h-full bg-[#f4f1ea] text-[#2a2a2a] p-6 font-mono text-[10px] leading-tight overflow-hidden shadow-inner border border-black/5 flex flex-col justify-center select-text">
           <div className="uppercase mb-2 opacity-40 text-[7px] font-bold tracking-widest">Scene {item.id}</div>
           <div className="mb-2 font-bold uppercase tracking-tighter">{item.origins || 'INT. THE CANVAS - DAY'}</div>
           <div className="mb-4 italic opacity-70 leading-relaxed">
             {item.title.split(':').length > 1 ? item.title.split(':')[1] : "A moment of pure cinematic reflection, captured in the void of the grid."}
           </div>
           <div className="text-center w-full mb-1 mt-2 font-bold uppercase text-[8px] tracking-[0.2em]">{item.artist || 'DIRECTOR'}</div>
           <div className="text-center w-full px-4 italic opacity-90">
             "{item.title.split(':')[0]}"
           </div>
           <div className="mt-6 pt-4 border-t border-black/5 opacity-20 text-[6px] uppercase tracking-widest flex justify-between">
             <span>Draft v2.4</span>
             <span>{item.credits} Credits</span>
           </div>
        </div>
      ) : isPoster ? (
        <div className="w-full h-full relative overflow-hidden">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            onLoad={() => setIsLoaded(true)}
            src={item.image} 
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border-[12px] border-transparent group-hover:border-white/10 transition-all duration-500">
            <div className="text-center">
              <h2 className="text-lg font-serif italic tracking-tighter text-white/90 leading-none mb-1">{item.title}</h2>
              <div className="h-[1px] w-8 bg-white/30 mx-auto my-2" />
              <p className="text-[6px] uppercase tracking-[0.4em] text-white/50">{item.origins}</p>
            </div>
          </div>
        </div>
      ) : (
        <motion.img 
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          onLoad={() => setIsLoaded(true)}
          src={item.image} 
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-700 group-hover:object-contain bg-black/40"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Video Indicator */}
      {(item.type === 'video' || item.category === 'Edit' || item.isPlay) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Tooltip content="Motion Edit" position="bottom">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group/play pointer-events-auto"
            >
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-md scale-150 group-hover/play:bg-white/30 transition-colors duration-700" />
              
              {/* Main Badge */}
              <div className="relative w-12 h-12 rounded-full bg-black/30 backdrop-blur-2xl border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                <Play size={18} className="text-white fill-white/10 ml-1 group-hover/play:scale-110 transition-transform duration-500" />
                
                {/* Scanning Light Effect */}
                <motion.div 
                  animate={{ 
                    x: [-60, 60],
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                />
              </div>
            </motion.div>
          </Tooltip>
        </div>
      )}

      {/* Poster Indicator */}
      {item.category === 'Poster' && (
        <div className="absolute top-3 right-3 z-10">
          <Tooltip content="Design Edit" position="bottom">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group/sparkle pointer-events-auto"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/sparkle:bg-white/30 transition-colors duration-500" />
              <div className="relative w-7 h-7 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden">
                <Sparkles size={12} className="text-white fill-white/10 group-hover/sparkle:rotate-12 transition-transform" />
                <motion.div 
                  animate={{ x: [-40, 40] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                />
              </div>
            </motion.div>
          </Tooltip>
        </div>
      )}

      {/* Script Indicator */}
      {item.category === 'Script' && (
        <div className="absolute bottom-3 right-3 z-10">
          <Tooltip content="Script Edit" position="top">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group/pen pointer-events-auto"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm scale-125 group-hover/pen:bg-white/30 transition-colors duration-500" />
              <div className="relative w-7 h-7 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                <PenTool size={12} className="text-white fill-white/10 group-hover/pen:scale-110 transition-transform duration-500" />
                <motion.div 
                  animate={{ x: [-40, 40] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                />
              </div>
            </motion.div>
          </Tooltip>
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">
          {slot.type} // {item.aspectRatio?.toFixed(2) || (slot.w / slot.h).toFixed(2)}
        </p>
        <h4 className="text-xs font-bold uppercase tracking-tighter leading-none">
          {item.title}
        </h4>
      </div>
    </motion.div>
  );
};
