import { motion, AnimatePresence } from "motion/react";
import { Plus, X, User, Briefcase, Camera } from "lucide-react";

interface Person {
  actorName: string;
  characterName: string;
  imageUrl: string;
}

interface CreationCastSectionProps {
  stars: Person[];
  makers: Person[];
  onStarsChange: (val: Person[]) => void;
  onMakersChange: (val: Person[]) => void;
}

export function CreationCastSection({ 
  stars, 
  makers, 
  onStarsChange, 
  onMakersChange 
}: CreationCastSectionProps) {

  const addPerson = (type: "stars" | "makers") => {
    const newPerson: Person = { actorName: "", characterName: "", imageUrl: "" };
    if (type === "stars") onStarsChange([...stars, newPerson]);
    else onMakersChange([...makers, newPerson]);
  };

  const updatePerson = (type: "stars" | "makers", index: number, field: keyof Person, value: string) => {
    if (type === "stars") {
      const updated = [...stars];
      updated[index] = { ...updated[index], [field]: value };
      onStarsChange(updated);
    } else {
      const updated = [...makers];
      updated[index] = { ...updated[index], [field]: value };
      onMakersChange(updated);
    }
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
            <button 
                onClick={() => addPerson("stars")}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
            >
                <Plus className="w-3 h-3" /> Add Lead
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
                {stars.map((person, idx) => (
                    <PersonRow 
                        key={`star-${idx}`} 
                        person={person} 
                        onChange={(f, v) => updatePerson("stars", idx, f, v)}
                        onRemove={() => removePerson("stars", idx)}
                        placeholderName="Actor Name"
                        placeholderRole="Character"
                    />
                ))}
            </AnimatePresence>
            {!stars.length && <EmptyState label="No stars added" icon={<User className="w-5 h-5" />} />}
          </div>
        </div>

        {/* Makers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/70">
                <Briefcase className="w-3.5 h-3.5 text-white/40" /> Makers
            </h3>
            <button 
                onClick={() => addPerson("makers")}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
            >
                <Plus className="w-3 h-3" /> Add Crew
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
                {makers.map((person, idx) => (
                    <PersonRow 
                        key={`maker-${idx}`} 
                        person={person} 
                        onChange={(f, v) => updatePerson("makers", idx, f, v)}
                        onRemove={() => removePerson("makers", idx)}
                        placeholderName="Name"
                        placeholderRole="Role (e.g. Director)"
                    />
                ))}
            </AnimatePresence>
            {!makers.length && <EmptyState label="No makers added" icon={<Camera className="w-5 h-5" />} />}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function PersonRow({ 
    person, 
    onChange, 
    onRemove,
    placeholderName,
    placeholderRole
}: { 
    person: Person, 
    onChange: (f: keyof Person, v: string) => void, 
    onRemove: () => void,
    placeholderName: string,
    placeholderRole: string
}) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group flex flex-col md:flex-row gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
        >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                    type="text" 
                    placeholder={placeholderName}
                    value={person.actorName}
                    onChange={(e) => onChange("actorName", e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs font-bold focus:border-white/20 outline-none transition-all placeholder:text-white/10 uppercase tracking-widest"
                />
                <input 
                    type="text" 
                    placeholder={placeholderRole}
                    value={person.characterName}
                    onChange={(e) => onChange("characterName", e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-xs font-medium focus:border-white/20 outline-none transition-all placeholder:text-white/10 font-mono"
                />
            </div>
            <div className="flex items-center gap-3">
                <input 
                    type="text" 
                    placeholder="Portrait URL"
                    value={person.imageUrl}
                    onChange={(e) => onChange("imageUrl", e.target.value)}
                    className="flex-[2] bg-white/5 border border-white/5 rounded-lg px-4 py-2 text-[10px] font-mono focus:border-white/20 outline-none transition-all placeholder:text-white/10 truncate"
                />
                <button 
                    onClick={onRemove}
                    className="p-2 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
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
