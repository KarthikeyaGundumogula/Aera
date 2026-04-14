import { useState, memo } from "react";
import { TheatreItem, SetSelectedItem } from "../../../../types";
import { MobileSlot } from "../../engine/mobileClusterBuilder";
import { CategoryBadge } from "../CategoryBadge";

// ─── Content Renderers ──────────────────────────────────────────────────────

function ScriptContent({ item }: { item: TheatreItem }) {
  const body =
    item.title?.split(":").length! > 1
      ? item.title!.split(":")[1]
      : "A moment of cinematic reflection.";

  return (
    <div className="w-full h-full text-[#2a2a2a] p-4 font-mono text-[9px] leading-tight flex flex-col justify-center">
      <div className="uppercase mb-1 opacity-40 text-[6px] font-bold tracking-widest">
        Scene {item.id}
      </div>
      <div className="mb-2 font-bold uppercase tracking-tighter line-clamp-1">
        {item.origins || "INT. THE CANVAS"}
      </div>
      <div className="mb-2 italic opacity-70 leading-relaxed line-clamp-3">
        {body}
      </div>
      <div className="text-center w-full mt-2 font-bold uppercase text-[7px] tracking-[0.2em]">
        {item.artist || "DIRECTOR"}
      </div>
    </div>
  );
}

function PosterContent({ item }: { item: TheatreItem }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative">
      <img
        onLoad={() => setIsLoaded(true)}
        src={item.image}
        alt={item.title}
        loading="lazy"
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
      <div className="absolute bottom-2 left-2 right-2 flex flex-col items-center">
        <h2 className="text-sm font-serif italic tracking-tighter text-white/90 leading-none mb-1 text-center line-clamp-1">
          {item.title}
        </h2>
        <div className="h-[1px] w-6 bg-white/30 mx-auto my-1" />
        <p className="text-[5px] uppercase tracking-[0.4em] text-white/50">
          {item.origins}
        </p>
      </div>
    </div>
  );
}

function MediaContent({ item }: { item: TheatreItem }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      onLoad={() => setIsLoaded(true)}
      src={item.image}
      alt={item.title}
      loading="lazy"
      className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      
    />
  );
}

// ─── Mobile Card ────────────────────────────────────────────────────────────

interface MobileCardProps {
  slot: MobileSlot;
  setSelectedItem: SetSelectedItem;
  /** When true, the card stretches to fill its parent height instead of using its aspect class. */
  forceFill?: boolean;
}

/**
 * A single card rendered inside a mobile cluster.
 * Uses the slot's `aspectClass` for sizing unless `forceFill` is set (used in
 * asymmetric layouts where a vertical card must match the height of its sibling stack).
 */
export const MobileCard = memo(function MobileCard({
  slot,
  setSelectedItem,
  forceFill = false,
}: MobileCardProps) {
  const { item } = slot;
  const isScript = item.category === "Script";

  return (
    <div
      onClick={() => setSelectedItem(item)}
      className={`relative w-full overflow-hidden bg-zinc-900/40 border border-white/5 active:scale-[0.98] transition-transform ${
        forceFill ? "h-full" : slot.aspectClass
      } ${isScript ? "bg-[#f4f1ea] border-black/5" : ""}`}
    >
      {/* Content */}
      {isScript ? (
        <ScriptContent item={item} />
      ) : item.category === "Poster" ? (
        <PosterContent item={item} />
      ) : (
        <MediaContent item={item} />
      )}

      {/* Category Badge */}
      <CategoryBadge item={item} variant="mobile" />
    </div>
  );
});
