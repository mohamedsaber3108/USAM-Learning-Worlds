/**
 * Mission run model — Phase 5.
 *
 * A mission is an adventure on the surface and an instructional sequence
 * underneath. The stage order below is fixed for every mission so the
 * pedagogy never depends on how a piece of content was authored.
 *
 * Nothing here decides *whether* a child has learned something. The frontend
 * only collects and displays evidence; the mastery decision arrives from the
 * backend (mocked today) and is always accompanied by the evidence that
 * produced it.
 */
import type { AgeBand, ID } from "@/types/domain";
import type { MasteryState } from "@/types/curriculum";

export type MissionStageKind =
  | "story-setup"
  | "objective"
  | "prior-knowledge"
  | "concept"
  | "guided-exploration"
  | "practice"
  | "challenge"
  | "creation"
  | "reflection"
  | "assessment"
  | "mastery-decision"
  | "reward"
  | "next-recommendation";

export const MISSION_STAGE_ORDER: MissionStageKind[] = [
  "story-setup",
  "objective",
  "prior-knowledge",
  "concept",
  "guided-exploration",
  "practice",
  "challenge",
  "creation",
  "reflection",
  "assessment",
  "mastery-decision",
  "reward",
  "next-recommendation",
];

/** Every interaction the platform can ask a child to do. */
export type MissionActivityKind =
  | "multiple-choice"
  | "short-answer"
  | "free-response"
  | "matching"
  | "sorting"
  | "drag-drop"
  | "simulation"
  | "conversation"
  | "voice-response"
  | "reading"
  | "listening"
  | "writing"
  | "coding"
  | "debugging"
  | "creative-creation"
  | "design"
  | "drawing"
  | "research"
  | "decision-making"
  | "role-play"
  | "business-simulation"
  | "project-building"
  | "reflection";

/** What the child is actually working in — drives the surface, not the objective. */
export type ActivitySurface =
  | "read"
  | "choose"
  | "write"
  | "arrange"
  | "speak"
  | "build"
  | "simulate"
  | "converse"
  | "draw";

export type ActivityStatus = "locked" | "ready" | "active" | "submitted" | "revisit" | "complete";

/** Kinds of proof a response can produce. Rewards attach to these, never to clicks. */
export type EvidenceKind =
  | "correct-response"
  | "explanation"
  | "artifact"
  | "transfer"
  | "self-correction"
  | "spoken-response"
  | "decision-rationale"
  | "process-trace";

export interface EvidenceSignal {
  id: ID;
  activityId: ID;
  objectiveId: ID;
  kind: EvidenceKind;
  /** Plain-language description of what the child actually demonstrated. */
  statement: string;
  /** 0–1 model confidence. Mock today; a backend service owns this later. */
  confidence: number;
  capturedAt: string;
  /** True when the evidence came from a fresh, unscaffolded situation. */
  unassisted: boolean;
}

/** Hints escalate: nudge → strategy → worked step. Using them is recorded, never punished. */
export interface Hint {
  id: ID;
  level: 1 | 2 | 3;
  label: string;
  body: string;
  /** Which character says it. */
  characterId: ID;
}

export interface ActivityOption {
  id: ID;
  label: string;
  /** Present only for gradable kinds. */
  correct?: boolean;
  /** Feedback tied to the reasoning, not to right/wrong. */
  feedback?: string;
}

export interface ActivityPair {
  id: ID;
  left: string;
  right: string;
}

export interface MissionActivity {
  id: ID;
  missionId: ID;
  stage: MissionStageKind;
  kind: MissionActivityKind;
  surface: ActivitySurface;
  objectiveId: ID;
  skillIds: ID[];
  title: string;
  /** In-world framing. */
  storyBeat: string;
  /** The actual task. */
  prompt: string;
  estimatedMinutes: number;
  /** Age presentation. The objective is identical across bands. */
  framingByBand: Record<AgeBand, string>;
  characterId: ID;
  voiceSupported: boolean;
  options?: ActivityOption[];
  pairs?: ActivityPair[];
  /** For sorting / drag-drop / ordering. */
  buckets?: { id: ID; label: string }[];
  items?: { id: ID; label: string; bucketId?: ID }[];
  /** For writing / free response / reflection: what a good answer contains. */
  successCriteria?: string[];
  /** For coding / debugging / building surfaces. */
  starter?: string;
  hints: Hint[];
  /** What the response is expected to prove. */
  evidenceKind: EvidenceKind;
  /** Minimum work required before the activity can be submitted. */
  minimumEffort?: { kind: "characters" | "selections" | "items"; value: number };
}

export interface MissionStage {
  kind: MissionStageKind;
  title: string;
  /** Why this stage exists, in words a child can read. */
  purpose: string;
  /** Character narration entering the stage. */
  narration: string;
  characterId: ID;
  activityIds: ID[];
  /** Stages like reward or mastery-decision are system beats, not tasks. */
  interactive: boolean;
}

export type MissionDifficulty = "gentle" | "steady" | "stretch" | "expedition";

export interface MissionSkillTag {
  skillId: ID;
  name: string;
  /** Where the child stands on this skill going in. */
  entryState: MasteryState;
}

export interface MissionRun {
  id: ID;
  missionId: ID;
  worldId: ID;
  title: string;
  /** One-line hook. */
  storyContext: string;
  /** Longer in-world setup shown in the story stage. */
  storySetup: string;
  guideCharacterId: ID;
  supportingCharacterIds: ID[];
  objectives: { id: ID; statement: string; skillId: ID }[];
  skills: MissionSkillTag[];
  difficulty: MissionDifficulty;
  estimatedMinutes: number;
  ageBands: AgeBand[];
  stages: MissionStage[];
  /** Boss assessment this mission feeds, if any. */
  bossAssessmentId: ID | null;
  rewards: MissionReward[];
}

/** Rewards describe what was proven. A reward with no evidence cannot be granted. */
export interface MissionReward {
  id: ID;
  name: string;
  description: string;
  glyph: string;
  /** Evidence kinds that must be present before this unlocks. */
  requiresEvidence: EvidenceKind[];
}

export interface ActivityResponse {
  activityId: ID;
  /** Free text, code, or a spoken transcript. */
  text?: string;
  selectedOptionIds?: ID[];
  /** itemId → bucketId, for sorting / matching / drag-drop. */
  placements?: Record<ID, ID>;
  /** Ordered item ids, for sequencing. */
  order?: ID[];
  hintsUsed: number;
  secondsSpent: number;
}

export interface ActivityResult {
  activityId: ID;
  status: ActivityStatus;
  /** Never a score out of ten. Feedback speaks about the work. */
  feedback: string;
  characterId: ID;
  /** What, if anything, this response proved. */
  evidence: EvidenceSignal[];
  /** Set when the child should try again before moving on. */
  retryReason: string | null;
  nextSuggestion: string;
}

export interface MasteryDecision {
  objectiveId: ID;
  objectiveStatement: string;
  previousState: MasteryState;
  decidedState: MasteryState;
  /** The evidence the decision rests on. */
  evidence: EvidenceSignal[];
  /** Human-readable rationale from the backend. */
  rationale: string;
  /** False when the mission was completed but the evidence was thin. */
  sufficientEvidence: boolean;
  /** What would move this forward next. */
  whatWouldStrengthenIt: string;
}

export type ReviewMode =
  | "instant-review"
  | "later-review"
  | "spaced-review"
  | "practice-again"
  | "challenge-again";

export interface ReviewOption {
  mode: ReviewMode;
  label: string;
  description: string;
  /** Null for immediate options. */
  scheduledFor: string | null;
  objectiveIds: ID[];
  /** Why the system is offering this specific option. */
  reason: string;
  recommended: boolean;
}

export interface NextRecommendation {
  id: ID;
  kind: "mission" | "practice" | "project" | "boss-assessment" | "rest";
  title: string;
  reason: string;
  targetPath: string;
  characterId: ID;
}

export interface MissionCompletion {
  missionId: ID;
  completedAt: string;
  evidence: EvidenceSignal[];
  masteryDecisions: MasteryDecision[];
  rewardsEarned: MissionReward[];
  rewardsWithheld: { reward: MissionReward; missing: string }[];
  reviewOptions: ReviewOption[];
  nextRecommendations: NextRecommendation[];
  reflection: string | null;
}

/* ---------------------------------------------------------------- boss ---- */

export type BossTaskKind = "transfer" | "application" | "critique" | "defence" | "unscripted";

export interface BossTask {
  id: ID;
  kind: BossTaskKind;
  title: string;
  /** A situation the child was never taught in. */
  scenario: string;
  prompt: string;
  /** What the examiner is looking for. Shown to the child up front — no traps. */
  lookingFor: string[];
  /** Deliberately different context from where the skill was learned. */
  transferDistance: "near" | "far";
  responseSurface: ActivitySurface;
  minimumEffort?: { kind: "characters" | "selections" | "items"; value: number };
}

export interface BossAssessment {
  id: ID;
  worldId: ID;
  locationId: ID | null;
  title: string;
  /** In-world staging. */
  premise: string;
  examinerCharacterId: ID;
  /** Skills the boss draws on — always more than one. */
  skillIds: ID[];
  objectiveIds: ID[];
  /** Explicit: recall alone does not pass. */
  passStandard: string;
  entryRequirement: string;
  entryMet: boolean;
  tasks: BossTask[];
  ageBands: AgeBand[];
  estimatedMinutes: number;
  /** No hints during a boss — support is named honestly instead. */
  supportPolicy: string;
  retryPolicy: string;
}

export interface BossOutcome {
  assessmentId: ID;
  verdict: "demonstrated" | "partially-demonstrated" | "not-yet";
  summary: string;
  perTask: { taskId: ID; observation: string; met: boolean }[];
  evidence: EvidenceSignal[];
  masteryDecisions: MasteryDecision[];
  reviewOptions: ReviewOption[];
}
