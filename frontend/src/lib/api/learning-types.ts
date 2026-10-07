import type { MasteryState } from '@/lib/labels/masteryLabels'

// Shapes for the learning-loop surfaces (mirror the real backend responses).

export interface DomainPathCompetency {
  id: string
  name: string
  missionId?: string | null
  masteryState: MasteryState
  // FIX (reconciliation audit, 2026-10-06): domain-path.service.ts decorates
  // every competency with cefrLevel/strandType for English specifically
  // (sourced from the real EnglishStrand model; null for non-English
  // domains, by design — the projection stays generic). The backend always
  // sent this; the frontend type never declared it, so it was silently
  // dropped on every DomainPathPage render.
  cefrLevel?: string | null
  strandType?: string | null
}
export interface DomainPathSkill {
  id: string
  name: string
  competencies: DomainPathCompetency[]
}
export interface DomainPath {
  domain: { name: string; slug: string }
  skills: DomainPathSkill[]
}

export interface ActivitySummary {
  id: string
  type: 'SELECT' | 'MATCH' | 'SEQUENCE' | 'CODE' | 'EXPLAIN' | 'CREATE' | 'SOLVE'
  title: string
  description?: string
  content: Record<string, unknown>
  // FIX (reverse-engineering/experience directive, 2026-10-07, §12/§15:
  // "Mission Player should clearly show mission purpose, what the learner
  // will learn"): GET /missions/runs/:runId already nests the real
  // LearningObjective (name + description) on every activity — confirmed
  // via a direct authenticated API call against production — but the
  // frontend type never declared it, so MissionPlayerPage had no way to
  // show WHY an activity exists, only its question text.
  objective?: { id: string; name: string; description?: string | null } | null
}

// GET /missions/runs/:runId returns { ...run, mission: { ...mission, activities } }.
// Activities live under run.mission.activities (NOT run.activities).
export interface MissionRun {
  id: string
  missionId: string
  status: string
  mission: {
    id: string
    title: string
    description?: string
    activities: ActivitySummary[]
    // FIX (reverse-engineering/experience directive, 2026-10-07, §15:
    // mission completion must show "what to do next... what was
    // unlocked"): real field, confirmed present on GET
    // /missions/runs/:runId's mission.worldId (missions.service.ts
    // getMission/getMissionRun both select the full Mission row) — lets
    // the completion screen link back to the real World Detail page
    // (the next-mission picker already built there) instead of a dead end.
    worldId?: string | null
  }
  attempts: Array<{
    id: string
    activityId: string
    success: boolean | null
    score: number | null
    feedback?: string | null
  }>
}

// POST /missions/runs/:runId/submit returns { attempt, evaluation, activity, diagnosticOnly }.
// The grade is in `evaluation` (correct/score/feedback), NOT top-level.
export interface SubmitActivityResult {
  attempt: { id: string; success: boolean | null; score: number | null; feedback?: string | null }
  evaluation: { correct: boolean; score: number; feedback: string; partialCredit?: boolean }
  activity: { id: string; title: string; type: string; assessmentPurpose: string }
  diagnosticOnly: boolean
}

export interface MasteryRecord {
  id: string
  competencyId: string
  state: MasteryState
  confidence: number
  evidenceCount: number
  reviewDue?: string | null
  competency?: {
    name: string
    skill?: { name: string; domain?: { name: string; slug: string } }
  }
}

export interface DomainMastery {
  domain: string
  totalCompetencies: number
  masteredCount: number
  proficientCount: number
  avgConfidence: number
}
