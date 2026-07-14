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
  return item.category === "Edit" || item.category === undefined;
}

export function isPosterWork(item: TheatreItem): boolean {
  return item.category === "Poster";
}

export function isStoryboardWork(item: TheatreItem): boolean {
  return item.category === "Storyboard";
}

export function isRecommendationWork(item: TheatreItem): boolean {
  return item.category === "Recommendation";
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
