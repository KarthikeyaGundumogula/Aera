import { useLocation, useNavigate } from "react-router-dom";

export function MobileNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItemClassName = (active: boolean) =>
    `flex min-w-0 flex-col items-center justify-center rounded-2xl px-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${
      active
        ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
        : "text-white/45 hover:text-white"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-black/80 px-4 py-4 backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => navigate("/")}
          className={getNavItemClassName(location.pathname === "/")}
        >
          Home
        </button>
        <button
          onClick={() => navigate("/theatre")}
          className={getNavItemClassName(location.pathname === "/theatre")}
        >
          Theatre
        </button>
        <button
          onClick={() => navigate("/originals")}
          className={getNavItemClassName(
            location.pathname.startsWith("/originals"),
          )}
        >
          Originals
        </button>
        <button
          onClick={() => navigate("/sets")}
          className={getNavItemClassName(location.pathname === "/sets")}
        >
          Sets
        </button>
      </div>
    </nav>
  );
}
