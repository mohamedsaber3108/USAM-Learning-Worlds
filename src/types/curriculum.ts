/**
 * Curriculum graph + world map model.
 *
 * This is the contract a future content service must satisfy. Nothing in the
 * UI should assume the data is local: every field here is something a backend
 * curriculum/content API would return. No pedagogical fact is hard-coded in a
 * component — objectives, thresholds and review schedules all travel as data.
 */
import type { AgeBand, ID, ISODate } from "@/types/domain";

/* --------------------------------- mastery -------------------------------- */

/** Learning is a state machine, never "watched = done". */
export type MasteryState =
  | "introduced"
  | "exploring"
  | "practicing"
  | "developing"
  | "proficient"
  | "mastered"
  | "needs-review";

/** How a node sits on the learner's adaptive path right now. */
export type PathStatus =
  | "recommended-next"
  | "available"
  | "locked"
  | "needs-review"
  | "optional-challenge"
  | "advanced-challenge";

export interface MasteryThreshold {
  /** Confidence the engine must observe before promoting the state. */
  confidence: number;
  /** Independent demonstrations required, on separate sessions. */
  demonstrations: number;
  /** Must be shown in an unfamiliar context, not only the taught one. */
  transferRequired: boolean;
}

export interface ReviewSchedule {
  /** Spaced intervals in days, applied after each successful demonstration. */
  intervalsDays: number[];
  nextReviewAt: ISODate | null;
  lastReviewedAt: ISODate | null;
}

/** Evidence types for learning demonstrations - Phase 12 requirement */
export type EvidenceType =
  | "knowledge"
  | "application"
  | "creation"
  | "explanation"
  | "conversation"
  | "problem-solving"
  | "transfer"
  | "reflection";

export interface Evidence {
  id: ID;
  type: EvidenceType;
  activityId: ID;
  timestamp: ISODate;
  /** Brief description shown to learner and parent */
  description: string;
  /** Link to the actual work if applicable */
  artifactUrl?: string;
}

export interface MasteryStatus {
  state: MasteryState;
  /** 0–1. Engine-owned; the UI only renders it. */
  confidence: number;
  evidenceCount: number;
  lastDemonstratedAt: ISODate | null;
  /** Plain-language note a mentor character can say out loud. */
  note: string;
  /** Recent evidence items for this competency */
  recentEvidence: Evidence[];
  /** Number of practice sessions completed */
  practiceCount: number;
}

/* ------------------------------ curriculum graph -------------------------- */

export type CurriculumActivityKind =
  | "story"
  | "explore"
  | "guided-practice"
  | "visual-coding"
  | "code"
  | "conversation"
  | "build"
  | "reflect";

export interface NodeObjective {
  id: ID;
  /** Stable across ages — only the presentation changes. */
  statement: string;
  cognitiveLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
}

export interface NodeActivity {
  id: ID;
  title: string;
  kind: CurriculumActivityKind;
  minutes: number;
  ageBands: AgeBand[];
}

export interface NodePractice {
  id: ID;
  title: string;
  format: "spaced-review" | "drill" | "conversation" | "puzzle";
  itemCount: number;
}

export interface NodeProject {
  id: ID;
  title: string;
  brief: string;
  ageBands: AgeBand[];
}

export interface NodeAssessment {
  id: ID;
  title: string;
  kind: "formative" | "performance" | "portfolio-review" | "boss";
  /** What counts as proof. Never a score alone. */
  evidence: string;
}

/**
 * The same objective, presented four ways. The learning target does not move;
 * framing, complexity and the surface the child works on do.
 */
export interface AgeVariant {
  age: 8 | 10 | 12 | 14;
  band: AgeBand;
  /** How the objective is said to a child of this age. */
  framing: string;
  challenge: string;
  surface: "visual" | "blocks" | "blocks-and-script" | "code" | "conversation" | "studio";
  supportLevel: "modelled" | "guided" | "coached" | "independent";
}

export interface CurriculumNode {
  id: ID;
  name: string;
  summary: string;
  domainId: ID;
  worldId: ID;
  /** Location inside the world map this skill is taught at. */
  locationId: ID;
  ageRange: { min: number; max: number };
  /** Depth in the graph — used for layout and for "what comes first". */
  tier: number;
  prerequisiteIds: ID[];
  relatedIds: ID[];
  objectives: NodeObjective[];
  activities: NodeActivity[];
  practice: NodePractice[];
  projects: NodeProject[];
  assessment: NodeAssessment;
  masteryThreshold: MasteryThreshold;
  reviewSchedule: ReviewSchedule;
  mastery: MasteryStatus;
  pathStatus: PathStatus;
  ageVariants: AgeVariant[];
}

/* --------------------------------- world map ------------------------------ */

export type LocationKind =
  | "region"
  | "building"
  | "lab"
  | "studio"
  | "arena"
  | "landmark"
  | "workshop";

export interface WorldLocation {
  id: ID;
  worldId: ID;
  regionId: ID;
  name: string;
  kind: LocationKind;
  summary: string;
  /** Percent coordinates inside the world plate. */
  x: number;
  y: number;
  unlocked: boolean;
  /** Shown when locked — always a learning reason, never a paywall. */
  unlockRequirement: string | null;
  missionIds: ID[];
  projectIds: ID[];
  challengeIds: ID[];
  bossAssessment: { id: ID; title: string; summary: string; ready: boolean } | null;
  skillNodeIds: ID[];
}

export interface WorldRegion {
  id: ID;
  worldId: ID;
  name: string;
  theme: string;
  summary: string;
  locationIds: ID[];
}

export interface CurriculumWorld {
  id: ID;
  name: string;
  domainId: ID;
  tagline: string;
  description: string;
  glyph: string;
  accentColor: string;
  guideCharacterId: ID;
  /** Percent coordinates on the map canvas. */
  x: number;
  y: number;
  unlocked: boolean;
  unlockHint: string | null;
  regionIds: ID[];
  neighbourWorldIds: ID[];
}

export interface WorldMap {
  worlds: CurriculumWorld[];
  regions: WorldRegion[];
  locations: WorldLocation[];
}

export interface WorldProgress {
  worldId: ID;
  nodesTotal: number;
  nodesMastered: number;
  nodesInProgress: number;
  needsReview: number;
}

export interface AdaptivePath {
  recommendedNextId: ID | null;
  availableIds: ID[];
  lockedIds: ID[];
  needsReviewIds: ID[];
  optionalChallengeIds: ID[];
  advancedChallengeIds: ID[];
}
