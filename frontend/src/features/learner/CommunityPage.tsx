import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Flag, Flame, Users } from 'lucide-react'
import { communityApi, type CommunityFeedItem } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, SectionHeader, Input, useToast } from '@/components/ui'

/**
 * FIX (reconciliation audit, 2026-10-02): confirmed LIVE via an authenticated
 * Playwright run against production — this page threw `a.map is not a
 * function` on real navigation (console error, blank feed). Two real
 * contract bugs, both fixed in lib/api/endpoints.ts's communityApi:
 * 1) GET /community/feed returns `{ projects, total }`, not a bare array.
 * 2) POST /community/report's real DTO wants entityType/entityId/reason
 *    (specific enum values), not targetType/targetId/lowercase reason —
 *    every report attempt was silently 400ing before this fix.
 *
 * FIX (reconciliation audit, round 2, 2026-10-02): `GET /community/trending`,
 * `/community/search`, `/community/stats` were real, live, backend-wired
 * routes with client wrappers that had zero callers (tracked as a known gap
 * in ledger 88 for months). Added a stats strip, a real search box, and a
 * Trending section below the main feed — all using the actual response
 * shapes (trending/search both return the same Project+learner shape as the
 * feed; stats is a flat 3-number object).
 *
 * Community feed (safe, moderated — shows showcased PUBLIC projects).
 * Real GET /community/feed + /trending + /search + /stats + POST /report. DS.
 */
export function CommunityPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [query, setQuery] = useState('')

  const feed = useQuery({
    queryKey: ['community-feed'],
    queryFn: async () => (await communityApi.feed()).data,
  })
  const stats = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => (await communityApi.stats()).data,
    retry: false,
  })
  const trending = useQuery({
    queryKey: ['community-trending'],
    queryFn: async () => (await communityApi.trending(6)).data,
    retry: false,
  })
  const search = useQuery({
    queryKey: ['community-search', query],
    queryFn: async () => (await communityApi.search(query)).data,
    enabled: query.trim().length > 0,
    retry: false,
  })

  async function report(id: string) {
    try {
      await communityApi.report({ entityType: 'PROJECT', entityId: id, reason: 'INAPPROPRIATE' })
      toast.show(t('learner.report'), 'success')
    } catch {
      toast.show(t('states.error'), 'error')
    }
  }

  function ProjectCard({ item }: { item: CommunityFeedItem }) {
    return (
      <Card>
        <p className="font-display font-bold text-ink-900">{item.title}</p>
        {item.description && <p className="mt-1 text-sm text-ink-600">{item.description}</p>}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-ink-400">{item.learner.displayName}</span>
          <button
            onClick={() => report(item.id)}
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-error-700"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            {t('learner.report')}
          </button>
        </div>
      </Card>
    )
  }

  if (feed.isLoading) return <LoadingState />
  if (feed.isError) return <ErrorState onRetry={() => void feed.refetch()} />

  const items = feed.data?.projects ?? []
  const searchActive = query.trim().length > 0
  const searchResults = search.data?.results ?? []

  return (
    <div className="space-y-8">
      <PageHeader title={t('learner.community')} />

      {stats.data && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <Users className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-ink-900">{stats.data.totalLearners}</p>
              <p className="text-xs text-ink-500">Learners</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <Flame className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-ink-900">{stats.data.totalProjects}</p>
              <p className="text-xs text-ink-500">Showcased projects</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <Flame className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-display text-xl font-extrabold text-ink-900">{stats.data.recentProjects}</p>
              <p className="text-xs text-ink-500">New this week</p>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-sm">
        <Input
          aria-label={t('learner.searchHint')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('learner.searchHint')}
        />
      </div>

      {searchActive ? (
        <section>
          <SectionHeader title={t('learner.search')} />
          {search.isLoading ? (
            <LoadingState />
          ) : searchResults.length === 0 ? (
            <EmptyState title={t('learner.noResults')} />
          ) : (
            <div className="space-y-3">
              {searchResults.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {trending.data && trending.data.length > 0 && (
            <section>
              <SectionHeader title="Trending" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {trending.data.map((item) => (
                  <ProjectCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader title={t('learner.community')} />
            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <ProjectCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
