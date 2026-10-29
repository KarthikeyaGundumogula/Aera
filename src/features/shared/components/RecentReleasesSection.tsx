import { memo, useState, useEffect, useRef, useMemo, ElementType } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../../../components/SectionHeader';
import { FHLoader } from '../../../components/FHLoader';
import { buildEmbedUrl } from '../../../utils/embed';
import { useTwitterWidgets } from '../../../hooks/useTwitterWidgets';
import { useYoutubeEmbed } from '../../../hooks/useYoutubeEmbed';
import { PosterImage } from '../../../components/PosterImage';
import { EditsIcon, PostersIcon, ScriptsIcon } from '../../../components/icons/AppIcons';
import { getWorkKind } from '../../shared/work/types';

export interface OriginalReleaseItem {
  id: string;
  title: string;
  src?: string;
  srcId?: string;
  workSrcId?: string;
  platform?: string;
  releaseType?: string;
  artist?: string;
  image?: string;
  thumbnail?: string;
  text?: string;
  thoughts?: string[] | string;
  captions?: string[];
  description?: string;
  images?: string[];
  frames?: string[];
}

interface ReleaseWorkItem {
  id: string;
  title: string;
  srcId: string;
  platform: string;
  category?: string;
  originalIds?: string[];
  artist?: string;
  image?: string;
  thumbnail?: string;
  text?: string;
  thoughts?: string[] | string;
  captions?: string[];
  description?: string;
  images?: string[];
  frames?: string[];
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
  const fallbackImage =
    currentWork?.thumbnail ||
    currentWork?.image ||
    (isYoutube && currentWork?.srcId ? `https://img.youtube.com/vi/${currentWork.srcId}/hqdefault.jpg` : "");

  return (
    <>
      {(!isIntersecting || (!isFullyLoaded && embedUrl)) && (
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

      {!embedUrl && !isTwitter && fallbackImage && (
        <img
          src={fallbackImage}
          alt={currentWork?.title || "Release"}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      )}
    </>
  );
});

interface ReleasePosterMediaProps {
  currentWork: ReleaseWorkItem;
  isMobile: boolean;
}

const ReleasePosterMedia = memo(function ReleasePosterMedia({ currentWork, isMobile }: ReleasePosterMediaProps) {
  const navigate = useNavigate();
  const posterSrc = currentWork.image || currentWork.thumbnail || currentWork.srcId || "";
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [posterSrc]);

  return (
    <div 
      className="relative mx-auto flex items-center justify-center cursor-pointer group select-none"
      onClick={() => {
        if (currentWork.id) navigate(`/works/${currentWork.id}`);
      }}
    >
      {posterSrc ? (
        <div className="relative inline-block max-w-full">
          {/* Ambient blur glow behind poster */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <img
              src={posterSrc}
              alt=""
              aria-hidden
              className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
              decoding="async"
            />
          </div>
          <img
            src={posterSrc}
            alt={currentWork.title || "Poster"}
            className={`w-auto h-auto max-w-full object-contain rounded-2xl select-none border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:scale-[1.01] ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } ${
              isMobile ? "max-h-[55vh]" : "max-h-[calc(100vh-320px)]"
            }`}
            loading="eager"
            decoding="async"
            draggable={false}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      ) : (
        <PosterImage
          alt={currentWork.title || "Poster"}
          info={currentWork.artist || "Poster"}
          className={
            isMobile 
              ? "w-[240px] h-[360px] object-contain rounded-2xl border border-white/10" 
              : "w-[300px] h-[450px] object-contain rounded-2xl border border-white/10"
          }
        />
      )}
    </div>
  );
});

interface ReleaseScriptMediaProps {
  currentWork: ReleaseWorkItem;
  isMobile: boolean;
}

const ReleaseScriptMedia = memo(function ReleaseScriptMedia({ currentWork, isMobile }: ReleaseScriptMediaProps) {
  const navigate = useNavigate();
  const visualSrc = currentWork.images?.[0] || currentWork.frames?.[0] || currentWork.image || currentWork.thumbnail;
  const isHttpVisual = Boolean(visualSrc && typeof visualSrc === "string" && (visualSrc.startsWith("http") || visualSrc.startsWith("/")));

  if (isHttpVisual) {
    return (
      <div 
        className="relative mx-auto flex items-center justify-center cursor-pointer group select-none"
        onClick={() => {
          if (currentWork.id) navigate(`/works/${currentWork.id}`);
        }}
      >
        <div className="relative inline-block max-w-full">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <img
              src={visualSrc}
              alt=""
              aria-hidden
              className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
              decoding="async"
            />
          </div>
          <img
            src={visualSrc}
            alt={currentWork.title || "Storyboard"}
            className={`w-auto h-auto max-w-full object-contain rounded-2xl select-none border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:scale-[1.01] ${
              isMobile ? "max-h-[55vh]" : "max-h-[calc(100vh-320px)]"
            }`}
            loading="eager"
            decoding="async"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  const rawThoughts = Array.isArray(currentWork.thoughts)
    ? currentWork.thoughts.join("\n\n")
    : (typeof currentWork.thoughts === "string" ? currentWork.thoughts : "");
  const bodyText = currentWork.text || rawThoughts || currentWork.description || "The screenplay unfolds in stillness and light. Step into the full scene.";

  return (
    <div 
      onClick={() => {
        if (currentWork.id) navigate(`/works/${currentWork.id}`);
      }}
      className={`w-full max-w-lg mx-auto bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.8)] cursor-pointer group hover:border-white/20 transition-all duration-300 ${
        isMobile ? "min-h-[260px] max-h-[55vh]" : "min-h-[340px] max-h-[calc(100vh-320px)]"
      }`}
    >
      <div className="flex items-center justify-between text-white/40 font-mono text-[9px] uppercase tracking-widest border-b border-white/5 pb-3">
        <span>SCENE {currentWork.id || "I"}</span>
        <span>ORIGINAL SCREENPLAY</span>
      </div>

      <div className="my-auto py-4 overflow-y-auto no-scrollbar font-mono text-left">
        <div className="font-bold text-white/70 uppercase text-[11px] tracking-wider mb-3">
          INT. {currentWork.title?.toUpperCase() || "THE SCENE"} - CONTINUOUS
        </div>
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line italic">
          "{bodyText}"
        </p>
      </div>

      <div className="flex items-center justify-between text-white/30 text-[9px] font-mono uppercase tracking-widest pt-3 border-t border-white/5 group-hover:text-white/60 transition-colors">
        <span>CLICK TO OPEN FULL SCRIPT</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
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
        id: String(w.id || w.workId || w.srcId || w.workSrcId || ""),
        title: w.title || w.workTitle || "Release",
        srcId: w.srcId || w.workSrcId || w.src || w.id || w.workId || "",
        platform: (w.platform || "YOUTUBE").toUpperCase(),
        category: (w.category || w.workType || w.releaseType || "EDIT").toUpperCase(),
        originalIds: w.originalIds || [],
        artist: w.artist || w.artistName || "Artist",
        image: w.image || w.coverImage || "",
        thumbnail: w.thumbnail || w.image || "",
        text: w.text || "",
        thoughts: w.thoughts,
        captions: w.captions,
        description: w.description || "",
        images: w.images,
        frames: w.frames,
      }));
    }
    if (customReleases && customReleases.length > 0) {
      return customReleases.map(r => ({
        id: String(r.id),
        title: r.title,
        srcId: (r as any).srcId || (r as any).src_id || (r as any).workSrcId || r.src || (r as any).contentUrl || (r as any).id || "",
        platform: (r.platform || "YOUTUBE").toUpperCase(),
        category: (r.releaseType || (r as any).category || (r as any).workType || "EDIT").toUpperCase(),
        originalIds: [r.id],
        artist: r.artist || (r as any).artistName || "Official Release",
        image: (r as any).image || (r as any).coverImage || "",
        thumbnail: (r as any).thumbnail || (r as any).image || "",
        text: r.text || (r as any).text || "",
        thoughts: r.thoughts || (r as any).thoughts,
        captions: r.captions || (r as any).captions,
        description: r.description || (r as any).description || "",
        images: r.images || (r as any).images,
        frames: r.frames || (r as any).frames,
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

  const kind = useMemo(() => {
    if (!currentWork) return "edit";
    const cat = (currentWork.category || "").toUpperCase();
    if (cat === "POSTER") return "poster";
    if (cat === "SCRIPT" || cat === "STORYBOARD") return "storyboard";
    if (cat === "EDIT") return "edit";

    const baseKind = getWorkKind(currentWork as any);
    if (baseKind === "poster" || baseKind === "storyboard") return baseKind;

    const rawPlatform = (currentWork.platform || "").toLowerCase();
    const isVideo = rawPlatform === "youtube" || rawPlatform === "twitter" || Boolean(currentWork.srcId && /youtube\.com|youtu\.be|twitter\.com|x\.com/.test(currentWork.srcId));
    if (!isVideo && (currentWork.image || currentWork.thumbnail)) {
      return "poster";
    }
    return baseKind || "edit";
  }, [currentWork]);

  if (!recentReleases.length) return null;

  const handleNext = () => setCurrentIndex(i => Math.min(i + 1, recentReleases.length - 1));
  const handlePrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  const renderStageMedia = (isMobile: boolean) => {
    if (kind === "edit") {
      return (
        <div 
          className="relative mx-auto rounded-3xl overflow-hidden bg-surface-deep border border-white/[0.03] shadow-[10px_10px_30px_#000000,-10px_-10px_30px_rgba(255,255,255,0.02),inset_0_1px_0_rgba(255,255,255,0.05)] w-full"
          style={{ 
            aspectRatio: "16/9",
            maxHeight: isMobile ? "45vh" : "calc(100vh - 280px)",
            maxWidth: isMobile ? "100%" : "calc((100vh - 280px) * 16 / 9)"
          }}
        >
          <ReleasePlayerMedia currentWork={currentWork} isIntersecting={isIntersecting} />
        </div>
      );
    }

    if (kind === "poster") {
      return <ReleasePosterMedia currentWork={currentWork} isMobile={isMobile} />;
    }

    if (kind === "storyboard") {
      return <ReleaseScriptMedia currentWork={currentWork} isMobile={isMobile} />;
    }

    return <ReleasePosterMedia currentWork={currentWork} isMobile={isMobile} />;
  };

  return (
    <section className={className} ref={mainContainerRef} aria-label="Releases">
      <div className="px-6 md:px-12 w-full">
        <SectionHeader title={title} icon={icon} containerClassName={headerClassName} />
        
        {/* DESKTOP LAYOUT (hidden md:flex) */}
        <div className="hidden md:flex flex-col gap-6 max-w-4xl mx-auto w-full items-center">
          <div 
            key={`stage-${currentWork.id || currentIndex}`}
            className="w-full flex items-center justify-center min-h-[360px] max-h-[calc(100vh-280px)]"
          >
            {renderStageMedia(false)}
          </div>

          {/* Controls & Metadata */}
          <div className="flex items-center justify-between px-2 gap-6 w-full">
            <div className="flex flex-col text-left min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-white/70">
                  {kind === "edit" && <EditsIcon className="w-2.5 h-2.5 text-brand-accent" />}
                  {kind === "poster" && <PostersIcon className="w-2.5 h-2.5 text-amber-400" />}
                  {kind === "storyboard" && <ScriptsIcon className="w-2.5 h-2.5 text-blue-400" />}
                  {kind === "edit" ? "Motion Edit" : kind === "poster" ? "Original Poster" : "Script"}
                </span>
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (currentWork.id) navigate(`/works/${currentWork.id}`); 
                }}
                className="text-xl font-black uppercase tracking-tight text-white hover:underline text-left truncate"
              >
                {currentWork.title}
              </button>
              <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-1 truncate">By. {currentWork.artist}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`w-14 h-14 rounded-xl bg-surface-deep flex items-center justify-center border border-white/5 shadow-[6px_6px_12px_#030303,-6px_-6px_12px_rgba(255,255,255,0.03)] transition-all duration-300 ${
                  currentIndex === 0 
                    ? 'opacity-20 cursor-not-allowed text-white/50' 
                    : 'hover:shadow-[inset_4px_4px_8px_#030303,inset_-4px_-4px_8px_rgba(255,255,255,0.03)] active:scale-95 text-white/50 hover:text-white'
                }`}
                aria-label="Previous Release"
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
                aria-label="Next Release"
              >
                <ChevronRight className="w-5 h-5 -mr-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT (block md:hidden) */}
        <div className="block md:hidden">
          <div className="px-2">
            <div 
              key={`stage-mobile-${currentWork.id || currentIndex}`}
              className="w-full flex items-center justify-center min-h-[220px] max-h-[60vh]"
            >
              {renderStageMedia(true)}
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-white/60 mb-1">
                {kind === "edit" && <EditsIcon className="w-2 h-2 text-brand-accent" />}
                {kind === "poster" && <PostersIcon className="w-2 h-2 text-amber-400" />}
                {kind === "storyboard" && <ScriptsIcon className="w-2 h-2 text-blue-400" />}
                {kind === "edit" ? "Edit" : kind === "poster" ? "Poster" : "Script"}
              </span>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (currentWork.id) navigate(`/works/${currentWork.id}`); 
                }}
                className="text-sm sm:text-base font-black uppercase tracking-tight text-white drop-shadow-md truncate w-full hover:underline text-center"
              >
                {currentWork.title}
              </button>
              <p className="text-[10px] text-white/40 font-bold tracking-[0.25em] uppercase mt-0.5 truncate w-full">By. {currentWork.artist}</p>
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
