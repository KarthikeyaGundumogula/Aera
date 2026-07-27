import { useState } from "react";
import { motion } from "motion/react";
import { Layers, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function AdminSetModal() {
  // Set Creation State
  const [setName, setSetName] = useState("");
  const [statement, setStatement] = useState("");
  const [description, setDescription] = useState("");
  const [colorTheme, setColorTheme] = useState("#0f1a42");
  const [setMessage, setSetMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmittingSet, setIsSubmittingSet] = useState(false);

  // Festival Creation State
  const [targetSetId, setTargetSetId] = useState("");
  const [festName, setFestName] = useState("");
  const [festDesc, setFestDesc] = useState("");
  const [startDate, setStartDate] = useState("2026-08-01T00:00:00Z");
  const [endDate, setEndDate] = useState("2026-08-15T00:00:00Z");
  const [rules, setRules] = useState("Cinematic edits only. Respect copyright guidelines.");
  const [festMessage, setFestMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmittingFest, setIsSubmittingFest] = useState(false);

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setName.trim() || !statement.trim()) return;

    setIsSubmittingSet(true);
    setSetMessage(null);

    try {
      const res = await apiFetch("/sets/new", {
        method: "POST",
        body: JSON.stringify({
          name: setName.trim(),
          statement: statement.trim(),
          description: description.trim() || statement.trim(),
          color_theme: colorTheme,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const createdId = data.SetCreated || "Created";
        setSetMessage({ text: `Set "${setName}" created successfully! ID: ${createdId}`, type: "success" });
        setTargetSetId(typeof createdId === "string" ? createdId : "");
        setSetName("");
        setStatement("");
        setDescription("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setSetMessage({
          text: errData.message || `Failed to create Set (HTTP ${res.status}). Ensure your profile role is 'organizer' or 'admin'.`,
          type: "error",
        });
      }
    } catch (err) {
      setSetMessage({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsSubmittingSet(false);
    }
  };

  const handleCreateFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSetId.trim() || !festName.trim()) return;

    setIsSubmittingFest(true);
    setFestMessage(null);

    try {
      const res = await apiFetch(`/sets/${targetSetId.trim()}/new_festival`, {
        method: "POST",
        body: JSON.stringify({
          name: festName.trim(),
          description: festDesc.trim() || festName.trim(),
          start_date: startDate,
          end_date: endDate,
          rules: rules.trim() || undefined,
          panelists: [],
        }),
      });

      if (res.ok) {
        setFestMessage({ text: `Festival "${festName}" launched successfully!`, type: "success" });
        setFestName("");
        setFestDesc("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setFestMessage({ text: errData.message || `Failed to launch festival (HTTP ${res.status})`, type: "error" });
      }
    } catch (err) {
      setFestMessage({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsSubmittingFest(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl">
      {/* ── 1. Create Set Community ── */}
      <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Establish Set Community</h3>
            <p className="text-white/40 text-xs">Requires &apos;organizer&apos; or &apos;admin&apos; profile role (POST /sets/new).</p>
          </div>
        </div>

        {setMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              setMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {setMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{setMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateSet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Set Name</label>
            <input
              type="text"
              required
              placeholder="e.g. LCU (Lokesh Cinematic Universe)"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Color Theme (Hex / CSS)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-12 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer"
              />
              <input
                type="text"
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Curator Statement</label>
            <input
              type="text"
              required
              placeholder="High-concept manifesto or theme statement..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Full Description</label>
            <textarea
              rows={2}
              placeholder="Community background and guidelines..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmittingSet}
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
            >
              {isSubmittingSet ? "Establishing Set..." : "Establish Set Community"}
            </motion.button>
          </div>
        </form>
      </div>

      {/* ── 2. Create Festival Event ── */}
      <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Launch Festival Event</h3>
            <p className="text-white/40 text-xs">Spawn a curated festival challenge inside a Set (POST /sets/:id/new_festival).</p>
          </div>
        </div>

        {festMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              festMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {festMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{festMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateFestival} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Target Set ID (UUID)</label>
            <input
              type="text"
              required
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={targetSetId}
              onChange={(e) => setTargetSetId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Festival Title</label>
            <input
              type="text"
              required
              placeholder="e.g. LCU Edit Sprint 2026"
              value={festName}
              onChange={(e) => setFestName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Description & Rules</label>
            <input
              type="text"
              placeholder="Event rules and guidelines..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmittingFest}
              type="submit"
              className="w-full py-4 bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              {isSubmittingFest ? "Launching Festival..." : "Launch Festival Event"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
