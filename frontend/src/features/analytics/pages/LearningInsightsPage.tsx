import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Rocket,
  Flame,
  Lightbulb,
  Trophy,
  MessageCircle,
  Sparkles,
  Palette,
  Unlock,
  Star,
  ClipboardCheck,
  Sunrise,
  Sun,
  Moon,
  CalendarCheck2,
  Zap,
  Compass,
  Clock,
} from 'lucide-react'
import { learningEventsApi, type LearningEventRow } from '@/lib/api/endpoints'

/**
 * "Your Learning Journey" — the first learner-facing view of the
 * /learning/events pipeline (stats + recent + patterns), which has been
 * fully working server-side with zero frontend consumer until now.
 *
 * Real response shapes (read from learning-event.service.ts +
 * learning.controller.ts, not guessed):
 *   GET /learning/events/stats   -> EventStats[] = { eventType, count, lastOccurred }[]
 *   GET /learning/events/recent  -> LearningEvent[] (raw Prisma rows: id, learnerId,
 *                                    type, entityType, entityId, data, sessionId, createdAt)
 *   GET /learning/events/patterns -> { period, activeDays, consistency,
 *                                    avgActivitiesPerDay, peakLearningHour, hourlyDistribution }
 */

// Friendly icon + copy per raw LearningEventType enum value (from
// backend/prisma/schema.prisma) — a genuine translation layer, not an
// admin-log dump of enum strings.
const EVENT_META: Record<
  string,
  { icon: typeof Rocket; verb: string; tint: string }
> = {
  ACTIVITY_STARTED: { icon: Rocket, verb: 'Started an activity', tint: 'bg-primary-50 text-primary-600' },
  ACTIVITY_COMPLETED: { icon: ClipboardCheck, verb: 'Finished an activity', tint: 'bg-success-50 text-success-600' },
  ANSWER_SUBMITTED: { icon: ClipboardCheck, verb: 'Submitted an answer', tint: 'bg-primary-50 text-primary-600' },
  HINT_REQUESTED: { icon: Lightbulb, verb: 'Asked for a hint', tint: 'bg-warning-50 text-warning-600' },
  EXPLANATION_REQUESTED: { icon: Lightbulb, verb: 'Asked for an explanation', tint: 'bg-warning-50 text-warning-600' },
  MASTERY_CHANGED: { icon: Star, verb: 'Leveled up a skill', tint: 'bg-secondary-50 text-secondary-600' },
  PROJECT_STARTED: { icon: Palette, verb: 'Started a project', tint: 'bg-secondary-50 text-secondary-600' },
  PROJECT_COMPLETED: { icon: Trophy, verb: 'Completed a project', tint: 'bg-success-50 text-success-600' },
  MISSION_STARTED: { icon: Compass, verb: 'Started a mission', tint: 'bg-accent-50 text-accent-600' },
  MISSION_COMPLETED: { icon: Trophy, verb: 'Completed a mission', tint: 'bg-success-50 text-success-600' },
  CONVERSATION_STARTED: { icon: MessageCircle, verb: 'Chatted with a character', tint: 'bg-primary-50 text-primary-600' },
  SKILL_UNLOCKED: { icon: Unlock, verb: 'Unlocked a new skill', tint: 'bg-secondary-50 text-secondary-600' },
  CONCEPT_UNLOCKED: { icon: Unlock, verb: 'Unlocked a new concept', tint: 'bg-secondary-50 text-secondary-600' },
  ACHIEVEMENT_EARNED: { icon: Trophy, verb: 'Earned an achievement', tint: 'bg-warning-50 text-warning-600' },
  PRACTICE_STREAK_UPDATED: { icon: Flame, verb: 'Kept the streak going', tint: 'bg-accent-50 text-accent-600' },
  REVIEW_SCHEDULED: { icon: CalendarCheck2, verb: 'Scheduled a review', tint: 'bg-primary-50 text-primary-600' },
  ASSESSMENT_STARTED: { icon: Compass, verb: 'Started an assessment', tint: 'bg-accent-50 text-accent-600' },
  ASSESSMENT_COMPLETED: { icon: ClipboardCheck, verb: 'Completed an assessment', tint: 'bg-success-50 text-success-600' },
}

const DEFAULT_META = { icon: Sparkles, verb: 'Did something awesome', tint: 'bg-primary-50 text-primary-600' }

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function describeEvent(row: LearningEventRow): string {
  const meta = EVENT_META[row.type] || DEFAULT_META
  // Small real-content upgrades where the event's own `data` payload carries
  // something worth surfacing (score, success flag) — not just the verb.
  if (row.type === 'ACTIVITY_COMPLETED' && row.data) {
    const success = row.data.success
    const score = row.data.score
    if (typeof score === 'number') return `${meta.verb} — scored ${score}%`
    if (success === true) return `${meta.verb} — nailed it!`
    if (success === false) return `${meta.verb} — good try!`
  }
  return meta.verb
}

function hourLabel(hour: number): string {
  if (hour === 0) return '12am'
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  return `${hour - 12}pm`
}

function partOfDay(hour: number): { label: string; Icon: typeof Sunrise } {
  if (hour >= 5 && hour < 12) return { label: 'mornings', Icon: Sunrise }
  if (hour >= 12 && hour < 17) return { label: 'afternoons', Icon: Sun }
  if (hour >= 17 && hour < 21) return { label: 'evenings', Icon: Sun }
  return { label: 'nights', Icon: Moon }
}

export function LearningInsightsPage() {
  const { data: stats } = useQuery({
    queryKey: ['learning-events-stats'],
    queryFn: () => learningEventsApi.getStats().then((res) => res.data),
  })

  const { data: recent } = useQuery({
    queryKey: ['learning-events-recent'],
    queryFn: () => learningEventsApi.getRecent(72).then((res) => res.data),
  })

  const { data: patterns } = useQuery({
    queryKey: ['learning-events-patterns'],
    queryFn: () => learningEventsApi.getPatterns(30).then((res) => res.data),
  })

  const totalEvents = Array.isArray(stats) ? stats.reduce((sum, s) => sum + s.count, 0) : 0
  const activitiesCompleted = Array.isArray(stats)
    ? stats.find((s) => s.eventType === 'ACTIVITY_COMPLETED')?.count || 0
    : 0
  const hintsRequested = Array.isArray(stats)
    ? stats.find((s) => s.eventType === 'HINT_REQUESTED')?.count || 0
    : 0
  const mostCommon = Array.isArray(stats) && stats.length > 0
    ? [...stats].sort((a, b) => b.count - a.count)[0]
    : null

  const hasPatternSignal = !!patterns && patterns.activeDays > 0
  const peak = hasPatternSignal ? partOfDay(patterns!.peakLearningHour) : null

  return (
    <div className="min-h-screen bg-surface-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h2 className="font-display font-bold text-slate-900 text-2xl mb-1 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-600" strokeWidth={2} />
            Your Learning Journey
          </h2>
          <p className="text-slate-500 text-sm">
            A look back at everything you've been up to lately.
          </p>
        </motion.div>

        {/* Stats cards — reuses DashboardPage's stat-card convention */}
        <div className="grid grid-cols-1 gap-5 mb-8 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Things You've Done</p>
                <p className="font-display font-extrabold text-slate-900 text-3xl">{totalEvents}</p>
                <p className="text-xs text-slate-500 mt-1">across all your learning</p>
              </div>
              <div className="icon-chip bg-primary-50 text-primary-600">
                <Sparkles className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Activities Finished</p>
                <p className="font-display font-extrabold text-slate-900 text-3xl">{activitiesCompleted}</p>
                <p className="text-xs text-slate-500 mt-1">great job getting these done!</p>
              </div>
              <div className="icon-chip bg-success-50 text-success-600">
                <ClipboardCheck className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Hints Used</p>
                <p className="font-display font-extrabold text-slate-900 text-3xl">{hintsRequested}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {hintsRequested > 0 ? "it's smart to ask for help!" : 'you figured it out yourself!'}
                </p>
              </div>
              <div className="icon-chip bg-warning-50 text-warning-600">
                <Lightbulb className="w-5 h-5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pattern summary — warm, kid-facing translation of /events/patterns */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-primary-600" strokeWidth={2} />
            <h3>How You Learn Best</h3>
          </div>

          {!patterns ? (
            <p className="text-sm text-slate-500">Loading your patterns...</p>
          ) : !hasPatternSignal ? (
            <p className="text-sm text-slate-500">
              Keep learning and check back here — we'll start spotting your patterns soon!
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-control bg-primary-50">
                {peak && <peak.Icon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" strokeWidth={2} />}
                <p className="text-sm text-slate-700">
                  You learn best in the <span className="font-semibold">{peak?.label}</span> — you're
                  usually most active around <span className="font-semibold">{hourLabel(patterns.peakLearningHour)}</span>!
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-control bg-success-50">
                <Flame className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-slate-700">
                  You've been active <span className="font-semibold">{patterns.activeDays} day{patterns.activeDays === 1 ? '' : 's'}</span> in
                  the last {patterns.period.days} days — that's a{' '}
                  <span className="font-semibold">{patterns.consistency}% consistency</span> streak. Keep it up!
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-control bg-secondary-50">
                <Star className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-sm text-slate-700">
                  On average you complete about{' '}
                  <span className="font-semibold">{patterns.avgActivitiesPerDay}</span> activities on the days you learn.
                </p>
              </div>

              {mostCommon && (
                <div className="flex items-start gap-3 p-3 rounded-control bg-accent-50">
                  <Trophy className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm text-slate-700">
                    Your favorite thing to do lately: <span className="font-semibold">{(EVENT_META[mostCommon.eventType] || DEFAULT_META).verb.toLowerCase()}</span> ({mostCommon.count} times)!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent activity timeline — from /events/recent */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary-600" strokeWidth={2} />
            <h3>Recent Activity</h3>
          </div>

          {!recent ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nothing here yet — go start a mission or activity and it'll show up here!
            </p>
          ) : (
            <div className="space-y-2">
              {recent.slice(0, 15).map((row) => {
                const meta = EVENT_META[row.type] || DEFAULT_META
                const Icon = meta.icon
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between p-3 rounded-control bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`icon-chip ${meta.tint}`}>
                        <Icon className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <p className="font-medium text-sm text-slate-800">{describeEvent(row)}</p>
                    </div>
                    <p className="text-xs text-slate-400 flex-shrink-0">{timeAgo(row.createdAt)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
