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

// ─── Raw table casts ────────────────────────────────────────────────────────

/** All fan-made works (edits, posters, scripts). */
const ALL_WORKS = worksData as TheatreItem[];

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
  const orgWorks = ALL_WORKS.filter(w => w.originalId === org.id);
  // Use the entire artist pool to ensure design density (as per fe-context)
  const orgArtists = ALL_ARTISTS.map(({ ...rest }) => rest as OriginalArtist);
  
  // Highlights: Strictly include only YouTube video edits for the ReleasesCarousel
  const highlights = orgWorks.filter(w => 
    (w.category === 'Edit' || w.type === 'video') && 
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

/**
 * FEATURED_ITEMS — Originals shaped as TheatreItems for the home hero carousel.
 * Used by: HomeFeedLayout hero section.
 */
export const FEATURED_ITEMS: TheatreItem[] = ORIGINALS.map(org => ({
  id: `featured-${org.id}`,
  title: org.title,
  category: "Original" as const,
  origins: "Official Wall of Fame",
  presence: org.stats.presence,
  image: org.coverImage,
  type: "Original",
  originalId: org.id,
}));

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
