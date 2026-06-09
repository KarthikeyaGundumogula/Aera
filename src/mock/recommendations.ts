/**
 * Mock data for the Recommendation feature.
 * Shape mirrors the future backend payload from the Rust/Axum TARS API.
 */

interface RecommendationArtist {
  id: string;
  name: string;
  stageName: string;
  profilePicture: string;
  presence: number;
}

interface RecommendationOriginal {
  id: string;
  title: string;
  coverImage: string;
  presence: number;
  genres: string[];
  /** Format classification: "Feature Film" | "Series" | "Short Film" | "Anthology" etc. */
  format: string;
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
}

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-001",
    original: {
      id: "kgf-original",
      title: "KGF: Chapter 2",
      coverImage: "/posters/kgf.jpeg",
      presence: 3000,
      genres: ["Mass Action", "South Cinema", "Rebellion"],
      format: "Feature Film",
    },
    artist: {
      id: "fh-001",
      name: "Karthik G",
      stageName: "@karthik_g",
      profilePicture: "/stars/pawan-kalyan.jpeg",
      presence: 1540,
    },
    score: 3000,
    notes:
      "This sequence redefines the weight of consequences. The buildup is meticulously crafted, eliminating any dead air. The visual scaling combined with the visceral audio cues turns this into an absolute masterclass in tension and release. It does not just demand attention — it commands the entire theatre.",
    vouchCount: 218,
    contextLabel: "New for you",
  },
  {
    id: "rec-002",
    original: {
      id: "rrr-original",
      title: "RRR",
      coverImage: "/posters/rrr.jpeg",
      presence: 1500,
      genres: ["Epic", "Period Drama", "Pan-India"],
      format: "Feature Film",
    },
    artist: {
      id: "fh-002",
      name: "Priya Nair",
      stageName: "@priya_archives",
      profilePicture:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
      presence: 842,
    },
    score: 1847,
    notes:
      "Naatu Naatu is not just a song — it is a cultural declaration. The choreography, the setting, the sheer scale of confidence radiating from every frame makes this the defining moment of pan-Indian cinema in this decade.",
    vouchCount: 134,
    contextLabel: "Trending in your Sets",
  },
  {
    id: "rec-003",
    original: {
      id: "og-original",
      title: "OG",
      coverImage: "/posters/og.jpeg",
      presence: 2480,
      genres: ["Mass", "Comeback", "Raw Power"],
      format: "Feature Film",
    },
    artist: {
      id: "fh-003",
      name: "Arjun Dev",
      stageName: "@arjun_dev",
      profilePicture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      presence: 960,
    },
    score: 2480,
    notes:
      "Pawan Kalyan's silence in this scene speaks louder than any dialogue. The restraint is surgical. Every frame communicates what years of absence feel like — this is not an actor performing, this is a force returning.",
    vouchCount: 192,
    contextLabel: "From your Originals",
  },
  {
    id: "rec-004",
    original: {
      id: "baahubali-original",
      title: "Baahubali",
      coverImage: "/posters/bahubali.jpeg",
      presence: 4200,
      genres: ["Epic", "Mythology", "Spectacle"],
      format: "Feature Film",
    },
    artist: {
      id: "fh-004",
      name: "Meera Rao",
      stageName: "@meera_rao",
      profilePicture:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
      presence: 1120,
    },
    score: 4200,
    notes:
      "The waterfall sequence is not cinema — it is architecture. S.S. Rajamouli builds a world inside a single shot that most directors cannot achieve in an entire film. The scale here is not spectacle for its own sake. It earns every frame.",
    vouchCount: 347,
    contextLabel: "Top rated this week",
  },
  {
    id: "rec-005",
    original: {
      id: "vikram-original",
      title: "Vikram",
      coverImage: "/posters/rrr.jpeg",
      presence: 1800,
      genres: ["Thriller", "Action", "Multi-starrer"],
      format: "Feature Film",
    },
    artist: {
      id: "fh-005",
      name: "Siddharth K",
      stageName: "@sid_frames",
      profilePicture:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
      presence: 620,
    },
    score: 1620,
    notes:
      "Lokesh Kanagaraj treats continuity as philosophy. Every detail in this universe pays rent. The callback to the earlier films is not fan service — it is architecture. The way this scene recontextualises what came before it is nothing short of surgical storytelling.",
    vouchCount: 89,
    contextLabel: "Hidden gem",
  },
];


