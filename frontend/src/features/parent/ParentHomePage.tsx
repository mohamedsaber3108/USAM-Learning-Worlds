import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Star, Flame, CheckCircle2 } from 'lucide-react'
import { parentsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Avatar } from '@/components/ui'
import { AGE_BAND_LABEL } from '@/lib/labels/ageLabels'
import type { AgeBand } from '@/lib/api/types'

interface ChildLink {
  relationshipId: string
  learner: { id: string; displayName: string; ageBand: AgeBand | null; avatarUrl?: string | null }
}

/**
 * Per-child summary stats — real GET /parents/family-summary
 * (parents.service.ts getFamilySummary). Had ZERO frontend callers before
 * this pass: ParentHomePage only ever called `children()`, which returns
 * just the link + bare learner profile, so a guardian landed on a page of
 * plain name cards with no sense of how each child is actually doing. This
 * endpoint computes level/streak/proficient-count per child server-side —
 * exactly what a guardian home should lead with.
 */
interface FamilySummaryEntry {
  learner: { id: string }
  summary: { level: number; currentStreak: number; proficientCount: number; recentActivityCount: number }
}

/** Parent home — children list with real at-a-glance progress. DS. */
export function ParentHomePage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => (await parentsApi.children()).data as ChildLink[],
  })
  const summary = useQuery({
    queryKey: ['parent-family-summary'],
    queryFn: async () => (await parentsApi.familySummary()).data as { children: FamilySummaryEntry[] },
    retry: false,
  })
  const summaryByLearnerId = new Map((summary.data?.children ?? []).map((c) => [c.learner.id, c.summary]))

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('parent.children')} />
      {!data || data.length === 0 ? (
        <EmptyState title={t('parent.noChildren')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => {
            const stats = summaryByLearnerId.get(c.learner.id)
            return (
              <Link key={c.relationshipId} to={`/parent/child/${c.learner.id}`}>
                <Card className="flex h-full flex-col gap-4 transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex items-center gap-4">
                    <Avatar name={c.learner.displayName} src={c.learner.avatarUrl} size={48} />
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-bold text-ink-900">{c.learner.displayName}</h2>
                      {c.learner.ageBand && <p className="mt-0.5 text-sm text-ink-500">{AGE_BAND_LABEL[c.learner.ageBand]}</p>}
                    </div>
                  </div>
                  {stats && (
                    <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                      <span>
                        <Star className="mx-auto h-4 w-4 text-brand-500" aria-hidden />
                        <span className="mt-1 block font-display font-bold text-ink-900">{stats.level}</span>
                        <span className="block text-[11px] text-ink-400">{t('learner.level')}</span>
                      </span>
                      <span>
                        <Flame className="mx-auto h-4 w-4 text-brand-500" aria-hidden />
                        <span className="mt-1 block font-display font-bold text-ink-900">{stats.currentStreak}</span>
                        <span className="block text-[11px] text-ink-400">{t('learner.streak')}</span>
                      </span>
                      <span>
                        <CheckCircle2 className="mx-auto h-4 w-4 text-brand-500" aria-hidden />
                        <span className="mt-1 block font-display font-bold text-ink-900">{stats.proficientCount}</span>
                        <span className="block text-[11px] text-ink-400">{t('parent.proficientSkills')}</span>
                      </span>
                    </div>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
