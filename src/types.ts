export interface TheatreItem {
  id: string | number;
  title?: string;
  watching?: string;
  image?: string;
  status?: string;
  meta?: string;
  avatar?: string;
  badge?: string;
  type?: string;
  isQuote?: boolean;
  text?: string;
  isPlay?: boolean;
  isEvent?: boolean;
  playlistId?: string;
}

export type SetSelectedItem = (item: TheatreItem | null, items?: TheatreItem[], columns?: number) => void;
