import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export interface SetMember {
  profileId: string;
  name: string;
  handle: string;
  avatar?: string | null;
  role: string;
  joinedAt: string;
}

export function useSetMemberSearch(
  setId: string | undefined,
  query: string,
  isOpen: boolean,
  debounceMs = 200
) {
  const [members, setMembers] = useState<SetMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !setId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const trimmed = query.trim();

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

      const endpoint = trimmed
        ? `/sets/${setId}/members/search?q=${encodeURIComponent(trimmed)}&limit=5`
        : `/sets/${setId}/members?limit=5`;

      apiFetch(endpoint, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.json();
        })
        .then((resData) => {
          if (!controller.signal.aborted && resData.success && Array.isArray(resData.data)) {
            setMembers(resData.data);
          }
        })
        .catch((err) => {
          if (!controller.signal.aborted && err.name !== "AbortError") {
            setError("Failed to fetch set members");
            console.warn("Set member search error:", err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, debounceMs);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [setId, isOpen, query, debounceMs]);

  return { members, loading, error };
}
