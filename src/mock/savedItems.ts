import { WallPost } from "../types/wall";
import { TheatreItem } from "../types/theatre";
import type { Recommendation } from "../types/recommendations";
const MOCK_RECOMMENDATIONS: any[] = [];
import { Original } from "../types/originals";
const GRID_ITEMS: any[] = [];
import { ArtistOverride } from "../components/PostCard";

export interface SavedItemEntry {
  id: string;
  itemType: "work" | "recommendation" | "wall_post" | "original";
  post: WallPost;
  artistOverride?: ArtistOverride;
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedRecommendation?: Recommendation;
  savedAt: string;
}

export const INITIAL_SAVED_ITEMS: SavedItemEntry[] = [
  {
    id: "saved-1",
    itemType: "work",
    post: {
      id: "saved-wp-1",
      artistId: "artist-1",
      artistName: "KARTHIK G",
      artistImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      type: "PIN_WORK",
      text: "This Rocky Bhai entry edit is a masterclass in timing. The cut at 0:28 alone took 6 hours.",
      pinnedWorkId: "w-kgf-1",
      postedAt: "2026-08-22T10:00:00Z",
    },
    artistOverride: {
      id: "artist-1",
      name: "KARTHIK G",
      handle: "//KARTHIK_G",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      followersCount: 24400,
      spirit: 1540,
    },
    resolvedWork: GRID_ITEMS.find((w: any) => w.id === "w-kgf-1") as TheatreItem,
    savedAt: "2026-08-22T12:00:00Z",
  },
  {
    id: "saved-2",
    itemType: "recommendation",
    post: {
      id: "saved-wp-2",
      artistId: "artist-2",
      artistName: "PRIYA NAIR",
      artistImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
      type: "RECOMMENDATION",
      text: "Sujeeth's rhythmic pacing in OG's second act is a visual masterclass.",
      pinnedRecommendationId: "rec-og-1",
      postedAt: "2026-08-21T16:30:00Z",
    },
    artistOverride: {
      id: "artist-2",
      name: "PRIYA NAIR",
      handle: "//PRIYA_CUTS",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
      followersCount: 18200,
      spirit: 980,
    },
    resolvedRecommendation: MOCK_RECOMMENDATIONS[0],
    savedAt: "2026-08-22T14:20:00Z",
  },
  {
    id: "saved-3",
    itemType: "work",
    post: {
      id: "saved-wp-3",
      artistId: "artist-3",
      artistName: "POWERSTAR FC",
      artistImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      type: "PIN_WORK",
      text: "OG Intro Blast — raw power cut with unreleased score stems.",
      pinnedWorkId: "w-og-1",
      postedAt: "2026-08-20T09:15:00Z",
    },
    artistOverride: {
      id: "artist-3",
      name: "POWERSTAR FC",
      handle: "//POWERSTAR_FC",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
      followersCount: 31000,
      spirit: 2100,
    },
    resolvedWork: GRID_ITEMS.find((w: any) => w.id === "w-og-1") as TheatreItem,
    savedAt: "2026-08-21T08:00:00Z",
  },
  {
    id: "saved-4",
    itemType: "recommendation",
    post: {
      id: "saved-wp-4",
      artistId: "artist-5",
      artistName: "ARJUN REDDY",
      artistImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      type: "RECOMMENDATION",
      text: "KGF 2 intercut scene study. The sound design in the hammer sequence is unmatched.",
      pinnedRecommendationId: "rec-kgf-1",
      postedAt: "2026-08-19T14:20:00Z",
    },
    artistOverride: {
      id: "artist-5",
      name: "ARJUN REDDY",
      handle: "//ARJUN_REDDY",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      followersCount: 22800,
      spirit: 1420,
    },
    resolvedRecommendation: MOCK_RECOMMENDATIONS[1] || MOCK_RECOMMENDATIONS[0],
    savedAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "saved-5",
    itemType: "work",
    post: {
      id: "saved-wp-5",
      artistId: "artist-4",
      artistName: "ANDHRA CUTS",
      artistImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      type: "PIN_WORK",
      text: "RRR intro sequence color grading breakdown.",
      pinnedWorkId: "w-rrr-1",
      postedAt: "2026-08-18T18:45:00Z",
    },
    artistOverride: {
      id: "artist-4",
      name: "ANDHRA CUTS",
      handle: "//ANDHRA_CUTS",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      followersCount: 14900,
      spirit: 840,
    },
    resolvedWork: GRID_ITEMS.find((w: any) => w.id === "w-rrr-1") as TheatreItem,
    savedAt: "2026-08-19T11:30:00Z",
  },
  {
    id: "saved-6",
    itemType: "wall_post",
    post: {
      id: "saved-wp-6",
      artistId: "artist-1",
      artistName: "KARTHIK G",
      artistImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      type: "LINE",
      text: "Working on the ultimate Gambheera Return edit. Sound design is 90% done.",
      postedAt: "2026-08-17T12:00:00Z",
    },
    artistOverride: {
      id: "artist-1",
      name: "KARTHIK G",
      handle: "//KARTHIK_G",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      followersCount: 24400,
      spirit: 1540,
    },
    savedAt: "2026-08-18T09:00:00Z",
  },
];
