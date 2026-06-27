import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, UserPlus, Share2, Settings, Upload, Plus } from 'lucide-react';
import { FESTIVALS, SETS, ARTISTS_MOCK, GRID_ITEMS } from '../../mock';
import { CinematicPageHeader } from '../../components/CinematicPageHeader';
import { CommandCenter, CommandItem } from '../../components/CommandCenter';
import { FestivalSpotlightPlayer } from './components/FestivalSpotlightPlayer';
import { ArtistSpotlightGrid } from '../../components/ArtistSpotlightGrid';
import { TheatrePreviewSection } from '../theatre/components/TheatrePreviewSection';
import { UpdateFestivalModal } from './components/UpdateFestivalModal';
import { AddPanelistModal } from './components/AddPanelistModal';
import { OriginalArtist } from '../../types';

export function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const festival = useMemo(() => FESTIVALS.find(f => f.id === id), [id]);
  const set = useMemo(() => festival ? SETS.find(s => s.id === festival.setId) : null, [festival]);

  const [localFestival, setLocalFestival] = useState(festival);
  useEffect(() => {
    setLocalFestival(festival);
  }, [festival]);

  const festivalWorks = useMemo(() => GRID_ITEMS.filter(w => (w.platform === 'youtube' || w.platform === 'twitter') && w.srcId).slice(0, 5), []);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddPanelistModalOpen, setIsAddPanelistModalOpen] = useState(false);
  const [addedPanelists, setAddedPanelists] = useState<OriginalArtist[]>([]);

  const baseParticipants = useMemo(() => ARTISTS_MOCK.slice(0, 10), []);
  const participants = useMemo(() => {
    return [...addedPanelists, ...baseParticipants];
  }, [addedPanelists, baseParticipants]);

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
    const found = ARTISTS_MOCK.find(a => a.name.toLowerCase() === cleanHandle.toLowerCase()) || {
      ...ARTISTS_MOCK[0],
      id: `p-${Date.now()}`,
      name: cleanHandle,
    };
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
          <img 
            src={localFestival.coverImage} 
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] to-transparent opacity-80" />
        </div>

        <div className="relative z-10 px-4 md:px-8 pb-4 pt-20">
          <div className="max-w-4xl">
            {/* Status & Set */}
            <div className="flex items-center gap-3 mb-6">
               {isLive ? (
                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-[3px]">
                   <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
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
               <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl">
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
      <FestivalSpotlightPlayer works={festivalWorks} />

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
        works={festivalWorks}
        enterUrl={`/festivals/${localFestival.id}/theatre`}
      />

      {/* Modals */}
      {isUpdateModalOpen && localFestival && (
        <UpdateFestivalModal
          isOpen={isUpdateModalOpen}
          festival={localFestival}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={(updates) => setLocalFestival((prev) => (prev ? { ...prev, ...updates } : prev))}
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
