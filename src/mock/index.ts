import featuredMomentData from "./featured-moment.json";
import featuredItemsData from "./featured-items.json";
import gridItemsData from "./grid-items.json";
import originalsData from "./originals.json";
import originalHighlightsData from "./original-highlights.json";
import setsData from "./sets.json";
import originalStarsData from "./original-stars.json";
import { Original, TheatreItem } from "../types";

export const FEATURED_MOMENT = featuredMomentData as TheatreItem;
export const FEATURED_ITEMS = featuredItemsData as TheatreItem[];
export const GRID_ITEMS = gridItemsData as TheatreItem[];
export const SETS = setsData as TheatreItem[];

const HIGHLIGHTS = originalHighlightsData as Record<string, TheatreItem[]>;

export const ORIGINALS = (originalsData as Original[]).map(org => ({
  ...org,
  heroHighlights: HIGHLIGHTS[org.id] || []
}));

export const ORIGINALS_DATA: Record<string, Original> = Object.fromEntries(
  ORIGINALS.map((original) => [original.id, original])
);
export const STARS_MOCK = originalStarsData.stars;
export const MAKERS_MOCK = originalStarsData.makers;
