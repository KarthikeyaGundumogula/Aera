import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Film, UserCheck, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { StageIcon } from "@/components/icons/AppIcons";
import { apiFetch } from "@/lib/api";
import { AdminRoleForm } from "./components/AdminRoleForm";
import { AdminOriginalModal } from "./components/AdminOriginalModal";

type AdminTab = "ROLES" | "ORIGINALS";

export function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("ROLES");
  const [adminSession, setAdminSession] = useState<{ username: string } | null>(() => {
    const saved = sessionStorage.getItem("tars_admin_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Login form state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;

    setIsAuthenticating(true);
    setLoginError(null);

    try {
      const cleanUsername = adminUsername.trim().toLowerCase();
      const cleanPassword = adminPassword.trim();

      const res = await apiFetch("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          admin_name: cleanUsername,
          admin_password: cleanPassword,
        }),
      });

      if (res.ok) {
        const sessionData = { username: cleanUsername };
        sessionStorage.setItem("tars_admin_session", JSON.stringify(sessionData));
        setAdminSession(sessionData);
        setAdminUsername("");
        setAdminPassword("");
      } else {
        const errData = await res.json().catch(() => ({}));
        let rawMsg = errData.message || `Admin authentication failed (HTTP ${res.status}).`;
        if (res.status === 422 || rawMsg.includes("Unable to process")) {
          rawMsg = "Payload validation failed: Username must be lowercase. Password requires 8+ chars with uppercase, lowercase & number (e.g. SecurePass123).";
        }
        setLoginError(rawMsg);
      }
    } catch (err) {
      setLoginError(`Network error: ${String(err)}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await apiFetch("/auth/admin/logout", { method: "POST" });
    } catch (e) {
      console.warn("[AdminPage] Admin logout warning:", e);
    }
    sessionStorage.removeItem("tars_admin_session");
    setAdminSession(null);
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "ROLES", label: "RBAC & User Roles", icon: <UserCheck className="w-4 h-4" /> },
    { id: "ORIGINALS", label: "Originals Registry", icon: <Film className="w-4 h-4" /> },
  ];

  return (
    <div className="relative min-h-screen bg-surface-deep text-white overflow-y-auto font-sans selection:bg-white selection:text-black">
      {/* ── Ambient Glow Background ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-white/[0.02] blur-[140px] rounded-xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-white/[0.015] blur-[140px] rounded-xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        {/* ── Top Navigation ── */}
        <div className="flex items-center justify-between mb-16">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate("/studio")}
            className="group flex items-center gap-3 w-fit text-white/40 hover:text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Return to Studio</span>
          </motion.button>

          <div className="flex items-center gap-4">
            {adminSession ? (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                  Admin: {adminSession.username}
                </span>
                <button
                  onClick={handleAdminLogout}
                  className="ml-2 p-1 text-emerald-400 hover:text-white transition-colors"
                  title="Logout Admin Session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <StageIcon className="w-4 h-4 text-white/80" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  System Protocol — Locked
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Header ── */}
        <header className="mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-black uppercase tracking-[-0.03em] leading-[0.85] mb-4"
          >
            Command <br />
            <span className="text-white/20">Center</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40 text-xs max-w-md tracking-wide leading-relaxed"
          >
            High-level access to tars system protocol. Authenticate as an admin to manage system admin accounts, RBAC roles, and initiate Originals.
          </motion.p>
        </header>

        {/* ── Content ── */}
        {!adminSession ? (
          /* Locked State */
          <div className="max-w-md mx-auto w-full p-8 rounded-3xl bg-amber-500/[0.03] border border-amber-500/20 flex flex-col gap-6 shadow-[0_20px_50px_rgba(245,158,11,0.05)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-300">
                  Admin Authentication Required
                </h3>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">
                  Authenticate as an Admin (<code className="text-amber-200">admins</code> table) to unlock control panel.
                </p>
              </div>
            </div>

            {loginError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Admin Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase())}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="Admin Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs font-bold text-white outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isAuthenticating}
                type="submit"
                className="w-full py-4 bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-amber-300 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] mt-2"
              >
                {isAuthenticating ? "Authenticating..." : "Unlock Admin Dashboard"}
              </motion.button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Dashboard */
          <>
            {/* ── Tabs Navigation ── */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                      isActive
                        ? "bg-white text-black shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
                        : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <main className="flex-1 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {activeTab === "ROLES" && (
                  <motion.div
                    key="ROLES"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="w-full flex justify-center"
                  >
                    <AdminRoleForm />
                  </motion.div>
                )}

                {activeTab === "ORIGINALS" && (
                  <motion.div
                    key="ORIGINALS"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="w-full flex justify-center"
                  >
                    <AdminOriginalModal />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </>
        )}

        {/* ── Footer ── */}
        <div className="mt-20 pt-8 border-t border-white/5 text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>tars Root Protocol Active</span>
          </div>
          <span>Authorized Sessions Only</span>
        </div>
      </div>
    </div>
  );
}
