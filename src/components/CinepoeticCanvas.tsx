import { motion, useMotionValue, useSpring } from "motion/react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { CLUSTER_TEMPLATES, ClusterTemplate, ClusterBlock } from "../constants/gridTemplates";
import { TheatreItem, SetSelectedItem } from "../types";
import { GRID_ITEMS } from "../data/mockData";

interface CinepoeticCanvasProps {
  setSelectedItem: SetSelectedItem;
}

const UNIT_SIZE = 60; // Size of one grid unit (3x3 square is 3*UNIT_SIZE)
const CLUSTER_WIDTH = 12 * UNIT_SIZE;
const CLUSTER_HEIGHT = 9 * UNIT_SIZE;

// Helper to get a deterministic template for a grid position
const getTemplateForPos = (x: number, y: number): ClusterTemplate => {
  const index = Math.abs((x * 31 + y * 17) % CLUSTER_TEMPLATES.length);
  return CLUSTER_TEMPLATES[index];
};

// Helper to get deterministic items for a block
const getItemsForBlock = (clusterX: number, clusterY: number, blockIndex: number): TheatreItem => {
  const index = Math.abs((clusterX * 13 + clusterY * 7 + blockIndex * 3) % GRID_ITEMS.length);
  return GRID_ITEMS[index];
};

export function CinepoeticCanvas({ setSelectedItem }: CinepoeticCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, w: 0, h: 0 });
  
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
    const unsubY = springY.on("change", updateViewportPos);

    return () => {
      unsubX();
      unsubY();
    };
  }, [springX, springY]);

  // Handle wheel scrolling
  const onWheel = (e: React.WheelEvent) => {
    camX.set(camX.get() - e.deltaX);
    camY.set(camY.get() - e.deltaY);
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
    
    camX.set(camX.get() + dx);
    camY.set(camY.get() + dy);
    
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Calculate visible clusters
  const visibleClusters = useMemo<{ x: number; y: number }[]>(() => {
    // Use a slightly larger buffer for smoother infinite feel
    const startCol = Math.floor(viewport.x / CLUSTER_WIDTH) - 2;
    const endCol = Math.ceil((viewport.x + viewport.w) / CLUSTER_WIDTH) + 2;
    const startRow = Math.floor(viewport.y / CLUSTER_HEIGHT) - 2;
    const endRow = Math.ceil((viewport.y + viewport.h) / CLUSTER_HEIGHT) + 2;

    const clusters: { x: number; y: number }[] = [];
    for (let x = startCol; x <= endCol; x++) {
      for (let y = startRow; y <= endRow; y++) {
        clusters.push({ x, y });
      }
    }
    return clusters;
  }, [viewport]);

  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    
    camX.set(camX.get() + dx);
    camY.set(camY.get() + dy);
    
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black cursor-grab active:cursor-grabbing select-none overscroll-none touch-none"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      <motion.div 
        style={{ x: springX, y: springY }}
        className="absolute top-0 left-0"
      >
        {visibleClusters.map(({ x, y }) => (
          <Cluster 
            key={`${x}-${y}`} 
            x={x} 
            y={y} 
            setSelectedItem={setSelectedItem}
          />
        ))}
      </motion.div>

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

const Cluster: React.FC<{ x: number; y: number; setSelectedItem: SetSelectedItem }> = ({ x, y, setSelectedItem }) => {
  const template = getTemplateForPos(x, y);
  
  return (
    <div 
      className="absolute"
      style={{
        left: x * CLUSTER_WIDTH,
        top: y * CLUSTER_HEIGHT,
        width: CLUSTER_WIDTH,
        height: CLUSTER_HEIGHT,
      }}
    >
      <div className="grid grid-cols-12 grid-rows-9 w-full h-full">
        {template.blocks.map((block, i) => (
          <Card 
            key={i} 
            block={block} 
            item={getItemsForBlock(x, y, i)}
            setSelectedItem={setSelectedItem}
          />
        ))}
      </div>
    </div>
  );
};

const Card: React.FC<{ block: ClusterBlock; item: TheatreItem; setSelectedItem: SetSelectedItem }> = ({ block, item, setSelectedItem }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(item, [item], 1);
      }}
      className="relative group overflow-hidden border-[0.5px] border-white/5"
      style={{
        gridColumn: `span ${block.w}`,
        gridRow: `span ${block.h}`,
      }}
    >
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-full object-cover transition-all duration-500 group-hover:object-contain bg-black"
        referrerPolicy="no-referrer"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">{item.category || "Moment"}</p>
        <h4 className="text-xs font-bold uppercase tracking-tighter leading-none">{item.title}</h4>
      </div>
    </motion.div>
  );
};
