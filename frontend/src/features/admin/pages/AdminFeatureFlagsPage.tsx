import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ToggleLeft, ToggleRight } from 'lucide-react'
import { featureFlagsApi } from '@/lib/api/endpoints'

/**
 * Admin-only Feature Flag toggle UI — real frontend surface for the
 * Feature Flag Engine (backend `feature-flag.controller.ts` /
 * `feature-flag.service.ts` fully built with a real `streak_freeze_shop`
 * consumer in gamification but had zero frontend references — same
 * "backend built, frontend dead" bug class, instance #11).
 *
 * ADMIN-only global on/off toggle (matches the backend's simple
 * global/learner-allow-list model — no % rollout UI since the backend
 * doesn't support that yet either).
 */
export function AdminFeatureFlagsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: () => featureFlagsApi.list().then((r) => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ key, isEnabledGlobally }: { key: string; isEnabledGlobally: boolean }) =>
      featureFlagsApi.toggle(key, isEnabledGlobally),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] }),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1">Feature Flags</h1>
      <p className="text-sm text-slate-500 mb-6">
        Global on/off switches for gated features. Learner-specific overrides are managed via the API only.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-slate-400">No feature flags defined yet.</p>
      )}

      <div className="space-y-3">
        {data?.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between bg-white rounded-xl border border-surface-200 px-4 py-3"
          >
            <div>
              <div className="font-semibold text-slate-700 text-sm">{flag.key}</div>
              {flag.description && <div className="text-xs text-slate-400">{flag.description}</div>}
            </div>
            <button
              onClick={() =>
                toggleMutation.mutate({ key: flag.key, isEnabledGlobally: !flag.isEnabledGlobally })
              }
              aria-label={`Toggle ${flag.key}`}
              className="shrink-0"
            >
              {flag.isEnabledGlobally ? (
                <ToggleRight className="w-9 h-9 text-success-500" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-slate-300" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
