import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save } from 'lucide-react';
import { Set } from '../../../types';
import { ModalWrapper } from '../../shared/modals/ModalWrapper';

interface UpdateSetModalProps {
  set: Set;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: { title: string; description: string; themeLine: string }) => void;
}

export function UpdateSetModal({ set, isOpen, onClose, onSave }: UpdateSetModalProps) {
  const [formData, setFormData] = useState({
    title: set.title || '',
    description: set.description || '',
    themeLine: set.themeLine || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={16} />
        </button>

        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-8 pr-8">
          Update Set details
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Set Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
              placeholder="E.g. Neon Genesis"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Statement / Theme Line
            </label>
            <input
              type="text"
              value={formData.themeLine}
              onChange={(e) => setFormData((p) => ({ ...p, themeLine: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
              placeholder="A short thematic statement..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              Description
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all resize-none placeholder:text-white/10"
              placeholder="Describe the set's vision and rules..."
            />
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
              <Save size={14} />
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </ModalWrapper>
  );
}
