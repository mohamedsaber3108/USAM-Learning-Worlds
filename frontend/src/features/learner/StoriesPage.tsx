import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { storiesApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface Story {
  id: string
  title: string
  summary?: string
  body?: string
}

export function StoriesPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => (await storiesApi.list()).data as Story[],
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.stories')} />
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

export function StoryReaderPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => (await storiesApi.getById(id)).data as Story,
    enabled: Boolean(id),
  })
  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-2xl font-extrabold text-ink-900">{data.title}</h1>
      {data.body && <div className="whitespace-pre-wrap leading-relaxed text-ink-700">{data.body}</div>}
    </article>
  )
}
