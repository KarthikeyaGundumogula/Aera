import { AnnouncementGroup, AnnouncementType } from "../types/foyer";
import { getMockTheatreItems } from "./theatre";
import { originals } from "./originals";
import { getWallPostsForArtist } from "./wall";
import { getLedgerItems } from "./ledger";

const ARTISTS = [
  {
    id: "karthikeya",
    name: "Karthikeya Gundumogula",
    image:
      "https://i.pinimg.com/736x/8f/cf/58/8fcf58b6eb09b119614adbb266b1e6ce.jpg",
  },
  {
    id: "hideo",
    name: "Hideo Kojima",
    image:
      "https://i.pinimg.com/736x/4d/9d/28/4d9d28f89ce86e6de3bb175cbcfc3581.jpg",
  },
];

export function getMockFoyerAnnouncements(): AnnouncementGroup[] {
  const theatreItems = getMockTheatreItems();
  const allWallPosts = ARTISTS.map(a => getWallPostsForArtist(a.id)).flat();
  const ledgerItems = getLedgerItems();

  return ARTISTS.map((artist) => {
    // Collect 1 work, 1 original, 1 ledger entry, and 1 wall post for this artist to simulate a rich announcement billboard
    const announcements = [];
    
    // 1. New Work
    const work = theatreItems.find(t => t.creatorId === artist.id) || theatreItems[0];
    if (work) {
      announcements.push({
        id: `ann-work-${artist.id}`,
        creatorId: artist.id,
        creatorName: artist.name,
        creatorImage: artist.image,
        type: "NEW_WORK" as AnnouncementType,
        resolvedWork: work,
        text: "Just released a new work!",
        postedAt: work.releaseDate || new Date().toISOString(),
      });
    }

    // 2. New Original
    const original = originals.find(o => o.creatorId === artist.id) || originals[0];
    if (original) {
      announcements.push({
        id: `ann-orig-${artist.id}`,
        creatorId: artist.id,
        creatorName: artist.name,
        creatorImage: artist.image,
        type: "NEW_ORIGINAL" as AnnouncementType,
        resolvedOriginal: original,
        text: "New Original pinned to the wall.",
        postedAt: original.releasedAt || new Date().toISOString(),
      });
    }
    
    // 3. Wall Post
    const wallPost = allWallPosts.find(p => p.artistId === artist.id && p.type === "LINE");
    if (wallPost) {
      announcements.push({
        id: `ann-wall-${artist.id}`,
        creatorId: artist.id,
        creatorName: artist.name,
        creatorImage: artist.image,
        type: "WALL_POST" as AnnouncementType,
        resolvedWallPost: wallPost,
        postedAt: wallPost.postedAt,
      });
    }

    // Sort announcements newest first
    announcements.sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );

    return {
      creatorId: artist.id,
      creatorName: artist.name,
      creatorImage: artist.image,
      announcements,
    };
  });
}
