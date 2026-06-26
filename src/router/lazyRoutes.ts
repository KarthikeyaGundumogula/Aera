/**
 * lazyRoutes.ts
 *
 * Centralised lazy-import declarations for all page-level routes.
 * Keeps App.tsx clean and makes the route split surface easy to audit.
 *
 * Rule: every page component MUST be lazy-loaded here unless there is an
 * explicit performance justification to eagerly include it in the entry bundle.
 */
import { lazy } from "react";

// ─── Shared ──────────────────────────────────────────────────────────────────
export const ComingSoon = lazy(() =>
  import("@/features/shared/ComingSoonPage").then((m) => ({ default: m.ComingSoonPage }))
);

// ─── Hall (Home) ──────────────────────────────────────────────────────────────
export const HallPage = lazy(() =>
  import("@/features/hall").then((m) => ({ default: m.HallPage }))
);

// ─── Theatre ─────────────────────────────────────────────────────────────────
export const TheatrePage = lazy(() =>
  import("@/features/theatre/TheatrePage").then((m) => ({ default: m.TheatrePage }))
);

export const ContextualTheatrePage = lazy(() =>
  import("@/features/theatre/ContextualTheatrePage").then((m) => ({
    default: m.ContextualTheatrePage,
  }))
);

// ─── Originals ────────────────────────────────────────────────────────────────
export const OriginalsListPage = lazy(() =>
  import("@/features/originals/OriginalsListPage").then((m) => ({ default: m.OriginalsListPage }))
);

export const OriginalPage = lazy(() =>
  import("@/features/originals/OriginalPage").then((m) => ({ default: m.OriginalPage }))
);

export const OriginalCreatePage = lazy(() =>
  import("@/features/originals/OriginalCreatePage")
);

// ─── Profile ─────────────────────────────────────────────────────────────────
export const ArtistSetupPage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.ArtistSetupPage }))
);

export const LoginPage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.LoginPage }))
);

export const ReservedArtistsPage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.ReservedArtistsPage }))
);

export const StudioPage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.StudioPage }))
);

export const ProfileEditPage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.ProfileEditPage }))
);

export const ProfilePage = lazy(() =>
  import("@/features/profile").then((m) => ({ default: m.ProfilePage }))
);

// ─── Works ───────────────────────────────────────────────────────────────────
export const WorkPage = lazy(() =>
  import("@/features/works").then((m) => ({ default: m.WorkPage }))
);

export const UploadPage = lazy(() => import("@/features/upload/UploadPage"));

export const OriginalReleaseUploadPage = lazy(() =>
  import("@/features/upload/OriginalReleaseUploadPage")
);

// ─── Sets & Festivals ─────────────────────────────────────────────────────────
export const SetsPage = lazy(() =>
  import("@/features/sets").then((m) => ({ default: m.SetsPage }))
);

export const SetDetailPage = lazy(() =>
  import("@/features/sets").then((m) => ({ default: m.SetDetailPage }))
);

export const DiscussionPage = lazy(() =>
  import("@/features/sets").then((m) => ({ default: m.DiscussionPage }))
);

export const FestivalDetailPage = lazy(() =>
  import("@/features/festivals").then((m) => ({ default: m.FestivalDetailPage }))
);

// ─── Ledger ───────────────────────────────────────────────────────────────────
export const LedgerPage = lazy(() =>
  import("@/features/ledger").then((m) => ({ default: m.LedgerPage }))
);

// ─── Center ───────────────────────────────────────────────────────────────────
export const CenterPage = lazy(() =>
  import("@/features/center").then((m) => ({ default: m.CenterPage }))
);

// ─── Recommendations ───────────────────────────────────────────────────────────
export const RecommendationsPage = lazy(() =>
  import("@/features/recommendations").then((m) => ({ default: m.RecommendationsPage }))
);


// ─── Contact ─────────────────────────────────────────────────────────────────
export const ContactPage = lazy(() =>
  import("@/features/contact").then((m) => ({ default: m.ContactPage }))
);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const AdminPage = lazy(() =>
  import("@/features/admin").then((m) => ({ default: m.AdminPage }))
);
