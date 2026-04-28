import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, User, Briefcase, Camera } from "lucide-react";
import { PersonSearchInput, CastMember } from "./PersonSearchInput";

interface CreationCastSectionProps {
  stars: CastMember[];
  makers: CastMember[];
  onStarsChange: (val: CastMember[]) => void;
  onMakersChange: (val: CastMember[]) => void;
}

export function CreationCastSection({ 
  stars, 
  makers, 
  onStarsChange, 
  onMakersChange 
}: CreationCastSectionProps) {
  const [addingType, setAddingType] = useState<"stars" | "makers" | null>(null);

  const handleSelect = (type: "stars" | "makers", member: CastMember) => {
    if (type === "stars") onStarsChange([...stars, member]);
    else onMakersChange([...makers, member]);
    setAddingType(null);
  };

  const removePerson = (type: "stars" | "makers", index: number) => {
    if (type === "stars") onStarsChange(stars.filter((_, i) => i !== index));
    else onMakersChange(makers.filter((_, i) => i !== index));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">III</div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">The Collective</h2>
      </div>

      <div className="space-y-16">
        {/* Stars Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/70">
                <User className="w-3.5 h-3.5 text-white/40" /> Stars
            </h3>
            {addingType !== "stars" && (
              <button 
                onClick={() => setAddingType("stars")}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
              >
                <Plus className="w-3 h-3" /> Add Lead
              </button>
            )}
          </div>

          {/* Selected Stars List */}
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {stars.map((person, idx) => (
                <SelectedPersonRow
                  key={`star-${person.profileId}-${idx}`}
                  person={person}
                  onRemove={() => removePerson("stars", idx)}
                />
              ))}
            </AnimatePresence>

            {/* Search Input */}
            <AnimatePresence>
              {addingType === "stars" && (
                <PersonSearchInput
                  type="STAR"
                  onSelect={(member) => handleSelect("stars", member)}
                  onCancel={() => setAddingType(null)}
                  placeholderRole="Character"
                />
              )}
            </AnimatePresence>

            {!stars.length && addingType !== "stars" && (
              <EmptyState label="No stars added" icon={<User className="w-5 h-5" />} />
            )}
          </div>
        </div>

        {/* Makers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/70">
                <Briefcase className="w-3.5 h-3.5 text-white/40" /> Makers
            </h3>
            {addingType !== "makers" && (
              <button 
                onClick={() => setAddingType("makers")}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
              >
                <Plus className="w-3 h-3" /> Add Crew
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {makers.map((person, idx) => (
                <SelectedPersonRow
                  key={`maker-${person.profileId}-${idx}`}
                  person={person}
                  onRemove={() => removePerson("makers", idx)}
                />
              ))}
            </AnimatePresence>

            {/* Search Input */}
            <AnimatePresence>
              {addingType === "makers" && (
                <PersonSearchInput
                  type="MAKER"
                  onSelect={(member) => handleSelect("makers", member)}
                  onCancel={() => setAddingType(null)}
                  placeholderRole="Role (e.g. Director)"
                />
              )}
            </AnimatePresence>

            {!makers.length && addingType !== "makers" && (
              <EmptyState label="No makers added" icon={<Camera className="w-5 h-5" />} />
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SelectedPersonRow({ 
  person, 
  onRemove 
}: { 
  person: CastMember;
  onRemove: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
    >
      {/* Profile chip */}
      <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
        {person.profilePicture ? (
          <img
            src={person.profilePicture}
            alt={person.actorName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-4 h-4 text-white/20" />
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center gap-4 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-tight text-white/80 truncate">
          {person.actorName}
        </span>
        {person.characterName && (
          <>
            <div className="h-3 w-px bg-white/10 flex-shrink-0" />
            <span className="text-[9px] font-mono text-white/30 truncate">
              {person.characterName}
            </span>
          </>
        )}
      </div>
      
      <button 
        onClick={onRemove}
        className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function EmptyState({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 opacity-10 grayscale border border-dashed border-white/10 rounded-2xl">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}
