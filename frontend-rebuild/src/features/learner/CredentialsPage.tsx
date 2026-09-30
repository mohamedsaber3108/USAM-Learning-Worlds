import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Award, ExternalLink } from 'lucide-react'
import { credentialsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card, PageHeader } from '@/components/ui'

interface Credential {
  id: string
  uid?: string
  title: string
  issuedAt?: string
}

/** Credentials wallet — real GET /api/credentials/me + public verify link. DS. */
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
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                <Award className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-3 font-display font-bold text-ink-900">{c.title}</h2>
              {c.issuedAt && <p className="mt-1 text-xs text-ink-400">{new Date(c.issuedAt).toLocaleDateString()}</p>}
              {c.uid && (
                <Link to={`/verify/${c.uid}`} className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
                  <ExternalLink className="h-4 w-4" aria-hidden /> Verify
                </Link>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
