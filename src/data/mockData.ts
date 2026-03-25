import { TheatreItem } from "../types";

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
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "The Lighthouse: Minimalist",
    category: "Poster",
    origins: "The Lighthouse (2019)",
    credits: 567,
    artist: "Eggers_Fan",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Blade Runner 2049: Script Ext.",
    category: "Script",
    origins: "Blade Runner 2049",
    credits: 321,
    artist: "K_2049",
    image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    isQuote: true,
    text: '"Cinema is a matter of what\'s in the frame and what\'s out."',
    artist: "Godard",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    title: "Dune: Part II - The Call",
    category: "Call",
    origins: "Arrakis Awakening",
    credits: 1500,
    artist: "AERA_OFFICIAL",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800",
    type: "Active Call"
  },
  {
    id: 6,
    title: "Parasite: Social Grid",
    category: "Poster",
    origins: "Parasite (2019)",
    credits: 943,
    artist: "Bong_Joon",
    image: "https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 7,
    isPlay: true,
    title: "The Grand Budapest Edit",
    category: "Edit",
    origins: "Wes Anderson World",
    credits: 2100,
    artist: "Pastel_King",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 8,
    title: "Arrival: Heptapod Script",
    category: "Script",
    origins: "Arrival (2016)",
    credits: 456,
    artist: "Linguist",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
  }
];
