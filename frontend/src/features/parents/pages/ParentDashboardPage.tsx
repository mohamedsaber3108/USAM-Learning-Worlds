import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Timer, BarChart3, BookOpenCheck, CalendarRange, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { parentsApi } from '@/lib/api/endpoints'
import { LoadingState, ErrorState } from '@/components/common/CharacterState'

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
  const {
    data: children,
    isLoading: childrenLoading,
    isError: childrenIsError,
    error: childrenError,
    refetch: refetchChildren,
  } = useQuery<ChildLink[]>({
    queryKey: ['parents-children'],
    queryFn: () => parentsApi.getChildren().then(res => res.data),
  })

  const activeChild = selectedLearnerId
    ? children?.find((c) => c.learner.id === selectedLearnerId)
    : children?.[0]

  const learnerId = activeChild?.learner.id

  // Real endpoint: GET /parents/children/:learnerId/dashboard
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardIsError, refetch: refetchDashboard } = useQuery({
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
    <div className="parent-shell">
      {/* Admin-mode top bar — dark slate, restrained, distinct from the playful learner chrome */}
      <header className="parent-topbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" strokeWidth={2} />
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
              Family Overview
            </h1>
            <span className="parent-badge">Parent View</span>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Back to learner app
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isForbidden && (
          <div className="parent-panel border-amber-200 bg-amber-50 p-4 mb-6">
            <p className="text-amber-900 text-sm">
              This account isn't linked as a guardian, so the Parent Dashboard has no
              children to show. Log in with a guardian/parent account to view child
              progress here.
            </p>
          </div>
        )}

        {childrenLoading && (
          <LoadingState character="Luma" message="Luma is pulling up your family overview..." />
        )}

        {childrenIsError && !isForbidden && (
          <ErrorState
            character="Azouz"
            title="Couldn't load your children"
            message="No worries — this happens sometimes. Let's give it another try."
            onRetry={() => refetchChildren()}
          />
        )}

        {!childrenLoading && !childrenIsError && !isForbidden && children && children.length === 0 && (
          <div className="parent-panel p-4">
            <p className="text-slate-500 text-sm">No children are linked to this guardian account yet.</p>
          </div>
        )}

        {children && children.length > 0 && (
          <>
            {/* Child selector — compact chip row */}
            {children.length > 1 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {children.map((c) => (
                  <button
                    key={c.learner.id}
                    onClick={() => setSelectedLearnerId(c.learner.id)}
                    className={`parent-chip ${
                      c.learner.id === learnerId
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c.learner.displayName}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 leading-tight">
                  {activeChild?.learner.displayName || 'Child'}
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Age band {activeChild?.learner.ageBand} · Account status: {activeChild?.learner.status}
                </p>
              </div>
              <Link
                to={`/parents/children/${learnerId}/time-limits`}
                className="parent-btn-secondary"
              >
                <Timer className="w-3.5 h-3.5" strokeWidth={2} />
                Manage Time Limits
              </Link>
            </div>

            {dashboardLoading && (
              <LoadingState character="Luma" message="Luma is putting together this dashboard..." />
            )}

            {dashboardIsError && (
              <ErrorState
                character="Azouz"
                title="Hmm, that dashboard didn't load"
                message="No worries — this happens sometimes. Let's give it another try."
                onRetry={() => refetchDashboard()}
              />
            )}

            {dashboard && (
              <>
                {/* Key metrics — a single dense, scannable panel row instead of 4 big decorative cards */}
                <div className="parent-panel mb-5">
                  <div className="parent-panel-header">
                    <span className="parent-section-label mb-0">Key Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    <div className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-500">Level</p>
                      <p className="text-xl font-semibold text-slate-900 tabular-nums">
                        {dashboard.progression?.level ?? 1}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {dashboard.progression?.totalXP?.toLocaleString() ?? 0} XP
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-500">Streak</p>
                      <p className="text-xl font-semibold text-slate-900 tabular-nums">
                        {dashboard.streak?.current ?? 0}d
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Best {dashboard.streak?.longest ?? 0}d
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-500">Proficient Skills</p>
                      <p className="text-xl font-semibold text-slate-900 tabular-nums">
                        {dashboard.mastery?.proficient ?? 0}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        of {dashboard.mastery?.total ?? 0} tracked
                      </p>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-500">Showcased Projects</p>
                      <p className="text-xl font-semibold text-slate-900 tabular-nums">
                        {dashboard.projects?.showcased ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mastery + recent activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="parent-panel">
                    <div className="parent-panel-header">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        <BarChart3 className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                        Mastery Breakdown
                      </span>
                    </div>
                    <div>
                      <div className="parent-row">
                        <span className="text-slate-500">Proficient</span>
                        <span className="font-semibold text-emerald-600 tabular-nums">{dashboard.mastery?.proficient ?? 0}</span>
                      </div>
                      <div className="parent-row">
                        <span className="text-slate-500">Developing</span>
                        <span className="font-semibold text-indigo-600 tabular-nums">{dashboard.mastery?.developing ?? 0}</span>
                      </div>
                      <div className="parent-row">
                        <span className="text-slate-500">Emerging</span>
                        <span className="font-semibold text-slate-500 tabular-nums">{dashboard.mastery?.emerging ?? 0}</span>
                      </div>
                    </div>

                    {dashboard.mastery?.byDomain && Object.keys(dashboard.mastery.byDomain).length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100">
                        <p className="parent-section-label">By Domain</p>
                        <div className="space-y-1.5">
                          {Object.entries(dashboard.mastery.byDomain as Record<string, any>).map(([domain, stats]) => (
                            <div key={domain} className="flex justify-between text-xs">
                              <span className="text-slate-500">{domain}</span>
                              <span className="text-slate-700 tabular-nums">
                                {stats.proficient}/{stats.total} · avg {stats.avgConfidence}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="parent-panel">
                    <div className="parent-panel-header">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        <BookOpenCheck className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                        Recent Activity
                      </span>
                    </div>
                    {dashboard.recentActivity && dashboard.recentActivity.length > 0 ? (
                      <div>
                        {dashboard.recentActivity.slice(0, 8).map((a: any, i: number) => (
                          <div key={i} className="parent-row">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              {a.success ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" strokeWidth={2} />
                              )}
                              {a.type}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {a.date ? new Date(a.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm px-4 py-3">No recent activity in this window.</p>
                    )}
                  </div>
                </div>

                {/* Last 7 days activity log */}
                {activity && (
                  <div className="parent-panel mb-6">
                    <div className="parent-panel-header">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        <CalendarRange className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                        Activity — last {activity.days} days
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div className="px-4 py-3">
                        <p className="parent-section-label">Practice ({activity.activities?.evidence?.length ?? 0})</p>
                        <div className="space-y-1">
                          {(activity.activities?.evidence ?? []).slice(0, 5).map((e: any, i: number) => (
                            <p key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                              {e.success ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" strokeWidth={2} />
                              )}
                              {e.type} {e.score != null ? `(${e.score})` : ''}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="parent-section-label">Missions ({activity.activities?.missions?.length ?? 0})</p>
                        <div className="space-y-1">
                          {(activity.activities?.missions ?? []).slice(0, 5).map((m: any, i: number) => (
                            <p key={i} className="text-xs text-slate-600">{m.title} — {m.status}</p>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="parent-section-label">Projects ({activity.activities?.projects?.length ?? 0})</p>
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
