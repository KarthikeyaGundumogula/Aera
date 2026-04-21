import { useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, Hash } from "lucide-react";

interface CreationMetaSectionProps {
  releaseDate: string;
  genres: string[];
  onDateChange: (val: string) => void;
  onGenresChange: (val: string[]) => void;
}

export function CreationMetaSection({ 
  releaseDate, 
  genres, 
  onDateChange, 
  onGenresChange 
}: CreationMetaSectionProps) {
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    const tag = currentTag.trim();
    if (tag && !genres.includes(tag)) {
      onGenresChange([...genres, tag]);
    }
    setCurrentTag("");
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    onGenresChange(genres.filter(t => t !== tag));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold">II</div>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Chronicle & Essence</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Release Date */}
        <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Release Date
            </label>
            <input
                type="date"
                value={releaseDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-xs font-bold focus:ring-2 focus:ring-white/10 focus:border-white/20 outline-none transition-all [color-scheme:dark] uppercase tracking-widest"
            />
        </div>

        {/* Genre Tags */}
        <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 ml-1 flex items-center gap-2">
                <Hash className="w-3 h-3" /> Genre Tags
            </label>
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Type and press Enter..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleKey}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 pr-12 text-xs font-bold focus:ring-2 focus:ring-white/10 focus:border-white/20 outline-none transition-all placeholder:text-white/10"
                    />
                    <button 
                        onClick={addTag}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                    <AnimatePresence>
                        {genres.map(genre => (
                            <motion.span
                                key={genre}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/70"
                            >
                                {genre}
                                <button onClick={() => removeTag(genre)} className="hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </div>
    </motion.section>
  );
}

// Inline Plus icon if not locally available or just import from lucide-react
import { Plus } from "lucide-react";
