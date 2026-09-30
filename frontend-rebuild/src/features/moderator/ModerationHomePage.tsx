import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'

interface Stats { open?: number; resolved?: number; total?: number }

/** Moderator overview — real safety-escalations stats summary. */
export function ModerationHomePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mod-stats'],
    queryFn: async () => (await moderationApi.stats()).data as Stats,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.console')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">{t('mod.open')}</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{data?.open ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">{t('mod.resolved')}</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{data?.resolved ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Total</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{data?.total ?? 0}</p>
        </Card>
      </div>
    </div>
  )
}
