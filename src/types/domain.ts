/**
 * USAM for Kids — frontend domain model.
 *
 * These interfaces mirror the future backend entities. Components consume
 * these types only; no component should assume a data source.
 */

/* ---------------------------------- core --------------------------------- */

export type ID = string;
export type ISODate = string;

export type AgeBand = "8-9" | "10-11" | "12-14";

export type DevelopmentalStage = "explorer" | "builder" | "creator";

export type InteractionStyle = "voice" | "visual" | "reading" | "hands-on";

export type MotivationDriver =
  | "curiosity"
  | "mastery"
  | "creation"
  | "social"
  | "competition"
  | "recognition";

export type SkillLevel = "novice" | "developing" | "proficient" | "advanced";

export type MasteryState =
  | "not-started"
  | "introduced"
  | "exploring"
  | "practicing"
  | "developing"
  | "proficient"
  | "mastered"
  | "needs-review";

export type LoadState = "idle" | "loading" | "success" | "empty" | "error";

/* --------------------------------- learner -------------------------------- */

export interface LearnerProfile {
  displayName: string;
  age: number;
  ageBand: AgeBand;
  developmentalStage: DevelopmentalStage;
  interests: string[];
  motivationDrivers: MotivationDriver[];
  preferredInteractionStyle: InteractionStyle;
  languages: string[];
  reducedMotion: boolean;
  audioFirst: boolean;
}

export interface Learner {
  id: ID;
  profile: LearnerProfile;
  avatarCharacterId: ID;
  worldId: ID;
  currentMissionId: ID | null;
  guildId: ID | null;
  joinedAt: ISODate;
  parentApproved: boolean;
}

export interface CharacterCustomization {
  characterId: ID;
  name: string;
  skinTone: string;
  hair: string;
  outfit: string;
  accessory: string | null;
  primaryColor: string;
  secondaryColor: string;
  unlockedItemIds: ID[];
  /** Customization is earned through learning, never purely cosmetic. */
  unlockedBy: Record<ID, { itemId: ID; competencyId: ID }>;
  level: number;
}

/* -------------------------------- characters ------------------------------ */

export type CharacterRole =
  | "main-companion"
  | "english-coach"
  | "coding-mentor"
  | "ai-mentor"
  | "creativity-mentor"
  | "entrepreneurship-mentor"
  | "science-mentor"
  | "story-guide"
  | "challenge-master"
  | "project-reviewer"
  | "wellbeing-companion"
  | "rival"
  | "story"
  | "world-guide";

export type CharacterMood =
  | "neutral"
  | "encouraging"
  | "curious"
  | "celebrating"
  | "focused"
  | "concerned"
  | "explaining";

export interface Character {
  id: ID;
  name: string;
  role: CharacterRole;
  tagline: string;
  domainIds: ID[];
  accentColor: string;
  glyph: string;
  /** Tone template resolved per age band by the future AI backend. */
  toneByAgeBand: Record<AgeBand, string>;
  unlocked: boolean;
}

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "paused"
  | "error"
  | "muted"
  | "interrupted";

export interface CharacterState {
  characterId: ID;
  mood: CharacterMood;
  voiceState: VoiceState;
  dialogueState: "greeting" | "onboarding" | "guiding" | "hinting" | "reflecting" | "celebrating";
  currentMissionId: ID | null;
  currentObjectiveId: ID | null;
  utterance: string | null;
  /** Populated by backend AI later. */
  recommendedActionId: ID | null;
}

/* ------------------------------ learning model ---------------------------- */

export interface LearningDomain {
  id: ID;
  name: string;
  shortName: string;
  description: string;
  glyph: string;
  accentColor: string;
  skillIds: ID[];
  order: number;
}

/** Enhanced Skill model - Phase 12 requirements */
export interface Skill {
  id: ID;
  domainId: ID;
  name: string;
  description: string;
  competencyIds: ID[];
  prerequisiteSkillIds: ID[];
  /** Current status of this skill */
  status: MasteryState;
  /** Numeric level (1-N) for progression tracking */
  level: number;
  /** 0-1 confidence score */
  confidence: number;
  /** Recent evidence items */
  recentEvidence: Array<{
    type: string;
    description: string;
    timestamp: ISODate;
  }>;
  /** Number of practice sessions completed */
  practiceCount: number;
  /** Whether this skill needs review */
  needsReview: boolean;
  /** Related skills for recommendation */
  relatedSkillIds: ID[];
  /** Next recommended action */
  nextRecommendation: {
    type: "practice" | "project" | "assessment" | "review";
    title: string;
    reason: string;
  } | null;
}

export interface Competency {
  id: ID;
  skillId: ID;
  name: string;
  objectiveIds: ID[];
}

export interface LearningObjective {
  id: ID;
  competencyId: ID;
  statement: string;
  /** Bloom-style cognitive demand, used for age adaptation. */
  cognitiveLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
  ageBands: AgeBand[];
}

export type ActivityKind =
  | "story"
  | "explanation"
  | "visual-coding"
  | "code-editor"
  | "conversation"
  | "quiz"
  | "build"
  | "research"
  | "reflection"
  | "design";

export interface Activity {
  id: ID;
  missionId: ID;
  objectiveId: ID;
  kind: ActivityKind;
  title: string;
  estimatedMinutes: number;
  ageBands: AgeBand[];
  voiceSupported: boolean;
}

export interface Mission {
  id: ID;
  worldId: ID;
  domainId: ID;
  title: string;
  premise: string;
  guideCharacterId: ID;
  objectiveIds: ID[];
  activityIds: ID[];
  ageBands: AgeBand[];
  estimatedMinutes: number;
  status: "locked" | "available" | "in-progress" | "completed";
  progress: number;
  rewardIds: ID[];
}

export interface World {
  id: ID;
  name: string;
  description: string;
  guideCharacterId: ID;
  domainIds: ID[];
  missionIds: ID[];
  unlocked: boolean;
  ambientColor: string;
}

export interface Practice {
  id: ID;
  objectiveId: ID;
  title: string;
  itemCount: number;
  dueAt: ISODate | null;
  reason: "spaced-review" | "shaky-mastery" | "pre-assessment";
}

export interface Project {
  id: ID;
  title: string;
  brief: string;
  domainIds: ID[];
  competencyIds: ID[];
  ageBands: AgeBand[];
  stage: "brief" | "planning" | "building" | "feedback" | "published";
  mentorCharacterId: ID;
  progress: number;
}

export interface Assessment {
  id: ID;
  objectiveIds: ID[];
  title: string;
  kind: "diagnostic" | "formative" | "performance" | "portfolio-review";
  status: "not-scheduled" | "available" | "in-progress" | "scored";
  score: number | null;
}

export interface MasteryRecord {
  competencyId: ID;
  state: MasteryState;
  /** 0–1 confidence produced by the future adaptive engine. */
  confidence: number;
  evidenceCount: number;
  lastPracticedAt: ISODate | null;
  nextReviewAt: ISODate | null;
}

export interface ProgressRecord {
  learnerId: ID;
  domainId: ID;
  masteredCompetencies: number;
  totalCompetencies: number;
  minutesLearned: number;
  weeklyMinutes: number[];
}

export interface Challenge {
  id: ID;
  title: string;
  description: string;
  domainId: ID;
  ageBands: AgeBand[];
  mode: "solo" | "team" | "head-to-head";
  rivalCharacterId: ID | null;
  endsAt: ISODate;
  participants: number;
}

/* --------------------------- rewards & identity --------------------------- */

export interface Achievement {
  id: ID;
  title: string;
  /** Achievements always cite the learning evidence behind them. */
  evidence: string;
  competencyId: ID;
  earnedAt: ISODate | null;
}

export interface Reward {
  id: ID;
  title: string;
  kind: "unlock" | "item" | "world-access" | "character-access";
  itemId: ID | null;
}

export interface InventoryItem {
  id: ID;
  name: string;
  slot: "outfit" | "accessory" | "companion" | "workspace";
  unlocked: boolean;
  unlockedByCompetencyId: ID | null;
}

export interface PortfolioItem {
  id: ID;
  title: string;
  summary: string;
  projectId: ID | null;
  domainIds: ID[];
  createdAt: ISODate;
  visibility: "private" | "family" | "community";
  parentApprovalRequired: boolean;
}

/* ------------------------------- AI surfaces ------------------------------ */

export interface AIMessage {
  id: ID;
  conversationId: ID;
  author: "learner" | "character" | "system";
  characterId: ID | null;
  text: string;
  kind: "chat" | "hint" | "explanation" | "reflection-prompt" | "safety-notice";
  createdAt: ISODate;
}

export interface AIConversation {
  id: ID;
  characterId: ID;
  learnerId: ID;
  missionId: ID | null;
  objectiveId: ID | null;
  messages: AIMessage[];
  state: "idle" | "streaming" | "awaiting-learner" | "blocked" | "error";
  safety: { blocked: boolean; reason: string | null };
}

export interface VoiceSession {
  id: ID;
  conversationId: ID;
  state: VoiceState;
  muted: boolean;
  transcriptPartial: string | null;
}

export interface LearnerContext {
  learnerId: ID;
  ageBand: AgeBand;
  currentWorldId: ID | null;
  currentMissionId: ID | null;
  currentObjectiveId: ID | null;
  recentMastery: MasteryRecord[];
  interests: string[];
}

export interface Recommendation {
  id: ID;
  kind: "mission" | "practice" | "project" | "challenge" | "review";
  targetId: ID;
  title: string;
  rationale: string;
  confidence: number;
}

/* ----------------------------- social & safety ---------------------------- */

export interface Guild {
  id: ID;
  name: string;
  memberCount: number;
  focusDomainId: ID;
  moderated: true;
}

export interface LeaderboardEntry {
  learnerId: ID;
  displayName: string;
  /** Ranked on learning evidence, not raw points. */
  competenciesMastered: number;
  rank: number;
}

export interface Leaderboard {
  id: ID;
  scope: "guild" | "challenge" | "world";
  entries: LeaderboardEntry[];
}

export interface Notification {
  id: ID;
  title: string;
  body: string;
  kind: "progress" | "mission" | "parent" | "safety" | "community";
  read: boolean;
  createdAt: ISODate;
}

export interface SafetySettings {
  parentalControlsEnabled: boolean;
  communityEnabled: boolean;
  voiceEnabled: boolean;
  sessionLimitMinutes: number;
  contentFilter: "strict" | "balanced";
  pendingParentApprovals: number;
}

/* --------------------------------- auth ---------------------------------- */

export interface AuthSession {
  status: "authenticated" | "anonymous" | "loading";
  learnerId: ID | null;
  role: "learner" | "parent" | "educator";
  permissions: string[];
}
