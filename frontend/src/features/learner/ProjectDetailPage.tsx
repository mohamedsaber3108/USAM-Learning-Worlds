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
  description?: string
  status: string
}

/**
 * Project detail — brief + curriculum link + milestones.
 *
 * FIX (2026-10-02): this page previously assumed `GET /projects/:id` returned
 * a combined `{ milestones, curriculumContext }` shape. The real backend
 * (`backend/src/modules/projects/projects.service.ts getProject`) returns the
 * project row with `competency.skill.domain` + `objective` relations included
 * — no `milestones`, no flat `curriculumContext`. Milestones live behind a
 * SEPARATE endpoint (`GET /projects/:id/milestones`), and so does the full
 * curriculum chain (`GET /projects/:id/curriculum-context`). Split into three
 * real queries matching the actual contracts instead of one assumed shape.
 */
interface ProjectDetail {
  id: string
  title: string
  description?: string
  state?: string
  competency?: { id: string; name: string; skill?: { id: string; name: string; domain?: { id: string; name: string } } } | null
  objective?: { id: string; name: string } | null
}

interface CurriculumContext {
  linked: boolean
  message?: string
  domain?: { id: string; name: string } | null
  skill?: { id: string; name: string }
  competency?: { id: string; name: string }
  objective?: { id: string; name: string } | null
}

export function ProjectDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => (await projectsApi.getById(id)).data as ProjectDetail,
    enabled: Boolean(id),
  })

  const { data: curriculumContext } = useQuery({
    queryKey: ['project-curriculum-context', id],
    queryFn: async () => (await projectsApi.getCurriculumContext(id)).data as CurriculumContext,
    enabled: Boolean(id),
  })

  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: async () => (await projectsApi.getMilestones(id)).data as Milestone[],
    enabled: Boolean(id),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  const items = milestones ?? []
  const competencyName = curriculumContext?.linked
    ? curriculumContext.competency?.name
    : data.competency?.name ?? data.objective?.name
  const domainName = curriculumContext?.linked
    ? curriculumContext.domain?.name
    : data.competency?.skill?.domain?.name

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        subtitle={data.description}
        action={data.state ? <StatusPill tone="brand">{data.state}</StatusPill> : undefined}
      />

      {competencyName && (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{t('learner.masteryBy')}</p>
          <p className="mt-1 text-ink-800">
            {competencyName}
            {domainName ? ` · ${domainName}` : ''}
          </p>
        </Card>
      )}

      <section>
        <SectionHeader title="Milestones" />
        {items.length > 0 ? (
          <ol className="space-y-2">
            {items.map((m) => {
              const done = m.status?.toUpperCase() === 'DONE' || m.status?.toUpperCase() === 'COMPLETED'
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
