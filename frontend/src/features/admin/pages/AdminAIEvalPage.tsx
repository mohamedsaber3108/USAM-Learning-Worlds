import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, CheckCircle2, XCircle } from 'lucide-react'
import { aiEvalApi } from '@/lib/api/endpoints'

/**
 * Admin-only AI Evaluation Harness history viewer — read-only surface over
 * AIEvalRun/AIEvalResult, populated by backend/scripts/run-ai-eval.ts (run
 * manually/via cron; this UI does not trigger a run). Lists past eval runs
 * with pass-rate/score trend, and lets an admin drill into one run's
 * per-case results (rubric breakdown, response text, error) to diagnose a
 * regression. Had zero frontend consumer despite a working backend — same
 * "backend built, frontend dead" bug class documented across Ticks 17-35
 * (20th real instance).
 *
 * Staff (ADMIN) gated server-side by RolesGuard. Follows the
 * AdminMisconceptionsPage plain-list pattern, with an added drill-down
 * detail panel for the per-case results.
 */
export function AdminAIEvalPage() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-ai-eval-runs'],
    queryFn: () => aiEvalApi.listRuns(50).then((r) => r.data.runs),
  })

  const {
    data: runDetail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuery({
    queryKey: ['admin-ai-eval-run', selectedRunId],
    queryFn: () => aiEvalApi.getRun(selectedRunId as string).then((r) => r.data),
    enabled: !!selectedRunId,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-cyan-600" /> AI Evaluation Harness
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        History of automated AI-response quality eval runs (run via{' '}
        <code className="bg-slate-50 px-1 rounded">backend/scripts/run-ai-eval.ts</code>), most recent
        first. Click a run to see its per-case results.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load eval runs (admin access required).</p>
      )}

      {data && (
        <div className="space-y-2 mb-6">
          {data.length === 0 && (
            <p className="text-slate-400 text-sm">
              No eval runs recorded yet — run <code className="bg-slate-50 px-1 rounded">run-ai-eval.ts</code>{' '}
              to populate history.
            </p>
          )}
          {data.map((run) => (
            <button
              key={run.id}
              onClick={() => setSelectedRunId(run.id)}
              className={`w-full text-left bg-white rounded-xl border px-4 py-3 text-sm transition-colors ${
                selectedRunId === run.id
                  ? 'border-cyan-400 ring-1 ring-cyan-200'
                  : 'border-surface-200 hover:border-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {run.datasetVersion || 'unversioned'} — {new Date(run.startedAt).toLocaleString()}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    run.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : run.status === 'FAILED'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {run.status}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-3">
                <span>
                  {run.passedCases}/{run.totalCases} passed ({(run.passRate * 100).toFixed(0)}%)
                </span>
                {run.averageScore != null && <span>avg score {run.averageScore.toFixed(2)}</span>}
                <span>{run.resultCount} cases</span>
              </div>
              {run.notes && <div className="text-xs text-slate-400 mt-1">{run.notes}</div>}
            </button>
          ))}
        </div>
      )}

      {selectedRunId && (
        <div className="border-t border-surface-200 pt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Run detail</h2>
          {detailLoading && <p className="text-slate-400 text-sm">Loading run...</p>}
          {!!detailError && <p className="text-red-500 text-sm">Failed to load run detail.</p>}
          {runDetail && (
            <div className="space-y-2">
              {runDetail.results.map((res) => (
                <div key={res.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-mono text-xs text-slate-600">{res.caseId}</span>
                    {res.score != null && (
                      <span className="text-xs text-slate-400 ml-auto">score {res.score.toFixed(2)}</span>
                    )}
                  </div>
                  {res.responseText && (
                    <div className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1 mt-1 whitespace-pre-wrap">
                      {res.responseText}
                    </div>
                  )}
                  {res.errorMessage && (
                    <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1">
                      {res.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
