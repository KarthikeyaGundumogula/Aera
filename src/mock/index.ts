/**
 * Mock Data Barrel — Strictly emptied for E2E integration.
 * All arrays return empty datasets so the app exclusively relies on real backend payloads.
 */
import { Original, OriginalArtist, OriginalStar, OriginalMaker, TheatreItem, Set, Festival } from "../types";

export const GRID_ITEMS: TheatreItem[] = [];

export const ORIGINALS: Original[] = [];

export const ORIGINALS_DATA: Record<string, Original> = {};

export const STARS_MOCK: OriginalStar[] = [];

export const MAKERS_MOCK: OriginalMaker[] = [];

export const ARTISTS_MOCK: OriginalArtist[] = [];

export const SETS: Set[] = [];

export const FESTIVALS: Festival[] = [];

export interface ProfileEntry {
  id: string;
  name: string;
  profilePicture?: string;
  tagline?: string;
  profileType: "STAR" | "MAKER" | "ARTIST";
}

export const PROFILES_DIRECTORY: ProfileEntry[] = [];

export * from "./thoughts";
export * from "./discussionReplies";
export * from "./recommendations";
export * from "./ledger";
export * from "./wall";
export * from "./foyer";

export const CURRENT_USER_MOCK = {
  id: "user-current",
  name: "Karthikeya",
  favoritedOriginalIds: [] as string[],
  memberSetIds: [] as string[],
};
