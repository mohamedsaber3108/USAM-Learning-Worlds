import { Link } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { ArrowLeft, AlertTriangle, Check, CheckCheck } from 'lucide-react'
import { interventionsApi } from '@/lib/api/endpoints'

/**
 * Admin-only Intervention queue viewer — real frontend surface for the
 * Intervention Engine (backend `interventions/intervention.service.ts`,
 * real `InterventionRecommendation` rows created reactively right after
 * an activity submission whenever a genuine struggle pattern is
 * detected: 3 consecutive wrong attempts on the same competency, or 5+
 * attempts with mastery confidence still below 0.3). Had zero frontend
 * consumer — same "backend built, frontend dead" bug class documented
 * across Ticks 17-33 (18th real instance).
 *
 * Staff (ADMIN/MODERATOR) gated server-side by RolesGuard. Follows the
 * AdminAuditLogPage / AdminSafetyEscalationsPage plain-list + action-
 * button pattern.
 */
export function AdminInterventionsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-interventions-open'],
    queryFn: () => interventionsApi.listOpen(200).then((r) => r.data),
  })

  const acknowledge = useMutation({
    mutationFn: (id: string) => interventionsApi.acknowledge(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-interventions-open'] }),
  })

  const resolve = useMutation({
    mutationFn: (id: string) => interventionsApi.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-interventions-open'] }),
  })

  const triggerLabel = (t: string) =>
    t === 'CONSECUTIVE_WRONG_SAME_COMPETENCY' ? '3x wrong in a row' : 'Low mastery, repeated attempts'

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-amber-500" /> Intervention Queue
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Real-time struggle-pattern alerts (consecutive wrong answers, low mastery despite repeated
        practice). Staff access only.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load interventions (staff/admin access required).</p>
      )}

      {data && (
        <div className="space-y-2">
          {data.length === 0 && (
            <p className="text-slate-400 text-sm">No open interventions — nothing needs attention right now.</p>
          )}
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {item.learner?.displayName || item.learnerId} — {item.competency?.name || item.competencyId}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block mb-1">
                {triggerLabel(item.triggerType)}
              </div>
              <div className="text-xs text-slate-500 mb-1">{item.triggerDetail}</div>
              <div className="text-xs text-slate-700 font-medium mb-2">
                Recommended: {item.recommendedAction}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acknowledge.mutate(item.id)}
                  disabled={acknowledge.isPending}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-surface-200 hover:bg-surface-50"
                >
                  <Check className="w-3 h-3" /> Acknowledge
                </button>
                <button
                  onClick={() => resolve.mutate(item.id)}
                  disabled={resolve.isPending}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50"
                >
                  <CheckCheck className="w-3 h-3" /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
