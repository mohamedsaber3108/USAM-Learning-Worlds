import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { PageHeader } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

/** AI & Safety ops — prompt templates, safety policies, AI eval runs (real
 * admin endpoints). DS. */
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
      <AdminListSection
        title={t('admin.promptTemplates')}
        queryKey="admin-prompts"
        queryFn={async () => (await adminApi.promptTemplates()).data as Record<string, unknown>[]}
        columns={['Key', 'State']}
        row={(p) => [String(p.key ?? p.id), p.isActive === false ? 'inactive' : 'active']}
      />
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
