import { useMemo, useState } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { getYoutubeFallbackThumbnail } from "../../../utils/embed";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { PosterImage } from "../../../components/PosterImage";

export function PosterWork({
  item,
  variant,
  className = "",
  showBadge = true,
  showHoverOverlay,
  priority = "lazy",
}: BaseWorkProps) {
  const { openWork } = useWorkNavigation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(() => {
    if (item.image && item.image.trim() !== "") return item.image;
    if (item.platform === "youtube" && item.srcId) {
      return `https://img.youtube.com/vi/${item.srcId}/maxresdefault.jpg`;
    }
    return "";
  });
  
  const shouldShowHoverOverlay = useMemo(
    () => showHoverOverlay ?? variant !== "theatre-mobile",
    [showHoverOverlay, variant],
  );
  const showPosterMeta = variant !== "feed";

  return (
    <>
    <div
      className={`group relative h-full w-full overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] ${className}`}
      onClick={() => openWork(item)}
    >
      {imgSrc ? (
        <img 
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth === 120 && img.src.includes("youtube.com")) {
              if (img.src.includes("maxresdefault") && item.srcId) {
                setImgSrc(getYoutubeFallbackThumbnail(item.srcId));
              } else {
                setImgSrc("");
              }
            } else {
              setIsLoaded(true);
            }
          }}
          onError={() => {
            if (imgSrc.includes("youtube.com") && imgSrc.includes("maxresdefault") && item.srcId) {
              setImgSrc(getYoutubeFallbackThumbnail(item.srcId));
            } else {
              setImgSrc("");
            }
          }}
          src={imgSrc}
          alt={item.title}
          loading={priority}
          decoding="async"
          className={`h-full w-full object-cover object-top transition-all duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${variant === "theatre-desktop" ? "group-hover:scale-110" : ""}`}
        />
      ) : (
        <PosterImage
          alt={item.title || "Poster"}
          info={item.artist || "Poster"}
          className="h-full w-full object-cover animate-fade-in"
        />
      )}

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

    </>
  );
}
