import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { X, ChevronLeft, ChevronRight, Pin, Share2, ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { WallPost } from "../../../types/wall";
import { TheatreItem } from "../../../types/theatre";
import { Original } from "../../../types/originals";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { buildEmbedUrl } from "../../../utils/embed";
import { useTwitterWidgets } from "../../../hooks/useTwitterWidgets";
import { FHLoader } from "../../../components/FHLoader";
import { HonourIcon } from "../../../components/icons/HonourIcon";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function copyLink(url: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  Object.assign(ta.style, { position: "fixed", top: "0", left: "0", opacity: "0" });
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

// ─── Inline action row (Honour + Share + Open Exhibition) ────────────────────

interface WorkActionsProps {
  item: TheatreItem;
  onNavigate: () => void;
}

function WorkActions({ item, onNavigate }: WorkActionsProps) {
  const [isHonoured, setIsHonoured] = useState(false);
  const [honouring, setHonouring] = useState(false);
  const [copied, setCopied] = useState(false);
  const honourRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copiedRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const honour = () => {
    if (honourRef.current) clearTimeout(honourRef.current);
    setIsHonoured((v) => !v);
    setHonouring(true);
    honourRef.current = setTimeout(() => setHonouring(false), 420);
  };

  const share = () => {
    copyLink(`${window.location.origin}/works/${item.id}`);
    setCopied(true);
    if (copiedRef.current) clearTimeout(copiedRef.current);
    copiedRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(
    () => () => {
      if (honourRef.current) clearTimeout(honourRef.current);
      if (copiedRef.current) clearTimeout(copiedRef.current);
    },
    []
  );

  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        onClick={honour}
        aria-label={isHonoured ? "Remove honour" : "Honour this work"}
        className={`flex items-center gap-1.5 px-3 h-8 rounded-xl border transition-all duration-200 select-none active:scale-[0.96] ${
          isHonoured
            ? "border-[#E11D48]/25 bg-[#E11D48]/8 text-[#E11D48]"
            : "border-white/10 bg-white/4 text-white/40 hover:text-white/70 hover:border-white/20"
        }`}
        style={isHonoured ? { boxShadow: "0 0 10px rgba(225,29,72,0.15)" } : undefined}
      >
        <HonourIcon
          size={11}
          filled={isHonoured}
          style={{
            transform: honouring ? "scale(1.6)" : "scale(1)",
            transition: honouring
              ? "transform 90ms cubic-bezier(0.23,1,0.32,1)"
              : "transform 320ms cubic-bezier(0.23,1,0.32,1)",
          }}
        />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">
          {isHonoured ? "Honoured" : "Honour"}
        </span>
      </button>

      <button
        onClick={share}
        aria-label="Copy link"
        className="flex items-center justify-center w-8 h-8 rounded-xl border border-white/10 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
      >
        {copied ? (
          <span className="text-[7px] font-black uppercase tracking-widest text-green-400">✓</span>
        ) : (
          <Share2 size={12} strokeWidth={2} />
        )}
      </button>

      <button
        onClick={onNavigate}
        className="ml-auto flex items-center gap-1.5 px-3 h-8 rounded-xl border border-white/10 bg-white/4 text-white/40 hover:bg-white hover:text-black transition-all duration-150 active:scale-95"
      >
        <span className="text-[9px] font-black uppercase tracking-[0.15em]">Exhibition</span>
        <ArrowRight size={11} strokeWidth={2.5} />
      </button>
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-xl">
            <FHLoader label="Loading" />
          </div>
        )}
        {isActive &&
          (isYoutube ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={item.title}
              loading="lazy"
              onLoad={() => setYtLoaded(true)}
            />
          ) : (
            <div className="w-full flex justify-center py-2">
              <div ref={twitterRef} className="w-full max-w-[540px]" />
            </div>
          ))}
        {!isActive && <div className="w-full aspect-video bg-black/40 rounded-xl" />}
      </div>
      <WorkActions item={item} onNavigate={onNavigate} />
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
      <button
        onClick={onNavigate}
        className="group relative w-full block aspect-[4/5] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] active:scale-[0.98] transition-transform"
        aria-label={`Open ${item.title || "work"} in Exhibition`}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title || ""}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-700"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
              {item.category}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-16 pb-4 px-4 flex flex-col justify-end text-left">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/50 mb-1.5 bg-black/40 px-2 py-0.5 rounded-xl backdrop-blur-sm self-start border border-white/10">
            {item.category}
          </span>
          <p className="text-[14px] font-bold text-white/95 truncate">{item.title || "Untitled"}</p>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded-xl px-2.5 py-1.5 border border-white/10">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Open</span>
          <ArrowRight size={9} className="text-white/60" />
        </div>
      </button>
      <WorkActions item={item} onNavigate={onNavigate} />
    </div>
  );
}

// ─── Full-screen Line viewer ──────────────────────────────────────────────────

const LineFull: React.FC<{ post: WallPost }> = ({ post }) => (
  <div className="flex flex-col items-center justify-center w-full h-full max-w-lg mx-auto px-8 text-center gap-6">
    <img
      src={post.artistImage}
      alt={post.artistName}
      className="w-12 h-12 rounded-xl object-cover object-top border border-white/15"
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
      <div className="w-full flex flex-col gap-4 max-w-[700px] mx-auto">
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
          <div className="flex flex-col items-start gap-1.5 px-1">
            <div className="flex items-center gap-1.5">
              <Pin size={9} className="text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/70">
                Pinned by {post.artistName}
              </span>
            </div>
            <p className="text-[14px] leading-[1.55] text-white/60">{post.text}</p>
          </div>
        )}
      </div>
    );
  }

  // PIN_ORIGINAL or unresolved
  const image = resolvedWork?.image ?? resolvedOriginal?.coverImage;
  const title = resolvedWork?.title ?? resolvedOriginal?.title;

  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 max-w-md mx-auto">
      {image && (
        <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
          <img src={image} alt={title ?? "Pinned"} className="w-full h-auto object-cover object-top" />
        </div>
      )}
      {title && (
        <p className="text-[14px] font-black uppercase tracking-[0.15em] text-white/60">{title}</p>
      )}
      {post.text && (
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Pin size={9} className="text-amber-500 fill-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/70">
              Pinned by {post.artistName}
            </span>
          </div>
          <p className="text-[15px] leading-[1.55] text-white/70">{post.text}</p>
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

interface WallSwiperProps {
  entries: WallSwiperEntry[];
  initialIndex: number;
  onClose: () => void;
}

/**
 * WallSwiper — Full-screen swipeable viewer for Wall posts.
 *
 * - LINE posts: large readable typography
 * - PIN_WORK (Edit):  inline iframe embed + Honour / Share / Open Exhibition row
 * - PIN_WORK (Poster/Script/Rec): cover card + Honour / Share / Open Exhibition row
 * - PIN_ORIGINAL: cover image + title + note
 */
export function WallSwiper({ entries, initialIndex, onClose }: WallSwiperProps) {
  const [page, setPage] = useState(initialIndex);
  const activeIndex = ((page % entries.length) + entries.length) % entries.length;
  const { post } = entries[activeIndex];

  const paginate = useCallback((dir: number) => setPage((p) => p + dir), []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      else if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [paginate, onClose]);

  const isDraggable = entries.length > 1;

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
      <div className="fixed top-4 left-4 z-[300] flex items-center gap-2.5">
        <img
          src={post.artistImage}
          alt={post.artistName}
          className="w-7 h-7 rounded-lg object-cover object-top border border-white/10"
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
            {post.artistName}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30">
            {post.type === "LINE" ? "Line" : "Pin"} · {formatRelativeTime(post.postedAt)}
          </span>
        </div>
      </div>

      {/* Swipeable track */}
      <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{ x: `-${page * 100}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 40, mass: 1 }}
          drag={isDraggable ? "x" : false}
          dragElastic={0.15}
          dragDirectionLock
          dragMomentum={false}
          style={{ touchAction: "pan-y", willChange: "transform" }}
          onDragEnd={(_, { offset, velocity }) => {
            const power = offset.x + velocity.x * 0.2;
            if (power < -80) paginate(1);
            else if (power > 80) paginate(-1);
          }}
        >
          {(isDraggable ? [-1, 0, 1] : [0]).map((offset) => {
            const virtualPage = page + offset;
            const idx = ((virtualPage % entries.length) + entries.length) % entries.length;
            const entry = entries[idx];
            if (!entry) return null;

            return (
              <div
                key={`${entry.post.id}-${virtualPage}`}
                className="absolute inset-0 w-full h-full flex items-center justify-center px-4 pt-20 pb-16 overflow-y-auto"
                style={{ left: `${virtualPage * 100}%` }}
                onClick={(e) => e.stopPropagation()}
              >
                {entry.post.type === "LINE" ? (
                  <LineFull post={entry.post} />
                ) : (
                  <PinFull
                    post={entry.post}
                    resolvedWork={entry.resolvedWork}
                    resolvedOriginal={entry.resolvedOriginal}
                    isActive={offset === 0}
                    onClose={onClose}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Desktop chevrons */}
      {isDraggable && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); paginate(-1); }}
            className="hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 z-[300] w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all duration-150"
            aria-label="Previous post"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); paginate(1); }}
            className="hidden sm:flex fixed right-4 top-1/2 -translate-y-1/2 z-[300] w-10 h-10 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 items-center justify-center text-white/50 hover:text-white hover:bg-black/70 transition-all duration-150"
            aria-label="Next post"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Progress dots */}
      <div className="fixed bottom-6 sm:bottom-8 inset-x-0 z-[300] flex justify-center pointer-events-none">
        <ProgressDots total={entries.length} current={activeIndex} />
      </div>
    </ModalWrapper>,
    document.body
  );
}
