import { TheatreItem } from "./theatre";

export interface OriginalArtist {
  id: string;
  name: string;
  image: string;
  spirit: number;
  works: number;
  bio?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  workedOn?: { id: string; title: string; color?: string }[];
  themeTextColor?: string;
  themeBgColor?: string;
  imagePosition?: string;
}

export interface OriginalStar {
  actorName: string;
  characterName: string;
  imageUrl: string;
  originalId: string;
  workedOn?: { id: string; title: string; color?: string }[];
}

export interface OriginalMaker extends OriginalStar {}

export interface Original {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  stats: {
    presence: number;
    members: number;
    releases: number;
  };
  topArtists: OriginalArtist[];
  works: TheatreItem[];
  heroHighlights?: TheatreItem[];
  releaseDate?: string;
  genre?: string[];
}
