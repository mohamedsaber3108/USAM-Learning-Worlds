import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { masteryApi } from '@/lib/api/endpoints'
import type { MasteryRecord, DomainMastery } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, StatusPill, Progress } from '@/components/ui'
import { masteryLabel, type MasteryState } from '@/lib/labels/masteryLabels'

function tone(state: MasteryState): 'success' | 'brand' | 'neutral' {
  if (state === 'MASTERED' || state === 'PROFICIENT') return 'success'
  if (state === 'NOT_STARTED') return 'neutral'
  return 'brand'
}

/** Progress — mastery overview + by-domain, child language (no enums/decimals).
 * Real mastery endpoints. Design system. */
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
      <PageHeader title={t('learner.progressTitle')} />

      {byDomain.data && byDomain.data.length > 0 && (
        <section>
          <SectionHeader title={t('learner.masteryBy')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byDomain.data.map((d) => {
              const pct = d.totalCompetencies > 0 ? (d.masteredCount / d.totalCompetencies) * 100 : 0
              return (
                <Card key={d.domain}>
                  <h3 className="font-display font-bold text-ink-900">{d.domain}</h3>
                  <p className="mt-1 text-sm text-ink-500">
                    {d.masteredCount} / {d.totalCompetencies}
                  </p>
                  <div className="mt-3">
                    <Progress value={pct} label={`${d.domain} mastery`} />
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title={t('learner.masteryBy')} />
        <div className="space-y-2">
          {records.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{r.competency?.name ?? r.competencyId}</span>
                {r.competency?.skill?.domain?.name && (
                  <span className="block text-xs text-ink-400">{r.competency.skill.domain.name}</span>
                )}
              </span>
              <StatusPill tone={tone(r.state)}>{masteryLabel(r.state)}</StatusPill>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
