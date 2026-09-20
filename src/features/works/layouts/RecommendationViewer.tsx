import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";
import { ViewerFrame } from "./ViewerFrame";
import { RecommendationCard } from "../../../components/RecommendationCard";
import { apiFetch } from "@/lib/api";

interface RecommendationViewerProps {
  item: TheatreItem;
}

export function RecommendationViewer({ item }: RecommendationViewerProps) {
  const [rec, setRec] = useState<any>((item as any)?.raw || (item as any)?.rec || null);

  useEffect(() => {
    if (rec) return;
    const recId = item.recId || String(item.id).replace(/^rec-/, "");
    if (!recId) return;
    apiFetch(`/library/recommendations`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          const found = list.find((r: any) => String(r.id) === String(recId));
          if (found) setRec(found);
        }
      })
      .catch((err) => {
        console.error("[RecommendationViewer] Failed to fetch recommendation detail:", err);
      });
  }, [item.recId, item.id, rec]);

  const workData: any = {
    id: String(item.id),
    title: item.title,
    category: "RECOMMENDATION",
    stars: 0,
    artist: {
      id: item.artistId || (rec as any)?.artist?.id || "",
      stageName: item.artist || (rec as any)?.artist?.stageName || (rec as any)?.artist?.name || "",
      userName: item.artist || (rec as any)?.artist?.handle || (rec as any)?.artist?.stageName || "",
      profilePicture: item.artistAvatar || (rec as any)?.artist?.profilePicture || "",
      favoritesCount: 0,
      spirit: (rec as any)?.artist?.spirit ?? 0,
    },
    originals: [],
  };

  return (
    <ViewerFrame
      work={workData}
      showIdentityBlock={false}
      mediaMaxWidth="min(600px,calc(100vw-2rem))"
      mediaSlot={() => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {rec ? (
            <RecommendationCard rec={rec} variant="modal" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                Recommendation
              </p>
              <h1 className="text-2xl font-bold text-white/70 leading-tight">
                {item.title || "Untitled"}
              </h1>
              <p className="text-[10px] text-white/25">No resonance data available.</p>
            </div>
          )}
        </motion.div>
      )}
    />
  );
}
