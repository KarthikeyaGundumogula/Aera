import { memo, useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TheatreItem } from '../../../types';
import { SectionHeader } from '../../../components/SectionHeader';
import { FHLoader } from '../../../components/FHLoader';

import { buildEmbedUrl } from '../../../utils/embed';
import { useTwitterWidgets } from '../../../hooks/useTwitterWidgets';

interface FestivalSpotlightPlayerProps {
  works: TheatreItem[];
}

export const FestivalSpotlightPlayer = memo(function FestivalSpotlightPlayer({ works }: FestivalSpotlightPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset iframe loading state when switching videos
  useEffect(() => {
    setIsIframeLoaded(false);
  }, [currentIndex]);

  const currentWork = works[currentIndex];
  
  const isYoutube = currentWork?.platform === 'youtube';
  const isTwitter = currentWork?.platform === 'twitter';
  const embedUrl = isYoutube && currentWork?.srcId ? buildEmbedUrl('youtube', currentWork.srcId) : '';

  const { containerRef: twitterContainerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    isTwitter && isIntersecting ? currentWork.srcId : undefined
  );

  if (!works.length) return null;

  const handleNext = () => setCurrentIndex(i => (i + 1) % works.length);
  const handlePrev = () => setCurrentIndex(i => (i - 1 + works.length) % works.length);

  const isFullyLoaded = isYoutube ? isIframeLoaded : (isTwitter ? isTwitterLoaded : true);

  return (
    <section className="pt-10 pb-12" ref={mainContainerRef} aria-label="Panelist Spotlight">
      <div className="px-4 md:px-8">
        <SectionHeader title="Panelist Spotlight" containerClassName="mb-8" />
        
        <div className="relative max-w-6xl mx-auto flex flex-col gap-8">
          {/* Neumorphic Player Container */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/[0.03] shadow-[10px_10px_30px_#000000,-10px_-10px_30px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)]">
             {/* Loading State Overlay */}
             {(!isIntersecting || !isFullyLoaded) && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/60 backdrop-blur-sm z-20">
                 <FHLoader label="Mounting Stage" />
               </div>
             )}

             {/* YouTube Embed */}
             {isIntersecting && isYoutube && embedUrl && (
               <iframe
                 key={`yt-${currentWork.id}`}
                 src={embedUrl}
                 className="absolute inset-0 w-full h-full border-none z-10"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 onLoad={() => setIsIframeLoaded(true)}
               />
             )}

             {/* Twitter Embed */}
             {isIntersecting && isTwitter && (
               <div className="absolute inset-0 flex items-center justify-center bg-black overflow-y-auto overflow-x-hidden no-scrollbar z-10 p-2">
                 <div ref={twitterContainerRef} className="w-full max-w-[560px] flex justify-center scale-95" />
               </div>
             )}
          </div>
          {/* Controls & Metadata (External to not conflict with player) */}
          <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-6">
             <div className="flex flex-col text-center md:text-left">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-white">{currentWork.title}</h3>
                <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1">By. {currentWork.artist}</p>
             </div>

             {/* Neumorphic Buttons */}
             <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrev}
                  className="w-14 h-14 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] transition-all duration-300 active:scale-95 text-white/50 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5 -ml-0.5" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-white/20 w-16 text-center">
                  {currentIndex + 1} / {works.length}
                </div>
                <button 
                  onClick={handleNext}
                  className="w-14 h-14 rounded-full bg-[#0a0a0a] flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] transition-all duration-300 active:scale-95 text-white/50 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5 -mr-0.5" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
});
