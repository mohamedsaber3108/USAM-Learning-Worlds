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
      <AdminListSection
        title={t('admin.promptTemplates')}
        queryKey="admin-prompts"
        queryFn={async () => (await adminApi.promptTemplates()).data as Record<string, unknown>[]}
        columns={['Key', 'State']}
        row={(p) => [String(p.key ?? p.name ?? p.id), p.active === false ? 'inactive' : 'active']}
      />
      <AdminListSection
        title={t('admin.safetyPolicies')}
        queryKey="admin-safety-policies"
        queryFn={async () => (await adminApi.safetyPolicies()).data as Record<string, unknown>[]}
        columns={['Policy']}
        row={(p) => [String(p.ageBand ?? p.name ?? p.id)]}
      />
      <AdminListSection
        title={t('admin.aiEval')}
        queryKey="admin-ai-eval"
        queryFn={async () => (await adminApi.aiEvalRuns()).data as Record<string, unknown>[]}
        columns={['Run', 'Status']}
        row={(r) => [String(r.name ?? r.id), r.status ? String(r.status) : '—']}
      />
    </div>
  )
}
