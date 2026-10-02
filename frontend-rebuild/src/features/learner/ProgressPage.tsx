import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { masteryApi, missionsApi } from '@/lib/api/endpoints'
import type { MasteryRecord, DomainMastery } from '@/lib/api/learning-types'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, StatusPill, Progress } from '@/components/ui'
import { masteryLabel, type MasteryState } from '@/lib/labels/masteryLabels'

const RUN_STATUS_TONE = { COMPLETED: 'success', IN_PROGRESS: 'brand', ABANDONED: 'neutral' } as const
const RUN_STATUS_KEY = {
  COMPLETED: 'learner.missionStatusCompleted',
  IN_PROGRESS: 'learner.missionStatusInProgress',
  ABANDONED: 'learner.missionStatusAbandoned',
} as const

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
  // NEW (2026-10-02, ledger 88 task 9): GET /missions/history/me had zero FE
  // consumer despite being a natural fit for a progress view.
  const history = useQuery({
    queryKey: ['mission-history'],
    queryFn: async () => (await missionsApi.getHistory()).data,
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

      <section>
        <SectionHeader title={t('learner.missionHistory')} />
        {history.data && history.data.length > 0 ? (
          <div className="space-y-2">
            {history.data.slice(0, 10).map((run) => (
              <Card key={run.id} className="flex items-center justify-between">
                <span className="min-w-0 truncate font-medium text-ink-900">{run.mission.title}</span>
                <StatusPill tone={RUN_STATUS_TONE[run.status]}>{t(RUN_STATUS_KEY[run.status])}</StatusPill>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title={t('learner.missionHistoryEmpty')} />
        )}
      </section>
    </div>
  )
}
