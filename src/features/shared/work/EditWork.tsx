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

      {variant === "feed" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      )}
    </div>
  );
}
