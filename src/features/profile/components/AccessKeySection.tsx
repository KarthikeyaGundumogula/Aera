import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";

interface AccessKeySectionProps {
  onKeySet: (key: string) => void;
}

export function AccessKeySection({ onKeySet }: AccessKeySectionProps) {
  const [firstKey, setFirstKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [showFirst, setShowFirst] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isMatching = firstKey.length > 0 && firstKey === confirmKey;
  const isMismatch = confirmKey.length > 0 && firstKey !== confirmKey;

  // Notify parent when matched
  const handleKeyChange = (field: "first" | "confirm", val: string) => {
    if (field === "first") {
      setFirstKey(val);
      if (val === confirmKey && val.length > 0) onKeySet(val);
      else onKeySet("");
    } else {
      setConfirmKey(val);
      if (val === firstKey && val.length > 0) onKeySet(val);
      else onKeySet("");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px w-10 bg-white/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40">
          II — Security
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Entry */}
        <div className="space-y-2">
          <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 ml-1">
            Create Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/30 transition-colors" />
            <input
              type={showFirst ? "text" : "password"}
              value={firstKey}
              onChange={(e) => handleKeyChange("first", e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-12 py-5 text-sm font-mono tracking-widest placeholder:text-white/5 focus:border-white/30 focus:bg-white/[0.05] transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowFirst(!showFirst)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/10 hover:text-white/40 transition-all"
            >
              {showFirst ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Step 2: Confirmation */}
        <div className="space-y-2">
          <label className="block text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 ml-1">
            Confirm Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/30 transition-colors" />
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmKey}
              onChange={(e) => handleKeyChange("confirm", e.target.value)}
              placeholder="••••••••"
              className={`
                w-full bg-white/[0.03] border rounded-2xl pl-14 pr-12 py-5 text-sm font-mono tracking-widest placeholder:text-white/5 focus:bg-white/[0.05] transition-all outline-none
                ${isMatching ? "border-green-500/30" : isMismatch ? "border-red-500/30" : "border-white/10 focus:border-white/30"}
              `}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/10 hover:text-white/40 transition-all"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>

            <AnimatePresence>
              {isMatching && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 hidden md:flex"
                >
                  <Check className="w-5 h-5 text-green-500/60" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {isMismatch && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[8px] font-bold uppercase tracking-widest text-red-500/50 pl-1 mt-1"
              >
                Keys do not match
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
