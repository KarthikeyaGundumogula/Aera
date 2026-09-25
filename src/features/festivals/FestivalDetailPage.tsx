import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Share2, Settings, Upload, Plus } from 'lucide-react';
import { CinematicPageHeader } from '../../components/CinematicPageHeader';
import { CommandCenter, CommandItem } from '../../components/CommandCenter';
import { RecentReleasesSection } from '../shared/components/RecentReleasesSection';
import { FestivalSpotlightPlayer } from './components/FestivalSpotlightPlayer';
import { ArtistSpotlightGrid } from '../../components/ArtistSpotlightGrid';
import { TheatrePreviewSection } from '../theatre/components/TheatrePreviewSection';
import { UpdateFestivalModal } from './components/UpdateFestivalModal';
import { AddPanelistModal } from './components/AddPanelistModal';
import { OriginalArtist, ReleaseSectionWork, TheatreItem } from '../../types';
import { PosterImage } from '../../components/PosterImage';
import { apiFetch } from '@/lib/api';

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [localFestival, setLocalFestival] = useState<any>(null);
  const [set, setSet] = useState<any>({ id: "set-1", title: "Set" });
  const [spotlightWorks, setSpotlightWorks] = useState<ReleaseSectionWork[]>([]);
  const [theatreWorks, setTheatreWorks] = useState<TheatreItem[]>([]);
  const [backendPanelists, setBackendPanelists] = useState<OriginalArtist[]>([]);
  const [addedPanelists, setAddedPanelists] = useState<OriginalArtist[]>([]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddPanelistModalOpen, setIsAddPanelistModalOpen] = useState(false);

  // ─── Query 1: Festival Metadata + Panelist Spotlight Cards ────────────────
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiFetch(`/festivals/${id}?panelist_limit=12`)
      .then(async (res) => {
        if (res.ok && isMounted) {
          const json = await res.json();
          const data = json.data;
          setLocalFestival(data);
          if (data?.panelists && Array.isArray(data.panelists)) {
            setBackendPanelists(data.panelists);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch festival detail:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─── Query 2: Spotlight Works Feed ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiFetch(`/festivals/${id}/spotlight_works?limit=6`)
      .then(async (res) => {
        if (res.ok && isMounted) {
          const json = await res.json();
          const items = json.data?.items ?? [];
          setSpotlightWorks(items);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch festival spotlight works:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ─── Query 3: Theatre Works Feed ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiFetch(`/festivals/${id}/theatre_works?limit=8`)
      .then(async (res) => {
        if (res.ok && isMounted) {
          const json = await res.json();
          const items = json.data?.items ?? [];
          const mapped: TheatreItem[] = items.map((w: any) => ({
            id: w.id,
            title: w.title || undefined,
            category: w.workType,
            thumbnail: w.thumbnail || undefined,
            image: w.thumbnail || undefined,
            srcId: w.srcId,
            platform: w.platform?.toLowerCase(),
          }));
          setTheatreWorks(mapped);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch festival theatre works:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const participants = useMemo(() => {
    return [...addedPanelists, ...backendPanelists];
  }, [addedPanelists, backendPanelists]);

  const festivalRules: string[] = useMemo(() => {
    if (!localFestival?.rules) return [];
    if (Array.isArray(localFestival.rules)) return localFestival.rules;
    if (typeof localFestival.rules === 'string') {
      return localFestival.rules
        .split('\n')
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0);
    }
    return [];
  }, [localFestival?.rules]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleShare = useCallback(() => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    void navigator.clipboard?.writeText(shareUrl);
  }, []);

  if (!localFestival || !set) return null;

  const isLive = localFestival.status === 'LIVE';

  const handleAddPanelist = (handle: string) => {
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    const found = {
      id: `p-${Date.now()}`,
      name: cleanHandle,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}`,
      spirit: 0,
      works: 0,
    } as OriginalArtist;
    setAddedPanelists(prev => [found, ...prev]);
  };

  const festivalCommands: CommandItem[] = [
    { 
      label: 'Update Festival', 
      icon: <Settings className="w-4 h-4" />, 
      action: () => setIsUpdateModalOpen(true),
      description: 'Curation & Rules (Organizer)',
      visible: true,
    },
    { 
      label: 'Panelist Upload', 
      icon: <Upload className="w-4 h-4 text-yellow-400" />, 
      action: () => navigate(`/works/new?festivalId=${id}&role=panelist`),
      description: 'Submit Official Entry',
      visible: true,
    },
    { 
      label: 'Member Upload', 
      icon: <Upload className="w-4 h-4" />, 
      action: () => navigate(`/works/new?festivalId=${id}&role=member`),
      description: 'Submit Community Work',
      visible: true,
    },
    { 
      label: 'Add Panelist', 
      icon: <Plus className="w-4 h-4" />, 
      action: () => setIsAddPanelistModalOpen(true),
      description: 'Invite Creator (Organizer)',
      visible: true,
    },
    { 
      label: 'Share', 
      icon: <Share2 className="w-4 h-4" />, 
      action: handleShare,
      description: 'Copy festival link',
      visible: true,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-deep text-white">
      <CinematicPageHeader
        title={localFestival.title}
        onBack={() => navigate(-1)}
        onTitleClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        rightActions={<CommandCenter contextTitle="Festival Actions" items={festivalCommands} />}
      />

      {/* ─── Layer I: Atmos Header ────────────────────────────────────────── */}
      <section className="relative w-full h-[60vh] md:h-[75vh] flex flex-col justify-end">
        {/* Immersive Cover Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {localFestival.coverImage ? (
            <PosterImage 
              src={localFestival.coverImage} 
              alt={localFestival.title}
              info={localFestival.status}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-top opacity-60 mix-blend-screen"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] to-transparent opacity-80" />
        </div>

        <div className="relative z-10 px-4 md:px-8 pb-4 pt-20">
          <div className="max-w-4xl">
            {/* Status & Set */}
            <div className="flex items-center gap-3 mb-6">
               {isLive ? (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-[3px]">
                   <span className="w-1.5 h-1.5 rounded-xl bg-white animate-pulse" />
                   <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white">Live</span>
                 </div>
               ) : (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-[3px]">
                   <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/50">Archived</span>
                 </div>
               )}
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">
                 {set.title}
               </span>
            </div>

            <h1 
              className="font-black text-white uppercase tracking-tight leading-[0.9] mb-6 drop-shadow-2xl"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
            >
              {localFestival.title}
            </h1>

            <p className="text-xs md:text-sm text-white/50 leading-relaxed max-w-2xl mb-8">
              {localFestival.description}
            </p>

            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-xl backdrop-blur-md shadow-2xl">
                 <Clock className="w-4 h-4 text-white/40" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                   {new Date(localFestival.endDate).toLocaleDateString()}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Festival Statements & Rules ───────────────────────────────────── */}
      {festivalRules.length > 0 && (
        <section className="px-4 md:px-8 pt-8 pb-4 max-w-6xl mx-auto w-full" aria-label="Festival Statements & Rules">
          <div className="bg-surface-deep/80 border border-white/[0.06] rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Festival Statements & Rules
              </h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {festivalRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                  <span className="font-mono text-xs font-bold text-amber-500/60 mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs md:text-sm text-white/80 leading-relaxed font-sans font-medium">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ─── Layer II: Panelist Spotlight ─────────────────────────────────── */}
      {spotlightWorks.length > 0 ? (
        <FestivalSpotlightPlayer works={spotlightWorks} />
      ) : (
        <RecentReleasesSection 
          title="Panelist Spotlight" 
          works={spotlightWorks}
          className="pt-4 pb-6"
        />
      )}

      {/* ─── Layer III: Participants ──────────────────────────────────────── */}
      <ArtistSpotlightGrid 
        title="Participants"
        artists={participants}
        rows={2}
        variant="default"
        containerClassName="pt-4 pb-6"
      />

      {/* ─── Layer IV: Festival Theatre Preview ───────────────────────────── */}
      <TheatrePreviewSection
        title={`${localFestival.title} Archive`}
        works={theatreWorks}
        enterUrl={`/festivals/${localFestival.id}/theatre`}
      />

      {/* Modals */}
      {isUpdateModalOpen && localFestival && (
        <UpdateFestivalModal
          isOpen={isUpdateModalOpen}
          festival={localFestival}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={(updates) => setLocalFestival((prev: any) => (prev ? { ...prev, ...updates } : prev))}
        />
      )}

      {isAddPanelistModalOpen && (
        <AddPanelistModal
          isOpen={isAddPanelistModalOpen}
          onClose={() => setIsAddPanelistModalOpen(false)}
          onAdd={handleAddPanelist}
        />
      )}
    </div>
  );
}
