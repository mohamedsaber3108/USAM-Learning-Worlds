import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { safetyPolicyApi, type AgeBandKey } from '@/lib/api/endpoints'

/**
 * Admin-only Safety Policy history viewer — real frontend surface for
 * the Safety Policy Engine (backend `admin-safety-policy.controller.ts`
 * / `safety-policy.service.ts`), a versioned/auditable per-ageBand
 * `SafetyPolicy` table that `moderation.service.ts` /
 * `character-safety.service.ts` resolve against (falling back to inline
 * defaults if a row is missing — safety paths never hard-fail). Had zero
 * frontend consumer despite being a real audit-trail surface — same
 * "backend built, frontend dead" bug class as the Audit Log and
 * Experimentation engines.
 *
 * Read-only, matches the controller: there is no create/edit endpoint
 * server-side (policy authoring today is via seed scripts), so this page
 * only lists policy versions per age band and highlights the active one.
 */
const AGE_BANDS: AgeBandKey[] = ['AGE_8_9', 'AGE_10_11', 'AGE_12_14']

export function AdminSafetyPolicyPage() {
  const [ageBandFilter, setAgeBandFilter] = useState<AgeBandKey | ''>('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-safety-policies', ageBandFilter],
    queryFn: () => safetyPolicyApi.list(ageBandFilter || undefined).then((r) => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-primary-500" /> Safety Policies
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Versioned per-age-band safety rule sets that moderation and character-safety checks
        resolve against. Read-only — staff/ADMIN access only. Authoring is via seed scripts today.
      </p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAgeBandFilter('')}
          className={`text-xs rounded-full px-3 py-1.5 border ${
            ageBandFilter === '' ? 'bg-primary-500 text-white border-primary-500' : 'border-surface-200 text-slate-600'
          }`}
        >
          All bands
        </button>
        {AGE_BANDS.map((band) => (
          <button
            key={band}
            onClick={() => setAgeBandFilter(band)}
            className={`text-xs rounded-full px-3 py-1.5 border ${
              ageBandFilter === band
                ? 'bg-primary-500 text-white border-primary-500'
                : 'border-surface-200 text-slate-600'
            }`}
          >
            {band}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load safety policies (ADMIN access required).</p>
      )}

      {data && (
        <div className="space-y-2">
          {data.length === 0 && <p className="text-slate-400 text-sm">No safety policy versions found.</p>}
          {data.map((policy) => (
            <div key={policy.id} className="bg-white rounded-xl border border-surface-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">
                  {policy.ageBand} — v{policy.policyVersion}
                </span>
                <div className="flex items-center gap-2">
                  {policy.isActive && (
                    <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-success-50 text-success-600">
                      ACTIVE
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(policy.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <pre className="text-xs text-slate-500 whitespace-pre-wrap bg-surface-50 rounded-lg p-2 mt-1">
                {JSON.stringify(policy.rules, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
