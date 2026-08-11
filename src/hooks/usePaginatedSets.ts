import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
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
  totalFestivals?: number;
  total_festivals?: number;
  liveFestivals?: number;
  live_festivals?: number;
  isMember?: boolean;
  is_member?: boolean;
  activeFestivalId?: string;
  active_festival_id?: string;
  festivalStatus?: string;
  festival_status?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount?: number;
  total_count?: number;
  hasMore?: boolean;
  has_more?: boolean;
}

export function usePaginatedSets(pageSize = 10) {
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPage = useCallback(
    async (pageToFetch: number, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await apiFetch(`/sets?page=${pageToFetch}&limit=${pageSize}`);
        if (res.ok) {
          const json = await res.json();
          const rawList: SetResponseItem[] = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

          const mapped: Set[] = rawList.map((s) => ({
            id: s.id,
            title: s.title || "Untitled Set",
            description: s.description || "",
            captainId: s.captainId || s.captain_id || "c1",
            coverImage: s.coverImage || s.cover_image || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675",
            accentColor: s.accentColor || s.accent_color || "#D97706",
            themeLine: s.themeLine || s.theme_line || "",
            members: [],
            memberCount: s.memberCount ?? s.member_count ?? 0,
            totalFestivals: s.totalFestivals ?? s.total_festivals ?? 0,
            liveFestivals: s.liveFestivals ?? s.live_festivals ?? 0,
            isMember: s.isMember ?? s.is_member ?? false,
            activeFestivalId: s.activeFestivalId || s.active_festival_id,
            festivalStatus: (s.festivalStatus || s.festival_status) === "LIVE" ? "ONGOING" : undefined,
          }));

          const meta: PaginationMeta | undefined = json.meta;
          const serverHasMore = meta ? (meta.hasMore ?? meta.has_more ?? false) : rawList.length >= pageSize;
          const serverTotal = meta ? (meta.totalCount ?? meta.total_count ?? mapped.length) : mapped.length;

          setHasMore(serverHasMore);
          setTotalCount(serverTotal);
          setSets((prev) => (append ? [...prev, ...mapped] : mapped));
        } else {
          setSets([]);
          setHasMore(false);
        }
      } catch {
        setSets([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, true);
    }
  }, [fetchPage, hasMore, loadingMore, page]);

  return {
    sets,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh: () => {
      setPage(1);
      fetchPage(1, false);
    },
  };
}
