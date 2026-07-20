/**
 * Mock data for the Recommendation feature.
 * Shape mirrors the future backend payload from the Rust/Axum TARS API.
 */

interface RecommendationArtist {
  id: string;
  name: string;
  stageName: string;
  profilePicture: string;
  spirit: number;
  /** Number of originals the artist has credited work on */
  works?: number;
  /** Artist's personal all-time highest score ever given */
  highestScore?: number;
}

interface RecommendationOriginal {
  id: string;
  title: string;
  coverImage: string;
  spirit: number;
  genres: string[];
  /** Format classification: "Feature Film" | "Series" | "Short Film" | "Anthology" etc. */
  format: string;
  director?: string;
  dop?: string;
  /** Lead cast/stars */
  stars?: string[];
}

export interface Recommendation {
  id: string;
  original: RecommendationOriginal;
  artist: RecommendationArtist;
  /** Raw integer — no upper bound, no truncation */
  score: number;
  notes: string;
  vouchCount: number;
  /** Contextual label shown above the card: "New for you", "Trending in your Sets", etc. */
  contextLabel: string;
  /** When this recommendation was posted */
  postedAt?: string;
  /** Whether the current user has favorited this original */
  favorited?: boolean;
  /** Whether the recommending artist themselves has liked/favorited this original */
  artistLiked?: boolean;
}

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;

const ARTIST_MAP = {
  "fh-001": {
    id: "fh-001",
    name: "Karthik G",
    stageName: "@karthik_g",
    profilePicture: "/stars/pawan-kalyan.jpeg",
    spirit: 1540,
    works: 12,
    highestScore: 9100,
  },
  "fh-002": {
    id: "fh-002",
    name: "Priya Nair",
    stageName: "@priya_archives",
    profilePicture:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    spirit: 842,
    works: 7,
    highestScore: 8900,
  },
  "fh-003": {
    id: "fh-003",
    name: "Arjun Reddy",
    stageName: "@arjun_reddy",
    profilePicture: "/stars/yash.jpg",
    spirit: 960,
    works: 9,
    highestScore: 9200,
  },
};

const ORIGINAL_MAP = {
  "og-original": {
    id: "og-original",
    title: "OG",
    coverImage: "/posters/og.jpeg",
    spirit: 2480,
    genres: ["Mass", "Comeback", "Raw Power"],
    format: "Feature Film",
    director: "Sujeeth",
    stars: ["Pawan Kalyan", "Priyanka Arul Mohan"],
  },
  "rrr-original": {
    id: "rrr-original",
    title: "RRR",
    coverImage: "/posters/rrr.jpeg",
    spirit: 1500,
    genres: ["Epic", "Period Drama", "Pan-India"],
    format: "Feature Film",
    director: "S.S. Rajamouli",
    stars: ["Ram Charan", "Jr. NTR", "Alia Bhatt"],
  },
  "kgf-original": {
    id: "kgf-original",
    title: "KGF: Chapter 2",
    coverImage: "/posters/kgf.jpeg",
    spirit: 3000,
    genres: ["Mass Action", "South Cinema", "Rebellion"],
    format: "Feature Film",
    director: "Prashanth Neel",
    stars: ["Yash", "Sanjay Dutt", "Raveena Tandon"],
  },
  "baahubali-original": {
    id: "baahubali-original",
    title: "Baahubali",
    coverImage: "/posters/bahubali.jpeg",
    spirit: 4200,
    genres: ["Epic", "Mythology", "Spectacle"],
    format: "Feature Film",
    director: "S.S. Rajamouli",
    stars: ["Prabhas", "Rana Daggubati", "Anushka Shetty"],
  },
  "vikram-original": {
    id: "vikram-original",
    title: "Vikram",
    coverImage: "/posters/vikram.jpeg",
    spirit: 2100,
    genres: ["Action", "Thriller", "Crime"],
    format: "Feature Film",
    director: "Lokesh Kanagaraj",
    stars: ["Kamal Haasan", "Vijay Sethupathi", "Fahadh Faasil"],
  },
};

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  // ─── fh-001 (Karthik G) ─────────
  {
    id: "rec-karthik-og",
    original: ORIGINAL_MAP["og-original"],
    artist: ARTIST_MAP["fh-001"],
    score: 7800,
    notes: "Pawan Kalyan's silence in this scene speaks louder than any dialogue. The restraint is surgical.",
    vouchCount: 192,
    contextLabel: "From your Originals",
    postedAt: new Date(NOW - 4 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-karthik-rrr",
    original: ORIGINAL_MAP["rrr-original"],
    artist: ARTIST_MAP["fh-001"],
    score: 8720,
    notes: "The interval sequence is cinematic perfection. Two forces colliding with breathtaking spectacle.",
    vouchCount: 240,
    contextLabel: "Trending Now",
    postedAt: new Date(NOW - 5 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-karthik-kgf",
    original: ORIGINAL_MAP["kgf-original"],
    artist: ARTIST_MAP["fh-001"],
    score: 6440,
    notes: "This sequence redefines the weight of consequences. Visceral audio cues and immense swagger.",
    vouchCount: 124,
    contextLabel: "From your Sets",
    postedAt: new Date(NOW - 2 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-karthik-baahubali",
    original: ORIGINAL_MAP["baahubali-original"],
    artist: ARTIST_MAP["fh-001"],
    score: 9100,
    notes: "The waterfall sequence is not cinema — it is architecture. Building a mythic world inside a single shot.",
    vouchCount: 347,
    contextLabel: "Top rated this week",
    postedAt: new Date(NOW - 8 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-karthik-vikram",
    original: ORIGINAL_MAP["vikram-original"],
    artist: ARTIST_MAP["fh-001"],
    score: 5120,
    notes: "Anirudh's score coupled with Lokesh's dark universe makes this an incredible kinetic ride.",
    vouchCount: 98,
    contextLabel: "From your Sets",
    postedAt: new Date(NOW - 10 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },

  // ─── fh-002 (Priya Nair) ─────────
  {
    id: "rec-priya-og",
    original: ORIGINAL_MAP["og-original"],
    artist: ARTIST_MAP["fh-002"],
    score: 7800,
    notes: "The color palette and shadow work in the night scenes are absolute perfection.",
    vouchCount: 88,
    contextLabel: "Trending Now",
    postedAt: new Date(NOW - 6 * HOUR).toISOString(),
    favorited: false,
    artistLiked: true,
  },
  {
    id: "rec-priya-rrr",
    original: ORIGINAL_MAP["rrr-original"],
    artist: ARTIST_MAP["fh-002"],
    score: 8900,
    notes: "Naatu Naatu is a cultural declaration. Choreography and scale radiating confidence.",
    vouchCount: 134,
    contextLabel: "Trending in your Sets",
    postedAt: new Date(NOW - 3 * HOUR).toISOString(),
    favorited: false,
    artistLiked: true,
  },
  {
    id: "rec-priya-kgf",
    original: ORIGINAL_MAP["kgf-original"],
    artist: ARTIST_MAP["fh-002"],
    score: 6800,
    notes: "Masterclass in high contrast monochrome editing.",
    vouchCount: 76,
    contextLabel: "From your Sets",
    postedAt: new Date(NOW - 7 * HOUR).toISOString(),
    favorited: false,
    artistLiked: true,
  },
  {
    id: "rec-priya-baahubali",
    original: ORIGINAL_MAP["baahubali-original"],
    artist: ARTIST_MAP["fh-002"],
    score: 8500,
    notes: "The grandeur of Mahishmati is rendered with incredible artistic discipline.",
    vouchCount: 210,
    contextLabel: "Top rated this week",
    postedAt: new Date(NOW - 12 * HOUR).toISOString(),
    favorited: false,
    artistLiked: true,
  },
  {
    id: "rec-priya-vikram",
    original: ORIGINAL_MAP["vikram-original"],
    artist: ARTIST_MAP["fh-002"],
    score: 7900,
    notes: "The climax sequence editing is razor sharp.",
    vouchCount: 115,
    contextLabel: "Trending in your Sets",
    postedAt: new Date(NOW - 4 * HOUR).toISOString(),
    favorited: false,
    artistLiked: true,
  },

  // ─── fh-003 (Arjun Reddy) ─────────
  {
    id: "rec-arjun-og",
    original: ORIGINAL_MAP["og-original"],
    artist: ARTIST_MAP["fh-003"],
    score: 8200,
    notes: "Unmatched swagger. The tone is heavy and relentless.",
    vouchCount: 140,
    contextLabel: "From your Originals",
    postedAt: new Date(NOW - 2 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-arjun-rrr",
    original: ORIGINAL_MAP["rrr-original"],
    artist: ARTIST_MAP["fh-003"],
    score: 9200,
    notes: "Peak hero entry design. Rajamouli sets the global standard.",
    vouchCount: 310,
    contextLabel: "Top rated this week",
    postedAt: new Date(NOW - 1 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-arjun-kgf",
    original: ORIGINAL_MAP["kgf-original"],
    artist: ARTIST_MAP["fh-003"],
    score: 8900,
    notes: "The gunfight and score integration during the mine scene is legendary.",
    vouchCount: 280,
    contextLabel: "Trending in your Sets",
    postedAt: new Date(NOW - 3 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-arjun-baahubali",
    original: ORIGINAL_MAP["baahubali-original"],
    artist: ARTIST_MAP["fh-003"],
    score: 8400,
    notes: "Unforgettable world building and scale.",
    vouchCount: 195,
    contextLabel: "From your Sets",
    postedAt: new Date(NOW - 9 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
  {
    id: "rec-arjun-vikram",
    original: ORIGINAL_MAP["vikram-original"],
    artist: ARTIST_MAP["fh-003"],
    score: 8100,
    notes: "Kamal Haasan and Rolex. Epic cinema moment.",
    vouchCount: 160,
    contextLabel: "Trending Now",
    postedAt: new Date(NOW - 5 * HOUR).toISOString(),
    favorited: true,
    artistLiked: true,
  },
];
