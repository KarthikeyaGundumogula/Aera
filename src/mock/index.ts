/**
 * Mock Data Barrel — Assembles backend tables into frontend-ready shapes.
 *
 * Backend tables → Mock files:
 *   Originals   → originals.json
 *   Works       → works.json
 *   Artists     → artists.json
 *   Stars       → stars.json
 *   Makers      → makers.json
 *   Sets        → sets.json
 */
import worksData from "./works.json";
import originalsData from "./originals.json";
import artistsData from "./artists.json";
import starsData from "./stars.json";
import makersData from "./makers.json";
import setsData from "./sets.json";
import { Original, OriginalArtist, OriginalStar, OriginalMaker, TheatreItem } from "../types";
import { buildThumbnail } from "../utils/embed";

// ─── Raw table casts ────────────────────────────────────────────────────────

/** All fan-made works (edits, posters, scripts).
 *  Derives `image` from srcId at assembly time so the JSON stays lean. */
const ALL_WORKS: TheatreItem[] = (worksData as any[]).map((w) => ({
  ...w,
  // Hydrate thumbnail: prefer explicit image, else build from srcId
  image:
    w.image ??
    (w.platform && w.srcId ? buildThumbnail(w.platform, w.srcId) : undefined),
  // Handle rename transition: singular to array
  originalIds: w.originalIds ?? (w.originalId ? [w.originalId] : []),
}));

/** All fan creators. */
interface ArtistRow extends OriginalArtist {
  originalId: string;
}
const ALL_ARTISTS = artistsData as ArtistRow[];

// ─── Assembled exports (simulates backend JOINs) ───────────────────────────

/**
 * GRID_ITEMS — Every work in the system.
 * Used by: Theatre canvases, HomeFeedLayout, OriginalTheatreSection.
 */
export const GRID_ITEMS: TheatreItem[] = ALL_WORKS;

/**
 * ORIGINALS — Full Original objects with topArtists, works, heroHighlights.
 * Assembled by joining works + artists onto each original via originalId.
 */
export const ORIGINALS: Original[] = (originalsData as Array<Omit<Original, "topArtists" | "works" | "heroHighlights">>).map(org => {
  const orgWorks = ALL_WORKS.filter(w => w.originalIds?.includes(org.id));
  // Strictly filter artists who actually worked on this original
  const orgArtists = ALL_ARTISTS.filter(a => 
    a.workedOn?.some(wo => wo.id === org.id)
  ).map(({ ...rest }) => rest as OriginalArtist);
  
  // Highlights: Strictly include only YouTube video edits for the ReleasesCarousel
  const highlights = orgWorks.filter(w => 
    w.category === 'Edit' && 
    w.platform === 'youtube'
  );

  return {
    ...org,
    topArtists: orgArtists,
    works: orgWorks,
    heroHighlights: highlights,
  };
});

/**
 * ORIGINALS_DATA — Originals indexed by ID for O(1) lookup.
 * Used by: OriginalPage, OriginalsTheatrePage.
 */
export const ORIGINALS_DATA: Record<string, Original> = Object.fromEntries(
  ORIGINALS.map((original) => [original.id, original])
);

// FEATURED_ITEMS removed in favor of using ORIGINALS directly in HomeFeedLayout

/**
 * FEATURED_MOMENT — A single highlighted work for the home page.
 */
export const FEATURED_MOMENT: TheatreItem = ALL_WORKS[0];

/**
 * STARS_MOCK — All stars (real actors/characters) as a flat array.
 * Used by: OriginalPage stars section.
 */
export const STARS_MOCK = starsData as OriginalStar[];

/**
 * MAKERS_MOCK — All makers (real crew) as a flat array.
 * Used by: OriginalPage makers section.
 */
export const MAKERS_MOCK = makersData as OriginalMaker[];

/**
 * ARTISTS_MOCK — All fan creators as a flat array.
 */
export const ARTISTS_MOCK = ALL_ARTISTS.map(({ originalId: _, ...rest }) => rest as OriginalArtist);

/**
 * SETS — Curated collections.
 */
export const SETS = setsData as TheatreItem[];
