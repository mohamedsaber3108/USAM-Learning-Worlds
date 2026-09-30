import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { PageHeader } from '@/components/ui/Card'
import { AdminListSection } from './AdminListSection'

/** AI & Safety ops — prompt templates, safety policies, AI eval runs (real
 * admin endpoints). */
export function AdminAiSafetyPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.aiSafety')} />
      <AdminListSection
        title={t('admin.promptTemplates')}
        queryKey="admin-prompts"
        queryFn={async () => (await adminApi.promptTemplates()).data as Record<string, unknown>[]}
        primary={(p) => String(p.key ?? p.name ?? p.id)}
        secondary={(p) => (p.active === false ? 'inactive' : 'active')}
      />
      <AdminListSection
        title={t('admin.safetyPolicies')}
        queryKey="admin-safety-policies"
        queryFn={async () => (await adminApi.safetyPolicies()).data as Record<string, unknown>[]}
        primary={(p) => String(p.ageBand ?? p.name ?? p.id)}
      />
      <AdminListSection
        title={t('admin.aiEval')}
        queryKey="admin-ai-eval"
        queryFn={async () => (await adminApi.aiEvalRuns()).data as Record<string, unknown>[]}
        primary={(r) => String(r.name ?? r.id)}
        secondary={(r) => (r.status ? String(r.status) : undefined)}
      />
    </div>
  )
}
