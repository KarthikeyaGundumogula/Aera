import { useState, useRef, useEffect, useMemo } from "react";
import { Pencil, Check, X, Film, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { TheatreItem } from "../../../types";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { getYoutubeFallbackThumbnail } from "../../../utils/embed";

interface StudioWorkCardProps {
  item: TheatreItem;
  onRename: (newTitle: string) => void;
}

export function StudioWorkCard({ item, onRename }: StudioWorkCardProps) {
  const { openWork } = useWorkNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title || "");
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.image);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync title from parent if it changes
  useEffect(() => {
    setEditedTitle(item.title || "");
  }, [item.title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (editedTitle.trim() && editedTitle !== item.title) {
      onRename(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(item.title || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditedTitle(item.title || "");
      setIsEditing(false);
    }
  };

  const getAspectBadge = useMemo(() => {
    switch (item.category) {
      case "Edit":
        return "16:9 HD";
      case "Poster":
        return "2:3 IMAX";
      case "Script":
        return "4:3 PDF";
      default:
        return "1:1 SQ";
    }
  }, [item.category]);

  const getCategoryIcon = useMemo(() => {
    switch (item.category) {
      case "Edit":
        return <Film className="w-3 h-3" />;
      case "Script":
        return <FileText className="w-3 h-3" />;
      case "Poster":
        return <ImageIcon className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  }, [item.category]);

  return (
    <div
      onClick={() => !isEditing && openWork(item)}
      className="group relative flex flex-col bg-[#0b0c10] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-lg cursor-pointer"
    >
      {/* ─── Media Preview Window ─── */}
      <div className="relative aspect-video w-full bg-black/40 overflow-hidden flex items-center justify-center">
        {imgSrc ? (
          <img
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth === 120 && img.src.includes("maxresdefault") && item.platform === "youtube" && item.srcId) {
                const fallback = getYoutubeFallbackThumbnail(item.srcId);
                setImgSrc(fallback);
              } else {
                setIsLoaded(true);
              }
            }}
            onError={() => {
              if (item.platform === "youtube" && item.srcId) {
                setImgSrc(getYoutubeFallbackThumbnail(item.srcId));
              }
            }}
            src={imgSrc}
            alt={item.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : (
          <div className="text-white/10">{getCategoryIcon}</div>
        )}

        {/* Technical Hud Overlay */}
        <div className="absolute top-2 left-2 z-10 flex gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-wider bg-black/60 text-white/50 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-md">
            {getAspectBadge}
          </span>
        </div>

        {/* Edit Button (Top Right) */}
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-lg bg-black/60 border border-white/10 text-white/40 hover:text-white hover:bg-black/90 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            aria-label="Edit title"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Inline rename input overlay */}
        {isEditing && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex flex-col justify-center p-3 animate-in fade-in duration-200"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 mb-1.5">
              Rename Work Title
            </span>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg p-1.5 mb-2 focus-within:border-white/30 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-xs font-bold text-white outline-none pl-1"
                placeholder="New work title"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="flex items-center justify-center p-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-all"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center p-1 rounded-md bg-white text-black hover:bg-white/90 transition-all"
                title="Save Changes"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Metadata Strip ─── */}
      <div className="flex flex-col p-3 border-t border-white/5 gap-1">
        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-white/30">
          <div className="flex items-center gap-1">
            {getCategoryIcon}
            <span>{item.category}</span>
          </div>
          {item.credits !== undefined && (
            <span>{item.credits.toLocaleString()} CR</span>
          )}
        </div>
        <span className="text-xs font-black uppercase tracking-wide truncate text-white/80 group-hover:text-white transition-colors mt-0.5">
          {item.title}
        </span>
      </div>
    </div>
  );
}
