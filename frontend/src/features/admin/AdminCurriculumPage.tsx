import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FileQuestion } from 'lucide-react'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader, SectionHeader, Card, Button, Input, Textarea, Dialog, useToast } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

/**
 * Curriculum & QA — missions (now with real create/delete, not list-only),
 * misconceptions, content-QA flags, PLUS four admin engines that previously
 * had zero frontend representation despite being fully built on the backend:
 *   - Curriculum mapping (free-text -> ranked LearningObjective suggestions)
 *   - Content provenance (license/source registry)
 *   - Difficulty calibration (authored-vs-empirical mismatch scan+flags)
 *   - Assessment quality (scan+flags)
 * (Ledger 88 task 12, 2026-10-02.)
 *
 * FIX (reconciliation audit, 2026-10-02): `AdminQuestionTemplatesPage`
 * (`/admin/question-templates`) was a real route with a real backend-wired
 * page, but had zero nav entry or in-app link anywhere — only reachable by
 * typing the exact URL (same orphan-route pattern found and fixed once
 * already for the learner "More" hub). Question templates are
 * assessment-authoring content, so the link lives here next to the other
 * curriculum/QA tools rather than adding a 7th top-level admin nav icon.
 */
export function AdminCurriculumPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader
        title={t('admin.curriculum')}
        action={
          <Link
            to="/admin/question-templates"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
          >
            <FileQuestion className="h-4 w-4" aria-hidden />
            Question templates
          </Link>
        }
      />
      <MissionsSection />
      <AdminListSection
        title="Misconceptions"
        queryKey="admin-misconceptions"
        queryFn={async () => (await adminApi.misconceptions()).data as Record<string, unknown>[]}
        columns={['Description']}
        row={(m) => [String(m.description ?? m.name ?? m.id)]}
      />
      <ScanAndFlagsSection
        title="Content QA"
        queryKey="admin-content-qa"
        listFn={async () => (await adminApi.contentQaFlags()).data as Record<string, unknown>[]}
        scanFn={() => adminApi.contentQaScan()}
      />
      <ScanAndFlagsSection
        title="Assessment Quality"
        queryKey="admin-assessment-quality"
        listFn={async () => (await adminApi.assessmentQualityFlags()).data as Record<string, unknown>[]}
        scanFn={() => adminApi.assessmentQualityScan()}
      />
      <ScanAndFlagsSection
        title="Difficulty Calibration"
        queryKey="admin-difficulty-calibration"
        listFn={async () => (await adminApi.difficultyCalibrationFlags()).data as Record<string, unknown>[]}
        scanFn={() => adminApi.difficultyCalibrationScan()}
      />
      <CurriculumMappingSection />
      <ContentProvenanceSection />
    </div>
  )
}

interface Mission {
  id: string
  title: string
  type?: string
  description?: string
}

/**
 * Mission admin — list + real create/delete/UPDATE.
 *
 * FIX (reconciliation audit, round 3, 2026-10-06): `adminApi.updateMission`
 * (`PATCH /admin/missions/:id`, admin-missions.controller.ts) is real and
 * ADMIN-gated, with a frontend wrapper that had zero callers — this section
 * could create and delete missions but never edit one, so a typo in a
 * title/description had no fix path short of delete+recreate. Reused the
 * same dialog for both create and edit (pre-filled when editing), matching
 * the one-dialog-two-modes pattern already used elsewhere in this admin
 * area rather than building a second, near-duplicate dialog.
 */
function MissionsSection() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-missions'],
    queryFn: async () => (await adminApi.missions()).data as Mission[],
  })

  function openCreate() {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setType('')
    setOpen(true)
  }

  function openEdit(m: Mission) {
    setEditingId(m.id)
    setTitle(m.title)
    setDescription(m.description ?? '')
    setType(m.type ?? '')
    setOpen(true)
  }

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const body = { title: title.trim(), description: description.trim(), type: type.trim() || undefined }
      if (editingId) {
        await adminApi.updateMission(editingId, body)
      } else {
        await adminApi.createMission(body)
      }
      await qc.invalidateQueries({ queryKey: ['admin-missions'] })
      setOpen(false)
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    await adminApi.deleteMission(id)
    await qc.invalidateQueries({ queryKey: ['admin-missions'] })
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionHeader title={t('admin.missions')} />
        <Button size="sm" onClick={openCreate}>
          {t('admin.createContent')}
        </Button>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {data.map((m) => (
            <Card key={m.id} className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{m.title}</span>
                {m.type && <span className="text-xs text-ink-400">{m.type}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>
                  {t('admin.edit')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void remove(m.id)}>
                  {t('common.cancel')}
                </Button>
              </span>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('admin.missions')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void save()} disabled={saving || !title.trim()} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Type" value={type} onChange={(e) => setType(e.target.value)} />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
      </Dialog>
    </section>
  )
}

/** Generic "scan now + list open flags" pattern shared by content-qa,
 * assessment-quality, and difficulty-calibration — all three admin engines
 * follow the exact same POST scan / GET flags shape on the backend. */
function ScanAndFlagsSection({
  title,
  queryKey,
  listFn,
  scanFn,
}: {
  title: string
  queryKey: string
  listFn: () => Promise<Record<string, unknown>[]>
  scanFn: () => Promise<unknown>
}) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [scanning, setScanning] = useState(false)
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: [queryKey], queryFn: listFn, retry: false })

  async function scan() {
    setScanning(true)
    try {
      await scanFn()
      await qc.invalidateQueries({ queryKey: [queryKey] })
      toast.show(t('admin.scanComplete'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setScanning(false)
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionHeader title={title} />
        <Button size="sm" variant="secondary" loading={scanning} onClick={() => void scan()}>
          {t('admin.runScan')}
        </Button>
      </div>
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState title={t('admin.noOpenFlags')} />
      ) : (
        <div className="space-y-2">
          {data.map((f, i) => (
            <Card key={i}>
              <p className="text-sm text-ink-800">{String(f.detail ?? f.flagType ?? f.message ?? JSON.stringify(f))}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}

interface MappingSuggestion {
  objectiveId: string
  objectiveName: string
  competencyName: string
  skillName: string
  domainName: string
  score: number
}

/**
 * FIX (2026-10-02): POST /admin/curriculum-mapping/suggest
 * (curriculum-mapping.service.ts suggest()) returns a wrapped
 * `{ queryTokens: string[], suggestions: MappingSuggestion[] }` object,
 * not a bare array — the previous code cast the whole response to an
 * array, so `results.map` would throw at runtime whenever a non-empty
 * response came back. Unwrapped `.suggestions` and render the real
 * `objectiveName`/`competencyName`/`domainName`/`score` fields instead of
 * a nonexistent `name` field.
 *
 * Curriculum mapping — free-text -> ranked LearningObjective suggestions.
 * Human-confirmation-only by design (the backend never auto-commits).
 */
function CurriculumMappingSection() {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [results, setResults] = useState<MappingSuggestion[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function suggest() {
    if (!title.trim()) return
    setLoading(true)
    try {
      const res = await adminApi.suggestCurriculumMapping({ title: title.trim(), description: description.trim() || undefined })
      const data = res.data as { queryTokens: string[]; suggestions: MappingSuggestion[] }
      setResults(data.suggestions ?? [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <SectionHeader title="Curriculum Mapping" />
      <Card>
        <div className="flex flex-wrap gap-2">
          <Input className="flex-1" placeholder="Content title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button onClick={() => void suggest()} loading={loading} disabled={!title.trim()}>
            {t('admin.suggest')}
          </Button>
        </div>
        <Textarea
          className="mt-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        {results && (
          <div className="mt-4 space-y-2">
            {results.length === 0 ? (
              <EmptyState />
            ) : (
              results.map((r, i) => (
                <div key={i} className="rounded-control border border-line p-2 text-sm text-ink-800">
                  <span className="font-medium">{r.objectiveName}</span>
                  <span className="text-ink-400"> · {r.competencyName} · {r.skillName} · {r.domainName}</span>
                  <span className="ms-2 text-xs text-brand-600">({Math.round(r.score * 100)}%)</span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </section>
  )
}

/** Content provenance — license + source registry (admin authoring tool for
 * attaching real provenance metadata to externally-sourced content). */
function ContentProvenanceSection() {
  const licenses = useQuery({
    queryKey: ['admin-provenance-licenses'],
    queryFn: async () => (await adminApi.provenanceLicenses()).data as Record<string, unknown>[],
    retry: false,
  })
  const sources = useQuery({
    queryKey: ['admin-provenance-sources'],
    queryFn: async () => (await adminApi.provenanceSources()).data as Record<string, unknown>[],
    retry: false,
  })

  return (
    <section>
      <SectionHeader title="Content Provenance" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Licenses</p>
          {licenses.isLoading ? (
            <LoadingState />
          ) : !licenses.data || licenses.data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {licenses.data.map((l, i) => (
                <Card key={i}>
                  <p className="text-sm font-medium text-ink-900">{String(l.name ?? l.spdxId)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Sources</p>
          {sources.isLoading ? (
            <LoadingState />
          ) : !sources.data || sources.data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {sources.data.map((s, i) => (
                <Card key={i}>
                  <p className="text-sm font-medium text-ink-900">{String(s.name)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
