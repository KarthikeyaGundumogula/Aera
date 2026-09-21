export interface Artist {
  id: string;
  userName?: string;
  stageName: string;
  spiritAnimal?: string;
  spiritDescription?: string;
  role?: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  spirit?: number;
  worksCount?: number;
  favoritesCount?: number;
  isRegistered?: boolean;
  peakMagnitude?: number;
  surgeMean?: number;
  surgeSpread?: number;
  socials?: Record<string, string>;
  stats?: {
    breakdownsCount: number;
    worksCount: number;
    peakMagnitude: number;
  };
}
