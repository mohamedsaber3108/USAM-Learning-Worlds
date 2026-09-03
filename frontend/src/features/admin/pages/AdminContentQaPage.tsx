import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, FileWarning, RefreshCw } from 'lucide-react'
import { contentQaApi, type ContentQAFlagType } from '@/lib/api/endpoints'

/**
 * Admin-only Content QA Engine surface — general content-completeness/
 * readability sweep over Activity and Mission rows (missing
 * description, content too thin, no age-band signal, zero AgeVariant
 * coverage). Distinct from the Assessment Quality Engine (question-item
 * structural review) and the Rubric system (human grading criteria).
 * Backend (`ContentQaService`, `ContentQaController`) was fully built
 * but had zero frontend consumer and no scheduled trigger — 22nd real
 * instance of the "backend built, frontend dead" bug documented across
 * Ticks 17-37. Follows the AdminAssessmentQualityPage pattern (list +
 * explicit "Run scan" trigger).
 */

const FLAG_LABELS: Record<ContentQAFlagType, string> = {
  MISSING_DESCRIPTION: 'Missing description',
  CONTENT_TOO_SHORT: 'Content too short',
  NO_AGE_BAND_SIGNAL: 'No age-band signal',
  ZERO_AGE_VARIANT_COVERAGE: 'Zero age-variant coverage',
}

const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-50 text-slate-600',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-rose-50 text-rose-700',
}

export function AdminContentQaPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-content-qa-flags'],
    queryFn: () => contentQaApi.listFlags().then((r) => r.data),
  })

  const scanMutation = useMutation({
    mutationFn: () => contentQaApi.scan().then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content-qa-flags'] })
    },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
          <FileWarning className="w-6 h-6 text-amber-500" /> Content QA
        </h1>
        <button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="inline-flex items-center gap-1 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
          {scanMutation.isPending ? 'Scanning...' : 'Run scan'}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Content-completeness sweep over Activity and Mission rows: missing/too-short
        descriptions, missing age-band signal, and zero AgeVariant coverage. Run scan to
        check all live content now.
      </p>

      {scanMutation.data && (
        <div className="mb-4 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          Scanned {scanMutation.data.activitiesScanned} activities +{' '}
          {scanMutation.data.missionsScanned} missions: {scanMutation.data.flagsFound} issue(s)
          found ({scanMutation.data.flagsCreated} new, {scanMutation.data.flagsAlreadyOpen} already
          open).
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
              No open quality flags — either the scan hasn't run yet, or all content passed
              review.
            </p>
          )}
          {data.map((flag) => (
            <div key={flag.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-xs ${SEVERITY_STYLES[flag.severity] ?? 'bg-slate-50 text-slate-600'}`}
                >
                  {FLAG_LABELS[flag.flagType] ?? flag.flagType} · {flag.entityType}
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
