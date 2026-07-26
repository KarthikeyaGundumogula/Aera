/**
 * Mock data for the Recommendation feature.
 * Empty in E2E branch to enforce strict real backend data.
 */

export interface RecommendationArtist {
  id: string;
  name: string;
  stageName: string;
  profilePicture: string;
  spirit: number;
  works?: number;
  highestScore?: number;
}

export interface RecommendationOriginal {
  id: string;
  title: string;
  coverImage: string;
  spirit: number;
  genres: string[];
  format: string;
  director?: string;
  dop?: string;
  stars?: string[];
}

export interface Recommendation {
  id: string;
  original: RecommendationOriginal;
  artist: RecommendationArtist;
  comment: string;
  surgeScore: number;
  score: number;
  notes: string;
  postedAt?: string;
  artistLiked?: boolean;
  contextLabel?: string;
  isPeakRecorded?: boolean;
  tags?: string[];
  createdAt: string;
  sequenceThumbnail?: string;
  sequenceId?: string;
}

export const MOCK_RECOMMENDATIONS: Recommendation[] = [];
