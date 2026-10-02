import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { gamificationApi, masteryApi, missionsApi, cosmeticsApi } from '@/lib/api/endpoints'
import { useAgeAdaptation } from '@/lib/hooks/useAgeAdaptation'
import { useMilestoneDetection } from '@/lib/hooks/useMilestoneDetection'
import { masteryLabel } from '@/lib/mastery/masteryLabels'
import { CelebrationOverlay } from '@/components/celebrations/CelebrationOverlay'
import { InterestChips } from '../components/InterestChips'
import { WorldJourneyMap } from '../components/WorldJourneyMap'
import { DiscoverRail } from '../components/DiscoverRail'
import { LivingWorldHero } from '../components/LivingWorldHero'
import { EmptyState, ErrorState } from '@/components/common/CharacterState'
import { DashboardSkeleton } from '@/components/common/Skeleton'

/**
 * Child HOME — the living-world home (experience reconstruction, Phase 2).
 *
 * Rebuilt from the "dashboard with child colours" negative baseline (a hero
 * followed by a stat-card grid, a level ring, a mastery-count panel, a 10-tile
 * quick-action grid and a mission log) into a WORLD the child enters
 * (directive §2/§6/§7/§17/§18/§19). Order of surfaces:
 *
 *   1. LivingWorldHero  — Azouz at scale + the ONE next action + a COMPACT
 *                         progress ribbon (XP is secondary — §18).
 *   2. WorldJourneyMap  — the 4 domains as PLACES on a journey, mastery shown
 *                         as each place's band colour (distinct from XP — §19).
 *   3. Keep exploring   — real engines: recommendations, review-due, interests,
 *                         daily goal.
 *   4. Quiet secondary  — recent activity + a single link to full /progress.
 *
 * The analytics surfaces that used to dominate Home (level ring, XP hero card,
 * mastery counts, rank) are NOT deleted — they live on /progress, where an
 * analytics view is appropriate. Zero data loss: every real query that fed the
 * old page is still wired. useAgeAdaptation still drives genuine density
 * branching (how much "keep exploring" to show for the youngest band).
 */
export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const adapt = useAgeAdaptation(user?.learner?.ageBand)

  // First-time learners without a completed onboarding get routed into it.
  useEffect(() => {
    if (user?.role === 'LEARNER' && user.learner && !user.learner.ageBand) {
      navigate('/onboarding/language', { replace: true })
    }
  }, [user, navigate])

  const {
    data: progression,
    isLoading: progressionLoading,
    isError: progressionIsError,
    refetch: refetchProgression,
  } = useQuery({
    queryKey: ['progression'],
    queryFn: () => gamificationApi.getProgression().then(res => res.data),
  })

  const { data: streak } = useQuery({
    queryKey: ['streak'],
    queryFn: () => gamificationApi.getStreak().then(res => res.data),
  })

  const { data: recentMissions } = useQuery({
    queryKey: ['recent-missions'],
    queryFn: () => missionsApi.getHistory().then(res => res.data),
  })

  const { data: equippedCosmetics } = useQuery({
    queryKey: ['cosmetics-equipped'],
    queryFn: () => cosmeticsApi.getEquipped().then(res => res.data),
  })

  // Mastery overview is NOT rendered as a panel on Home anymore (that analytics
  // view moved to /progress — §19). We still read it, cheaply and cached, only
  // to feed the mastered-count into milestone detection so the "new mastery"
  // celebration keeps working exactly as before.
  const { data: mastery } = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: () => masteryApi.getOverview().then(res => res.data),
  })

  const equippedTitleName: string | null = equippedCosmetics?.TITLE?.name ?? null

  // Real event-driven celebration — unchanged logic, fires only on genuinely
  // new milestones, never on a plain refresh.
  const masteryArr: any[] = Array.isArray(mastery) ? mastery : []
  const masteredCount = masteryArr.filter((m: any) => masteryLabel(m.state).band === 'mastered').length
  const completedMissionCount = Array.isArray(recentMissions)
    ? recentMissions.filter((run: any) => run.status === 'COMPLETED').length
    : 0
  const progressionReady = !!progression && !!streak && Array.isArray(mastery) && !!recentMissions
  const milestone = useMilestoneDetection(
    {
      level: progression?.level,
      streak: streak?.currentStreak,
      totalXP: progression?.totalXP,
      masteredCount,
      completedMissionCount,
    },
    progressionReady
  )
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)

  if (progressionLoading) {
    return <DashboardSkeleton />
  }

  if (progressionIsError) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <ErrorState
          character="Azouz"
          title="Hmm, your world didn't load"
          message="No worries — this happens sometimes. Let's give it another try."
          onRetry={() => refetchProgression()}
        />
      </div>
    )
  }

  // The ONE next action — resume an in-progress mission, else head to missions.
  const inProgress = Array.isArray(recentMissions)
    ? recentMissions.find((r: any) => r.status === 'IN_PROGRESS')
    : null
  const nextTo = inProgress ? `/missions/play/${inProgress.id}` : '/missions'
  const nextTitle = inProgress
    ? inProgress.mission?.title || t('home.continueMission', 'Continue your mission')
    : t('dashboard.quickActions.missions')
  const nextKicker = inProgress
    ? t('home.pickUp', 'Pick up where you left off')
    : t('home.nextStep', "Today's next step")
  const nextLabel = inProgress ? t('missionPlayer.continue') : t('home.start', 'Start')

  return (
    <div className="min-h-screen bg-surface-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Living-world hero — companion at scale + ONE next action + ribbon. */}
        <LivingWorldHero
          displayName={user?.displayName || t('dashboard.defaultLearnerName')}
          companion="Azouz"
          adapt={adapt}
          greeting={t(`dashboard.greetingSubtext.${adapt.copyTone}`)}
          nextTo={nextTo}
          nextTitle={nextTitle}
          nextKicker={nextKicker}
          nextLabel={nextLabel}
          level={progression?.level || 1}
          totalXp={progression?.totalXP || 0}
          streak={streak?.currentStreak || 0}
          equippedTitle={equippedTitleName}
        />

        {/* 1b. A quiet identity footnote under the hero — not a stacked card. */}
        <InterestChips />

        {/* 2. The world journey — 4 domains as places; mastery as place-state. */}
        <WorldJourneyMap />

        {/* 3. One horizontally-scrolling rail of quest tiles — replaces four
            stacked full-width "widget" cards (review/recommendations/goal)
            with a single same-shaped-tile grammar, consistent with the world
            portals above it. Self-hides when the learner has nothing due. */}
        <DiscoverRail />

        {/* 4. Quiet secondary — recent activity + a single link to full progress.
            The old stat-grid / level-ring / mastery-count / 10-tile quick-action
            analytics now live on /progress, not on Home. */}
        {recentMissions && recentMissions.length > 0 ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" strokeWidth={2} />
                <h3>{t('dashboard.recentMissions')}</h3>
              </div>
              <Link to="/progress" className="text-sm font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                {t(`dashboard.viewProgress.${adapt.copyTone}`)}
              </Link>
            </div>
            <div className="space-y-2">
              {recentMissions.slice(0, adapt.density === 'simple' ? 3 : 5).map((run: any) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" strokeWidth={2} />
                    ) : (
                      <Clock className="w-4 h-4 text-warning-500 flex-shrink-0" strokeWidth={2} />
                    )}
                    <div>
                      <h4 className="font-medium text-sm text-slate-800">{run.mission?.title || 'Mission'}</h4>
                      <p className="text-xs text-slate-500">
                        {run.status === 'COMPLETED' ? t('dashboard.missionCompleted') : t('dashboard.missionInProgress')}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-primary-600">
                      {run.finalScore ? `${run.finalScore}%` : '---'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {run.startedAt && !Number.isNaN(new Date(run.startedAt).getTime())
                        ? new Date(run.startedAt).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            character="Azouz"
            title="No missions yet"
            message="Every adventure starts with a first step — pick a world above and Azouz will cheer you on!"
            actionLabel="Browse missions"
            actionTo="/missions"
          />
        )}
      </main>

      {!celebrationDismissed && (
        <CelebrationOverlay
          milestone={milestone}
          onDismiss={() => setCelebrationDismissed(true)}
        />
      )}
    </div>
  )
}
