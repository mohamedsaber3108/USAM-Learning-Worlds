import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Download, Trash2 } from 'lucide-react'
import { parentsApi, legalApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Button, useToast } from '@/components/ui'

interface ChildLink {
  relationshipId: string
  learner: { id: string; displayName: string }
}

/** Consent & privacy (GDPR/COPPA) — export + deletion request per child. Real
 * legal endpoints; deletion is a request (honest). DS. */
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
    <div className="space-y-6">
      <PageHeader title={t('parent.privacy')} />
      <SectionHeader title={t('parent.children')} />
      {!data || data.length === 0 ? (
        <EmptyState title={t('parent.noChildren')} />
      ) : (
        <div className="space-y-3">
          {data.map((c) => (
            <Card key={c.relationshipId} className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium text-ink-900">{c.learner.displayName}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" loading={busyId === c.learner.id} onClick={() => exportData(c.learner.id)}>
                  <Download className="h-4 w-4" aria-hidden /> {t('parent.exportData')}
                </Button>
                <Button size="sm" variant="ghost" loading={busyId === c.learner.id} onClick={() => requestDelete(c.learner.id)}>
                  <Trash2 className="h-4 w-4" aria-hidden /> {t('parent.requestDelete')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
