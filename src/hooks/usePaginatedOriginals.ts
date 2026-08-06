import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ORIGINALS } from "@/mock";
import { Original } from "@/types";

export type OriginalItem = Original;

interface FetchOriginalsResponse {
  success: boolean;
  data?: Array<{
    id: string;
    title: string;
    coverImage?: string | null;
    cover_image?: string | null;
    releaseDate?: string | null;
    release_date?: string | null;
    director?: string | null;
    castPreview?: string | null;
    cast_preview?: string | null;
  }>;
  items?: Array<{
    id: string;
    title: string;
    coverImage?: string | null;
    cover_image?: string | null;
    releaseDate?: string | null;
    release_date?: string | null;
    director?: string | null;
    castPreview?: string | null;
    cast_preview?: string | null;
  }>;
  meta: {
    totalCount?: number;
    total_count?: number;
    nextCursor?: string | null;
    next_cursor?: string | null;
  };
}

export function usePaginatedOriginals(pageSize = 12) {
  const [items, setItems] = useState<OriginalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
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
        const rawList = json.data || json.items || [];
        const metaTotal = json.meta?.totalCount ?? json.meta?.total_count ?? rawList.length;
        const metaNext = json.meta?.nextCursor ?? json.meta?.next_cursor ?? null;

        const mapped: OriginalItem[] = rawList.map((item) => ({
          id: item.id,
          title: item.title,
          description: "",
          coverImage: item.coverImage || item.cover_image || "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
          releaseDate: item.releaseDate || item.release_date || undefined,
          stats: { presence: 0, members: 0, releases: 0 },
          topArtists: [],
          works: [],
        }));

        if (mapped.length > 0) {
          setItems((prev) => (isInitial ? mapped : [...prev, ...mapped]));
          setNextCursor(metaNext);
          setHasMore(Boolean(metaNext));
          setTotalCount(metaTotal);
        } else {
          // If backend returns empty array, fallback to static mock data in dev
          if (isInitial) {
            setItems(ORIGINALS.slice(0, pageSize));
            setHasMore(ORIGINALS.length > pageSize);
            setTotalCount(ORIGINALS.length);
          }
        }
      } else {
        if (isInitial) {
          setItems(ORIGINALS.slice(0, pageSize));
          setHasMore(ORIGINALS.length > pageSize);
          setTotalCount(ORIGINALS.length);
        }
      }
    } catch {
      if (isInitial) {
        setItems(ORIGINALS.slice(0, pageSize));
        setHasMore(ORIGINALS.length > pageSize);
        setTotalCount(ORIGINALS.length);
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
