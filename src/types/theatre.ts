export interface TheatreItem {
  id: string | number;
  title?: string;
  category?: 'Edit' | 'Poster' | 'Storyboard' | 'Call' | 'Original' | 'Recommendation' | string;
  workType?: string;
  credits?: number; 
  artist?: string;
  artistId?: string;
  artistAvatar?: string;
  thumbnail?: string | null;
  image?: string;
  platform?: 'youtube' | 'twitter' | string;
  /**
   * Platform-specific content identifier.
   * YouTube → video ID (11-char, e.g. "9A9aHWhqz6c")
   * Twitter → tweet ID (numeric string, e.g. "2081445953379443019")
   * All embed URLs and thumbnails are derived from this via src/utils/embed.ts.
   */
  srcId?: string;
  text?: string;
  images?: string[]; // Script comic pages — up to 10 images, each is a flippable page
  captions?: string[]; // Optional captions/text for each script page
  aspectRatio?: number; 
  originalIds?: string[]; // Reference to Originals (can be multiple)
  recId?: string;        // Links to Recommendation.id — only set when category === 'Recommendation'
}

/**
 * Minimal work record returned by GET /festivals/{id}/works for the panelist spotlight player.
 * Maps directly to tars ReleaseSectionWork response struct (camelCase).
 */
export interface ReleaseSectionWork {
  workId: string;
  workTitle?: string;
  artistName: string;
  /** Platform-specific content ID (YouTube video ID, Twitter tweet ID). */
  workSrcId: string;
  /** 'YOUTUBE' | 'TWITTER' | 'NATIVE' */
  platform: 'YOUTUBE' | 'TWITTER' | 'NATIVE';
  /** 'EDIT' | 'POSTER' | 'SCRIPT' */
  category: 'EDIT' | 'POSTER' | 'SCRIPT';
}

export interface WorkCreditItem {
  originalId: string;
  title: string;
  coverPoster: string;
}

export interface WorkArtistInfo {
  id: string;
  stageName: string;
  userName: string;
  profilePicture: string;
  favoritesCount: number;
  spirit: number;
}

export interface EditWorkDetail {
  id: string;
  title?: string;
  category: "EDIT";
  stars: number;
  createdAt: string;
  srcId: string;
  platform: string;
  artist: WorkArtistInfo;
  originals: WorkCreditItem[];
}

export interface PosterWorkDetail {
  id: string;
  title?: string;
  category: "POSTER";
  stars: number;
  createdAt: string;
  srcId: string;
  artist: WorkArtistInfo;
  originals: WorkCreditItem[];
}

export interface ScriptWorkDetail {
  id: string;
  title?: string;
  category: "SCRIPT";
  stars: number;
  createdAt: string;
  images: string[];
  captions: string[];
  artist: WorkArtistInfo;
  originals: WorkCreditItem[];
}

export type WorkDetail = EditWorkDetail | PosterWorkDetail | ScriptWorkDetail;

