import { memo } from "react";
import { TheatreItem } from "../../../types";
import { WorkVariant } from "./types";

interface WorkOverlayProps {
  item: TheatreItem;
  variant: WorkVariant | string;
}

export const WorkOverlay = memo(({ item, variant }: WorkOverlayProps) => {
  if (variant !== "feed" && variant !== "theatre-desktop" && variant !== "theatre-mobile") {
    return null;
  }

  // Determine if overlay should be constant (feed) or reveal on hover (desktop theatre)
  const isHoverOnly = variant === "theatre-desktop";

  return (
    <div 
      className={`absolute inset-0 pointer-events-none flex flex-col justify-end p-3 sm:p-4 transition-opacity duration-300 ${
        isHoverOnly ? "opacity-0 group-hover:opacity-100" : "opacity-100"
      }`}
    >
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500" />
      <div className="relative z-10 transform transition-transform duration-500 translate-y-0 group-hover:-translate-y-1">
        <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/90 line-clamp-1 mb-0.5 sm:mb-1 drop-shadow-md">
          {item.title}
        </h3>
        <p className="text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.4em] text-white/50 drop-shadow-sm flex items-center gap-2">
          {item.artist || "Original Artist"}
          <span className="w-1.5 h-[1px] bg-brand-accent/50 hidden group-hover:block transition-all" />
        </p>
      </div>
    </div>
  );
});
