import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";
import { buildMobileClusters } from "../../theatre/engine/mobileClusterBuilder";
import { MobileClusterView } from "../../theatre/components/mobile/MobileClusterView";
import { FeedContext } from "../../../context/FeedContext";
import { SectionHeader } from "../../../components/SectionHeader";
import { apiFetch } from "@/lib/api";

interface ArtistContextPanelProps {
  artistId: string;
  currentWorkId: string | number;
}

export function ArtistContextPanel({ artistId, currentWorkId }: ArtistContextPanelProps) {
  const location = useLocation();
  const [artistWorks, setArtistWorks] = useState<TheatreItem[]>([]);
  const [isFallback, setIsFallback] = useState(false);

  // Check if feed items were passed via router location.state
  const locationState = location.state as { item?: TheatreItem; feedItems?: TheatreItem[] } | null;
  const feedItemsFromState = locationState?.feedItems;

  useEffect(() => {
    // If no feed items in state, fetch artist works from backend as fallback
    if (!feedItemsFromState || feedItemsFromState.length === 0) {
      if (artistId) {
        apiFetch(`/profiles/${artistId}/works?limit=20`)
          .then(async (res) => {
            if (res.ok) {
              const json = await res.json();
              const items: TheatreItem[] = json.data ?? [];
              const remaining = items.filter(
                (w) => String(w.id) !== String(currentWorkId)
              );
              if (remaining.length > 0) {
                setArtistWorks(items);
                setIsFallback(false);
                return;
              }
            }
            // If artist has no other works, fall back to theatre community works
            const theatreRes = await apiFetch(`/theatre?limit=20`);
            if (theatreRes.ok) {
              const theatreJson = await theatreRes.json();
              setArtistWorks(theatreJson.data ?? []);
              setIsFallback(true);
            }
          })
          .catch(async (err) => {
            console.error("[ArtistContextPanel] Failed to fetch artist works, trying fallback:", err);
            const theatreRes = await apiFetch(`/theatre?limit=20`).catch(() => null);
            if (theatreRes?.ok) {
              const theatreJson = await theatreRes.json();
              setArtistWorks(theatreJson.data ?? []);
              setIsFallback(true);
            }
          });
      } else {
        apiFetch(`/theatre?limit=20`)
          .then(async (theatreRes) => {
            if (theatreRes.ok) {
              const theatreJson = await theatreRes.json();
              setArtistWorks(theatreJson.data ?? []);
              setIsFallback(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [artistId, feedItemsFromState, currentWorkId]);

  // Memoize display works and section title
  const { displayWorks, sectionTitle } = React.useMemo(() => {
    let works: TheatreItem[] = [];
    let title = "Up Next in Feed";

    if (feedItemsFromState && feedItemsFromState.length > 0) {
      title = "Up Next in Feed";
      const currentIndex = feedItemsFromState.findIndex(
        (w) => String(w.id) === String(currentWorkId)
      );
      if (currentIndex !== -1) {
        const after = feedItemsFromState.slice(currentIndex + 1);
        const before = feedItemsFromState.slice(0, currentIndex);
        works = [...after, ...before].filter(
          (w) => String(w.id) !== String(currentWorkId)
        );
      } else {
        works = feedItemsFromState.filter(
          (w) => String(w.id) !== String(currentWorkId)
        );
      }
    } else if (artistWorks.length > 0) {
      works = artistWorks.filter(
        (w) => String(w.id) !== String(currentWorkId)
      );
      title = isFallback ? "Up Next" : "More From Artist";
    }

    return { displayWorks: works, sectionTitle: title };
  }, [feedItemsFromState, artistWorks, currentWorkId, isFallback]);

  const clusters = React.useMemo(() => {
    if (displayWorks.length === 0) return [];
    return buildMobileClusters(displayWorks).slice(0, 4);
  }, [displayWorks]);

  const flatWorks = React.useMemo(() => {
    return clusters.flatMap((c) => c.slots.map((s) => s.item).filter(Boolean) as TheatreItem[]);
  }, [clusters]);

  if (displayWorks.length === 0 || clusters.length === 0) return null;

  return (
    <div className="w-full h-full bg-[#070706] lg:border-l lg:border-white/[0.04]">
      <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#070706]/90 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center">
          <SectionHeader title={sectionTitle} />
        </div>

        <div className="pt-2 pb-20 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col w-full">
              <FeedContext.Provider value={flatWorks}>
                {clusters.map((cluster) => (
                  <div key={cluster.id} style={{ height: "40dvh" }} className="w-full">
                    <MobileClusterView cluster={cluster} />
                  </div>
                ))}
              </FeedContext.Provider>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
