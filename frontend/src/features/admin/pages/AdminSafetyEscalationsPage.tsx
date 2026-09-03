import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ShieldAlert, UserCheck, CheckCircle2 } from 'lucide-react'
import { safetyEscalationApi, type SafetyEscalationStatus } from '@/lib/api/endpoints'

/**
 * Staff (MODERATOR/ADMIN) queue for the Safety Escalation Engine —
 * real frontend surface for backend `safety-escalation.controller.ts`
 * (real `SafetyEscalation` rows created by `CharacterSafetyService.
 * evaluateSafety()` whenever it resolves to `escalation_required`).
 * Had zero frontend consumer — same "backend built, frontend dead"
 * bug class documented across Ticks 17-32, instance #17 — and the
 * most safety-critical one so far: without this page, escalated child
 * safety events had no human-workable queue at all.
 *
 * Default view filters to OPEN + IN_PROGRESS (the actionable subset);
 * a status selector lets staff pull full history including RESOLVED.
 * Matches AdminAuditLogPage's plain-list admin dashboard pattern.
 */
export function AdminSafetyEscalationsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<SafetyEscalationStatus | ''>('OPEN')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-safety-escalations', statusFilter],
    queryFn: () =>
      safetyEscalationApi.list(statusFilter || undefined).then((r) => r.data),
  })

  const assignMutation = useMutation({
    mutationFn: (id: string) => safetyEscalationApi.assign(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-safety-escalations'] }),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => safetyEscalationApi.resolve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-safety-escalations'] }),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <ShieldAlert className="w-6 h-6 text-red-500" /> Safety Escalations
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Real character-safety events flagged for human review. Claim an item to work it, then
        mark it resolved once handled. Staff (moderator/admin) access only.
      </p>

      <div className="flex gap-2 mb-4">
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED', ''] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              statusFilter === s
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-slate-600 border-surface-200'
            }`}
          >
            {s || 'ALL'}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load escalations (staff access required).</p>
      )}

      {data && (
        <div className="space-y-3">
          {data.length === 0 && (
            <p className="text-slate-400 text-sm">No escalations matching this filter.</p>
          )}
          {data.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    entry.status === 'OPEN'
                      ? 'bg-red-100 text-red-700'
                      : entry.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {entry.status}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="font-semibold text-slate-800">{entry.triggerReason}</div>
              <div className="text-xs text-slate-500 mb-2">
                safetyState: {entry.safetyState} — learner{' '}
                {entry.learner?.displayName || entry.learner?.firstName || entry.learnerId}
                {entry.learner?.ageBand ? ` (${entry.learner.ageBand})` : ''}
                {entry.assignedTo ? ` — assigned to ${entry.assignedTo}` : ''}
              </div>
              {entry.status !== 'RESOLVED' && (
                <div className="flex gap-2">
                  {entry.status === 'OPEN' && (
                    <button
                      onClick={() => assignMutation.mutate(entry.id)}
                      disabled={assignMutation.isPending}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-surface-200 text-slate-600 hover:bg-surface-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Claim
                    </button>
                  )}
                  <button
                    onClick={() => resolveMutation.mutate(entry.id)}
                    disabled={resolveMutation.isPending}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
