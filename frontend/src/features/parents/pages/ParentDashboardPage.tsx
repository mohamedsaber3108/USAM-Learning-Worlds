import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Users2, Timer, BarChart3, BookOpenCheck, CalendarRange, CheckCircle2, XCircle } from 'lucide-react'
import { parentsApi } from '@/lib/api/endpoints'

interface ChildLink {
  relationshipId: string
  learner: {
    id: string
    userId: string
    displayName: string
    ageBand: string
    avatarUrl: string | null
    status: string
  }
  relationship: string
  status: string
  linkedAt: string
}

export function ParentDashboardPage() {
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(null)

  // Real endpoint: GET /parents/children
  const { data: children, isLoading: childrenLoading, error: childrenError } = useQuery<ChildLink[]>({
    queryKey: ['parents-children'],
    queryFn: () => parentsApi.getChildren().then(res => res.data),
  })

  const activeChild = selectedLearnerId
    ? children?.find((c) => c.learner.id === selectedLearnerId)
    : children?.[0]

  const learnerId = activeChild?.learner.id

  // Real endpoint: GET /parents/children/:learnerId/dashboard
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['parent-child-dashboard', learnerId],
    queryFn: () => parentsApi.getChildDashboard(learnerId as string).then(res => res.data),
    enabled: !!learnerId,
  })

  // Real endpoint: GET /parents/children/:learnerId/activity?days=7
  const { data: activity } = useQuery({
    queryKey: ['parent-child-activity', learnerId],
    queryFn: () => parentsApi.getChildActivity(learnerId as string, { days: 7 }).then(res => res.data),
    enabled: !!learnerId,
  })

  const isForbidden = (childrenError as any)?.response?.status === 403

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header — one solid brand color, no rainbow gradient */}
      <header className="bg-primary-600 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Users2 className="w-5 h-5" strokeWidth={2} />
            Parent Dashboard
          </h1>
          <Link
            to="/dashboard"
            className="btn bg-white/10 text-white hover:bg-white/20 shadow-none focus:ring-white/40"
          >
            Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isForbidden && (
          <div className="card bg-warning-50 border border-warning-200 mb-6">
            <p className="text-warning-900 font-semibold">
              This account isn't linked as a guardian, so the Parent Dashboard has no
              children to show. Log in with a guardian/parent account to view child
              progress here.
            </p>
          </div>
        )}

        {childrenLoading && <p className="text-slate-600">Loading children…</p>}

        {!childrenLoading && !isForbidden && children && children.length === 0 && (
          <div className="card">
            <p className="text-slate-600">No children are linked to this guardian account yet.</p>
          </div>
        )}

        {children && children.length > 0 && (
          <>
            {/* Child selector */}
            {children.length > 1 && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {children.map((c) => (
                  <button
                    key={c.learner.id}
                    onClick={() => setSelectedLearnerId(c.learner.id)}
                    className={`px-4 py-2 rounded-control font-semibold text-sm transition-colors ${
                      c.learner.id === learnerId
                        ? 'bg-primary-600 text-white shadow-soft'
                        : 'bg-white text-slate-700 border border-surface-200 hover:bg-primary-50'
                    }`}
                  >
                    {c.learner.displayName}
                  </button>
                ))}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">
                {activeChild?.learner.displayName || 'Child'}'s Progress
              </h2>
              <p className="text-slate-500 text-sm">
                Age band: {activeChild?.learner.ageBand} · Status: {activeChild?.learner.status}
              </p>
              <Link
                to={`/parents/children/${learnerId}/time-limits`}
                className="inline-flex items-center gap-1.5 mt-3 text-primary-600 hover:text-primary-800 font-semibold text-sm"
              >
                <Timer className="w-4 h-4" strokeWidth={2} />
                Manage Time Limits →
              </Link>
            </motion.div>

            {dashboardLoading && <p className="text-slate-600">Loading dashboard…</p>}

            {dashboard && (
              <>
                {/* Stats Grid — icon-chip + tint per card, not full gradient blocks */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                  <div className="stat-card">
                    <p className="text-xs font-medium text-slate-500 mb-1">Level</p>
                    <p className="text-3xl font-display font-extrabold text-slate-900">
                      {dashboard.progression?.level ?? 1}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {dashboard.progression?.totalXP?.toLocaleString() ?? 0} XP
                    </p>
                  </div>

                  <div className="stat-card">
                    <p className="text-xs font-medium text-slate-500 mb-1">Current Streak</p>
                    <p className="text-3xl font-display font-extrabold text-slate-900">
                      {dashboard.streak?.current ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Best: {dashboard.streak?.longest ?? 0} days
                    </p>
                  </div>

                  <div className="stat-card">
                    <p className="text-xs font-medium text-slate-500 mb-1">Proficient Skills</p>
                    <p className="text-3xl font-display font-extrabold text-slate-900">
                      {dashboard.mastery?.proficient ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      of {dashboard.mastery?.total ?? 0} tracked
                    </p>
                  </div>

                  <div className="stat-card">
                    <p className="text-xs font-medium text-slate-500 mb-1">Showcased Projects</p>
                    <p className="text-3xl font-display font-extrabold text-slate-900">
                      {dashboard.projects?.showcased ?? 0}
                    </p>
                  </div>
                </div>

                {/* Mastery highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  <div className="card">
                    <h3 className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-primary-600" strokeWidth={2} />
                      Mastery Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Proficient</span>
                        <span className="font-semibold text-success-600">{dashboard.mastery?.proficient ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Developing</span>
                        <span className="font-semibold text-primary-600">{dashboard.mastery?.developing ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Emerging</span>
                        <span className="font-semibold text-slate-500">{dashboard.mastery?.emerging ?? 0}</span>
                      </div>
                    </div>

                    {dashboard.mastery?.byDomain && Object.keys(dashboard.mastery.byDomain).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-surface-200 space-y-2">
                        <p className="text-sm font-semibold text-slate-700">By Domain</p>
                        {Object.entries(dashboard.mastery.byDomain as Record<string, any>).map(([domain, stats]) => (
                          <div key={domain} className="flex justify-between text-sm">
                            <span className="text-slate-500">{domain}</span>
                            <span className="text-slate-700">
                              {stats.proficient}/{stats.total} · avg {stats.avgConfidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3 className="flex items-center gap-2 mb-4">
                      <BookOpenCheck className="w-5 h-5 text-primary-600" strokeWidth={2} />
                      Recent Activity
                    </h3>
                    {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
                      <div className="space-y-2">
                        {dashboard.recentActivity.slice(0, 8).map((a: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-surface-50 rounded-control text-sm">
                            <span className="flex items-center gap-1.5">
                              {a.success ? (
                                <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" strokeWidth={2} />
                              ) : (
                                <XCircle className="w-4 h-4 text-error-500 flex-shrink-0" strokeWidth={2} />
                              )}
                              {a.type}
                            </span>
                            <span className="text-slate-500">
                              {a.date ? new Date(a.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">No recent activity in this window.</p>
                    )}
                  </div>
                </div>

                {/* Last 7 days activity log */}
                {activity && (
                  <div className="card mb-8">
                    <h3 className="flex items-center gap-2 mb-4">
                      <CalendarRange className="w-5 h-5 text-primary-600" strokeWidth={2} />
                      Activity in the last {activity.days} days
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Practice ({activity.activities?.evidence?.length ?? 0})</p>
                        <div className="space-y-1">
                          {(activity.activities?.evidence ?? []).slice(0, 5).map((e: any, i: number) => (
                            <p key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                              {e.success ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-success-500 flex-shrink-0" strokeWidth={2} />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-error-500 flex-shrink-0" strokeWidth={2} />
                              )}
                              {e.type} {e.score != null ? `(${e.score})` : ''}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Missions ({activity.activities?.missions?.length ?? 0})</p>
                        <div className="space-y-1">
                          {(activity.activities?.missions ?? []).slice(0, 5).map((m: any, i: number) => (
                            <p key={i} className="text-xs text-slate-600">{m.title} — {m.status}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Projects ({activity.activities?.projects?.length ?? 0})</p>
                        <div className="space-y-1">
                          {(activity.activities?.projects ?? []).slice(0, 5).map((p: any, i: number) => (
                            <p key={i} className="text-xs text-slate-600">{p.title} — {p.state}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
