import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BookOpen, RotateCcw } from 'lucide-react'
import { storiesApi, charactersApi, type StorySummary, type StoryDetail } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Button } from '@/components/ui'
import { CharacterStage } from '@/features/characters/CharacterStage'

/**
 * FIX (reverse-engineering/experience directive, 2026-10-07, §10/§17):
 * Stories is explicitly named in the directive's required companion-
 * integration list and was flagged ("do not let Stories exist as an
 * isolated forgotten page") — it had zero companion presence. English's
 * domain mentor fits naturally (stories are a reading-comprehension
 * mechanic framed under the English/Wordhaven world per this project's own
 * prior STORY_DOMAIN_SLUG decision), so this scopes orchestrate() to
 * domainSlug: 'english' rather than leaving it unscoped.
 */
export function StoriesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => (await storiesApi.list()).data as StorySummary[],
  })
  const companion = useQuery({
    queryKey: ['stories-companion'],
    queryFn: async () => (await charactersApi.orchestrate({ domainSlug: 'english' })).data,
    retry: false,
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {companion.data?.character && <CharacterStage characterId={companion.data.character.name} size={56} />}
        <PageHeader title={t('learner.stories')} />
      </div>
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((s) => (
            <Link key={s.id} to={`/app/stories/${s.id}`}>
              <Card className="h-full transition-transform duration-fast hover:-translate-y-0.5 hover:shadow-card">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-3 font-display font-bold text-ink-900">{s.title}</h2>
                {s.summary && <p className="mt-1 text-sm text-ink-500">{s.summary}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Story reader — walks the real branching paged narrative (GET
 * /stories/:id → pages[], each with text + choiceOptions). Previously this
 * read a nonexistent `body` field and rendered nothing of the real content.
 * Now: show the current page's text; branching pages render their real
 * choice buttons (each advancing to the chosen nextPageNumber); ending
 * pages (empty choiceOptions) offer restart. Path is tracked for a progress
 * breadcrumb. All real data, walked client-side as the backend intends
 * (the controller ships every page with the story).
 */
export function StoryReaderPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const [pageNumber, setPageNumber] = useState<number | null>(null)
  const [visited, setVisited] = useState<number[]>([])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => (await storiesApi.getById(id)).data as StoryDetail,
    enabled: Boolean(id),
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data || data.pages.length === 0) return <EmptyState />

  const pageByNumber = new Map(data.pages.map((p) => [p.pageNumber, p]))
  const firstPageNumber = data.pages[0].pageNumber
  const current = pageByNumber.get(pageNumber ?? firstPageNumber)
  if (!current) return <EmptyState />

  const choices = Array.isArray(current.choiceOptions) ? current.choiceOptions : []
  const isEnding = choices.length === 0

  function choose(next: number | null) {
    if (next == null) return
    setVisited((v) => [...(v.length === 0 ? [firstPageNumber] : v), next])
    setPageNumber(next)
  }
  function restart() {
    setPageNumber(null)
    setVisited([])
  }

  return (
    <article className="mx-auto max-w-2xl space-y-5">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">{data.title}</h1>

      {visited.length > 1 && (
        <div
          className="flex items-center gap-1.5"
          role="progressbar"
          aria-valuenow={visited.length}
          aria-label={t('learner.storyProgress', { page: visited.length })}
        >
          {visited.map((_, i) => (
            <span key={i} className="h-1.5 flex-1 rounded-pill bg-brand-300" aria-hidden />
          ))}
        </div>
      )}

      <Card>
        {/* a11y: announce the new page text when the learner advances —
            the content swaps in place, so without a live region a
            screen-reader user gets no signal the story moved on. */}
        <div className="whitespace-pre-wrap leading-relaxed text-ink-700" aria-live="polite">{current.text}</div>
        {isEnding ? (
          <Button className="mt-5" variant="secondary" onClick={restart}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t('learner.storyRestart')}
          </Button>
        ) : (
          <div className="mt-5 space-y-2">
            {choices.map((choice, i) => (
              <Button
                key={i}
                variant="secondary"
                className="w-full justify-start text-start"
                onClick={() => choose(choice.nextPageNumber)}
              >
                {choice.label}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </article>
  )
}
