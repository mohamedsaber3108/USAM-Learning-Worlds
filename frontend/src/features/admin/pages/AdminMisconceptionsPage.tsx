import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Brain, Flame } from 'lucide-react'
import { misconceptionsApi } from '@/lib/api/endpoints'

/**
 * Admin-only Misconception Engine overview — real frontend surface over
 * `MisconceptionPattern` rows, created reactively by
 * `MisconceptionService.recordWrongAnswer()` right after a wrong-answer
 * evaluation (see backend/src/modules/misconceptions/). Shows the most
 * frequent wrong-answer patterns platform-wide, labeled (human-named
 * misconception) or unlabeled-but-confirmed-recurring (3+ occurrences),
 * so a curriculum admin can see what learners actually get wrong instead
 * of just pass/fail rates. Had zero frontend consumer — same
 * "backend built, frontend dead" bug class documented across Ticks
 * 17-34 (19th real instance).
 *
 * Staff (ADMIN) gated server-side by RolesGuard. Follows the
 * AdminAuditLogPage / AdminInterventionsPage plain-list pattern
 * (read-only here — no action buttons, since there's no state machine
 * to advance, just visibility).
 */
export function AdminMisconceptionsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-misconceptions-top'],
    queryFn: () => misconceptionsApi.listTop(100).then((r) => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <Brain className="w-6 h-6 text-violet-500" /> Misconception Patterns
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Most frequent wrong-answer patterns across all questions and activities, most common
        first. Labeled patterns show a human-written explanation; unlabeled patterns that recur 3+
        times are flagged as confirmed-recurring and worth naming.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load misconceptions (admin access required).</p>
      )}

      {data && (
        <div className="space-y-2">
          {data.length === 0 && (
            <p className="text-slate-400 text-sm">
              No misconception patterns recorded yet — nothing to review.
            </p>
          )}
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {item.activity?.title || item.questionTemplate?.stem || 'Unlinked pattern'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" /> ×{item.frequencyCount}
                </span>
              </div>
              <div className="text-xs text-slate-600 mb-1">
                Wrong answer: <span className="font-mono bg-slate-50 px-1 rounded">{item.wrongAnswerValue}</span>
              </div>
              {item.isLabeled && item.description && (
                <div className="text-xs text-violet-700 bg-violet-50 rounded px-2 py-1 inline-block">
                  {item.description}
                </div>
              )}
              {!item.isLabeled && item.isConfirmedRecurring && (
                <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block">
                  Confirmed recurring — not yet named by a human
                </div>
              )}
              {!item.isLabeled && !item.isConfirmedRecurring && (
                <div className="text-xs text-slate-400">Unlabeled, low frequency so far</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
