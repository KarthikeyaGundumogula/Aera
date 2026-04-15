import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";

export function EditWork({
  item,
  variant,
  onSelect,
  className = "",
  showBadge = true,
  showHoverOverlay,
  priority = "lazy",
}: BaseWorkProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const shouldShowHoverOverlay = useMemo(
    () => showHoverOverlay ?? variant !== "theatre-mobile",
    [showHoverOverlay, variant],
  );

  return (
    <div
      className={`group relative h-full w-full overflow-hidden bg-black/40 ${className}`}
      onClick={onSelect ? () => onSelect(item) : undefined}
    >
      <img
        onLoad={() => setIsLoaded(true)}
        src={item.image}
        alt={item.title}
        loading={priority}
        decoding="async"
        className={`h-full w-full object-cover transition-all duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${
          variant === "feed"
            ? "group-hover:scale-105"
            : variant === "theatre-desktop"
              ? "group-hover:object-contain"
              : ""
        }`}
      />

      {showBadge && (
        <CategoryBadge item={item} variant={getCategoryBadgeVariant(variant)} />
      )}

      {shouldShowHoverOverlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Title Overlay: Constant discovery on feed, hover on theatre-mobile/desktop */}
      {(variant === "feed" || variant === "theatre-desktop" || variant === "theatre-mobile") && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-3 sm:p-4">
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/90 line-clamp-1 mb-0.5 sm:mb-1">
              {item.title}
            </h3>
            <p className="text-[6px] sm:text-[7px] font-bold uppercase tracking-[0.4em] text-white/40">
              {item.artist || item.origins || "Original"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
