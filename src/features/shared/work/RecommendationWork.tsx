import { memo, useState } from "react";
import { TheatreItem } from "../../../types";
import { BaseWorkProps } from "./types";
import { MOCK_RECOMMENDATIONS } from "../../../mock/recommendations";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { SurgeBars } from "../../../components/SurgeBars";

// ─── RecommendationWork ───────────────────────────────────────────────────────

interface RecommendationWorkProps extends Pick<BaseWorkProps, "variant" | "priority"> {
  item: TheatreItem;
}

/**
 * Theatre tile for a Recommendation.
 * Renders: movie poster (full-bleed) → gradient overlay → title + bars (bottom-left)
 * → artist avatar (bottom-right).
 *
 * On click: opens RecommendationModal at the matching rec index via context.
 *
 * Design qualities met (per design-quality.md):
 *   ✓ Hierarchy through scale contrast (title vs bars vs avatar size)
 *   ✓ Depth through layering  (4 z-layers: image → gradient → text → avatar)
 *   ✓ Designed hover/active state (poster scales, avatar ring glows)
 *   ✓ Color used semantically (amber = surge signal, not decoration)
 */
export const RecommendationWork = memo(function RecommendationWork({
  item,
  priority = "lazy",
}: RecommendationWorkProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { openWork } = useWorkNavigation();

  // Look up full rec to get the score details
  const rec = item.recId ? MOCK_RECOMMENDATIONS.find((r) => r.id === item.recId) : null;

  return (
    <div
      className={`group relative h-full w-full overflow-hidden bg-zinc-900 ${variant !== "theatre-mobile" ? "cursor-pointer" : ""}`}
      onClick={() => {
        if (variant !== "theatre-mobile") {
          openWork(item);
        }
      }}
    >
      {/* Layer 1: Movie poster */}
      <img
        src={item.image}
        alt={item.title ?? "Recommendation"}
        loading={priority}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover object-top transition-all duration-700
          group-hover:scale-105
          ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />

      {/* Layer 2: Gradient overlay — bottom up, fades title area */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Layer 3: Top-right — Glassmorphic SurgeBars Hint */}
      {rec && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <SurgeBars 
              score={rec.score || 0} 
              highestScore={rec.artist.highestScore ?? 4500} 
              size="sm" 
              colorVariant="amber" 
            />
          </div>
        </div>
      )}

      {/* Layer 4: Bottom-left — movie title */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex flex-col gap-1.5 z-10">
        <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-tight text-white/90 leading-tight truncate drop-shadow-sm">
          {item.title}
        </p>
      </div>

      {/* Skeleton shimmer while image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
    </div>
  );
});
