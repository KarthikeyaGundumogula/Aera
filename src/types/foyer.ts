import { TheatreItem } from "./theatre";
import { Original } from "./originals";
import { Recommendation } from "./wall";
import { LedgerItem } from "../mock/ledger";
import { WallPost } from "./wall";

export type AnnouncementType = 
  | "NEW_WORK" 
  | "NEW_ORIGINAL" 
  | "WALL_POST" 
  | "RECOMMENDATION" 
  | "LEDGER_UPDATE";

export interface Announcement {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  type: AnnouncementType;
  
  // The announcement will resolve to one of these concrete items depending on its type
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedWallPost?: WallPost; // The underlying Wall Post (LINE, PIN, etc.) if it's a WALL_POST
  resolvedRecommendation?: Recommendation;
  resolvedLedgerEntry?: LedgerItem;
  
  // Optional announcement text (e.g., "Just released!")
  text?: string;
  postedAt: string;
}

export interface AnnouncementGroup {
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  announcements: Announcement[];
}
