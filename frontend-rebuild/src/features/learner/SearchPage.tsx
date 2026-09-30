import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search as SearchIcon } from 'lucide-react'
import { searchApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader, Input } from '@/components/ui'

interface SearchResult {
  id: string
  type?: string
  title: string
}

/** Global search — real GET /api/search. query/loading/no-results/results. DS. */
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
        <Input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('learner.searchHint')}
          aria-label={t('learner.search')}
        />
      </form>

      {submitted && isLoading && <LoadingState />}
      {submitted && isError && <ErrorState onRetry={() => void refetch()} />}
      {submitted && isFetched && data && data.length === 0 && <EmptyState title={t('learner.noResults')} />}
      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((r) => (
            <Card key={r.id} className="flex items-center gap-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink-900">{r.title}</span>
                {r.type && <span className="block text-xs text-ink-400">{r.type}</span>}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
