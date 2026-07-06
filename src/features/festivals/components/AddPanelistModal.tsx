import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, UserPlus } from 'lucide-react';
import { ModalWrapper } from '../../shared/modals/ModalWrapper';

interface AddPanelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (handle: string) => void;
}

export function AddPanelistModal({ isOpen, onClose, onAdd }: AddPanelistModalProps) {
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onAdd(handle.trim());
      setHandle('');
      onClose();
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-surface-deep border border-white/10 rounded-3xl p-6 md:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={16} />
        </button>

        <h2 className="text-2xl font-black uppercase tracking-tight mb-6 pr-8 text-white">
          Add Panelist
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">
              User Handle
            </label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/10"
              placeholder="E.g. @karthikeya"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
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
              <UserPlus size={14} />
              Add Panelist
            </button>
          </div>
        </form>
      </motion.div>
    </ModalWrapper>
  );
}
