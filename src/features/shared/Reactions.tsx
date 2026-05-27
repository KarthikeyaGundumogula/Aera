import { useState, useRef } from "react";
import { Heart, Zap, Flame, Star, Sparkles } from "lucide-react";

export type ReactionType = "heart" | "zap" | "flame" | "star" | "sparkles";

interface ReactionsProps {
  initialReactions?: {
    heart?: number;
    zap?: number;
    flame?: number;
    star?: number;
    sparkles?: number;
  };
  onReact?: (type: ReactionType) => void;
}

const REACTION_CONFIG = [
  { id: "heart" as ReactionType, icon: Heart, activeColor: "text-rose-500", label: "Love" },
  { id: "zap" as ReactionType, icon: Zap, activeColor: "text-yellow-500", label: "Zap" },
  { id: "flame" as ReactionType, icon: Flame, activeColor: "text-orange-500", label: "Flame" },
  { id: "star" as ReactionType, icon: Star, activeColor: "text-amber-400", label: "Star" },
  { id: "sparkles" as ReactionType, icon: Sparkles, activeColor: "text-cyan-400", label: "Sparkles" },
] as const;

export function Reactions({ initialReactions, onReact }: ReactionsProps) {
  const [counts, setCounts] = useState(initialReactions || {});
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleReact = (type: ReactionType) => {
    // Clear any running animation
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (myReaction === type) {
      setCounts(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 1) - 1) }));
      setMyReaction(null);
    } else {
      if (myReaction) {
        setCounts(prev => ({ ...prev, [myReaction]: Math.max(0, (prev[myReaction] || 1) - 1) }));
      }
      setCounts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
      setMyReaction(type);

      // Trigger animation
      setAnimatingId(type);
      timeoutRef.current = setTimeout(() => setAnimatingId(null), 400);
    }
    if (onReact) onReact(type);
  };

  return (
    <div className="flex items-center gap-1">
      {REACTION_CONFIG.map((react) => {
        const Icon = react.icon;
        const count = counts[react.id] || 0;
        const isActive = myReaction === react.id;
        const isAnimating = animatingId === react.id;
        return (
          <button
            key={react.id}
            onClick={() => handleReact(react.id)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-150 cursor-pointer ${
              isActive
                ? `bg-white/10 ${react.activeColor}`
                : `text-white/30 hover:text-white/70 hover:bg-white/5`
            }`}
            title={react.label}
          >
            <Icon className={`w-5 h-5 transition-transform duration-200 ${isAnimating ? 'scale-150' : ''}`} />
            {count > 0 && (
              <span className={`text-[11px] font-bold tabular-nums transition-all duration-200 ${
                isActive ? react.activeColor : "text-white/40"
              } ${isAnimating ? 'scale-125' : ''}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
