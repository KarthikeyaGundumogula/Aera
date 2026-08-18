import { useMemo, useState, useEffect } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { getYoutubeFallbackThumbnail } from "../../../utils/embed";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { PosterImage } from "../../../components/PosterImage";

export function EditWork({
  item,
  variant,
  className = "",
  showBadge = true,
  showHoverOverlay,
  priority = "lazy",
}: BaseWorkProps) {
  const { openWork } = useWorkNavigation();
  const [isLoaded, setIsLoaded] = useState(false);

  const initialSrc = useMemo(() => {
    if (item.thumbnail && item.thumbnail.trim() !== "") return item.thumbnail;
    if (item.image && item.image.trim() !== "") return item.image;
    if (item.platform === "youtube" && item.srcId) {
      return `https://img.youtube.com/vi/${item.srcId}/maxresdefault.jpg`;
    }
    return "";
  }, [item.thumbnail, item.image, item.platform, item.srcId]);

  const [imgSrc, setImgSrc] = useState(initialSrc);

  useEffect(() => {
    setImgSrc(initialSrc);
    setIsLoaded(false);
  }, [initialSrc]);
  
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
        {imgSrc ? (
          <img
            ref={(img) => {
              if (img && img.complete && img.naturalWidth > 0 && !isLoaded) {
                setIsLoaded(true);
              }
            }}
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
        ) : (
          <PosterImage
            alt={item.title || "Edit"}
            info={item.artist || "Edit"}
            className="h-full w-full object-cover"
          />
        )}

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
