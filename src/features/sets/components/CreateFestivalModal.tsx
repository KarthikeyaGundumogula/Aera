import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, UserPlus, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { ModalWrapper } from "../../shared/modals/ModalWrapper";
import { ARTISTS_MOCK } from "../../../mock";

interface CreateFestivalModalProps {
  setId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (festivalData: {
    title: string;
    description: string;
    rules: string[];
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
  const [panelists, setPanelists] = useState<string[]>([]);

  // Simulate checking if the user is a Set Member by matching against ARTISTS_MOCK
  const isPanelistValid = panelistInput.trim().length > 0 && ARTISTS_MOCK.some(a => 
    a.name.toLowerCase() === panelistInput.trim().toLowerCase() ||
    a.socials?.twitter?.toLowerCase() === panelistInput.trim().toLowerCase() ||
    a.socials?.instagram?.toLowerCase() === panelistInput.trim().toLowerCase()
  );

  const handleAddPanelist = () => {
    if (isPanelistValid && !panelists.includes(panelistInput.trim())) {
      setPanelists([...panelists, panelistInput.trim()]);
      setPanelistInput("");
    }
  };

  const removePanelist = (handle: string) => {
    setPanelists(panelists.filter(p => p !== handle));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: formData.title,
      description: formData.description,
      rules: formData.rulesText.split("\n").filter((r) => r.trim().length > 0),
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : new Date().toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      panelists,
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
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
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
                      setFormData(p => ({ ...p, coverImage: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
              />
              {formData.coverImage ? (
                <>
                  <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Change Poster</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/30 group-hover:text-white/50 transition-colors">
                  <ImageIcon size={28} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Upload Image</span>
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

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Add Panelists
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={panelistInput}
                  onChange={(e) => setPanelistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPanelist();
                    }
                  }}
                  className={`w-full bg-white/5 border rounded-2xl p-4 pr-12 text-sm font-medium text-white focus:ring-1 outline-none transition-all placeholder:text-white/10 ${
                    panelistInput.trim().length === 0 
                      ? 'border-white/10 focus:border-white focus:ring-white/20' 
                      : isPanelistValid 
                        ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20' 
                        : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                  }`}
                  placeholder="Enter member handle (e.g. @karthik_g)"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {panelistInput.trim().length > 0 && (
                    isPanelistValid ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddPanelist}
                disabled={!isPanelistValid}
                className="px-6 rounded-2xl bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center justify-center shrink-0"
              >
                <UserPlus size={14} />
              </button>
            </div>
            
            {/* Status Message */}
            <AnimatePresence mode="wait">
              {panelistInput.trim().length > 0 && !isPanelistValid && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-400 font-medium ml-2"
                >
                  This user is not a member of the Set.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Added Panelists Tags */}
            {panelists.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {panelists.map((p) => (
                  <div key={p} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/5">
                    <span className="text-xs font-medium text-white">{p}</span>
                    <button type="button" onClick={() => removePanelist(p)} className="text-white/40 hover:text-white">
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
