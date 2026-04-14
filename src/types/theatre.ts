export interface TheatreItem {
  id: string | number;
  title?: string;
  description?: string;
  category?: 'Edit' | 'Poster' | 'Script' | 'Call' | 'Original';
  origins?: string;
  credits?: number;
  presence?: number;
  artist?: string;
  artistAvatar?: string;
  set?: string;
  captain?: string;
  image?: string;
  /** URL for a self-hosted video asset. Falls back to a placeholder when absent. */
  videoUrl?: string;
  text?: string;
  isQuote?: boolean;
  isPlay?: boolean;
  isEvent?: boolean;
  twitterId?: string;
  meta?: string;
  type?: string;
  aspectRatio?: number;
  originalId?: string; // Reference to an Original
}

export type SetSelectedItem = (item: TheatreItem | null, items?: TheatreItem[], columns?: number) => void;
