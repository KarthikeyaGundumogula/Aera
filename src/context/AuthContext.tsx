import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { OriginalArtist, TheatreItem } from "../types";
import { apiFetch } from "@/lib/api";
import { DEFAULT_AVATAR_PLACEHOLDER } from "@/constants/placeholders";

/**
 * Maps a raw WorkPreviewCard from GET /profiles/{id}/works to a TheatreItem
 * for use throughout Aera's UI.
 */
function mapBackendWorkToTheatreItem(raw: {
  id: string;
  title?: string | null;
  work_type?: string;
  workType?: string;
  thumbnail?: string | null;
  src_id?: string | null;
  srcId?: string | null;
  platform?: string | null;
  artistId?: string;
  artist?: string;
  artistAvatar?: string;
}): TheatreItem {
  const rawCategory = raw.work_type || raw.workType || "Edit";
  const category: TheatreItem["category"] =
    rawCategory.toUpperCase() === "EDIT"
      ? "Edit"
      : rawCategory.toUpperCase() === "POSTER"
      ? "Poster"
      : rawCategory.toUpperCase() === "SCRIPT"
      ? "Storyboard"
      : "Edit";

  let thumbnail = raw.thumbnail || undefined;
  let srcId: string | undefined = raw.src_id || raw.srcId || undefined;
  let platform: TheatreItem["platform"] | undefined =
    (raw.platform?.toLowerCase() as TheatreItem["platform"]) || undefined;

  if (thumbnail && thumbnail.includes("youtube")) {
    const match = thumbnail.match(/vi\/([^/]+)\//);
    if (match) {
      srcId = srcId || match[1];
      platform = platform || "youtube";
    }
  }

  // Fallback for Edit category if thumbnail is missing but srcId is present
  if (category === "Edit" && srcId && !thumbnail && (!platform || platform === "youtube")) {
    thumbnail = `https://img.youtube.com/vi/${srcId}/hqdefault.jpg`;
    platform = platform || "youtube";
  }

  return {
    id: raw.id,
    title: raw.title ?? undefined,
    category,
    image: thumbnail,
    srcId,
    platform,
    artistId: raw.artistId,
    artist: raw.artist,
    artistAvatar: raw.artistAvatar,
  };
}

export function formatColorTheme(textColor?: string, bgColor?: string): string {
  const normalizeHex = (hex?: string, defaultHex = "#fac107"): string => {
    if (!hex) return defaultHex;
    let clean = hex.trim();
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (clean.length === 4) {
      clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
    } else if (clean.length === 9) {
      clean = clean.slice(0, 7);
    }
    return /^#[0-9a-fA-F]{6}$/.test(clean) ? clean.toUpperCase() : defaultHex.toUpperCase();
  };

  const text = normalizeHex(textColor, "#fac107");
  const bg = normalizeHex(bgColor, "#0f1a42");
  return `${text},${bg}`;
}

export function parseColorTheme(colorTheme?: string | null): { themeTextColor: string; themeBgColor: string } {
  if (!colorTheme) {
    return { themeTextColor: "#fac107", themeBgColor: "#0f1a42" };
  }
  const parts = colorTheme.split(/[,|:;-]/).map(s => s.trim()).filter(s => s.length > 0);
  const normalizedParts = parts.map(p => (p.startsWith("#") ? p : `#${p}`).toUpperCase());

  if (normalizedParts.length >= 2) {
    return { themeTextColor: normalizedParts[0], themeBgColor: normalizedParts[1] };
  } else if (normalizedParts.length === 1) {
    return { themeTextColor: normalizedParts[0], themeBgColor: "#0f1a42" };
  }
  return { themeTextColor: "#fac107", themeBgColor: "#0f1a42" };
}

interface AuthContextType {
  currentArtist: OriginalArtist | null;
  userWorks: TheatreItem[];
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  register: (artist: OriginalArtist, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<OriginalArtist>) => Promise<boolean>;
  updateWorkTitle: (workId: string | number, newTitle: string) => Promise<boolean>;
  deleteWork: (workId: string | number) => Promise<boolean>;
  addWork: (work: TheatreItem) => void;
  refreshProfile: () => Promise<OriginalArtist | null>;
  fetchUserWorks: (artistId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchMyProfile(): Promise<OriginalArtist | null> {
  try {
    const res = await apiFetch("/profiles/me", { method: "GET" });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data || json;
    if (!data || !data.id) return null;

    const { themeTextColor, themeBgColor } = parseColorTheme(data.colorTheme);

    return {
      id: data.id,
      name: data.stageName || data.userName,
      userName: data.userName,
      image: (data.profilePicture && data.profilePicture.trim() !== "" && !data.profilePicture.startsWith("boring-avatar:"))
        ? data.profilePicture
        : DEFAULT_AVATAR_PLACEHOLDER,
      spirit: data.spirit || 0,
      works: data.worksCount || 0,
      favoritesCount: data.favoritesCount || 0,
      role: data.roleName || "organizer",
      bio: data.tagLine || "",
      color_theme: data.colorTheme || "#FAC107,#0F1A42",
      themeTextColor,
      themeBgColor,
      currentPeakLibrary: data.currentPeakLibrary || data.current_peak_library || 1000,
      currentPeakRecommendations: data.currentPeakRecommendations || data.current_peak_recommendations || 1000,
      socials: {
        instagram: data.instagramProfile || undefined,
        twitter: data.twitterProfile || undefined,
        youtube: data.youtubeProfile || undefined,
      },
    };
  } catch (e) {
    console.warn("Failed to fetch /profiles/me:", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentArtist, setCurrentArtist] = useState<OriginalArtist | null>(null);
  const [userWorks, setUserWorks] = useState<TheatreItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async (): Promise<OriginalArtist | null> => {
    const artist = await fetchMyProfile();
    setCurrentArtist(artist);
    return artist;
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      const artist = await fetchMyProfile();
      if (isMounted) {
        setCurrentArtist(artist);
        setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Fetch user works from backend ──────────────────────────────────────────

  const fetchUserWorks = useCallback(async (artistId: string): Promise<void> => {
    if (!artistId) return;
    // Only fetch for real UUIDs — local mock IDs start with "art-"
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(artistId);
    if (!isUuid) return;
    try {
      const res = await apiFetch(`/profiles/${artistId}/works?limit=50`);
      if (res.ok) {
        const json = await res.json();
        const rawItems: Array<{
          id: string;
          title?: string | null;
          work_type?: string;
          workType?: string;
          thumbnail?: string | null;
        }> = json.data || json.items || [];
        const mapped = rawItems.map(mapBackendWorkToTheatreItem);
        setUserWorks(mapped);
        return;
      }
    } catch (e) {
      console.warn("[AuthContext] fetchUserWorks failed, keeping empty list:", e);
    }
    // Fallback: empty works (don't use stale sessionStorage)
    setUserWorks([]);
  }, []);

  useEffect(() => {
    if (!currentArtist) {
      setUserWorks([]);
    }
  }, [currentArtist]);


  const login = useCallback(async (username: string, password?: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    const loginPassword = password || "kApten@1023";

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          handle: cleanUsername,
          password: loginPassword,
        }),
      });

      if (res.ok) {
        const artist = await fetchMyProfile();
        if (artist) {
          setCurrentArtist(artist);
          return true;
        }
        const fallbackArtist: OriginalArtist = {
          id: `art-${cleanUsername}`,
          name: username,
          userName: cleanUsername,
          image: DEFAULT_AVATAR_PLACEHOLDER,
          spirit: 0,
          works: 0,
          role: "organizer",
          bio: "Cinematic Visionary",
          color_theme: "#FAC107,#0F1A42",
          themeTextColor: "#FAC107",
          themeBgColor: "#0F1A42",
        };
        setCurrentArtist(fallbackArtist);
        return true;
      } else {
        console.warn("Backend login failed with status:", res.status);
        return false;
      }
    } catch (e) {
      console.error("Backend login network error:", e);
      return false;
    }
  }, []);

  const register = useCallback(async (artist: OriginalArtist, password?: string): Promise<boolean> => {
    const cleanHandle = (artist.userName || artist.name).trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || "artist_handle";
    const regPassword = password || "kApten@1023";
    const stageName = artist.name.trim().toLowerCase().replace(/[^a-z\u0C00-\u0C7F ]/g, "").replace(/\s+/g, " ").trim().slice(0, 15) || "artist stage";

    const payload: Record<string, unknown> = {
      handle: cleanHandle,
      tag_line: artist.bio || "Cinematic Visionary",
      password: regPassword,
      profile_picture: (artist.image && !artist.image.startsWith("boring-avatar:") && (artist.image.startsWith("http://") || artist.image.startsWith("https://") || artist.image.startsWith("/")))
        ? artist.image
        : DEFAULT_AVATAR_PLACEHOLDER,
      stage_name: stageName,
      color_theme: formatColorTheme(artist.themeTextColor || "#fac107", artist.themeBgColor || "#0f1a42"),
    };

    if (artist.socials?.youtube && artist.socials.youtube.trim().length > 0) {
      payload.youtube_profile = artist.socials.youtube.trim();
    }
    if (artist.socials?.twitter && artist.socials.twitter.trim().length > 0) {
      payload.twitter_profile = artist.socials.twitter.trim();
    }
    if (artist.socials?.instagram && artist.socials.instagram.trim().length > 0) {
      payload.instagram_profile = artist.socials.instagram.trim();
    }

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await login(cleanHandle, regPassword);
      } else {
        console.warn("Backend register failed with status:", res.status);
        return false;
      }
    } catch (e) {
      console.error("Backend register network error:", e);
      return false;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Backend logout error:", e);
    }
    setCurrentArtist(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<OriginalArtist>): Promise<boolean> => {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) {
        const cleanStage = updates.name.trim().toLowerCase().replace(/[^a-z\u0C00-\u0C7F ]/g, "").replace(/\s+/g, " ").trim().slice(0, 15);
        if (cleanStage.length > 0) {
          payload.stage_name = cleanStage;
        }
      }
      if (updates.bio !== undefined) {
        const trimmedBio = updates.bio.trim().slice(0, 100);
        if (trimmedBio.length > 0) {
          payload.tag_line = trimmedBio;
        }
      }
      if (updates.image !== undefined) {
        const trimmedImg = updates.image.trim();
        if (trimmedImg.length > 0) {
          payload.profile_picture = (trimmedImg && !trimmedImg.startsWith("boring-avatar:") && (trimmedImg.startsWith("http://") || trimmedImg.startsWith("https://") || trimmedImg.startsWith("/")))
            ? trimmedImg
            : DEFAULT_AVATAR_PLACEHOLDER;
        }
      }
      if (updates.themeTextColor || updates.themeBgColor || updates.color_theme) {
        const text = updates.themeTextColor || currentArtist?.themeTextColor || "#fac107";
        const bg = updates.themeBgColor || currentArtist?.themeBgColor || "#0f1a42";
        payload.color_theme = formatColorTheme(text, bg);
      }
      if (updates.socials) {
        if (updates.socials.youtube && updates.socials.youtube.trim().length > 0) {
          payload.youtube_profile = updates.socials.youtube.trim();
        }
        if (updates.socials.twitter && updates.socials.twitter.trim().length > 0) {
          payload.twitter_profile = updates.socials.twitter.trim();
        }
        if (updates.socials.instagram && updates.socials.instagram.trim().length > 0) {
          payload.instagram_profile = updates.socials.instagram.trim();
        }
      }

      const res = await apiFetch("/artists/update_stage", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refreshProfile();
        return true;
      } else {
        const errText = await res.text().catch(() => "");
        console.warn("Failed to update stage on backend:", res.status, errText);
      }
    } catch (e) {
      console.error("Error updating stage profile:", e);
    }

    // Local fallback update
    setCurrentArtist(prev => prev ? { ...prev, ...updates } : prev);
    return false;
  }, [currentArtist, refreshProfile]);

  const updateWorkTitle = useCallback(async (workId: string | number, newTitle: string): Promise<boolean> => {
    // Optimistic local update first
    setUserWorks(prevWorks =>
      prevWorks.map((w) => (w.id === workId ? { ...w, title: newTitle } : w))
    );
    // Persist to backend (only valid UUIDs)
    const idStr = String(workId);
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idStr);
    if (!isUuid) return true; // local-only work, optimistic update is fine
    try {
      const res = await apiFetch(`/works/${idStr}/update`, {
        method: "POST",
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        return true;
      }
      console.warn("[AuthContext] updateWorkTitle backend call failed:", res.status);
      return false;
    } catch (e) {
      console.warn("[AuthContext] updateWorkTitle network error:", e);
      return false;
    }
  }, []);

  const deleteWork = useCallback(async (workId: string | number): Promise<boolean> => {
    const idStr = String(workId);
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(idStr);
    // Optimistic removal from local state
    setUserWorks(prevWorks => prevWorks.filter((w) => String(w.id) !== idStr));
    if (!isUuid) return true; // local-only work removed optimistically
    try {
      const res = await apiFetch(`/works/${idStr}/delete`, { method: "DELETE" });
      if (res.ok) {
        return true;
      }
      console.warn("[AuthContext] deleteWork backend call failed:", res.status);
      // Revert optimistic removal on failure
      return false;
    } catch (e) {
      console.warn("[AuthContext] deleteWork network error:", e);
      return false;
    }
  }, []);


  const addWork = useCallback((work: TheatreItem) => {
    setCurrentArtist(prevArtist => {
      if (!prevArtist) return prevArtist;
      const workWithMeta: TheatreItem = {
        ...work,
        artistId: prevArtist.id,
        artist: prevArtist.name,
        artistAvatar: prevArtist.image || undefined,
      };
      setUserWorks(prevWorks => [workWithMeta, ...prevWorks]);
      return prevArtist;
    });
  }, []);

  const value = useMemo(() => ({
    currentArtist,
    userWorks,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updateWorkTitle,
    deleteWork,
    addWork,
    refreshProfile,
    fetchUserWorks,
  }), [currentArtist, userWorks, isLoading, login, register, logout, updateProfile, updateWorkTitle, deleteWork, addWork, refreshProfile, fetchUserWorks]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
