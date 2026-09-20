import { useState, useEffect } from "react";
import { Youtube } from "lucide-react";
import { RecentReleasesSection } from "../../shared/components/RecentReleasesSection";
import { apiFetch } from "@/lib/api";

export function YoutubeReleasesSection() {
  const [releases, setReleases] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/works?category=EDIT&limit=10")
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const items = json.data ?? [];
          const mapped = items.map((w: any) => ({
            id: w.id,
            title: w.title || "Untitled Release",
            srcId: w.srcId || w.id,
            platform: (w.platform || "youtube").toUpperCase(),
            artist: w.artistName || "Official Release",
            category: "EDIT",
          }));
          setReleases(mapped);
        }
      })
      .catch((err) => {
        console.error("[YoutubeReleasesSection] Failed to fetch edit releases:", err);
      });
  }, []);

  if (releases.length === 0) return null;

  return (
    <RecentReleasesSection
      title="Top Releases this Week"
      icon={Youtube}
      works={releases}
      className=""
      headerClassName="mb-5 opacity-100"
    />
  );
}
