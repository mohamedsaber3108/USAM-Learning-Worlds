import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { credentialsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface VerifiedCredential {
  title: string
  learnerDisplayName?: string
  issuedAt?: string
  valid?: boolean
}

/** Public credential verification (no auth) — GET /api/credentials/:uid. */
export function VerifyCredentialPage() {
  const { t } = useTranslation()
  const { uid = '' } = useParams<{ uid: string }>()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['verify', uid],
    queryFn: async () => (await credentialsApi.verify(uid)).data as VerifiedCredential,
    enabled: Boolean(uid),
    retry: false,
  })

  return (
    <div className="min-h-screen bg-canvas-white">
      <header className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <Link to="/" className="font-display text-xl font-extrabold text-brand-700">USAM</Link>
      </header>
      <main className="mx-auto max-w-lg px-4 py-16">
        {isLoading && <LoadingState />}
        {isError && <ErrorState message={t('states.notFound')} onRetry={() => void refetch()} />}
        {data && (
          <Card>
            <Badge tone={data.valid === false ? 'error' : 'success'}>
              {data.valid === false ? 'Invalid' : 'Verified'}
            </Badge>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">{data.title}</h1>
            {data.learnerDisplayName && <p className="mt-1 text-ink-600">{data.learnerDisplayName}</p>}
            {data.issuedAt && <p className="mt-1 text-xs text-ink-400">{new Date(data.issuedAt).toLocaleDateString()}</p>}
          </Card>
        )}
        {!isLoading && !isError && !data && <EmptyState title={t('states.notFound')} />}
      </main>
    </div>
  )
}
