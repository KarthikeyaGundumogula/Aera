import React from "react";
import { motion } from "motion/react";
import { TheatreItem } from "../../../types";
import { GRID_ITEMS, ARTISTS_MOCK } from "../../../mock";
import { buildMobileClusters } from "../../theatre/engine/mobileClusterBuilder";
import { MobileClusterView } from "../../theatre/components/mobile/MobileClusterView";
import { FeedContext } from "../../../context/FeedContext";

interface ArtistContextPanelProps {
  item: TheatreItem;
}

/**
 * ArtistContextPanel — Dedicated side panel for artist context.
 * Now simplified to only show the artist's other works in the Theatre.
 */
export function ArtistContextPanel({ item }: ArtistContextPanelProps) {
  const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
  const artistId = item.artistId ?? artistData?.id ?? item.artist ?? "";

  // Get other works by this artist
  const otherWorks = GRID_ITEMS.filter(
    (w) =>
      String(w.id) !== String(item.id) &&
      (w.artist === item.artist || w.artistId === artistId)
  );

  const otherWorksClusters = React.useMemo(() => {
    return buildMobileClusters(otherWorks).slice(0, 2);
  }, [otherWorks]);

  const otherWorksFlat = React.useMemo(() => {
    return otherWorksClusters.flatMap(c => c.slots.map(s => s.item).filter(Boolean) as TheatreItem[]);
  }, [otherWorksClusters]);
  
  if (otherWorks.length === 0) return null;

  return (
    <div className="w-full h-full bg-[#070706] lg:border-l lg:border-white/[0.04]">
      <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#070706]/90 backdrop-blur-md px-4 sm:px-6 py-5 border-b border-white/[0.04] flex items-center">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            Works in Theatre
          </h2>
        </div>

        <div className="p-6 space-y-10 pb-20 lg:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col border border-white/10 rounded-[20px] overflow-hidden bg-black/20">
              <FeedContext.Provider value={otherWorksFlat}>
                {otherWorksClusters.map((cluster) => (
                  <div key={cluster.id} style={{ height: "40dvh" }}>
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
