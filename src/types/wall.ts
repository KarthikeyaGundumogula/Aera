/**
 * Wall — Type definitions for the Artist Wall feature.
 *
 * The Wall is a curated, personal moodboard on an Artist's profile.
 * Posts are distributed exclusively to users who have Favorited the Artist (Foyer).
 *
 * Three post variants:
 *   LINE   — a text-only post (conversational, no framed content)
 *   FRAME  — a framed Work / Original / Recommendation with no artist text
 *   QUOTE  — a framed Work / Original / Recommendation + artist text together
 */

/**
 * LINE  — text only
 * FRAME — a framed work / original / recommendation, no artist text
 * QUOTE — framed content + artist text together
 */
type WallPostType = "LINE" | "FRAME" | "QUOTE";

export interface FramedWorkPreview {
  id: string;
  title: string;
  category?: string;
  workType?: string;
  thumbnail?: string;
  srcId?: string;
  platform?: string;
  artistName?: string;
  artistAvatar?: string;
  artistHandle?: string;
}

export interface FramedOriginalPreview {
  id: string;
  title: string;
  coverImage?: string;
}

export interface FramedRecommendationPreview {
  id: string;
  notes?: string;
  surgeScore?: number;
  score?: number;
  createdAt?: string;
  originalId?: string;
  originalTitle?: string;
  coverImage?: string;
  director?: string;
  cast?: string[];
  authorId?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  authorSpirit?: number;
  authorWorksCount?: number;
  ledgerEntryId?: string;
}

export interface WallPost {
  /** Unique post identifier */
  id: string;

  /** ID of the artist who owns the Wall this was posted to */
  artistId: string;

  /** Display name of the artist */
  artistName: string;

  /** Avatar image URL of the artist */
  artistImage: string;

  /**
   * Post type discriminator.
   * Canonical values: "LINE" | "FRAME" | "QUOTE"
   * Legacy values from older call sites may also appear at runtime.
   */
  type: string;

  /** The Line / comment text */
  text?: string;

  /** ID & Preview of the framed Work */
  framedWorkId?: string;
  framedWork?: FramedWorkPreview;
  pinnedWorkId?: string;

  /** ID & Preview of the framed Original */
  framedOriginalId?: string;
  framedOriginal?: FramedOriginalPreview;
  pinnedOriginalId?: string;

  /** ID & Preview of the framed Recommendation */
  framedRecommendationId?: string;
  framedRecommendation?: FramedRecommendationPreview;
  pinnedRecommendationId?: string;

  /** ID of the LedgerItem (experience log) */
  ledgerEntryId?: string;

  /** Reactions and Saves social counters */
  totalReactions?: number;
  totalSaves?: number;

  /** Viewer interaction flags */
  isSaved?: boolean;
  userReaction?: string;

  /** ISO datetime string when this post was made */
  postedAt: string;
}
