import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader, Table, StatusPill, Button, Dialog, Input, Select, Textarea, useToast } from '@/components/ui'

interface ContentItem {
  id: string
  title: string
  status: string
  type?: string
}

const CONTENT_TYPE_OPTIONS = [
  { value: 'ACTIVITY', label: 'Activity' },
  { value: 'QUESTION', label: 'Question' },
  { value: 'STORY', label: 'Story' },
  { value: 'SCENARIO', label: 'Scenario' },
  { value: 'HINT', label: 'Hint' },
  { value: 'EXPLANATION', label: 'Explanation' },
  { value: 'PROJECT_BRIEF', label: 'Project brief' },
  { value: 'PRACTICE_SET', label: 'Practice set' },
]
const AGE_BAND_OPTIONS = [
  { value: '', label: 'Any age' },
  { value: 'AGE_8_9', label: '8-9' },
  { value: 'AGE_10_11', label: '10-11' },
  { value: 'AGE_12_14', label: '12-14' },
]
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'Unset' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
  { value: 'CHALLENGE', label: 'Challenge' },
]

/**
 * FIX (reconciliation audit, round 3, 2026-10-06): POST
 * /admin/content-items (content-items.controller.ts `create`) is real and
 * ADMIN-gated, with a frontend wrapper (`adminApi.createContentItem`) that
 * had zero callers anywhere — this page was list-and-advance-only, with no
 * way to actually author a new ContentItem. The real `create` DTO's
 * `content: unknown` field is intentionally free-form JSON on the backend
 * (ContentItem has no fixed per-type shape in the schema) — exposed here
 * honestly as a raw JSON textarea rather than fabricating a rich structured
 * editor the backend doesn't actually require or validate against.
 */
function NewContentItemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('ACTIVITY')
  const [contentJson, setContentJson] = useState('{}')
  const [ageBand, setAgeBand] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!title.trim()) return
    let content: unknown
    try {
      content = JSON.parse(contentJson)
    } catch {
      setJsonError('Content must be valid JSON.')
      return
    }
    setJsonError(null)
    setSaving(true)
    try {
      await adminApi.createContentItem({
        title: title.trim(),
        type,
        content,
        ...(ageBand ? { ageBand } : {}),
        ...(difficulty ? { difficulty } : {}),
      })
      toast.show('Content item created', 'success')
      setTitle('')
      setContentJson('{}')
      setAgeBand('')
      setDifficulty('')
      onClose()
    } catch {
      toast.show('Could not create the content item.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New content item"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void create()} disabled={saving || !title.trim()} loading={saving}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions warm-up" />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={CONTENT_TYPE_OPTIONS} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Age band" value={ageBand} onChange={(e) => setAgeBand(e.target.value)} options={AGE_BAND_OPTIONS} />
          <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} options={DIFFICULTY_OPTIONS} />
        </div>
        <Textarea
          label="Content (JSON)"
          value={contentJson}
          onChange={(e) => setContentJson(e.target.value)}
          rows={6}
          placeholder='{"body": "..."}'
        />
        {jsonError && <p className="text-sm text-error-700">{jsonError}</p>}
      </div>
    </Dialog>
  )
}

/**
 * FIX (2026-10-02): two real contract-mismatch bugs confirmed by reading
 * content-items.service.ts directly.
 *
 * 1) GET /admin/content-items returns `{ items, total, take, skip }`, not a
 *    bare array — this page previously cast the whole wrapped response to
 *    `ContentItem[]` and called `.map`/`.length` on it directly, which
 *    throws at runtime the moment any content item exists. Unwrapped below.
 * 2) The real `ContentStatus` enum lifecycle (FORWARD_TRANSITIONS in
 *    content-items.service.ts) is DRAFT -> VALIDATING -> VALIDATED ->
 *    PUBLISHED -> DEPRECATED. There is no REVIEW/APPROVED/ARCHIVED status,
 *    and DRAFT can never jump straight to PUBLISHED — the backend 400s on
 *    any transition not in FORWARD_TRANSITIONS. The previous NEXT_STATUS
 *    map used fictional statuses and an impossible shortcut, so the
 *    publish/archive buttons always failed against the real backend.
 *    Corrected to the real one-step-at-a-time lifecycle.
 */
const NEXT_STATUS: Record<string, string | undefined> = {
  DRAFT: 'VALIDATING',
  VALIDATING: 'VALIDATED',
  VALIDATED: 'PUBLISHED',
  PUBLISHED: 'DEPRECATED',
}
const NEXT_LABEL_KEY: Record<string, string | undefined> = {
  DRAFT: 'admin.contentAdvanceToValidating',
  VALIDATING: 'admin.contentAdvanceToValidated',
  VALIDATED: 'admin.publish',
  PUBLISHED: 'admin.archive',
}
const tone = (s: string): 'success' | 'neutral' | 'warning' =>
  s === 'PUBLISHED' ? 'success' : s === 'DEPRECATED' || s === 'REJECTED' ? 'neutral' : 'warning'

/** Content CMS — list + the real one-step-at-a-time lifecycle via the real
 * status endpoint (no faked publishing in FE state). Shared Table. DS. */
export function AdminContentPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [createOpen, setCreateOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => (await adminApi.contentItems()).data as { items: ContentItem[]; total: number },
  })

  async function advance(item: ContentItem) {
    const next = NEXT_STATUS[item.status]
    if (!next) return
    await adminApi.setContentStatus(item.id, next)
    toast.show(t(NEXT_LABEL_KEY[item.status] ?? 'admin.publish'), 'success')
    await qc.invalidateQueries({ queryKey: ['admin-content'] })
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const items = data?.items ?? []
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.content')}
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden /> {t('admin.createContent')}
          </Button>
        }
      />
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <Table
          headers={['Title', 'Type', t('admin.status'), '']}
          rows={items.map((item) => {
            const next = NEXT_STATUS[item.status]
            return [
              <span className="font-medium text-ink-900">{item.title}</span>,
              item.type ?? '—',
              <StatusPill tone={tone(item.status)}>{item.status}</StatusPill>,
              next ? (
                <Button size="sm" onClick={() => advance(item)}>
                  {t(NEXT_LABEL_KEY[item.status] ?? 'admin.publish')}
                </Button>
              ) : (
                ''
              ),
            ]
          })}
        />
      )}
      <NewContentItemDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false)
          void qc.invalidateQueries({ queryKey: ['admin-content'] })
        }}
      />
    </div>
  )
}
