/**
 * Wall Mock Data — Simulates WallPost records from the backend.
 *
 * Each entry maps to one of three types:
 *   LINE        — a short conversational line, like a tweet
 *   PIN_WORK    — a pinned Work with an optional attached Line
 *   PIN_ORIGINAL — a pinned Original with an optional attached Line
 *
 * All posts are scoped to the artist's Wall and distributed only to Favorited followers (Foyer).
 * Mock posts are distributed across all three artists: fh-001 (Karthik G), fh-002 (Priya Nair), fh-003 (Arjun Reddy).
 */

import { WallPost } from "../types/wall";

export const WALL_POSTS: WallPost[] = [
  // ─── fh-001 (Karthik G) ───────────────────────────────────────────────────

  {
    id: "wp-001",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "LINE",
    text: "the RRR bridge scene still makes me forget to breathe. every single time.",
    postedAt: "2026-07-05T20:30:00Z",
  },
  {
    id: "wp-002",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-1",
    text: "this Rocky Bhai entry edit is a masterclass in timing. the cut at 0:28 alone took 6 hours.",
    postedAt: "2026-07-04T14:00:00Z",
  },
  {
    id: "wp-003",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "PIN_ORIGINAL",
    pinnedOriginalId: "vikram-original",
    text: "Lokesh Kanagaraj does not make films. he constructs universes. studying every frame of Vikram for the next edit.",
    postedAt: "2026-07-03T09:15:00Z",
  },
  {
    id: "wp-004",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "LINE",
    text: "good colour grading is invisible. you should feel it before you see it.",
    postedAt: "2026-07-02T18:00:00Z",
  },
  {
    id: "wp-005",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "PIN_WORK",
    pinnedWorkId: "w-rrr-1",
    // no Line — silent pin, the work speaks for itself
    postedAt: "2026-07-01T11:00:00Z",
  },
  {
    id: "wp-006",
    artistId: "fh-001",
    artistName: "Karthik G",
    artistImage: "/stars/pawan-kalyan.jpeg",
    type: "PIN_ORIGINAL",
    pinnedOriginalId: "og-original",
    // no Line — respect
    postedAt: "2026-06-30T08:00:00Z",
  },

  // ─── fh-002 (Priya Nair) ─────────────────────────────────────────────────

  {
    id: "wp-007",
    artistId: "fh-002",
    artistName: "Priya Nair",
    artistImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    type: "LINE",
    text: "started a new edit at 2am. now it's 5am. no regrets.",
    postedAt: "2026-07-05T23:30:00Z",
  },
  {
    id: "wp-008",
    artistId: "fh-002",
    artistName: "Priya Nair",
    artistImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    type: "PIN_WORK",
    pinnedWorkId: "w-vkm-3",
    text: "the Black Cell poster design is so clean it hurts. whoever made this knows exactly what negative space is for.",
    postedAt: "2026-07-04T16:45:00Z",
  },
  {
    id: "wp-009",
    artistId: "fh-002",
    artistName: "Priya Nair",
    artistImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    type: "LINE",
    text: "found an OG frame from the climax that S.Thaman scored perfectly against. posting the edit end of week.",
    postedAt: "2026-07-03T12:00:00Z",
  },
  {
    id: "wp-010",
    artistId: "fh-002",
    artistName: "Priya Nair",
    artistImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    type: "PIN_ORIGINAL",
    pinnedOriginalId: "baahubali-original",
    text: "Baahubali 2 taught me that spectacle and emotion are not opposites. the Kattappa reveal still destroys me.",
    postedAt: "2026-07-02T20:00:00Z",
  },
  {
    id: "wp-011",
    artistId: "fh-002",
    artistName: "Priya Nair",
    artistImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop",
    type: "PIN_WORK",
    pinnedWorkId: "w-og-3",
    // no Line — the poster is the statement
    postedAt: "2026-07-01T09:30:00Z",
  },

  // ─── fh-003 (Arjun Reddy) ────────────────────────────────────────────────

  {
    id: "wp-012",
    artistId: "fh-003",
    artistName: "Arjun Reddy",
    artistImage: "/stars/yash.jpg",
    type: "LINE",
    text: "dropped everything to re-watch KGF chapter 2 just for the BGM during the climax sequence. Ravi Basrur is not human.",
    postedAt: "2026-07-05T17:00:00Z",
  },
  {
    id: "wp-013",
    artistId: "fh-003",
    artistName: "Arjun Reddy",
    artistImage: "/stars/yash.jpg",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-5",
    text: "the bloodbath cut from @KGF_Yash_FC perfectly captures what Prashanth Neel intended in 3 minutes.",
    postedAt: "2026-07-04T10:00:00Z",
  },
  {
    id: "wp-014",
    artistId: "fh-003",
    artistName: "Arjun Reddy",
    artistImage: "/stars/yash.jpg",
    type: "LINE",
    text: "an edit should not just show what happened. it should make you feel what the character felt.",
    postedAt: "2026-07-03T14:30:00Z",
  },
  {
    id: "wp-015",
    artistId: "fh-003",
    artistName: "Arjun Reddy",
    artistImage: "/stars/yash.jpg",
    type: "PIN_ORIGINAL",
    pinnedOriginalId: "rrr-original",
    // no Line — pins it in silence
    postedAt: "2026-07-02T08:00:00Z",
  },
];

/**
 * Returns wall posts for a given artist, sorted newest-first.
 */
export function getWallPostsByArtist(artistId: string): WallPost[] {
  return WALL_POSTS
    .filter((p) => p.artistId === artistId)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

/**
 * Returns all wall posts from artists that a given user has favorited,
 * sorted newest-first. Simulates the Foyer feed delivery.
 *
 * @param favoritedArtistIds - IDs of artists the current user has favorited
 */
export function getFoyerWallPosts(favoritedArtistIds: string[]): WallPost[] {
  return WALL_POSTS
    .filter((p) => favoritedArtistIds.includes(p.artistId))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}
