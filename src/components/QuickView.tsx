import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Info, List, X, History, User } from "lucide-react";
import { TheatreItem } from "../types";
import { CreditsIcon } from "./AppIcons";

declare global {
  interface Window {
    twttr: any;
  }
}

interface QuickViewProps {
  selectedItem: TheatreItem | null;
  setSelectedItem: (item: TheatreItem | null) => void;
  isMobile: boolean;
  items: TheatreItem[];
  columns: number;
}

export function QuickView({ selectedItem, setSelectedItem, isMobile, items, columns }: QuickViewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [twitterReady, setTwitterReady] = useState(false);
  const twitterContainerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (selectedItem) {
      const index = items.findIndex(item => item.id === selectedItem.id);
      setCurrentIndex(index !== -1 ? index : 0);
      document.body.style.overflow = "hidden";
    } else {
      setCurrentIndex(-1);
      setShowQueue(false);
      setShowInfo(false);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem, items]);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (currentIndex === -1) return;

    const row = Math.floor(currentIndex / columns);
    const col = currentIndex % columns;
    const totalRows = Math.ceil(items.length / columns);

    let nextIndex = currentIndex;

    switch (direction) {
      case 'left':
        if (col > 0) nextIndex = currentIndex - 1;
        break;
      case 'right':
        if (col < columns - 1 && currentIndex + 1 < items.length) nextIndex = currentIndex + 1;
        break;
      case 'up':
        if (row > 0) nextIndex = currentIndex - columns;
        break;
      case 'down':
        if (row < totalRows - 1 && currentIndex + columns < items.length) nextIndex = currentIndex + columns;
        break;
    }

    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, columns, items]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return;
      if (e.key === "ArrowDown") handleMove('down');
      if (e.key === "ArrowUp") handleMove('up');
      if (e.key === "ArrowLeft") handleMove('left');
      if (e.key === "ArrowRight") handleMove('right');
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, handleMove, setSelectedItem]);

  const resetTimer = useCallback(() => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const timeout = isMobile ? 5000 : 3000;
    timeoutRef.current = setTimeout(() => {
      if (!showQueue && !showInfo) {
        setShowControls(false);
      }
    }, timeout);
  }, [isMobile, showQueue, showInfo]);

  useEffect(() => {
    if (selectedItem) {
      resetTimer();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedItem, resetTimer]);

  const currentVideo = items[currentIndex];

  useEffect(() => {
    if (window.twttr) {
      setTwitterReady(true);
    } else {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        window.twttr.ready(() => setTwitterReady(true));
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (currentVideo?.twitterId && twitterReady && window.twttr?.widgets) {
      if (twitterContainerRef.current) {
        twitterContainerRef.current.innerHTML = '';
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'twitter-tweet';
        blockquote.setAttribute('data-media-max-width', '560');
        blockquote.setAttribute('data-theme', 'dark');
        blockquote.setAttribute('data-align', 'center');
        blockquote.setAttribute('data-dnt', 'true');
        const link = document.createElement('a');
        link.href = `https://twitter.com/x/status/${currentVideo.twitterId}/video/1`;
        blockquote.appendChild(link);
        twitterContainerRef.current.appendChild(blockquote);
        window.twttr.widgets.load(twitterContainerRef.current);
      }
    }
  }, [currentVideo?.twitterId, twitterReady]);

  return (
    <AnimatePresence>
      {selectedItem && currentVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onMouseMove={resetTimer}
        >
          <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Main Stage */}
            <div className="relative flex-1 bg-black flex items-center justify-center group">
              {currentVideo.twitterId ? (
                <div ref={twitterContainerRef} className="w-full h-full flex items-center justify-center p-4" />
              ) : (
                <video 
                  key={currentVideo.id}
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                  controls={showControls}
                  autoPlay 
                  className="w-full h-full object-contain"
                  poster={currentVideo.image || ''}
                  onEnded={() => handleMove('down')}
                />
              )}
              
              {/* Overlay Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16"
                  >
                    <div className="flex justify-between items-start pointer-events-auto">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-sm">
                            {currentVideo.category || 'Moment'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                            By {currentVideo.artist}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-6xl font-bold text-white uppercase tracking-tighter leading-none">
                          {currentVideo.title || 'Untitled'}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); setShowQueue(false); }}
                          className={`p-4 rounded-full text-white transition-all border border-white/10 ${showInfo ? 'bg-white text-black' : 'bg-black/40 backdrop-blur-xl hover:bg-white/10'}`}
                        >
                          <Info className="w-6 h-6" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                          className="p-4 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/10 transition-all border border-white/10"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pointer-events-auto">
                      <div className="flex items-center gap-12">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Origins</p>
                          <p className="text-sm font-bold">{currentVideo.origins || "Original"}</p>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                          <CreditsIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-bold">{currentVideo.credits || 0} Credits</span>
                        </div>
                      </div>
                      
                      {!isMobile && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); setShowInfo(false); }}
                          className={`flex items-center gap-3 px-6 py-3 rounded-full text-white transition-all border border-white/10 ${showQueue ? 'bg-white text-black' : 'bg-black/40 backdrop-blur-xl hover:bg-white/10'}`}
                        >
                          <List className="w-5 h-5" />
                          <span className="text-xs font-bold uppercase tracking-widest">The Queue</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Side Panels */}
            <AnimatePresence>
              {showQueue && !isMobile && (
                <motion.div
                  initial={{ x: 450 }}
                  animate={{ x: 0 }}
                  exit={{ x: 450 }}
                  className="w-[450px] h-full bg-[#0a0a0a] border-l border-white/5 p-12 overflow-y-auto no-scrollbar z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-12 opacity-40">
                    <History className="w-5 h-5" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">The Queue</h3>
                  </div>
                  <div className="space-y-8">
                    {items.map((item, idx) => (
                      <div 
                        key={`${item.id}-${idx}`}
                        onClick={() => setCurrentIndex(items.indexOf(item))}
                        className={`group cursor-pointer flex gap-6 items-center transition-opacity ${item.id === currentVideo.id ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <div className="relative w-32 aspect-video rounded-xl overflow-hidden border border-white/5">
                          <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-tight mb-1">{item.title}</h4>
                          <p className="text-[9px] text-white/40 uppercase tracking-widest">{item.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {showInfo && (
                <motion.div
                  initial={{ x: 450 }}
                  animate={{ x: 0 }}
                  exit={{ x: 450 }}
                  className="w-full md:w-[450px] absolute md:relative right-0 h-full bg-[#0a0a0a] border-l border-white/5 p-12 overflow-y-auto no-scrollbar z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-3 opacity-40">
                      <Info className="w-5 h-5" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em]">Moment Details</h3>
                    </div>
                    <button onClick={() => setShowInfo(false)} className="md:hidden text-white/40"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h4 className="text-4xl font-bold text-white uppercase tracking-tighter leading-none">{currentVideo.title}</h4>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Artist</p>
                          <p className="text-sm font-bold">{currentVideo.artist}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 pt-12 border-t border-white/5">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Origins</p>
                        <p className="text-lg font-bold uppercase tracking-tight">{currentVideo.origins || "Original Creation"}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Recognition</p>
                        <div className="flex items-center gap-3">
                          <CreditsIcon className="w-5 h-5 text-yellow-400" />
                          <p className="text-2xl font-bold">{currentVideo.credits || 0} Credits</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Category</p>
                        <p className="text-lg font-bold uppercase tracking-tight">{currentVideo.category || "Moment"}</p>
                      </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 space-y-4">
                      <button className="w-full py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 transition-all">
                        Give Credits
                      </button>
                      <button className="w-full py-5 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all">
                        View Origins
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
