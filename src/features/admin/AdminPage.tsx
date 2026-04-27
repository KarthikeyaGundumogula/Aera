import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Film, User, Settings, ArrowLeft, Plus, Sparkles } from "lucide-react";
import { StageIcon } from "../../components/icons/AppIcons";

export function AdminPage() {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: "Initiate Original",
      description: "Define a new cinematic artifact in the collective.",
      icon: <Film className="w-6 h-6" />,
      path: "/admin/originals/new",
      color: "bg-white/5",
    },
    {
      title: "Shape Star Stage",
      description: "Create a Stage for a leading star.",
      icon: <User className="w-6 h-6" />,
      path: "/admin/profile/new?type=star",
      color: "bg-white/5",
    },
    {
      title: "Forge Maker Stage",
      description: "Establish the Stage of a creative visionary.",
      icon: <Settings className="w-6 h-6" />,
      path: "/admin/profile/new?type=maker",
      color: "bg-white/5",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* ─── Cinematic Background Layer ─────────────────────────────── */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-white/[0.02] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] bg-white/[0.015] blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-32 flex flex-col min-h-screen">
        {/* ─── Top Navigation ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-20">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 w-fit text-white/40 hover:text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Exit to Theatre
            </span>
          </motion.button>

          <div className="flex items-center gap-2">
            <StageIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
              Admin Stage
            </span>
          </div>
        </div>

        {/* ─── Header ────────────────────────────────────────────────── */}
        <header className="mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-black uppercase tracking-[-0.03em] leading-[0.85] mb-6"
          >
            Command <br />
            <span className="text-white/20">Center</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/40 text-sm max-w-sm tracking-wide leading-relaxed"
          >
            High-level access to the Aera ecosystem. Curate, shape, and forge
            the future of cinematic artifacts.
          </motion.p>
        </header>

        {/* ─── Dashboard Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="group relative text-left p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all overflow-hidden"
            >
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/[0.02] blur-3xl rounded-full group-hover:bg-white/[0.05] transition-colors" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-white/10 transition-colors">
                  {action.icon}
                </div>

                <h3 className="text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-white transition-colors">
                  {action.title}
                </h3>
                <p className="text-white/40 text-xs leading-relaxed group-hover:text-white/60 transition-colors">
                  {action.description}
                </p>

                <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white transition-colors">
                  <span>Open Rite</span>
                  <Plus className="w-3 h-3 transition-transform group-hover:rotate-90" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ─── Footer Note ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-auto pt-12 text-[9px] font-bold uppercase tracking-[0.5em] text-white/10 text-center"
        >
          Secured Protocol — Unauthorized Access Logged
        </motion.div>
      </div>
    </div>
  );
}
