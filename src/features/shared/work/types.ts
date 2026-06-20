import { TheatreItem } from "../../../types";

export type WorkVariant = "theatre-mobile" | "theatre-desktop" | "feed";

export interface BaseWorkProps {
  item: TheatreItem;
  variant: WorkVariant;
  className?: string;
  showBadge?: boolean;
  showHoverOverlay?: boolean;
  priority?: "eager" | "lazy";
}

export type WorkKind = "edit" | "poster" | "script" | "recommendation";

export function isEditWork(item: TheatreItem): boolean {
  return item.category === "Edit" || item.category === undefined;
}

export function isPosterWork(item: TheatreItem): boolean {
  return item.category === "Poster";
}

export function isScriptWork(item: TheatreItem): boolean {
  return item.category === "Script";
}

export function isRecommendationWork(item: TheatreItem): boolean {
  return item.category === "Recommendation";
}

export function getWorkKind(item: TheatreItem): WorkKind {
  if (isRecommendationWork(item)) return "recommendation";
  if (isScriptWork(item)) return "script";
  if (isPosterWork(item)) return "poster";
  return "edit";
}

export function getCategoryBadgeVariant(
  variant: WorkVariant,
): "mobile" | "desktop" | "feed" {
  if (variant === "theatre-mobile") return "mobile";
  if (variant === "feed") return "feed";
  return "desktop";
}
