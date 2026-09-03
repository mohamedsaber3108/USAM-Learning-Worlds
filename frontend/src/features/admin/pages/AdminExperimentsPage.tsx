import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Plus } from 'lucide-react'
import { experimentsApi } from '@/lib/api/endpoints'

/**
 * Admin-only Experiment list/create/status-control UI — real frontend
 * surface for the Experimentation Engine (backend
 * `experimentation.controller.ts` / `experimentation.service.ts`,
 * deterministic hash-based variant bucketing + persisted
 * `ExperimentAssignment` rows) which merged with zero frontend consumer —
 * same "backend built, frontend dead" bug class as the Audit Log and
 * Feature Flag engines.
 *
 * `GET /experiments` is staff (ADMIN/MODERATOR); create + status changes
 * are ADMIN-only, both gated server-side too. There is deliberately no
 * outcome/results view here — the backend doesn't expose one (see
 * ExperimentationService's header comment: outcome analysis is meant to
 * be answered against the existing LearningEvent table, not a new
 * metrics system), so this page only covers what the API actually
 * supports: list, create, and status transitions.
 */
export function AdminExperimentsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [key, setKey] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [variantsText, setVariantsText] = useState('control, treatment')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-experiments'],
    queryFn: () => experimentsApi.list().then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: { key: string; name: string; description?: string; variants: string[] } = {
        key,
        name,
        variants: variantsText
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      }
      if (description) payload.description = description
      return experimentsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiments'] })
      setShowCreate(false)
      setKey('')
      setName('')
      setDescription('')
      setVariantsText('control, treatment')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ key: k, status }: { key: string; status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' }) =>
      experimentsApi.setStatus(k, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-experiments'] }),
  })

  const statusOrder: Array<'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'> = [
    'DRAFT',
    'RUNNING',
    'PAUSED',
    'COMPLETED',
  ]

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600',
    RUNNING: 'bg-success-50 text-success-600',
    PAUSED: 'bg-amber-50 text-amber-600',
    COMPLETED: 'bg-primary-50 text-primary-600',
  }

  const variantName = (v: string | { name: string }) => (typeof v === 'string' ? v : v.name)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-primary-500" /> Experiments
        </h1>
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="inline-flex items-center gap-1 text-sm bg-primary-500 text-white rounded-lg px-3 py-1.5 hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Deterministic hash-based variant bucketing, assignment persisted per learner. Staff can
        list; ADMIN can create experiments and change status. No outcome metrics here — join
        ExperimentAssignment against LearningEvent for that analysis.
      </p>

      {showCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate()
          }}
          className="bg-white rounded-xl border border-surface-200 p-4 mb-6 space-y-3"
        >
          <div>
            <label className="text-xs text-slate-500">Key (unique, e.g. mission_intro_v2)</label>
            <input
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Name</label>
            <input
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Description (optional)</label>
            <input
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Variants (comma-separated)</label>
            <input
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={variantsText}
              onChange={(e) => setVariantsText(e.target.value)}
              required
            />
          </div>
          {createMutation.isError && (
            <p className="text-red-500 text-xs">Failed to create experiment (key must be unique).</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-primary-600 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create experiment'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-sm text-slate-500 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load experiments (staff/admin access required).</p>
      )}

      {data && (
        <div className="space-y-3">
          {data.length === 0 && <p className="text-slate-400 text-sm">No experiments defined yet.</p>}
          {data.map((exp) => (
            <div key={exp.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{exp.name}</span>{' '}
                  <span className="text-xs text-slate-400">({exp.key})</span>
                </div>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${statusColor[exp.status] ?? ''}`}>
                  {exp.status}
                </span>
              </div>
              {exp.description && <p className="text-xs text-slate-500 mb-2">{exp.description}</p>}
              <div className="flex flex-wrap gap-1 mb-2">
                {(exp.variants ?? []).map((v, i) => (
                  <span key={i} className="text-xs bg-surface-100 text-slate-600 rounded-full px-2 py-0.5">
                    {variantName(v)}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                {statusOrder
                  .filter((s) => s !== exp.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => statusMutation.mutate({ key: exp.key, status: s })}
                      disabled={statusMutation.isPending}
                      className="text-xs border border-surface-200 rounded-lg px-2 py-1 text-slate-600 hover:bg-surface-50 disabled:opacity-50"
                    >
                      → {s}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
