export interface TheatreItem {
  id: string | number;
  title?: string;
  category?: 'Edit' | 'Poster' | 'Storyboard' | 'Call' | 'Original' | 'Recommendation';
  credits?: number; 
  artist?: string;
  artistId?: string;
  artistAvatar?: string;
  image?: string;
  platform?: 'youtube' | 'twitter';
  /**
   * Platform-specific content identifier.
   * YouTube → video ID (11-char, e.g. "GG1_DsScm6U")
   * Twitter → tweet ID (numeric string, e.g. "2044620780550427076")
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
  artistName: string;
  /** Platform-specific content ID (YouTube video ID, Twitter tweet ID). */
  workSrcId: string;
  /** 'YOUTUBE' | 'TWITTER' | 'NATIVE' */
  platform: 'YOUTUBE' | 'TWITTER' | 'NATIVE';
  /** 'EDIT' | 'POSTER' | 'SCRIPT' */
  category: 'EDIT' | 'POSTER' | 'SCRIPT';
}
