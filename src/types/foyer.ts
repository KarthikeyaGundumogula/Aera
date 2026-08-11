import { TheatreItem } from "./theatre";
import { Original } from "./originals";
import { Recommendation } from "./recommendations";
import { LedgerItem } from "./ledger";
import { WallPost } from "./wall";

type AnnouncementType = 
  | "NEW_WORK" 
  | "NEW_ORIGINAL" 
  | "WALL_POST" 
  | "RECOMMENDATION" 
  | "LEDGER_UPDATE";

interface Announcement {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  type: AnnouncementType;
  
  resolvedWork?: TheatreItem;
  resolvedOriginal?: Original;
  resolvedWallPost?: WallPost;
  resolvedRecommendation?: Recommendation;
  resolvedLedgerEntry?: LedgerItem;
  
  text?: string;
  postedAt: string;
}

export interface AnnouncementGroup {
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  announcements: Announcement[];
}
