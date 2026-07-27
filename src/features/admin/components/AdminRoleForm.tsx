import { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, UserCheck, Key, CheckCircle2, AlertCircle, UserPlus, Trash2, LogIn, Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";

export function AdminRoleForm() {
  // Admin Login State
  const [loginAdminName, setLoginAdminName] = useState("");
  const [loginAdminPassword, setLoginAdminPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Account Creation & Deletion State
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [targetAdminId, setTargetAdminId] = useState("");
  const [adminAccountMsg, setAdminAccountMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmittingAdminAcc, setIsSubmittingAdminAcc] = useState(false);

  // Profile Role Update State
  const [profileId, setProfileId] = useState("");
  const [newRole, setNewRole] = useState<"organizer" | "artist">("organizer");
  const [roleMessage, setRoleMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // New Role / Permission State
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [permName, setPermName] = useState("");
  const [permDesc, setPermDesc] = useState("");
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Handler 0: Admin Login (auth_token cookie with role="admin")
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAdminName.trim() || !loginAdminPassword.trim()) return;

    setIsLoggingIn(true);
    setLoginMsg(null);

    try {
      const res = await apiFetch("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          admin_name: loginAdminName.trim(),
          admin_password: loginAdminPassword.trim(),
        }),
      });

      if (res.ok) {
        setLoginMsg({ text: `Logged in as Admin '${loginAdminName}'! Admin cookie set.`, type: "success" });
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoginMsg({ text: errData.message || `Admin login failed (HTTP ${res.status}). Verify credentials.`, type: "error" });
      }
    } catch (err) {
      setLoginMsg({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handler 1: Create New Admin Account (admins table)
  const handleCreateAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminPassword.trim()) return;

    setIsSubmittingAdminAcc(true);
    setAdminAccountMsg(null);

    try {
      const cleanName = adminName.trim().toLowerCase();
      const cleanPass = adminPassword.trim();

      const res = await apiFetch("/auth/admin/register", {
        method: "POST",
        body: JSON.stringify({
          admin_name: cleanName,
          admin_password: cleanPass,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setAdminAccountMsg({ text: `Successfully registered new Admin '${cleanName}'! ID: ${data.id || "OK"}`, type: "success" });
        setAdminName("");
        setAdminPassword("");
      } else {
        const errData = await res.json().catch(() => ({}));
        let rawMsg = errData.message || `Failed to create admin (HTTP ${res.status}).`;
        if (res.status === 422 || rawMsg.includes("Unable to process")) {
          rawMsg = "Payload validation failed: Username must be lowercase. Password requires 8+ chars with uppercase, lowercase & number (e.g. SecurePass123).";
        }
        setAdminAccountMsg({ text: rawMsg, type: "error" });
      }
    } catch (err) {
      setAdminAccountMsg({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsSubmittingAdminAcc(false);
    }
  };

  const handleDeleteAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawId = targetAdminId.trim();
    if (!rawId) return;

    // UUID format validation regex
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(rawId)) {
      setAdminAccountMsg({
        text: `Invalid Admin ID '${rawId}'. Deletion requires a 36-character UUID (e.g. d42448cf-c2bf-493f-8d44-f42c2da803f9), not the username string.`,
        type: "error",
      });
      return;
    }

    setIsSubmittingAdminAcc(true);
    setAdminAccountMsg(null);

    try {
      const res = await apiFetch(`/auth/admin/delete/${rawId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAdminAccountMsg({ text: `Admin account ${rawId} deleted successfully!`, type: "success" });
        setTargetAdminId("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setAdminAccountMsg({ text: errData.message || `Failed to delete admin (HTTP ${res.status})`, type: "error" });
      }
    } catch (err) {
      setAdminAccountMsg({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsSubmittingAdminAcc(false);
    }
  };

  // Handler 3: Update Profile Role (profiles table)
  const handleUpdateUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId.trim()) return;

    setIsUpdatingRole(true);
    setRoleMessage(null);

    try {
      const res = await apiFetch("/admin/update_user_role", {
        method: "POST",
        body: JSON.stringify({
          profile_id: profileId.trim(),
          new_role: newRole,
        }),
      });

      if (res.ok) {
        setRoleMessage({ text: `Successfully updated ${profileId} role to '${newRole}'!`, type: "success" });
        setProfileId("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setRoleMessage({ text: errData.message || `Failed to update role (HTTP ${res.status})`, type: "error" });
      }
    } catch (err) {
      setRoleMessage({ text: `Network error: ${String(err)}`, type: "error" });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Handler 4: Create Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setActionMessage(null);
    try {
      const res = await apiFetch("/admin/new_role", {
        method: "POST",
        body: JSON.stringify({ name: roleName.trim(), description: roleDesc.trim() || undefined }),
      });
      if (res.ok) {
        setActionMessage({ text: `Created new role '${roleName}'`, type: "success" });
        setRoleName("");
        setRoleDesc("");
      } else {
        setActionMessage({ text: `Failed to create role (${res.status})`, type: "error" });
      }
    } catch (err) {
      setActionMessage({ text: `Network error: ${String(err)}`, type: "error" });
    }
  };

  // Handler 5: Create Custom Permission
  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permName.trim()) return;

    setActionMessage(null);
    try {
      const res = await apiFetch("/admin/new_permission", {
        method: "POST",
        body: JSON.stringify({ name: permName.trim(), description: permDesc.trim() || undefined }),
      });
      if (res.ok) {
        setActionMessage({ text: `Created permission '${permName}'`, type: "success" });
        setPermName("");
        setPermDesc("");
      } else {
        setActionMessage({ text: `Failed to create permission (${res.status})`, type: "error" });
      }
    } catch (err) {
      setActionMessage({ text: `Network error: ${String(err)}`, type: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-4xl">
      {/* ── 0. Admin Authentication (Seeded / Initial Admin Login) ── */}
      <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide text-amber-200">Admin Authentication (Seeded / Initial Admin)</h3>
            <p className="text-amber-200/50 text-xs">
              Authenticate as an Admin (<code className="text-amber-300">admins</code> table) to unlock admin creation, deletion, and RBAC routes.
            </p>
          </div>
        </div>

        {loginMsg && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              loginMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {loginMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{loginMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-200/50">Admin Username</label>
            <input
              type="text"
              required
              placeholder="e.g. admin"
              value={loginAdminName}
              onChange={(e) => setLoginAdminName(e.target.value.toLowerCase())}
              className="bg-white/5 border border-amber-500/20 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-amber-200/50">Admin Password</label>
            <input
              type="password"
              required
              placeholder="Admin Password"
              value={loginAdminPassword}
              onChange={(e) => setLoginAdminPassword(e.target.value)}
              className="bg-white/5 border border-amber-500/20 rounded-2xl py-3 px-4 text-xs font-bold text-white outline-none focus:border-amber-400 transition-all placeholder:text-white/20"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoggingIn}
            type="submit"
            className="w-full py-3 bg-amber-400 text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-300 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {isLoggingIn ? "Authenticating..." : "Login as Admin"}
          </motion.button>
        </form>
      </div>

      {/* ── 1. Admin Account Management (admins table) ── */}
      <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Admin Accounts Management</h3>
            <p className="text-white/40 text-xs">
              Manage system admin accounts (<code className="text-red-300">admins</code> table). Deletion blocked if &le; 1 admin remains.
            </p>
          </div>
        </div>

        {adminAccountMsg && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              adminAccountMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {adminAccountMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{adminAccountMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Admin */}
          <form onSubmit={handleCreateAdminAccount} className="flex flex-col gap-3 p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" /> Register New Admin
            </span>
            <input
              type="text"
              required
              placeholder="Admin Username"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value.toLowerCase())}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <input
              type="password"
              required
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmittingAdminAcc}
              type="submit"
              className="py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
            >
              Create Admin Account
            </motion.button>
          </form>

          {/* Delete Admin */}
          <form onSubmit={handleDeleteAdminAccount} className="flex flex-col gap-3 p-5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" /> Revoke / Delete Admin
            </span>
            <input
              type="text"
              required
              placeholder="Target Admin UUID"
              value={targetAdminId}
              onChange={(e) => setTargetAdminId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <p className="text-[10px] text-white/30 italic">Safeguard active: Backend rejects deletion if &le; 1 admin exists.</p>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmittingAdminAcc}
              type="submit"
              className="py-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
            >
              Delete Admin Account
            </motion.button>
          </form>
        </div>
      </div>

      {/* ── 2. Profile Role Management (profiles table) ── */}
      <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Update Profile Role</h3>
            <p className="text-white/40 text-xs">
              Assign community roles (<code className="text-yellow-300">profiles</code> table). Admin role is restricted to <code className="text-red-300">admins</code> table.
            </p>
          </div>
        </div>

        {roleMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              roleMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {roleMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{roleMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateUserRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Profile ID or UUID</label>
            <input
              type="text"
              required
              placeholder="e.g. e0a9f197-2ad2-423a..."
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-mono outline-none focus:border-white transition-all placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">New Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "organizer" | "artist")}
              className="bg-zinc-900 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold uppercase outline-none focus:border-white transition-all text-white"
            >
              <option value="organizer">Organizer (Set & Festival Curator)</option>
              <option value="artist">Artist (Fan Creator)</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isUpdatingRole}
            type="submit"
            className="w-full py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
          >
            {isUpdatingRole ? "Updating..." : "Update Profile Role"}
          </motion.button>
        </form>
      </div>

      {/* ── 3. Custom Roles & Permissions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Role */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-base font-bold uppercase tracking-wide">Register New System Role</h4>
              <p className="text-white/40 text-[10px]">Add custom role definition to tars database.</p>
            </div>
          </div>

          <form onSubmit={handleCreateRole} className="flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="ROLE NAME (e.g. curator)"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <input
              type="text"
              placeholder="Description"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="py-3 bg-white/10 border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Create Role
            </motion.button>
          </form>
        </div>

        {/* New Permission */}
        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-base font-bold uppercase tracking-wide">Define New Permission</h4>
              <p className="text-white/40 text-[10px]">Add RBAC permission key to tars database.</p>
            </div>
          </div>

          <form onSubmit={handleCreatePermission} className="flex flex-col gap-3">
            <input
              type="text"
              required
              placeholder="PERMISSION NAME (e.g. create_festival)"
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-bold outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <input
              type="text"
              placeholder="Description"
              value={permDesc}
              onChange={(e) => setPermDesc(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-xs font-medium outline-none focus:border-white transition-all placeholder:text-white/20"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="py-3 bg-white/10 border border-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Create Permission
            </motion.button>
          </form>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-bold text-center ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {actionMessage.text}
        </div>
      )}
    </div>
  );
}
