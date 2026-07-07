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

  // ─── AUTO GENERATED MOCK POSTS ──────────────────────────────────────────

  {
    id: "wp-gen-100",
    artistId: "gen-powerstar_fc",
    artistName: "PowerStar_FC",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-101",
    artistId: "gen-powerstar_fc",
    artistName: "PowerStar_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-og-8",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-102",
    artistId: "gen-pk_edits",
    artistName: "PK_Edits",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-103",
    artistId: "gen-pk_edits",
    artistName: "PK_Edits",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-og-15",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-104",
    artistId: "gen-andhra_cuts",
    artistName: "Andhra_Cuts",
    artistImage: "",
    type: "LINE",
    text: "colour grading is half the storytelling. never forget that.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-105",
    artistId: "gen-andhra_cuts",
    artistName: "Andhra_Cuts",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-og-3",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-106",
    artistId: "gen-jungle_quill",
    artistName: "Jungle_Quill",
    artistImage: "",
    type: "LINE",
    text: "pure cinematic perfection.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-107",
    artistId: "gen-jungle_quill",
    artistName: "Jungle_Quill",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-og-4",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-108",
    artistId: "gen-ram_charan_fc",
    artistName: "Ram_Charan_FC",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-109",
    artistId: "gen-ram_charan_fc",
    artistName: "Ram_Charan_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-rrr-1",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-110",
    artistId: "gen-ntr_edits",
    artistName: "NTR_Edits",
    artistImage: "",
    type: "LINE",
    text: "still obsessed with the framing in the climax.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-111",
    artistId: "gen-ntr_edits",
    artistName: "NTR_Edits",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-rrr-2",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-112",
    artistId: "gen-telugu_talkies",
    artistName: "Telugu_Talkies",
    artistImage: "",
    type: "LINE",
    text: "this transition literally gave me chills.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-113",
    artistId: "gen-telugu_talkies",
    artistName: "Telugu_Talkies",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-rrr-11",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-114",
    artistId: "gen-komaram_fan",
    artistName: "Komaram_Fan",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-115",
    artistId: "gen-komaram_fan",
    artistName: "Komaram_Fan",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-rrr-8",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-116",
    artistId: "gen-kgf_yash_fc",
    artistName: "KGF_Yash_FC",
    artistImage: "",
    type: "LINE",
    text: "cinema is mostly about knowing when NOT to cut.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-117",
    artistId: "gen-kgf_yash_fc",
    artistName: "KGF_Yash_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-5",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-118",
    artistId: "gen-kannada_kali",
    artistName: "Kannada_Kali",
    artistImage: "",
    type: "LINE",
    text: "still obsessed with the framing in the climax.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-119",
    artistId: "gen-kannada_kali",
    artistName: "Kannada_Kali",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-14",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-120",
    artistId: "gen-kolar_frames",
    artistName: "Kolar_Frames",
    artistImage: "",
    type: "LINE",
    text: "pure cinematic perfection.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-121",
    artistId: "gen-kolar_frames",
    artistName: "Kolar_Frames",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-3",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-122",
    artistId: "gen-adheera_fc",
    artistName: "Adheera_FC",
    artistImage: "",
    type: "LINE",
    text: "spent way too long cutting this sequence, but totally worth it.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-123",
    artistId: "gen-adheera_fc",
    artistName: "Adheera_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-kgf-12",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-124",
    artistId: "gen-kamal_fc",
    artistName: "Kamal_FC",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-125",
    artistId: "gen-kamal_fc",
    artistName: "Kamal_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-vkm-1",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-126",
    artistId: "gen-fahadh_fan",
    artistName: "Fahadh_Fan",
    artistImage: "",
    type: "LINE",
    text: "colour grading is half the storytelling. never forget that.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-127",
    artistId: "gen-fahadh_fan",
    artistName: "Fahadh_Fan",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-vkm-2",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-128",
    artistId: "gen-vijay_sethupathi_fc",
    artistName: "Vijay_Sethupathi_FC",
    artistImage: "",
    type: "LINE",
    text: "spent way too long cutting this sequence, but totally worth it.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-129",
    artistId: "gen-vijay_sethupathi_fc",
    artistName: "Vijay_Sethupathi_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-vkm-7",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-130",
    artistId: "gen-kollywood_vault",
    artistName: "Kollywood_Vault",
    artistImage: "",
    type: "LINE",
    text: "sometimes a single frame says more than a 10-page script.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-131",
    artistId: "gen-kollywood_vault",
    artistName: "Kollywood_Vault",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-vkm-4",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-132",
    artistId: "gen-mahishmati_fc",
    artistName: "Mahishmati_FC",
    artistImage: "",
    type: "LINE",
    text: "re-watched this scene 50 times to get the pacing right.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-133",
    artistId: "gen-mahishmati_fc",
    artistName: "Mahishmati_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-bah-6",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-134",
    artistId: "gen-prabhas_nation",
    artistName: "Prabhas_Nation",
    artistImage: "",
    type: "LINE",
    text: "pure cinematic perfection.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-135",
    artistId: "gen-prabhas_nation",
    artistName: "Prabhas_Nation",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-bah-2",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-136",
    artistId: "gen-sivagami_fan",
    artistName: "Sivagami_Fan",
    artistImage: "",
    type: "LINE",
    text: "colour grading is half the storytelling. never forget that.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-137",
    artistId: "gen-sivagami_fan",
    artistName: "Sivagami_Fan",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-bah-4",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-138",
    artistId: "gen-amarendra_fc",
    artistName: "Amarendra_FC",
    artistImage: "",
    type: "LINE",
    text: "can't stop thinking about the cinematography in this shot.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-139",
    artistId: "gen-amarendra_fc",
    artistName: "Amarendra_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-bah-5",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-140",
    artistId: "gen-stardust_fc",
    artistName: "StarDust_FC",
    artistImage: "",
    type: "LINE",
    text: "this transition literally gave me chills.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-141",
    artistId: "gen-stardust_fc",
    artistName: "StarDust_FC",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-gen-1",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-142",
    artistId: "gen-tollywood_lens",
    artistName: "Tollywood_Lens",
    artistImage: "",
    type: "LINE",
    text: "re-watched this scene 50 times to get the pacing right.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-143",
    artistId: "gen-tollywood_lens",
    artistName: "Tollywood_Lens",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-gen-2",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-144",
    artistId: "gen-kollywood_king",
    artistName: "Kollywood_King",
    artistImage: "",
    type: "LINE",
    text: "pure cinematic perfection.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-145",
    artistId: "gen-kollywood_king",
    artistName: "Kollywood_King",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-gen-3",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-146",
    artistId: "gen-hyderabad_frames",
    artistName: "Hyderabad_Frames",
    artistImage: "",
    type: "LINE",
    text: "sound design carries the emotional weight here.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-147",
    artistId: "gen-hyderabad_frames",
    artistName: "Hyderabad_Frames",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-gen-4",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
  },

  {
    id: "wp-gen-148",
    artistId: "gen-frame_scholar",
    artistName: "Frame_Scholar",
    artistImage: "",
    type: "LINE",
    text: "this transition literally gave me chills.",
    postedAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "wp-gen-149",
    artistId: "gen-frame_scholar",
    artistName: "Frame_Scholar",
    artistImage: "",
    type: "PIN_WORK",
    pinnedWorkId: "w-gen-5",
    text: "checkout my latest piece. the visual rhythm here is something i'm proud of.",
    postedAt: "2026-06-30T10:00:00Z",
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
function getFoyerWallPosts(favoritedArtistIds: string[]): WallPost[] {
  return WALL_POSTS
    .filter((p) => favoritedArtistIds.includes(p.artistId))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}
