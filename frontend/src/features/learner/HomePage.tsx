import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  RotateCcw,
  Flame,
  Star,
  CheckCircle2,
  FolderKanban,
  Trophy,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import {
  masteryApi,
  gamificationApi,
  adaptiveApi,
  worldsApi,
  dailyGoalsApi,
  projectsApi,
  charactersApi,
  rewardsApi,
} from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { agePresentation } from '@/lib/labels/ageLabels'
import { masteryLabel } from '@/lib/labels/masteryLabels'
import { Card, Button, Progress, StatusPill } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'

interface World {
  id: string
  name: string
  description?: string
  domain?: { slug: string; name: string }
  isUnlocked?: boolean
}
interface Recommendation {
  missionId?: string
  competencyName?: string
  reason?: string
}
interface MasteryRecordLite {
  id: string
  state: string
  competency?: { name: string; skill?: { domain?: { name: string } } }
}
interface ProjectLite {
  id: string
  title: string
  state?: string
}

/**
 * Learner Home — rebuilt (owner directive 2026-10-02: the previous version
 * was "greeting, level/XP, one next-step block, daily goal, choose-what-
 * to-learn, then empty" — a dashboard skeleton, not a living home).
 *
 * This is ONE connected learner home, not a card dump: every section below
 * is real backend-connected product state, prioritized so there is always
 * ONE obvious next action above the fold, with supporting context below.
 * Composition is age-adapted via agePresentation() (density/copyBudget) —
 * younger bands see fewer, larger blocks; older bands see more at once.
 *
 * Sections, in priority order:
 *  1. Greeting + companion presence (real /characters/orchestrate pick)
 *  2. Continue / next best action (the ONE thing to do right now)
 *  3. Today (daily goal + review-due, self-hiding when nothing is due)
 *  4. My worlds (real per-learner unlock state, not a generic nav list)
 *  5. Current project (if one exists and isn't finished)
 *  6. Recent progress (what the learner can now do, in kid language)
 *  7. Rewards teaser (level/streak/XP — connects to the Rewards loop)
 */
export function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const name = user?.learner?.displayName || user?.learner?.firstName || ''
  const presentation = agePresentation(user?.learner?.ageBand ?? null)
  const roomy = presentation.density === 'roomy'

  const progression = useQuery({
    queryKey: ['progression'],
    queryFn: async () => (await gamificationApi.getProgression()).data as { level?: number; totalXP?: number },
    retry: false,
  })
  const streak = useQuery({
    queryKey: ['streak'],
    queryFn: async () => (await gamificationApi.getStreak()).data as { current?: number },
    retry: false,
  })
  const reviewDue = useQuery({
    queryKey: ['review-due'],
    queryFn: async () => (await masteryApi.getReviewDue()).data as unknown[],
    retry: false,
  })
  const recs = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => (await adaptiveApi.getRecommendations()).data as Recommendation[],
    retry: false,
  })
  const worlds = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => (await worldsApi.list()).data as World[],
    retry: false,
  })
  const dailyGoal = useQuery({
    queryKey: ['daily-goal-progress'],
    queryFn: async () => (await dailyGoalsApi.getProgress()).data,
    retry: false,
  })
  // Real companion presence — GET /characters/orchestrate picks the most
  // contextually relevant unlocked companion (domain-aware fallback chain
  // on the backend). This was built and had ZERO frontend callers before
  // this pass; Home is the natural home for "a companion is here with you".
  const companion = useQuery({
    queryKey: ['companion-orchestrate'],
    queryFn: async () => (await charactersApi.orchestrate()).data,
    retry: false,
  })
  // Current (in-progress, not yet showcased/completed) project — real signal
  // for "what am I building right now", not shown if the learner has none.
  const projects = useQuery({
    queryKey: ['projects-mine', 'home'],
    queryFn: async () => (await projectsApi.mine()).data as ProjectLite[],
    retry: false,
  })
  // Recent mastery — "what I can do now", in kid language, not a raw list.
  const mastery = useQuery({
    queryKey: ['mastery-overview', 'home'],
    queryFn: async () => (await masteryApi.getOverview()).data as MasteryRecordLite[],
    retry: false,
  })
  const cosmetics = useQuery({
    queryKey: ['rewards-cosmetics', 'home'],
    queryFn: async () => (await rewardsApi.cosmetics()).data,
    retry: false,
  })

  const reviewCount = Array.isArray(reviewDue.data) ? reviewDue.data.length : 0
  const nextRec = Array.isArray(recs.data) ? recs.data.find((r) => r.missionId) : undefined
  const level = progression.data?.level ?? 1
  const xp = progression.data?.totalXP ?? 0
  const xpIntoLevel = xp % 100
  const unlockedWorlds = (worlds.data ?? []).filter((w) => w.isUnlocked !== false)
  const currentProject = (projects.data ?? []).find((p) => p.state && p.state !== 'COMPLETED' && p.state !== 'SHOWCASED')
  const recentMastery = (mastery.data ?? [])
    .filter((r) => r.state !== 'NOT_STARTED')
    .slice(-3)
    .reverse()
  const nextCosmetic = (cosmetics.data?.items ?? []).find((c) => !c.owned)

  return (
    <div className={roomy ? 'space-y-8' : 'space-y-6'}>
      {/* 1. Greeting + stats + companion presence */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {companion.data?.character && (
            <CharacterStage
              characterId={companion.data.character.name}
              size={roomy ? 72 : 56}
              animate
              className="shrink-0"
            />
          )}
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('learner.homeGreeting', { name })}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 text-brand-500" aria-hidden /> {t('learner.level')} {level}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-brand-500" aria-hidden /> {streak.data?.current ?? 0}
              </span>
            </div>
          </div>
        </div>
        <div className="w-40">
          <Progress value={xpIntoLevel} label={`${xp} XP`} />
          <p className="mt-1 text-end text-xs text-ink-400">{xp} XP</p>
        </div>
      </div>

      {/* 2. Continue / next best action — the ONE thing to do right now */}
      <Card className="bg-brand-700 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{t('learner.nextStep')}</p>
        {recs.isLoading ? (
          <Skeleton className="mt-2 h-6 w-2/3 bg-white/20" />
        ) : nextRec?.missionId ? (
          <>
            <p className="mt-1 font-display text-xl font-bold">{nextRec.competencyName ?? t('learner.startHere')}</p>
            {nextRec.reason && presentation.copyBudget !== 'short' && (
              <p className="mt-1 text-sm text-white/80">{nextRec.reason}</p>
            )}
            <Link to={`/app/missions/${nextRec.missionId}`} className="mt-4 inline-block">
              <Button variant="secondary">
                {t('learner.startHere')} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="mt-1 text-white/90">{t('learner.chooseWorld')}</p>
            <Link to="/app/learn" className="mt-4 inline-block">
              <Button variant="secondary">{t('nav.learn')}</Button>
            </Link>
          </>
        )}
      </Card>

      {/* 3. Today — review + daily goal, self-hiding, never both empty+shown */}
      {(reviewCount > 0 || dailyGoal.data) && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">{t('learner.todayTitle')}</h2>
          <div className={roomy ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'}>
            {reviewCount > 0 && (
              <Link
                to="/app/practice"
                className="flex items-center justify-between rounded-card border border-line bg-white p-4 shadow-soft transition-colors hover:bg-canvas-off"
              >
                <span className="inline-flex items-center gap-2 font-medium text-ink-800">
                  <RotateCcw className="h-5 w-5 text-brand-500" aria-hidden />
                  {t('learner.reviewNudge', { count: reviewCount })}
                </span>
                <ArrowRight className="h-4 w-4 text-brand-600 rtl:-scale-x-100" aria-hidden />
              </Link>
            )}
            {dailyGoal.data && (
              <Card className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('learner.dailyGoalTitle')}</p>
                  <p className="mt-1 font-medium text-ink-900">
                    {dailyGoal.data.goalMet
                      ? t('learner.dailyGoalMet')
                      : t('learner.dailyGoalMinutes', {
                          minutes: dailyGoal.data.progress.minutesSpent,
                          target: dailyGoal.data.goal.targetMinutes,
                        })}
                  </p>
                </div>
                {dailyGoal.data.goalMet ? (
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-success-500" aria-hidden />
                ) : (
                  <div className="w-24 shrink-0">
                    <Progress
                      value={Math.max(dailyGoal.data.percentComplete.minutes, dailyGoal.data.percentComplete.activities)}
                    />
                  </div>
                )}
              </Card>
            )}
          </div>
        </section>
      )}

      {/* 4. My worlds — real unlock state, not a generic nav restatement */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.myWorlds')}</h2>
          <Link to="/app/learn" className="text-sm font-medium text-brand-600 hover:underline">
            {t('nav.learn')}
          </Link>
        </div>
        {worlds.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : unlockedWorlds.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedWorlds.slice(0, roomy ? 3 : 6).map((w) => {
              const slug = w.domain?.slug
              const inner = (
                <Card className="flex h-full items-center gap-3 transition-transform duration-fast hover:-translate-y-0.5">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                    <BookOpen className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="min-w-0 truncate font-display font-bold text-ink-900">{w.domain?.name ?? w.name}</h3>
                </Card>
              )
              return slug ? (
                <Link key={w.id} to={`/app/learn/${slug}`}>
                  {inner}
                </Link>
              ) : (
                <div key={w.id}>{inner}</div>
              )
            })}
          </div>
        ) : (
          <Card className="text-center text-sm text-ink-500">{t('learner.worldsLocked')}</Card>
        )}
      </section>

      {/* 5. Current project — only when one is actually in progress */}
      {currentProject && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">{t('learner.continueProject')}</h2>
          <Link to={`/app/projects/${currentProject.id}`}>
            <Card className="flex items-center justify-between gap-3 transition-transform duration-fast hover:-translate-y-0.5">
              <span className="flex min-w-0 items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <FolderKanban className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display font-bold text-ink-900">{currentProject.title}</span>
                  {currentProject.state && <StatusPill tone="brand">{currentProject.state}</StatusPill>}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 rtl:-scale-x-100" aria-hidden />
            </Card>
          </Link>
        </section>
      )}

      {/* 6. Recent progress — kid language, never raw enums/decimals */}
      {recentMastery.length > 0 && presentation.copyBudget !== 'short' && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">{t('learner.recentProgress')}</h2>
          <div className="space-y-2">
            {recentMastery.map((r) => (
              <Card key={r.id} className="flex items-center justify-between">
                <span className="min-w-0 truncate font-medium text-ink-900">
                  {r.competency?.name ?? ''}
                  {r.competency?.skill?.domain?.name && (
                    <span className="ms-2 text-xs text-ink-400">{r.competency.skill.domain.name}</span>
                  )}
                </span>
                <StatusPill tone="success">{masteryLabel(r.state)}</StatusPill>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 7. Rewards teaser — connects Home to the progression loop */}
      <section>
        <Link to="/app/rewards">
          <Card className="flex items-center justify-between gap-3 transition-transform duration-fast hover:-translate-y-0.5">
            <span className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-warning-100 text-warning-700">
                {nextCosmetic ? <Sparkles className="h-5 w-5" aria-hidden /> : <Trophy className="h-5 w-5" aria-hidden />}
              </span>
              <span className="min-w-0">
                <span className="block font-display font-bold text-ink-900">{t('learner.rewards')}</span>
                <span className="block truncate text-sm text-ink-500">
                  {nextCosmetic
                    ? t('learner.cosmeticUnlock', { cost: nextCosmetic.xpCost })
                    : t('learner.rewardsTeaserDefault', { xp })}
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 rtl:-scale-x-100" aria-hidden />
          </Card>
        </Link>
      </section>
    </div>
  )
}
