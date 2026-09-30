import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FolderKanban } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill } from '@/components/ui'

interface Project {
  id: string
  title: string
  state?: string
  status?: string
  description?: string
}

/** Learner projects — real GET /api/projects/my. Design system. */
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
              <Card className="h-full transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                    <FolderKanban className="h-5 w-5" aria-hidden />
                  </span>
                  {(p.state || p.status) && <StatusPill tone="brand">{p.state || p.status}</StatusPill>}
                </div>
                <h2 className="mt-3 font-display text-lg font-bold text-ink-900">{p.title}</h2>
                {p.description && <p className="mt-1 text-sm text-ink-500">{p.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
