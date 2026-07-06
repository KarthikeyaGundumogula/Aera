import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({ isOpen, onConfirm, onCancel }: UnsavedChangesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Cinematic Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-red-500/20 blur-[50px] rounded-xl pointer-events-none" />

            <div className="relative flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
                Unsaved Changes
              </h3>
              
              <p className="text-xs text-white/50 leading-relaxed font-medium mb-8">
                You have modifications to your stage that haven't been saved. If you leave now, these changes will be lost permanently.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Discard Changes & Leave
                </button>
                <button
                  onClick={onCancel}
                  className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-white/90 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
