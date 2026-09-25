import { memo, useState, useEffect, useRef, useMemo, ElementType } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../../../components/SectionHeader';
import { FHLoader } from '../../../components/FHLoader';
import { buildEmbedUrl } from '../../../utils/embed';
import { useTwitterWidgets } from '../../../hooks/useTwitterWidgets';
import { useYoutubeEmbed } from '../../../hooks/useYoutubeEmbed';

export interface OriginalReleaseItem {
  id: string;
  title: string;
  src: string;
  platform?: string;
  releaseType?: string;
  artist?: string;
}

interface ReleaseWorkItem {
  id: string;
  title: string;
  srcId: string;
  platform: string;
  category?: string;
  originalIds?: string[];
  artist?: string;
}

interface ReleasePlayerMediaProps {
  currentWork: ReleaseWorkItem;
  isIntersecting: boolean;
}

const ReleasePlayerMedia = memo(function ReleasePlayerMedia({ currentWork, isIntersecting }: ReleasePlayerMediaProps) {
  const rawPlatform = (currentWork?.platform || "").toLowerCase();
  const isTwitter = rawPlatform === "twitter" || (Boolean(currentWork?.srcId) && /twitter\.com|x\.com/.test(currentWork?.srcId || ""));
  const isYoutube = !isTwitter;
  const embedUrl = isYoutube && currentWork?.srcId ? buildEmbedUrl('youtube', currentWork.srcId) : '';

  const { isYoutubeLoaded, handleIframeLoad } = useYoutubeEmbed(
    isYoutube && isIntersecting ? currentWork?.srcId : undefined,
    isYoutube && isIntersecting
  );

  const { containerRef, isLoaded: isTwitterLoaded } = useTwitterWidgets(
    isTwitter && isIntersecting ? currentWork.srcId : undefined
  );

  const isFullyLoaded = isYoutube ? isYoutubeLoaded : (isTwitter ? isTwitterLoaded : true);

  return (
    <>
      {(!isIntersecting || !isFullyLoaded) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-deep/60 backdrop-blur-sm z-20">
          <FHLoader label="Loading" />
        </div>
      )}

      {isIntersecting && isYoutube && embedUrl && (
        <iframe
          key={`yt-${currentWork.id || currentWork.srcId}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-none z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      )}

      {isIntersecting && isTwitter && (
        <div className="absolute inset-0 flex flex-col items-center justify-start py-6 px-2 bg-black overflow-y-auto overflow-x-hidden no-scrollbar z-10">
          <div ref={containerRef} className="w-full max-w-[560px] flex justify-center my-auto" />
        </div>
      )}
    </>
  );
});

interface RecentReleasesSectionProps {
  title?: string;
  icon?: ElementType;
  className?: string;
  headerClassName?: string;
  customReleases?: OriginalReleaseItem[];
  works?: any[];
}

export const RecentReleasesSection = memo(function RecentReleasesSection({ 
  title = "Recent Original Releases",
  icon,
  className = "pt-8 pb-12",
  headerClassName = "mb-8",
  customReleases,
  works,
}: RecentReleasesSectionProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const recentReleases: ReleaseWorkItem[] = useMemo(() => {
    if (works && works.length > 0) {
      return works.map((w: any) => ({
        id: w.id || w.workId || w.srcId || w.workSrcId || "",
        title: w.title || w.workTitle || "Release",
        srcId: w.srcId || w.workSrcId || w.id || w.workId || "",
        platform: (w.platform || "YOUTUBE").toUpperCase(),
        category: w.category || "EDIT",
        originalIds: w.originalIds || [],
        artist: w.artist || w.artistName || "Artist",
      }));
    }
    if (customReleases && customReleases.length > 0) {
      return customReleases.map(r => ({
        id: r.id,
        title: r.title,
        srcId: r.src,
        platform: (r.platform || "YOUTUBE").toUpperCase(),
        category: r.releaseType || "EDIT",
        originalIds: [r.id],
        artist: r.artist || "Official Release",
      }));
    }
    return [];
  }, [works, customReleases]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    if (mainContainerRef.current) observer.observe(mainContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentWork = recentReleases[currentIndex];

  if (!recentReleases.length) return null;

  const handleNext = () => setCurrentIndex(i => Math.min(i + 1, recentReleases.length - 1));
  const handlePrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  return (
    <section className={className} ref={mainContainerRef} aria-label="Releases">
      <div className="px-6 md:px-12 w-full">
        <SectionHeader title={title} icon={icon} containerClassName={headerClassName} />
        
        {/* DESKTOP LAYOUT (hidden md:block) */}
        <div className="hidden md:flex flex-col gap-8 max-w-4xl mx-auto w-full">
          <div 
            className="relative mx-auto rounded-3xl overflow-hidden bg-surface-deep border border-white/[0.03] shadow-[10px_10px_30px_#000000,-10px_-10px_30px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={{ 
              aspectRatio: "16/9",
              width: "100%",
              maxHeight: "calc(100vh - 280px)",
              maxWidth: "calc((100vh - 280px) * 16 / 9)"
            }}
          >
             <ReleasePlayerMedia currentWork={currentWork} isIntersecting={isIntersecting} />
          </div>

          {/* Controls & Metadata */}
          <div className="flex items-center justify-between px-2 gap-6">
             <div className="flex flex-col text-left">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (currentWork.id) navigate(`/works/${currentWork.id}`); 
                  }}
                  className="text-xl font-black uppercase tracking-tight text-white hover:underline text-left truncate"
                >
                  {currentWork.title}
                </button>
                <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1.5 truncate">By. {currentWork.artist}</p>
             </div>

             <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`w-14 h-14 rounded-xl bg-surface-deep flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] transition-all duration-300 ${
                    currentIndex === 0 
                      ? 'opacity-20 cursor-not-allowed text-white/50' 
                      : 'hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] active:scale-95 text-white/50 hover:text-white'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5 -ml-0.5" />
                </button>
                <div className="text-[10px] font-black tracking-widest text-white/20 w-16 text-center">
                  {currentIndex + 1} / {recentReleases.length}
                </div>
                <button 
                  onClick={handleNext}
                  disabled={currentIndex === recentReleases.length - 1}
                  className={`w-14 h-14 rounded-xl bg-surface-deep flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] transition-all duration-300 ${
                    currentIndex === recentReleases.length - 1 
                      ? 'opacity-20 cursor-not-allowed text-white/50' 
                      : 'hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] active:scale-95 text-white/50 hover:text-white'
                  }`}
                >
                  <ChevronRight className="w-5 h-5 -mr-0.5" />
                </button>
             </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (block md:hidden) */}
        <div className="block md:hidden">
          <div className="px-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-deep border border-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
               <ReleasePlayerMedia currentWork={currentWork} isIntersecting={isIntersecting} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-2 gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-10 h-10 shrink-0 rounded-xl bg-surface-deep flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300 ${
                currentIndex === 0 
                  ? 'opacity-20 cursor-not-allowed text-white/50' 
                  : 'text-white/80 hover:text-white active:scale-95'
              }`}
              aria-label="Previous Release"
            >
              <ChevronLeft className="w-5 h-5 -ml-0.5" />
            </button>

            <div className="flex flex-col items-center text-center min-w-0 flex-1 px-1">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (currentWork.id) navigate(`/works/${currentWork.id}`); 
                }}
                className="text-sm sm:text-base font-black uppercase tracking-tight text-white drop-shadow-md truncate w-full hover:underline text-center"
              >
                {currentWork.title}
              </button>
              <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1 truncate w-full">By. {currentWork.artist}</p>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === recentReleases.length - 1}
              className={`w-10 h-10 shrink-0 rounded-xl bg-surface-deep flex items-center justify-center border border-white/10 shadow-lg transition-all duration-300 ${
                currentIndex === recentReleases.length - 1 
                  ? 'opacity-20 cursor-not-allowed text-white/50' 
                  : 'text-white/80 hover:text-white active:scale-95'
              }`}
              aria-label="Next Release"
            >
              <ChevronRight className="w-5 h-5 -mr-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});
