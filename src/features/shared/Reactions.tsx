import { useState, useRef } from "react";
import { Flame, Activity, Wine, Heart, Lightbulb } from "lucide-react";

export type ReactionType = "ignite" | "resonate" | "toast" | "love" | "insight";

interface ReactionsProps {
  initialReactions?: {
    ignite?: number;
    resonate?: number;
    toast?: number;
    love?: number;
    insight?: number;
  };
  onReact?: (type: ReactionType) => void;
}

const REACTION_CONFIG = [
  { id: "ignite" as ReactionType, icon: Flame, activeColor: "text-orange-400", label: "Ignite" },
  { id: "resonate" as ReactionType, icon: Activity, activeColor: "text-amber-400", label: "Resonate" },
  { id: "toast" as ReactionType, icon: Wine, activeColor: "text-rose-400", label: "Toast" },
  { id: "love" as ReactionType, icon: Heart, activeColor: "text-red-400", label: "Love" },
  { id: "insight" as ReactionType, icon: Lightbulb, activeColor: "text-blue-400", label: "Insight" },
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
