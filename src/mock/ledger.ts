export type LedgerTaggedWork = {
  id: string;
  type: "poster" | "hype_cut";
  thumbnailUrl: string;
  authorName: string;
  platform?: string;
  srcId?: string;
};

export type LedgerMakerCredit = {
  name: string;
  role: string;
  imageUrl?: string;
};

export type LedgerItem = {
  id: string;
  artistId?: string;
  originalId: string;
  originalName: string;
  originalPosterUrl: string;
  releaseYear?: string;
  genre?: string[];
  starName?: string;
  starImageUrl?: string;
  makers?: LedgerMakerCredit[];
  status: "want_to_watch" | "watched";
  userRating?: number;
  surgeScore?: number;
  addedAt: string;
  userHypeThought?: string;
  userAfterThought?: string;
  preThoughts?: string;
  afterThoughts?: string;
  watchedAt?: string;
  taggedWorks?: LedgerTaggedWork[];
  pinnedWorkId?: string;
};

export const mockLedger: LedgerItem[] = [];
