import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { parentsApi } from '@/lib/api/endpoints'

/**
 * Time-limits settings for a single child.
 * Backed by POST /parents/children/:learnerId/time-limits
 * (backend/src/modules/parents/parents.service.ts#setTimeLimits,
 *  DTO: backend/src/modules/parents/dto/parents.dto.ts SetTimeLimitsDto)
 *
 * Note: the backend does not currently expose a GET for the saved limits —
 * they're stored on Learner.preferences.timeLimits but there's no read route.
 * This form is therefore write-only until a GET is added (see report followups).
 */
export function ParentTimeLimitsPage() {
  const { learnerId } = useParams<{ learnerId: string }>()
  const queryClient = useQueryClient()

  const [dailyMinutes, setDailyMinutes] = useState<number | ''>('')
  const [weeklyMinutes, setWeeklyMinutes] = useState<number | ''>('')
  const [bedtimeHour, setBedtimeHour] = useState<number | ''>('')

  const { data: children } = useQuery({
    queryKey: ['parents-children'],
    queryFn: () => parentsApi.getChildren().then(res => res.data),
  })

  const child = children?.find((c: any) => c.learner.id === learnerId)

  const mutation = useMutation({
    mutationFn: () => {
      const payload: { dailyMinutes?: number; weeklyMinutes?: number; bedtimeHour?: number } = {}
      if (dailyMinutes !== '') payload.dailyMinutes = Number(dailyMinutes)
      if (weeklyMinutes !== '') payload.weeklyMinutes = Number(weeklyMinutes)
      if (bedtimeHour !== '') payload.bedtimeHour = Number(bedtimeHour)
      return parentsApi.setTimeLimits(learnerId as string, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents-children'] })
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 shadow-pop">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-heading font-extrabold text-white drop-shadow-sm">
            ⏱️ Time Limits
          </h1>
          <Link
            to="/parents"
            className="btn bg-white/90 text-primary-700 hover:bg-white shadow-none"
          >
            ← Back to Parent Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-6">
          <h2 className="text-xl font-heading font-bold mb-1">
            {child?.learner.displayName || 'Child'}
          </h2>
          <p className="text-gray-600 text-sm">
            Set daily/weekly learning time limits and a bedtime cutoff hour.
          </p>
        </div>

        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Daily limit (minutes, 0–480)
            </label>
            <input
              type="number"
              min={0}
              max={480}
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              className="input w-full"
              placeholder="e.g. 60"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Weekly limit (minutes, 0–2000)
            </label>
            <input
              type="number"
              min={0}
              max={2000}
              value={weeklyMinutes}
              onChange={(e) => setWeeklyMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              className="input w-full"
              placeholder="e.g. 300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bedtime hour (0–23, 24h clock)
            </label>
            <input
              type="number"
              min={0}
              max={23}
              value={bedtimeHour}
              onChange={(e) => setBedtimeHour(e.target.value === '' ? '' : Number(e.target.value))}
              className="input w-full"
              placeholder="e.g. 20"
            />
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !learnerId}
            className="btn bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save Time Limits'}
          </button>

          {mutation.isSuccess && (
            <p className="text-success-600 text-sm font-semibold">✅ Time limits saved.</p>
          )}
          {mutation.isError && (
            <p className="text-danger-600 text-sm font-semibold">
              ❌ Failed to save: {(mutation.error as any)?.response?.data?.message || 'unknown error'}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
