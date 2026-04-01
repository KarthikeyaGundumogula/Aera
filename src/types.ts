export interface ScreenArtist {
  id: string;
  name: string;
  image: string;
  presence: number;
  releases: number;
}

export interface Screen {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  stats: {
    presence: number;
    members: number;
    releases: number;
  };
  topArtists: ScreenArtist[];
  wallOfFame: TheatreItem[];
  releaseDate?: string;
}

export interface TheatreItem {
  id: string | number;
  title?: string;
  category?: 'Edit' | 'Poster' | 'Script' | 'Call' | 'Screen';
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
  screenId?: string; // Reference to a Screen
}

export type SetSelectedItem = (item: TheatreItem | null, items?: TheatreItem[], columns?: number) => void;
