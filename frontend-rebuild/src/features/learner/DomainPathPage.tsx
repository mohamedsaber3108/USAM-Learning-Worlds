import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { learningApi, masteryApi } from '@/lib/api/endpoints'
import type { DomainPath } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { masteryLabel } from '@/lib/labels/masteryLabels'
import { Button } from '@/components/ui/Button'

/**
 * The ONE generic domain path page (slug-driven) — the proven pattern from the
 * legacy baseline, rebuilt cleanly. Composes the canonical spine path with the
 * ONE next action + a review nudge. Child-language only (no enums/decimals).
 */
export function DomainPathPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()

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
    <div className="space-y-8">
      <header className="rounded-card bg-brand-700 p-6 text-white shadow-lift">
        <p className="text-sm text-white/80">{t('learner.yourPath')}</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">{path?.domain?.name ?? slug}</h1>
        {nextAction?.missionId && (
          <Link
            to={`/app/missions/${nextAction.missionId}`}
            className="mt-5 flex max-w-md items-center justify-between gap-3 rounded-card bg-white/95 px-5 py-3 text-ink-900 shadow-lift hover:bg-white"
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold uppercase tracking-wide text-brand-600">
                {nextAction.masteryState === 'NOT_STARTED' ? t('learner.startHere') : t('learner.continue')}
              </span>
              <span className="block truncate font-display font-bold">{nextAction.name}</span>
            </span>
            <span aria-hidden className="text-brand-600 rtl:-scale-x-100">→</span>
          </Link>
        )}
      </header>

      {reviewCount > 0 && (
        <Link
          to="/app/practice"
          className="flex items-center justify-between rounded-card border border-line bg-white p-5 shadow-soft hover:bg-canvas-off"
        >
          <span className="font-medium text-ink-800">{t('learner.reviewNudge', { count: reviewCount })}</span>
          <span aria-hidden className="text-brand-600 rtl:-scale-x-100">→</span>
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
                  {skill.competencies.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink-900">{comp.name}</span>
                        <span className="block text-xs text-ink-400">{masteryLabel(comp.masteryState)}</span>
                      </span>
                      {comp.missionId && (
                        <Link to={`/app/missions/${comp.missionId}`}>
                          <Button size="sm" variant="secondary">
                            {t('learner.startMission')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
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
