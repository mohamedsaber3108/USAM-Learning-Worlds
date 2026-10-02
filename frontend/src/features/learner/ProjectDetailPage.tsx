import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle } from 'lucide-react'
import { projectsApi, charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, StatusPill, Button, useToast } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { projectStateLabel, projectStateTone, milestoneStatusLabel, isMilestoneComplete } from '@/lib/labels/projectLabels'

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
  const qc = useQueryClient()
  const toast = useToast()

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
  // Companion presence (owner directive): projects previously had zero
  // companion presence — a project reviewer/mentor should be present here,
  // not just a bare brief + milestone list.
  const companion = useQuery({
    queryKey: ['project-companion'],
    queryFn: async () => (await charactersApi.orchestrate()).data,
    retry: false,
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
  // FIX (2026-10-02): the real Milestone.status enum (projects.service.ts
  // updateMilestoneStatus validStatuses) is PENDING|IN_PROGRESS|COMPLETE —
  // this previously checked for 'DONE'/'COMPLETED', neither of which the
  // backend ever sends, so a milestone could never register as done.
  const allDone = items.length > 0 && items.every((m) => isMilestoneComplete(m.status))

  async function markDone(milestoneId: string) {
    try {
      await projectsApi.updateMilestoneStatus(id, milestoneId, 'COMPLETE')
      toast.show(t('learner.milestoneMarkedDone'), 'success')
      await qc.invalidateQueries({ queryKey: ['project-milestones', id] })
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }

  async function showcase() {
    try {
      await projectsApi.showcase(id)
      toast.show(t('learner.projectShowcased'), 'success')
      await qc.invalidateQueries({ queryKey: ['project', id] })
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }

  // Real backend rule (projects.service.ts showcaseProject): state must be
  // COMPLETED before showcasing. Milestones all COMPLETE does not itself
  // flip the project's own state — that's a separate PUT /:id write the
  // learner must trigger (markComplete below); showcase stays disabled
  // honestly until the real precondition is met, never faked client-side.
  const canShowcase = data.state === 'COMPLETED'

  async function markComplete() {
    try {
      await projectsApi.update(id, { state: 'COMPLETED' })
      toast.show(t('learner.milestoneMarkedDone'), 'success')
      await qc.invalidateQueries({ queryKey: ['project', id] })
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        {companion.data?.character && (
          <CharacterStage characterId={companion.data.character.name} size={56} state={allDone ? 'celebrating' : 'idle'} />
        )}
        <PageHeader
          title={data.title}
          subtitle={data.description}
          action={data.state ? <StatusPill tone={projectStateTone(data.state)}>{projectStateLabel(data.state)}</StatusPill> : undefined}
        />
      </div>

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
              const done = isMilestoneComplete(m.status)
              return (
                <li key={m.id}>
                  <Card className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success-500" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                    )}
                    <span className="flex-1 font-medium text-ink-900">{m.title}</span>
                    {m.status && <StatusPill tone={done ? 'success' : 'neutral'}>{milestoneStatusLabel(m.status)}</StatusPill>}
                    {!done && (
                      <Button size="sm" variant="secondary" onClick={() => void markDone(m.id)}>
                        {t('learner.markMilestoneDone')}
                      </Button>
                    )}
                  </Card>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState />
        )}
      </section>

      {data.state !== 'SHOWCASED' && data.state !== 'COMPLETED' && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-ink-600">{t('learner.showcaseRequiresCompleted')}</span>
          <Button size="sm" disabled={!allDone} onClick={() => void markComplete()}>
            {t('learner.markMilestoneDone')}
          </Button>
        </Card>
      )}

      {data.state === 'COMPLETED' && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-ink-600">{t('learner.showcaseProject')}</span>
          <Button size="sm" disabled={!canShowcase} onClick={() => void showcase()}>
            {t('learner.showcaseProject')}
          </Button>
        </Card>
      )}
    </div>
  )
}
