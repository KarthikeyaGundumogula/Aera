import featuredMomentData from "./featured-moment.json";
import featuredItemsData from "./featured-items.json";
import gridItemsData from "./grid-items.json";
import screensData from "./screens.json";
import setsData from "./sets.json";
import { Screen, TheatreItem } from "../types";

export const FEATURED_MOMENT = featuredMomentData as TheatreItem;
export const FEATURED_ITEMS = featuredItemsData as TheatreItem[];
export const GRID_ITEMS = gridItemsData as TheatreItem[];
export const SETS = setsData as TheatreItem[];
export const SCREENS = screensData as Screen[];
export const SCREENS_DATA: Record<string, Screen> = Object.fromEntries(
  SCREENS.map((screen) => [screen.id, screen])
);
