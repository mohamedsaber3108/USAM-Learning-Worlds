import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Switch, useToast } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

interface FeatureFlag { key: string; enabled: boolean; description?: string }

/** Platform ops — feature flags (real toggle via Switch), experiments, audit
 * log. DS. */
export function AdminPlatformPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const flags = useQuery({
    queryKey: ['admin-flags'],
    queryFn: async () => (await adminApi.featureFlags()).data as FeatureFlag[],
  })

  async function toggle(f: FeatureFlag) {
    await adminApi.setFeatureFlag(f.key, !f.enabled)
    toast.show(f.key, 'success')
    await qc.invalidateQueries({ queryKey: ['admin-flags'] })
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t('admin.platform')} />

      <section>
        <SectionHeader title={t('admin.featureFlags')} />
        {flags.isLoading ? (
          <LoadingState />
        ) : flags.isError ? (
          <ErrorState onRetry={() => void flags.refetch()} />
        ) : !flags.data || flags.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {flags.data.map((f) => (
              <Card key={f.key} className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-900">{f.key}</span>
                  {f.description && <span className="text-xs text-ink-400">{f.description}</span>}
                </span>
                <Switch checked={f.enabled} onChange={() => toggle(f)} label={f.key} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <AdminListSection
        title={t('admin.experiments')}
        queryKey="admin-experiments"
        queryFn={async () => (await adminApi.experiments()).data as Record<string, unknown>[]}
        columns={['Experiment', 'Status']}
        row={(e) => [String(e.key ?? e.name ?? e.id), e.status ? String(e.status) : '—']}
      />
      <AdminListSection
        title={t('admin.auditLog')}
        queryKey="admin-audit"
        queryFn={async () => (await adminApi.auditLogs()).data as Record<string, unknown>[]}
        columns={['Action', 'Role']}
        row={(l) => [String(l.action ?? l.id), l.actorRole ? String(l.actorRole) : '—']}
      />
    </div>
  )
}
