import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { searchApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'

interface SearchResult {
  id: string
  type?: string
  title: string
}

/** Global search — real GET /api/search. query/loading/no-results/results with
 * keyboard-submittable input. */
export function SearchPage() {
  const { t } = useTranslation()
  const [term, setTerm] = useState('')
  const [submitted, setSubmitted] = useState('')

  const { data, isLoading, isError, refetch, isFetched } = useQuery({
    queryKey: ['search', submitted],
    queryFn: async () => (await searchApi.query(submitted)).data as SearchResult[],
    enabled: submitted.length > 0,
  })

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.search')} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(term.trim())
        }}
      >
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('learner.searchHint')}
          aria-label={t('learner.search')}
          className="w-full rounded-control border border-line px-4 py-3 focus-visible:border-brand-400"
        />
      </form>

      {submitted && isLoading && <LoadingState />}
      {submitted && isError && <ErrorState onRetry={() => void refetch()} />}
      {submitted && isFetched && data && data.length === 0 && <EmptyState title={t('learner.noResults')} />}
      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((r) => (
            <Card key={r.id}>
              <p className="font-medium text-ink-900">{r.title}</p>
              {r.type && <p className="text-xs text-ink-400">{r.type}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
