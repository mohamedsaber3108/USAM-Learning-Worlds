import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Activity, Users, BarChart3 } from 'lucide-react'
import { analyticsApi } from '@/lib/api/endpoints'

/**
 * Admin-only Analytics dashboard — real frontend surface for the
 * Analytics Engine (backend `analytics.controller.ts` / `analytics.service.ts`
 * fully built with real aggregation over `learning_events` but had zero
 * frontend references — same "backend built, frontend dead" bug class
 * documented across Ticks 17-29, instance #14).
 *
 * Read-only overview: total events, active learners, events-by-type
 * breakdown, and a simple daily-activity table for the trailing 30 days.
 * Matches AdminFeatureFlagsPage/AdminQuestionTemplatesPage's established
 * plain-list admin dashboard pattern rather than pulling in a charting lib.
 */
export function AdminAnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => analyticsApi.getOverview(30).then((r) => r.data),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-2xl font-display font-bold text-slate-800 mb-1">Analytics Overview</h1>
      <p className="text-sm text-slate-500 mb-6">
        Trailing 30-day aggregate over real learning events. Read-only — no derived counters.
      </p>

      {isLoading && <p className="text-slate-400">Loading...</p>}
      {!!error && <p className="text-red-500 text-sm">Failed to load analytics (staff/admin access required).</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-4 flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary-500" />
              <div>
                <div className="text-2xl font-bold text-slate-800">{data.totalEvents}</div>
                <div className="text-xs text-slate-400">Total events ({data.rangeDays}d)</div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-success-500" />
              <div>
                <div className="text-2xl font-bold text-slate-800">{data.activeLearners}</div>
                <div className="text-xs text-slate-400">Active learners ({data.rangeDays}d)</div>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <BarChart3 className="w-4 h-4" /> Events by type
          </h2>
          <div className="space-y-2 mb-6">
            {data.eventsByType.length === 0 && <p className="text-slate-400 text-sm">No events in range.</p>}
            {data.eventsByType.map((row) => (
              <div key={row.type} className="flex items-center justify-between bg-white rounded-lg border border-surface-200 px-3 py-2 text-sm">
                <span className="text-slate-600">{row.type}</span>
                <span className="font-semibold text-slate-800">{row.count}</span>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-2">Daily activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-xl border border-surface-200">
              <thead>
                <tr className="text-start text-slate-400 text-xs">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Active learners</th>
                  <th className="px-3 py-2">Total events</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyActivity.length === 0 && (
                  <tr><td colSpan={3} className="px-3 py-3 text-slate-400">No data in range.</td></tr>
                )}
                {data.dailyActivity.map((row) => (
                  <tr key={row.date} className="border-t border-surface-100">
                    <td className="px-3 py-2 text-slate-600">{row.date}</td>
                    <td className="px-3 py-2 text-slate-800">{row.activeLearners}</td>
                    <td className="px-3 py-2 text-slate-800">{row.totalEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
