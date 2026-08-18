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

export type WorkKind = "edit" | "poster" | "storyboard" | "recommendation";

export function isEditWork(item: TheatreItem): boolean {
  const cat = (item.category || item.workType || "").toLowerCase();
  return cat === "edit" || cat === "";
}

export function isPosterWork(item: TheatreItem): boolean {
  const cat = (item.category || item.workType || "").toLowerCase();
  return cat === "poster";
}

export function isStoryboardWork(item: TheatreItem): boolean {
  const cat = (item.category || item.workType || "").toLowerCase();
  return cat === "storyboard" || cat === "script";
}

export function isRecommendationWork(item: TheatreItem): boolean {
  const cat = (item.category || item.workType || "").toLowerCase();
  return cat === "recommendation";
}

export function getWorkKind(item: TheatreItem): WorkKind {
  if (isRecommendationWork(item)) return "recommendation";
  if (isStoryboardWork(item)) return "storyboard";
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
