import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Set } from "@/types";

interface SetResponseItem {
  id: string;
  title: string;
  description?: string;
  captainId?: string;
  coverImage?: string;
  accentColor?: string;
  themeLine?: string;
  memberCount?: number;
  totalFestivals?: number;
  liveFestivals?: number;
  isMember?: boolean;
  activeFestivalId?: string;
  festivalStatus?: string;
}

interface PaginationMeta {
  page?: number;
  limit?: number;
  totalCount?: number;
  hasMore?: boolean;
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
          const rawList: SetResponseItem[] = json.data ?? [];

          const mapped: Set[] = rawList.map((s) => ({
            id: s.id,
            title: s.title || "Untitled Set",
            description: s.description || "",
            captainId: s.captainId || "c1",
            coverImage: s.coverImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675",
            accentColor: s.accentColor || "#D97706",
            themeLine: s.themeLine || "",
            members: [],
            memberCount: s.memberCount ?? 0,
            totalFestivals: s.totalFestivals ?? 0,
            liveFestivals: s.liveFestivals ?? 0,
            isMember: s.isMember ?? false,
            activeFestivalId: s.activeFestivalId,
            festivalStatus: s.festivalStatus === "LIVE" ? "ONGOING" : undefined,
          }));

          const meta: PaginationMeta | undefined = json.meta;
          const serverHasMore = meta ? (meta.hasMore ?? false) : rawList.length >= pageSize;
          const serverTotal = meta ? (meta.totalCount ?? mapped.length) : mapped.length;

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
