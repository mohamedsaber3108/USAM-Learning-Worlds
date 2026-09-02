import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Timer, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
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
    <div className="parent-shell">
      <header className="parent-topbar">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" strokeWidth={2} />
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
              Screen Time Controls
            </h1>
            <span className="parent-badge">Parent View</span>
          </div>
          <Link
            to="/parents"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to overview
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="parent-panel mb-5">
          <div className="parent-panel-header">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
              <Timer className="w-4 h-4 text-indigo-500" strokeWidth={2} />
              {child?.learner.displayName || 'Child'}
            </span>
          </div>
          <p className="text-slate-500 text-xs px-4 py-3">
            Set daily/weekly learning time limits and a bedtime cutoff hour. Limits are
            enforced on this account's next session start.
          </p>
        </div>

        <div className="parent-panel">
          <div className="parent-panel-header">
            <span className="parent-section-label mb-0">Limit Settings</span>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Daily limit
                <span className="text-slate-400 font-normal"> — minutes, 0–480</span>
              </label>
              <input
                type="number"
                min={0}
                max={480}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                className="parent-input"
                placeholder="e.g. 60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Weekly limit
                <span className="text-slate-400 font-normal"> — minutes, 0–2000</span>
              </label>
              <input
                type="number"
                min={0}
                max={2000}
                value={weeklyMinutes}
                onChange={(e) => setWeeklyMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                className="parent-input"
                placeholder="e.g. 300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bedtime cutoff hour
                <span className="text-slate-400 font-normal"> — 0–23, 24h clock</span>
              </label>
              <input
                type="number"
                min={0}
                max={23}
                value={bedtimeHour}
                onChange={(e) => setBedtimeHour(e.target.value === '' ? '' : Number(e.target.value))}
                className="parent-input"
                placeholder="e.g. 20"
              />
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-3">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !learnerId}
              className="parent-btn-primary"
            >
              {mutation.isPending ? 'Saving…' : 'Save Time Limits'}
            </button>

            {mutation.isSuccess && (
              <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                Saved
              </p>
            )}
            {mutation.isError && (
              <p className="flex items-center gap-1.5 text-rose-600 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Failed: {(mutation.error as any)?.response?.data?.message || 'unknown error'}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
