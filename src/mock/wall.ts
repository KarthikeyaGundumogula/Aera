import { WallPost } from "../types/wall";

export const WALL_POSTS: WallPost[] = [];

export function getWallPostsByArtist(artistId: string): WallPost[] {
  return WALL_POSTS.filter((p) => p.artistId === artistId);
}
