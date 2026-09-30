import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { masteryApi } from '@/lib/api/endpoints'
import type { MasteryRecord, DomainMastery } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { masteryLabel } from '@/lib/labels/masteryLabels'

/** Progress = mastery overview + by-domain, in child language (no confidence
 * decimals, no MasteryState enum). Real mastery endpoints. */
export function ProgressPage() {
  const { t } = useTranslation()

  const overview = useQuery({
    queryKey: ['mastery-overview'],
    queryFn: async () => (await masteryApi.getOverview()).data as MasteryRecord[],
  })
  const byDomain = useQuery({
    queryKey: ['mastery-by-domain'],
    queryFn: async () => (await masteryApi.getByDomain()).data as DomainMastery[],
    retry: false,
  })

  if (overview.isLoading) return <LoadingState />
  if (overview.isError) return <ErrorState onRetry={() => void overview.refetch()} />

  const records = overview.data ?? []
  if (records.length === 0) return <EmptyState title={t('learner.noProgress')} />

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('learner.progressTitle')}</h1>

      {byDomain.data && byDomain.data.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-ink-900">{t('learner.masteryBy')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byDomain.data.map((d) => (
              <div key={d.domain} className="rounded-card border border-line bg-white p-5 shadow-soft">
                <h3 className="font-display font-bold text-ink-900">{d.domain}</h3>
                <p className="mt-2 text-sm text-ink-500">
                  {d.masteredCount} / {d.totalCompetencies} mastered
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">
                  {r.competency?.name ?? r.competencyId}
                </span>
                {r.competency?.skill?.domain?.name && (
                  <span className="block text-xs text-ink-400">{r.competency.skill.domain.name}</span>
                )}
              </span>
              <span className="rounded-pill bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {masteryLabel(r.state)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
