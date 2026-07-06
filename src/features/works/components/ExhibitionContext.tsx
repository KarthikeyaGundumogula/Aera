import React, { useState } from "react";
import { motion } from "motion/react";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { TheatreItem, OriginalArtist } from "../../../types";
import { WALL_POSTS } from "../../../mock/wall";
import { GRID_ITEMS, ARTISTS_MOCK } from "../../../mock";
import { ArtistProfile } from "../../shared/profile";

interface ExhibitionContextProps {
  item: TheatreItem;
}

/**
 * ExhibitionContext — The context sections below the work hero.
 *
 * Three sections, all sharing the same dark field — no white cards, no borders:
 *   1. Artist — avatar + name as a clean identity row
 *   2. From the Wall — minimal text + pinned thumbnails, left-border accent
 *   3. More from the Theatre — horizontal scroll strip of work thumbnails
 *
 * Everything is visually subordinate to the work above.
 * Typography is quieter. Images have subtle hover lift.
 */
export function ExhibitionContext({ item }: ExhibitionContextProps) {
  const { openWork } = useWorkNavigation();
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);

  const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
  const artistId = item.artistId ?? artistData?.id ?? item.artist ?? "";

  const wallPosts = WALL_POSTS.filter(
    (p) => p.artistId === artistId || p.artistName === item.artist
  ).slice(0, 4);

  const moreWorks = GRID_ITEMS.filter(
    (w) =>
      String(w.id) !== String(item.id) &&
      (w.artist === item.artist || w.artistId === artistId) &&
      (w.category === "Edit" || w.category === "Poster" || w.category === "Script")
  ).slice(0, 8);

  const handleArtistClick = () => {
    setSelectedArtist(
      artistData || {
        id: String(item.id),
        name: item.artist || "Anonymous",
        spirit: 0,
        works: 0,
        image: item.artistAvatar || item.image || "",
      }
    );
  };

  return (
    <div className="w-full bg-[#070706]">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">

        {/* ── 1. Artist ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <button
            onClick={handleArtistClick}
            aria-label={`View ${item.artist || "artist"} profile`}
            className="relative h-11 w-11 rounded-xl shrink-0 overflow-hidden opacity-70 hover:opacity-100 transition-opacity duration-200 active:scale-95"
            style={{ touchAction: "manipulation" }}
          >
            {item.artistAvatar ? (
              <img
                src={item.artistAvatar}
                alt={item.artist || ""}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <span className="text-sm font-black text-white/35">
                  {(item.artist || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </button>
          <div className="min-w-0">
            <p className="text-[7.5px] font-black uppercase tracking-[0.5em] text-white/20 mb-1">Artist</p>
            <button
              onClick={handleArtistClick}
              className="text-sm font-semibold text-white/65 hover:text-white/90 transition-colors duration-150 truncate block"
            >
              {item.artist || "Unknown Artist"}
            </button>
          </div>
        </motion.div>

        {/* ── 2. From the Wall ────────────────────────────────────── */}
        {wallPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
          >
            <p className="text-[7.5px] font-black uppercase tracking-[0.5em] text-white/18 mb-5">
              From the Wall
            </p>
            <div className="space-y-3">
              {wallPosts.map((post) => (
                <div
                  key={post.id}
                  className="pl-3.5 border-l border-white/8 py-0.5"
                >
                  {post.type === "LINE" && post.text && (
                    <p className="text-[13px] text-white/48 leading-relaxed font-medium italic">
                      &ldquo;{post.text}&rdquo;
                    </p>
                  )}
                  {post.type === "PIN_WORK" && (
                    <div>
                      {post.text && (
                        <p className="text-[13px] text-white/40 leading-relaxed mb-3 font-medium">
                          &ldquo;{post.text}&rdquo;
                        </p>
                      )}
                      {post.pinnedWorkId && (() => {
                        const w = GRID_ITEMS.find((w) => String(w.id) === post.pinnedWorkId);
                        if (!w) return null;
                        return (
                          <button
                            onClick={() => openWork(w)}
                            className="flex items-center gap-3 group active:scale-[0.97] transition-transform w-fit"
                          >
                            {w.image && (
                              <img
                                src={w.image}
                                alt={w.title || ""}
                                className="w-11 h-7 rounded object-cover object-top opacity-55 group-hover:opacity-85 transition-opacity"
                                loading="lazy"
                                decoding="async"
                              />
                            )}
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors truncate">
                              {w.title || "Untitled"}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                  <p className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/18 mt-2">
                    {new Date(post.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 3. More from the Theatre ────────────────────────────── */}
        {moreWorks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <p className="text-[7.5px] font-black uppercase tracking-[0.5em] text-white/18 mb-5">
              More from the Theatre
            </p>
            <div
              className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-0 sm:px-0 pb-1"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {moreWorks.map((work) => (
                <button
                  key={work.id}
                  onClick={() => openWork(work)}
                  className="shrink-0 group relative overflow-hidden rounded-lg active:scale-[0.96] transition-transform"
                  style={{ scrollSnapAlign: "start", width: "clamp(100px, 25vw, 140px)", aspectRatio: "3/4" }}
                  aria-label={work.title || "View work"}
                >
                  {work.image ? (
                    <img
                      src={work.image}
                      alt={work.title || ""}
                      className="w-full h-full object-cover object-top opacity-65 group-hover:opacity-90 group-hover:scale-[1.04] transition-all duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/3 flex items-center justify-center">
                      <span className="text-[7px] font-black uppercase tracking-widest text-white/18">{work.category}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-6 pb-2 px-2">
                    <p className="text-[8px] font-bold text-white/65 truncate leading-tight">{work.title || "Untitled"}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <ArtistProfile artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
    </div>
  );
}
