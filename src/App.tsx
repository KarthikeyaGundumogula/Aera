/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ScrollToTop } from "./components/utils/ScrollToTop";
import { MobileNavBar } from "./features/navigation/MobileNavBar";
import { AuthProvider } from "./context/AuthContext";
const Home = lazy(() =>
  import("./features/home/HomePage").then((m) => ({ default: m.Home })),
);
const TheatrePage = lazy(() =>
  import("./features/theatre/TheatrePage").then((m) => ({ default: m.TheatrePage })),
);

const OriginalPage = lazy(() =>
  import("./features/originals/OriginalPage").then((module) => ({
    default: module.OriginalPage,
  })),
);
const ComingSoonPage = lazy(() =>
  import("./features/shared/ComingSoonPage").then((module) => ({
    default: module.ComingSoonPage,
  })),
);
const OriginalsTheatrePage = lazy(() =>
  import("./features/originals/OriginalsTheatrePage").then((module) => ({
    default: module.OriginalsTheatrePage,
  })),
);
const UploadPage = lazy(() => import("./features/upload/UploadPage"));
const ArtistSetupPage = lazy(() => import("./features/profile/ArtistSetupPage"));
const LoginPage = lazy(() => import("./features/profile/LoginPage"));
const StudioPage = lazy(() => import("./features/profile/StudioPage"));
const ProfileEditPage = lazy(() => import("./features/profile/ProfileEditPage"));
const OriginalCreatePage = lazy(() => import("./features/originals/OriginalCreatePage"));
const OriginalReleaseUploadPage = lazy(() =>
  import("./features/upload/OriginalReleaseUploadPage"),
);
const ContactPage = lazy(() => import("./features/contact/ContactPage"));
const LedgerPage = lazy(() =>
  import("./features/ledger/LedgerPage").then((module) => ({ default: module.LedgerPage })),
);
const AdminPage = lazy(() =>
  import("./features/admin/AdminPage").then((module) => ({ default: module.AdminPage })),
);
const ProfilePage = lazy(() => import("./features/profile/ProfilePage"));
const SetsPage = lazy(() =>
  import("./features/sets").then((module) => ({ default: module.SetsPage })),
);
const SetDetailPage = lazy(() =>
  import("./features/sets").then((module) => ({ default: module.SetDetailPage })),
);
const SetsTheatrePage = lazy(() =>
  import("./features/sets").then((module) => ({ default: module.SetsTheatrePage })),
);
const FestivalDetailPage = lazy(() =>
  import("./features/festivals").then((module) => ({
    default: module.FestivalDetailPage,
  })),
);
const FestivalTheatrePage = lazy(() =>
  import("./features/festivals").then((module) => ({
    default: module.FestivalTheatrePage,
  })),
);
const WorkPage = lazy(() => import("./features/works/WorkPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
        Loading Scene
      </p>
    </div>
  );
}

/**
 * AppRoutes — Separated so it can use the useLocation hook inside BrowserRouter.
 */
function AppRoutes() {
  const location = useLocation();

  // If we navigated to /works/:id from within the app, backgroundLocation
  // holds the page we came from. We render that page as the background
  // and the WorkPage floats on top as a modal overlay.
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <ScrollToTop />
      <MobileNavBar />

      <Suspense fallback={<RouteFallback />}>
        <Routes location={backgroundLocation ?? location}>
          <Route path="/" element={<Home />} />
          <Route path="/theatre" element={<TheatrePage />} />
          <Route
            path="/originals"
            element={
              <ComingSoonPage
                label="Originals"
                description="We're shaping the dedicated originals experience next. For now, this page is a placeholder."
              />
            }
          />
          <Route path="/sets" element={<SetsPage />} />
          <Route path="/sets/:id" element={<SetDetailPage />} />
          <Route path="/sets/:id/theatre" element={<SetsTheatrePage />} />

          <Route path="/profile/new" element={<ArtistSetupPage />} />
          <Route path="/profile/login" element={<LoginPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/works/new" element={<UploadPage />} />
          <Route path="/ledger" element={<LedgerPage />} />

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/originals/new" element={<OriginalCreatePage />} />
          <Route path="/admin/profile/new" element={<ArtistSetupPage />} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/originals/:id" element={<OriginalPage />} />
          <Route path="/originals/:id/theatre" element={<OriginalsTheatrePage />} />
          <Route
            path="/originals/:id/releases"
            element={<ComingSoonPage label="Official Releases" />}
          />
          <Route
            path="/originals/:id/releases/new"
            element={<OriginalReleaseUploadPage />}
          />
          <Route
            path="/artists/:id"
            element={<ComingSoonPage label="Artist Profile" />}
          />
          <Route path="/profile/:profileId" element={<ProfilePage />} />
          <Route path="/festivals/:id" element={<FestivalDetailPage />} />
          <Route path="/festivals/:id/theatre" element={<FestivalTheatrePage />} />

          <Route path="/works/:id" element={<WorkPage />} />
        </Routes>

        {backgroundLocation && (
          <Routes>
            <Route path="/works/:id" element={<WorkPage />} />
          </Routes>
        )}
      </Suspense>
    </>
  );
}

/**
 * App Component
 * Handles the main routing and global layout wrappers.
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
