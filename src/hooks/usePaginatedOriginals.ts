import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Original } from "@/types";

export type OriginalItem = Original;

interface FetchOriginalsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    releaseDate?: string | null;
    genre?: string[] | null;
    presence?: number | null;
    members?: number | null;
    director?: string | null;
    castPreview?: string | null;
  }>;
  meta?: {
    nextCursor?: string | null;
    totalCount?: number;
  };
}

export function usePaginatedOriginals(pageSize = 12) {
  const [items, setItems] = useState<OriginalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBatch = useCallback(async (cursor?: string) => {
    const isInitial = !cursor;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = cursor
        ? `/originals?limit=${pageSize}&cursor=${encodeURIComponent(cursor)}`
        : `/originals?limit=${pageSize}`;
      const res = await apiFetch(url);

      if (res.ok) {
        const json: FetchOriginalsResponse = await res.json();
        const rawList = json.data ?? [];
        const mapped: OriginalItem[] = rawList.map((og) => ({
          id: og.id,
          title: og.title,
          description: og.description || "",
          coverImage: og.coverImage || "",
          releaseDate: og.releaseDate || "",
          genre: og.genre || undefined,
          director: og.director || undefined,
          castPreview: og.castPreview || undefined,
          stats: {
            presence: og.presence ?? 0,
            members: og.members ?? 0,
            releases: 0,
          },
          topArtists: [],
          works: [],
        }));

        if (isInitial) setItems(mapped);
        else setItems((prev) => [...prev, ...mapped]);

        const next = json.meta?.nextCursor || null;
        setNextCursor(next);
        setHasMore(next !== null);
        setTotalCount(json.meta?.totalCount ?? mapped.length);
      } else {
        if (isInitial) {
          setItems([]);
          setHasMore(false);
          setTotalCount(0);
        }
      }
    } catch {
      if (isInitial) {
        setItems([]);
        setHasMore(false);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchBatch(nextCursor);
    }
  }, [fetchBatch, hasMore, loadingMore, nextCursor]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    refresh: () => fetchBatch(),
  };
}
