import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { WelcomePage } from '@/features/onboarding/pages/WelcomePage'
import { LanguageSelectPage } from '@/features/onboarding/pages/LanguageSelectPage'
import { AgeSelectPage } from '@/features/onboarding/pages/AgeSelectPage'
import { CharacterIntroPage } from '@/features/onboarding/pages/CharacterIntroPage'
import { OnboardingCompletePage } from '@/features/onboarding/pages/OnboardingCompletePage'
import { MissionsBrowsePage } from '@/features/missions/pages/MissionsBrowsePage'
import { MissionDetailPage } from '@/features/missions/pages/MissionDetailPage'
import { MissionCompletePage } from '@/features/missions/pages/MissionCompletePage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { ProjectDetailPage } from '@/features/projects/pages/ProjectDetailPage'
import { MyPortfolioPage } from '@/features/projects/pages/MyPortfolioPage'
import { CommunityPage } from '@/features/community/pages/CommunityPage'
import { AchievementsPage } from '@/features/gamification/pages/AchievementsPage'
import { LeaderboardPage } from '@/features/gamification/pages/LeaderboardPage'
import { ProgressPage } from '@/features/gamification/pages/ProgressPage'
import { CurriculumBrowsePage } from '@/features/learning/pages/CurriculumBrowsePage'
import { ConceptDetailPage } from '@/features/learning/pages/ConceptDetailPage'
import { LearningPathsPage } from '@/features/learning/pages/LearningPathsPage'
import { LearningPathDetailPage } from '@/features/learning/pages/LearningPathDetailPage'
import { FlashcardsStudyPage } from '@/features/learning/pages/FlashcardsStudyPage'
import { ParentTimeLimitsPage } from '@/features/parents/pages/ParentTimeLimitsPage'
import { EnglishStrandsPage } from '@/features/english/pages/EnglishStrandsPage'
import { EnglishCoachPage } from '@/features/english/pages/EnglishCoachPage'
import { CharacterChatPage } from '@/features/characters/pages/CharacterChatPage'
import { LearningInsightsPage } from '@/features/analytics/pages/LearningInsightsPage'
import { CrossCurricularPage } from '@/features/cross-curricular/pages/CrossCurricularPage'
import { CrossCurricularConceptDetailPage } from '@/features/cross-curricular/pages/CrossCurricularConceptDetailPage'
import { ThinkingSkillsPage } from '@/features/thinking-skills/pages/ThinkingSkillsPage'
import { ThinkingSkillConceptDetailPage } from '@/features/thinking-skills/pages/ThinkingSkillConceptDetailPage'
import { StoriesListPage } from '@/features/stories/pages/StoriesListPage'
import { StoryReaderPage } from '@/features/stories/pages/StoryReaderPage'
import { CreativityGalleryPage } from '@/features/creativity/pages/CreativityGalleryPage'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminRoute } from '@/components/common/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { AdminMissionsPage } from '@/features/admin/pages/AdminMissionsPage'
import { AdminFeatureFlagsPage } from '@/features/admin/pages/AdminFeatureFlagsPage'
import { AdminQuestionTemplatesPage } from '@/features/admin/pages/AdminQuestionTemplatesPage'
import { AdminAnalyticsPage } from '@/features/admin/pages/AdminAnalyticsPage'
import { AdminAuditLogPage } from '@/features/admin/pages/AdminAuditLogPage'
import { AdminSafetyEscalationsPage } from '@/features/admin/pages/AdminSafetyEscalationsPage'
import { AdminInterventionsPage } from '@/features/admin/pages/AdminInterventionsPage'
import { AdminMisconceptionsPage } from '@/features/admin/pages/AdminMisconceptionsPage'
import { AdminAIEvalPage } from '@/features/admin/pages/AdminAIEvalPage'
import { AdminAssessmentQualityPage } from '@/features/admin/pages/AdminAssessmentQualityPage'
import { LoadingState } from '@/components/common/CharacterState'

/** Route-level code splitting for the heaviest pages in the bundle.
 * These pull in large dependency subtrees (Sandpack/Pyodide for missions,
 * chart/analytics libs for the parent dashboard, character art for the
 * gallery, the cosmetic shop's asset previews, and the voice pipeline's
 * media/audio handling), so they're loaded on demand via React.lazy()
 * instead of shipping in the main chunk. See PERFORMANCE_GUIDE.md /
 * this task's PR for the before/after bundle-size numbers. */
const MissionPlayerPage = lazy(() =>
  import('@/features/missions/pages/MissionPlayerPage').then((m) => ({ default: m.MissionPlayerPage }))
)
const CharacterGalleryPage = lazy(() =>
  import('@/features/characters/pages/CharacterGalleryPage').then((m) => ({ default: m.CharacterGalleryPage }))
)
const ParentDashboardPage = lazy(() =>
  import('@/features/parents/pages/ParentDashboardPage').then((m) => ({ default: m.ParentDashboardPage }))
)
const CosmeticShopPage = lazy(() =>
  import('@/features/cosmetics/pages/CosmeticShopPage').then((m) => ({ default: m.CosmeticShopPage }))
)
const VoiceChatPage = lazy(() =>
  import('@/features/voice/pages/VoiceChatPage').then((m) => ({ default: m.VoiceChatPage }))
)

function RouteFallback() {
  return <LoadingState character="Azouz" message="Azouz is warming things up..." />
}

/** Branch "/" on auth state: signed-in visitors go straight to the app
 * (their previous behavior, unchanged); first-time/signed-out visitors get
 * the real public landing/preview experience instead of bouncing through
 * /dashboard -> /login. Mirrors ProtectedRoute's own token check. */
function RootRoute() {
  const token = localStorage.getItem('accessToken')
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  return <LandingPage />
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes — no shell */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding (first-time learners: language -> welcome -> age select
          -> meet the 4 core mentors) — a full-screen guided wizard,
          intentionally kept outside the tab-bar shell so kids aren't
          distracted by nav mid-flow. See OnboardingLayout for the shared
          progress bar + step transition. */}
      <Route
        path="/onboarding/language"
        element={
          <ProtectedRoute>
            <LanguageSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/age"
        element={
          <ProtectedRoute>
            <AgeSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/character"
        element={
          <ProtectedRoute>
            <CharacterIntroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/complete"
        element={
          <ProtectedRoute>
            <OnboardingCompletePage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated app routes — all wrapped in the persistent AppShell
          (header + bottom tab bar + More drawer). ProtectedRoute guards
          the whole tree once, so unauth'd users bounce to /login before
          the shell even mounts. */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Missions */}
        <Route path="/missions" element={<MissionsBrowsePage />} />
        <Route path="/missions/:id" element={<MissionDetailPage />} />
        <Route
          path="/missions/play/:runId"
          element={
            <Suspense fallback={<RouteFallback />}>
              <MissionPlayerPage />
            </Suspense>
          }
        />
        <Route path="/missions/complete" element={<MissionCompletePage />} />

        {/* Learning / Curriculum */}
        <Route path="/learn" element={<CurriculumBrowsePage />} />
        <Route path="/learn/concepts/:id" element={<ConceptDetailPage />} />
        <Route path="/learn/paths" element={<LearningPathsPage />} />
        <Route path="/learn/paths/:id" element={<LearningPathDetailPage />} />
        <Route path="/learn/flashcards" element={<FlashcardsStudyPage />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/portfolio" element={<MyPortfolioPage />} />

        {/* Community */}
        <Route path="/community" element={<CommunityPage />} />

        {/* Gamification */}
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/progress" element={<ProgressPage />} />

        {/* Parents (guardian-only backend endpoints; no client role-gate yet — see followup) */}
        <Route
          path="/parents"
          element={
            <Suspense fallback={<RouteFallback />}>
              <ParentDashboardPage />
            </Suspense>
          }
        />
        <Route path="/parents/children/:learnerId/time-limits" element={<ParentTimeLimitsPage />} />

        {/* Voice Chat (Voice Pipeline v1) */}
        <Route
          path="/voice-chat"
          element={
            <Suspense fallback={<RouteFallback />}>
              <VoiceChatPage />
            </Suspense>
          }
        />

        {/* English (Strands browser + Coach chat) */}
        <Route path="/english" element={<EnglishStrandsPage />} />
        <Route path="/english/coach" element={<EnglishCoachPage />} />

        {/* Character Universe (gallery with progressive unlock + per-character chat) */}
        <Route
          path="/characters"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CharacterGalleryPage />
            </Suspense>
          }
        />
        <Route path="/stories" element={<StoriesListPage />} />
        <Route path="/stories/:id" element={<StoryReaderPage />} />
        <Route path="/creativity" element={<CreativityGalleryPage />} />
        <Route path="/characters/:id/chat" element={<CharacterChatPage />} />

        {/* Cosmetic Shop — real XP-spending economy (borders/badges/titles/themes) */}
        <Route
          path="/shop"
          element={
            <Suspense fallback={<RouteFallback />}>
              <CosmeticShopPage />
            </Suspense>
          }
        />

        {/* My Journey — learner-facing view of the /learning/events analytics pipeline */}
        <Route path="/insights" element={<LearningInsightsPage />} />

        {/* Cross-Curricular (AI Literacy, Entrepreneurship, Financial Literacy) —
            real seeded AILiteracyConcept/EntrepreneurshipConcept/FinancialLiteracyConcept
            content, one shared parameterized page per category. */}
        <Route path="/cross-curricular/:category" element={<CrossCurricularPage />} />
        <Route path="/cross-curricular/:category/:slug" element={<CrossCurricularConceptDetailPage />} />
        <Route path="/thinking/:engine" element={<ThinkingSkillsPage />} />
        <Route path="/thinking/:engine/:slug" element={<ThinkingSkillConceptDetailPage />} />

        {/* Admin — CMS/Content Studio + Authoring Engine v1 (Mission
            content type only; ADMIN-role-gated both here and server-side
            via RolesGuard on /admin/missions). */}
        <Route
          path="/admin/missions"
          element={
            <AdminRoute>
              <AdminMissionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/feature-flags"
          element={
            <AdminRoute>
              <AdminFeatureFlagsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-templates"
          element={
            <AdminRoute>
              <AdminQuestionTemplatesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit-log"
          element={
            <AdminRoute>
              <AdminAuditLogPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/safety-escalations"
          element={
            <AdminRoute>
              <AdminSafetyEscalationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/interventions"
          element={
            <AdminRoute>
              <AdminInterventionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/misconceptions"
          element={
            <AdminRoute>
              <AdminMisconceptionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/ai-eval"
          element={
            <AdminRoute>
              <AdminAIEvalPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/assessment-quality"
          element={
            <AdminRoute>
              <AdminAssessmentQualityPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* "/" — public landing/preview for signed-out visitors (real product
          value before the registration wall, Duolingo-pattern), straight to
          /dashboard for anyone already signed in. Unknown paths still fall
          back to /dashboard, which itself redirects unauthenticated users
          to /login. */}
      <Route path="/" element={<RootRoute />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
