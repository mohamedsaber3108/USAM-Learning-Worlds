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
import { MissionPlayerPage } from '@/features/missions/pages/MissionPlayerPage'
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
import { ParentDashboardPage } from '@/features/parents/pages/ParentDashboardPage'
import { ParentTimeLimitsPage } from '@/features/parents/pages/ParentTimeLimitsPage'
import { VoiceChatPage } from '@/features/voice/pages/VoiceChatPage'
import { EnglishStrandsPage } from '@/features/english/pages/EnglishStrandsPage'
import { EnglishCoachPage } from '@/features/english/pages/EnglishCoachPage'
import { CharacterGalleryPage } from '@/features/characters/pages/CharacterGalleryPage'
import { CharacterChatPage } from '@/features/characters/pages/CharacterChatPage'
import { CosmeticShopPage } from '@/features/cosmetics/pages/CosmeticShopPage'
import { LearningInsightsPage } from '@/features/analytics/pages/LearningInsightsPage'
import { CrossCurricularPage } from '@/features/cross-curricular/pages/CrossCurricularPage'
import { CrossCurricularConceptDetailPage } from '@/features/cross-curricular/pages/CrossCurricularConceptDetailPage'
import { ThinkingSkillsPage } from '@/features/thinking-skills/pages/ThinkingSkillsPage'
import { ThinkingSkillConceptDetailPage } from '@/features/thinking-skills/pages/ThinkingSkillConceptDetailPage'
import { StoriesListPage } from '@/features/stories/pages/StoriesListPage'
import { StoryReaderPage } from '@/features/stories/pages/StoryReaderPage'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { AdminRoute } from '@/components/common/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { AdminMissionsPage } from '@/features/admin/pages/AdminMissionsPage'

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
        <Route path="/missions/play/:runId" element={<MissionPlayerPage />} />
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
        <Route path="/parents" element={<ParentDashboardPage />} />
        <Route path="/parents/children/:learnerId/time-limits" element={<ParentTimeLimitsPage />} />

        {/* Voice Chat (Voice Pipeline v1) */}
        <Route path="/voice-chat" element={<VoiceChatPage />} />

        {/* English (Strands browser + Coach chat) */}
        <Route path="/english" element={<EnglishStrandsPage />} />
        <Route path="/english/coach" element={<EnglishCoachPage />} />

        {/* Character Universe (gallery with progressive unlock + per-character chat) */}
        <Route path="/characters" element={<CharacterGalleryPage />} />
        <Route path="/stories" element={<StoriesListPage />} />
        <Route path="/stories/:id" element={<StoryReaderPage />} />
        <Route path="/characters/:id/chat" element={<CharacterChatPage />} />

        {/* Cosmetic Shop — real XP-spending economy (borders/badges/titles/themes) */}
        <Route path="/shop" element={<CosmeticShopPage />} />

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
