import { ReactNode } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { ModalWrapper } from "./ModalWrapper";

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Keep",
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <ModalWrapper isOpen={isOpen} onClose={() => !isDeleting && onClose()}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0b0c10] border border-red-500/20 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black uppercase tracking-tight text-white/90">
              {title}
            </h3>
          </div>
          <div className="text-xs text-white/50 font-mono leading-relaxed">
            {description}
          </div>
        </div>

        <div className="flex gap-3 justify-end items-center pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-40 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              await onConfirm();
            }}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer shadow-lg shadow-red-600/20"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? "Deleting..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
