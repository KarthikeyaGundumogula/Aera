import { motion } from "motion/react";
import { useState, memo } from "react";
import { TheatreItem, SetSelectedItem } from "../../../../types";
import { ClusterSlot } from "../../engine/clusterBuilder";
import { CategoryBadge } from "../CategoryBadge";

// ─── Content Renderers ──────────────────────────────────────────────────────

/** Screenplay-style card with parchment background. */
function ScriptContent({ item }: { item: TheatreItem }) {
  const body =
    item.title && item.title.split(":").length > 1
      ? item.title.split(":")[1]
      : "A moment of pure cinematic reflection, captured in the void of the grid.";

  return (
    <div className="w-full h-full bg-[#f4f1ea] text-[#2a2a2a] p-6 font-mono text-[10px] leading-tight overflow-hidden shadow-inner border border-black/5 flex flex-col justify-center select-text">
      <div className="uppercase mb-2 opacity-40 text-[7px] font-bold tracking-widest">
        Scene {item.id}
      </div>
      <div className="mb-2 font-bold uppercase tracking-tighter">
        {item.origins || "INT. THE CANVAS - DAY"}
      </div>
      <div className="mb-4 italic opacity-70 leading-relaxed">{body}</div>
      <div className="text-center w-full mb-1 mt-2 font-bold uppercase text-[8px] tracking-[0.2em]">
        {item.artist || "DIRECTOR"}
      </div>
      <div className="text-center w-full px-4 italic opacity-90">
        "{item.title?.split(":")[0]}"
      </div>
      <div className="mt-6 pt-4 border-t border-black/5 opacity-20 text-[6px] uppercase tracking-widest flex justify-between">
        <span>Draft v2.4</span>
        <span>{item.credits} Credits</span>
      </div>
    </div>
  );
}

/** Poster card with cinematic title overlay. */
function PosterContent({ item }: { item: TheatreItem }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        onLoad={() => setIsLoaded(true)}
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 border-[12px] border-transparent group-hover:border-white/10 transition-all duration-500">
        <div className="text-center">
          <h2 className="text-lg font-serif italic tracking-tighter text-white/90 leading-none mb-1">
            {item.title}
          </h2>
          <div className="h-[1px] w-8 bg-white/30 mx-auto my-2" />
          <p className="text-[6px] uppercase tracking-[0.4em] text-white/50">
            {item.origins}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Default media card (video stills, edits). */
function MediaContent({ item }: { item: TheatreItem }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.img
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      onLoad={() => setIsLoaded(true)}
      src={item.image}
      alt={item.title}
      loading="lazy"
      className="w-full h-full object-cover transition-all duration-700 group-hover:object-contain bg-black/40"
    />
  );
}

// ─── Desktop Canvas Card ────────────────────────────────────────────────────

interface DesktopCanvasCardProps {
  slot: ClusterSlot;
  item: TheatreItem;
  setSelectedItem: SetSelectedItem;
}

/**
 * A single card rendered inside a desktop cluster grid.
 * Positioned via CSS Grid using the slot's (x, y, w, h) values.
 */
export const DesktopCanvasCard = memo(function DesktopCanvasCard({
  slot,
  item,
  setSelectedItem,
}: DesktopCanvasCardProps) {
  const isPoster = item.category === "Poster";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        zIndex: 20,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(item, [item], 1);
      }}
      className={`relative group overflow-hidden border border-white/10 bg-zinc-900/20 rounded-sm transition-all duration-500 ${isPoster ? "ring-1 ring-white/5" : ""}`}
      style={{
        gridColumn: `${slot.x + 1} / span ${slot.w}`,
        gridRow: `${slot.y + 1} / span ${slot.h}`,
      }}
    >
      {/* Content — determined by category */}
      {item.category === "Script" ? (
        <ScriptContent item={item} />
      ) : isPoster ? (
        <PosterContent item={item} />
      ) : (
        <MediaContent item={item} />
      )}

      {/* Category Badge — video / poster / script indicator */}
      <CategoryBadge item={item} variant="desktop" />

      {/* Hover Overlay — slot metadata */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-1">
          {slot.type} //{" "}
          {item.aspectRatio?.toFixed(2) || (slot.w / slot.h).toFixed(2)}
        </p>
        <h4 className="text-xs font-bold uppercase tracking-tighter leading-none">
          {item.title}
        </h4>
      </div>
    </motion.div>
  );
});
