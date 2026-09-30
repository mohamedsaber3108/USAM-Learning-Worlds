import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { AdminListSection } from './AdminListSection'

interface FeatureFlag { key: string; enabled: boolean; description?: string }

/** Platform ops — feature flags (real toggle), experiments, audit log. */
export function AdminPlatformPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const flags = useQuery({
    queryKey: ['admin-flags'],
    queryFn: async () => (await adminApi.featureFlags()).data as FeatureFlag[],
  })

  async function toggle(f: FeatureFlag) {
    await adminApi.setFeatureFlag(f.key, !f.enabled)
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
              <Card key={f.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-medium text-ink-900">{f.key}</span>
                    {f.description && <span className="text-xs text-ink-400">{f.description}</span>}
                  </span>
                  <button
                    role="switch"
                    aria-checked={f.enabled}
                    onClick={() => toggle(f)}
                    className={`relative h-6 w-11 rounded-pill transition-colors ${f.enabled ? 'bg-brand-500' : 'bg-line'}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${f.enabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'}`}
                    />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AdminListSection
        title={t('admin.experiments')}
        queryKey="admin-experiments"
        queryFn={async () => (await adminApi.experiments()).data as Record<string, unknown>[]}
        primary={(e) => String(e.key ?? e.name ?? e.id)}
        secondary={(e) => (e.status ? String(e.status) : undefined)}
      />
      <AdminListSection
        title={t('admin.auditLog')}
        queryKey="admin-audit"
        queryFn={async () => (await adminApi.auditLogs()).data as Record<string, unknown>[]}
        primary={(l) => String(l.action ?? l.id)}
        secondary={(l) => (l.actorRole ? String(l.actorRole) : undefined)}
      />
    </div>
  )
}
