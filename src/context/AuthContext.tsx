import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { OriginalArtist, TheatreItem } from "../types";
import { apiFetch } from "@/lib/api";

// Helper functions to manage cookies client-side.
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days = 7) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict`;
}

function eraseCookie(name: string) {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
}

// Generate a simulated JWT token string (Header.Payload.Signature)
function generateMockJwt(artistId: string, name: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: artistId, username: name, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }));
  const signature = "simulated_signature";
  return `${header}.${payload}.${signature}`;
}

// Decode a simulated JWT token string to read the payload
function parseMockJwt(token: string): { id: string; username: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = atob(parts[1]);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

interface AuthContextType {
  currentArtist: OriginalArtist | null;
  userWorks: TheatreItem[];
  login: (username: string, password?: string) => Promise<boolean>;
  register: (artist: OriginalArtist, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<OriginalArtist>) => void;
  updateWorkTitle: (workId: string | number, newTitle: string) => void;
  addWork: (work: TheatreItem) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentArtist, setCurrentArtist] = useState<OriginalArtist | null>(null);
  const [userWorks, setUserWorks] = useState<TheatreItem[]>([]);

  // Session Check on Boot
  useEffect(() => {
    const token = getCookie("framehouse_auth_token");
    if (token) {
      const payload = parseMockJwt(token);
      if (payload) {
        let artist: OriginalArtist | null = null;
        const savedArtist = sessionStorage.getItem(`framehouse_artist_details_${payload.id}`);
        if (savedArtist) {
          artist = JSON.parse(savedArtist);
        } else {
          artist = {
            id: payload.id,
            name: payload.username,
            image: `boring-avatar:${payload.username}`,
            spirit: 0,
            works: 0,
            bio: "Cinematic Visionary",
            themeBgColor: "#0f1a42",
            themeTextColor: "#fac107",
          };
        }
        if (artist) {
          setCurrentArtist(artist);
        }
      }
    }
  }, []);

  // Load and sync works for the current user
  useEffect(() => {
    if (!currentArtist) {
      setUserWorks([]);
      return;
    }

    const savedWorksKey = `framehouse_user_works_${currentArtist.id}`;
    const savedWorks = sessionStorage.getItem(savedWorksKey);
    if (savedWorks) {
      setUserWorks(JSON.parse(savedWorks));
    } else {
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
        let artist: OriginalArtist | null = null;
        const savedArtist = sessionStorage.getItem(`framehouse_artist_details_${cleanUsername}`);
        if (savedArtist) {
          artist = JSON.parse(savedArtist);
        } else {
          artist = {
            id: `art-${cleanUsername}`,
            name: username,
            image: `boring-avatar:${cleanUsername}`,
            spirit: 0,
            works: 0,
            bio: "Cinematic Visionary",
            themeBgColor: "#0f1a42",
            themeTextColor: "#fac107",
          };
        }

        if (artist) {
          setCookie("framehouse_auth_token", generateMockJwt(artist.id, artist.name));
          setCurrentArtist(artist);
          return true;
        }
        return false;
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
    const defaultArtist = {
      ...artist,
      spirit: 0,
      works: 0,
      themeBgColor: artist.themeBgColor || "#0f1a42",
      themeTextColor: artist.themeTextColor || "#fac107",
    };

    const cleanHandle = artist.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || "artist_handle";
    const regPassword = password || "kApten@1023";
    const stageName = artist.name.trim().toLowerCase().replace(/[^a-z ]/g, "") || "artist stage";

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          handle: cleanHandle,
          tag_line: artist.bio || "Cinematic Visionary",
          password: regPassword,
          profile_picture: artist.image || `boring-avatar:${cleanHandle}`,
          youtube_profile: null,
          twitter_profile: null,
          instagram_profile: null,
          stage_name: stageName,
          color_theme: defaultArtist.themeBgColor.startsWith("#") ? defaultArtist.themeBgColor : "#FF0000",
        }),
      });

      if (res.ok) {
        sessionStorage.setItem(`framehouse_artist_details_${defaultArtist.id}`, JSON.stringify(defaultArtist));
        sessionStorage.setItem(`framehouse_artist_details_${cleanHandle}`, JSON.stringify(defaultArtist));
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
    eraseCookie("framehouse_auth_token");
    setCurrentArtist(null);
  }, []);


  const updateProfile = useCallback((updates: Partial<OriginalArtist>) => {
    setCurrentArtist(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(`framehouse_artist_details_${prev.id}`, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateWorkTitle = useCallback((workId: string | number, newTitle: string) => {
    setUserWorks(prevWorks =>
      prevWorks.map((w) => (w.id === workId ? { ...w, title: newTitle } : w))
    );
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
      setUserWorks(prevWorks => {
        const nextWorks = [workWithMeta, ...prevWorks];
        sessionStorage.setItem(`framehouse_user_works_${prevArtist.id}`, JSON.stringify(nextWorks));
        return nextWorks;
      });
      // NOTE: GRID_ITEMS is intentionally NOT mutated here.
      // The user's works are tracked exclusively in userWorks state.
      // Theatre pages that need to show the logged-in user's works should
      // read from AuthContext.userWorks instead of the global GRID_ITEMS array.
      return prevArtist;
    });
  }, []);

  const value = useMemo(() => ({
    currentArtist,
    userWorks,
    login,
    register,
    logout,
    updateProfile,
    updateWorkTitle,
    addWork,
  }), [currentArtist, userWorks, login, register, logout, updateProfile, updateWorkTitle, addWork]);

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
