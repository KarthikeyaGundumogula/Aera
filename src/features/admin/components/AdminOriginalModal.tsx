import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon, 
  Edit3, 
  PlusCircle, 
  UserCheck, 
  Trash2, 
  Sparkles,
  Video,
  X
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface AdminOriginalModalProps {
  onSuccess?: () => void;
}

type OriginalAdminTab = "CREATE" | "UPDATE" | "RELEASE" | "ROLES";

const DEFAULT_COVER_PLACEHOLDER = "https://images.unsplash.com/photo-1536440136628-849c177e76a1";

export function AdminOriginalModal({ onSuccess }: AdminOriginalModalProps) {
  const { currentArtist } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<OriginalAdminTab>("CREATE");

  // Global feedback message
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 1. CREATE FORM STATE ───────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState("2026-07-27T00:00:00Z");
  const [description, setDescription] = useState("");
  const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null);
  const [associatedWith, setAssociatedWith] = useState("");
  const [duration, setDuration] = useState("");
  const [certification, setCertification] = useState("");
  const [genres, setGenres] = useState("");
  const [password, setPassword] = useState("kApten@1023");

  // ── 2. UPDATE FORM STATE ───────────────────────────────────────────────────
  const [updateOriginalId, setUpdateOriginalId] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateCoverImg, setUpdateCoverImg] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateReleaseDate, setUpdateReleaseDate] = useState("");
  const [updateDuration, setUpdateDuration] = useState("");

  // ── 3. OFFICIAL RELEASE UPLOAD FORM STATE ──────────────────────────────────
  const [releaseOriginalId, setReleaseOriginalId] = useState("");
  const [releaseType, setReleaseType] = useState<"EDIT" | "POSTER" | "SCRIPT">("EDIT");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseSrcId, setReleaseSrcId] = useState("");
  const [releasePlatform, setReleasePlatform] = useState<"youtube" | "twitter">("youtube");
  const [releaseFormat, setReleaseFormat] = useState("IMAX");

  // ── 4. CAST & CREW ROLES FORM STATE ────────────────────────────────────────
  const [roleOriginalId, setRoleOriginalId] = useState("");
  const [roleProfileId, setRoleProfileId] = useState("");
  const [roleCategory, setRoleCategory] = useState<"STAR" | "MAKER">("STAR");
  const [roleName, setRoleName] = useState("");

  // Helper UUID check
  const isValidUuid = (id?: string) => typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id.trim());

  // ── Cover Image File Picker Handler ──
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCoverImgPreview(previewUrl);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Handler 1: Create New Original (POST /originals/new)
  const handleCreateOriginal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    const parsedGenres = genres.split(",").map((g) => g.trim()).filter(Boolean);
    const associatedUuid = isValidUuid(associatedWith.trim()) ? associatedWith.trim() : undefined;

    const payload: Record<string, unknown> = {
      title: title.trim(),
      release_date: releaseDate,
      description: description.trim() || "Cinematic Original Masterpiece",
      cover_img: DEFAULT_COVER_PLACEHOLDER,
      category: "MOVIE",
      genres: parsedGenres.length > 0 ? parsedGenres : ["Action", "Drama"],
      password: password.trim() || "kApten@1023",
      duration: duration.trim() || undefined,
      certification: certification.trim() || undefined,
      stars: [],
      makers: [],
    };

    if (associatedUuid) {
      payload.associated_with = associatedUuid;
    }

    try {
      const res = await apiFetch("/originals/new", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ text: `Original "${title}" created successfully! ID: ${data.OriginalCreated || 'OK'}`, type: "success" });
        setTitle("");
        setCoverImgPreview(null);
        setAssociatedWith("");
        setDescription("");
        setGenres("");
        setDuration("");
        setCertification("");
        if (onSuccess) onSuccess();
      } else {
        let userMsg = "Failed to initiate Original. Please verify your Admin session.";
        if (res.status === 401 || res.status === 403) {
          userMsg = "Unauthorized: Active Admin session is required to initiate Originals.";
        } else if (res.status === 422) {
          userMsg = "Validation failed: Please check inputs.";
        }
        setMessage({ text: userMsg, type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Unable to connect to server. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 2: Update Original Metadata (POST /originals/{id}/update)
  const handleUpdateOriginal = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = updateOriginalId.trim();
    if (!isValidUuid(targetId)) {
      setMessage({ text: "Please enter a valid 36-character Original UUID.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const payload: Record<string, unknown> = {};
    if (updateTitle.trim()) payload.title = updateTitle.trim();
    if (updateCoverImg.trim()) payload.cover_image = updateCoverImg.trim();
    if (updateDescription.trim()) payload.description = updateDescription.trim();
    if (updateReleaseDate.trim()) payload.release_date = updateReleaseDate.trim();
    if (updateDuration.trim()) payload.duration = updateDuration.trim();

    if (Object.keys(payload).length === 0) {
      setMessage({ text: "Please fill at least one field to update.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await apiFetch(`/originals/${targetId}/update`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ text: `Original ${targetId} updated successfully!`, type: "success" });
        setUpdateOriginalId("");
        setUpdateTitle("");
        setUpdateCoverImg("");
        setUpdateDescription("");
        setUpdateReleaseDate("");
        setUpdateDuration("");
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: "Failed to update Original. Verify Admin session & UUID.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Unable to connect to server.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 3: Upload Official Release (POST /originals/{id}/new_release/{type})
  const handleUploadRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = releaseOriginalId.trim();
    if (!isValidUuid(targetId)) {
      setMessage({ text: "Please enter a valid 36-character Original UUID.", type: "error" });
      return;
    }
    if (!releaseSrcId.trim()) {
      setMessage({ text: "Please provide a valid Source ID or Video/Image reference.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    let payload: Record<string, unknown>;
    if (releaseType === "EDIT") {
      payload = {
        title: releaseTitle.trim() || undefined,
        src_id: releaseSrcId.trim(),
        platform: releasePlatform,
        format: releaseFormat,
      };
    } else if (releaseType === "POSTER") {
      payload = {
        title: releaseTitle.trim() || undefined,
        src_id: releaseSrcId.trim(),
        format: releaseFormat,
      };
    } else {
      payload = {
        title: releaseTitle.trim() || undefined,
        src_ids: [releaseSrcId.trim()],
        thoughts: ["Official Storyboard Release"],
      };
    }

    try {
      const res = await apiFetch(`/originals/${targetId}/new_release/${releaseType}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({ text: `Official ${releaseType} release launched for Original! ID: ${data.OrignalReleaseCreated || 'OK'}`, type: "success" });
        setReleaseOriginalId("");
        setReleaseTitle("");
        setReleaseSrcId("");
        if (onSuccess) onSuccess();
      } else {
        setMessage({ text: "Failed to upload official release. Ensure Admin session is active.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error during release upload.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 4A: Add Cast/Crew Role (POST /originals/{id}/new_role)
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const origId = roleOriginalId.trim();
    const profId = roleProfileId.trim();
    if (!isValidUuid(origId) || !isValidUuid(profId)) {
      setMessage({ text: "Original ID and Profile ID must be valid 36-character UUIDs.", type: "error" });
      return;
    }
    if (!roleName.trim()) {
      setMessage({ text: "Please enter a role name (e.g. Lead Actor, Director).", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await apiFetch(`/originals/${origId}/new_role`, {
        method: "POST",
        body: JSON.stringify({
          profile_id: profId,
          role_name: roleName.trim(),
          category: roleCategory,
        }),
      });

      if (res.ok) {
        setMessage({ text: `Assigned role '${roleName.trim()}' to profile ${profId}!`, type: "success" });
        setRoleName("");
      } else {
        setMessage({ text: "Failed to assign role. Verify Admin session & UUIDs.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error while assigning role.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler 4B: Delete Cast/Crew Role (DELETE /originals/{id}/delete_role)
  const handleDeleteRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const origId = roleOriginalId.trim();
    const profId = roleProfileId.trim();
    if (!isValidUuid(origId) || !isValidUuid(profId)) {
      setMessage({ text: "Original ID and Profile ID must be valid 36-character UUIDs.", type: "error" });
      return;
    }
    if (!roleName.trim()) {
      setMessage({ text: "Please enter the role name to delete.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await apiFetch(`/originals/${origId}/delete_role`, {
        method: "DELETE",
        body: JSON.stringify({
          profile_id: profId,
          role_name: roleName.trim(),
        }),
      });

      if (res.ok) {
        setMessage({ text: `Deleted role '${roleName.trim()}' from Original!`, type: "success" });
        setRoleName("");
      } else {
        setMessage({ text: "Failed to delete role. Verify role name & IDs.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error while deleting role.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subTabs: { id: OriginalAdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "CREATE", label: "Initiate Original", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "UPDATE", label: "Update Metadata", icon: <Edit3 className="w-4 h-4" /> },
    { id: "RELEASE", label: "Official Release", icon: <Video className="w-4 h-4" /> },
    { id: "ROLES", label: "Cast & Crew Roles", icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6 w-full max-w-4xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Film className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Originals Registry Command</h3>
            <p className="text-white/40 text-xs">Initiate, update, release, and manage cast & crew for official Original titles.</p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id);
                setMessage(null);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? "bg-amber-400 text-black shadow-lg font-black"
                  : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── TAB 1: CREATE NEW ORIGINAL ── */}
      {activeSubTab === "CREATE" && (
        <form onSubmit={handleCreateOriginal} className="flex flex-col gap-6 pt-2">
          {/* Refined Cover Image Upload Zone (Sleek Top Banner Placement) */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Cover Image Asset (Optional)
            </label>

            <div className="relative group w-full rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-5 transition-all overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Image Preview Card */}
                {coverImgPreview ? (
                  <div className="relative w-44 h-28 rounded-xl overflow-hidden border border-white/20 shadow-xl shrink-0">
                    <img src={coverImgPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImgPreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/70 hover:text-white transition-colors"
                      title="Remove Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-44 h-28 rounded-xl bg-white/[0.03] border border-dashed border-white/15 flex flex-col items-center justify-center shrink-0 text-white/30 group-hover:border-white/30 transition-colors">
                    <ImageIcon className="w-7 h-7 mb-1.5 text-white/20" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">No Image Uploaded</span>
                  </div>
                )}

                {/* Upload Action Description & Button */}
                <div className="flex-1 flex flex-col justify-between gap-3 text-center md:text-left">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Cinematic Key Art Cover</h4>
                    <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                      Select an image file from your device. Displays live preview on frontend; backend registers official asset.
                    </p>
                  </div>

                  <label className="w-fit self-center md:self-start flex items-center gap-2 py-2.5 px-5 bg-white text-black hover:bg-white/90 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{coverImgPreview ? "Change Asset" : "Browse Image File"}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Title *</label>
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Associated Banner UUID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={associatedWith}
                onChange={(e) => setAssociatedWith(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Synopsis / Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Logline and cinematic context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Genres (Optional, Comma-separated)</label>
              <input
                type="text"
                placeholder="Action, Crime, Thriller"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Duration & Certification (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 165 mins"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
                />
                <input
                  type="text"
                  placeholder="e.g. UA"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || !title.trim()}
                type="submit"
                className="w-full py-4 bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-amber-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {isSubmitting ? "Initiating..." : "Initiate Cinematic Original"}
              </motion.button>
            </div>
          </div>
        </form>
      )}

      {/* ── TAB 2: UPDATE ORIGINAL METADATA ── */}
      {activeSubTab === "UPDATE" && (
        <form onSubmit={handleUpdateOriginal} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Target Original UUID *</label>
            <input
              type="text"
              required
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={updateOriginalId}
              onChange={(e) => setUpdateOriginalId(e.target.value)}
              className="bg-white/5 border border-amber-500/30 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Title (Optional)</label>
            <input
              type="text"
              placeholder="Updated Original Title"
              value={updateTitle}
              onChange={(e) => setUpdateTitle(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Cover Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={updateCoverImg}
              onChange={(e) => setUpdateCoverImg(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Updated logline..."
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Release Date (Optional)</label>
            <input
              type="text"
              placeholder="2026-08-15T00:00:00Z"
              value={updateReleaseDate}
              onChange={(e) => setUpdateReleaseDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Duration (Optional)</label>
            <input
              type="text"
              placeholder="175 mins"
              value={updateDuration}
              onChange={(e) => setUpdateDuration(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !updateOriginalId.trim()}
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all shadow-md"
            >
              {isSubmitting ? "Updating..." : "Update Original Metadata"}
            </motion.button>
          </div>
        </form>
      )}

      {/* ── TAB 3: UPLOAD OFFICIAL RELEASE ── */}
      {activeSubTab === "RELEASE" && (
        <form onSubmit={handleUploadRelease} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Target Original UUID *</label>
            <input
              type="text"
              required
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={releaseOriginalId}
              onChange={(e) => setReleaseOriginalId(e.target.value)}
              className="bg-white/5 border border-amber-500/30 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Release Category *</label>
            <select
              value={releaseType}
              onChange={(e) => setReleaseType(e.target.value as "EDIT" | "POSTER" | "SCRIPT")}
              className="bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold uppercase outline-none focus:border-white transition-all text-white"
            >
              <option value="EDIT">Official Edit / Video</option>
              <option value="POSTER">Official Poster Key Art</option>
              <option value="SCRIPT">Official Script / Storyboard</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Release Title (Optional)</label>
            <input
              type="text"
              placeholder="Official Trailer 1 / Teaser"
              value={releaseTitle}
              onChange={(e) => setReleaseTitle(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Source ID / Asset Reference *</label>
            <input
              type="text"
              required
              placeholder="e.g. YouTube Video ID (dQw4w9WgXcQ) or Image Asset URL"
              value={releaseSrcId}
              onChange={(e) => setReleaseSrcId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          {releaseType === "EDIT" && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Platform</label>
                <select
                  value={releasePlatform}
                  onChange={(e) => setReleasePlatform(e.target.value as "youtube" | "twitter")}
                  className="bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold uppercase outline-none focus:border-white transition-all text-white"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter / X</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Format</label>
                <select
                  value={releaseFormat}
                  onChange={(e) => setReleaseFormat(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold uppercase outline-none focus:border-white transition-all text-white"
                >
                  <option value="IMAX">IMAX (16:9)</option>
                  <option value="ACADEMY">Academy (4:3)</option>
                  <option value="SQUARE">Square (1:1)</option>
                  <option value="VERTICAL">Vertical (9:16)</option>
                </select>
              </div>
            </>
          )}

          <div className="md:col-span-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !releaseOriginalId.trim() || !releaseSrcId.trim()}
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              {isSubmitting ? "Uploading Release..." : "Launch Official Release"}
            </motion.button>
          </div>
        </form>
      )}

      {/* ── TAB 4: CAST & CREW ROLES ── */}
      {activeSubTab === "ROLES" && (
        <div className="flex flex-col gap-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Target Original UUID *</label>
              <input
                type="text"
                required
                placeholder="Original UUID"
                value={roleOriginalId}
                onChange={(e) => setRoleOriginalId(e.target.value)}
                className="bg-white/5 border border-amber-500/30 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Target Profile UUID *</label>
              <input
                type="text"
                required
                placeholder="Artist Profile UUID"
                value={roleProfileId}
                onChange={(e) => setRoleProfileId(e.target.value)}
                className="bg-white/5 border border-amber-500/30 rounded-2xl py-3 px-4 text-xs font-mono font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Role Category *</label>
              <select
                value={roleCategory}
                onChange={(e) => setRoleCategory(e.target.value as "STAR" | "MAKER")}
                className="bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold uppercase outline-none focus:border-white transition-all text-white"
              >
                <option value="STAR">Star (Cast / Performer)</option>
                <option value="MAKER">Maker (Crew / Director / Writer)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Role Name / Character *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Actor, Director"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddRole}
              disabled={isSubmitting || !roleOriginalId.trim() || !roleProfileId.trim() || !roleName.trim()}
              className="py-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {isSubmitting ? "Processing..." : "Add Role to Original"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteRole}
              disabled={isSubmitting || !roleOriginalId.trim() || !roleProfileId.trim() || !roleName.trim()}
              className="py-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isSubmitting ? "Processing..." : "Remove Role from Original"}
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
