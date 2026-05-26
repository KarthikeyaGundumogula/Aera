import { useNavigate } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { MobileTopHeader } from "../navigation/MobileTopHeader";
import { DesktopHeader } from "../navigation/DesktopHeader";

interface ComingSoonPageProps {
  label: string;
  description?: string;
}

export function ComingSoonPage({ label, description }: ComingSoonPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Mobile Header */}
      <MobileTopHeader
        rightActions={
          <button
            onClick={() => navigate("/")}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
          >
            Center
          </button>
        }
      />

      {/* Desktop Header */}
      <DesktopHeader />

      <main className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="max-w-xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-4">
            {label}
          </p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            Coming Soon
          </h1>
          <p className="text-sm md:text-base text-white/60 leading-relaxed">
            {description || `We’re shaping the ${label.toLowerCase()} experience next. For now, this page is a placeholder while we finish the mobile UI.`}
          </p>
        </div>
      </main>
    </div>
  );
}
