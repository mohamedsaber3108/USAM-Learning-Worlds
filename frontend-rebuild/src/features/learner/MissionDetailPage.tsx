import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'
import { missionsApi } from '@/lib/api/endpoints'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States'
import { Button } from '@/components/ui/Button'

interface Mission {
  id: string
  title: string
  description?: string
}

/** Mission detail → start. Handles the entitlement cap (403 missionsPerDay) as
 * an honest locked state, not a crash. */
export function MissionDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const [starting, setStarting] = useState(false)
  const [capped, setCapped] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mission', id],
    queryFn: async () => (await missionsApi.getById(id)).data as Mission,
    enabled: Boolean(id),
  })

  async function start() {
    setStarting(true)
    setCapped(null)
    try {
      const run = (await missionsApi.start(id)).data as { id: string }
      navigate(`/app/runs/${run.id}`)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 403) {
        setCapped((err.response.data as { message?: string })?.message ?? 'Daily limit reached.')
      } else {
        setCapped(t('states.error'))
      }
    } finally {
      setStarting(false)
    }
  }

  if (isLoading) return <LoadingState />
  if (isError) return <ErrorState onRetry={() => void refetch()} />
  if (!data) return <EmptyState />

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-card border border-line bg-white p-6 shadow-soft">
        <h1 className="font-display text-2xl font-bold text-ink-900">{data.title}</h1>
        {data.description && <p className="mt-2 text-ink-600">{data.description}</p>}
        <Button className="mt-6" size="lg" loading={starting} onClick={start}>
          {t('learner.startMission')}
        </Button>
        {capped && (
          <p role="alert" className="mt-4 rounded-control bg-warning-100 px-3 py-2 text-sm text-warning-700">
            {capped}
          </p>
        )}
      </div>
    </div>
  )
}
