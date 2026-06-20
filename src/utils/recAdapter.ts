import { Recommendation } from "../mock/recommendations";
import { TheatreItem } from "../types";

/**
 * Converts a Recommendation into a TheatreItem so it can be slotted
 * into the Theatre engine's Square containers.
 *
 * Mapping:
 *   image       ← rec.original.coverImage   (movie poster, shown in the tile)
 *   title       ← rec.original.title
 *   artist      ← rec.artist.name
 *   artistAvatar← rec.artist.profilePicture  (shown bottom-right on tile)
 *   recId       ← rec.id                     (used to open modal at correct index)
 *   category    ← 'Recommendation'
 *   aspectRatio ← 0.67 (standard portrait poster ratio ~2:3)
 */
export function recToTheatreItem(rec: Recommendation): TheatreItem {
  return {
    id: `rec-${rec.id}`,
    title: rec.original.title,
    category: "Recommendation",
    image: rec.original.coverImage,
    artist: rec.artist.name,
    artistAvatar: rec.artist.profilePicture,
    recId: rec.id,
    captions: [rec.notes],
    aspectRatio: 0.67,
  };
}
