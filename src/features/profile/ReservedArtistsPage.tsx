import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Instagram, Twitter, Youtube, X } from "lucide-react";
import { ARTISTS_MOCK } from "../../mock";
import { AnimatePresence, motion } from "motion/react";
import { OriginalArtist } from "../../types";

export default function ReservedArtistsPage() {
  const navigate = useNavigate();
  const [selectedArtist, setSelectedArtist] = useState<OriginalArtist | null>(null);

  // Mocking one as already claimed
  const claimedIds = ["fh-001"];

  const handleClaimClick = (artist: OriginalArtist) => {
    if (claimedIds.includes(artist.id)) return;
    setSelectedArtist(artist);
  };

  const getSocialsList = (socials: OriginalArtist["socials"]) => {
    if (!socials) return "your socials";
    const platforms = Object.entries(socials)
      .filter(([_, val]) => !!val)
      .map(([key, val]) => `${key} (${val})`);
    
    if (platforms.length === 0) return "your socials";
    return platforms.join(", ");
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex flex-col items-center py-24 font-sans selection:bg-white selection:text-black">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 left-6 group flex items-center gap-3 w-fit text-white/40 hover:text-white/70 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Back
        </span>
      </button>

      <div className="text-center mb-16 max-w-2xl px-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-[-0.02em] mb-4">
          Reserved <span className="text-white/30">Stages</span>
        </h1>
        <p className="text-white/40 text-xs tracking-widest uppercase leading-relaxed">
          We've handpicked and reserved profiles for select visionary artists. Check if your stage is waiting for you below.
        </p>
      </div>

      <div className="w-full max-w-3xl px-6 flex flex-col gap-4">
        {ARTISTS_MOCK.map((artist) => {
          const isClaimed = claimedIds.includes(artist.id);
          
          return (
            <div 
              key={artist.id}
              className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                  <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider">{artist.name}</span>
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
                      @{artist.id}
                    </span>
                  </div>
                  
                  {/* Socials Row */}
                  <div className="flex items-center gap-3 text-white/30">
                    {artist.socials?.instagram && <Instagram className="w-3 h-3" />}
                    {artist.socials?.twitter && <Twitter className="w-3 h-3" />}
                    {artist.socials?.youtube && <Youtube className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {isClaimed ? (
                <div className="px-5 py-2 bg-white/10 text-white/40 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                  <Check className="w-3 h-3" />
                  Claimed
                </div>
              ) : (
                <button
                  onClick={() => handleClaimClick(artist)}
                  className="px-6 py-2.5 bg-white text-black hover:bg-white/90 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                >
                  Claim
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedArtist(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0b0c10] border border-white/10 rounded-3xl p-8 text-center shadow-2xl"
            >
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-6 border-2 border-white/10">
                <img src={selectedArtist.image} alt={selectedArtist.name} className="w-full h-full object-cover" />
              </div>

              <h2 className="text-xl font-black uppercase tracking-widest mb-3">
                {selectedArtist.name}
              </h2>
              
              <p className="text-white/60 text-xs leading-relaxed mb-8">
                We have already reached out or will reach out to you directly on <br />
                <span className="text-white font-bold mt-2 inline-block leading-loose">
                  {getSocialsList(selectedArtist.socials)}
                </span>
                <br /><br />
                Please check your messages to complete the stage claim process.
              </p>

              <button
                onClick={() => setSelectedArtist(null)}
                className="w-full py-4 bg-white text-black hover:bg-white/90 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
