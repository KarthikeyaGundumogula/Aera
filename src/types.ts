export interface TheatreItem {
  id: string | number;
  title?: string;
  category?: 'Edit' | 'Poster' | 'Script' | 'Call';
  origins?: string;
  credits?: number;
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
}

export type SetSelectedItem = (item: TheatreItem | null, items?: TheatreItem[], columns?: number) => void;
