import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, UserPlus, Image as ImageIcon, Search } from "lucide-react";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { ProfileTile } from "../../../components/ProfileTile";
import { useSetMemberSearch, SetMember } from "../hooks/useSetMemberSearch";

interface CreateFestivalModalProps {
  setId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (festivalData: {
    title: string;
    description: string;
    rulesText: string;
    startDate: string;
    endDate: string;
    panelists: string[];
    coverImage: string;
  }) => void;
}

export function CreateFestivalModal({
  setId,
  isOpen,
  onClose,
  onCreate,
}: CreateFestivalModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rulesText: "",
    startDate: "",
    endDate: "",
    coverImage: "",
  });
  const [panelistInput, setPanelistInput] = useState("");
  const [panelists, setPanelists] = useState<{ id: string; name: string }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { members: searchMembers } = useSetMemberSearch(
    setId,
    panelistInput,
    isOpen
  );

  const availableMembers = useMemo(() => {
    return searchMembers.filter(
      (m) => !panelists.some((p) => p.id === m.profileId)
    );
  }, [searchMembers, panelists]);

  const addPanelist = (member: SetMember) => {
    if (!panelists.some((p) => p.id === member.profileId)) {
      setPanelists((prev) => [...prev, { id: member.profileId, name: member.name }]);
      setPanelistInput("");
      setIsDropdownOpen(false);
    }
  };

  const removePanelist = (id: string) => {
    setPanelists(panelists.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: formData.title,
      description: formData.description,
      rulesText: formData.rulesText,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      panelists: panelists.map((p) => p.id),
      coverImage: formData.coverImage,
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl bg-surface-deep border border-white/10 rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={16} />
        </button>

        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-8 pr-8 text-white">
          Create Festival
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Festival Poster
            </label>
            <div className="relative group cursor-pointer w-full aspect-video md:aspect-[21/9] bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData((p) => ({ ...p, coverImage: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              {formData.coverImage ? (
                <>
                  <img
                    src={formData.coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                      Change Poster
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/50 transition-colors">
                  <ImageIcon size={28} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    Upload Image
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Festival Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
              placeholder="E.g. The Spring Festival"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all resize-none placeholder:text-white/10"
              placeholder="Describe the festival's theme..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Expectations
            </label>
            <textarea
              rows={4}
              value={formData.rulesText}
              onChange={(e) =>
                setFormData((p) => ({ ...p, rulesText: e.target.value }))
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all resize-none placeholder:text-white/10"
              placeholder="1. Must be original score&#10;2. Under 3 minutes"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Add Panelists (Set Members Only)
            </label>
            <div className="relative">
              <input
                type="text"
                value={panelistInput}
                onChange={(e) => {
                  setPanelistInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-10 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/20"
                placeholder="Search set members..."
              />
              <Search className="w-4 h-4 text-white/30 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Interactive Set Member Search Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && availableMembers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-surface-deep border border-white/15 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto no-scrollbar p-2 flex flex-col gap-1"
                >
                  {availableMembers.map((member) => (
                    <ProfileTile
                      key={member.profileId}
                      id={member.profileId}
                      name={member.name}
                      handle={member.handle}
                      avatar={member.avatar}
                      role={member.role}
                      actionIcon={<UserPlus size={14} />}
                      onClick={() => addPanelist(member)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Added Panelists Tags */}
            {panelists.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {panelists.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/5"
                  >
                    <span className="text-xs font-medium text-white">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => removePanelist(p.id)}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, startDate: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, endDate: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-black bg-white hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              Create Festival
            </button>
          </div>
        </form>
      </motion.div>
    </ModalWrapper>
  );
}

