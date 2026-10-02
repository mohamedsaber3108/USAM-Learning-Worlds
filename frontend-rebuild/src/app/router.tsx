import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { RequireRole } from './guards'
import { roleHome } from './roleHome'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingState } from '@/components/common/States'
import { LandingPage } from '@/features/public/LandingPage'
import { PricingPage } from '@/features/public/PricingPage'
import { HowItWorksPage, ForFamiliesPage, SafetyPage, LegalPage } from '@/features/public/ContentPages'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { HomePage } from '@/features/learner/HomePage'
import { LearnPage } from '@/features/learner/LearnPage'
import { ExplorePage } from '@/features/learner/ExplorePage'
import { DomainPathPage } from '@/features/learner/DomainPathPage'
import { MissionDetailPage } from '@/features/learner/MissionDetailPage'
import { MissionPlayerPage } from '@/features/learner/MissionPlayerPage'
import { PracticePage } from '@/features/learner/PracticePage'
import { ProgressPage } from '@/features/learner/ProgressPage'
import { ProjectsPage } from '@/features/learner/ProjectsPage'
import { ProjectDetailPage } from '@/features/learner/ProjectDetailPage'
import { PortfolioPage } from '@/features/learner/PortfolioPage'
import { CreativityPage } from '@/features/learner/CreativityPage'
import { CompanionsPage } from '@/features/learner/CompanionsPage'
import { CompanionChatPage } from '@/features/learner/CompanionChatPage'
import { EnglishCoachPage } from '@/features/learner/EnglishCoachPage'
import { CommunityPage } from '@/features/learner/CommunityPage'
import { CredentialsPage } from '@/features/learner/CredentialsPage'
import { RewardsPage } from '@/features/learner/RewardsPage'
import { SettingsPage } from '@/features/learner/SettingsPage'
import { SearchPage } from '@/features/learner/SearchPage'
import { NotificationsPage } from '@/features/learner/NotificationsPage'
import { StoriesPage, StoryReaderPage } from '@/features/learner/StoriesPage'
import { SimulationsPage } from '@/features/learner/SimulationsPage'
import { SimulationPlayerPage } from '@/features/learner/SimulationPlayerPage'
import { VoicePage } from '@/features/learner/VoicePage'
import { VerifyCredentialPage } from '@/features/public/VerifyCredentialPage'
import { ParentHomePage } from '@/features/parent/ParentHomePage'
import { ChildDetailPage } from '@/features/parent/ChildDetailPage'
import { ParentPrivacyPage } from '@/features/parent/ParentPrivacyPage'
import { ParentPlanPage } from '@/features/parent/ParentPlanPage'
import { ModerationHomePage } from '@/features/moderator/ModerationHomePage'
import { EscalationsPage } from '@/features/moderator/EscalationsPage'
import { CommunityModerationPage } from '@/features/moderator/CommunityModerationPage'
import { InterventionsPage } from '@/features/moderator/InterventionsPage'
import { AdminOverviewPage } from '@/features/admin/AdminOverviewPage'
import { AdminContentPage } from '@/features/admin/AdminContentPage'
import { AdminCurriculumPage } from '@/features/admin/AdminCurriculumPage'
import { AdminAiSafetyPage } from '@/features/admin/AdminAiSafetyPage'
import { AdminAnalyticsPage } from '@/features/admin/AdminAnalyticsPage'
import { AdminPlatformPage } from '@/features/admin/AdminPlatformPage'

/** `/` — public landing for signed-out visitors; role home for signed-in. */
function RootRoute() {
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  if (status === 'idle' || status === 'loading') return <LoadingState />
  if (status === 'authenticated' && user) return <Navigate to={roleHome(user.role)} replace />
  return <LandingPage />
}

/** Honest 404 (no silent bounce). */
function NotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-ink-900">404</h1>
      <p className="text-ink-500">{t('states.notFound')}</p>
      <button
        onClick={() => navigate(user ? roleHome(user.role) : '/')}
        className="rounded-control bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
      >
        {t('common.back')}
      </button>
    </div>
  )
}

export function AppRouter() {
  const loadSession = useAuthStore((s) => s.loadSession)
  useEffect(() => {
    void loadSession()
  }, [loadSession])

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/for-families" element={<ForFamiliesPage />} />
      <Route path="/safety" element={<SafetyPage />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/verify/:uid" element={<VerifyCredentialPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireRole allow={['LEARNER']}>
            <OnboardingPage />
          </RequireRole>
        }
      />

      {/* Learner shell */}
      <Route
        element={
          <RequireRole allow={['LEARNER']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/app" element={<HomePage />} />
        <Route path="/app/learn" element={<LearnPage />} />
        <Route path="/app/explore" element={<ExplorePage />} />
        <Route path="/app/learn/:slug" element={<DomainPathPage />} />
        <Route path="/app/missions/:id" element={<MissionDetailPage />} />
        <Route path="/app/runs/:runId" element={<MissionPlayerPage />} />
        <Route path="/app/practice" element={<PracticePage />} />
        <Route path="/app/progress" element={<ProgressPage />} />
        <Route path="/app/projects" element={<ProjectsPage />} />
        <Route path="/app/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/app/portfolio" element={<PortfolioPage />} />
        <Route path="/app/create" element={<CreativityPage />} />
        <Route path="/app/companions" element={<CompanionsPage />} />
        <Route path="/app/companions/:id" element={<CompanionChatPage />} />
        <Route path="/app/english-coach" element={<EnglishCoachPage />} />
        <Route path="/app/community" element={<CommunityPage />} />
        <Route path="/app/credentials" element={<CredentialsPage />} />
        <Route path="/app/rewards" element={<RewardsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/search" element={<SearchPage />} />
        <Route path="/app/notifications" element={<NotificationsPage />} />
        <Route path="/app/stories" element={<StoriesPage />} />
        <Route path="/app/stories/:id" element={<StoryReaderPage />} />
        <Route path="/app/simulations" element={<SimulationsPage />} />
        <Route path="/app/simulations/:slug" element={<SimulationPlayerPage />} />
        <Route path="/app/voice" element={<VoicePage />} />
      </Route>

      {/* Guardian shell */}
      <Route
        element={
          <RequireRole allow={['GUARDIAN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/parent" element={<ParentHomePage />} />
        <Route path="/parent/child/:id" element={<ChildDetailPage />} />
        <Route path="/parent/privacy" element={<ParentPrivacyPage />} />
        <Route path="/parent/plan" element={<ParentPlanPage />} />
      </Route>

      {/* Moderator shell */}
      <Route
        element={
          <RequireRole allow={['MODERATOR', 'ADMIN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/mod" element={<ModerationHomePage />} />
        <Route path="/mod/escalations" element={<EscalationsPage />} />
        <Route path="/mod/community" element={<CommunityModerationPage />} />
        <Route path="/mod/interventions" element={<InterventionsPage />} />
      </Route>

      {/* Admin shell */}
      <Route
        element={
          <RequireRole allow={['ADMIN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/content" element={<AdminContentPage />} />
        <Route path="/admin/curriculum" element={<AdminCurriculumPage />} />
        <Route path="/admin/ai" element={<AdminAiSafetyPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/platform" element={<AdminPlatformPage />} />
      </Route>

      {/* Fallback — honest 404 for everyone (auth and unauth); no silent bounce */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
