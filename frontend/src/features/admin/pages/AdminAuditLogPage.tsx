import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { auditApi } from '@/lib/api/endpoints'

/**
 * Admin-only Audit Log viewer — real frontend surface for the Audit
 * Engine (backend `audit.controller.ts` / `audit-log.service.ts`, real
 * `AdminAuditLog` rows written at 3 sensitive mutation call sites:
 * guardian time-limit changes, community moderation review, learner
 * age-band changes) — had zero frontend consumer, same "backend built,
 * frontend dead" bug class documented across Ticks 17-31, instance #16.
 *
 * Read-only, staff (ADMIN/MODERATOR) gated server-side. Plain filterable
 * list, matches AdminAnalyticsPage/AdminFeatureFlagsPage's established
 * plain-list admin dashboard pattern.
 */
export function AdminAuditLogPage() {
  const [actionFilter, setActionFilter] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, targetTypeFilter],
    queryFn: () => {
      const params: { action?: string; targetType?: string; take: number } = { take: 100 }
      if (actionFilter) params.action = actionFilter
      if (targetTypeFilter) params.targetType = targetTypeFilter
      return auditApi.getLogs(params).then((r) => r.data)
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-primary-500" /> Audit Log
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Real before/after records for sensitive mutations (guardian time limits, moderation
        review, age-band changes). Read-only — staff access only.
      </p>

      <div className="flex gap-3 mb-4">
        <input
          className="border border-surface-200 rounded-lg px-3 py-2 text-sm flex-1"
          placeholder="Filter by action (e.g. TIME_LIMITS_UPDATED)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        />
        <input
          className="border border-surface-200 rounded-lg px-3 py-2 text-sm flex-1"
          placeholder="Filter by target type (e.g. Learner)"
          value={targetTypeFilter}
          onChange={(e) => setTargetTypeFilter(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load audit log (staff/admin access required).</p>
      )}

      {data && (
        <div className="space-y-2">
          {data.length === 0 && <p className="text-slate-400 text-sm">No matching audit entries.</p>}
          {data.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">{entry.action}</span>
                <span className="text-xs text-slate-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {entry.targetType} #{entry.targetId} — actor {entry.actorRole} ({entry.actorUserId})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
