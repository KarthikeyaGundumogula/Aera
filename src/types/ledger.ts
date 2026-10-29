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
  director?: string;
  makerCredits?: LedgerMakerCredit[];
  makers?: any[];
  stars?: any[];
  // Artist / profile identity
  artistStageName?: string;
  artistProfilePicture?: string;
  artistColorTheme?: string;
}

export function mapBackendLedgerItem(raw: any, fallbackArtistId: string = "fh-001"): LedgerItem {
  if (!raw) {
    return {
      id: "",
      artistId: fallbackArtistId,
      originalId: "",
      originalName: "Untitled Original",
      originalPosterUrl: "",
      releaseYear: "",
      genre: [],
      starName: "",
      status: "want_to_watch",
      preThoughts: "",
      afterThoughts: "",
      surgeScore: 0,
      taggedWorks: [],
      addedAt: new Date().toISOString(),
    };
  }

  const id = String(raw.library_entry_id || raw.libraryEntryId || raw.id || "");
  const originalId = String(raw.original_id || raw.originalId || raw.id || "");
  const originalName = String(
    raw.originalName || raw.original_name || raw.title || "Untitled Original"
  );
  const originalPosterUrl = String(
    raw.originalPosterUrl ||
      raw.original_poster_url ||
      raw.cover_image ||
      raw.coverImage ||
      ""
  );
  const preThoughts = String(
    raw.preThoughts || raw.pre_thoughts || raw.description || ""
  );
  const afterThoughts = String(
    raw.afterThoughts || raw.after_thoughts || ""
  );
  const status: "watched" | "want_to_watch" =
    raw.status === "watched" || raw.status === "want_to_watch"
      ? raw.status
      : raw.watched
      ? "watched"
      : "want_to_watch";
  const genre = Array.isArray(raw.genre)
    ? raw.genre
    : typeof raw.genre === "string" && raw.genre
    ? [raw.genre]
    : [];
  const taggedWorks = Array.isArray(raw.taggedWorks)
    ? raw.taggedWorks
    : Array.isArray(raw.tagged_works)
    ? raw.tagged_works
    : [];

  return {
    id,
    artistId: String(raw.artistId || raw.artist_id || fallbackArtistId),
    originalId,
    originalName,
    originalPosterUrl,
    releaseYear: String(
      raw.releaseYear || raw.release_year || raw.releaseDate || ""
    ),
    genre,
    starName: String(raw.starName || raw.star_name || ""),
    starImageUrl: raw.starImageUrl || raw.star_image_url || undefined,
    status,
    preThoughts,
    afterThoughts,
    surgeScore:
      typeof raw.surgeScore === "number"
        ? raw.surgeScore
        : typeof raw.surge_score === "number"
        ? raw.surge_score
        : 0,
    peakScore: raw.peakScore ?? raw.peak_score,
    peakSnapshot: raw.peakSnapshot ?? raw.peak_snapshot,
    currentPeakScore: raw.currentPeakScore ?? raw.current_peak_score,
    taggedWorks,
    addedAt: String(
      raw.addedAt || raw.added_at || raw.created_at || new Date().toISOString()
    ),
    watchedAt: raw.watchedAt || raw.watched_at || undefined,
    director: raw.director || undefined,
    makerCredits: raw.makerCredits || raw.maker_credits || undefined,
    makers: raw.makers || undefined,
    stars: raw.stars || undefined,
    artistStageName: raw.artistStageName || raw.artist_stage_name || undefined,
    artistProfilePicture:
      raw.artistProfilePicture || raw.artist_profile_picture || undefined,
    artistColorTheme:
      raw.artistColorTheme || raw.artist_color_theme || undefined,
  };
}
