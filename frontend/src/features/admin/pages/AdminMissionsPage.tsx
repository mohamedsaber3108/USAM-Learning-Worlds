import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react'
import { adminMissionsApi, type AdminMissionInput } from '@/lib/api/endpoints'

/**
 * Admin-only Mission CRUD — CMS/Content Studio + Authoring Engine v1.
 *
 * Scope note (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md):
 * this proves the CMS concept for exactly ONE content type (Mission, the
 * most player-facing). Character/English/Cross-Curricular content
 * authoring UIs remain Missing — still seed-script-only. This is a real,
 * narrow v1, not the full 5-engine authoring suite.
 *
 * Calls the existing missions.service.ts CRUD (via /admin/missions,
 * ADMIN-role-gated). Missions created here are immediately visible on the
 * real learner-facing GET /missions endpoint — no separate data store.
 */

interface MissionRecord {
  id: string
  title: string
  description: string
  type: string
  estimatedMinutes: number | null
  order: number
  isActive: boolean
  worldId: string | null
}

const emptyForm: AdminMissionInput = {
  title: '',
  description: '',
  type: 'GUIDED',
  estimatedMinutes: undefined,
  order: 0,
  isActive: true,
  worldId: '',
}

export function AdminMissionsPage() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AdminMissionInput>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-missions'],
    queryFn: () => adminMissionsApi.list().then((res) => res.data as MissionRecord[]),
  })

  const createMutation = useMutation({
    mutationFn: (payload: AdminMissionInput) => adminMissionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] })
      closeForm()
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Failed to create mission'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminMissionInput> }) =>
      adminMissionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] })
      closeForm()
    },
    onError: (err: any) => setError(err?.response?.data?.message || 'Failed to update mission'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminMissionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-missions'] }),
  })

  function openCreateForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError(null)
    setShowForm(true)
  }

  function openEditForm(mission: MissionRecord) {
    setForm({
      title: mission.title,
      description: mission.description,
      type: mission.type as AdminMissionInput['type'],
      estimatedMinutes: mission.estimatedMinutes ?? undefined,
      order: mission.order,
      isActive: mission.isActive,
      worldId: mission.worldId ?? '',
    })
    setEditingId(mission.id)
    setError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    const payload: AdminMissionInput = {
      ...form,
      worldId: form.worldId?.trim() ? form.worldId.trim() : undefined,
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                Back
              </Link>
              <h1 className="text-2xl font-display font-bold text-white">Admin — Missions</h1>
            </div>
            <button
              onClick={openCreateForm}
              className="bg-white text-primary-700 font-semibold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-white/90 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              New Mission
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-slate-500 mb-6">
          Minimal admin-only CMS v1 for Mission content. Character / English /
          Cross-Curricular authoring UIs are not built yet — those remain
          seed-script-only.
        </p>

        {showForm && (
          <div className="card mb-6 relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Mission' : 'New Mission'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-md">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as AdminMissionInput['type'] })}
                  >
                    <option value="GUIDED">GUIDED</option>
                    <option value="EXPLORATION">EXPLORATION</option>
                    <option value="CHALLENGE">CHALLENGE</option>
                    <option value="PROJECT_BASED">PROJECT_BASED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    value={form.estimatedMinutes ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimatedMinutes: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    value={form.order ?? 0}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={form.isActive ?? true}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Active (visible to learners)
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Mission'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          {isLoading ? (
            <p className="text-slate-500">Loading missions...</p>
          ) : !data || data.length === 0 ? (
            <p className="text-slate-500">No missions yet. Create one above.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-2">Title</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">Order</th>
                  <th className="py-2 pr-2">Active</th>
                  <th className="py-2 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((mission) => (
                  <tr key={mission.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-medium text-slate-800">{mission.title}</td>
                    <td className="py-2 pr-2">{mission.type}</td>
                    <td className="py-2 pr-2">{mission.order}</td>
                    <td className="py-2 pr-2">{mission.isActive ? 'Yes' : 'No'}</td>
                    <td className="py-2 pr-2 text-right">
                      <button
                        onClick={() => openEditForm(mission)}
                        className="text-primary-600 hover:text-primary-800 mr-3"
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4 inline" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete mission "${mission.title}"?`)) {
                            deleteMutation.mutate(mission.id)
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4 inline" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
