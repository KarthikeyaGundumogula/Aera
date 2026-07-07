import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Pin, ArrowRight, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { Original } from "../../../types/originals";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { buildEmbedUrl } from "../../../utils/embed";
import { StarAction } from "../../../components/actions/StarAction";
import { SaveAction } from "../../../components/actions/SaveAction";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { FHLoader } from "../../../components/FHLoader";

function AvatarFallback({ className }: { className: string }) {
  const baseClasses = className.replace(/object-cover|object-top|border-white\/[0-9]+|shadow-[^ ]+/g, "").trim();
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-white/6 border border-white/15 shadow-xl transition-transform ${baseClasses}`}>
      <div className="absolute inset-[15%] rounded-[9px] border border-white/10" />
      <div className="relative flex items-center gap-[2px] text-[11px] font-black uppercase tracking-tight text-white">
        <span>F</span>
        <span className="text-white/45">H</span>
      </div>
    </div>
  );
}

function AvatarImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [error, setError] = useState(!src);
  if (error) return <AvatarFallback className={className} />;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setError(true)} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Inline action row (Honour + Share + Open Exhibition) ────────────────────

interface WorkActionsProps {
  item: TheatreItem;
  onNavigate: () => void;
}

function WorkActions({ item, onNavigate }: WorkActionsProps) {
  const [isStarred, setIsStarred] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="flex items-center justify-between w-full pt-2 relative z-[310]">
      {/* Original Artist Info */}
      <div 
        className="flex items-center gap-2 cursor-pointer group"
      >
        {item.artistAvatar ? (
          <img 
            src={item.artistAvatar} 
            alt={item.artist || ""} 
            className="w-7 h-7 rounded-xl object-cover object-top border border-white/10 group-hover:border-white/30 transition-colors shrink-0" 
            draggable={false}
          />
        ) : (
          <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[9px] font-black uppercase text-white/50 shrink-0">
            {item.artist ? item.artist.substring(0,2) : "FH"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/90 group-hover:text-white transition-colors">
            {item.artist || "Framehouse Artist"}
          </span>
          <span className="text-[8px] font-medium text-white/40 uppercase tracking-widest">
            Original Creator
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <StarAction 
          isActive={isStarred} 
          onClick={(e) => { e?.stopPropagation(); setIsStarred(!isStarred); }} 
          variant="exhibition"
        />
        <SaveAction 
          isActive={isSaved} 
          onClick={(e) => { e?.stopPropagation(); setIsSaved(!isSaved); }} 
          variant="exhibition"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          className="h-8 px-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center"
        >
          View
        </button>
      </div>
    </div>
  );
}

// ─── Inline Edit embed (YouTube / Twitter) ───────────────────────────────────

interface EditEmbedProps {
  item: TheatreItem;
  isActive: boolean;
  onNavigate: () => void;
}

function EditEmbed({ item, isActive, onNavigate }: EditEmbedProps) {
  const isYoutube = item.platform === "youtube";
  const [ytLoaded, setYtLoaded] = useState(false);
  const { containerRef: twitterRef, isLoaded: twitterLoaded } = useTwitterWidgets(
    !isYoutube && item.srcId ? item.srcId : undefined,
    isActive
  );
  const isLoaded = isYoutube ? ytLoaded : twitterLoaded;
  const embedUrl = isYoutube && item.srcId ? buildEmbedUrl("youtube", item.srcId) : "";

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className={`relative w-full ${isYoutube ? "aspect-video" : ""} rounded-xl overflow-hidden bg-black/40`}
      >
        {!isLoaded && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-xl pointer-events-none">
            <FHLoader label="Loading" />
          </div>
        )}
        {isActive &&
          (isYoutube ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-none relative z-[310] pointer-events-auto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={item.title}
              loading="lazy"
              onLoad={() => setYtLoaded(true)}
            />
          ) : (
            <div className="w-full flex justify-center py-2 relative z-[310] pointer-events-auto">
              <div ref={twitterRef} className="w-full max-w-[540px]" />
            </div>
          ))}
        {!isActive && <div className="w-full aspect-video bg-black/40 rounded-xl" />}
      </div>
      <div className="w-full pointer-events-auto">
        <WorkActions item={item} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ─── Cover card (Poster / Script / Recommendation) ───────────────────────────

interface CoverCardProps {
  item: TheatreItem;
  onNavigate: () => void;
}

function CoverCard({ item, onNavigate }: CoverCardProps) {
  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="group relative w-full block aspect-[4/5] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] pointer-events-none"
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title || ""}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
              {item.category}
            </span>
          </div>
        )}
      </div>
      <div className="w-full pointer-events-auto">
        <WorkActions item={item} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ─── Full-screen Line viewer ──────────────────────────────────────────────────

const LineFull: React.FC<{ post: WallPost }> = ({ post }) => (
  <div className="flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto px-8 text-center gap-6 pointer-events-none">
    <AvatarImage
      src={post.artistImage}
      alt={post.artistName}
      className="w-12 h-12 rounded-xl object-cover object-top border border-white/15 shrink-0"
    />
    <p className="text-[18px] sm:text-[22px] leading-[1.6] font-normal text-white/90">{post.text}</p>
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
        {post.artistName}
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20">
        {formatRelativeTime(post.postedAt)}
      </span>
    </div>
  </div>
);

// ─── Full-screen Pin viewer ───────────────────────────────────────────────────

interface PinFullProps {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  isActive: boolean;
  onClose: () => void;
}

const PinFull: React.FC<PinFullProps> = ({
  post,
  resolvedWork,
  resolvedOriginal,
  isActive,
  onClose,
}) => {
  const navigate = useNavigate();

  const openExhibition = useCallback(
    (item: TheatreItem) => {
      onClose();
      navigate(`/works/${item.id}`, { state: { item } });
    },
    [navigate, onClose]
  );

  if (post.type === "PIN_WORK" && resolvedWork) {
    const isEdit = !resolvedWork.category || resolvedWork.category === "Edit" || resolvedWork.category === "Call";
    return (
      <div className="w-full flex flex-col gap-4 max-w-[700px] mx-auto pointer-events-none">
        <div className="w-full text-left px-1 pointer-events-none mb-1">
          <h2 className="text-[20px] sm:text-[24px] font-black uppercase tracking-tight text-white leading-none">
            {resolvedWork.title || "Untitled"}
          </h2>
          {resolvedWork.category && (
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2 block">
              {resolvedWork.category}
            </span>
          )}
        </div>
        
        {isEdit ? (
          <EditEmbed
            item={resolvedWork}
            isActive={isActive}
            onNavigate={() => openExhibition(resolvedWork)}
          />
        ) : (
          <CoverCard item={resolvedWork} onNavigate={() => openExhibition(resolvedWork)} />
        )}

        {post.text && (
          <div className="flex flex-col items-start gap-1.5 px-1 py-0.5 border-l-2 border-amber-500 pl-3 pointer-events-none mt-1">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
                Quoted by {post.artistName}
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] leading-[1.6] text-white/80 italic">"{post.text}"</p>
          </div>
        )}
      </div>
    );
  }

  // PIN_ORIGINAL or unresolved
  const image = resolvedWork?.image ?? resolvedOriginal?.coverImage;
  const title = resolvedWork?.title ?? resolvedOriginal?.title;

  return (
    <div className="w-full flex flex-col gap-4 px-4 max-w-[700px] mx-auto pointer-events-none">
      <div className="w-full text-left px-1 mb-1">
        <h2 className="text-[20px] sm:text-[24px] font-black uppercase tracking-tight text-white leading-none">
          {title || "Untitled"}
        </h2>
      </div>
      {image && (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
          <img src={image} alt={title ?? "Pinned"} className="w-full h-auto object-cover object-top" draggable={false} />
        </div>
      )}
      {post.text && (
        <div className="w-full flex flex-col items-start gap-1.5 px-1 py-0.5 border-l-2 border-amber-500 pl-3 pointer-events-none mt-1 text-left">
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">
              Quoted by {post.artistName}
            </span>
          </div>
          <p className="text-[14px] sm:text-[15px] leading-[1.6] text-white/80 italic">"{post.text}"</p>
        </div>
      )}
    </div>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────

const ProgressDots: React.FC<{ total: number; current: number }> = ({ total, current }) => {
  if (total <= 1) return null;
  const maxDots = 7;
  const dots = Math.min(total, maxDots);
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: dots }).map((_, i) => {
        const isActive =
          dots === total ? i === current : i === Math.round((current / (total - 1)) * (dots - 1));
        return (
          <div
            key={i}
            className={`rounded-xl transition-all duration-200 ${
              isActive ? "w-4 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/20"
            }`}
          />
        );
      })}
    </div>
  );
};

// ─── WallSwiper ───────────────────────────────────────────────────────────────

export interface WallSwiperEntry {
  post: WallPost;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
}

export interface WallSwiperArtistGroup {
  artistId: string;
  artistName: string;
  artistImage: string;
  entries: WallSwiperEntry[];
  hasMore: boolean;
}

interface WallSwiperProps {
  groups: WallSwiperArtistGroup[];
  initialGroupIndex: number;
  initialPostIndices?: Record<string, number>;
  onFetchOlder?: (artistId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * WallSwiper — Full-screen story-like viewer for Wall posts.
 *
 * - Swipe left/right (drag) to move between artists.
 * - Tap left/right to move through an artist's posts.
 */
export function WallSwiper({ groups, initialGroupIndex, initialPostIndices = {}, onFetchOlder, onClose }: WallSwiperProps) {
  const navigate = useNavigate();
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  
  // Track which post we are on for each artist group
  const [postIndices, setPostIndices] = useState<Record<string, number>>(initialPostIndices);
  
  const [isFetching, setIsFetching] = useState(false);

  const activeGroup = groups[((groupIndex % groups.length) + groups.length) % groups.length];
  const activePostIndex = postIndices[activeGroup.artistId] || 0;
  
  // A group might have 3 entries. If activePostIndex === 3, we are showing the "See older" card.
  const isShowingOlderCard = activePostIndex === activeGroup.entries.length;

  const paginateGroup = useCallback((dir: number) => setGroupIndex((p) => p + dir), []);

  const handleTap = useCallback((dir: number) => {
    setPostIndices(prev => {
      const current = prev[activeGroup.artistId] || 0;
      const next = current + dir;
      
      // If we go backwards from 0, go to previous artist
      if (next < 0) {
        paginateGroup(-1);
        return prev;
      }
      
      // If we go forwards past the last item
      if (next > activeGroup.entries.length) {
        // If hasMore, they are tapping past the "See Older" card -> next artist
        // If !hasMore, they are tapping past the last post -> next artist
        paginateGroup(1);
        return prev;
      }
      
      // If we reach the end and there is no more, just go to next artist
      if (next === activeGroup.entries.length && !activeGroup.hasMore) {
        paginateGroup(1);
        return prev;
      }
      
      return { ...prev, [activeGroup.artistId]: next };
    });
  }, [activeGroup, paginateGroup]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleTap(1);
      else if (e.key === "ArrowLeft") handleTap(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [handleTap, onClose]);

  const fetchOlder = async () => {
    if (!onFetchOlder || isFetching) return;
    setIsFetching(true);
    await onFetchOlder(activeGroup.artistId);
    setIsFetching(false);
  };

  const isDraggable = true; // Always allow dragging for visual feedback

  return createPortal(
    <ModalWrapper isOpen={true} onClose={onClose} isImmersive={true}>
      


      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[300] w-9 h-9 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors duration-150"
        aria-label="Close"
      >
        <X size={16} />
      </button>



      {/* Artist header */}
      <div className="fixed top-5 left-4 z-[300]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.artistId}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="flex items-center gap-2.5 cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              navigate(`/profile/${activeGroup.artistId}`);
            }}
          >
            <AvatarImage
              src={activeGroup.artistImage}
              alt={activeGroup.artistName}
              className="w-7 h-7 rounded-lg object-cover object-top border border-white/10 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                {activeGroup.artistName}
              </span>
              {!isShowingOlderCard && activeGroup.entries[activePostIndex] && (
                 <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">
                   {activeGroup.entries[activePostIndex].post.type === "LINE" ? "Line" : "Pin"} · {formatRelativeTime(activeGroup.entries[activePostIndex].post.postedAt)}
                 </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipeable track for Artist Groups */}
      <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ x: `-${groupIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          drag="x"
          dragElastic={0.2}
          dragConstraints={{ left: 0, right: 0 }}
          style={{ touchAction: "pan-y", willChange: "transform" }}
          onDragEnd={(_, { offset, velocity }) => {
            const swipePower = offset.x + velocity.x * 0.5;
            if (swipePower < -50) paginateGroup(1);
            else if (swipePower > 50) paginateGroup(-1);
          }}
        >
          {[-1, 0, 1].map((offset) => {
            const virtualPage = groupIndex + offset;
            const idx = ((virtualPage % groups.length) + groups.length) % groups.length;
            const group = groups[idx];
            if (!group) return null;

            const postIdx = postIndices[group.artistId] || 0;
            const isOlderCard = postIdx === group.entries.length;
            const entry = group.entries[postIdx];

            return (
              <motion.div
                key={`${group.artistId}-${virtualPage}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ left: `${virtualPage * 100}%` }}
                animate={{ 
                  scale: offset === 0 ? 1 : 0.85,
                  opacity: offset === 0 ? 1 : 0.3,
                  filter: offset === 0 ? "none" : "blur(8px)"
                }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
              >
                <div 
                  className="absolute inset-0 w-full h-full flex flex-col px-4 pt-20 pb-16 overflow-y-auto overflow-x-hidden transform-gpu pointer-events-auto"
                  onClick={(e) => {
                    const isLeft = e.clientX < window.innerWidth / 2;
                    handleTap(isLeft ? -1 : 1);
                  }}
                >
                
                <div className="w-full my-auto pointer-events-none shrink-0">
                  {isOlderCard ? (
                    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto text-center gap-6 pointer-events-none my-8">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                         {isFetching ? <Loader2 className="w-6 h-6 text-white/50 animate-spin" /> : <ChevronRight className="w-8 h-8 text-white/50" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/90 mb-2">You've caught up</h3>
                        <p className="text-xs text-white/50 leading-relaxed max-w-[240px] mx-auto">
                          You've seen all recent posts from {group.artistName}.
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); fetchOlder(); }}
                        disabled={isFetching}
                        className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50 pointer-events-auto"
                      >
                        {isFetching ? "Loading..." : "Load Older Posts"}
                      </button>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">Or swipe left for next artist</p>
                    </div>
                  ) : (
                    entry && (
                      entry.post.type === "LINE" ? (
                        <div className="w-full pointer-events-none">
                          <LineFull post={entry.post} />
                        </div>
                      ) : (
                        <div className="w-full pointer-events-none">
                          <PinFull
                            post={entry.post}
                            resolvedWork={entry.resolvedWork}
                            resolvedOriginal={entry.resolvedOriginal}
                            isActive={offset === 0}
                            onClose={onClose}
                          />
                        </div>
                      )
                    )
                  )}
                </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Progress dots */}
      <div className="fixed bottom-6 sm:bottom-8 inset-x-0 z-[300] flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup.artistId}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <ProgressDots 
              total={activeGroup.hasMore ? activeGroup.entries.length + 1 : activeGroup.entries.length} 
              current={activePostIndex} 
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </ModalWrapper>,
    document.body
  );
}
