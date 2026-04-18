import { TheatreLayout } from "./layouts/TheatreLayout";

import { useMediaQuery } from "../../hooks/useMediaQuery";

export function TheatrePage() {
  const isMobile = useMediaQuery();

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30">
      <TheatreLayout isMobile={isMobile} />
    </div>
  );
}
