/**
 * Teaching extraction for the mission "Learn" beat.
 *
 * Kept separate from the LearnStep component so the component file only
 * exports components (react-refresh friendly) and so the extraction logic can
 * be unit-tested and reused independently of rendering.
 */

export interface TeachingContent {
  context?: string
  keyPoints?: string[]
  workedExample?: string
}

/**
 * Extract teachable material from an activity's `content` blob. Returns null
 * when there is nothing worth teaching, which the player uses to skip the
 * Learn step entirely (so we never show an empty teaching card).
 */
export function extractTeaching(activity: any): TeachingContent | null {
  const content = activity?.content ?? {}

  const context: string | undefined =
    content.context ?? activity?.context ?? content.explanation ?? undefined

  const keyPointsRaw = content.keyPoints ?? content.hints ?? activity?.keyPoints
  const keyPoints: string[] | undefined = Array.isArray(keyPointsRaw)
    ? keyPointsRaw.filter((p: unknown): p is string => typeof p === 'string' && p.trim().length > 0)
    : undefined

  // A worked example: prefer an explicit solution, else a fully-worked sample.
  const workedExample: string | undefined =
    content.workedExample ?? content.solution ?? content.example ?? undefined

  const hasSomething =
    (context !== undefined && context.trim().length > 0) ||
    (keyPoints !== undefined && keyPoints.length > 0) ||
    (workedExample !== undefined && workedExample.trim().length > 0)

  if (!hasSomething) return null
  return {
    ...(context ? { context } : {}),
    ...(keyPoints && keyPoints.length ? { keyPoints } : {}),
    ...(workedExample ? { workedExample } : {}),
  }
}
