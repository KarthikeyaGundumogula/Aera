import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Upload,
  X,
  Instagram,
  Twitter,
  Youtube,
  Lock,
  Check,
  ChevronDown,
  Pencil,
  Eye,
  EyeOff,
} from "lucide-react";
import type { OriginalArtist } from "../../../types";
import { useProfileForm } from "../hooks/useProfileForm";

/* ────────────────────────────────────────────────────────────────────────────
 *  Types
 * ──────────────────────────────────────────────────────────────────────── */

interface ProfileEditCardProps {
  artist: OriginalArtist;
  onSave: (updated: OriginalArtist & { newPassword?: string }) => void;
}

type ActiveSection = "identity" | "socials" | "security" | null;

interface SocialsState {
  instagram: string;
  twitter: string;
  youtube: string;
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────────────────── */

export function ProfileEditCard({ artist, onSave }: ProfileEditCardProps) {
  /* ── local state ──────────────────────────────────────────────────── */
  const { formData, updateField, updateSocial, setPortrait, clearPortrait, setFormData } = useProfileForm(artist);

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  const BIO_MAX = 200;

  /* ── handlers ─────────────────────────────────────────────────────── */
  const handlePortraitPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      const preview = URL.createObjectURL(file);
      setPortrait(file, preview);
      e.target.value = "";
    },
    [setPortrait],
  );

  const handlePortraitClear = useCallback(() => {
    clearPortrait(artist.image || null);
  }, [clearPortrait, artist.image]);

  const toggleSection = useCallback(
    (section: ActiveSection) => {
      setActiveSection((prev) => (prev === section ? null : section));
    },
    [],
  );

  const passwordsMatch =
    (formData.newPassword?.length ?? 0) > 0 && formData.newPassword === formData.confirmPassword;
  const passwordError =
    (formData.confirmPassword?.length ?? 0) > 0 && formData.newPassword !== formData.confirmPassword;

  const handleSave = useCallback(() => {
    const updated: OriginalArtist = {
      ...artist,
      name: formData.name,
      bio: formData.bio,
      image: formData.portraitPreview ?? artist.image,
      socials: { ...formData.socials },
    };
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [artist, formData.name, formData.bio, formData.portraitPreview, formData.socials, onSave]);

  const handlePasswordSave = useCallback(() => {
    if (!passwordsMatch) return;
    
    // In a real app, this would be a specific password-only API call
    const updated = {
      ...artist,
      newPassword: formData.newPassword,
    };
    onSave(updated);
    setIsPasswordSaved(true);
    setTimeout(() => {
      setIsPasswordSaved(false);
      setActiveSection(null);
      updateField("currentPassword", "");
      updateField("newPassword", "");
      updateField("confirmPassword", "");
    }, 2000);
  }, [artist, formData.newPassword, passwordsMatch, onSave, updateField]);

  /* ── render ───────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-6"
    >
      {/* ─── Portrait + Name Hero ──────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-5 p-8 rounded-3xl bg-white/[0.03] border border-white/5">
        {/* Portrait */}
        <div className="relative group">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/15 transition-all duration-300 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]">
            {formData.portraitPreview ? (
              <img loading="lazy"
                src={formData.portraitPreview}
                alt="Portrait"
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/5">
                <User className="w-7 h-7 text-white/15" />
              </div>
            )}
          </div>

          {/* Upload overlay (Desktop) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 md:group-hover:opacity-100 hidden md:flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Change portrait"
          >
            <Pencil className="w-5 h-5 text-white shadow-lg" />
          </button>

          {/* Edit Badge (Mobile) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 rounded-lg bg-white text-black flex md:hidden items-center justify-center shadow-lg active:scale-90 transition-transform"
            aria-label="Change portrait"
          >
            <Pencil className="w-3 h-3" />
          </button>

          {/* Clear badge */}
          {formData.portraitFile && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handlePortraitClear}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all"
              aria-label="Reset portrait"
            >
              <X className="w-2.5 h-2.5" />
            </motion.button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePortraitPick}
          />
        </div>
        
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
          Best: 1:1 Square aspect ratio
        </span>

        {/* Name inline edit with visual hint */}
        <div className="relative group/name w-full max-w-xs flex items-center justify-center gap-2">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full text-center bg-transparent text-xl font-black tracking-tight outline-none border-b border-transparent hover:border-white/10 focus:border-white/30 transition-all py-1 placeholder:text-white/10"
            placeholder="Your name"
            id="edit-name"
          />
          <Pencil className="w-3 h-3 text-white/40 md:text-white/20 group-hover/name:text-white/40 group-focus-within/name:text-white/60 transition-colors pointer-events-none" />
        </div>

        {/* Bio with visual hint */}
        <div className="w-full relative group/bio">
          <textarea
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value.slice(0, BIO_MAX))}
            placeholder="A line about your craft..."
            rows={3}
            className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm text-white/70 font-medium placeholder:text-white/15 outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
            style={{ fieldSizing: 'content', minHeight: '5rem' } as React.CSSProperties}
            id="edit-bio"
          />
          <div className="absolute right-4 top-4 opacity-40 md:opacity-0 md:group-hover/bio:opacity-100 group-focus-within/bio:opacity-0 transition-opacity pointer-events-none">
            <Pencil className="w-3 h-3 text-white/40 md:text-white/20" />
          </div>
          <span
            className={`absolute right-3 bottom-2 text-[9px] font-bold tabular-nums pointer-events-none transition-colors ${
              formData.bio.length >= BIO_MAX ? "text-white/50" : "text-white/15"
            }`}
          >
            {formData.bio.length}/{BIO_MAX}
          </span>
        </div>
      </div>

      {/* ─── Accordion Cards ───────────────────────────────────────── */}
      <AccordionCard
        title="Socials"
        icon={<Instagram className="w-3.5 h-3.5" />}
        isOpen={activeSection === "socials"}
        onToggle={() => toggleSection("socials")}
      >
        <div className="space-y-3 pt-2">
          <SocialInput
            icon={<Instagram className="w-4 h-4" />}
            label="Instagram"
            prefix="@"
            value={formData.socials.instagram}
            onChange={(v) =>
              updateSocial("instagram", v)
            }
            id="edit-social-instagram"
          />
          <SocialInput
            icon={<Twitter className="w-4 h-4" />}
            label="Twitter / X"
            prefix="@"
            value={formData.socials.twitter}
            onChange={(v) =>
              updateSocial("twitter", v)
            }
            id="edit-social-twitter"
          />
          <SocialInput
            icon={<Youtube className="w-4 h-4" />}
            label="YouTube"
            prefix=""
            value={formData.socials.youtube}
            onChange={(v) =>
              updateSocial("youtube", v)
            }
            id="edit-social-youtube"
          />
        </div>
      </AccordionCard>

      {/* ─── Distinct Password Reset Section ──────────────────────── */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          {activeSection !== "security" ? (
            <motion.button
              key="security-trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSection("security")}
              className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/5 text-white/30 group-hover:text-white transition-colors">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">
                  Reset Access Key
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/10 transition-transform -rotate-90 group-hover:translate-x-1" />
            </motion.button>
          ) : (
            <motion.div
              key="security-fields"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 p-6 rounded-2xl bg-white/[0.04] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 flex items-center gap-2">
                  <Lock className="w-3 h-3" /> Security Protocol
                </span>
                <button 
                  onClick={() => {
                    setActiveSection(null);
                    updateField("currentPassword", "");
                    updateField("newPassword", "");
                    updateField("confirmPassword", "");
                  }}
                  className="text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors px-2 py-1"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <PasswordInput
                  label="Current Password"
                  value={formData.currentPassword ?? ""}
                  onChange={(v) => updateField("currentPassword", v)}
                  id="edit-current-password"
                />
                <PasswordInput
                  label="New Password"
                  value={formData.newPassword ?? ""}
                  onChange={(v) => updateField("newPassword", v)}
                  id="edit-new-password"
                />
                <div className="relative">
                  <PasswordInput
                    label="Confirm New Password"
                    value={formData.confirmPassword ?? ""}
                    onChange={(v) => updateField("confirmPassword", v)}
                    id="edit-confirm-password"
                  />
                  {passwordsMatch && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-green-400/70" />
                  )}
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] font-bold uppercase tracking-widest text-red-400/70 pl-1"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={!passwordsMatch || !formData.currentPassword}
                onClick={handlePasswordSave}
                className="w-full py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <AnimatePresence mode="wait">
                  {isPasswordSaved ? (
                    <motion.span
                      key="pw-saved"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 text-green-400"
                    >
                      <Check className="w-3 h-3" /> Access Updated
                    </motion.span>
                  ) : (
                    <motion.span
                      key="pw-save"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <Lock className="w-3 h-3" /> Update Security Access
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Save Action ───────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.08)]"
        id="save-profile-btn"
      >
        <AnimatePresence mode="wait">
          {isSaved ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5" /> Changes Saved
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" /> Commit Changes
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 *  Sub-components
 * ──────────────────────────────────────────────────────────────────────── */

interface AccordionCardProps {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionCard({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: AccordionCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isOpen
          ? "bg-white/[0.04] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
          : "bg-white/[0.02] border-white/5 hover:border-white/10"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isOpen ? "bg-white/10 text-white" : "bg-white/5 text-white/30"
            }`}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/20 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SocialInputProps {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

function SocialInput({
  icon,
  label,
  prefix,
  value,
  onChange,
  id,
}: SocialInputProps) {
  const hasValue = value.trim().length > 0;
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group/input ${
        hasValue
          ? "border-white/15 bg-white/[0.04]"
          : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}
    >
      <div
        className={`shrink-0 transition-colors ${
          hasValue ? "text-white/60" : "text-white/20"
        }`}
      >
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25 shrink-0 w-14">
        {label}
      </span>
      <div className="w-px h-3.5 bg-white/10 shrink-0" />
      <div className="flex items-center gap-0.5 flex-1 min-w-0">
        {prefix && (
          <span className="text-sm font-bold text-white/20 shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="handle"
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent text-sm font-medium text-white placeholder:text-white/10 outline-none"
        />
        <Pencil className="w-2.5 h-2.5 text-white/10 opacity-0 group-hover/input:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

function PasswordInput({ label, value, onChange, id }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-[8px] font-bold uppercase tracking-[0.3em] text-white/25 mb-1.5 ml-1"
      >
        {label}
      </label>
      <div className="relative group/pass">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15 group-focus-within/pass:text-white/40 transition-colors" />
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-white/[0.04] border border-white/5 rounded-xl pl-10 pr-12 py-3 text-sm font-medium text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/10 hover:text-white/40 hover:bg-white/5 transition-all"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
