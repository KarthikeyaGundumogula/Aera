import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Users, Calendar, Info, Trash2, Plus, Check, Shield, User, Briefcase } from "lucide-react";
import { Original } from "../../../types";
import { STARS_MOCK, MAKERS_MOCK } from "../../../mock";
import { PersonSearchInput, CastMember } from "./creation/PersonSearchInput";

interface OriginalManagementModalProps {
  original: Original;
  onClose: () => void;
  onSave: (updated: Partial<Original>) => void;
}

type ManagementTab = "metadata" | "cast";

export function OriginalManagementModal({
  original,
  onClose,
  onSave,
}: OriginalManagementModalProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>("metadata");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Metadata State
  const [description, setDescription] = useState(original.description);
  const [releaseDate, setReleaseDate] = useState(original.releaseDate || "");

  // Cast State — hydrate from existing mock data into CastMember shape
  const [stars, setStars] = useState<CastMember[]>(
    STARS_MOCK.filter(s => s.originalId === original.id).map(s => ({
      profileId: `profile-${s.actorName.toLowerCase().replace(/[\s.]+/g, '-')}`,
      actorName: s.actorName,
      characterName: s.characterName,
      profilePicture: s.imageUrl,
    }))
  );
  const [makers, setMakers] = useState<CastMember[]>(
    MAKERS_MOCK.filter(m => m.originalId === original.id).map(m => ({
      profileId: `profile-${m.actorName.toLowerCase().replace(/[\s.]+/g, '-')}`,
      actorName: m.actorName,
      characterName: m.characterName,
      profilePicture: m.imageUrl,
    }))
  );

  const [addingType, setAddingType] = useState<"stars" | "makers" | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave({ description, releaseDate });
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#050505] border border-white/10 rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-400/60" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none mb-1">
                Stage Command
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
                Official Personnel & Meta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-8 py-4 gap-8 border-b border-white/5 bg-white/[0.01]">
          {(["metadata", "cast"] as ManagementTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-2 text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${
                activeTab === tab ? "text-white" : "text-white/20 hover:text-white/40"
              }`}
            >
              {tab === "metadata" ? "Metadata" : "Cast & Crew"}
              {activeTab === tab && (
                <motion.div
                  layoutId="mgmt-hub-indicator"
                  className="absolute -bottom-4 left-0 right-0 h-0.5 bg-white"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "metadata" ? (
              <motion.div
                key="meta-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1">
                    <Info className="w-3 h-3" /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white/80 leading-relaxed outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all resize-none min-h-[140px]"
                    placeholder="Enter Stage narrative..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 pl-1">
                    <Calendar className="w-3 h-3" /> Official Release
                  </label>
                  <input
                    type="text"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold uppercase tracking-widest text-white outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cast-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                {/* Stars Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
                      <User className="w-3.5 h-3.5" /> Stars
                    </label>
                    {addingType !== "stars" && (
                      <button 
                        onClick={() => setAddingType("stars")}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Lead
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {stars.map((person, idx) => (
                      <div
                        key={`star-${person.profileId}-${idx}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                          {person.profilePicture ? (
                            <img loading="lazy" src={person.profilePicture} alt={person.actorName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-white/20" /></div>
                          )}
                        </div>
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-tight text-white/80 truncate">{person.actorName}</span>
                          {person.characterName && (
                            <>
                              <div className="h-3 w-px bg-white/10 flex-shrink-0" />
                              <span className="text-[9px] font-mono text-white/30 truncate">{person.characterName}</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setStars(stars.filter((_, i) => i !== idx))}
                          className="p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <AnimatePresence>
                      {addingType === "stars" && (
                        <PersonSearchInput
                          type="STAR"
                          onSelect={(member) => { setStars([...stars, member]); setAddingType(null); }}
                          onCancel={() => setAddingType(null)}
                          placeholderRole="Character"
                        />
                      )}
                    </AnimatePresence>

                    {!stars.length && addingType !== "stars" && (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 opacity-20 border border-dashed border-white/10 rounded-2xl">
                        <Users className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">No stars added</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Makers Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
                      <Briefcase className="w-3.5 h-3.5" /> Makers
                    </label>
                    {addingType !== "makers" && (
                      <button 
                        onClick={() => setAddingType("makers")}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Crew
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {makers.map((person, idx) => (
                      <div
                        key={`maker-${person.profileId}-${idx}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex-1 flex items-center gap-4 min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-tight text-white/80 truncate">{person.actorName}</span>
                          {person.characterName && (
                            <>
                              <div className="h-3 w-px bg-white/10 flex-shrink-0" />
                              <span className="text-[9px] font-mono text-white/30 truncate">{person.characterName}</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setMakers(makers.filter((_, i) => i !== idx))}
                          className="p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <AnimatePresence>
                      {addingType === "makers" && (
                        <PersonSearchInput
                          type="MAKER"
                          onSelect={(member) => { setMakers([...makers, member]); setAddingType(null); }}
                          onCancel={() => setAddingType(null)}
                          placeholderRole="Role (e.g. Director)"
                        />
                      )}
                    </AnimatePresence>

                    {!makers.length && addingType !== "makers" && (
                      <div className="flex flex-col items-center justify-center gap-3 py-8 opacity-20 border border-dashed border-white/10 rounded-2xl">
                        <Users className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">No makers added</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Save Action */}
        <div className="p-8 pt-4 border-t border-white/5 bg-black/40">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className="w-full py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Commiting Changes...</span>
            ) : isSaved ? (
              <span className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" /> Personnel Synchronized
              </span>
            ) : (
              "Commit Changes"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
