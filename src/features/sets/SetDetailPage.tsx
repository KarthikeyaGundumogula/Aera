import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Film,
  Sparkles,
  Settings,
  Plus,
  Heart,
  BookPlus,
  Upload,
  LogOut,
  MessageSquare,
  Loader2,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThoughtCard } from "../shared/thoughts/ThoughtCard";
import { ActiveFestivalSpotlight } from "./components/ActiveFestivalSpotlight";
import { FestivalArchive } from "./components/FestivalArchive";
import { TheatrePreviewSection } from "../theatre/components/TheatrePreviewSection";
import { CinematicPageHeader } from "../../components/CinematicPageHeader";
import { CommandCenter, CommandItem } from "../../components/CommandCenter";
import { SectionHeader } from "../../components/SectionHeader";
import { UpdateSetModal } from "./components/UpdateSetModal";
import { CreateFestivalModal } from "./components/CreateFestivalModal";
import { NotFoundOverlay } from "../../components/NotFoundOverlay";
import { apiFetch } from "@/lib/api";
import { Set as SetType, Festival } from "../../types/sets";
import { TheatreItem } from "../../types";

/**
 * SetDetailPage — /sets/:id
 */
export function SetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentArtist } = useAuth();

  const [localSet, setLocalSet] = useState<SetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [theatreWorks, setTheatreWorks] = useState<TheatreItem[]>([]);
  const [fetchedFestivals, setFetchedFestivals] = useState<Festival[]>([]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiFetch(`/sets/${id}`),
      apiFetch(`/sets/${id}/discussions`),
      apiFetch(`/sets/${id}/theatre`),
      apiFetch(`/festivals`),
    ])
      .then(async ([setRes, discRes, theatreRes, festRes]) => {
        if (setRes.ok) {
          const json = await setRes.json();
          const remote = json.data || json;
          if (remote && isMounted) {
            const mappedMembers = (remote.members || []).map((m: any) => ({
              profileId: m.profileId || m.profile_id,
              role: m.role || "Member",
              joinedAt: m.joinedAt || m.joined_at || new Date().toISOString(),
            }));

            const mappedSet = {
              id: remote.id,
              title: remote.title,
              description: remote.description,
              captainId: remote.captainId || remote.captain_id,
              coverImage: remote.coverImage || remote.cover_image || "",
              accentColor: remote.accentColor || remote.accent_color,
              themeLine: remote.themeLine || remote.theme_line || "",
              members: mappedMembers,
              memberCount: remote.memberCount ?? remote.member_count ?? mappedMembers.length,
              totalFestivals: remote.totalFestivals ?? remote.total_festivals,
              liveFestivals: remote.liveFestivals ?? remote.live_festivals,
              isMember: remote.isMember ?? remote.is_member,
              activeFestivalId: remote.activeFestivalId || remote.active_festival_id,
              festivalStatus: remote.festivalStatus || remote.festival_status,
              tickerText: remote.tickerText || remote.ticker_text,
            };
            setLocalSet(mappedSet);

            if (currentArtist?.id) {
              const userInMembers = mappedMembers.some(
                (m: any) => String(m.profileId) === String(currentArtist.id)
              );
              if (userInMembers || remote.isMember || remote.is_member) {
                setIsJoined(true);
              }
            }
          }
        }

        if (discRes.ok) {
          const json = await discRes.json();
          const list = json.data || json;
          if (Array.isArray(list) && isMounted) {
            setDiscussions(list);
          }
        }

        if (theatreRes && theatreRes.ok) {
          const json = await theatreRes.json();
          const list = json.data || json;
          if (Array.isArray(list) && isMounted) {
            setTheatreWorks(list);
          }
        }

        if (festRes && festRes.ok) {
          const json = await festRes.json();
          const list = json.data || json;
          if (Array.isArray(list) && isMounted) {
            const mappedFestivals: Festival[] = list.map((f: any) => ({
              id: f.id,
              setId: f.setId || f.set_id || "",
              organizerId: f.organizerId || f.organizer_id || "",
              title: f.title || f.name || "Festival",
              description: f.description || "",
              rules: Array.isArray(f.rules) ? f.rules : f.rules ? [f.rules] : [],
              startDate: f.startDate || f.start_date || new Date().toISOString(),
              endDate: f.endDate || f.end_date || new Date().toISOString(),
              coverImage: f.coverImage || f.cover_image || "",
              status: f.status || "LIVE",
              presenceLeader: f.presenceLeader || f.presence_leader,
            }));
            setFetchedFestivals(mappedFestivals);
          }
        }
      })
      .catch((err) => {
        console.error("[SetDetailPage] Failed to fetch set details:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, currentArtist?.id]);

  const set = localSet;

  const allFestivals = useMemo(() => {
    return fetchedFestivals.filter((f) => String(f.setId) === String(id));
  }, [fetchedFestivals, id]);

  const activeFestival = useMemo(() => {
    if (!set) return null;
    if (set.activeFestivalId) {
      const match = allFestivals.find((f) => String(f.id) === String(set.activeFestivalId));
      if (match) return match;
    }
    return (
      allFestivals.find((f) => f.status === "LIVE" || f.status === "UPCOMING") ||
      allFestivals[0] ||
      null
    );
  }, [set, allFestivals]);

  const captain = null as { id: string; name: string; profilePicture?: string } | null;

  const setWorks = useMemo(() => {
    if (!theatreWorks || !Array.isArray(theatreWorks)) return [];
    return theatreWorks.map((w: any) => ({
      id: w.id,
      title: w.title || "Untitled",
      type: (w.workType || w.work_type || w.category || "EDIT").toLowerCase() as any,
      thumbnail: w.thumbnail || "",
      artistId: w.artistId || w.artist_id || "",
      artistName: w.artistName || w.artist_name || "",
    }));
  }, [theatreWorks]);

  const setThoughts = useMemo(() => {
    return discussions.map((d: any) => ({
      id: d.id,
      artistId: d.author_id || "artist-1",
      originalId: "",
      originalTitle: "",
      thoughtText: d.body || "",
      createdAt: d.created_at || new Date().toISOString(),
      hits: d.comment_count || 0,
      text: d.title ? `${d.title}\n\n${d.body}` : d.body,
      artistName: d.author_name || "Artist",
      artistPicture: d.author_avatar || "",
      setId: id || "",
      timestamp: d.created_at ? new Date(d.created_at).toLocaleDateString() : "Just now",
    }));
  }, [id, discussions]);

  const [isJoined, setIsJoined] = useState(false);
  const memberCount = set?.memberCount ?? ((set?.members?.length ?? 0) + (isJoined ? 1 : 0));
  const festivalCount = set?.totalFestivals ?? allFestivals.length;
  const liveFestivalsCount = set?.liveFestivals ?? (activeFestival ? 1 : 0);

  const isCreator = useMemo(() => {
    if (!currentArtist?.id || !set?.captainId) return false;
    return String(currentArtist.id) === String(set.captainId);
  }, [currentArtist?.id, set?.captainId]);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("As you are the creator, you can't leave the set");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleToggleJoin = async () => {
    if (!id) return;
    if (!isJoined) {
      try {
        const res = await apiFetch("/sets/join", {
          method: "POST",
          body: JSON.stringify({ set_id: id }),
        });
        if (res.ok) {
          setIsJoined(true);
          triggerToast("Successfully joined set!");
        } else {
          const json = await res.json().catch(() => ({}));
          const errMsg = json.error || json.message || "Failed to join set. Please try again.";
          triggerToast(errMsg);
        }
      } catch (err) {
        console.error("[SetDetailPage] Error joining set:", err);
        triggerToast("Failed to join set. Please try again.");
      }
    } else {
      if (isCreator) {
        triggerToast("As you are the creator, you can't leave the set");
        return;
      }

      try {
        const res = await apiFetch(`/sets/${id}/leave`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsJoined(false);
          triggerToast("Left set.");
        } else {
          const json = await res.json().catch(() => ({}));
          const errMsg = json.error || json.message || "Failed to leave set. Please try again.";
          triggerToast(errMsg);
        }
      } catch (err) {
        console.error("[SetDetailPage] Error leaving set:", err);
        triggerToast("Failed to leave set. Please try again.");
      }
    }
  };
  const [isCreateFestivalModalOpen, setIsCreateFestivalModalOpen] =
    useState(false);

  const handleCreateFestival = async (data: {
    title: string;
    description: string;
    rulesText: string;
    startDate: string;
    endDate: string;
    panelists: string[];
  }) => {
    if (!id) return;
    try {
      const payload = {
        name: data.title,
        description: data.description,
        rules: data.rulesText.trim() || null,
        start_date: data.startDate
          ? new Date(data.startDate).toISOString()
          : new Date().toISOString(),
        end_date: data.endDate
          ? new Date(data.endDate).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        set_id: id,
        panelists: data.panelists,
      };

      const res = await apiFetch(`/sets/${id}/new_festival`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        triggerToast("Festival created successfully!");
        setIsCreateFestivalModalOpen(false);

        // Re-fetch set details & festivals
        Promise.all([apiFetch(`/sets/${id}`), apiFetch(`/festivals`)]).then(
          async ([setRes, festRes]) => {
            if (setRes.ok) {
              const json = await setRes.json();
              const remote = json.data || json;
              if (remote) {
                setLocalSet((prev: any) => ({
                  ...prev,
                  activeFestivalId: remote.activeFestivalId || remote.active_festival_id || prev?.activeFestivalId,
                  festivalStatus: remote.festivalStatus || remote.festival_status || prev?.festivalStatus,
                  totalFestivals: (prev?.totalFestivals || 0) + 1,
                  liveFestivals: (prev?.liveFestivals || 0) + 1,
                }));
              }
            }
            if (festRes.ok) {
              const json = await festRes.json();
              const list = json.data || json;
              if (Array.isArray(list)) {
                const mappedFestivals: Festival[] = list.map((f: any) => ({
                  id: f.id,
                  setId: f.setId || f.set_id || "",
                  setName: f.setName || f.set_name || "",
                  organizerId: f.organizerId || f.organizer_id || "",
                  title: f.title || f.name || "Festival",
                  description: f.description || "",
                  rules: Array.isArray(f.rules) ? f.rules : f.rules ? [f.rules] : [],
                  startDate: f.startDate || f.start_date || new Date().toISOString(),
                  endDate: f.endDate || f.end_date || new Date().toISOString(),
                  coverImage: f.coverImage || f.cover_image || "",
                  status: f.status || "LIVE",
                  presenceLeader: f.presenceLeader || f.presence_leader,
                }));
                setFetchedFestivals(mappedFestivals);
              }
            }
          }
        );
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || errJson.message || "Failed to create festival";
        triggerToast(msg);
      }
    } catch (err) {
      console.error("[SetDetailPage] Failed to create festival:", err);
      triggerToast("Failed to create festival");
    }
  };

  const setCommandItems: CommandItem[] = useMemo(
    () => [
      {
        label: "Update Set",
        icon: <Settings className="w-4 h-4" />,
        action: () => setIsUpdateModalOpen(true),
        description: "Curation & Rules",
        visible: isCreator,
      },
      {
        label: "Upload Work",
        icon: <Upload className="w-4 h-4" />,
        action: () => navigate(`/works/new?setId=${id}`),
        description: "Contribute to Set",
        visible: true,
      },
      {
        label: "Create Festival",
        icon: <Plus className="w-4 h-4" />,
        action: () => setIsCreateFestivalModalOpen(true),
        description: "Start New Festival (Curator)",
        visible: isCreator,
      },
    ],
    [isJoined, id, navigate, isCreator],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!localSet) {
    return (
      <NotFoundOverlay
        title="SET NOT FOUND"
        subtitle="This Set micro-community or timeline does not exist or is currently being curated. Stay in-touch with the Framehouse collective while we build."
        mode="page"
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep text-white overflow-x-hidden pt-[68px] md:pt-[72px]">
      <CinematicPageHeader
        title={localSet.title}
        onBack={() => navigate("/sets")}
        backLabel="Sets"
        onTitleClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        rightActions={
          <CommandCenter contextTitle="Set Control" items={setCommandItems} />
        }
      />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-950/90 border border-red-500/30 text-red-200 rounded-xl z-[200] flex items-center gap-2 pointer-events-none shadow-2xl backdrop-blur-md"
          >
            <BookPlus size={14} className="fill-current text-red-400" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
              {toastMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative overflow-hidden w-full min-h-[35vh] flex flex-col justify-center items-center pt-8 pb-8 md:pt-10 md:pb-6 bg-[#030303] border-b border-white/[0.02]">
        <div className="w-full max-w-[1400px] flex items-center justify-center px-4 md:px-8 relative z-10 pointer-events-none mt-8">
          <svg
            className="w-full"
            viewBox="0 0 1000 200"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="500"
              y="150"
              fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              fontSize="160"
              fontWeight="900"
              fill={localSet.accentColor || "#ffffff"}
              textAnchor="middle"
              textLength="900"
              lengthAdjust="spacingAndGlyphs"
              className="uppercase select-none drop-shadow-2xl"
            >
              {localSet.title}
            </text>
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center gap-6 mt-2 max-w-2xl px-6 text-center"
        >
          {localSet.themeLine && (
            <p className="text-[12px] md:text-[15px] font-medium italic text-white/50 tracking-[0.25em] uppercase drop-shadow-md">
              "{localSet.themeLine}"
            </p>
          )}

          {captain && (
            <button
              onClick={() => navigate(`/profile/${captain.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 rounded-xl transition-all duration-300 group"
            >
              {captain.profilePicture && (captain.profilePicture.startsWith('http') || captain.profilePicture.startsWith('/') || captain.profilePicture.startsWith('data:')) && (
                <img
                  src={captain.profilePicture}
                  alt={captain.name}
                  className="w-5 h-5 rounded-md object-cover object-top flex-shrink-0"
                />
              )}
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/70 transition-colors">
                Curated by {captain.name}
              </span>
            </button>
          )}

          <div className="flex items-center pt-2">
            <button
              onClick={handleToggleJoin}
              className={`px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${
                isJoined
                  ? "bg-white/5 text-white/40 border border-white/5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                  : "bg-white text-black hover:bg-white/90 hover:scale-105"
              }`}
            >
              {isJoined ? "LEAVE SET" : "JOIN SET"}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-4">
            {[
              {
                icon: <Users className="w-3.5 h-3.5" />,
                value: memberCount,
                label: memberCount === 1 ? "Member" : "Members",
              },
              {
                icon: <Sparkles className="w-3.5 h-3.5" />,
                value: festivalCount,
                label: festivalCount === 1 ? "Festival" : "Festivals",
              },
              {
                icon: <Globe className="w-3.5 h-3.5" />,
                value: liveFestivalsCount,
                label: liveFestivalsCount === 1 ? "Live Festival" : "Live Festivals",
              },
            ].map(({ icon, value, label }, idx) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-white/20">
                  {icon}
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">
                    <span className="text-white/80 mr-1">{value}</span>
                    {label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="h-3 w-px bg-white/10 hidden md:block ml-4" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Divider */}

      {/* ─── Layer I.V: Open Discussions ───────────────────────────────────────── */}
      {setThoughts.length > 0 && (
        <section className="px-4 md:px-8 py-6 border-b border-white/[0.04] bg-surface-deep">
          <SectionHeader
            icon={MessageSquare}
            title="Open Discussions"
            containerClassName="mb-6"
          />
          <div className="overflow-x-auto no-scrollbar pb-4">
            <div className="flex gap-4 sm:gap-6 w-max">
              {setThoughts.map((thought) => (
                <ThoughtCard
                  key={thought.id}
                  thought={thought}
                  onCardClick={() =>
                    navigate(`/sets/${id}/discussions/${thought.id}`)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Layer II: Active Festival Spotlight ────────────────────────────── */}
      {activeFestival ? (
        <ActiveFestivalSpotlight festival={activeFestival} set={localSet} />
      ) : (
        <section className="px-4 md:px-8 py-6" aria-label="No Active Festival">
          <SectionHeader title="No Active Festival" containerClassName="mb-6" />
          <p className="text-[11px] text-white/20 leading-relaxed">
            The stage is quiet. Next festival is being prepared by the Captains.
          </p>
        </section>
      )}

      {/* ─── Layer III: Festival Archive ─────────────────────────────────────── */}

      <FestivalArchive festivals={allFestivals} />

      {/* ─── Layer IV: Set Theatre (Y-axis scroll) ───────────────────────────── */}
      <TheatrePreviewSection
        title={`${localSet.title} Theatre`}
        works={setWorks}
        enterUrl={`/sets/${localSet.id}/theatre`}
      />

      {/* Modals */}
      {isUpdateModalOpen && localSet && (
        <UpdateSetModal
          isOpen={isUpdateModalOpen}
          set={localSet}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={(updates) =>
            setLocalSet((prev: any) => (prev ? { ...prev, ...updates } : prev))
          }
        />
      )}

      {isCreateFestivalModalOpen && (
        <CreateFestivalModal
          setId={localSet.id}
          isOpen={isCreateFestivalModalOpen}
          onClose={() => setIsCreateFestivalModalOpen(false)}
          onCreate={handleCreateFestival}
        />
      )}
    </div>
  );
}
