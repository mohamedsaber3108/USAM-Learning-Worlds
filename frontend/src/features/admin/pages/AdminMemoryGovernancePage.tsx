import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Database } from 'lucide-react'
import { memoryGovernanceApi } from '@/lib/api/endpoints'

/**
 * Admin-only AI Memory Governance surface — visibility over
 * ConversationMessage / CharacterInteraction retention: per-purposeTag
 * volumes and how many rows are already past their retention window
 * (awaiting the next scheduled 03:00 purge). Backend
 * (`MemoryGovernanceService`, daily `@Cron` purge + `getStats()`) was
 * fully built but had zero frontend consumer — 23rd real instance of
 * the "backend built, frontend dead" bug documented across Ticks
 * 17-37. Read-only (the purge itself is scheduled, not admin-triggered
 * from the UI — matches the class of AdminSafetyPolicies/learner-model
 * read-only ops views).
 */

function fmt(n: number) {
  return n.toLocaleString()
}

export function AdminMemoryGovernancePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-memory-governance-stats'],
    queryFn: () => memoryGovernanceApi.getStats().then((r) => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2 mb-1">
        <Database className="w-6 h-6 text-indigo-500" /> AI Memory Governance
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Retention visibility over conversation and character-interaction data. A scheduled job
        purges rows past their retention window daily at 03:00 server time — this page is
        read-only.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && (
        <p className="text-red-500 text-sm">Failed to load stats (admin/moderator access required).</p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-3">
              <div className="text-xs text-slate-400 mb-1">Conversation messages</div>
              <div className="text-2xl font-bold text-slate-800">{fmt(data.totals.conversationMessages)}</div>
              <div className="text-xs text-amber-600 mt-1">
                {fmt(data.totals.conversationMessagesPastRetention)} past retention
              </div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-3">
              <div className="text-xs text-slate-400 mb-1">Character interactions</div>
              <div className="text-2xl font-bold text-slate-800">{fmt(data.totals.characterInteractions)}</div>
              <div className="text-xs text-amber-600 mt-1">
                {fmt(data.totals.characterInteractionsPastRetention)} past retention
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Conversation messages by purpose tag</h2>
            {data.conversationMessages.length === 0 && (
              <p className="text-slate-400 text-sm">No rows yet.</p>
            )}
            <div className="space-y-1">
              {data.conversationMessages.map((row) => (
                <div
                  key={row.purposeTag}
                  className="flex items-center justify-between bg-white rounded-lg border border-surface-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{row.purposeTag}</span>
                  <span className="text-slate-500">
                    {fmt(row.total)} total
                    {row.pastRetention > 0 && (
                      <span className="text-amber-600"> · {fmt(row.pastRetention)} past retention</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Character interactions by purpose tag</h2>
            {data.characterInteractions.length === 0 && (
              <p className="text-slate-400 text-sm">No rows yet.</p>
            )}
            <div className="space-y-1">
              {data.characterInteractions.map((row) => (
                <div
                  key={row.purposeTag}
                  className="flex items-center justify-between bg-white rounded-lg border border-surface-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{row.purposeTag}</span>
                  <span className="text-slate-500">
                    {fmt(row.total)} total
                    {row.pastRetention > 0 && (
                      <span className="text-amber-600"> · {fmt(row.pastRetention)} past retention</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Generated at {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
