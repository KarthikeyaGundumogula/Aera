import { TheatreItem } from "./theatre";

export interface OriginalArtist {
  id: string;
  name: string;
  image: string;
  presence: number;
  releases: number;
}

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
  wallOfFame: TheatreItem[];
  releaseDate?: string;
}
