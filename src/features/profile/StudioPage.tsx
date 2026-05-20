import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Film, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudioWorkCard } from "./components/StudioWorkCard";
import { LiveStagePreview } from "./components/LiveStagePreview";
import { ORIGINALS } from "../../mock";
import { UploadStudioFlow } from "../upload/components/UploadStudioFlow";
import { Logo } from "../../components/Logo";
import { ProfileNav } from "../../components/ProfileNav";
import ArtistSetupPage from "./ArtistSetupPage";

export default function StudioPage() {
  const { currentArtist, userWorks, updateProfile, updateWorkTitle, logout } = useAuth();
  const navigate = useNavigate();

  // Dialog / Upload Flow overlay state
  const [isDelivering, setIsDelivering] = useState(false);

  // Profile Form States
  const [stageName, setStageName] = useState("");
  const [tagline, setTagline] = useState("");
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState("50% 0%");

  // Sync profile details when loaded
  useEffect(() => {
    if (currentArtist) {
      setStageName(currentArtist.name || "");
      setTagline(currentArtist.bio || "");
      setPortraitPreview(currentArtist.image || null);
      setImagePosition(currentArtist.imagePosition || "50% 0%");
    }
  }, [currentArtist]);

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
    });
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden pb-32">
      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 md:px-8 md:py-6 bg-black/45 backdrop-blur-xl border-b border-white/5">
        <Logo onClick={() => navigate("/")} showText={false} />
        <div className="flex items-center gap-8">
          <ProfileNav />
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pt-24 mt-4 flex flex-col gap-10">
        {/* ─── Redesigned Contained 1:1 Live Stage Preview ─── */}
        <LiveStagePreview
          username={currentArtist.id.toUpperCase().replace("ART-", "")}
          displayName={stageName}
          tagline={tagline}
          portrait={portraitPreview}
          imagePosition={imagePosition}
          themeTextColor={currentArtist.themeTextColor || "#fac107"}
          themeBgColor={currentArtist.themeBgColor || "#0f1a42"}
          socials={currentArtist.socials}
          onTextColorChange={(color) => updateProfile({ themeTextColor: color })}
          onBgColorChange={(color) => updateProfile({ themeBgColor: color })}
          onPortraitChange={(_file, preview) => setPortraitPreview(preview)}
          onImagePositionChange={(pos) => {
            setImagePosition(pos);
            updateProfile({ imagePosition: pos });
          }}
        />

        {/* ─── Stage Control parameters Panel ─── */}
        <section className="bg-[#0b0c10] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Identity inputs */}
          <div className="lg:col-span-10 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              Identity parameters
            </h3>
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
            </div>
          </div>

          {/* Action trigger panel */}
          <div className="lg:col-span-2 flex flex-col justify-end gap-3 self-stretch lg:pt-6">
            <button
              onClick={handleProfileSave}
              disabled={
                stageName.trim() === currentArtist.name &&
                tagline.trim() === (currentArtist.bio || "") &&
                portraitPreview === currentArtist.image &&
                imagePosition === (currentArtist.imagePosition || "50% 0%")
              }
              className="w-full py-3.5 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Save Stage
            </button>
            <button
              onClick={logout}
              className="w-full py-3.5 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Exit Session
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
                  Media Pool
                </h2>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                  Project files & releases ({userWorks.length} items)
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDelivering(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-[0.2em] shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Deliver Work
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
                Deliver your first cinematic work to establish your timeline.
              </p>
              <button
                onClick={() => setIsDelivering(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Deliver First Work
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Delivery / Upload Flow dialog overlay */}
      <AnimatePresence>
        {isDelivering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md overflow-y-auto"
          >
            <UploadStudioFlow
              exitLabel="Cancel Release"
              headerEyebrow="Studio Release Flow"
              title={"Initiate\nRelease"}
              onExit={() => setIsDelivering(false)}
              onComplete={() => setIsDelivering(false)}
              originals={ORIGINALS}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
