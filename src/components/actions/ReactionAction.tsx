import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { SmilePlus, Plus } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLongPress } from "../../hooks/useLongPress";
import { DEFAULT_QUICK_REACTIONS, ReactionId } from "../../types/reactions";

const EmojiPicker = React.lazy(() => import("emoji-picker-react"));

interface ReactionActionProps {
  activeReaction: ReactionId | null;
  onReact: (reaction: ReactionId | null) => void;
  count?: number;
  className?: string;
  variant?: "inline" | "floating" | "comment-bar";
  isFeed?: boolean; // Deprecated: use variant instead
}

export const ReactionAction: React.FC<ReactionActionProps> = ({
  activeReaction,
  onReact,
  count,
  className = "",
  variant,
  isFeed = true, // fallback
}) => {
  const { currentArtist } = useAuth();
  const navigate = useNavigate();
  const activeVariant = variant || (isFeed ? "inline" : "floating");
  const isCommentBar = activeVariant === "comment-bar";
  const [showPicker, setShowPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<ReactionId[]>(DEFAULT_QUICK_REACTIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [horizontalShift, setHorizontalShift] = useState(0);
  const [openDownward, setOpenDownward] = useState(false);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker && !showFullPicker) return;
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        (!pickerRef.current || !pickerRef.current.contains(target))
      ) {
        setShowPicker(false);
        setShowFullPicker(false);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("touchstart", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, [showPicker, showFullPicker]);

  // Ensure quick-tray popover stays fully within viewport bounds
  useEffect(() => {
    if (!showPicker) {
      setHorizontalShift(0);
      setOpenDownward(false);
      return;
    }

    const checkBounds = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      
      // If trigger is very close to top of viewport, flip downward
      if (cRect.top < 80) {
        setOpenDownward(true);
      } else {
        setOpenDownward(false);
      }

      if (pickerRef.current) {
        const pRect = pickerRef.current.getBoundingClientRect();
        const padding = 12; // Safety margin from viewport edges
        let shift = 0;

        if (pRect.left < padding) {
          shift = padding - pRect.left;
        } else if (pRect.right > window.innerWidth - padding) {
          shift = (window.innerWidth - padding) - pRect.right;
        }

        setHorizontalShift(shift);
      }
    };

    checkBounds();
    const rafId = requestAnimationFrame(checkBounds);
    window.addEventListener("resize", checkBounds);
    window.addEventListener("scroll", checkBounds, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", checkBounds);
      window.removeEventListener("scroll", checkBounds, true);
    };
  }, [showPicker]);

  const handleToggle = () => {
    if (!currentArtist) {
      navigate("/profile/login");
      return;
    }
    if (showPicker || showFullPicker) {
      setShowPicker(false);
      setShowFullPicker(false);
    } else {
      setShowPicker(true);
    }
  };

  const displayIcon = activeReaction || "🔥";
  const isActive = !!activeReaction;

  const baseClasses = activeVariant === "inline"
    ? "flex items-center gap-1.5 transition-colors relative"
    : "flex items-center gap-1.5 relative border rounded-xl px-3 py-1.5 transition-all duration-200";

  const activeClasses = activeVariant === "inline"
    ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
    : "border-amber-500/30 bg-amber-500/10 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.2)]";

  const idleClasses = activeVariant === "inline"
    ? "text-white/30 hover:text-white/60"
    : "border-white/10 bg-white/5 text-white/40 hover:text-white/80 hover:bg-white/10";

  const renderOverlappedMetrics = (sizeClass = "w-[18px] h-[18px] text-[9px]") => {
    if (count === undefined || count <= 0) return null;

    const visibleMetrics = [activeReaction, ...recentEmojis.slice(0, 3)]
      .filter((r, i, arr) => r && arr.indexOf(r) === i)
      .slice(0, 3);

    return (
      <div className="flex -space-x-1.5 items-center">
        {visibleMetrics.map((r, i) => (
            <div 
              key={r} 
              className={`${sizeClass} rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center shadow-sm relative`}
              style={{ zIndex: 30 - i }}
            >
              {r}
            </div>
          ))}
      </div>
    );
  };

  const renderContent = () => {
    if (activeVariant === "comment-bar") {
      return (
        <div 
          onClick={handleToggle}
          className={`w-full h-11 rounded-2xl transition-all flex items-center justify-between px-3 cursor-pointer group ${
            isActive
              ? "bg-amber-500/[0.08] hover:bg-amber-500/[0.12] border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
              : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/10"
          } ${className}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {renderOverlappedMetrics("w-[22px] h-[22px] text-[11px]")}
            <span className={`text-[11px] font-medium truncate transition-colors ${
              isActive ? "text-amber-400/90 group-hover:text-amber-300 font-semibold" : "text-white/40 group-hover:text-white/60"
            }`}>
              {count && count > 0 ? `${count} Reactions` : "Add a reaction..."}
            </span>
          </div>
          
          <div 
            onClick={(e) => {
              if (isActive) {
                e.stopPropagation();
                if (!currentArtist) {
                  navigate("/profile/login");
                  return;
                }
                onReact(null);
              }
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isActive 
                ? "bg-amber-500/20 border border-amber-500/40 shadow-sm hover:scale-110 active:scale-95" 
                : "bg-transparent group-hover:bg-white/5"
            }`}
            title={isActive ? "Click to remove reaction" : "Add reaction"}
          >
            {isActive ? (
               <span className="text-sm scale-110 select-none">{displayIcon}</span>
            ) : (
               <SmilePlus size={15} className="text-white/40 group-hover:text-white/70" />
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {/* The main action button */}
        <button
          onClick={handleToggle}
          className={`${baseClasses} ${isActive ? activeClasses : idleClasses} ${className}`}
          aria-label={isActive ? "Remove reaction" : "React to post"}
        >
          <span 
            className="flex items-center justify-center select-none" 
            style={{ 
              transform: isActive ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
          >
            {isActive ? (
              <span className="text-base">{displayIcon}</span>
            ) : (
              <SmilePlus size={16} strokeWidth={2} />
            )}
          </span>
        </button>

        {/* The Metrics (Overlapped Carousel) */}
        {count !== undefined && count > 0 && (
          <div className="flex items-center gap-1.5 ml-1">
            {renderOverlappedMetrics()}
            <span className="text-[10px] font-black text-white/40 tracking-wider">
              +{count}
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <div 
      className={`relative inline-flex items-center ${activeVariant === "comment-bar" ? "w-full" : ""}`} 
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {renderContent()}

      {/* Popover Quick-Tray Picker */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: openDownward ? -8 : 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: horizontalShift, scale: 1 }}
            exit={{ opacity: 0, y: openDownward ? -8 : 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`absolute ${
              openDownward ? "top-full mt-2.5" : "bottom-full mb-2.5"
            } ${
              isCommentBar
                ? openDownward
                  ? "left-0 origin-top-left"
                  : "left-0 origin-bottom-left"
                : openDownward
                  ? "right-0 origin-top-right"
                  : "right-0 origin-bottom-right"
            } z-[400] flex items-center gap-1.5 p-2 rounded-2xl bg-[#111111]/95 backdrop-blur-xl border border-white/10 shadow-2xl max-w-[calc(100vw-24px)] select-none`}
          >
            {recentEmojis.slice(0, 5).map((emoji) => {
              const isSelected = activeReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!currentArtist) {
                      navigate("/profile/login");
                      return;
                    }
                    onReact(isSelected ? null : emoji);
                    setShowPicker(false);
                    // Move to front of recent
                    setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji)]);
                  }}
                  className={`relative p-2 rounded-xl text-lg hover:scale-125 transition-transform duration-200 shrink-0 ${
                    isSelected ? "bg-amber-500/20 border border-amber-500/40" : "hover:bg-white/5"
                  }`}
                >
                  <span className="relative z-10 select-none">{emoji}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-reaction-bg"
                      className="absolute inset-0 rounded-xl bg-amber-500/10"
                    />
                  )}
                </button>
              );
            })}
            
            {/* '+' button for full emoji picker */}
            <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!currentArtist) {
                  navigate("/profile/login");
                  return;
                }
                setShowPicker(false);
                setShowFullPicker(true);
              }}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="More emojis"
            >
              <Plus size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Emoji Picker Popover (via Portal) */}
      {showFullPicker && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPicker(false);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div 
            className="relative shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Suspense fallback={<div className="p-4 bg-[#222222] rounded-xl text-white/50 text-sm">Loading emojis...</div>}>
              <EmojiPicker
                theme={"dark" as any}
                onEmojiClick={(emojiData: EmojiClickData) => {
                  if (!currentArtist) {
                    navigate("/profile/login");
                    return;
                  }
                  const emoji = emojiData.emoji;
                  onReact(activeReaction === emoji ? null : emoji);
                  setShowFullPicker(false);
                  setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji)]);
                }}
                autoFocusSearch={true}
              />
            </Suspense>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
