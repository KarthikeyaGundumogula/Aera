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

export interface TheatreItem {
  id: string | number;
  title?: string;
  category?: 'Edit' | 'Poster' | 'Script' | 'Call' | 'Original';
  origins?: string;
  credits?: number;
  presence?: number;
  artist?: string;
  artistAvatar?: string;
  set?: string;
  captain?: string;
  image?: string;
  text?: string;
  isQuote?: boolean;
  isPlay?: boolean;
  isEvent?: boolean;
  twitterId?: string;
  meta?: string;
  type?: string;
  aspectRatio?: number;
  originalId?: string; // Reference to a Original
}

export type SetSelectedItem = (item: TheatreItem | null, items?: TheatreItem[], columns?: number) => void;
