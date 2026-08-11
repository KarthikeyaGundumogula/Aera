export interface Recommendation {
  id: string;
  artist: {
    id: string;
    stageName: string;
    name?: string;
    profilePicture: string;
    spirit: number | string;
    works?: number;
    highestScore?: number;
  };
  original: {
    id: string;
    title: string;
    coverImage: string;
    releaseDate: string;
    stars?: string[];
    dop?: string;
    director?: string;
    format?: string;
    genres?: string[];
  };
  comment?: string;
  surgeScore?: number;
  score?: number;
  notes?: string;
  postedAt?: string;
  tags?: string[];
  createdAt?: string;
  contextLabel?: string;
  isPeakRecorded?: boolean;
  sequenceThumbnail?: string;
  sequenceId?: string;
  artistLiked?: boolean;
}
