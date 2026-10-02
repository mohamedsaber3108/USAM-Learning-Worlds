import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FolderKanban, Plus } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, StatusPill, Button, Dialog, Input, Textarea, Select, useToast } from '@/components/ui'
import { projectStateLabel, projectStateTone } from '@/lib/labels/projectLabels'

/** Prisma `Project.state: ProjectState` is the only status field — there is no
 * separate `status` column (fixed a dead `p.status` fallback branch here). */
interface Project {
  id: string
  title: string
  state?: string
  description?: string
}

const PROJECT_TYPES = [
  { value: 'INVENTION', label: 'Invention' },
  { value: 'STORY', label: 'Story' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'APP_OR_GAME', label: 'App or game' },
  { value: 'OTHER', label: 'Something else' },
]

/**
 * NEW (2026-10-02): POST /projects (projects.service.ts createProject) had a
 * real wrapper (`projectsApi.create`) with zero UI caller — a learner could
 * only ever view projects.mine(), never start one. Per the required journey
 * (Discover -> Brief -> Plan -> Build -> Milestones -> Feedback -> Improve
 * -> Submit -> Reflect -> Portfolio), "Discover/Brief" was structurally
 * missing: without a create action, Portfolio could never show anything
 * real. Added a real create dialog here, the entry point into that loop.
 */
function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('INVENTION')
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!title.trim() || !description.trim()) return
    setSaving(true)
    try {
      const res = await projectsApi.create({
        title: title.trim(),
        description: description.trim(),
        type,
        visibility: 'PRIVATE',
      })
      const created = res.data as { id: string }
      onClose()
      navigate(`/app/projects/${created.id}`)
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('learner.newProject')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => void create()} disabled={saving || !title.trim() || !description.trim()} loading={saving}>
            {t('learner.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label={t('learner.projectTitleLabel')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('learner.projectTitlePlaceholder')}
        />
        <Textarea
          label={t('learner.projectDescriptionLabel')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder={t('learner.projectDescriptionPlaceholder')}
        />
        <Select label={t('learner.projectTypeLabel')} value={type} onChange={(e) => setType(e.target.value)} options={PROJECT_TYPES} />
      </div>
    </Dialog>
  )
}

/** Learner projects — real GET /projects/my + POST /projects (create). DS. */
export function ProjectsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects-mine'],
    queryFn: async () => (await projectsApi.mine()).data as Project[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('learner.projects')}
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> {t('learner.newProject')}
          </Button>
        }
      />
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
                  {p.state && <StatusPill tone={projectStateTone(p.state)}>{projectStateLabel(p.state)}</StatusPill>}
                </div>
                <h2 className="mt-3 font-display text-lg font-bold text-ink-900">{p.title}</h2>
                {p.description && <p className="mt-1 text-sm text-ink-500">{p.description}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
      <NewProjectDialog
        open={open}
        onClose={() => {
          setOpen(false)
          void qc.invalidateQueries({ queryKey: ['projects-mine'] })
        }}
      />
    </div>
  )
}
