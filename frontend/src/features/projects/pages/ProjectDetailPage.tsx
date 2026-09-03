import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, Star, Users, Send } from 'lucide-react'
import { projectsApi } from '@/lib/api/endpoints'

const MILESTONE_STAGES = ['IDEA', 'PLAN', 'BUILD', 'TEST', 'PRESENT']

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idea',
  PLAN: 'Plan',
  BUILD: 'Build',
  TEST: 'Test',
  PRESENT: 'Present',
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'DONE' || status === 'COMPLETED') {
    return <CheckCircle2 className="w-5 h-5 text-success-600" strokeWidth={2} />
  }
  if (status === 'IN_PROGRESS') {
    return <Clock className="w-5 h-5 text-primary-600" strokeWidth={2} />
  }
  return <Circle className="w-5 h-5 text-slate-300" strokeWidth={2} />
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [noteText, setNoteText] = useState('')
  const [noteSource, setNoteSource] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: milestones } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => projectsApi.getMilestones(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: rubric } = useQuery({
    queryKey: ['project-rubric', id],
    queryFn: () => projectsApi.getRubric(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: notes } = useQuery({
    queryKey: ['project-notes', id],
    queryFn: () => projectsApi.listResearchNotes(id!).then(res => res.data),
    enabled: !!id,
  })

  const { data: collaborators } = useQuery({
    queryKey: ['project-collaborators', id],
    queryFn: () => projectsApi.listCollaborators(id!).then(res => res.data),
    enabled: !!id,
  })

  const updateMilestone = useMutation({
    mutationFn: ({ milestoneId, status }: { milestoneId: string; status: string }) =>
      projectsApi.updateMilestone(id!, milestoneId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-milestones', id] }),
  })

  const addNote = useMutation({
    mutationFn: () => {
      const payload: { content: string; sourceUrl?: string } = { content: noteText }
      if (noteSource) payload.sourceUrl = noteSource
      return projectsApi.addResearchNote(id!, payload)
    },
    onSuccess: () => {
      setNoteText('')
      setNoteSource('')
      queryClient.invalidateQueries({ queryKey: ['project-notes', id] })
    },
  })

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const milestoneList = Array.isArray(milestones) ? milestones : []
  const rubricCriteria = rubric?.criteria || rubric?.rubricCriteria || []

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/projects" className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm font-medium mb-2">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to Projects
          </Link>
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            {project.title}
            {project.isShowcased && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/15 rounded-control text-xs font-medium">
                <Star className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                Showcased
              </span>
            )}
          </h1>
          <p className="text-white/80 text-sm mt-1">{project.description}</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Milestone stepper */}
        <section className="card">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4">Project Journey</h2>
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {MILESTONE_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-control bg-slate-100">
                  {STAGE_LABELS[stage]}
                </span>
                {i < MILESTONE_STAGES.length - 1 && <div className="w-4 h-px bg-slate-300" />}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {milestoneList.length === 0 && (
              <p className="text-sm text-slate-500">No milestones yet for this project.</p>
            )}
            {milestoneList.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-control border border-slate-200">
                <div className="flex items-center gap-3">
                  <button onClick={() => updateMilestone.mutate({ milestoneId: m.id, status: m.status === 'DONE' ? 'IN_PROGRESS' : 'DONE' })}>
                    <StatusIcon status={m.status} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.title || STAGE_LABELS[m.stage]}</p>
                    {m.description && <p className="text-xs text-slate-500">{m.description}</p>}
                  </div>
                </div>
                <select
                  className="text-xs border border-slate-200 rounded-control px-2 py-1"
                  value={m.status}
                  onChange={(e) => updateMilestone.mutate({ milestoneId: m.id, status: e.target.value })}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* Rubric */}
        {rubricCriteria.length > 0 && (
          <section className="card">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" strokeWidth={2} />
              Rubric
            </h2>
            <div className="space-y-2">
              {rubricCriteria.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-control bg-slate-50">
                  <span className="text-sm text-slate-800">{c.name || c.criterion}</span>
                  <span className="text-xs text-slate-500">{c.maxScore ? `up to ${c.maxScore} pts` : ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Research notes */}
        <section className="card">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4">Research Notes</h2>
          <div className="space-y-2 mb-4">
            {(notes || []).map((n: any) => (
              <div key={n.id} className="p-3 rounded-control bg-slate-50 text-sm text-slate-700">
                {n.content}
                {n.sourceUrl && (
                  <a href={n.sourceUrl} target="_blank" rel="noreferrer" className="block text-xs text-primary-600 mt-1">
                    {n.sourceUrl}
                  </a>
                )}
              </div>
            ))}
            {(!notes || notes.length === 0) && (
              <p className="text-sm text-slate-500">No research notes yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-slate-200 rounded-control px-3 py-2 text-sm"
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <input
              className="w-40 border border-slate-200 rounded-control px-3 py-2 text-sm"
              placeholder="Source URL (optional)"
              value={noteSource}
              onChange={(e) => setNoteSource(e.target.value)}
            />
            <button
              className="btn btn-primary"
              disabled={!noteText.trim() || addNote.isPending}
              onClick={() => addNote.mutate()}
            >
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* Collaborators */}
        <section className="card">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" strokeWidth={2} />
            Collaborators
          </h2>
          <div className="flex flex-wrap gap-2">
            {(collaborators || []).map((c: any) => (
              <span key={c.id} className="px-3 py-1.5 rounded-control bg-slate-100 text-sm text-slate-700">
                {c.learner?.displayName || c.learnerId}
              </span>
            ))}
            {(!collaborators || collaborators.length === 0) && (
              <p className="text-sm text-slate-500">No collaborators yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
