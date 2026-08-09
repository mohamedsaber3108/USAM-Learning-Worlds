/**
 * Onboarding domain model.
 *
 * Everything the child produces while entering the world is captured here so a
 * future backend can persist it verbatim: character creation, the discovery
 * conversation, and the relationships they begin with the cast.
 *
 * No component owns onboarding data — it always flows through these shapes and
 * the `OnboardingRepository` contract at the bottom of this file.
 */
import type {
  AgeBand,
  Achievement,
  CharacterRole,
  ID,
  ISODate,
  InteractionStyle,
  LearnerProfile,
  MasteryState,
} from "@/types/domain";

/* ------------------------------ character look ---------------------------- */

export type FaceShape = "round" | "oval" | "square" | "heart";
export type HairStyle =
  | "curls"
  | "waves"
  | "braids"
  | "buzz"
  | "afro"
  | "ponytail"
  | "locs"
  | "hijab";
export type ClothingStyle = "explorer" | "hoodie" | "labcoat" | "jacket" | "tunic" | "jumpsuit";
export type AccessoryId = "none" | "glasses" | "headset" | "cap" | "scarf" | "visor" | "badge";

export interface AvatarConfig {
  faceShape: FaceShape;
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  clothing: ClothingStyle;
  primaryColor: string;
  secondaryColor: string;
  accessory: AccessoryId;
}

/* ------------------------------ discovery --------------------------------- */

export type DiscoverySignalKey =
  | "interests"
  | "favoriteSubject"
  | "confidence"
  | "learningPreference"
  | "creativeInterest"
  | "codingFamiliarity"
  | "englishFamiliarity"
  | "aiFamiliarity"
  | "problemSolving"
  | "storyPreference"
  | "challengePreference"
  | "inputPreference"
  | "activityPreference";

export interface DiscoveryOption {
  id: string;
  label: string;
  /** Short companion reaction — keeps the exchange conversational, not clinical. */
  reply: string;
  /** Normalised value stored on the profile for the future adaptive engine. */
  value: string;
}

export interface DiscoveryPrompt {
  id: ID;
  signal: DiscoverySignalKey;
  /** Asked by this cast member so the child meets the roles naturally. */
  askedByRole: CharacterRole;
  question: string;
  /** Simpler phrasing used in the youngest presentation mode. */
  questionExplorer?: string;
  options: DiscoveryOption[];
  multiSelect?: boolean;
}

/** Answers collected during the discovery adventure. Never a test score. */
export type DiscoveryProfile = Partial<Record<DiscoverySignalKey, string[]>>;

/* --------------------------- created character ---------------------------- */

export interface CharacterProfile {
  id: ID;
  learnerId: ID;
  name: string;
  nickname: string;
  avatar: AvatarConfig;
  interests: string[];
  favoriteThemes: string[];
  favoriteActivities: string[];
  communicationPreference: InteractionStyle;
  createdAt: ISODate;
}

/* --------------------------- cast & relationships ------------------------- */

export interface CastMember {
  id: ID;
  name: string;
  role: CharacterRole;
  roleLabel: string;
  tagline: string;
  /** What this character actually does with the learner — a role, not a skin. */
  responsibility: string;
  accentColor: string;
  metAtOnboarding: boolean;
}

export interface RelationshipMilestone {
  id: ID;
  label: string;
  description: string;
  achievedAt: ISODate | null;
}

export interface SharedMemory {
  id: ID;
  summary: string;
  /** Memories are always learner-owned: they can be reviewed and removed. */
  createdAt: ISODate;
  topic: string;
}

export interface ConversationSnippet {
  id: ID;
  at: ISODate;
  preview: string;
}

export type CharacterReaction = "proud" | "curious" | "supportive" | "playful" | "reflective";

export interface CharacterRelationship {
  characterId: ID;
  /** 0–1. Built by consistent, honest help — never by pressure or guilt. */
  trust: number;
  /** 0–1. How well the character knows how this learner likes to work. */
  familiarity: number;
  milestones: RelationshipMilestone[];
  sharedMemories: SharedMemory[];
  favoriteTopics: string[];
  recentConversations: ConversationSnippet[];
  latestReaction: CharacterReaction;
  /** Autonomy guardrail shown in the UI: the learner is always in charge. */
  autonomyNote: string;
}

/* --------------------------- onboarding session --------------------------- */

export type OnboardingStepId =
  | "arrival"
  | "age"
  | "character"
  | "interests"
  | "discovery"
  | "cast"
  | "launch";

export interface OnboardingDraft {
  step: OnboardingStepId;
  age: number | null;
  ageBand: AgeBand | null;
  name: string;
  nickname: string;
  avatar: AvatarConfig;
  interests: string[];
  favoriteThemes: string[];
  favoriteActivities: string[];
  communicationPreference: InteractionStyle;
  discovery: DiscoveryProfile;
  metCharacterIds: ID[];
  completedAt: ISODate | null;
}

/* ------------------------------- outcome ---------------------------------- */

export interface StarterWorld {
  id: ID;
  name: string;
  description: string;
  biome: "isles" | "forest" | "city" | "orbit" | "desert" | "reef";
  guideCharacterId: ID;
}

export interface StarterMission {
  id: ID;
  title: string;
  purpose: string;
  steps: { id: ID; label: string; kind: "learn" | "practice" | "make" | "reflect" }[];
}

export interface LearningMapNode {
  domainId: ID;
  label: string;
  state: MasteryState;
  reason: string;
}

export interface StarterRecommendation {
  id: ID;
  title: string;
  reason: string;
  to: string;
}

export interface OnboardingOutcome {
  learnerProfile: LearnerProfile;
  character: CharacterProfile;
  companionId: ID;
  world: StarterWorld;
  mission: StarterMission;
  learningMap: LearningMapNode[];
  recommendations: StarterRecommendation[];
  achievement: Achievement;
  relationships: CharacterRelationship[];
}

/* ------------------------------ persistence -------------------------------- */

/** The contract a real backend must satisfy. Today: an in-memory mock. */
export interface OnboardingRepository {
  loadDraft(): Promise<OnboardingDraft | null>;
  saveDraft(draft: OnboardingDraft): Promise<OnboardingDraft>;
  complete(draft: OnboardingDraft): Promise<OnboardingOutcome>;
  loadOutcome(): Promise<OnboardingOutcome | null>;
  reset(): Promise<void>;
}
