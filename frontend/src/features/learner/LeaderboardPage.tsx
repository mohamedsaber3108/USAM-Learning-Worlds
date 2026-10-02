import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trophy } from 'lucide-react'
import { rewardsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Avatar, StatusPill } from '@/components/ui'
import { useAuthStore } from '@/lib/auth/authStore'

interface LeaderboardRow {
  rank: number
  learnerId: string
  displayName: string
  avatarUrl?: string | null
  level: number
  totalXP: number
}

/**
 * Leaderboard — real GET /gamification/leaderboard.
 *
 * NEW (ledger 88 batch 5): surfaced building the legacy URL redirect map —
 * legacy `/leaderboard` had a real, working backend consumer
 * (`progression.service.ts getLeaderboard`) with zero `frontend-rebuild`
 * representation. Opt-in by design on the backend (only learners with
 * `leaderboardOptIn: true` appear) — this page shows exactly that filtered
 * list, never fabricating ranks for learners who haven't opted in.
 */
export function LeaderboardPage() {
  const { t } = useTranslation()
  const myLearnerId = useAuthStore((s) => s.user?.learner?.id)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => (await rewardsApi.leaderboard()).data as LeaderboardRow[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  const rows = data ?? []
  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.leaderboard')} subtitle={t('learner.leaderboardSubtitle')} />
      {rows.length === 0 ? (
        <EmptyState title={t('learner.leaderboardEmpty')} />
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const isMe = r.learnerId === myLearnerId
            return (
              <Card
                key={r.learnerId}
                className={isMe ? 'flex items-center gap-4 ring-2 ring-brand-400' : 'flex items-center gap-4'}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {r.rank <= 3 ? (
                    <Trophy
                      className={
                        r.rank === 1
                          ? 'h-6 w-6 text-warning-500'
                          : r.rank === 2
                            ? 'h-6 w-6 text-ink-400'
                            : 'h-6 w-6 text-brand-400'
                      }
                      aria-hidden
                    />
                  ) : (
                    <span className="font-display font-bold text-ink-400">{r.rank}</span>
                  )}
                </span>
                <Avatar name={r.displayName} src={r.avatarUrl} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink-900">
                    {r.displayName}
                    {isMe && <span className="ms-2 text-xs text-brand-600">({t('common.you')})</span>}
                  </span>
                </span>
                <StatusPill tone="brand">{t('learner.level')} {r.level}</StatusPill>
                <span className="shrink-0 font-display font-bold text-brand-700">{r.totalXP} XP</span>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
