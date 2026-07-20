import { motion } from "motion/react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { CURRENT_USER_MOCK, GRID_ITEMS, ORIGINALS } from "../../../mock";
import { mockLedger } from "../../../mock/ledger";
import { MOCK_RECOMMENDATIONS, Recommendation } from "../../../mock/recommendations";

interface MiniDossierSheetProps {
  originalId: string;
  profileId: string;
  onClose: () => void;
}

export function MiniDossierSheet({ originalId, profileId, onClose }: MiniDossierSheetProps) {
  const navigate = useNavigate();

  const ledgerEntry = mockLedger.find(
    (l) =>
      l.originalId === originalId &&
      (l.artistId === profileId || (!l.artistId && (profileId === "fh-001" || profileId === CURRENT_USER_MOCK.id)))
  );
  const original = ORIGINALS.find((o) => o.id === originalId);
  
  const recommendation = MOCK_RECOMMENDATIONS.find(
    (r: Recommendation) => r.original.id === originalId && r.artist.id === profileId
  );

  const works = GRID_ITEMS.filter(
    (w) => w.originalIds?.includes(originalId) && w.artistId === profileId
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md cursor-pointer"
      />
      
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[200] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{
          boxShadow: "0 -10px 40px rgba(0,0,0,0.8)",
        }}
      >
        {/* Drag Handle & Close */}
        <div className="flex justify-between items-center p-4 pb-0 shrink-0">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-4" />
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8 pb-6 md:pb-8 overflow-y-auto flex-1">
          {/* Top Half: Immediate Context (Ledger) */}
          <div className="mb-8">
            {ledgerEntry ? (
              <div className="flex flex-col gap-4">
                {ledgerEntry.surgeScore && (
                  <div className="flex items-end gap-2">
                    <span 
                      className="text-4xl md:text-5xl font-black tabular-nums tracking-tighter"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FDB931 25%, #E6C27A 50%, #B38728 75%, #FDF5A9 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {Math.round((ledgerEntry.surgeScore / (original?.resonanceSignature?.peakMagnitude || 10000)) * 100)}%
                    </span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5 md:mb-2">
                      Surge ({ledgerEntry.surgeScore.toLocaleString()} / {(original?.resonanceSignature?.peakMagnitude || 10000).toLocaleString()})
                    </span>
                  </div>
                )}
                
                {(ledgerEntry.afterThoughts || ledgerEntry.preThoughts) && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/ledger/${ledgerEntry.id}`);
                    }}
                    className="text-left w-full group cursor-pointer"
                  >
                    <p className="font-serif italic text-sm md:text-base text-white/80 leading-relaxed pl-3 border-l-2 border-[#D97706]/40 line-clamp-2 group-hover:text-white transition-colors">
                      {ledgerEntry.afterThoughts || ledgerEntry.preThoughts}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#D97706]/70 group-hover:text-[#D97706] mt-3 pl-3 transition-colors">
                      Read Full Review →
                    </p>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-white/40 text-[11px] font-sans font-bold uppercase tracking-widest">
                No Ledger Entry Found
              </p>
            )}
          </div>

          {/* Bottom Half: Dynamic Pills */}
          <div className="flex flex-col gap-3 pb-2">
            {recommendation && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/profile/${profileId}/recommendations/${originalId}`);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left flex justify-between items-center group cursor-pointer"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D97706] group-hover:text-amber-400 transition-colors">
                  Check Recommendations
                </span>
                <span className="text-white/40 text-[10px] font-bold">→</span>
              </button>
            )}

            {works.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  // For now, if there's exactly 1 work, we could route to it, else we might need a filtered view
                  navigate(`/works/${works[0].id}`);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left flex justify-between items-center group cursor-pointer"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">
                  View My Works ({works.length})
                </span>
                <span className="text-white/40 text-[10px] font-bold">→</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                navigate(`/originals/${originalId}`);
              }}
              className="w-full py-4 px-6 rounded-2xl bg-white text-black hover:bg-white/90 transition-all text-center flex justify-center items-center cursor-pointer mt-2"
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Enter Original Page
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}
