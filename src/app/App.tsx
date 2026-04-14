import { Routes, Route } from "react-router-dom";
import { Home } from "../features/home/HomePage";
import { OriginalPage } from "../features/originals/OriginalPage";
import { ComingSoonPage } from "../features/shared/ComingSoonPage";
import { TheatrePage } from "../features/theatre/TheatrePage";

/**
 * Centralized route definitions for the FrameHouse application.
 * Each route maps to a feature module page component.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/theatre" element={<TheatrePage />} />
      <Route
        path="/originals"
        element={
          <ComingSoonPage
            label="Originals"
            description="We're shaping the dedicated originals experience next. For now, this page is a placeholder while we finish the mobile UI."
          />
        }
      />
      <Route path="/sets" element={<ComingSoonPage label="Sets" />} />
      <Route path="/profile" element={<ComingSoonPage label="Profile" />} />
      <Route path="/originals/:id" element={<OriginalPage />} />
      <Route
        path="/originals/:id/releases"
        element={<ComingSoonPage label="Official Releases" />}
      />
      <Route
        path="/artists/:id"
        element={<ComingSoonPage label="Artist Profile" />}
      />
    </Routes>
  );
}
