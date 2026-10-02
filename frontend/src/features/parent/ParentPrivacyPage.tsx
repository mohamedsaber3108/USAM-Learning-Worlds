import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download, Trash2 } from 'lucide-react'
import { parentsApi, legalApi, CURRENT_POLICY_VERSION, type ConsentPurpose } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Button, Switch, useToast } from '@/components/ui'

interface ChildLink {
  relationshipId: string
  learner: { id: string; displayName: string }
}

const PURPOSES: ConsentPurpose[] = [
  'ESSENTIAL_SERVICE',
  'PERSONALIZATION',
  'AI_PROCESSING',
  'VOICE_PROCESSING',
  'COMMUNITY',
  'ANALYTICS',
]
const ESSENTIAL: ConsentPurpose = 'ESSENTIAL_SERVICE'

/**
 * Consent & privacy (GDPR/COPPA) — per-child consent capture + export +
 * deletion request.
 *
 * FIX (2026-10-02, ledger 88 task 10): this page previously only did export/
 * delete. The actual COPPA/GDPR consent-CAPTURE flow (`POST /legal/consent`,
 * `GET /legal/consent/:learnerId`) — the core guardian permission system —
 * had zero UI despite being core to a kids' platform. Added a real
 * per-purpose toggle panel per child, backed by `ConsentRecord` (which
 * `purpose`, `granted`, and `policyVersion` the guardian agreed to — real
 * compliance evidence, not a cosmetic checkbox).
 */
export function ParentPrivacyPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-children', 'privacy'],
    queryFn: async () => (await parentsApi.children()).data as ChildLink[],
  })

  async function exportData(learnerId: string) {
    setBusyId(learnerId)
    try {
      await legalApi.exportData(learnerId)
      toast.show(t('parent.exportData'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setBusyId(null)
    }
  }
  async function requestDelete(learnerId: string) {
    setBusyId(learnerId)
    try {
      await legalApi.requestDelete(learnerId)
      toast.show(t('parent.requestDelete'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-8">
      <PageHeader title={t('parent.privacy')} />
      {!data || data.length === 0 ? (
        <EmptyState title={t('parent.noChildren')} />
      ) : (
        <div className="space-y-8">
          {data.map((c) => (
            <section key={c.relationshipId} className="space-y-4">
              <SectionHeader
                title={c.learner.displayName}
                subtitle={t('parent.consentSubtitle', { name: c.learner.displayName })}
              />
              <ConsentPanel learnerId={c.learner.id} />
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-medium text-ink-900">{t('parent.exportData')} / {t('parent.requestDelete')}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={busyId === c.learner.id}
                    onClick={() => exportData(c.learner.id)}
                  >
                    <Download className="h-4 w-4" aria-hidden /> {t('parent.exportData')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busyId === c.learner.id}
                    onClick={() => requestDelete(c.learner.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden /> {t('parent.requestDelete')}
                  </Button>
                </div>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function ConsentPanel({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const toast = useToast()
  const qc = useQueryClient()
  const [pending, setPending] = useState<ConsentPurpose | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['consent', learnerId],
    queryFn: async () => (await legalApi.getConsent(learnerId)).data,
  })

  const grantedByPurpose = new Map((data ?? []).map((c) => [c.purpose, c.granted]))

  async function toggle(purpose: ConsentPurpose, granted: boolean) {
    setPending(purpose)
    try {
      await legalApi.consent({ learnerId, purpose, granted, policyVersion: CURRENT_POLICY_VERSION })
      await qc.invalidateQueries({ queryKey: ['consent', learnerId] })
      toast.show(t('parent.consentSaved'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setPending(null)
    }
  }

  if (isLoading) return <LoadingState />

  return (
    <Card className="divide-y divide-line p-0">
      {PURPOSES.map((purpose) => {
        const granted = purpose === ESSENTIAL ? true : (grantedByPurpose.get(purpose) ?? false)
        return (
          <div key={purpose} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-medium text-ink-900">
                {t(`parent.consentPurpose${purpose}`)}
                {purpose === ESSENTIAL && (
                  <span className="ms-2 text-xs font-semibold text-ink-400">({t('parent.consentRequired')})</span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-ink-500">{t(`parent.consentPurpose${purpose}Desc`)}</p>
            </div>
            <Switch
              checked={granted}
              disabled={purpose === ESSENTIAL || pending === purpose}
              onChange={(v) => void toggle(purpose, v)}
              label={t(`parent.consentPurpose${purpose}`)}
            />
          </div>
        )
      })}
    </Card>
  )
}
