import { useMemo, useState } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { WorkModal } from "../modals/WorkModal";

export function PosterWork({
  item,
  variant,
  className = "",
  showBadge = true,
  showHoverOverlay,
  priority = "lazy",
}: BaseWorkProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const shouldShowHoverOverlay = useMemo(
    () => showHoverOverlay ?? variant !== "theatre-mobile",
    [showHoverOverlay, variant],
  );
  const showPosterMeta = variant !== "feed";

  return (
    <>
    <div
      className={`group relative h-full w-full overflow-hidden ${className}`}
      onClick={() => setIsModalOpen(true)}
    >
      <img
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.includes("maxresdefault.jpg")) {
            target.src = target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
          }
        }}
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

      {/* Title Overlay */}
      <WorkOverlay item={item} variant={variant} />

      {showBadge && (
        <CategoryBadge item={item} variant={getCategoryBadgeVariant(variant)} />
      )}

      {shouldShowHoverOverlay && variant === "feed" && (
        <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </div>

    {isModalOpen && (
      <WorkModal item={item} onClose={() => setIsModalOpen(false)} />
    )}
    </>
  );
}
