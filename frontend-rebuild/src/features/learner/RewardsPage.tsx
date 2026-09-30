import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Star, Flame, Coins } from 'lucide-react'
import { rewardsApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader } from '@/components/ui'

interface Progression { level?: number; totalXP?: number; coins?: number }
interface Streak { current?: number; longest?: number }
interface Achievement { id: string; name: string; unlocked?: boolean }

/** Rewards — XP/level/streak/achievements consolidated (legacy split 4 pages).
 * Real gamification endpoints. DS. */
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

  const stat = (icon: React.ReactNode, label: string, value: number | string) => (
    <Card>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">{icon}</span>
      <p className="mt-2 text-xs uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-brand-700">{value}</p>
    </Card>
  )

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.rewards')} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stat(<Star className="h-5 w-5" aria-hidden />, t('learner.level'), progression.data?.level ?? 1)}
        {stat(<Flame className="h-5 w-5" aria-hidden />, t('learner.streak'), streak.data?.current ?? 0)}
        {stat(<Coins className="h-5 w-5" aria-hidden />, 'Coins', progression.data?.coins ?? 0)}
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
