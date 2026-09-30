import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { parentsApi, legalApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ChildLink {
  relationshipId: string
  learner: { id: string; displayName: string }
}

/** Consent & privacy (GDPR/COPPA) — export + deletion request per child. Real
 * legal endpoints; deletion is a request (honest, not an instant destructive
 * action in the UI). */
export function ParentPrivacyPage() {
  const { t } = useTranslation()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-children', 'privacy'],
    queryFn: async () => (await parentsApi.children()).data as ChildLink[],
  })

  async function exportData(learnerId: string) {
    setBusyId(learnerId)
    setNote(null)
    try {
      await legalApi.exportData(learnerId)
      setNote(t('parent.exportData') + ' ✓')
    } finally {
      setBusyId(null)
    }
  }
  async function requestDelete(learnerId: string) {
    setBusyId(learnerId)
    setNote(null)
    try {
      await legalApi.requestDelete(learnerId)
      setNote(t('parent.requestDelete') + ' ✓')
    } finally {
      setBusyId(null)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.privacy')} />
      {note && <p className="rounded-control bg-success-100 px-3 py-2 text-sm text-success-700">{note}</p>}
      <SectionHeader title={t('parent.children')} />
      {!data || data.length === 0 ? (
        <EmptyState title={t('parent.noChildren')} />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <Card key={c.relationshipId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-medium text-ink-900">{c.learner.displayName}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" loading={busyId === c.learner.id} onClick={() => exportData(c.learner.id)}>
                    {t('parent.exportData')}
                  </Button>
                  <Button size="sm" variant="ghost" loading={busyId === c.learner.id} onClick={() => requestDelete(c.learner.id)}>
                    {t('parent.requestDelete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
