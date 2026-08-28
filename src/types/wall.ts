/**
 * Wall — Type definitions for the Artist Wall feature.
 *
 * The Wall is a curated, personal moodboard on an Artist's profile.
 * Posts are distributed exclusively to users who have Favorited the Artist (Foyer).
 *
 * Five post variants:
 *   LINE          — a conversational text post (like a tweet, no big quote marks)
 *   PIN_WORK      — a pinned Work (Edit/Poster/Script) with an optional artist Line
 *   PIN_ORIGINAL  — a pinned Original with an optional artist Line
 *   RECOMMENDATION — a pinned Recommendation card with an optional quote
 *   LEDGER_ENTRY  — a public Ledger experience log (editorial preview on Wall, full Viewer on tap)
 */

type WallPostType = "LINE" | "PIN_WORK" | "PIN_ORIGINAL" | "RECOMMENDATION" | "LEDGER_ENTRY";

export interface FramedWorkPreview {
  id: string;
  title: string;
  category: string;
  thumbnail?: string;
  artistName?: string;
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

  /** Discriminator — determines which data fields are present */
  type: WallPostType;

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
