import { memo, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Original } from "@/types";
import { OriginalPosterCard } from "./OriginalPosterCard";

export const TopOriginalsAccordion = memo(function TopOriginalsAccordion({
  navigate,
}: {
  navigate: (path: string) => void;
}) {
  const [topOriginals, setTopOriginals] = useState<Original[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiFetch("/originals?limit=12")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const rawList = json.data ?? [];
          if (isMounted) {
            const mapped: Original[] = rawList.map((og: any) => ({
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
            setTopOriginals(mapped);
          }
        }
      })
      .catch((err) => {
        console.error("[TopOriginalsAccordion] Failed to fetch originals:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
          Loading Originals…
        </span>
      </div>
    );
  }

  if (topOriginals.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full gap-3 sm:gap-4 md:gap-5 px-6 md:px-12 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 items-stretch">
      {topOriginals.map((org, index) => (
        <div
          key={org.id}
          className="w-[145px] sm:w-[175px] md:w-[205px] lg:w-[220px] shrink-0 snap-start"
        >
          <OriginalPosterCard
            original={org}
            index={index}
            onClick={() => navigate(`/originals/${org.id}`)}
          />
        </div>
      ))}
    </div>
  );
});

