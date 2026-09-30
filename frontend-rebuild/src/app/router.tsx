import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/auth/authStore'
import { RequireAuth, RequireRole, roleHome } from './guards'
import { AppShell } from '@/components/layout/AppShell'
import { Placeholder } from '@/components/common/Placeholder'
import { LoadingState } from '@/components/common/States'
import { LandingPage } from '@/features/public/LandingPage'
import { PricingPage } from '@/features/public/PricingPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { OnboardingPage } from '@/features/onboarding/OnboardingPage'
import { HomePage } from '@/features/learner/HomePage'
import { LearnPage } from '@/features/learner/LearnPage'
import { DomainPathPage } from '@/features/learner/DomainPathPage'
import { MissionDetailPage } from '@/features/learner/MissionDetailPage'
import { MissionPlayerPage } from '@/features/learner/MissionPlayerPage'
import { PracticePage } from '@/features/learner/PracticePage'
import { ProgressPage } from '@/features/learner/ProgressPage'

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
      <Route path="/verify/:uid" element={<Placeholder title="Verify credential" backend="GET /api/credentials/:uid" />} />
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
        <Route path="/app/learn/:slug" element={<DomainPathPage />} />
        <Route path="/app/missions/:id" element={<MissionDetailPage />} />
        <Route path="/app/runs/:runId" element={<MissionPlayerPage />} />
        <Route path="/app/practice" element={<PracticePage />} />
        <Route path="/app/progress" element={<ProgressPage />} />
        <Route path="/app/projects" element={<Placeholder title="Projects" backend="GET /api/projects/my" />} />
        <Route path="/app/portfolio" element={<Placeholder title="Portfolio" backend="GET /api/projects/portfolio/:learnerId" />} />
        <Route path="/app/create" element={<Placeholder title="Creativity studio" backend="GET /api/creativity/prompts" />} />
        <Route path="/app/companions" element={<Placeholder title="Companions" backend="GET /api/characters" />} />
        <Route path="/app/community" element={<Placeholder title="Community" backend="GET /api/community/feed" />} />
        <Route path="/app/credentials" element={<Placeholder title="Credentials" backend="GET /api/credentials/me" />} />
        <Route path="/app/rewards" element={<Placeholder title="Rewards" backend="GET /api/gamification/*" />} />
        <Route path="/app/settings" element={<Placeholder title="Settings" backend="GET /api/auth/me" />} />
      </Route>

      {/* Guardian shell */}
      <Route
        element={
          <RequireRole allow={['GUARDIAN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/parent" element={<Placeholder title="Children" backend="GET /api/parents/children, /family-summary" />} />
        <Route path="/parent/child/:id" element={<Placeholder title="Child detail" backend="GET /api/parents/children/:id/*" />} />
        <Route path="/parent/privacy" element={<Placeholder title="Privacy" backend="legal consent/export/delete" />} />
        <Route path="/parent/plan" element={<Placeholder title="Plan" backend="GET /api/entitlements/me" />} />
      </Route>

      {/* Moderator shell */}
      <Route
        element={
          <RequireRole allow={['MODERATOR', 'ADMIN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/mod" element={<Placeholder title="Moderation" backend="GET /api/safety-escalations/stats/summary" />} />
        <Route path="/mod/escalations" element={<Placeholder title="Escalations" backend="GET /api/safety-escalations" />} />
        <Route path="/mod/community" element={<Placeholder title="Community moderation" backend="GET /api/community/moderation/quarantined" />} />
        <Route path="/mod/interventions" element={<Placeholder title="Interventions" backend="GET /api/admin/interventions" />} />
      </Route>

      {/* Admin shell */}
      <Route
        element={
          <RequireRole allow={['ADMIN']}>
            <AppShell />
          </RequireRole>
        }
      >
        <Route path="/admin" element={<Placeholder title="Admin" backend="GET /api/admin/analytics/overview" />} />
        <Route path="/admin/content" element={<Placeholder title="Content" backend="/api/admin/content-items" />} />
        <Route path="/admin/missions" element={<Placeholder title="Missions admin" backend="/api/admin/missions" />} />
        <Route path="/admin/curriculum" element={<Placeholder title="Curriculum & QA" backend="/api/admin/*" />} />
        <Route path="/admin/ai" element={<Placeholder title="AI & Safety" backend="/api/admin/prompt-templates, safety-policies" />} />
        <Route path="/admin/analytics" element={<Placeholder title="Analytics" backend="/api/admin/analytics/*" />} />
        <Route path="/admin/platform" element={<Placeholder title="Platform" backend="/api/feature-flags, /experiments, /audit/logs" />} />
      </Route>

      {/* Fallback — honest 404 wrapped so unauth still works */}
      <Route
        path="*"
        element={
          <RequireAuth>
            <NotFound />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
