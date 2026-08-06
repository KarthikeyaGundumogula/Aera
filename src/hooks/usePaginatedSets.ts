import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { SETS } from "@/mock";
import { Set } from "@/types";

interface SetResponseItem {
  id: string;
  title: string;
  description?: string;
  captainId?: string;
  captain_id?: string;
  coverImage?: string;
  cover_image?: string;
  accentColor?: string;
  accent_color?: string;
  themeLine?: string;
  theme_line?: string;
  memberCount?: number;
  member_count?: number;
  activeFestivalId?: string;
  active_festival_id?: string;
  festivalStatus?: string;
  festival_status?: string;
}

export function usePaginatedSets(pageSize = 10) {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/sets");
      if (res.ok) {
        const json = await res.json();
        const rawList: SetResponseItem[] = json.data || json.items || json.sets || (Array.isArray(json) ? json : []);
        const mapped: Set[] = rawList.map((s) => ({
          id: s.id,
          title: s.title || "Untitled Set",
          description: s.description || "",
          captainId: s.captainId || s.captain_id || "c1",
          coverImage: s.coverImage || s.cover_image || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675",
          accentColor: s.accentColor || s.accent_color || "#D97706",
          themeLine: s.themeLine || s.theme_line || "",
          members: [],
          activeFestivalId: s.activeFestivalId || s.active_festival_id,
          festivalStatus: (s.festivalStatus || s.festival_status) === "LIVE" ? "ONGOING" : undefined,
        }));

        setSets(mapped.length > 0 ? mapped : SETS);
      } else {
        setSets(SETS);
      }
    } catch {
      setSets(SETS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const paginatedSets = sets.slice(0, page * pageSize);
  const hasMore = paginatedSets.length < sets.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  return {
    sets: paginatedSets,
    loading,
    hasMore,
    totalCount: sets.length,
    loadMore,
    refresh: fetchSets,
  };
}
