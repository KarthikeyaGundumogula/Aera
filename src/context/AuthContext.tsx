import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { OriginalArtist, TheatreItem } from "../types";
import { ARTISTS_MOCK, GRID_ITEMS } from "../mock";

// Helper functions to manage cookies client-side.
// NOTE: In production, the backend sets this cookie with the HttpOnly, Secure, and SameSite flags.
// Client-side JavaScript cannot read or write HttpOnly cookies. We use document.cookie here
// solely to simulate the browser's cookie lifecycle (automatic persistence and transmission)
// in our static mock client application.
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
  login: (username: string, password?: string) => boolean;
  register: (artist: OriginalArtist) => void;
  logout: () => void;
  updateProfile: (updates: Partial<OriginalArtist>) => void;
  updateWorkTitle: (workId: string | number, newTitle: string) => void;
  addWork: (work: TheatreItem) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentArtist, setCurrentArtist] = useState<OriginalArtist | null>(null);
  const [userWorks, setUserWorks] = useState<TheatreItem[]>([]);

  // Simulated Boot / Session Check
  // In production, this resolves to a request like GET /api/auth/me where the server reads the HttpOnly cookie.
  useEffect(() => {
    const token = getCookie("aera_auth_token");
    if (token) {
      const payload = parseMockJwt(token);
      if (payload) {
        // Find existing artist in mock list or fallback to a custom session-created artist
        let artist = ARTISTS_MOCK.find((a) => a.id === payload.id);
        if (!artist) {
          // If they were registered dynamically during this session, recover from sessionStorage storage
          const savedArtist = sessionStorage.getItem(`aera_artist_details_${payload.id}`);
          if (savedArtist) {
            artist = JSON.parse(savedArtist);
          } else {
            artist = {
              id: payload.id,
              name: payload.username,
              image: "",
              presence: 100,
              works: 0,
              bio: "Cinematic Visionary",
              themeBgColor: "#0f1a42",
              themeTextColor: "#fac107",
            };
          }
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

    const savedWorksKey = `aera_user_works_${currentArtist.id}`;
    const savedWorks = sessionStorage.getItem(savedWorksKey);
    if (savedWorks) {
      setUserWorks(JSON.parse(savedWorks));
    } else {
      const initialWorks = GRID_ITEMS.filter(
        (w) => w.artistId === currentArtist.id || w.artist === currentArtist.name
      );
      setUserWorks(initialWorks);
      sessionStorage.setItem(savedWorksKey, JSON.stringify(initialWorks));
    }
  }, [currentArtist]);

  const login = useCallback((username: string, _password?: string): boolean => {
    const cleanUsername = username.trim();
    let artist = ARTISTS_MOCK.find(
      (a) => a.name.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (!artist) {
      const base = ARTISTS_MOCK[0] || {
        id: "art-custom",
        name: cleanUsername,
        image: "",
        presence: 100,
        works: 0,
        bio: "Cinematic Visionary",
      };
      artist = {
        ...base,
        id: `art-${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: cleanUsername,
      };
    }

    if (!artist.themeBgColor) artist.themeBgColor = "#0f1a42";
    if (!artist.themeTextColor) artist.themeTextColor = "#fac107";

    // Simulate backend setting HttpOnly cookie containing JWT
    const token = generateMockJwt(artist.id, artist.name);
    setCookie("aera_auth_token", token);

    setCurrentArtist(artist);
    return true;
  }, []);

  const register = useCallback((artist: OriginalArtist) => {
    const defaultArtist = {
      ...artist,
      themeBgColor: artist.themeBgColor || "#0f1a42",
      themeTextColor: artist.themeTextColor || "#fac107",
    };

    sessionStorage.setItem(`aera_artist_details_${defaultArtist.id}`, JSON.stringify(defaultArtist));

    const token = generateMockJwt(defaultArtist.id, defaultArtist.name);
    setCookie("aera_auth_token", token);

    setCurrentArtist(defaultArtist);
  }, []);

  const logout = useCallback(() => {
    eraseCookie("aera_auth_token");
    setCurrentArtist(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<OriginalArtist>) => {
    setCurrentArtist(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      sessionStorage.setItem(`aera_artist_details_${prev.id}`, JSON.stringify(updated));
      const mockIdx = ARTISTS_MOCK.findIndex((a) => a.id === prev.id);
      if (mockIdx > -1) {
        ARTISTS_MOCK[mockIdx] = { ...ARTISTS_MOCK[mockIdx], ...updates };
      }
      return updated;
    });
  }, []);

  const updateWorkTitle = useCallback((workId: string | number, newTitle: string) => {
    setUserWorks(prevWorks => {
      const nextWorks = prevWorks.map((w) =>
        w.id === workId ? { ...w, title: newTitle } : w
      );
      const globalIdx = GRID_ITEMS.findIndex((w) => w.id === workId);
      if (globalIdx > -1) {
        GRID_ITEMS[globalIdx].title = newTitle;
      }
      return nextWorks;
    });
  }, []);

  const addWork = useCallback((work: TheatreItem) => {
    setCurrentArtist(prevArtist => {
      if (!prevArtist) return prevArtist;
      const workWithMeta = {
        ...work,
        artistId: prevArtist.id,
        artist: prevArtist.name,
        artistAvatar: prevArtist.image || undefined,
      };
      setUserWorks(prevWorks => {
        const nextWorks = [workWithMeta, ...prevWorks];
        sessionStorage.setItem(`aera_user_works_${prevArtist.id}`, JSON.stringify(nextWorks));
        return nextWorks;
      });
      GRID_ITEMS.unshift(workWithMeta);
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
