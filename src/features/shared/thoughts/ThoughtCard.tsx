import { useState } from "react";
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

  return (
    <>
      <div 
        onClick={onCardClick}
        className={`relative flex-shrink-0 w-80 sm:w-96 h-44 rounded-xl overflow-hidden bg-[#050505] border border-white/10 flex flex-col justify-center group ${
          onCardClick ? "cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]" : ""
        }`}
      >
        <div className="relative z-10 p-6 flex flex-col gap-4">
          {/* The Thought (Script Fragment as a quote) */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-sm leading-relaxed text-white/90 whitespace-pre-wrap overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
              "{thought.text}"
            </p>
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

