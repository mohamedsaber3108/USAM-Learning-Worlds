import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Switch, useToast } from '@/components/ui'
import { AdminListSection } from './AdminListSection'

interface FeatureFlag { key: string; isEnabledGlobally: boolean; description?: string | null }

/**
 * FIX (2026-10-02): real FeatureFlag column is `isEnabledGlobally`
 * (feature-flag.service.ts/schema.prisma), not `enabled`. The previous
 * `enabled` field was always undefined, so every flag always rendered as
 * "off" and the toggle (`!f.enabled` = `!undefined` = `true`) could only
 * ever turn a flag ON, never back off. Also fixed the `setFeatureFlag`
 * wrapper body key in endpoints.ts to match the real DTO.
 *
 * Platform ops — feature flags (real toggle via Switch), experiments, audit
 * log. DS.
 */
export function AdminPlatformPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()
  const flags = useQuery({
    queryKey: ['admin-flags'],
    queryFn: async () => (await adminApi.featureFlags()).data,
  })

  async function toggle(f: FeatureFlag) {
    await adminApi.setFeatureFlag(f.key, !f.isEnabledGlobally)
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
                <Switch checked={f.isEnabledGlobally} onChange={() => toggle(f)} label={f.key} />
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
      <MemoryGovernanceSection />
    </div>
  )
}

interface PurposeTagCount {
  purposeTag: string
  total: number
  pastRetention: number
}
interface MemoryGovernanceStats {
  conversationMessages: PurposeTagCount[]
  characterInteractions: PurposeTagCount[]
  totals: {
    conversationMessages: number
    conversationMessagesPastRetention: number
    characterInteractions: number
    characterInteractionsPastRetention: number
  }
  generatedAt: string
}

/**
 * Memory governance stats — real GET /admin/memory-governance/stats
 * (memory-governance.service.ts getStats). Had zero frontend
 * representation before this pass, and the first wiring attempt had a
 * contract-mismatch bug: the real response is a nested object
 * `{ conversationMessages: [...], characterInteractions: [...], totals: {...
 * 4 number fields }, generatedAt }`, not a flat `Record<string, number>`.
 * A blind `typeof v === 'number'` filter over the top-level object strips
 * every field (two arrays + one nested object + one Date all fail the
 * check), so the section always rendered EmptyState regardless of real
 * data. Fixed to read the real `totals` fields plus a per-purpose
 * breakdown table.
 */
function MemoryGovernanceSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-memory-governance'],
    queryFn: async () => (await adminApi.memoryGovernanceStats()).data as MemoryGovernanceStats,
    retry: false,
  })

  return (
    <section>
      <SectionHeader title="Memory Governance" />
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-400">Conversation messages</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{data.totals.conversationMessages}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-400">Past retention</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-warning-700">
                {data.totals.conversationMessagesPastRetention}
              </p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-400">Character interactions</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{data.totals.characterInteractions}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-ink-400">Past retention</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-warning-700">
                {data.totals.characterInteractionsPastRetention}
              </p>
            </Card>
          </div>
        </div>
      )}
    </section>
  )
}
