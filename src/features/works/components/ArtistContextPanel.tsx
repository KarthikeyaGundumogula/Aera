import React from "react";
import { motion } from "motion/react";
import { useWorkNavigation } from "../../../hooks/useWorkNavigation";
import { TheatreItem } from "../../../types";
import { WALL_POSTS } from "../../../mock/wall";
import { GRID_ITEMS, ARTISTS_MOCK } from "../../../mock";
import { Pin } from "lucide-react";

interface ArtistContextPanelProps {
  item: TheatreItem;
}

/**
 * ArtistContextPanel — Dedicated side panel for artist context.
 * Displays the artist's wall posts (lines) and other works (edits, posters, scripts)
 * in a vertically scrolling feed to give the viewer deep context on the artist.
 */
export function ArtistContextPanel({ item }: ArtistContextPanelProps) {
  const { openWork } = useWorkNavigation();
  
  const artistData = ARTISTS_MOCK.find((a) => a.name === item.artist);
  const artistId = item.artistId ?? artistData?.id ?? item.artist ?? "";

  // Get all wall posts for this artist
  const wallPosts = WALL_POSTS.filter(
    (p) => p.artistId === artistId || p.artistName === item.artist
  );

  // Get other works by this artist
  const otherWorks = GRID_ITEMS.filter(
    (w) =>
      String(w.id) !== String(item.id) &&
      (w.artist === item.artist || w.artistId === artistId)
  );
  
  return (
    <div className="w-full h-full bg-[#070706] lg:border-l lg:border-white/[0.04]">
      <div className="flex flex-col h-full lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#070706]/90 backdrop-blur-md px-6 py-5 border-b border-white/[0.04]">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            Artist Context
          </h2>
        </div>

        <div className="p-6 space-y-10 pb-20 lg:pb-10">
          
          {/* Section: The Wall */}
          {wallPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Pin size={10} className="text-white/20" />
                <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30">
                  From The Wall
                </h3>
              </div>
              
              <div className="space-y-6">
                {wallPosts.map((post) => (
                  <div key={post.id} className="pl-4 border-l border-white/8 relative">
                    <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-xl bg-white/10" />
                    
                    {post.type === "LINE" && post.text && (
                      <p className="text-[14px] text-white/55 leading-relaxed font-medium italic">
                        &ldquo;{post.text}&rdquo;
                      </p>
                    )}
                    
                    {post.type === "PIN_WORK" && (
                      <div className="space-y-3">
                        {post.text && (
                          <p className="text-[13px] text-white/45 leading-relaxed font-medium">
                            &ldquo;{post.text}&rdquo;
                          </p>
                        )}
                        {post.pinnedWorkId && (() => {
                          const w = GRID_ITEMS.find((w) => String(w.id) === post.pinnedWorkId);
                          if (!w) return null;
                          return (
                            <button
                              onClick={() => openWork(w)}
                              className="group relative w-full block rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04] active:scale-[0.97] transition-transform"
                            >
                              <div className={`relative w-full ${w.category?.toLowerCase() === 'edit' ? 'aspect-video' : 'aspect-[4/5]'}`}>
                                {w.image ? (
                                  <img
                                    src={w.image}
                                    alt={w.title || ""}
                                    className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{w.category}</span>
                                  </div>
                                )}
                                
                                {/* Gradient overlay for text legibility */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-16 pb-4 px-4 flex flex-col justify-end text-left">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/50 bg-black/40 px-2 py-1 rounded-xl backdrop-blur-md border border-white/10">
                                      {w.category || "Work"}
                                    </span>
                                  </div>
                                  <p className="text-[14px] font-bold text-white/95 truncate">{w.title || "Untitled"}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })()}
                      </div>
                    )}
                    
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mt-3">
                      {new Date(post.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Section: Other Works */}
          {otherWorks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">
                Works in Theatre
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {otherWorks.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => openWork(work)}
                    className="group relative rounded-xl overflow-hidden aspect-[3/4] active:scale-[0.97] transition-transform bg-white/[0.02]"
                  >
                    {work.image ? (
                      <img
                        src={work.image}
                        alt={work.title || ""}
                        className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{work.category}</span>
                      </div>
                    )}
                    
                    {/* Dark gradient overlay for text legibility */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-3 px-3 flex flex-col justify-end text-left">
                      <p className="text-[7.5px] font-black uppercase tracking-widest text-white/40 mb-1">{work.category}</p>
                      <p className="text-xs font-semibold text-white/90 truncate leading-tight w-full">{work.title || "Untitled"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
