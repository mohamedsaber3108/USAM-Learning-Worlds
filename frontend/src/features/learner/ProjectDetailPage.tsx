import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Circle, ClipboardList, BookOpen, Plus, Trash2, ExternalLink } from 'lucide-react'
import { projectsApi, charactersApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, StatusPill, Button, Dialog, Input, Textarea, useToast } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'
import { projectStateLabel, projectStateTone, milestoneStatusLabel, isMilestoneComplete } from '@/lib/labels/projectLabels'

interface Milestone {
  id: string
  title: string
  description?: string
  status: string
}

interface ResearchNote {
  id: string
  content: string
  sourceTitle?: string | null
  sourceUrl?: string | null
  learner?: { id: string; displayName: string }
}

interface RubricCriterionLevels {
  beginning?: string
  developing?: string
  proficient?: string
  exemplary?: string
}
interface RubricCriterion {
  id: string
  name: string
  description: string
  levels: RubricCriterionLevels
}
interface Rubric {
  id: string
  title: string
  criteria: RubricCriterion[]
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
  // Rubric — real GET /projects/:id/rubric (rubrics.controller.ts
  // ProjectRubricController). FIX (reconciliation audit, 2026-10-02): this
  // backend engine (8 real Rubric rows / 30 RubricCriterion rows, seeded and
  // confirmed live) had a wrapper in endpoints.ts (`projectsApi.getRubric`)
  // with zero caller anywhere — a learner could never see what a project
  // would be graded on. `enabled` on the query itself since not every
  // project has a rubric attached (polymorphic link, honestly empty if none).
  const { data: rubric } = useQuery({
    queryKey: ['project-rubric', id],
    queryFn: async () => (await projectsApi.getRubric(id)).data as Rubric | null,
    enabled: Boolean(id),
    retry: false,
  })
  // Companion presence (owner directive): projects previously had zero
  // companion presence — a project reviewer/mentor should be present here,
  // not just a bare brief + milestone list.
  const companion = useQuery({
    queryKey: ['project-companion'],
    queryFn: async () => (await charactersApi.orchestrate()).data,
    retry: false,
  })
  // Research notes — real GET/POST/DELETE /projects/:id/research-notes
  // (projects.service.ts listResearchNotes/addResearchNote/
  // deleteResearchNote). FIX (reverse-engineering/experience directive,
  // 2026-10-07, §29: the required project flow explicitly names
  // "Research" as a pillar between Plan and Collaborate): confirmed in
  // round 1's reconciliation audit as a real backend engine with zero
  // frontend caller anywhere. Added below as its own section, not folded
  // into milestones — a research note is evidence gathered toward a
  // milestone, not a milestone itself.
  const { data: researchNotes } = useQuery({
    queryKey: ['project-research-notes', id],
    queryFn: async () => (await projectsApi.listResearchNotes(id)).data as ResearchNote[],
    enabled: Boolean(id),
    retry: false,
  })

  // Research note dialog state — declared here (before the early-return
  // guards below) since React hooks cannot be called conditionally.
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteSourceTitle, setNoteSourceTitle] = useState('')
  const [noteSourceUrl, setNoteSourceUrl] = useState('')
  const [savingNote, setSavingNote] = useState(false)

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

  async function addNote() {
    if (!noteContent.trim()) return
    setSavingNote(true)
    try {
      await projectsApi.addResearchNote(id, {
        content: noteContent.trim(),
        sourceTitle: noteSourceTitle.trim() || undefined,
        sourceUrl: noteSourceUrl.trim() || undefined,
      })
      setNoteDialogOpen(false)
      setNoteContent('')
      setNoteSourceTitle('')
      setNoteSourceUrl('')
      await qc.invalidateQueries({ queryKey: ['project-research-notes', id] })
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSavingNote(false)
    }
  }

  async function removeNote(noteId: string) {
    try {
      await projectsApi.removeResearchNote(noteId)
      await qc.invalidateQueries({ queryKey: ['project-research-notes', id] })
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Research notes" />
          <Button size="sm" variant="secondary" onClick={() => setNoteDialogOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Add note
          </Button>
        </div>
        {!researchNotes || researchNotes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {researchNotes.map((n) => (
              <Card key={n.id} className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-800">{n.content}</p>
                  {n.sourceTitle && (
                    <p className="mt-1 text-xs text-ink-500">
                      {n.sourceUrl ? (
                        <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                          {n.sourceTitle} <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : (
                        n.sourceTitle
                      )}
                    </p>
                  )}
                </div>
                <button onClick={() => void removeNote(n.id)} className="shrink-0 text-ink-400 hover:text-error-700" aria-label="Delete note">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {rubric && rubric.criteria.length > 0 && (
        <section>
          <SectionHeader title={rubric.title} />
          <div className="space-y-3">
            {rubric.criteria.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start gap-2">
                  <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900">{c.name}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{c.description}</p>
                  </div>
                </div>
                {(c.levels.beginning || c.levels.developing || c.levels.proficient || c.levels.exemplary) && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {([
                      ['beginning', c.levels.beginning],
                      ['developing', c.levels.developing],
                      ['proficient', c.levels.proficient],
                      ['exemplary', c.levels.exemplary],
                    ] as const).map(([band, text]) =>
                      text ? (
                        <div key={band} className="rounded-control border border-line bg-canvas-off p-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{band}</p>
                          <p className="mt-1 text-xs text-ink-700">{text}</p>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

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

      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        title="New research note"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNoteDialogOpen(false)} disabled={savingNote}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void addNote()} disabled={savingNote || !noteContent.trim()} loading={savingNote}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Textarea
            label="What did you find out?"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
          />
          <Input
            label="Source title (optional)"
            value={noteSourceTitle}
            onChange={(e) => setNoteSourceTitle(e.target.value)}
            placeholder="e.g. NASA Solar System Guide"
          />
          <Input
            label="Source link (optional)"
            value={noteSourceUrl}
            onChange={(e) => setNoteSourceUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </Dialog>
    </div>
  )
}
