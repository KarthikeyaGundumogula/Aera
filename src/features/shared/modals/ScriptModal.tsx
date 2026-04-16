import { motion } from "motion/react";
import React from "react";
import { LayoutPanelLeft, X } from "lucide-react";
import { TheatreItem } from "../../../types";
import { ScriptWork } from "../work/ScriptWork";
import { ModalWrapper } from "./ModalWrapper";

interface ScriptModalProps {
  item: TheatreItem | null;
  onClose: () => void;
}

export function ScriptModal({ item, onClose }: ScriptModalProps) {
  if (!item) return null;

  return (
    <ModalWrapper isOpen={!!item} onClose={onClose}>
      <motion.div
        key="script-modal-card"
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 24, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#d7ccb8]/25 bg-[#11100d] shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,232,204,0.16),transparent_32%),linear-gradient(135deg,rgba(244,241,234,0.05),transparent_42%)] pointer-events-none" />

        {/* Sidebar */}
        <div className="hidden w-32 shrink-0 border-r border-[#d7ccb8]/15 bg-[#161410] sm:flex sm:flex-col sm:justify-between">
          <div className="px-5 pt-6">
            <div className="mb-5 h-px w-10 bg-[#d7ccb8]/30" />
            <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-[#c7bda9]/55">
              Script
            </p>
          </div>
          <div className="px-5 pb-6">
            <div
              className="origin-bottom-left -rotate-90 whitespace-nowrap text-[42px] font-bold uppercase leading-none"
              style={{
                fontFamily: "'Londrina Outline', sans-serif",
                color: "rgba(215,204,184,0.34)",
              }}
            >
              {item.title || "FRAMEHOUSE"}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex min-h-[560px] flex-1 flex-col bg-[#f4f1ea]">
          <div className="flex items-center justify-between border-b border-black/8 px-5 py-4 sm:px-7">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.34em] text-black/35">
                Script Archive
              </p>
              <h3 className="truncate text-sm font-bold uppercase tracking-tight text-[#1f1d19] sm:text-base">
                {item.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black/65 transition-all hover:bg-black hover:text-white active:scale-95"
              aria-label="Close script modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[70vh] no-scrollbar">
            <div className="mx-auto max-w-3xl rounded-[22px] border border-black/10 bg-[#f4f1ea] shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
              <ScriptWork item={item} variant="feed" priority="eager" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/8 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3 text-[#1f1d19]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5">
                <LayoutPanelLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-black/35">
                  Credits
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
                  {item.credits || 0}
                </p>
              </div>
            </div>

            <p className="max-w-[45%] text-right text-[9px] font-bold uppercase tracking-[0.22em] text-black/35">
              {item.origins || "FrameHouse Script Archive"}
            </p>
          </div>
        </div>
      </motion.div>
    </ModalWrapper>
  );
}
