import { useState } from "react";
import { Heart, Zap, Flame, Star, Sparkles, GitCommit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThoughtItem } from "../../../mock/thoughts";
import { ARTISTS_MOCK } from "../../../mock";
import { ArtistProfile } from "../profile";

export function ThoughtCard({ 
  thought, 
  onCardClick 
}: { 
  thought: ThoughtItem; 
  onCardClick?: () => void; 
}) {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  
  // Find artist data from mock pool
  const artistData = ARTISTS_MOCK.find(
    (a) => a.name.toLowerCase() === thought.authorName.toLowerCase()
  ) || ARTISTS_MOCK[0];

  const REACTION_MAP = {
    heart: { Icon: Heart, color: "text-rose-500" },
    zap: { Icon: Zap, color: "text-yellow-500" },
    flame: { Icon: Flame, color: "text-orange-500" },
    star: { Icon: Star, color: "text-amber-400" },
    sparkles: { Icon: Sparkles, color: "text-cyan-400" },
  };

  return (
    <>
      <div 
        onClick={onCardClick}
        className={`relative flex-shrink-0 w-80 sm:w-96 h-48 rounded-xl overflow-hidden bg-[#050505] border border-white/10 flex flex-col justify-between group ${
          onCardClick ? "cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]" : ""
        }`}
      >
        <div className="relative z-10 p-6 flex flex-col h-full justify-between gap-4">
          {/* The Thought (Script Fragment as a quote) */}
          <p className="font-mono text-sm leading-relaxed text-white/90 whitespace-pre-wrap overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            "{thought.text}"
          </p>
          
          <div className="flex items-end justify-between mt-auto">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors" title="Threads">
                <GitCommit className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-sans">{thought.threadCount || 0}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors group/reactions cursor-default">
                <div className="flex -space-x-1.5">
                  {(thought.topReactions || ["heart"]).map((r, i) => {
                    const mapped = REACTION_MAP[r as keyof typeof REACTION_MAP];
                    if (!mapped) return null;
                    const { Icon, color } = mapped;
                    return (
                      <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full bg-[#111] border border-[#222] flex items-center justify-center relative shadow-sm`}
                        style={{ zIndex: 10 - i }}
                      >
                        <Icon className={`w-2.5 h-2.5 ${color}`} />
                      </div>
                    );
                  })}
                </div>
                <span className="text-[10px] font-bold font-sans">{thought.reactionCount || 0}</span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                {thought.setName && thought.setId ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sets/${thought.setId}`);
                    }}
                    className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors duration-200 cursor-pointer"
                  >
                    // {thought.setName}
                  </button>
                ) : null}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfile(true);
                  }}
                  className="text-[11px] font-sans font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  - {thought.authorName}
                </button>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{thought.timestamp}</span>
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

