/**
 * App.tsx
 *
 * Entry point: global providers + router shell.
 * All page components are imported via src/router/lazyRoutes.ts.
 */
import { Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ScrollToTop } from "@/components/utils/ScrollToTop";
import { MobileNavBar } from "@/features/navigation/MobileNavBar";
import { AuthProvider } from "@/context/AuthContext";
import { RecommendationProvider } from "@/context/RecommendationContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalActionFAB } from "@/components/GlobalActionFAB";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SEOHead } from "@/components/SEOHead";

import {
  // Hall
  HallPage,
  // Theatre
  TheatrePage,
  ContextualTheatrePage,
  // Originals
  OriginalPage,
  OriginalCreatePage,
  OriginalsListPage,
  OriginalRecommendationsPage,
  // Profile
  ArtistSetupPage,
  LoginPage,
  ReservedArtistsPage,
  StudioPage,
  ProfileEditPage,
  ProfilePage,
  WallPostPage,
  // Works
  WorkPage,
  UploadPage,
  OriginalReleaseUploadPage,
  // Sets & Festivals
  SetsPage,
  SetDetailPage,
  DiscussionPage,
  FestivalDetailPage,
  // Center
  CenterPage,
  RecommendationsPage,
  TaggedWorksPage,
  BreakdownViewer,
  // Misc
  ContactPage,
  AdminPage,
  ComingSoon,
} from "@/router/lazyRoutes";

// ─── Loading fallback ─────────────────────────────────────────────────────────

function RouteFallback() {
  return (
    <div className="min-h-screen bg-surface-deep text-white flex items-center justify-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/35">
        Loading Scene
      </p>
    </div>
  );
}

import { NotFoundOverlay } from "@/components/NotFoundOverlay";

function NotFoundPage() {
  return <NotFoundOverlay mode="page" />;
}

/**
 * AppRoutes — separated so it can use useLocation inside BrowserRouter.
 *
 * Works (/works/:id) are full-page Viewer Screens, not overlays.
 */
function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <MobileNavBar />

      <Suspense fallback={<RouteFallback />}>
        <ErrorBoundary>
          <Routes>
            {/* ── Hall (Home) ─────────────────────────────── */}
            <Route path="/" element={<HallPage />} />

            {/* ── Discovery ───────────────────────────────── */}
            <Route path="/center" element={<CenterPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/theatre" element={<TheatrePage />} />

            {/* ── Originals ───────────────────────────────── */}
            <Route path="/originals" element={<OriginalsListPage />} />
            <Route path="/originals/:id" element={<OriginalPage />} />
            <Route
              path="/originals/:id/theatre"
              element={<ContextualTheatrePage type="original" />}
            />
            <Route
              path="/originals/:id/releases"
              element={<ComingSoon label="Official Releases" />}
            />
            <Route
              path="/originals/:id/releases/new"
              element={<OriginalReleaseUploadPage />}
            />

            {/* ── Sets & Festivals ────────────────────────── */}
            <Route path="/sets" element={<SetsPage />} />
            <Route path="/sets/:id" element={<SetDetailPage />} />
            <Route
              path="/sets/:id/theatre"
              element={<ContextualTheatrePage type="set" />}
            />
            <Route
              path="/sets/:setId/discussions/:discussionId"
              element={<DiscussionPage />}
            />
            <Route path="/festivals/:id" element={<FestivalDetailPage />} />
            <Route
              path="/festivals/:id/theatre"
              element={<ContextualTheatrePage type="festival" />}
            />

            {/* ── Profile ─────────────────────────────────── */}
            <Route path="/profile/new" element={<ArtistSetupPage />} />
            <Route path="/profile/login" element={<LoginPage />} />
            <Route path="/profile/reserved" element={<ReservedArtistsPage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/profile/:profileId" element={<ProfilePage />} />
            <Route path="/profile/:profileId/recommendations/:originalId" element={<OriginalRecommendationsPage />} />
            {/* Wall post deep-link — opens full-screen swiper at shared post */}
            <Route path="/wall/:artistId/:postId" element={<WallPostPage />} />

            {/* ── Studio & Works ──────────────────────────── */}
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/works/new" element={<UploadPage />} />
            <Route path="/works/:id" element={<WorkPage />} />
            <Route path="/breakdowns/:id" element={<BreakdownViewer />} />
            <Route path="/ledger" element={<Navigate to="/sets" replace />} />
            <Route path="/ledger/:id" element={<Navigate to="/sets" replace />} />
            <Route path="/tagged-works/:id" element={<TaggedWorksPage />} />

            {/* ── Artists (placeholder) ───────────────────── */}
            <Route
              path="/artists/:id"
              element={<ComingSoon label="Artist Profile" />}
            />

            {/* ── Admin ───────────────────────────────────── */}
            <Route path="/admin" element={<AdminPage />} />
            <Route
              path="/admin/originals/new"
              element={<OriginalCreatePage />}
            />
            <Route path="/admin/profile/new" element={<ArtistSetupPage />} />

            {/* ── Misc ────────────────────────────────────── */}
            <Route path="/contact" element={<ContactPage />} />

            {/* ── 404 Fallback ─────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <RecommendationProvider>
        <BrowserRouter>
          <SEOHead />
          <AppRoutes />
          <GlobalActionFAB />
          <PWAInstallPrompt />
        </BrowserRouter>
      </RecommendationProvider>
    </AuthProvider>
  );
}
