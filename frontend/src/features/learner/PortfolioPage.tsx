import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FolderKanban, Award } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/auth/authStore'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill } from '@/components/ui'
import { projectStateLabel, projectStateTone } from '@/lib/labels/projectLabels'

interface PortfolioProject {
  id: string
  title: string
  description?: string | null
  state?: string
  skills?: string[]
}

/**
 * FIX (2026-10-02): this page previously assumed GET /projects/portfolio/:id
 * returned a bare `PortfolioItem[]`. The real backend
 * (projects.service.ts getPortfolio) returns `{ learner, projects, stats }`
 * — reading `data.length` on that object silently rendered the empty state
 * for every learner, regardless of how many real showcased projects they
 * had. Rebuilt to match the real shape, surface the stats the backend
 * already computes (total/showcased), and show child-language project
 * state instead of the raw ProjectState enum.
 */
interface PortfolioResponse {
  learner: { id: string; name: string }
  projects: PortfolioProject[]
  stats: { totalProjects: number; showcasedProjects: number }
}

/** Portfolio — showcased work. Real GET /projects/portfolio/:learnerId. DS. */
export function PortfolioPage() {
  const { t } = useTranslation()
  const learnerId = useAuthStore((s) => s.user?.learner?.id)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['portfolio', learnerId],
    queryFn: async () => (await projectsApi.portfolio(learnerId!)).data as PortfolioResponse,
    enabled: Boolean(learnerId),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const projects = data?.projects ?? []

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.portfolio')} subtitle={t('learner.portfolioSubtitle')} />

      {data && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <FolderKanban className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-ink-900">{data.stats.totalProjects}</p>
              <p className="text-sm text-ink-500">{t('learner.portfolioTotal')}</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <Award className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-ink-900">{data.stats.showcasedProjects}</p>
              <p className="text-sm text-ink-500">{t('learner.portfolioShowcased')}</p>
            </div>
          </Card>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState hint={t('learner.portfolioEmptyHint')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((item) => (
            <Link key={item.id} to={`/app/projects/${item.id}`}>
              <Card className="h-full transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                    <FolderKanban className="h-5 w-5" aria-hidden />
                  </span>
                  {item.state && <StatusPill tone={projectStateTone(item.state)}>{projectStateLabel(item.state)}</StatusPill>}
                </div>
                <h2 className="mt-3 font-display font-bold text-ink-900">{item.title}</h2>
                {item.description && <p className="mt-1 text-sm text-ink-500">{item.description}</p>}
                {item.skills && item.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-pill bg-canvas-off px-2 py-0.5 text-xs text-ink-600">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
