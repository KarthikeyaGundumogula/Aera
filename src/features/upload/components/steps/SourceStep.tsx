import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Upload, Image as ImageIcon, X, Plus, Link, Youtube, Twitter, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type {
  UpdateUploadFormData,
  UploadCategory,
  UploadPlatform,
  UploadStoryboardPage,
} from "../../types";

interface SourceStepProps {
  category: UploadCategory;
  platform: UploadPlatform;
  contentUrl: string;
  storyboardPages: UploadStoryboardPage[];
  originalIds: string[];
  setFormData: UpdateUploadFormData;
  onNext: () => void;
  onBack: () => void;
  isOriginalRelease?: boolean;
}

function extractYoutubeId(url: string): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  const matchV = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (matchV) return matchV[1];
  const matchPath = trimmed.match(/(?:youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (matchPath) return matchPath[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

function validateSourceUrl(url: string, platform: UploadPlatform): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  if (platform === "youtube") {
    const ytId = extractYoutubeId(trimmed);
    if (!ytId) {
      return "Invalid YouTube link format. Please provide a valid YouTube video URL or 11-character video ID.";
    }
  } else if (platform === "twitter") {
    const matchStatus = trimmed.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/i);
    const isDirectNumeric = /^\d{10,22}$/.test(trimmed);

    if (!matchStatus && !isDirectNumeric) {
      return "Invalid Twitter/X link format. Please provide a valid tweet status URL (e.g. x.com/user/status/123...) or status ID.";
    }
  }

  return null;
}

export function SourceStep({ 
  category,
  platform, 
  contentUrl, 
  storyboardPages,
  originalIds, 
  setFormData, 
  onNext, 
  onBack,
  isOriginalRelease
}: SourceStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPoster = category === "Poster";
  const isStoryboard = category === "Storyboard";

  const activePlatform = isOriginalRelease ? "youtube" : platform;

  // ─── Async Remote Validation State (oEmbed API) ───────────────────────────
  const [isValidating, setIsValidating] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [verifiedUrl, setVerifiedUrl] = useState<string>("");

  const formatError = !isPoster && !isStoryboard ? validateSourceUrl(contentUrl, activePlatform) : null;

  useEffect(() => {
    if (isPoster || isStoryboard || !contentUrl.trim() || formatError) {
      setRemoteError(null);
      setIsValidating(false);
      return;
    }

    if (contentUrl.trim() === verifiedUrl) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsValidating(true);
      setRemoteError(null);

      try {
        if (activePlatform === "youtube") {
          const ytId = extractYoutubeId(contentUrl.trim());
          const targetUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : contentUrl.trim();
          const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`);
          if (!isMounted) return;

          if (res.status === 404 || !res.ok) {
            setRemoteError("Video not found on YouTube. Please check the URL/ID or privacy settings.");
          } else {
            setVerifiedUrl(contentUrl.trim());
            setRemoteError(null);
          }
        } else if (activePlatform === "twitter") {
          const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(contentUrl.trim())}`);
          if (!isMounted) return;

          if (res.status === 404 || !res.ok) {
            setRemoteError("Tweet not found on Twitter/X. Please check the status URL.");
          } else {
            setVerifiedUrl(contentUrl.trim());
            setRemoteError(null);
          }
        }
      } catch (e) {
        // If CORS or network issue, don't hard block valid-formatted URLs
        if (isMounted) setRemoteError(null);
      } finally {
        if (isMounted) setIsValidating(false);
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [contentUrl, activePlatform, formatError, isPoster, isStoryboard, verifiedUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (isStoryboard) {
      const newPages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        text: ""
      }));
      setFormData({ storyboardPages: [...storyboardPages, ...newPages].slice(0, 10) });
    } else {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setFormData({ contentUrl: url });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setFormData({ contentUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStoryboardPage = (index: number) => {
    const updated = storyboardPages.filter((_, i) => i !== index);
    setFormData({ storyboardPages: updated });
  };

  const updatePageText = (index: number, text: string) => {
    const updated = [...storyboardPages];
    updated[index] = { ...updated[index], text };
    setFormData({ storyboardPages: updated });
  };

  const activeError = formatError || remoteError;
  const canProceed = isStoryboard
    ? storyboardPages.length > 0
    : !!contentUrl.trim() && !activeError && !isValidating;

  return (
    <motion.div
      key="step-source"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="w-full max-w-xl"
    >
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Link className="w-4 h-4 text-white/50" />
          <h2 className="text-sm font-bold uppercase tracking-[0.3em]">The Source</h2>
        </div>
        <p className="text-white/40 text-xs text-balance">
          {isPoster 
            ? "Upload the high-resolution master of your poster"
            : isStoryboard
              ? "Upload storyboard pages and add their narrative (Max 10)"
              : `Link your work for the ${originalIds?.length || 0} selected film${(originalIds?.length !== 1) ? 's' : ''}`
          }
        </p>
      </div>
      
      <div className="space-y-8">
        {(!isPoster && !isStoryboard) ? (
          /* ── VIDEO SOURCE (EDIT) ── */
          <>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setFormData({ platform: "youtube" })}
                className={`flex-1 p-5 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3 ${
                  activePlatform === "youtube"
                    ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <Youtube className="w-5 h-5 text-red-500" />
                <div className="text-xs font-black uppercase tracking-widest">
                  YouTube {isOriginalRelease ? "(Official Source)" : ""}
                </div>
              </button>
              
              {!isOriginalRelease && (
                <button 
                  type="button"
                  onClick={() => setFormData({ platform: "twitter" })}
                  className={`flex-1 p-5 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3 ${
                    activePlatform === "twitter"
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <div className="text-xs font-black uppercase tracking-widest">Twitter / X</div>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <input 
                  type="url"
                  placeholder={activePlatform === 'youtube' ? "Paste YouTube link or Video ID (e.g. youtube.com/watch?v=...)" : "Paste Twitter/X status link (e.g. x.com/user/status/...)"}
                  autoFocus
                  value={contentUrl}
                  onChange={(e) => setFormData({ contentUrl: e.target.value })}
                  className={`w-full bg-white/5 border rounded-2xl p-6 pr-14 text-base font-mono outline-none transition-all placeholder:text-white/20 ${
                    activeError
                      ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : verifiedUrl && contentUrl.trim() === verifiedUrl
                      ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      : "border-white/10 focus:border-white focus:ring-2 focus:ring-white/20"
                  }`}
                />
                
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isValidating ? (
                    <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                  ) : activeError ? (
                    <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
                  ) : verifiedUrl && contentUrl.trim() === verifiedUrl ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : null}
                </div>
              </div>

              {activeError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-red-400 pl-2 tracking-wide flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeError}</span>
                </motion.p>
              )}
              {isValidating && (
                <p className="text-[10px] font-bold text-yellow-400/80 pl-2 tracking-widest uppercase animate-pulse">
                  Verifying Media Existence on {activePlatform === "youtube" ? "YouTube" : "Twitter"}…
                </p>
              )}
            </div>
          </>
        ) : isPoster ? (
          /* ── POSTER SOURCE ── */
          <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {!contentUrl ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[16/6] rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center gap-4 hover:bg-white/[0.04] hover:border-white/20 transition-all group"
              >
                <div className="p-4 rounded-xl bg-white/5 text-white/40 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Upload Original Master</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">PNG, JPG or WebP up to 50MB</p>
                </div>
              </button>
            ) : (
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[16/6]">
                <img loading="lazy" src={contentUrl} className="w-full h-full object-cover opacity-60" alt="Poster preview" />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                   <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                      <ImageIcon className="w-4 h-4 text-white/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Master Artifact Ready</span>
                   </div>
                   <button 
                    onClick={removeFile}
                    className="p-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── STORYBOARD SOURCE (MULTI-IMAGE + TEXT) ── */
          <div className="space-y-6">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {storyboardPages.map((page, idx) => (
                  <motion.div 
                    key={page.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 group"
                  >
                    <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shrink-0">
                      <img
                        loading="lazy"
                        src={page.url}
                        className="w-full h-full object-cover object-top"
                        alt={`Page ${idx + 1}`}
                      />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Page Narrative</span>
                        <button 
                          onClick={() => removeStoryboardPage(idx)}
                          className="p-1 text-white/20 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <textarea 
                        value={page.text}
                        onChange={(e) => updatePageText(idx, e.target.value)}
                        placeholder="Add cinematic notes for this page..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-xl p-3 text-[11px] leading-relaxed font-medium outline-none focus:border-white/20 transition-all resize-none placeholder:text-white/5"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {storyboardPages.length < 10 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.03] hover:border-white/10 transition-all group"
                >
                  <Plus className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/40">
                    Add {storyboardPages.length > 0 ? "Another Page" : "First Page"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ChevronLeft className="w-4 h-4" /> BACK
          </button>
          <button 
            disabled={!canProceed}
            onClick={onNext} 
            className="px-10 py-4 bg-white text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 disabled:opacity-30 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
             NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
