/**
 * App.tsx
 *
 * Entry point: global providers + router shell.
 * All page components are imported via src/router/lazyRoutes.ts.
 */
import { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/utils/ScrollToTop";
import { MobileNavBar } from "@/features/navigation/MobileNavBar";
import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalActionFAB } from "@/components/GlobalActionFAB";

import {
  // Hall
  HallPage,
  // Theatre
  TheatrePage,
  ContextualTheatrePage,
  // Originals
  OriginalPage,
  OriginalCreatePage,
  // Profile
  ArtistSetupPage,
  LoginPage,
  ReservedArtistsPage,
  StudioPage,
  ProfileEditPage,
  ProfilePage,
  // Works
  WorkPage,
  UploadPage,
  OriginalReleaseUploadPage,
  // Sets & Festivals
  SetsPage,
  SetDetailPage,
  DiscussionPage,
  FestivalDetailPage,
  // Ledger
  LedgerPage,
  // Center
  CenterPage,
  // Misc
  ContactPage,
  AdminPage,
  ComingSoon,
} from "@/router/lazyRoutes";

// ─── Loading fallback ─────────────────────────────────────────────────────────

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
        Loading Scene
      </p>
    </div>
  );
}

// ─── 404 fallback ─────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4">
      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20">
        Scene not found
      </p>
      <p className="text-[11px] text-white/15 font-mono">
        The path you entered does not exist.
      </p>
      <a
        href="/"
        className="mt-4 text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/10 px-4 py-2 rounded-full hover:border-white/25 hover:text-white/60 transition-colors"
      >
        Return to Hall
      </a>
    </div>
  );
}

// ─── Route tree ───────────────────────────────────────────────────────────────

/**
 * AppRoutes — separated so it can use useLocation inside BrowserRouter.
 *
 * The backgroundLocation pattern renders the previous page behind a modal-style
 * WorkPage overlay when navigating from within the app (/works/:id).
 */
function AppRoutes() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <ScrollToTop />
      <MobileNavBar />

      <Suspense fallback={<RouteFallback />}>
        <ErrorBoundary>
          <Routes location={backgroundLocation ?? location}>

            {/* ── Hall (Home) ─────────────────────────────── */}
            <Route path="/" element={<HallPage />} />

            {/* ── Discovery ───────────────────────────────── */}
            <Route path="/center" element={<CenterPage />} />
            <Route path="/theatre" element={<TheatrePage />} />

            {/* ── Originals ───────────────────────────────── */}
            <Route
              path="/originals"
              element={
                <ComingSoon
                  label="Originals"
                  description="We're shaping the dedicated originals experience next."
                />
              }
            />
            <Route path="/originals/:id" element={<OriginalPage />} />
            <Route path="/originals/:id/theatre" element={<ContextualTheatrePage type="original" />} />
            <Route
              path="/originals/:id/releases"
              element={<ComingSoon label="Official Releases" />}
            />
            <Route path="/originals/:id/releases/new" element={<OriginalReleaseUploadPage />} />

            {/* ── Sets & Festivals ────────────────────────── */}
            <Route path="/sets" element={<SetsPage />} />
            <Route path="/sets/:id" element={<SetDetailPage />} />
            <Route path="/sets/:id/theatre" element={<ContextualTheatrePage type="set" />} />
            <Route path="/sets/:setId/discussions/:discussionId" element={<DiscussionPage />} />
            <Route path="/festivals/:id" element={<FestivalDetailPage />} />
            <Route path="/festivals/:id/theatre" element={<ContextualTheatrePage type="festival" />} />

            {/* ── Profile ─────────────────────────────────── */}
            <Route path="/profile/new" element={<ArtistSetupPage />} />
            <Route path="/profile/login" element={<LoginPage />} />
            <Route path="/profile/reserved" element={<ReservedArtistsPage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/profile/:profileId" element={<ProfilePage />} />

            {/* ── Studio & Works ──────────────────────────── */}
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/works/new" element={<UploadPage />} />
            <Route path="/works/:id" element={<WorkPage />} />
            <Route path="/ledger" element={<LedgerPage />} />

            {/* ── Artists (placeholder) ───────────────────── */}
            <Route
              path="/artists/:id"
              element={<ComingSoon label="Artist Profile" />}
            />

            {/* ── Admin ───────────────────────────────────── */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/originals/new" element={<OriginalCreatePage />} />
            <Route path="/admin/profile/new" element={<ArtistSetupPage />} />

            {/* ── Misc ────────────────────────────────────── */}
            <Route path="/contact" element={<ContactPage />} />

            {/* ── 404 Fallback ─────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </ErrorBoundary>

        {/* Modal overlay: WorkPage floating above the background route */}
        {backgroundLocation && (
          <Routes>
            <Route path="/works/:id" element={<WorkPage />} />
          </Routes>
        )}
      </Suspense>
    </>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <GlobalActionFAB />
      </BrowserRouter>
    </AuthProvider>
  );
}
