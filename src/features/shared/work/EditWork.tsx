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
  const [isLoaded, setIsLoaded] = useState(true);
  const { openWork } = useWorkNavigation();
  
  const shouldShowHoverOverlay = useMemo(
    () => showHoverOverlay ?? variant !== "theatre-mobile",
    [showHoverOverlay, variant],
  );

  const fallbackImage = "https://images.unsplash.com/photo-1536440136628-849c177e76a1";
  const imageSrc = item.image && item.image.trim() !== "" ? item.image : fallbackImage;

  return (
    <>
      <div
        className={`group relative h-full w-full overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] ${className}`}
        onClick={() => openWork(item)}
      >
      <img
        onLoad={(e) => {
          const img = e.currentTarget;
          const isRealYoutubeId = !!item.srcId && !item.srcId.includes("-") && item.srcId.length === 11;
          if (img.naturalWidth === 120 && img.src.includes("maxresdefault") && item.platform === "youtube" && isRealYoutubeId) {
            img.src = getYoutubeFallbackThumbnail(item.srcId!);
          } else {
            setIsLoaded(true);
          }
        }}
        onError={(e) => {
          const target = e.currentTarget;
          const isRealYoutubeId = !!item.srcId && !item.srcId.includes("-") && item.srcId.length === 11;
          if (item.platform === "youtube" && isRealYoutubeId && !target.src.includes("hqdefault")) {
            target.src = getYoutubeFallbackThumbnail(item.srcId!);
          } else if (target.src !== fallbackImage) {
            target.src = fallbackImage;
          }
          setIsLoaded(true);
        }}
        src={imageSrc}
        alt={item.title}
        loading={priority}
        decoding="async"
        className={`h-full w-full object-cover object-top transition-all duration-700 ${
          isLoaded ? "opacity-100" : "opacity-90"
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
