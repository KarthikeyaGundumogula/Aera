import { useMemo, useState } from "react";

import { CategoryBadge } from "../../theatre/components/CategoryBadge";
import { BaseWorkProps, getCategoryBadgeVariant } from "./types";
import { WorkOverlay } from "./WorkOverlay";
import { WorkModal } from "../modals/WorkModal";

function getScriptBody(title?: string, text?: string) {
  if (title && title.split(":").length > 1) {
    return title.split(":")[1];
  }
  return text || "A moment of cinematic reflection.";
}

export function ScriptWork({
  item,
  variant,
  className = "",
  showBadge = true,
  priority = "lazy",
}: BaseWorkProps) {
  const body = useMemo(() => getScriptBody(item.title, item.text), [item.text, item.title]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const compact = variant === "theatre-mobile";
  const spacious = variant === "feed";

  return (
    <>
    <div
      className={`group relative h-full w-full overflow-hidden bg-[#f4f1ea] text-[#2a2a2a] ${
        variant === "feed" ? "min-h-[300px] transition-transform duration-700 group-hover:scale-[1.02]" : ""
      } ${className}`}
      onClick={() => setIsModalOpen(true)}
      data-loading-priority={priority}
    >
      <div
        className={`flex h-full flex-col justify-center overflow-hidden border border-black/5 font-mono shadow-inner select-text ${
          compact
            ? "p-4 text-[9px] leading-tight"
            : spacious
              ? "p-6 md:p-8 text-[10px] md:text-xs leading-tight"
              : "p-6 text-[10px] leading-tight"
        }`}
      >
        <div
          className={`font-bold uppercase opacity-40 ${
            compact
              ? "mb-1 text-[6px] tracking-widest"
              : "mb-2 text-[7px] tracking-widest"
          }`}
        >
          Scene {item.id}
        </div>
        <div
          className={`font-bold uppercase tracking-tighter ${
            compact ? "mb-2 line-clamp-1" : "mb-2"
          }`}
        >
          INT. THE CANVAS - DAY
        </div>
        <div
          className={`italic opacity-70 ${
            compact
              ? "mb-2 line-clamp-3 leading-relaxed"
              : spacious
                ? "mb-4 text-sm md:text-base leading-relaxed"
                : "mb-4 leading-relaxed"
          }`}
        >
          {body}
        </div>
        <div
          className={`w-full text-center font-bold uppercase tracking-[0.2em] ${
            compact
              ? "mt-2 text-[7px]"
              : spacious
                ? "mb-1 mt-2 text-[8px] md:text-[10px]"
                : "mb-1 mt-2 text-[8px]"
          }`}
        >
          {item.artist || "DIRECTOR"}
        </div>
        {!compact && (
          <div
            className={`w-full px-4 text-center italic opacity-90 ${
              spacious ? "text-sm" : ""
            }`}
          >
            "{item.title?.split(":")[0]}"
          </div>
        )}
        <div
          className={`mt-auto flex justify-between border-t border-black/5 uppercase tracking-widest ${
            compact
              ? "pt-3 text-[6px] opacity-20"
              : spacious
                ? "mt-8 pt-4 text-[7px] md:text-[8px] opacity-30"
                : "mt-6 pt-4 text-[6px] opacity-20"
          }`}
        >
          <span>Draft v2.4</span>
          <span>{item.credits || 0} Credits</span>
        </div>
      </div>

      {showBadge && (
        <CategoryBadge item={item} variant={getCategoryBadgeVariant(variant)} />
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
