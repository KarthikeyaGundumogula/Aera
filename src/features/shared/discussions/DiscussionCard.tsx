import { useState } from "react";
import { GitCommit, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DiscussionItem } from "../../../types/discussions";
const ARTISTS_MOCK: any[] = [];
import { ArtistProfile } from "../profile";
import { EmbeddedWorkBox } from "../../../components/EmbeddedWorkBox";

export interface DiscussionCardProps {
  thought?: DiscussionItem;
  discussion?: DiscussionItem;
  onCardClick?: () => void;
}

function formatDiscussionTime(raw?: string): string {
  if (!raw) return "Recent";
  if (!raw.includes("T") && !raw.includes("-")) return raw;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DiscussionCard({
  thought: rawThought,
  discussion: rawDiscussion,
  onCardClick,
}: DiscussionCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const item = rawDiscussion || rawThought;
  if (!item) return null;

  const authorName = item.authorName || "Artist";
  const authorAvatar = item.authorAvatar || "";
  const authorId = item.authorId || "";
  const artistData = {
    id: authorId || "artist",
    name: authorName,
    image: authorAvatar,
    spirit: 0,
    works: 0,
    bio: "Artist",
  };

  const title = item.title || "Set Discussion";
  const bodyText = item.body || "";
  const threadCount = item.commentCount ?? 0;
  const displayTime = formatDiscussionTime(item.createdAt);
  const setId = item.setId;
  const setName = item.setName;

  return (
    <>
      <div
        onClick={onCardClick}
        className={`relative flex-shrink-0 w-80 sm:w-96 h-64 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all flex flex-col justify-between group ${
          onCardClick ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""
        }`}
      >
        <div className="relative z-10 p-5 flex flex-col h-full justify-between overflow-hidden">
          {/* Header Badge */}
          <div className="flex items-center justify-between gap-2 shrink-0 mb-1">
            <div className="flex items-center gap-1.5 text-amber-500/90 shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Discussion
              </span>
            </div>
            {setName && setId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sets/${setId}`);
                }}
                className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors duration-200 cursor-pointer truncate max-w-[140px]"
                title={setName}
              >
                //{setName}
              </button>
            )}
          </div>

          {/* Title & Body Content Area */}
          <div className="flex flex-col gap-1.5 min-w-0 flex-1 overflow-hidden justify-start">
            <h3
              className="font-sans font-black text-[15px] sm:text-base uppercase tracking-wide text-white group-hover:text-amber-400 transition-colors line-clamp-1 truncate shrink-0"
              title={title}
            >
              {title}
            </h3>

            {bodyText && (
              <p
                className={`font-mono text-[13px] leading-relaxed text-white/80 whitespace-pre-wrap overflow-hidden ${
                  item.work ? "line-clamp-3" : "line-clamp-4"
                }`}
              >
                "{bodyText}"
              </p>
            )}

            {/* Optional Embedded Work Preview — Docks above partition line with exact 1px gap */}
            {item.work && (
              <div className="mt-auto mb-[1px] shrink-0">
                <EmbeddedWorkBox work={item.work} variant="compact" />
              </div>
            )}
          </div>

          {/* Footer Stats & Author Info */}
          <div className="flex items-center justify-between shrink-0 pt-2.5 border-t border-white/[0.05]">
            {/* Stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div
                className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors"
                title="Threads"
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-sans">
                  {threadCount}
                </span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfile(true);
                }}
                className="text-[10px] font-sans font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors duration-200 cursor-pointer truncate max-w-[120px]"
                title={authorName}
              >
                - {authorName}
              </button>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 shrink-0">
                • {displayTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showProfile && (
        <ArtistProfile artist={artistData} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
