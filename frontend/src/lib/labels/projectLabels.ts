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

/**
 * Milestone status — real enum is `PENDING | IN_PROGRESS | COMPLETE`
 * (projects.service.ts updateMilestoneStatus validStatuses), confirmed by
 * reading the service directly. ProjectDetailPage previously checked for
 * `'DONE'` or `'COMPLETED'`, neither of which the backend ever sends — a
 * milestone could never visually register as done regardless of its real
 * state. Added the real child-language map alongside the fix.
 */
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  PENDING: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETE: 'Done',
}

export function milestoneStatusLabel(status?: string | null): string {
  if (!status) return ''
  return (MILESTONE_STATUS_LABEL as Record<string, string>)[status] ?? status
}

export function isMilestoneComplete(status?: string | null): boolean {
  return status === 'COMPLETE'
}
