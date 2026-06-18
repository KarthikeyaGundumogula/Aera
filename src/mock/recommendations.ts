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
  /** Number of originals the artist has credited work on */
  works?: number;
  /** Artist's personal all-time highest score ever given */
  highestScore?: number;
}

interface RecommendationOriginal {
  id: string;
  title: string;
  coverImage: string;
  presence: number;
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
  /** Whether the current user has favorited this original */
  favorited?: boolean;
  /** Whether the recommending artist themselves has liked/favorited this original */
  artistLiked?: boolean;
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
      director: "Prashanth Neel",
      dop: "Bhuvan Gowda",
      stars: ["Yash", "Sanjay Dutt", "Raveena Tandon"],
    },
    artist: {
      id: "fh-001",
      name: "Karthik G",
      stageName: "@karthik_g",
      profilePicture: "/stars/pawan-kalyan.jpeg",
      presence: 1540,
      works: 12,
      highestScore: 4500,
    },
    score: 3000,
    notes:
      "This sequence redefines the weight of consequences. The buildup is meticulously crafted, eliminating any dead air. The visual scaling combined with the visceral audio cues turns this into an absolute masterclass",
    vouchCount: 218,
    contextLabel: "New for you",
    favorited: true,
    artistLiked: true,
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
      director: "S.S. Rajamouli",
      dop: "K.K. Senthil Kumar",
      stars: ["Ram Charan", "Jr. NTR", "Alia Bhatt"],
    },
    artist: {
      id: "fh-002",
      name: "Priya Nair",
      stageName: "@priya_archives",
      profilePicture:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
      presence: 842,
      works: 7,
      highestScore: 3200,
    },
    score: 1847,
    notes:
      "Naatu Naatu is not just a song — it is a cultural declaration. The choreography, the setting, and the sheer scale of confidence radiating from every frame make this the defining moment of pan-Indian cinema.",
    vouchCount: 134,
    contextLabel: "Trending in your Sets",
    favorited: false,
    artistLiked: false,
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
      director: "Sujeeth",
      dop: "Ravi K. Chandran",
      stars: ["Pawan Kalyan", "Priyanka Arul Mohan"],
    },
    artist: {
      id: "fh-003",
      name: "Arjun Dev",
      stageName: "@arjun_dev",
      profilePicture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
      presence: 960,
      works: 9,
      highestScore: 3800,
    },
    score: 2480,
    notes:
      "Pawan Kalyan's silence in this scene speaks louder than any dialogue. The restraint is surgical. Every frame communicates what years of absence feel like — this is not an actor performing, this is a force.",
    vouchCount: 192,
    contextLabel: "From your Originals",
    favorited: true,
    artistLiked: true,
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
      director: "S.S. Rajamouli",
      dop: "K.K. Senthil Kumar",
      stars: ["Prabhas", "Rana Daggubati", "Anushka Shetty"],
    },
    artist: {
      id: "fh-004",
      name: "Meera Rao",
      stageName: "@meera_rao",
      profilePicture:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=800&auto=format&fit=crop",
      presence: 1120,
      works: 15,
      highestScore: 4500,
    },
    score: 4200,
    notes:
      "The waterfall sequence is not cinema — it is architecture. S.S. Rajamouli builds a world inside a single shot that most directors cannot achieve in an entire film. The scale here is not spectacle for its own.",
    vouchCount: 347,
    contextLabel: "Top rated this week",
    favorited: false,
    artistLiked: true,
  },
  {
    id: "rec-006",
    original: {
      id: "jersey-original",
      title: "Jersey",
      coverImage: "/posters/jersey.jpeg",
      presence: 1200,
      genres: ["Sports", "Drama", "Emotional"],
      format: "Feature Film",
      director: "Gowtam Tinnanuri",
      dop: "Sanu Varghese",
      stars: ["Nani", "Shraddha Srinath"],
    },
    artist: {
      id: "fh-006",
      name: "Ravi Teja",
      stageName: "@ravi_t",
      profilePicture:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop",
      presence: 450,
      works: 3,
      highestScore: 2500,
    },
    score: 2100,
    notes:
      "A masterclass in subtle acting. The train station scene alone is worth a thousand words. True cinema.",
    vouchCount: 56,
    contextLabel: "Short Review",
    favorited: false,
    artistLiked: true,
  },
];


