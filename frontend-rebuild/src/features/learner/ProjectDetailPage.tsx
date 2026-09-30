import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Milestone {
  id: string
  title: string
  status?: string
}
interface ProjectDetail {
  id: string
  title: string
  description?: string
  status?: string
  milestones?: Milestone[]
  curriculumContext?: { competencyName?: string; domainName?: string } | null
}

/** Project detail: brief + milestones + curriculum link (Project→Competency, as
 * the backend actually exposes it — no invented evidence links). */
export function ProjectDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await projectsApi.getById(id)).data as ProjectDetail,
    enabled: Boolean(id),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        subtitle={data.description}
        action={data.status ? <Badge tone="brand">{data.status}</Badge> : undefined}
      />

      {data.curriculumContext?.competencyName && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Linked learning</p>
          <p className="mt-1 text-ink-800">
            {data.curriculumContext.competencyName}
            {data.curriculumContext.domainName ? ` · ${data.curriculumContext.domainName}` : ''}
          </p>
        </Card>
      )}

      <section>
        <SectionHeader title="Milestones" />
        {data.milestones && data.milestones.length > 0 ? (
          <div className="space-y-2">
            {data.milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
                <span className="font-medium text-ink-900">{m.title}</span>
                {m.status && <Badge tone={m.status.toLowerCase() === 'done' ? 'success' : 'neutral'}>{m.status}</Badge>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  )
}
