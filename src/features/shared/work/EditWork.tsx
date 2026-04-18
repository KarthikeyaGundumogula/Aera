import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { WorkModal } from "../modals/WorkModal";

export function EditWork({
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

  return (
    <>
      <div
        className={`group relative h-full w-full overflow-hidden bg-black/40 ${className}`}
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

      {/* Title Overlay */}
      <WorkOverlay item={item} variant={variant} />
    </div>

    {isModalOpen && (
      <WorkModal item={item} onClose={() => setIsModalOpen(false)} />
    )}
    </>
  );
}
