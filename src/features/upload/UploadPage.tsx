import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { UploadStudioFlow } from "./components/UploadStudioFlow";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Original } from "@/types";

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentArtist, isLoading } = useAuth();
  const [initialOriginals, setInitialOriginals] = useState<Original[]>([]);

  const festivalId = searchParams.get("festivalId") || undefined;
  const setId = searchParams.get("setId") || undefined;
  const role = searchParams.get("role") || undefined;
  const originalId = searchParams.get("originalId") || undefined;

  useEffect(() => {
    let isMounted = true;
    apiFetch("/originals?limit=24")
      .then(async (res) => {
        if (res.ok && isMounted) {
          const json = await res.json();
          const items = json.data ?? [];
          const mapped: Original[] = items.map((o: any) => ({
            id: o.id,
            title: o.title || "Untitled Film",
            description: o.description || "",
            coverImage: o.coverImage || "",
            stats: { presence: 0, members: 0, releases: 0 },
            topArtists: [],
            works: [],
          }));
          setInitialOriginals(mapped);
        }
      })
      .catch((err) => {
        console.warn("[UploadPage] Failed to fetch initial originals:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && !currentArtist) {
    return <Navigate to="/profile/login" replace />;
  }

  const handleExit = () => {
    if (festivalId) {
      navigate(`/festivals/${festivalId}`);
    } else if (setId) {
      navigate(`/sets/${setId}`);
    } else {
      navigate("/studio");
    }
  };

  const handleComplete = () => {
    if (festivalId) {
      navigate(`/festivals/${festivalId}`);
    } else if (setId) {
      navigate(`/sets/${setId}`);
    } else {
      navigate("/studio");
    }
  };

  return (
    <UploadStudioFlow
      exitLabel={festivalId || setId ? "Cancel Release" : "Exit Studio"}
      headerEyebrow={festivalId ? "Festival Release" : setId ? "Set Release" : "The Studio Session"}
      title={"Initiate\nRelease"}
      onExit={handleExit}
      onComplete={handleComplete}
      originals={initialOriginals}
      initialOriginalIds={originalId ? [originalId] : []}
      originalId={originalId}
      festivalId={festivalId}
      setId={setId}
      role={role}
    />
  );
}
