import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Star, Flame, FolderCheck, CheckCircle2 } from 'lucide-react'
import { parentsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Tabs, StatusPill, Button, Input, useToast } from '@/components/ui'
import { masteryLabel } from '@/lib/labels/masteryLabels'

type Tab = 'overview' | 'progress' | 'activity' | 'reflections' | 'safety' | 'controls'

/** Child detail — tabbed guardian view over one child, all real parents
 * endpoints; mastery in plain language. DS Tabs. */
export function ChildDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('parent.overview') },
    { key: 'progress', label: t('parent.progress') },
    { key: 'activity', label: t('parent.activity') },
    { key: 'reflections', label: t('parent.reflections') },
    { key: 'safety', label: t('parent.safety') },
    { key: 'controls', label: t('parent.controls') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.overview')} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewTab learnerId={id} />}
      {tab === 'progress' && <ProgressTab learnerId={id} />}
      {tab === 'activity' && <ActivityTab learnerId={id} />}
      {tab === 'reflections' && <ReflectionsTab learnerId={id} />}
      {tab === 'safety' && <SafetyTab learnerId={id} />}
      {tab === 'controls' && <ControlsTab learnerId={id} />}
    </div>
  )
}

/**
 * Overview — NEW (2026-10-02, ledger 88 task 10): `GET
 * /parents/children/:id/dashboard` returns a rich real snapshot (XP/level/
 * streak, mastery breakdown, recent EVIDENCE, showcased-project count) that
 * had zero frontend consumer — ChildDetailPage only called the narrower
 * `progress`/`activity` endpoints. This is the real "Evidence" surface
 * guardians need: proof of learning, not just a mastery list.
 */
function OverviewTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-dashboard', learnerId],
    queryFn: async () => (await parentsApi.dashboard(learnerId)).data,
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  const stat = (icon: React.ReactNode, label: string, value: number | string) => (
    <Card>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-brand-700">{value}</p>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {stat(<Star className="h-5 w-5" aria-hidden />, t('learner.level'), data.progression.level)}
        {stat(<Flame className="h-5 w-5" aria-hidden />, t('learner.streak'), data.streak.current)}
        {stat(<CheckCircle2 className="h-5 w-5" aria-hidden />, t('parent.proficientSkills'), data.mastery.proficient)}
        {stat(<FolderCheck className="h-5 w-5" aria-hidden />, t('parent.showcasedProjects'), data.projects.showcased)}
      </div>
      <section>
        <h3 className="mb-3 font-display font-bold text-ink-900">{t('parent.evidenceRecent')}</h3>
        {data.recentActivity.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((e, i) => (
              <Card key={i} className="flex items-center justify-between">
                <span className="text-sm text-ink-700">{e.type}</span>
                <StatusPill tone={e.success ? 'success' : 'neutral'}>
                  {new Date(e.date).toLocaleDateString()}
                </StatusPill>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ProgressTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-progress', learnerId],
    queryFn: async () =>
      (await parentsApi.progress(learnerId)).data as {
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
            {data.weeklyStats.practiceCount} · {data.weeklyStats.successRate}%
          </p>
        </Card>
      )}
      {mastery.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {mastery.map((m, i) => (
            <Card key={i} className="flex items-center justify-between">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{m.competency}</span>
                <span className="block text-xs text-ink-400">{m.domain}</span>
              </span>
              <StatusPill tone="brand">{masteryLabel(m.state)}</StatusPill>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ActivityTab({ learnerId }: { learnerId: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-activity', learnerId],
    queryFn: async () =>
      (await parentsApi.activity(learnerId, 7)).data as {
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
        <Card key={i} className="flex items-center justify-between">
          <span className="font-medium text-ink-900">{m.title}</span>
          <StatusPill tone={m.status === 'COMPLETED' ? 'success' : 'neutral'}>{m.status}</StatusPill>
        </Card>
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
          <StatusPill tone="warning">Needs attention</StatusPill>
        </Card>
      ))}
    </div>
  )
}

function ControlsTab({ learnerId }: { learnerId: string }) {
  const { t } = useTranslation()
  const toast = useToast()
  const [daily, setDaily] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await parentsApi.setTimeLimits(learnerId, { dailyMinutes: daily ? Number(daily) : undefined })
      toast.show(t('parent.saveControls'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="max-w-sm">
      <Input
        label={t('parent.dailyMinutes')}
        type="number"
        min={0}
        value={daily}
        onChange={(e) => setDaily(e.target.value)}
      />
      <Button className="mt-3" size="sm" loading={saving} onClick={save}>
        {t('parent.saveControls')}
      </Button>
    </Card>
  )
}
