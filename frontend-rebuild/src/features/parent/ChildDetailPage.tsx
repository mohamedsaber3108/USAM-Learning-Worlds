import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { parentsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { masteryLabel } from '@/lib/labels/masteryLabels'

type Tab = 'progress' | 'activity' | 'reflections' | 'safety' | 'controls'

/** Child detail — tabbed guardian view over one child. Every tab is a real
 * parents endpoint; the guardian sees mastery in plain language, not decimals. */
export function ChildDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('progress')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'progress', label: t('parent.progress') },
    { key: 'activity', label: t('parent.activity') },
    { key: 'reflections', label: t('parent.reflections') },
    { key: 'safety', label: t('parent.safety') },
    { key: 'controls', label: t('parent.controls') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.overview')} />
      <div className="flex flex-wrap gap-1 border-b border-line" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            role="tab"
            aria-selected={tab === tb.key}
            onClick={() => setTab(tb.key)}
            className={cn(
              'rounded-t-control px-4 py-2 text-sm font-medium transition-colors',
              tab === tb.key ? 'border-b-2 border-brand-500 text-brand-700' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'progress' && <ProgressTab learnerId={id} />}
      {tab === 'activity' && <ActivityTab learnerId={id} />}
      {tab === 'reflections' && <ReflectionsTab learnerId={id} />}
      {tab === 'safety' && <SafetyTab learnerId={id} />}
      {tab === 'controls' && <ControlsTab learnerId={id} />}
    </div>
  )
}

function ProgressTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-progress', learnerId],
    queryFn: async () => (await parentsApi.progress(learnerId)).data as {
      mastery: Array<{ competency: string; domain: string; state: string }>
      weeklyStats?: { practiceCount: number; successRate: number }
    },
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  const mastery = data?.mastery ?? []
  return (
    <div className="space-y-4">
      {data?.weeklyStats && (
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">{t('parent.weeklyPractice')}</p>
          <p className="mt-1 text-ink-800">
            {data.weeklyStats.practiceCount} activities · {data.weeklyStats.successRate}% success
          </p>
        </Card>
      )}
      {mastery.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {mastery.map((m, i) => (
            <div key={i} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{m.competency}</span>
                <span className="block text-xs text-ink-400">{m.domain}</span>
              </span>
              <Badge tone="brand">{masteryLabel(m.state)}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityTab({ learnerId }: { learnerId: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-activity', learnerId],
    queryFn: async () => (await parentsApi.activity(learnerId, 7)).data as {
      activities: { missions: Array<{ title: string; status: string; date: string }> }
    },
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  const missions = data?.activities?.missions ?? []
  if (missions.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {missions.map((m, i) => (
        <div key={i} className="flex items-center justify-between rounded-control border border-line bg-white px-4 py-3">
          <span className="font-medium text-ink-900">{m.title}</span>
          <Badge tone={m.status === 'COMPLETED' ? 'success' : 'neutral'}>{m.status}</Badge>
        </div>
      ))}
    </div>
  )
}

function ReflectionsTab({ learnerId }: { learnerId: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-reflections', learnerId],
    queryFn: async () => (await parentsApi.reflections(learnerId)).data as Array<{ id: string; prompt?: string; response?: string }>,
    retry: false,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  const items = Array.isArray(data) ? data : []
  if (items.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <Card key={r.id}>
          {r.prompt && <p className="text-sm font-medium text-ink-800">{r.prompt}</p>}
          {r.response && <p className="mt-1 text-sm text-ink-600">{r.response}</p>}
        </Card>
      ))}
    </div>
  )
}

function SafetyTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-safety', learnerId],
    queryFn: async () => (await parentsApi.safety(learnerId)).data as { escalations?: unknown[] },
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  const escalations = Array.isArray(data?.escalations) ? data!.escalations! : []
  if (escalations.length === 0) return <EmptyState title={t('parent.allClear')} />
  return (
    <div className="space-y-2">
      {escalations.map((_e, i) => (
        <Card key={i}>
          <Badge tone="warning">Needs attention</Badge>
        </Card>
      ))}
    </div>
  )
}

function ControlsTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const [daily, setDaily] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      await parentsApi.setTimeLimits(learnerId, { dailyMinutes: daily ? Number(daily) : undefined })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <label htmlFor="daily" className="mb-1 block text-sm font-medium text-ink-700">
        {t('parent.dailyMinutes')}
      </label>
      <input
        id="daily"
        type="number"
        min={0}
        value={daily}
        onChange={(e) => setDaily(e.target.value)}
        className="w-40 rounded-control border border-line px-3 py-2 focus-visible:border-brand-400"
      />
      <div className="mt-3">
        <Button size="sm" loading={saving} onClick={save}>
          {t('parent.saveControls')}
        </Button>
        {saved && <span className="ms-3 text-sm text-success-700">✓</span>}
      </div>
    </Card>
  )
}
