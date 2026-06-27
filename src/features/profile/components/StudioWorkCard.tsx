import { useState, useRef, useEffect, useMemo, memo } from "react";
import { Pencil, Check, X, Film, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { TheatreItem } from "../../../types";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { getYoutubeFallbackThumbnail } from "../../../utils/embed";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";

interface StudioWorkCardProps {
  item: TheatreItem;
  onRename: (newTitle: string) => void;
}

export const StudioWorkCard = memo(function StudioWorkCard({ item, onRename }: StudioWorkCardProps) {
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
            className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
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

        {/* Edit Button (Top Right) - Always visible for touch/mobile users, styled to stand out */}
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/85 border border-white/20 text-white hover:bg-white hover:text-black active:scale-95 transition-all opacity-95 md:opacity-65 md:group-hover:opacity-100 shadow-xl"
            aria-label="Edit title"
          >
            <Pencil className="w-3 h-3 text-current" />
            <span className="text-[9px] font-black uppercase tracking-wider">EDIT</span>
          </button>
        )}
      </div>

      {/* Spacious Modal Overlay for renaming */}
      <ModalWrapper isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <div className="w-full max-w-md bg-[#0b0c10] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-white/80">
              Edit Title
            </h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
              Title
            </label>
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all"
              placeholder="New work title"
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={(e) => handleCancel(e)}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={(e) => handleSave(e)}
              className="px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Save Title
            </button>
          </div>
        </div>
      </ModalWrapper>

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
});
