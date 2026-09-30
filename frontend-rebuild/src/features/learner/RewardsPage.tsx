import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { rewardsApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui/Card'

interface Progression { level?: number; totalXP?: number; coins?: number }
interface Streak { current?: number; longest?: number }
interface Achievement { id: string; name: string; unlocked?: boolean }

/** Rewards — XP/level/streak/achievements/cosmetics consolidated (legacy split
 * these across 4 pages). Real gamification endpoints. */
export function RewardsPage() {
  const { t } = useTranslation()
  const progression = useQuery({
    queryKey: ['rewards-progression'],
    queryFn: async () => (await rewardsApi.progression()).data as Progression,
  })
  const streak = useQuery({
    queryKey: ['rewards-streak'],
    queryFn: async () => (await rewardsApi.streak()).data as Streak,
    retry: false,
  })
  const achievements = useQuery({
    queryKey: ['rewards-achievements'],
    queryFn: async () => (await rewardsApi.achievements()).data as Achievement[],
    retry: false,
  })

  if (progression.isLoading) return <LoadingState />
  if (progression.isError) return <ErrorState onRetry={() => void progression.refetch()} />

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.rewards')} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">{t('learner.level')}</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{progression.data?.level ?? 1}</p>
          <p className="mt-1 text-sm text-ink-500">{progression.data?.totalXP ?? 0} XP</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">{t('learner.streak')}</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{streak.data?.current ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink-400">Coins</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{progression.data?.coins ?? 0}</p>
        </Card>
      </div>

      <section>
        <SectionHeader title={t('learner.achievements')} />
        {achievements.data && achievements.data.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.data.map((a) => (
              <Card key={a.id} className={a.unlocked ? '' : 'opacity-60'}>
                <p className="font-medium text-ink-900">{a.name}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  )
}
