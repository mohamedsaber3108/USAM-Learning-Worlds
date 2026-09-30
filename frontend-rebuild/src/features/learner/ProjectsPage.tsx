import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface Project {
  id: string
  title: string
  status?: string
  description?: string
}

/** Learner projects — real GET /api/projects/my. Discover→build→submit stages
 * live in the project detail; this is the list + entry. */
export function ProjectsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects-mine'],
    queryFn: async () => (await projectsApi.mine()).data as Project[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.projects')} />
      {!data || data.length === 0 ? (
        <EmptyState hint={t('learner.noProgress')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((p) => (
            <Link key={p.id} to={`/app/projects/${p.id}`}>
              <Card className="h-full transition-colors hover:bg-canvas-off">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-ink-900">{p.title}</h2>
                  {p.status && <Badge tone="brand">{p.status}</Badge>}
                </div>
                {p.description && <p className="mt-2 text-sm text-ink-500">{p.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
