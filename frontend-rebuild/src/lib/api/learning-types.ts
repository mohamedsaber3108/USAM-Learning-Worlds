import type { MasteryState } from '@/lib/labels/masteryLabels'

// Shapes for the learning-loop surfaces (mirror the real backend responses).

export interface DomainPathCompetency {
  id: string
  name: string
  missionId?: string | null
  masteryState: MasteryState
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
}

export interface MissionRun {
  id: string
  missionId: string
  status: string
  mission: {
    id: string
    title: string
    description?: string
  }
  activities: ActivitySummary[]
  attempts: Array<{
    id: string
    activityId: string
    success: boolean | null
    score: number | null
    feedback?: string | null
  }>
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
