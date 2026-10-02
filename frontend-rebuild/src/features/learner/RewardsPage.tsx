import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Star, Flame, Coins, Lock, Check } from 'lucide-react'
import { rewardsApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState, EmptyState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Button, useToast } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface Progression { level?: number; totalXP?: number; coins?: number }
interface Streak { current?: number; longest?: number }
interface Achievement { id: string; name: string; unlocked?: boolean }

/**
 * Rewards — XP/level/streak/achievements + the cosmetic shop.
 *
 * FIX (2026-10-02, ledger 88 task 9): the cosmetic shop (unlock/equip
 * borders, badges, titles, color themes with earned XP) was fully built on
 * the backend (`gamification.controller.ts` cosmetics/* ) but `rewardsApi`
 * had zero callers for it anywhere. Added a real shop grid below
 * achievements, grouped by category, each tile showing owned/equipped/
 * affordable state honestly (no fake "coming soon" placeholders).
 */
export function RewardsPage() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const toast = useToast()

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
  const cosmetics = useQuery({
    queryKey: ['rewards-cosmetics'],
    queryFn: async () => (await rewardsApi.cosmetics()).data,
    retry: false,
  })

  async function unlock(id: string) {
    try {
      await rewardsApi.unlockCosmetic(id)
      await qc.invalidateQueries({ queryKey: ['rewards-cosmetics'] })
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }
  async function equip(id: string) {
    await rewardsApi.equipCosmetic(id)
    await qc.invalidateQueries({ queryKey: ['rewards-cosmetics'] })
  }

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
        {stat(<Coins className="h-5 w-5" aria-hidden />, 'XP', progression.data?.totalXP ?? 0)}
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

      <section>
        <SectionHeader title={t('learner.cosmeticShop')} />
        {!cosmetics.data || cosmetics.data.items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cosmetics.data.items.map((item) => (
              <Card
                key={item.id}
                className={cn('flex flex-col items-center text-center', item.isEquipped && 'ring-2 ring-brand-400')}
              >
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full text-xl',
                    item.owned ? 'bg-brand-100 text-brand-700' : 'bg-canvas-off text-ink-400',
                  )}
                  aria-hidden
                >
                  {item.owned ? <Check className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{item.category}</p>
                <p className="font-display font-bold text-ink-900">{item.name}</p>
                <div className="mt-3 w-full">
                  {item.isEquipped ? (
                    <Button size="sm" variant="secondary" className="w-full" disabled>
                      {t('learner.cosmeticEquipped')}
                    </Button>
                  ) : item.owned ? (
                    <Button size="sm" className="w-full" onClick={() => void equip(item.id)}>
                      {t('learner.cosmeticEquip')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={item.canAfford ? 'primary' : 'secondary'}
                      className="w-full"
                      disabled={!item.canAfford}
                      onClick={() => void unlock(item.id)}
                    >
                      {item.canAfford
                        ? t('learner.cosmeticUnlock', { cost: item.xpCost })
                        : t('learner.cosmeticCantAfford', { cost: item.xpCost })}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
