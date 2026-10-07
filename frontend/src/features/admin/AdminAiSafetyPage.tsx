import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { PageHeader, SectionHeader, Card, Button, StatusPill, Dialog, Textarea, Input, useToast } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

interface PromptTemplate {
  key: string
  id?: string
  content?: string
  version?: number
  isActive?: boolean
}

/**
 * Prompt template authoring — real GET/PUT/PATCH /admin/prompt-templates
 * (admin-prompt-template.controller.ts, ADMIN-gated).
 *
 * FIX (reverse-engineering/experience directive, 2026-10-07, §45: "Admin
 * must operate the learning product. Not just inspect lists"): this engine
 * was list-only — the controller's own doc comment says admins previously
 * had no way to fix a bad AI prompt "without a raw psql/ts-node script".
 * Added a real edit flow: open a template, edit its content with a
 * required changelog note (the backend enforces this — every edit must be
 * self-documenting, versioned, never destructive — matched here rather
 * than faked client-side), and a deactivate toggle for the active state.
 */
function PromptTemplatesSection() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<PromptTemplate | null>(null)
  const [content, setContent] = useState('')
  const [changelog, setChangelog] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-prompts'],
    queryFn: async () => (await adminApi.promptTemplates()).data as PromptTemplate[],
  })

  async function openEdit(key: string) {
    const full = (await adminApi.getPromptTemplate(key)).data as PromptTemplate
    setEditing(full)
    setContent(full.content ?? '')
    setChangelog('')
  }

  async function save() {
    if (!editing || !content.trim() || !changelog.trim()) return
    setSaving(true)
    try {
      await adminApi.updatePromptTemplate(editing.key, { content: content.trim(), changelog: changelog.trim() })
      toast.show(t('common.save'), 'success')
      setEditing(null)
      await qc.invalidateQueries({ queryKey: ['admin-prompts'] })
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(p: PromptTemplate) {
    if (p.isActive === false) return // re-enable only via a new PUT (real backend behavior, not faked)
    await adminApi.deactivatePromptTemplate(p.key)
    await qc.invalidateQueries({ queryKey: ['admin-prompts'] })
  }

  return (
    <section>
      <SectionHeader title={t('admin.promptTemplates')} />
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {data.map((p) => (
            <Card key={p.key ?? p.id} className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{p.key ?? p.id}</span>
                {typeof p.version === 'number' && <span className="text-xs text-ink-400">v{p.version}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <StatusPill tone={p.isActive === false ? 'neutral' : 'success'}>
                  {p.isActive === false ? 'inactive' : 'active'}
                </StatusPill>
                <Button size="sm" variant="secondary" onClick={() => void openEdit(p.key)}>
                  {t('admin.edit')}
                </Button>
                {p.isActive !== false && (
                  <Button size="sm" variant="ghost" onClick={() => void toggleActive(p)}>
                    Deactivate
                  </Button>
                )}
              </span>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.key ?? ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void save()} disabled={saving || !content.trim() || !changelog.trim()} loading={saving}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Textarea label="Content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          <Input
            label="Changelog note (required)"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            placeholder="What changed and why"
          />
        </div>
      </Dialog>
    </section>
  )
}

/** AI & Safety ops — prompt templates (real edit flow), safety policies, AI
 * eval runs (real admin endpoints). DS. */
export function AdminAiSafetyPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.aiSafety')} />
      {/*
        FIX (2026-10-02): three real contract-mismatch bugs confirmed by
        reading the backend services directly.
        1) PromptTemplate's real column is `isActive`, not `active` — the
           old check (`p.active === false`) was always false, so every row
           always displayed "active" regardless of its true state.
        2) AIEvalService.listRuns() returns `{ runs: [...] }`, a wrapped
           object, not a bare array — the old cast to
           `Record<string, unknown>[]` meant `data.map` would throw at
           runtime whenever eval runs exist in the DB. Unwrapped `.runs`.
        3) An eval run has no `name` field (only `datasetVersion`), so the
           row now reads the real column instead of a nonexistent one.
      */}
      <PromptTemplatesSection />
      <AdminListSection
        title={t('admin.safetyPolicies')}
        queryKey="admin-safety-policies"
        queryFn={async () => (await adminApi.safetyPolicies()).data as Record<string, unknown>[]}
        columns={['Policy']}
        row={(p) => [String(p.ageBand ?? p.id)]}
      />
      <AdminListSection
        title={t('admin.aiEval')}
        queryKey="admin-ai-eval"
        queryFn={async () => {
          const res = (await adminApi.aiEvalRuns()).data as { runs: Record<string, unknown>[] }
          return res.runs ?? []
        }}
        columns={['Run', 'Status']}
        row={(r) => [String(r.datasetVersion ?? r.id), r.status ? String(r.status) : '—']}
      />
    </div>
  )
}
