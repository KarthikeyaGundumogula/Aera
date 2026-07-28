import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ModalWrapper } from '../../shared/modals/ModalWrapper';
import { CinematicColorPicker } from '../../../components/CinematicColorPicker';
import { apiFetch } from '@/lib/api';
import { useAuth } from '../../../context/AuthContext';

interface CreateSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (setData: { title: string; statement: string; description: string; coverImage: string; accentColor: string; }) => void;
}

export function CreateSetModal({ isOpen, onClose, onCreate }: CreateSetModalProps) {
  const { currentArtist } = useAuth();
  const role = currentArtist?.role?.toLowerCase();
  const isOrganizer = !!currentArtist && (role === "organizer" || role === "admin");

  const [formData, setFormData] = useState({
    title: '',
    statement: '',
    description: '',
    accentColor: '#fac107',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrganizer) {
      setErrorMessage("Unauthorized: Set creation is strictly reserved for profiles with the 'organizer' role.");
      return;
    }
    if (!formData.title.trim() || !formData.statement.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiFetch("/sets/new", {
        method: "POST",
        body: JSON.stringify({
          name: formData.title.trim(),
          statement: formData.statement.trim(),
          description: formData.description.trim() || formData.statement.trim(),
          color_theme: formData.accentColor,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const createdId = data.SetCreated || "Created";
        setSuccessMessage(`Set "${formData.title}" established successfully!`);
        if (onCreate) {
          onCreate({
            title: formData.title,
            statement: formData.statement,
            description: formData.description,
            accentColor: formData.accentColor,
            coverImage: '',
          });
        }
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
          setFormData({ title: '', statement: '', description: '', accentColor: '#fac107' });
        }, 1200);
      } else {
        const errData = await res.json().catch(() => ({}));
        let msg = errData.message || `Failed to create Set (HTTP ${res.status})`;
        if (res.status === 401) {
          msg = "Unauthorized: Set creation requires an active Artist profile with the 'organizer' role.";
        }
        setErrorMessage(msg);
      }
    } catch (err) {
      setErrorMessage(`Network error: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-surface-deep border border-white/10 rounded-3xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={16} />
        </button>

        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 pr-8 text-white">
          Create New Set
        </h2>
        <p className="text-white/40 text-xs mb-6">
          Establish a new Set community (POST /sets/new). Foreign key <code className="text-yellow-300">curator</code> binds to your active Organizer Profile.
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Identity Preview & Color Picker Zone */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1 flex justify-between items-center">
              <span>Identity Preview</span>
              <span className="text-white/20 font-mono tracking-wider">{formData.accentColor}</span>
            </label>
            
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-stretch">
              {/* Massive SVG Preview (Matching SetCard) */}
              <div className="flex-1 w-full relative aspect-video overflow-hidden flex flex-col justify-center items-center bg-[#030303] border border-white/10 rounded-2xl">
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
                  style={{ background: `radial-gradient(circle at center, ${formData.accentColor}40 0%, transparent 60%)` }}
                />
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center px-4 relative z-10 pointer-events-none">
                  <svg
                    className="w-full transition-transform duration-700"
                    viewBox="0 0 1000 200"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <text
                      x="500"
                      y="150"
                      fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                      fontSize="160"
                      fontWeight="900"
                      fill={formData.accentColor}
                      textAnchor="middle"
                      textLength="900"
                      lengthAdjust="spacingAndGlyphs"
                      className="uppercase select-none drop-shadow-2xl"
                    >
                      {formData.title || 'SET NAME'}
                    </text>
                  </svg>
                  {formData.statement && (
                    <p className="text-[10px] md:text-[11px] font-medium italic text-white/50 tracking-[0.2em] uppercase mt-[-10px] md:mt-[-15px] text-center px-4">
                      "{formData.statement}"
                    </p>
                  )}
                </div>
              </div>

              {/* Cinematic Color Picker */}
              <div className="shrink-0 flex justify-center items-center">
                <CinematicColorPicker 
                  value={formData.accentColor} 
                  onChange={(c) => setFormData(p => ({ ...p, accentColor: c }))} 
                />
              </div>
            </div>
          </div>

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
              required
              value={formData.statement}
              onChange={(e) => setFormData((p) => ({ ...p, statement: e.target.value }))}
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
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white focus:border-white focus:ring-1 focus:ring-white/20 outline-none transition-all resize-none placeholder:text-white/10"
              placeholder="Describe the set's vision and aesthetic..."
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
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-black bg-white hover:bg-white/90 disabled:opacity-50 shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              {isSubmitting ? "Establishing..." : "Create Set"}
            </button>
          </div>
        </form>
      </motion.div>
    </ModalWrapper>
  );
}
