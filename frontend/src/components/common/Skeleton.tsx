import { motion } from 'framer-motion'

/**
 * Lightweight, content-shaped loading placeholders.
 *
 * Why this exists: on the highest-traffic pages (dashboard, missions
 * browse, curriculum browse) the previous pattern was to swap the ENTIRE
 * page body for a centered <LoadingState /> (a small character graphic +
 * one line of text, `py-12`, no fixed height) and then, once the query
 * resolved, swap that out for a multi-card grid/stat layout that is 3-10x
 * taller. That's a real, visible layout jump/blank-flash — not a nitpick —
 * because the loading node's box height has nothing to do with the real
 * content's height.
 *
 * These skeletons reuse the exact same structural classes as the real
 * content (`.card`, `.stat-card-hero`, `.stat-card-secondary`, grid
 * columns/gaps) so the loading frame occupies essentially the same
 * vertical space the real content will, and reuse the existing
 * `animate-pulse` convention already used in DailyGoalCard instead of
 * inventing a new shimmer treatment.
 */

function Bar({ className = '' }: { className?: string }) {
  return <div className={`bg-surface-100 rounded ${className}`} />
}

/** One mission/concept card, matching MissionsBrowsePage / CurriculumBrowsePage card dimensions. */
export function CardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay }}
      className="card animate-pulse"
      aria-hidden="true"
    >
      <div className="mb-4">
        <Bar className="h-5 w-3/4 mb-2" />
        <Bar className="h-3 w-full mb-1.5" />
        <Bar className="h-3 w-5/6" />
      </div>
      <div className="flex gap-2 mb-4">
        <Bar className="h-5 w-20" />
        <Bar className="h-5 w-16" />
      </div>
      <div className="flex items-center justify-between border-t border-surface-200 pt-3">
        <Bar className="h-4 w-24" />
      </div>
    </motion.div>
  )
}

/** A grid of CardSkeletons — matches the 1/2/3-col grid used by mission & concept lists. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} delay={Math.min(i * 0.03, 0.2)} />
      ))}
    </div>
  )
}

/** Dashboard skeleton: hero + secondary stat cards, matching DashboardPage's real grid. */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface-50" role="status" aria-label="Loading dashboard">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header row: avatar + name */}
        <div className="mb-10 flex items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-surface-100 flex-shrink-0" />
          <div>
            <Bar className="h-7 w-56 mb-2" />
            <Bar className="h-3 w-40" />
          </div>
        </div>

        {/* Stats grid — hero card + stacked secondary cards, same proportions as real layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10 items-stretch">
          <div className="lg:col-span-2 stat-card-hero animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-surface-100 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <Bar className="h-3 w-24 mb-3" />
                <Bar className="h-3 w-full mb-3" />
                <Bar className="h-9 w-32" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="stat-card-secondary flex-1 animate-pulse">
              <Bar className="h-3 w-16 mb-2" />
              <Bar className="h-6 w-12" />
            </div>
            <div className="stat-card-secondary flex-1 animate-pulse">
              <Bar className="h-3 w-16 mb-2" />
              <Bar className="h-6 w-12" />
            </div>
          </div>
        </div>

        {/* Today's Goal placeholder */}
        <div className="mb-10 max-w-sm card animate-pulse">
          <Bar className="h-4 w-24 mb-4" />
          <Bar className="h-20 w-20 rounded-full mx-auto" />
        </div>

        {/* Recent activity list placeholder */}
        <div className="card animate-pulse">
          <Bar className="h-4 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-control bg-surface-50" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

/** Curriculum domain/world-path skeleton: a row of node placeholders matching WorldPathMap. */
export function WorldPathSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 px-2 animate-pulse" role="status" aria-label="Loading domains">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 sm:mr-6">
          <div className="w-14 h-14 rounded-full bg-surface-100" />
          <Bar className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
