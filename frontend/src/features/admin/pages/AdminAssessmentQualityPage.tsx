import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ShieldAlert, RefreshCw } from 'lucide-react'
import { assessmentQualityApi, type AssessmentQualityFlagType } from '@/lib/api/endpoints'

/**
 * Admin-only Assessment Quality Engine surface — rule-based structural
 * review of SELECT/MATCH/SEQUENCE activity question items (no correct
 * answer, correct answer missing from options, too few/duplicate options,
 * all options marked correct). Backend (`AssessmentQualityService`,
 * `AdminAssessmentQualityController`) was fully built but had zero
 * frontend consumer and no scheduled trigger — same "backend built,
 * frontend dead" bug class documented across Ticks 17-36 (21st real
 * instance). Follows the AdminMisconceptionsPage plain-list pattern, with
 * an added "Run scan" action since — unlike misconceptions, which record
 * reactively — this engine only finds anything when explicitly triggered.
 */

const FLAG_LABELS: Record<AssessmentQualityFlagType, string> = {
  NO_CORRECT_ANSWER: 'No correct answer',
  CORRECT_ANSWER_NOT_IN_OPTIONS: 'Correct answer not in options',
  TOO_FEW_OPTIONS: 'Too few options',
  DUPLICATE_OPTIONS: 'Duplicate options',
  ALL_OPTIONS_CORRECT: 'All options marked correct',
}

export function AdminAssessmentQualityPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-assessment-quality-flags'],
    queryFn: () => assessmentQualityApi.listFlags().then((r) => r.data),
  })

  const scanMutation = useMutation({
    mutationFn: () => assessmentQualityApi.scan().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-assessment-quality-flags'] })
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" /> Assessment Quality
        </h1>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="inline-flex items-center gap-1 text-sm bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
          {scanMutation.isPending ? 'Scanning...' : 'Run scan'}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Structural review of question items (SELECT/MATCH/SEQUENCE activities): broken answer
        keys, degenerate option sets, and other authoring defects caught before they reach
        learners. Run scan to check all active activities now.
      </p>

      {scanMutation.data && (
        <div className="mb-4 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          Scanned {scanMutation.data.activitiesScanned} activities: {scanMutation.data.flagsFound}{' '}
          issue(s) found ({scanMutation.data.flagsCreated} new,{' '}
          {scanMutation.data.flagsAlreadyOpen} already open,{' '}
          {scanMutation.data.flagsAutoResolved} auto-resolved as fixed).
        </div>
      )}
      {scanMutation.isError && (
        <p className="text-red-500 text-sm mb-4">Scan failed (admin access required).</p>
      )}

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load flags (admin access required).</p>
      )}

      {data && (
        <div className="space-y-2">
          {data.length === 0 && (
            <p className="text-slate-400 text-sm">
              No open quality flags — either the scan hasn't run yet, or every question item
              passed structural review.
            </p>
          )}
          {data.map((flag) => (
            <div key={flag.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs">
                  {FLAG_LABELS[flag.flagType] ?? flag.flagType}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(flag.detectedAt).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-600">{flag.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
