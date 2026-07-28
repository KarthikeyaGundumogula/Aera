import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { PasswordRulesChecklist, isPasswordValid } from "@/components/PasswordRulesChecklist";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setErrorMessage("New passwords do not match.");
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters with uppercase, lowercase, and number (e.g. SecurePass123).");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          old_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          onClose();
          setTimeout(() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setStatus("idle");
          }, 300);
        }, 1500);
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatus("error");
        let msg = errData.message || `Password update failed (HTTP ${res.status}).`;
        if (res.status === 422 || msg.includes("Unable to process")) {
          msg = "Password validation failed: Must be 8+ chars with uppercase, lowercase & number (e.g. SecurePass123).";
        }
        setErrorMessage(msg);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(`Network error: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
          />
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-deep border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <Key className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">
                      Security
                    </h2>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                      Update Access Key
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReset} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                    {newPassword.length > 0 && <PasswordRulesChecklist password={newPassword} />}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-white/30 focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-xl text-xs font-medium"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errorMessage}
                    </motion.div>
                  )}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-3 rounded-xl text-xs font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      Password updated successfully
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={status === "success" || isSubmitting}
                  className="w-full py-4 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg mt-2"
                >
                  {isSubmitting ? "Updating..." : status === "success" ? "Saved" : "Update Password"}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
