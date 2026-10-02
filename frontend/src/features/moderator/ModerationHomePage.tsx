import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShieldAlert, CheckCircle2, ListChecks } from 'lucide-react'
import { moderationApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface Stats { open?: number; resolved?: number; total?: number }

/** Moderator overview — real safety-escalations stats summary. DS. */
export function ModerationHomePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mod-stats'],
    queryFn: async () => (await moderationApi.stats()).data as Stats,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const stat = (icon: React.ReactNode, label: string, value: number) => (
    <Card>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{value}</p>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={t('mod.console')} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(<ShieldAlert className="h-5 w-5" aria-hidden />, t('mod.open'), data?.open ?? 0)}
        {stat(<CheckCircle2 className="h-5 w-5" aria-hidden />, t('mod.resolved'), data?.resolved ?? 0)}
        {stat(<ListChecks className="h-5 w-5" aria-hidden />, 'Total', data?.total ?? 0)}
      </div>
    </div>
  )
}
