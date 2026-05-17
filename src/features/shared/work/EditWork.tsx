import { useMemo } from "react";
import { useState } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { getYoutubeFallbackThumbnail } from "../../../utils/embed";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";

export function EditWork({
  item,
  variant,
  className = "",
  showBadge = true,
  showHoverOverlay,
  priority = "lazy",
}: BaseWorkProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { openWork } = useWorkNavigation();
  
  const shouldShowHoverOverlay = useMemo(
    () => showHoverOverlay ?? variant !== "theatre-mobile",
    [showHoverOverlay, variant],
  );

  return (
    <>
      <div
        className={`group relative h-full w-full overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] ${className}`}
        onClick={() => openWork(item)}
      >
      <img
        onLoad={(e) => {
          const img = e.currentTarget;
          // YouTube returns a 120x90 placeholder if maxresdefault is missing
          if (img.naturalWidth === 120 && img.src.includes("maxresdefault")) {
            if (item.platform === "youtube" && item.srcId) {
              img.src = getYoutubeFallbackThumbnail(item.srcId);
            }
          } else {
            setIsLoaded(true);
          }
        }}
        onError={(e) => {
          const target = e.currentTarget;
          if (item.platform === "youtube" && item.srcId) {
            target.src = getYoutubeFallbackThumbnail(item.srcId);
          }
        }}
        src={item.image}
        alt={item.title}
        loading={priority}
        decoding="async"
        className={`h-full w-full object-cover object-top transition-all duration-700 ${
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

      {/* Title Overlay */}
      <WorkOverlay item={item} variant={variant} />
    </div>

    </>
  );
}
