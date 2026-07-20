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

  /**
   * The Line.
   * - For LINE type: required — this is the entire post content.
   * - For PIN_WORK / PIN_ORIGINAL / RECOMMENDATION: optional — the artist's commentary on what they pinned.
   */
  text?: string;

  /**
   * ID of the pinned Work (TheatreItem.id).
   * Only present when type === "PIN_WORK".
   */
  pinnedWorkId?: string;

  /**
   * ID of the pinned Original.
   * Only present when type === "PIN_ORIGINAL".
   */
  pinnedOriginalId?: string;

  /**
   * ID of the pinned Recommendation.
   * Only present when type === "RECOMMENDATION".
   */
  pinnedRecommendationId?: string;

  /**
   * ID of the LedgerItem (experience log).
   * Only present when type === "LEDGER_ENTRY".
   */
  ledgerEntryId?: string;

  /** ISO datetime string when this post was made */
  postedAt: string;
}
