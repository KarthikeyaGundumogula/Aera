import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Film, Plus, X, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudioWorkCard } from "./components/StudioWorkCard";
import { LiveStagePreview } from "./components/LiveStagePreview";
import { ORIGINALS } from "../../mock";
import { UploadStudioFlow } from "../upload/components/UploadStudioFlow";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import ArtistSetupPage from "./ArtistSetupPage";
import { PasswordResetModal } from "./components/PasswordResetModal";
import { UnsavedChangesModal } from "./components/UnsavedChangesModal";

export default function StudioPage() {
  const { currentArtist, userWorks, updateProfile, updateWorkTitle, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form States
  const [stageName, setStageName] = useState("");
  const [tagline, setTagline] = useState("");
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState("50% 0%");
  const [socials, setSocials] = useState({
    instagram: "",
    twitter: "",
    youtube: "",
  });

  const [themeTextColor, setThemeTextColor] = useState("#fac107");
  const [themeBgColor, setThemeBgColor] = useState("#0f1a42");

  // Modals state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const isNavigatingRef = useRef(false);

  // Sync profile details when loaded
  useEffect(() => {
    if (currentArtist) {
      setStageName(currentArtist.name || "");
      setTagline(currentArtist.bio || "");
      setPortraitPreview(currentArtist.image || null);
      setImagePosition(currentArtist.imagePosition || "50% 0%");
      setSocials({
        instagram: currentArtist.socials?.instagram || "",
        twitter: currentArtist.socials?.twitter || "",
        youtube: currentArtist.socials?.youtube || "",
      });
      setThemeTextColor(currentArtist.themeTextColor || "#fac107");
      setThemeBgColor(currentArtist.themeBgColor || "#0f1a42");
    }
  }, [currentArtist]);

  const isDirty = 
    stageName.trim() !== currentArtist?.name ||
    tagline.trim() !== (currentArtist?.bio || "") ||
    portraitPreview !== currentArtist?.image ||
    imagePosition !== (currentArtist?.imagePosition || "50% 0%") ||
    socials.instagram !== (currentArtist?.socials?.instagram || "") ||
    socials.twitter !== (currentArtist?.socials?.twitter || "") ||
    socials.youtube !== (currentArtist?.socials?.youtube || "") ||
    themeTextColor !== (currentArtist?.themeTextColor || "#fac107") ||
    themeBgColor !== (currentArtist?.themeBgColor || "#0f1a42");

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Prevent browser back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      if (isNavigatingRef.current) return;

      // The trap state was popped, meaning we are at the real URL now.
      // We pause here to show the modal.
      setPendingNavigation(() => () => {
        isNavigatingRef.current = true;
        window.history.back();
      });
      setIsWarningModalOpen(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  const handleNavigation = (path: string) => {
    if (isDirty) {
      setPendingNavigation(() => () => {
        isNavigatingRef.current = true;
        navigate(path);
      });
      setIsWarningModalOpen(true);
      return;
    }
    isNavigatingRef.current = true;
    navigate(path);
  };

  const handleConfirmLeave = () => {
    setIsWarningModalOpen(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelLeave = () => {
    setIsWarningModalOpen(false);
    setPendingNavigation(null);
    // If the pending navigation was a back button press, we must re-push the trap state
    // because it was already popped by the browser.
    window.history.pushState(null, "", window.location.href);
  };

  // If not logged in, render the Stage setup (ArtistSetupPage)
  if (!currentArtist) {
    return <ArtistSetupPage />;
  }

  const handleProfileSave = () => {
    updateProfile({
      name: stageName,
      bio: tagline,
      image: portraitPreview || currentArtist.image,
      imagePosition: imagePosition,
      socials: socials,
      themeTextColor,
      themeBgColor,
    });
    // Optional: reset navigation ref if they save and stay
    isNavigatingRef.current = false;
  };

  return (
    <div className="relative min-h-screen bg-surface-deep text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pb-32">
      {/* Mobile Header */}
      <MobileTopHeader showSearch={false} />

      {/* Header bar (Desktop) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-[100] items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-black/30 backdrop-blur-md border-b border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <Logo onClick={() => handleNavigation("/")} showText={false} />
        <div className="flex items-center gap-8">
          <ProfileNav beforeNavigate={(path) => {
            if (isDirty) {
              setPendingNavigation(() => () => {
                isNavigatingRef.current = true;
                navigate(path);
              });
              setIsWarningModalOpen(true);
              return false; // Prevent ProfileNav from navigating immediately
            }
            isNavigatingRef.current = true;
            return true;
          }} />
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-24 mt-4 flex flex-col gap-10">
        {/* ─── Redesigned Contained 1:1 Live Stage Preview ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Customize Your Stage Colors Below
            </span>
          </div>
          <LiveStagePreview
            username={currentArtist.id.toUpperCase().replace("ART-", "")}
            displayName={stageName}
            tagline={tagline}
            portrait={portraitPreview}
            imagePosition={imagePosition}
            themeTextColor={themeTextColor}
            themeBgColor={themeBgColor}
            socials={currentArtist.socials}
            onTextColorChange={setThemeTextColor}
            onBgColorChange={setThemeBgColor}
            onPortraitChange={(_file, preview) => setPortraitPreview(preview)}
            onImagePositionChange={setImagePosition}
          />
        </div>

        {/* ─── Stage Control parameters Panel ─── */}
        <section className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Inputs */}
          <div className="lg:col-span-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-1.5">
                <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                  Stage name
                </label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:border-white/30 focus:bg-white/10 outline-none transition-all"
                  placeholder="ENTER STAGE NAME"
                />
              </div>

              <div className="md:col-span-8 space-y-1.5">
                <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                  Tagline Bio
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all leading-relaxed"
                  placeholder="A line about your stage character..."
                />
              </div>

              {/* Socials */}
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    Instagram
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.instagram}
                      onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="@username"
                    />
                    {socials.instagram && (
                      <button
                        onClick={() => setSocials({ ...socials, instagram: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    Twitter / X
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.twitter}
                      onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="@username"
                    />
                    {socials.twitter && (
                      <button
                        onClick={() => setSocials({ ...socials, twitter: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-[0.25em] text-white/30 pl-1">
                    YouTube
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={socials.youtube}
                      onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white/70 focus:border-white/30 focus:bg-white/10 outline-none transition-all pr-10"
                      placeholder="Channel URL / Handle"
                    />
                    {socials.youtube && (
                      <button
                        onClick={() => setSocials({ ...socials, youtube: "" })}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action trigger panel */}
          <div className="lg:col-span-2 flex flex-col justify-end gap-3 self-stretch lg:pt-6">
            <button
              onClick={handleProfileSave}
              disabled={!isDirty}
              className="w-full py-3.5 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Save Stage
            </button>
          </div>
        </section>

        {/* ─── Security Settings Panel ─── */}
        <section className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-white/40" />
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
                  Security Settings
                </h2>
              </div>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                Manage your account credentials and access
              </p>
            </div>
            
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
            >
              Update Password
            </button>
          </div>
        </section>

        {/* ─── Media Pool (Resolve-themed Grid Section) ─── */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Film className="w-5 h-5 text-white/40" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white/80">
                  Studio
                </h2>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                  Releases ({userWorks.length} items)
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavigation("/works/new")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Release
            </button>
          </div>

          {userWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userWorks.map((work) => (
                <StudioWorkCard
                  key={work.id}
                  item={work}
                  onRename={(newTitle) => updateWorkTitle(work.id, newTitle)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl py-24 px-6 text-center bg-white/[0.01]">
              <Film className="w-12 h-12 text-white/10 mb-4" />
              <h3 className="text-base font-black uppercase tracking-widest text-white/60 mb-2">
                Empty Media Pool
              </h3>
              <p className="text-xs text-white/30 uppercase tracking-[0.3em] max-w-sm mb-8 leading-relaxed">
               Release your first cinematic work to establish your timeline.
              </p>
              <button
                onClick={() => handleNavigation("/works/new")}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Release First Work
              </button>
            </div>
          )}
        </section>
      </div>

      <PasswordResetModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <UnsavedChangesModal
        isOpen={isWarningModalOpen}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
