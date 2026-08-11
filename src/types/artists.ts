export interface Artist {
  id: string;
  userName?: string;
  user_name?: string;
  stageName: string;
  stage_name?: string;
  spiritAnimal: string;
  spirit_animal?: string;
  spiritDescription?: string;
  role: string;
  profilePicture: string;
  profile_picture?: string;
  bannerImage?: string;
  banner_image?: string;
  bio?: string;
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
