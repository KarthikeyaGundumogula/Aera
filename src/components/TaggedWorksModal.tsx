import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LedgerItem, LedgerTaggedWork } from "../mock/ledger";
import { WallPostCard } from "../features/profile/components/WallPostCard";
import { WallPost } from "../types/wall";
import { TheatreItem } from "../types/theatre";

interface TaggedWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: LedgerItem;
  originalName?: string;
  taggedWorks?: LedgerTaggedWork[];
}

export function TaggedWorksModal({
  isOpen,
  onClose,
  entry,
  originalName,
  taggedWorks,
}: TaggedWorksModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const title = entry?.originalName || originalName || "Original";
  const worksList =
    entry?.taggedWorks && entry.taggedWorks.length > 0
      ? entry.taggedWorks
      : taggedWorks && taggedWorks.length > 0
      ? taggedWorks
      : [
          {
            id: "tw-1",
            type: "hype_cut" as const,
            thumbnailUrl: entry?.originalPosterUrl || "/posters/og.jpeg",
            authorName: "FireEdits",
            platform: "YouTube",
          },
          {
            id: "tw-2",
            type: "poster" as const,
            thumbnailUrl: entry?.originalPosterUrl || "/posters/rrr.jpeg",
            authorName: "Studio CineArts",
            platform: "Instagram",
          },
          {
            id: "tw-3",
            type: "hype_cut" as const,
            thumbnailUrl: entry?.originalPosterUrl || "/posters/kgf.jpeg",
            authorName: "Mass Cutz",
            platform: "YouTube",
          },
        ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-[#09090b] border border-white/15 rounded-3xl p-5 sm:p-6 space-y-5 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Tagged Works
                </h3>
                <p className="text-[10px] font-mono text-amber-400/80">
                  {title} • {worksList.length} Works Linked
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Works Feed (Wall Post Cards Design) */}
          <div className="space-y-4 overflow-y-auto no-scrollbar pr-1 flex-1">
            {worksList.map((work) => {
              const mockPost: WallPost = {
                id: `post-tw-${work.id}`,
                artistId: "fh-001",
                artistName: work.authorName,
                artistImage: work.thumbnailUrl,
                type: "PIN_WORK",
                text: `Tagged ${work.type === "hype_cut" ? "Hype Cut Edit" : "Fan Poster"} for ${title}`,
                pinnedWorkId: work.srcId || work.id,
                postedAt: "Tagged Work",
              };

              const resolvedWork: TheatreItem = {
                id: work.srcId || work.id,
                title: `${title} — ${work.type === "hype_cut" ? "Hype Cut" : "Poster"}`,
                image: work.thumbnailUrl,
                category: work.type === "hype_cut" ? "Edit" : "Poster",
                artist: work.authorName,
              };

              return (
                <div key={work.id} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                  <WallPostCard
                    post={mockPost}
                    resolvedWork={resolvedWork}
                    onClick={() => {
                      onClose();
                      navigate(work.srcId ? `/works/${work.srcId}` : `/works`);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
