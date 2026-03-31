import { TheatreItem, Screen } from "../types";

export const FEATURED_MOMENT: TheatreItem = {
  id: "hero-1",
  title: "The Alchemist: Stage 01",
  category: "Edit",
  origins: "Inspired by Paulo Coelho's Vision",
  credits: 1240,
  artist: "AERA_ELITE",
  artistAvatar: "https://i.pravatar.cc/150?u=aera_elite",
  image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920",
  type: "Premiere",
  twitterId: "2033091078199603682"
};

export const FEATURED_ITEMS: TheatreItem[] = [
  {
    id: "screen-1",
    title: "The Alchemist",
    category: "Screen",
    origins: "Official Wall of Fame",
    credits: 1240,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920",
    type: "Screen",
    screenId: "alchemist-screen"
  },
  {
    id: "screen-2",
    title: "Dune: Part Two",
    category: "Screen",
    origins: "Official Wall of Fame",
    credits: 1500,
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=1920",
    type: "Screen",
    screenId: "dune-screen"
  },
  {
    id: "screen-3",
    title: "Mad Max: Fury Road",
    category: "Screen",
    origins: "Official Wall of Fame",
    credits: 3000,
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1920",
    type: "Screen",
    screenId: "madmax-screen"
  },
  {
    id: "screen-4",
    title: "Interstellar",
    category: "Screen",
    origins: "Official Wall of Fame",
    credits: 842,
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920",
    type: "Screen",
    screenId: "interstellar-screen"
  },
  {
    id: "screen-5",
    title: "The Matrix",
    category: "Screen",
    origins: "Official Wall of Fame",
    credits: 2100,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1920",
    type: "Screen",
    screenId: "matrix-screen"
  }
];

export const SCREENS_DATA: Record<string, Screen> = {
  "alchemist-screen": {
    id: "alchemist-screen",
    title: "The Alchemist",
    description: "A cinematic journey through the soul of alchemy. Curated by AERA_ELITE.",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920",
    stats: { credits: 1240, members: 850, releases: 12 },
    releaseDate: "March 15, 2024",
    wallOfFame: [
      { id: "wf-1", title: "Lead Poster", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800", category: "Poster" },
      { id: "wf-2", title: "Opening Sequence", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800", category: "Edit" },
      { id: "wf-3", title: "The Desert Script", image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=800", category: "Script" }
    ]
  },
  "dune-screen": {
    id: "dune-screen",
    title: "Dune: Part Two",
    description: "The spice must flow. The official wall of fame for the Arrakis vision.",
    coverImage: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=1920",
    stats: { credits: 1500, members: 2100, releases: 8 },
    releaseDate: "February 28, 2024",
    wallOfFame: [
      { id: "wf-4", title: "Arrakis Sunset", image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=800", category: "Poster" },
      { id: "wf-5", title: "Worm Rider Edit", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=800", category: "Edit" }
    ]
  },
  "madmax-screen": {
    id: "madmax-screen",
    title: "Mad Max: Fury Road",
    description: "Witness the glory of the wasteland. Curated by the War Boys.",
    coverImage: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1920",
    stats: { credits: 3000, members: 4500, releases: 15 },
    releaseDate: "May 15, 2015",
    wallOfFame: [
      { id: "wf-6", title: "Chrome Vision", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=800", category: "Poster" }
    ]
  },
  "interstellar-screen": {
    id: "interstellar-screen",
    title: "Interstellar",
    description: "Love is the one thing that transcends time and space.",
    coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920",
    stats: { credits: 842, members: 1200, releases: 5 },
    releaseDate: "November 7, 2014",
    wallOfFame: [
      { id: "wf-7", title: "Tesseract Edit", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800", category: "Edit" }
    ]
  }
};

export const SETS: TheatreItem[] = [
  { id: "set-1", title: "Neo-Noir", captain: "V_Kovacs", type: "Set", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800" },
  { id: "set-2", title: "French Wave", captain: "Godard_Fan", type: "Set", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800" },
  { id: "set-3", title: "Sci-Fi Scripts", captain: "Asimov_X", type: "Set", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800" }
];

export const GRID_ITEMS: TheatreItem[] = [
  {
    id: 1,
    title: "Interstellar: Time & Love",
    category: "Edit",
    origins: "Interstellar (2014)",
    credits: 842,
    artist: "Nolanite",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 2.39
  },
  {
    id: 2,
    title: "The Lighthouse: Minimalist",
    category: "Poster",
    origins: "The Lighthouse (2019)",
    credits: 567,
    artist: "Eggers_Fan",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 0.66
  },
  {
    id: 3,
    title: "Blade Runner 2049: Script Ext.",
    category: "Script",
    origins: "Blade Runner 2049",
    credits: 321,
    artist: "K_2049",
    image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.0
  },
  {
    id: 6,
    title: "Parasite: Social Grid",
    category: "Poster",
    origins: "Parasite (2019)",
    credits: 943,
    artist: "Bong_Joon",
    image: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 0.8
  },
  {
    id: 7,
    isPlay: true,
    title: "The Grand Budapest Edit",
    category: "Edit",
    origins: "Wes Anderson World",
    credits: 2100,
    artist: "Pastel_King",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 1.77
  },
  {
    id: 8,
    title: "Arrival: Heptapod Script",
    category: "Script",
    origins: "Arrival (2016)",
    credits: 456,
    artist: "Linguist",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.0
  },
  {
    id: 9,
    title: "Neon City: Vertical Edit",
    category: "Edit",
    origins: "Cyberpunk Visions",
    credits: 1200,
    artist: "Cyber_X",
    image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 0.56
  },
  {
    id: 10,
    title: "Square Poster: Minimal",
    category: "Poster",
    origins: "Modernism",
    credits: 300,
    artist: "Minimalist",
    image: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.0
  },
  {
    id: 11,
    title: "Dune: Arrakis Vision",
    category: "Edit",
    origins: "Dune (2021)",
    credits: 1500,
    artist: "Spice_Lord",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 2.39
  },
  {
    id: 12,
    title: "The Revenant: Cold Breath",
    category: "Edit",
    origins: "The Revenant",
    credits: 800,
    artist: "Lubezki_Fan",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 2.40
  },
  {
    id: 13,
    title: "Portrait of a Lady on Fire",
    category: "Poster",
    origins: "French Cinema",
    credits: 600,
    artist: "Sciamma_X",
    image: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0ad9?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 0.7
  },
  {
    id: 14,
    title: "Inception: The Kick",
    category: "Script",
    origins: "Inception (2010)",
    credits: 900,
    artist: "Cobb",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.0
  },
  {
    id: 15,
    title: "Mad Max: Fury Road",
    category: "Edit",
    origins: "George Miller",
    credits: 3000,
    artist: "War_Boy",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=800",
    type: "video",
    aspectRatio: 2.35
  },
  {
    id: 16,
    title: "Vertical Cityscape",
    category: "Poster",
    origins: "Metropolis",
    credits: 400,
    artist: "Urban_Eye",
    image: "https://images.unsplash.com/photo-1449156001935-d287057576ba?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 0.6
  },
  {
    id: 17,
    title: "Wide Horizon: Desert",
    category: "Edit",
    origins: "Nature Doc",
    credits: 200,
    artist: "Explorer",
    image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.85
  },
  {
    id: 18,
    title: "The Matrix: Code Script",
    category: "Script",
    origins: "The Matrix",
    credits: 777,
    artist: "Neo",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    aspectRatio: 1.0
  }
];
