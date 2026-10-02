import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, RotateCcw, Lock, CheckCircle2, Circle, MessageCircle } from 'lucide-react'
import { learningApi, masteryApi } from '@/lib/api/endpoints'
import type { DomainPath } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, Button, StatusPill } from '@/components/ui'
import { masteryLabel, type MasteryState } from '@/lib/labels/masteryLabels'
import { DOMAIN_COMPANION } from '@/lib/labels/domainCompanions'

function masteryTone(state: MasteryState): 'success' | 'brand' | 'neutral' {
  if (state === 'MASTERED' || state === 'PROFICIENT') return 'success'
  if (state === 'NOT_STARTED') return 'neutral'
  return 'brand'
}

/**
 * The ONE generic domain path (slug-driven), rebuilt on the design system with
 * a companion-framed header + the ONE next action + a review nudge + a real
 * skill→competency path with mastery shown as kid words (never enums/decimals).
 */
export function DomainPathPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const companion = DOMAIN_COMPANION[slug]

  const { data: path, isLoading, isError, refetch } = useQuery({
    queryKey: ['domain-path', slug],
    queryFn: async () => (await learningApi.getDomainPath(slug)).data as DomainPath,
    enabled: Boolean(slug),
  })
  const { data: reviewDue } = useQuery({
    queryKey: ['review-due', slug],
    queryFn: async () => (await masteryApi.getReviewDue()).data as unknown[],
    retry: false,
  })
  const reviewCount = Array.isArray(reviewDue) ? reviewDue.length : 0

  const nextAction = useMemo(() => {
    const comps = (path?.skills ?? []).flatMap((s) => s.competencies).filter((c) => c.missionId)
    return (
      comps.find((c) => c.masteryState === 'NOT_STARTED') ??
      comps.find((c) => c.masteryState !== 'NOT_STARTED' && c.masteryState !== 'MASTERED') ??
      comps[0] ??
      null
    )
  }, [path])

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const skills = path?.skills ?? []
  const hasPath = skills.some((s) => s.competencies.length > 0)

  return (
    <div className="space-y-6">
      {/* Companion-framed header + next action */}
      <Card className="bg-brand-700 text-white">
        {companion && <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{companion}</p>}
        <h1 className="mt-1 font-display text-3xl font-extrabold">{path?.domain?.name ?? slug}</h1>
        {nextAction?.missionId && (
          <Link
            to={`/app/missions/${nextAction.missionId}`}
            className="mt-5 flex max-w-md items-center justify-between gap-3 rounded-control bg-white/95 px-5 py-3 text-ink-900 hover:bg-white"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wide text-brand-600">
                {nextAction.masteryState === 'NOT_STARTED' ? t('learner.startHere') : t('learner.continue')}
              </span>
              <span className="block truncate font-display font-bold">{nextAction.name}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-brand-600 rtl:-scale-x-100" aria-hidden />
          </Link>
        )}
      </Card>

      {reviewCount > 0 && (
        <Link
          to="/app/practice"
          className="flex items-center justify-between rounded-card border border-line bg-white p-4 shadow-soft hover:bg-canvas-off"
        >
          <span className="inline-flex items-center gap-2 font-medium text-ink-800">
            <RotateCcw className="h-5 w-5 text-brand-500" aria-hidden />
            {t('learner.reviewNudge', { count: reviewCount })}
          </span>
          <ArrowRight className="h-4 w-4 text-brand-600 rtl:-scale-x-100" aria-hidden />
        </Link>
      )}

      {/* English Coach — real conversation+grammar practice (coding-coach
          help lives inline in the mission player's CODE activity instead,
          since that's where real code already exists to debug). */}
      {slug === 'english' && (
        <Link
          to="/app/english-coach"
          className="flex items-center justify-between rounded-card border border-line bg-white p-4 shadow-soft hover:bg-canvas-off"
        >
          <span className="inline-flex items-center gap-2 font-medium text-ink-800">
            <MessageCircle className="h-5 w-5 text-brand-500" aria-hidden />
            {t('learner.englishCoachNudge')}
          </span>
          <ArrowRight className="h-4 w-4 text-brand-600 rtl:-scale-x-100" aria-hidden />
        </Link>
      )}

      <section>
        <h2 className="font-display text-lg font-bold text-ink-900">{t('learner.yourPath')}</h2>
        <p className="mt-1 text-sm text-ink-500">{t('learner.pathHint')}</p>

        {hasPath ? (
          <div className="mt-4 space-y-6">
            {skills.map((skill) => (
              <div key={skill.id}>
                <h3 className="mb-2 font-display font-bold text-ink-800">{skill.name}</h3>
                <div className="space-y-2">
                  {skill.competencies.map((comp) => {
                    const done = comp.masteryState === 'MASTERED' || comp.masteryState === 'PROFICIENT'
                    const started = comp.masteryState !== 'NOT_STARTED'
                    return (
                      <div key={comp.id} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
                        <span className="flex min-w-0 items-center gap-3">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" aria-hidden />
                          ) : started ? (
                            <Circle className="h-5 w-5 shrink-0 text-brand-400" aria-hidden />
                          ) : (
                            <Lock className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-ink-900">{comp.name}</span>
                            <StatusPill tone={masteryTone(comp.masteryState)}>{masteryLabel(comp.masteryState)}</StatusPill>
                          </span>
                        </span>
                        {comp.missionId && (
                          <Link to={`/app/missions/${comp.missionId}`}>
                            <Button size="sm" variant="secondary">
                              {started ? t('learner.continue') : t('learner.startMission')}
                            </Button>
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={t('learner.pathBeingBuilt')} />
        )}
      </section>
    </div>
  )
}
