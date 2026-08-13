import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Share2, Settings, Upload, Plus } from 'lucide-react';
import { CinematicPageHeader } from '../../components/CinematicPageHeader';
import { CommandCenter, CommandItem } from '../../components/CommandCenter';
import { FestivalSpotlightPlayer } from './components/FestivalSpotlightPlayer';
import { ArtistSpotlightGrid } from '../../components/ArtistSpotlightGrid';
import { TheatrePreviewSection } from '../theatre/components/TheatrePreviewSection';
import { UpdateFestivalModal } from './components/UpdateFestivalModal';
import { AddPanelistModal } from './components/AddPanelistModal';
import { OriginalArtist, ReleaseSectionWork, TheatreItem } from '../../types';
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
          const data = json.festival || json.data || json;
          setLocalFestival(data);
          if (data.panelists && Array.isArray(data.panelists)) {
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

  // ─── Query 2: Spotlight Works + Theatre Works (Paginated Feeds) ───────────
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiFetch(`/festivals/${id}/works?spotlight_limit=6&theatre_limit=8`)
      .then(async (res) => {
        if (res.ok && isMounted) {
          const json = await res.json();
          const data = json.data || json;
          if (data.spotlightWorks && Array.isArray(data.spotlightWorks)) {
            setSpotlightWorks(data.spotlightWorks);
          }
          if (data.theatreWorks && Array.isArray(data.theatreWorks)) {
            const mapped: TheatreItem[] = data.theatreWorks.map((w: any) => ({
              id: w.id,
              title: w.title || undefined,
              category: w.workType,
              image: w.thumbnail || undefined,
            }));
            setTheatreWorks(mapped);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch festival works:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const participants = useMemo(() => {
    return [...addedPanelists, ...backendPanelists];
  }, [addedPanelists, backendPanelists]);

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
            <img 
              src={localFestival.coverImage} 
              alt=""
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

      {/* ─── Layer II: Panelist Spotlight ─────────────────────────────────── */}
      <FestivalSpotlightPlayer works={spotlightWorks} />

      {/* ─── Layer III: Participants ──────────────────────────────────────── */}
      <ArtistSpotlightGrid 
        title="Participants"
        artists={participants}
        rows={2}
        variant="default"
        containerClassName="pt-6 pb-12"
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
