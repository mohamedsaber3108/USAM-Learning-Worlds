import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, StatusPill } from '@/components/ui'

interface Milestone {
  id: string
  title: string
  status?: string
  completed?: boolean
}
interface ProjectDetail {
  id: string
  title: string
  description?: string
  state?: string
  status?: string
  milestones?: Milestone[]
  curriculumContext?: { competencyName?: string; domainName?: string } | null
}

/** Project detail — brief + milestones + linked learning. Project→Competency is
 * shown only as the backend exposes it (no invented evidence links). DS. */
export function ProjectDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await projectsApi.getById(id)).data as ProjectDetail,
    enabled: Boolean(id),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  const milestones = data.milestones ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        subtitle={data.description}
        action={(data.state || data.status) ? <StatusPill tone="brand">{data.state || data.status}</StatusPill> : undefined}
      />

      {data.curriculumContext?.competencyName && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t('learner.masteryBy')}</p>
          <p className="mt-1 text-ink-800">
            {data.curriculumContext.competencyName}
            {data.curriculumContext.domainName ? ` · ${data.curriculumContext.domainName}` : ''}
          </p>
        </Card>
      )}

      <section>
        <SectionHeader title="Milestones" />
        {milestones.length > 0 ? (
          <ol className="space-y-2">
            {milestones.map((m) => {
              const done = m.completed || m.status?.toLowerCase() === 'done'
              return (
                <li key={m.id}>
                  <Card className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                    )}
                    <span className="flex-1 font-medium text-ink-900">{m.title}</span>
                    {m.status && <StatusPill tone={done ? 'success' : 'neutral'}>{m.status}</StatusPill>}
                  </Card>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  )
}
