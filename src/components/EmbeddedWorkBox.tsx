import React, { useState, useMemo } from "react";
import { Film, Play, Sparkles, ChevronRight, AlertTriangle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
const GRID_ITEMS: any[] = [];
import { TheatreItem } from "../types/theatre";
import { useWorkNavigation } from "../hooks/useWorkNavigation";

export interface EmbeddedWorkData {
  id: string;
  title: string;
  category?: string;
  type?: string;
  image?: string;
  thumbnail?: string;
  artistName?: string;
  artist?: string;
}

export interface EmbeddedWorkBoxProps {
  work?: EmbeddedWorkData | TheatreItem | null;
  workId?: string | null;
  variant?: "default" | "compact" | "wall";
  showCameraPin?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EmbeddedWorkBox({
  work: rawWork,
  workId,
  variant = "default",
  showCameraPin = false,
  className = "",
  onClick: customOnClick,
}: EmbeddedWorkBoxProps) {
  const navigate = useNavigate();
  const { openWork } = useWorkNavigation();
  const [imageError, setImageError] = useState(false);
  const [hasResolutionError, setHasResolutionError] = useState(false);

  // Resolve work from GRID_ITEMS if only workId was supplied or if rawWork passed
  const resolvedWork: EmbeddedWorkData | TheatreItem | undefined = useMemo(() => {
    try {
      if (rawWork) {
        const found = GRID_ITEMS.find((item: any) => String(item.id) === String(rawWork.id));
        if (found) return { ...found, ...rawWork };
        return rawWork;
      }
      if (workId) {
        const found = GRID_ITEMS.find((item: any) => String(item.id) === String(workId));
        if (found) return found;
        return {
          id: workId,
          title: `Work #${workId}`,
          category: "Work",
        };
      }
    } catch (err) {
      console.error("[EmbeddedWorkBox] Resolution error:", err);
      setHasResolutionError(true);
    }
    return undefined;
  }, [rawWork, workId]);

  if (hasResolutionError) {
    return (
      <div className={`p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-300/80 text-[10px] font-mono flex items-center gap-2 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        <span>Failed to load attached work.</span>
      </div>
    );
  }

  if (!resolvedWork) return null;

  const title = resolvedWork.title || "Untitled Work";
  const category =
    resolvedWork.category ||
    (resolvedWork as any).type ||
    "WORK";
  const image =
    !imageError
      ? resolvedWork.image || (resolvedWork as any).thumbnail || undefined
      : undefined;
  const artistName =
    (resolvedWork as any).artistName ||
    (resolvedWork as any).artist ||
    undefined;

  const isVideo =
    category.toLowerCase().includes("edit") ||
    (resolvedWork as any).type === "video" ||
    Boolean((resolvedWork as any).platform);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (customOnClick) {
        customOnClick(e);
        return;
      }
      if ((resolvedWork as TheatreItem).category && (resolvedWork as TheatreItem).id) {
        openWork(resolvedWork as TheatreItem);
      } else if (resolvedWork.id) {
        navigate(`/works/${resolvedWork.id}`);
      }
    } catch (err) {
      console.error("[EmbeddedWorkBox] Navigation error:", err);
    }
  };

  /* ── Compact Horizontal Variant (Used in Discussion Cards & Thread Comments) ── */
  if (variant === "compact") {
    return (
      <div
        onClick={handleClick}
        className={`group flex items-center gap-3 p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer ${className}`}
      >
        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/30 bg-white/[0.02]">
              {imageError ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />
              ) : (
                <Film className="w-3.5 h-3.5" />
              )}
            </div>
          )}
          {!imageError && isVideo ? (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
              <Play className="w-3 h-3 text-white fill-white/80" />
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[8px] font-black uppercase tracking-widest text-amber-400">
              {category}
            </span>
            {artistName && (
              <span className="text-[9px] font-mono text-white/40 truncate">
                by {artistName}
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white truncate group-hover:text-amber-400 transition-colors">
            {title}
          </p>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
      </div>
    );
  }

  /* ── Default Cinematic Full-Width Variant (Matches Wall Posts & Main Post Embeds) ── */
  return (
    <div
      onClick={handleClick}
      className={`group relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/10 cursor-pointer hover:border-white/25 transition-all shadow-xl ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-white/5 flex flex-col items-center justify-center gap-2 p-4 text-center">
          {imageError ? (
            <>
              <AlertTriangle className="w-6 h-6 text-amber-500/70" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">
                Image Preview Unavailable
              </span>
            </>
          ) : (
            <>
              <Film className="w-6 h-6 text-amber-500/60" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                {category} Work
              </span>
            </>
          )}
        </div>
      )}

      {/* Cinematic gradient overlay for title contrast */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Camera / Pin badge — top-left (Shown ONLY when showCameraPin is explicitly enabled, e.g. for Wall Posts) */}
      {showCameraPin && (
        <div className="absolute top-3 left-3 z-20 w-7 h-7 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center">
          <Camera size={12} className="text-amber-500 fill-amber-500 [&>circle]:fill-black" aria-hidden="true" />
        </div>
      )}

      {/* Play badge — top-right for video edits */}
      {isVideo && !imageError && (
        <div className="absolute top-3 right-3 z-20 w-7 h-7 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-md flex items-center justify-center">
          <Play size={12} className="text-white fill-white ml-0.5" aria-hidden="true" />
        </div>
      )}

      {/* Work Title & Category overlay at bottom-left */}
      <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[8px] font-black uppercase tracking-widest text-amber-400">
            {category}
          </span>
          {artistName && (
            <span className="text-[9px] font-mono text-white/60">
              by {artistName}
            </span>
          )}
        </div>
        <span className="text-[12px] sm:text-[13px] font-black uppercase tracking-[0.15em] text-white truncate block drop-shadow-md group-hover:text-amber-400 transition-colors">
          {title}
        </span>
      </div>
    </div>
  );
}
