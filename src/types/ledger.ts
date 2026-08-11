export interface LedgerMakerCredit {
  role: string;
  artistId?: string;
  artistStageName?: string;
  artistPic?: string;
  artistSpirit?: string;
  creditedWorkId?: string;
  creditedWorkName?: string;
  name?: string;
  imageUrl?: string;
}

export interface LedgerItem {
  id: string;
  artistId: string;
  originalId: string;
  originalName: string;
  originalPosterUrl: string;
  releaseYear: string;
  genre: string[];
  starName: string;
  starImageUrl?: string;
  status: "watched" | "want_to_watch";
  preThoughts: string;
  afterThoughts: string;
  surgeScore: number;
  peakScore?: number;
  peakSnapshot?: number;
  currentPeakScore?: number;
  taggedWorks: string[];

  addedAt: string;
  watchedAt?: string;
  makerCredits?: LedgerMakerCredit[];
  makers?: any[];
  // Artist / profile identity
  artistStageName?: string;
  artistProfilePicture?: string;
  artistColorTheme?: string;
}
