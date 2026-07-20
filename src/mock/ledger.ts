export type LedgerTaggedWork = {
  id: string;
  type: "poster" | "hype_cut";
  thumbnailUrl: string;
  authorName: string;
  platform?: string;
  srcId?: string;
};

export type LedgerMakerCredit = {
  name: string;
  role: string;
  imageUrl?: string;
};

export type LedgerItem = {
  id: string;
  artistId?: string;
  originalId: string;
  originalName: string;
  originalPosterUrl: string;
  /** Release year e.g. "2022" */
  releaseYear?: string;
  genre?: string[];
  /** Lead star name e.g. "Ram Charan" */
  starName?: string;
  starImageUrl?: string;
  /** Director / Music / Producer credits shown in the sidebar */
  makers?: LedgerMakerCredit[];
  status: "want_to_watch" | "watched";
  /** Pre-watching thoughts — can be null if the user skipped them */
  preThoughts?: string | null;
  /** Post-experience reflection — always present for "watched" entries */
  afterThoughts?: string;
  /** The Surge score logged at the time of watching */
  surgeScore?: number;
  taggedWorks: LedgerTaggedWork[];
  addedAt: string;
  watchedAt?: string;
};

export const mockLedger: LedgerItem[] = [
  // ─── fh-001 (Karthik G) ───────────────────────────────────────────────────
  {
    id: "wl_karthik_og",
    artistId: "fh-001",
    originalId: "og-original",
    originalName: "OG",
    originalPosterUrl: "/posters/og.jpeg",
    releaseYear: "2024",
    genre: ["Action", "Gangster", "Drama"],
    starName: "Pawan Kalyan",
    starImageUrl: "/stars/pawan-kalyan.jpeg",
    makers: [
      { name: "Sujeeth", role: "Director" },
      { name: "Thaman S.", role: "Music" },
      { name: "DVV Danayya", role: "Producer" },
    ],
    status: "want_to_watch",
    preThoughts:
      "Pawan Kalyan's most raw, unstoppable avatar. The hype cuts for this are insane — I need to see this day one.",
    taggedWorks: [],
    addedAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "wl_karthik_rrr",
    artistId: "fh-001",
    originalId: "rrr-original",
    originalName: "RRR",
    originalPosterUrl: "/posters/rrr.jpeg",
    releaseYear: "2022",
    genre: ["Epic", "Action", "Period Drama"],
    starName: "Ram Charan",
    starImageUrl: "/stars/ram-charan.jpg",
    makers: [
      { name: "S. S. Rajamouli", role: "Director" },
      { name: "M. M. Keeravani", role: "Music" },
      { name: "Shobu Yarlagadda", role: "Producer" },
    ],
    status: "watched",
    preThoughts:
      "The legendary team up of Ram and Bheem. The edits have me hyped for the interval sequence beyond reason.",
    afterThoughts:
      "Absolutely overwhelming. The animal sequence and Naatu Naatu exceeded all expectations. Peak cinema.",
    surgeScore: 8720,
    taggedWorks: [],
    addedAt: "2026-04-20T14:30:00Z",
    watchedAt: "2026-04-21T21:00:00Z",
  },
  {
    id: "wl_karthik_kgf",
    artistId: "fh-001",
    originalId: "kgf-original",
    originalName: "KGF: Chapter 2",
    originalPosterUrl: "/posters/kgf.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Crime", "Mass"],
    starName: "Yash",
    starImageUrl: "/stars/yash.jpg",
    makers: [
      { name: "Prashanth Neel", role: "Director" },
      { name: "Ravi Basrur", role: "Music" },
    ],
    status: "watched",
    preThoughts: null,
    afterThoughts:
      "Rocky Bhai doesn't bow — and neither does this movie. The sheer scale every 10 minutes is unmatched.",
    surgeScore: 6440,
    taggedWorks: [],
    addedAt: "2026-04-22T09:15:00Z",
    watchedAt: "2026-04-23T20:00:00Z",
  },
  {
    id: "wl_karthik_baahubali",
    artistId: "fh-001",
    originalId: "baahubali-original",
    originalName: "Baahubali",
    originalPosterUrl: "/posters/bahubali.jpeg",
    releaseYear: "2015",
    genre: ["Epic", "Mythology", "Action"],
    starName: "Prabhas",
    starImageUrl: "/stars/prabhas.jpeg",
    makers: [
      { name: "S. S. Rajamouli", role: "Director" },
      { name: "M. M. Keeravani", role: "Music" },
    ],
    status: "watched",
    preThoughts: "The benchmark for Indian grand spectacle.",
    afterThoughts:
      "A landmark achievement in world cinema. The waterfall sequence remains unforgettable.",
    surgeScore: 9100,
    taggedWorks: [],
    addedAt: "2026-04-10T12:00:00Z",
    watchedAt: "2026-04-11T18:00:00Z",
  },
  {
    id: "wl_karthik_vikram",
    artistId: "fh-001",
    originalId: "vikram-original",
    originalName: "Vikram",
    originalPosterUrl: "/posters/vikram.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Thriller", "Crime"],
    starName: "Kamal Haasan",
    starImageUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=800&auto=format&fit=crop",
    makers: [
      { name: "Lokesh Kanagaraj", role: "Director" },
      { name: "Anirudh Ravichander", role: "Music" },
    ],
    status: "watched",
    preThoughts: null,
    afterThoughts:
      "Lokesh Kanagaraj constructs universes. The Rolex sequence alone is worth the price of admission.",
    surgeScore: 5120,
    taggedWorks: [],
    addedAt: "2026-04-18T11:00:00Z",
    watchedAt: "2026-04-19T20:30:00Z",
  },

  // ─── fh-002 (Priya Nair) ─────────────────────────────────────────────────
  {
    id: "wl_priya_og",
    artistId: "fh-002",
    originalId: "og-original",
    originalName: "OG",
    originalPosterUrl: "/posters/og.jpeg",
    releaseYear: "2024",
    genre: ["Action", "Gangster", "Drama"],
    starName: "Pawan Kalyan",
    starImageUrl: "/stars/pawan-kalyan.jpeg",
    makers: [{ name: "Sujeeth", role: "Director" }],
    status: "watched",
    preThoughts: "Waiting for the colour grading and lighting style to drop.",
    afterThoughts: "Visual perfection. The high-contrast tones in the night sequences are sublime.",
    surgeScore: 7800,
    taggedWorks: [],
    addedAt: "2026-04-20T10:00:00Z",
    watchedAt: "2026-04-21T14:00:00Z",
  },
  {
    id: "wl_priya_rrr",
    artistId: "fh-002",
    originalId: "rrr-original",
    originalName: "RRR",
    originalPosterUrl: "/posters/rrr.jpeg",
    releaseYear: "2022",
    genre: ["Epic", "Action", "Period Drama"],
    starName: "Ram Charan",
    starImageUrl: "/stars/ram-charan.jpg",
    makers: [{ name: "S. S. Rajamouli", role: "Director" }],
    status: "watched",
    preThoughts: "Choreography and pacing masterclass.",
    afterThoughts: "Pure energy. The sync between music and motion is flawless.",
    surgeScore: 8900,
    taggedWorks: [],
    addedAt: "2026-04-15T09:00:00Z",
    watchedAt: "2026-04-16T19:00:00Z",
  },
  {
    id: "wl_priya_kgf",
    artistId: "fh-002",
    originalId: "kgf-original",
    originalName: "KGF: Chapter 2",
    originalPosterUrl: "/posters/kgf.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Crime", "Mass"],
    starName: "Yash",
    starImageUrl: "/stars/yash.jpg",
    makers: [{ name: "Prashanth Neel", role: "Director" }],
    status: "watched",
    preThoughts: null,
    afterThoughts: "The high-contrast monochrome tones create such an intense atmosphere.",
    surgeScore: 6800,
    taggedWorks: [],
    addedAt: "2026-04-18T16:00:00Z",
    watchedAt: "2026-04-19T22:00:00Z",
  },
  {
    id: "wl_priya_baahubali",
    artistId: "fh-002",
    originalId: "baahubali-original",
    originalName: "Baahubali",
    originalPosterUrl: "/posters/bahubali.jpeg",
    releaseYear: "2015",
    genre: ["Epic", "Mythology", "Action"],
    starName: "Prabhas",
    starImageUrl: "/stars/prabhas.jpeg",
    makers: [{ name: "S. S. Rajamouli", role: "Director" }],
    status: "watched",
    preThoughts: "A study in production design and mythic framing.",
    afterThoughts: "Emotion and scale in complete harmony.",
    surgeScore: 8500,
    taggedWorks: [],
    addedAt: "2026-04-12T11:00:00Z",
    watchedAt: "2026-04-13T17:00:00Z",
  },
  {
    id: "wl_priya_vikram",
    artistId: "fh-002",
    originalId: "vikram-original",
    originalName: "Vikram",
    originalPosterUrl: "/posters/vikram.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Thriller", "Crime"],
    starName: "Kamal Haasan",
    starImageUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=800&auto=format&fit=crop",
    makers: [{ name: "Lokesh Kanagaraj", role: "Director" }],
    status: "watched",
    preThoughts: "Anirudh's score with Lokesh's dark aesthetic is a match made in heaven.",
    afterThoughts: "Adrenaline pumping from start to finish. Masterful sound edit.",
    surgeScore: 7900,
    taggedWorks: [],
    addedAt: "2026-04-14T15:00:00Z",
    watchedAt: "2026-04-15T21:00:00Z",
  },

  // ─── fh-003 (Arjun Reddy) ────────────────────────────────────────────────
  {
    id: "wl_arjun_og",
    artistId: "fh-003",
    originalId: "og-original",
    originalName: "OG",
    originalPosterUrl: "/posters/og.jpeg",
    releaseYear: "2024",
    genre: ["Action", "Gangster", "Drama"],
    starName: "Pawan Kalyan",
    starImageUrl: "/stars/pawan-kalyan.jpeg",
    makers: [{ name: "Sujeeth", role: "Director" }],
    status: "want_to_watch",
    preThoughts: "The sheer violence and style in the fan cuts has me hooked.",
    taggedWorks: [],
    addedAt: "2026-04-22T08:00:00Z",
  },
  {
    id: "wl_arjun_rrr",
    artistId: "fh-003",
    originalId: "rrr-original",
    originalName: "RRR",
    originalPosterUrl: "/posters/rrr.jpeg",
    releaseYear: "2022",
    genre: ["Epic", "Action", "Period Drama"],
    starName: "Ram Charan",
    starImageUrl: "/stars/ram-charan.jpg",
    makers: [{ name: "S. S. Rajamouli", role: "Director" }],
    status: "watched",
    preThoughts: "Expecting unmatched brotherly chemistry and action setpieces.",
    afterThoughts: "Beyond words. Rajamouli's vision is boundless.",
    surgeScore: 9200,
    taggedWorks: [],
    addedAt: "2026-04-11T10:00:00Z",
    watchedAt: "2026-04-12T16:00:00Z",
  },
  {
    id: "wl_arjun_kgf",
    artistId: "fh-003",
    originalId: "kgf-original",
    originalName: "KGF: Chapter 2",
    originalPosterUrl: "/posters/kgf.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Crime", "Mass"],
    starName: "Yash",
    starImageUrl: "/stars/yash.jpg",
    makers: [{ name: "Prashanth Neel", role: "Director" }],
    status: "watched",
    preThoughts: "Rocky Bhai's elevation scenes are the peak of mass cinema.",
    afterThoughts: "The BGM during the climax is insane. Pure cinema swagger.",
    surgeScore: 8900,
    taggedWorks: [],
    addedAt: "2026-04-17T13:00:00Z",
    watchedAt: "2026-04-18T20:00:00Z",
  },
  {
    id: "wl_arjun_baahubali",
    artistId: "fh-003",
    originalId: "baahubali-original",
    originalName: "Baahubali",
    originalPosterUrl: "/posters/bahubali.jpeg",
    releaseYear: "2015",
    genre: ["Epic", "Mythology", "Action"],
    starName: "Prabhas",
    starImageUrl: "/stars/prabhas.jpeg",
    makers: [{ name: "S. S. Rajamouli", role: "Director" }],
    status: "watched",
    preThoughts: null,
    afterThoughts: "The iconic cliffhanger and mythological scale changed Indian cinema forever.",
    surgeScore: 8400,
    taggedWorks: [],
    addedAt: "2026-04-09T09:00:00Z",
    watchedAt: "2026-04-10T15:00:00Z",
  },
  {
    id: "wl_arjun_vikram",
    artistId: "fh-003",
    originalId: "vikram-original",
    originalName: "Vikram",
    originalPosterUrl: "/posters/vikram.jpeg",
    releaseYear: "2022",
    genre: ["Action", "Thriller", "Crime"],
    starName: "Kamal Haasan",
    starImageUrl: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=800&auto=format&fit=crop",
    makers: [{ name: "Lokesh Kanagaraj", role: "Director" }],
    status: "watched",
    preThoughts: "Rolex entrance and the dark tone is what I'm here for.",
    afterThoughts: "Phenomenal casting and relentless action.",
    surgeScore: 8100,
    taggedWorks: [],
    addedAt: "2026-04-16T14:00:00Z",
    watchedAt: "2026-04-17T20:00:00Z",
  },
];
