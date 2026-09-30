import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { credentialsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui/Card'

interface Credential {
  id: string
  uid?: string
  title: string
  issuedAt?: string
}

/** Credentials wallet — real GET /api/credentials/me. Each credential can be
 * shared via its public verify URL (/verify/:uid). */
export function CredentialsPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['credentials-mine'],
    queryFn: async () => (await credentialsApi.mine()).data as Credential[],
  })

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title={t('learner.credentials')} />
      {!data || data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <Card key={c.id}>
              <h2 className="font-display font-bold text-ink-900">{c.title}</h2>
              {c.uid && (
                <a href={`/verify/${c.uid}`} className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                  {t('common.search')} →
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
