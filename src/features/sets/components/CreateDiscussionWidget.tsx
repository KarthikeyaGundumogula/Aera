import { useState } from "react";
import { MessageSquare, Plus, X, Film, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "../../../context/AuthContext";

export interface SetWorkItem {
  id: string;
  title: string;
  type: string;
  thumbnail: string;
  artistId: string;
  artistName: string;
}

export interface CreateDiscussionWidgetProps {
  setId: string;
  isJoined: boolean;
  setWorks: SetWorkItem[];
  onDiscussionCreated: (newDiscussion: any) => void;
}

export function CreateDiscussionWidget({
  setId,
  isJoined,
  setWorks,
  onDiscussionCreated,
}: CreateDiscussionWidgetProps) {
  const { currentArtist } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [showWorkSelector, setShowWorkSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isJoined) {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
        <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-white/30">
          Join this set to participate in discussions and cast thoughts.
        </p>
      </div>
    );
  }

  const selectedWork = setWorks.find((w) => String(w.id) === String(selectedWorkId));

  const handleReset = () => {
    setTitle("");
    setContent("");
    setSelectedWorkId(null);
    setShowWorkSelector(false);
    setIsExpanded(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch(`/sets/${setId}/new/discussion`, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          work_id: selectedWorkId || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const newId = json.discussion_id || json.id || `disc-${Date.now()}`;
        const newDiscussion = {
          id: newId,
          author_id: currentArtist?.id || "user-current",
          author_name: currentArtist?.name || "YOU (ARTIST)",
          author_avatar: currentArtist?.image || (currentArtist as any)?.profilePicture || "",
          title: title.trim(),
          body: content.trim(),
          comment_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        onDiscussionCreated(newDiscussion);
        handleReset();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(errJson.error || errJson.message || "Failed to create discussion.");
      }
    } catch (err) {
      console.error("[CreateDiscussionWidget] Submit error:", err);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            {currentArtist?.image || (currentArtist as any)?.profilePicture ? (
              <img
                src={currentArtist?.image || (currentArtist as any)?.profilePicture}
                alt={currentArtist?.name || "Artist"}
                className="w-7 h-7 rounded-lg object-cover border border-white/10 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-[11px] font-mono text-white/40 group-hover:text-white/70 transition-colors">
              Cast a new thought into the discussion…
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white group-hover:bg-white/10 transition-all">
            <Plus className="w-3 h-3" />
            <span>New Post</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-white/80">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            New Discussion Post
          </span>
        </div>
        <button
          onClick={handleReset}
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-[10px] font-mono">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Discussion Title (e.g., What makes this Set unique?)"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>

        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thought or critique…"
            rows={4}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none"
          />
        </div>

        {/* ── Interactive Work Selection Section ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowWorkSelector((prev) => !prev)}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedWork
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>
                {selectedWork ? `Attached Work: ${selectedWork.title}` : "+ Attach a Work from Set"}
              </span>
            </button>
            {selectedWork && (
              <button
                type="button"
                onClick={() => setSelectedWorkId(null)}
                className="text-[9px] font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove Attachment
              </button>
            )}
          </div>

          {(showWorkSelector || selectedWork) && setWorks.length > 0 && (
            <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                Select a Work to Reference
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {setWorks.map((work) => {
                  const isSelected = String(work.id) === String(selectedWorkId);
                  return (
                    <div
                      key={work.id}
                      onClick={() => {
                        setSelectedWorkId(isSelected ? null : work.id);
                      }}
                      className={`flex-shrink-0 flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 text-white"
                          : "bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-white/70"
                      }`}
                    >
                      {work.thumbnail ? (
                        <img
                          src={work.thumbnail}
                          alt={work.title}
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Film className="w-4 h-4 text-white/40" />
                        </div>
                      )}
                      <div className="pr-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-white/90 line-clamp-1">
                          {work.title}
                        </div>
                        <div className="text-[8px] font-mono text-white/40">
                          {work.artistName}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 ml-auto flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-4 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white/70 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="h-9 px-6 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? "Casting..." : "Cast Discussion"}
          </button>
        </div>
      </form>
    </div>
  );
}
