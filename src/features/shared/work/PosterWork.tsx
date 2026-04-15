import { useMemo, useState } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";

export function PosterWork({
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
  const showPosterMeta = variant !== "feed";

  return (
    <div
      className={`group relative h-full w-full overflow-hidden ${className}`}
      onClick={onSelect ? () => onSelect(item) : undefined}
    >
      <img
        onLoad={() => setIsLoaded(true)}
        src={item.image}
        alt={item.title}
        loading={priority}
        decoding="async"
        className={`h-full w-full object-cover transition-all duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${variant === "theatre-desktop" ? "group-hover:scale-110" : ""}`}
      />

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent ${
          variant === "theatre-mobile" ? "opacity-80" : "opacity-60"
        }`}
      />

      {showPosterMeta && (
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col p-4 ${
            variant === "theatre-mobile"
              ? "items-center justify-end"
              : "items-center justify-center border-[12px] border-transparent transition-all duration-500 group-hover:border-white/10"
          }`}
        >
          <div className="text-center">
            <h2
              className={`font-serif italic tracking-tighter text-white/90 ${
                variant === "theatre-mobile"
                  ? "mb-1 line-clamp-1 text-sm leading-none"
                  : "mb-1 text-lg leading-none"
              }`}
            >
              {item.title}
            </h2>
            <div
              className={`mx-auto bg-white/30 ${
                variant === "theatre-mobile" ? "my-1 h-[1px] w-6" : "my-2 h-[1px] w-8"
              }`}
            />
            <p
              className={`uppercase text-white/50 ${
                variant === "theatre-mobile"
                  ? "text-[5px] tracking-[0.4em]"
                  : "text-[6px] tracking-[0.4em]"
              }`}
            >
              {item.origins}
            </p>
          </div>
        </div>
      )}

      {showBadge && (
        <CategoryBadge item={item} variant={getCategoryBadgeVariant(variant)} />
      )}

      {shouldShowHoverOverlay && variant === "feed" && (
        <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </div>
  );
}
