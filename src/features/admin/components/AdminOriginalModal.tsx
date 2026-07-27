import { useState } from "react";
import { motion } from "motion/react";
import { Film, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface AdminOriginalModalProps {
  onSuccess?: () => void;
}

export function AdminOriginalModal({ onSuccess }: AdminOriginalModalProps) {
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("2026-07-27T00:00:00Z");
  const [description, setDescription] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [associatedWith, setAssociatedWith] = useState("");
  const [duration, setDuration] = useState("165 mins");
  const [certification, setCertification] = useState("UA");
  const [genres, setGenres] = useState("Action, Drama, Epic");
  const [password, setPassword] = useState("kApten@1023");

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coverImg.trim() || !associatedWith.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    const parsedGenres = genres.split(",").map((g) => g.trim()).filter(Boolean);

    try {
      const res = await apiFetch("/originals/new", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          release_date: releaseDate,
          description: description.trim() || "Cinematic Original Masterpiece",
          cover_img: coverImg.trim(),
          associated_with: associatedWith.trim(),
          genres: parsedGenres,
          password: password.trim(),
          duration: duration.trim() || undefined,
          certification: certification.trim() || undefined,
          stars: [],
          makers: [],
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ text: `Original "${title}" created successfully! ID: ${data.OriginalCreated || 'OK'}`, type: "success" });
        setTitle("");
        setCoverImg("");
        setAssociatedWith("");
        setDescription("");
        if (onSuccess) onSuccess();
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessage({ text: errData.message || `Failed to initiate Original (HTTP ${res.status})`, type: "error" });
      }
    } catch (err) {
      setMessage({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6 w-full max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
          <Film className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-wide">Initiate Cinematic Original</h3>
          <p className="text-white/40 text-xs">Register an official Original film/series in the tars backend registry.</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Title</label>
          <input
            type="text"
            required
            placeholder="e.g. OG (They Call Him OG)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Studio / Production Banner</label>
          <input
            type="text"
            required
            placeholder="e.g. DVV Entertainment"
            value={associatedWith}
            onChange={(e) => setAssociatedWith(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Cover Image URL</label>
          <input
            type="text"
            required
            placeholder="https://images.unsplash.com/photo-..."
            value={coverImg}
            onChange={(e) => setCoverImg(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Synopsis / Description</label>
          <textarea
            rows={3}
            placeholder="Logline and cinematic context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20 resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Genres (Comma-separated)</label>
          <input
            type="text"
            placeholder="Action, Crime, Thriller"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Duration & Certification</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="165 mins"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <input
              type="text"
              placeholder="UA / R"
              value={certification}
              onChange={(e) => setCertification(e.target.value)}
              className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            {isSubmitting ? "Initiating Original..." : "Initiate Cinematic Original"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
