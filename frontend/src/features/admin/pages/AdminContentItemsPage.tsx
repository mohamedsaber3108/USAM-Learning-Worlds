import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import {
  contentItemsApi,
  type ContentTypeKey,
  type ContentStatusKey,
  type AgeBandKey,
  type DifficultyLevelKey,
} from '@/lib/api/endpoints'

/**
 * Admin-only ContentItem authoring UI — real frontend surface for the
 * ContentItem Authoring Engine (backend `content-items.controller.ts` /
 * `content-items.service.ts`), a minimal create/list/status-lifecycle
 * slice over what was previously a fully orphaned table: the
 * ContentItem model + ContentType/ContentStatus enums existed in
 * schema.prisma with zero service/controller anywhere referencing them
 * (see docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md, "Content
 * Ingestion Engine"). Same "backend built, frontend dead" bug class as
 * the Experimentation and Safety Policy engines.
 *
 * All endpoints are ADMIN-only server-side. This page covers exactly
 * what the API supports: list/filter, create (as DRAFT), and advance
 * status through the documented forward lifecycle
 * (DRAFT -> VALIDATING -> VALIDATED -> PUBLISHED, plus DEPRECATED/
 * REJECTED side states) — no full ingestion pipeline (no PDF/OCR/AI
 * generation), that's explicitly out of scope for this slice.
 */
const CONTENT_TYPES: ContentTypeKey[] = [
  'ACTIVITY',
  'QUESTION',
  'STORY',
  'SCENARIO',
  'HINT',
  'EXPLANATION',
  'PROJECT_BRIEF',
  'PRACTICE_SET',
]

const STATUSES: ContentStatusKey[] = ['DRAFT', 'VALIDATING', 'VALIDATED', 'PUBLISHED', 'DEPRECATED', 'REJECTED']

const AGE_BANDS: AgeBandKey[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']

const DIFFICULTIES: DifficultyLevelKey[] = ['EASY', 'MEDIUM', 'HARD', 'CHALLENGE']

// Mirrors FORWARD_TRANSITIONS in content-items.service.ts — the server is
// the source of truth (it 400s on invalid transitions); this is just so
// the UI doesn't show buttons that are guaranteed to fail.
const FORWARD_TRANSITIONS: Record<ContentStatusKey, ContentStatusKey[]> = {
  DRAFT: ['VALIDATING', 'DEPRECATED', 'REJECTED'],
  VALIDATING: ['VALIDATED', 'DRAFT', 'REJECTED'],
  VALIDATED: ['PUBLISHED', 'REJECTED'],
  PUBLISHED: ['DEPRECATED'],
  DEPRECATED: [],
  REJECTED: ['DRAFT'],
}

const statusColor: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  VALIDATING: 'bg-amber-50 text-amber-600',
  VALIDATED: 'bg-primary-50 text-primary-600',
  PUBLISHED: 'bg-success-50 text-success-600',
  DEPRECATED: 'bg-slate-100 text-slate-400',
  REJECTED: 'bg-red-50 text-red-500',
}

export function AdminContentItemsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ContentStatusKey | ''>('')
  const [typeFilter, setTypeFilter] = useState<ContentTypeKey | ''>('')

  const [showCreate, setShowCreate] = useState(false)
  const [type, setType] = useState<ContentTypeKey>('ACTIVITY')
  const [title, setTitle] = useState('')
  const [contentText, setContentText] = useState('{\n  \n}')
  const [ageBand, setAgeBand] = useState<AgeBandKey | ''>('')
  const [difficulty, setDifficulty] = useState<DifficultyLevelKey | ''>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-content-items', statusFilter, typeFilter],
    queryFn: () =>
      contentItemsApi
        .list({
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          take: 50,
        })
        .then((r) => r.data),
  })

  const createMutation = useMutation({
    mutationFn: () => {
      let parsedContent: unknown
      try {
        parsedContent = JSON.parse(contentText)
      } catch {
        throw new Error('Content must be valid JSON')
      }
      return contentItemsApi.create({
        type,
        title,
        content: parsedContent,
        ageBand: ageBand || undefined,
        difficulty: difficulty || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-items'] })
      setShowCreate(false)
      setTitle('')
      setContentText('{\n  \n}')
      setAgeBand('')
      setDifficulty('')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContentStatusKey }) =>
      contentItemsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-content-items'] }),
  })

  const items = data?.items ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-500" /> Content Items
        </h1>
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="inline-flex items-center gap-1 text-sm bg-primary-500 text-white rounded-lg px-3 py-1.5 hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Minimal authoring slice over the ContentItem table: create as DRAFT, list/filter, and
        advance through the status lifecycle. ADMIN-only, both here and server-side. No
        ingestion pipeline (no PDF/OCR/AI generation) — that is out of scope for this slice.
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
            <label className="text-xs text-slate-500">Type</label>
            <select
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as ContentTypeKey)}
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Title</label>
            <input
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Content (JSON)</label>
            <textarea
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm font-mono"
              rows={6}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500">Age band (optional)</label>
              <select
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBandKey | '')}
              >
                <option value="">—</option>
                {AGE_BANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">Difficulty (optional)</label>
              <select
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevelKey | '')}
              >
                <option value="">—</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {createMutation.isError && (
            <p className="text-red-500 text-xs">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : 'Failed to create content item.'}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-primary-600 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create content item'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-slate-500 px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setStatusFilter('')}
          className={`text-xs rounded-full px-3 py-1.5 border ${
            statusFilter === '' ? 'bg-primary-500 text-white border-primary-500' : 'border-surface-200 text-slate-600'
          }`}
        >
          All statuses
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs rounded-full px-3 py-1.5 border ${
              statusFilter === s ? 'bg-primary-500 text-white border-primary-500' : 'border-surface-200 text-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTypeFilter('')}
          className={`text-xs rounded-full px-3 py-1.5 border ${
            typeFilter === '' ? 'bg-primary-500 text-white border-primary-500' : 'border-surface-200 text-slate-600'
          }`}
        >
          All types
        </button>
        {CONTENT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-xs rounded-full px-3 py-1.5 border ${
              typeFilter === t ? 'bg-primary-500 text-white border-primary-500' : 'border-surface-200 text-slate-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load content items (ADMIN access required).</p>
      )}

      {data && (
        <div className="space-y-3">
          {items.length === 0 && <p className="text-slate-400 text-sm">No content items found.</p>}
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{item.title}</span>{' '}
                  <span className="text-xs text-slate-400">({item.type})</span>
                </div>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${statusColor[item.status] ?? ''}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2 text-xs text-slate-400">
                <span>v{item.version}</span>
                {item.ageBand && <span>· {item.ageBand}</span>}
                {item.difficulty && <span>· {item.difficulty}</span>}
                <span>· {item.sourceType}</span>
                <span>· {new Date(item.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(FORWARD_TRANSITIONS[item.status] ?? []).map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate({ id: item.id, status: s })}
                    disabled={statusMutation.isPending}
                    className="text-xs border border-surface-200 rounded-lg px-2 py-1 text-slate-600 hover:bg-surface-50 disabled:opacity-50"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {data.total > items.length && (
            <p className="text-xs text-slate-400">
              Showing {items.length} of {data.total} items.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
