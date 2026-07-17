import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SmilePlus, Plus } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useLongPress } from "../../hooks/useLongPress";
import { DEFAULT_QUICK_REACTIONS, ReactionId } from "../../types/reactions";

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
  const activeVariant = variant || (isFeed ? "inline" : "floating");
  const [showPicker, setShowPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<ReactionId[]>(DEFAULT_QUICK_REACTIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker && !showFullPicker) return;
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const handleToggle = () => {
    if (showPicker || showFullPicker) {
      setShowPicker(false);
      setShowFullPicker(false);
      return;
    }
    if (activeReaction) {
      onReact(null);
    } else {
      // Default to most recently used, or FIRE
      onReact(recentEmojis[0] || "🔥");
    }
  };

  const handlers = useLongPress({
    onLongPress: () => {
      setShowPicker(true);
      // Vibrate if supported
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    },
    onClick: handleToggle,
    delay: 350,
  });

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
    return (
      <div className="flex -space-x-1.5 items-center">
        {[activeReaction, ...recentEmojis.slice(0, 3)]
          .filter((r, i, arr) => r && arr.indexOf(r) === i)
          .slice(0, 3)
          .map((r, i) => (
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
          {...handlers}
          className={`w-full h-11 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors flex items-center justify-between px-3 cursor-pointer group ${className}`}
        >
          <div className="flex items-center gap-3">
            {renderOverlappedMetrics("w-[22px] h-[22px] text-[11px]")}
            <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors">
              {count && count > 0 ? `${count} Reactions` : "Add a reaction..."}
            </span>
          </div>
          
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-white/10 shadow-sm' : 'bg-transparent group-hover:bg-white/5'}`}>
            {isActive ? (
               <span className="text-sm scale-110">{displayIcon}</span>
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
          {...handlers}
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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-full left-0 mb-3 z-[400] flex items-center gap-1.5 p-2 rounded-2xl bg-[#111111]/90 backdrop-blur-xl border border-white/10 shadow-2xl origin-bottom-left"
          >
            {recentEmojis.slice(0, 5).map((emoji) => {
              const isSelected = activeReaction === emoji;
              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact(emoji);
                    setShowPicker(false);
                    // Move to front of recent
                    setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji)]);
                  }}
                  className={`relative p-2 rounded-xl text-lg hover:scale-125 transition-transform duration-200 ${
                    isSelected ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="relative z-10 select-none">{emoji}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-reaction-bg"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/5"
                    />
                  )}
                </button>
              );
            })}
            
            {/* '+' button for full emoji picker */}
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPicker(false);
                setShowFullPicker(true);
              }}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
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
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={(emojiData: EmojiClickData) => {
                const emoji = emojiData.emoji;
                onReact(emoji);
                setShowFullPicker(false);
                setRecentEmojis(prev => [emoji, ...prev.filter(e => e !== emoji)]);
              }}
              autoFocusSearch={true}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
