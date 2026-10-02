/**
 * PROJECT STATE — child-language labels. Mirrors masteryLabels.ts: the
 * backend's `ProjectState` enum (backend/prisma/schema.prisma) is a real,
 * precise workflow state machine for authors/reviewers, but a learner
 * should never see "BUILDING" or "REVISION" as bare enum text — same
 * child-language rule masteryLabels.ts already enforces for mastery.
 * ProjectsPage/ProjectDetailPage/PortfolioPage previously rendered
 * `data.state` directly through StatusPill (raw enum), which this closes.
 */
export type ProjectState = 'DRAFT' | 'PLANNING' | 'BUILDING' | 'REVIEW' | 'REVISION' | 'COMPLETED' | 'SHOWCASED'

export const PROJECT_STATE_LABEL: Record<ProjectState, string> = {
  DRAFT: 'Just an idea',
  PLANNING: 'Planning it out',
  BUILDING: 'Building',
  REVIEW: 'Getting feedback',
  REVISION: 'Making it better',
  COMPLETED: 'Finished',
  SHOWCASED: 'On showcase',
}

export type ProjectStateTone = 'neutral' | 'brand' | 'success'

export const PROJECT_STATE_TONE: Record<ProjectState, ProjectStateTone> = {
  DRAFT: 'neutral',
  PLANNING: 'neutral',
  BUILDING: 'brand',
  REVIEW: 'brand',
  REVISION: 'brand',
  COMPLETED: 'success',
  SHOWCASED: 'success',
}

export function projectStateLabel(state?: string | null): string {
  if (!state) return ''
  return (PROJECT_STATE_LABEL as Record<string, string>)[state] ?? state
}

export function projectStateTone(state?: string | null): ProjectStateTone {
  if (!state) return 'neutral'
  return (PROJECT_STATE_TONE as Record<string, ProjectStateTone>)[state] ?? 'neutral'
}
