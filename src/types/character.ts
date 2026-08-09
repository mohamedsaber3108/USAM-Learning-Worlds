/**
 * Phase 6 — character ecosystem and voice-first interaction.
 *
 * Characters are teaching instruments with a personality, not friends a child
 * is meant to need. Every type here carries the constraints that keep them on
 * that side of the line: interaction rules, safety guardrails and an explicit
 * offline-encouragement policy live in the model, not in component copy.
 */
import type { AgeBand, CharacterRole, ID } from "@/types/domain";

/* ------------------------------ living states ----------------------------- */

/** The full expressive vocabulary a character can be in. */
export type CharacterActivityState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "excited"
  | "curious"
  | "encouraging"
  | "confused"
  | "celebrating"
  | "waiting"
  | "explaining"
  | "asking"
  | "reflecting";

export interface CharacterStateDescriptor {
  state: CharacterActivityState;
  label: string;
  /** What the learner should understand is happening. */
  meaning: string;
  /** Visual language: aura tone, motion and eye shape hints for the renderer. */
  tone: "neutral" | "primary" | "secondary" | "success" | "warning" | "accent";
  motion: "still" | "breathe" | "pulse" | "bounce" | "wave";
  /** True when the character is occupying the turn — the composer waits. */
  holdsTurn: boolean;
}

/* --------------------------- character profiles --------------------------- */

export interface CharacterIdentity {
  id: ID;
  name: string;
  pronouns: string;
  origin: string;
  /** One line the character would use to describe itself to a child. */
  selfDescription: string;
}

export interface CharacterPersonality {
  traits: string[];
  warmth: number;
  directness: number;
  humour: number;
  patience: number;
  /** Things this character will never do, in its own terms. */
  neverDoes: string[];
}

export interface CommunicationStyle {
  sentenceLength: "short" | "medium" | "varied";
  questionsFirst: boolean;
  usesMetaphor: boolean;
  correctionStyle: "in-context" | "after-the-fact" | "learner-asks-first";
  praiseStyle: "specific-evidence" | "sparing" | "warm-and-specific";
  vocabulary: string;
}

export interface CharacterAgeAdaptation {
  band: AgeBand;
  /** How the same character sounds at this age. Same role, different register. */
  register: string;
  exampleLine: string;
  maxWordsPerTurn: number;
  voiceFirst: boolean;
}

export interface CharacterExpertise {
  domainIds: ID[];
  teaches: string[];
  /** Explicit boundaries — what this character redirects elsewhere. */
  doesNotTeach: string[];
  signatureMove: string;
}

export interface VisualIdentity {
  glyph: string;
  accentColor: string;
  silhouette: "orb" | "creature" | "humanoid" | "construct" | "abstract";
  /** Per-state visual overrides the portrait renderer can pick up. */
  auraByState: Partial<Record<CharacterActivityState, string>>;
}

export interface VoiceIdentity {
  /** Provider-agnostic — a future TTS backend maps these to a real voice. */
  voiceId: string;
  description: string;
  pace: "slow" | "measured" | "brisk";
  pitch: "low" | "mid" | "high";
  captionsAlwaysAvailable: true;
}

export interface InteractionRules {
  /** Hard limits that keep the relationship non-dependent. */
  maxConsecutiveTurns: number;
  suggestsBreaksAfterMinutes: number;
  encouragesOfflineActivity: boolean;
  neverUsesGuilt: true;
  neverAsksForSecrecy: true;
  redirectsToAdultWhen: string[];
  refusesTopics: string[];
  /** Answers are scaffolded; the character does not simply solve the task. */
  answerPolicy: "hints-before-answers" | "questions-only" | "reviews-not-writes";
}

export interface CharacterProfile {
  identity: CharacterIdentity;
  role: CharacterRole;
  roleLabel: string;
  domainIds: ID[];
  personality: CharacterPersonality;
  communication: CommunicationStyle;
  ageAdaptation: Record<AgeBand, CharacterAgeAdaptation>;
  expertise: CharacterExpertise;
  visual: VisualIdentity;
  voice: VoiceIdentity;
  rules: InteractionRules;
}

/* ------------------------------ voice service ----------------------------- */

export type VoiceSessionState =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "listening"
  | "processing"
  | "speaking"
  | "interrupted"
  | "muted"
  | "error";

export interface VoiceTranscriptChunk {
  sessionId: ID;
  text: string;
  /** Partial chunks stream in; final marks the end of an utterance. */
  isFinal: boolean;
  confidence: number;
  at: string;
}

export interface VoiceCaption {
  id: ID;
  characterId: ID;
  text: string;
  startedAt: string;
  /** Null while still being spoken. */
  endedAt: string | null;
}

export interface VoicePreferences {
  muted: boolean;
  /** 0–1. Persisted per learner by the future backend. */
  volume: number;
  captionsEnabled: boolean;
  autoSpeakReplies: boolean;
  speakingRate: number;
}

export interface VoiceSession {
  sessionId: ID;
  state: VoiceSessionState;
  startedAt: string;
  characterId: ID;
  error: string | null;
}

/**
 * Frontend contract for voice. Deliberately stream-shaped so a real
 * websocket/SSE backend can replace the mock without touching components.
 */
export interface VoiceService {
  getPreferences(): Promise<VoicePreferences>;
  setPreferences(patch: Partial<VoicePreferences>): Promise<VoicePreferences>;

  /** Mic capture. `onChunk` receives partial then final transcript chunks. */
  startRecording(
    characterId: ID,
    onChunk: (chunk: VoiceTranscriptChunk) => void,
  ): Promise<VoiceSession>;
  stopRecording(sessionId: ID): Promise<{ transcript: string; session: VoiceSession }>;
  cancelRecording(sessionId: ID): Promise<VoiceSession>;
  retryRecording(sessionId: ID): Promise<VoiceSession>;

  /** Playback. `onCaption` streams caption text as it is spoken. */
  speak(
    characterId: ID,
    text: string,
    onCaption: (caption: VoiceCaption) => void,
  ): Promise<{ durationMs: number }>;
  interrupt(sessionId: ID): Promise<VoiceSession>;
}

/* --------------------------- conversation context -------------------------- */

export interface WorldContext {
  worldId: ID;
  worldName: string;
  biome: string;
}

export interface MissionContext {
  missionId: ID;
  title: string;
  stage: string;
  attemptCount: number;
}

export interface SkillContext {
  skillId: ID;
  name: string;
  masteryState: string;
  objectiveStatement: string;
}

export interface ProjectContext {
  projectId: ID;
  title: string;
  status: "draft" | "in-review" | "published";
}

export interface DifficultyContext {
  level: "supported" | "steady" | "stretch";
  recentSuccessRate: number;
  hintsUsedRecently: number;
}

export interface ProgressContext {
  minutesThisSession: number;
  objectivesTouchedToday: number;
  lastBreakMinutesAgo: number;
}

/**
 * Everything the AI is allowed to know about "where the learner is".
 * Assembled by the app, never inferred by the model from free text.
 */
export interface ConversationContext {
  learnerId: ID;
  ageBand: AgeBand;
  world: WorldContext | null;
  mission: MissionContext | null;
  skill: SkillContext | null;
  project: ProjectContext | null;
  difficulty: DifficultyContext;
  progress: ProgressContext;
}

/* ------------------------------ conversation ------------------------------ */

export type ConversationTurnSource = "text" | "voice" | "quick-reply" | "action";

export interface QuickReply {
  id: ID;
  label: string;
  /** Why this reply is offered here — useful for later analytics. */
  intent: "clarify" | "hint" | "example" | "harder" | "easier" | "stop" | "reflect";
}

export interface ContextualAction {
  id: ID;
  label: string;
  description: string;
  glyph: string;
  targetPath: string;
  /** Actions are context-derived; this names the context that produced it. */
  because: string;
}

export interface ConversationAttachment {
  id: ID;
  kind: "image" | "audio" | "code" | "document";
  name: string;
  /** Attachments are declared in the model but not enabled in the UI yet. */
  status: "planned";
}

export interface ConversationTurn {
  id: ID;
  conversationId: ID;
  authorId: ID | "learner";
  role: "learner" | "character" | "system";
  text: string;
  source: ConversationTurnSource;
  at: string;
  state: CharacterActivityState | null;
  quickReplies: QuickReply[];
  actions: ContextualAction[];
  attachments: ConversationAttachment[];
  /** Set when a safety rule shaped or blocked the reply. */
  safetyNote: string | null;
  spokenCaption: string | null;
}

export interface Conversation {
  id: ID;
  characterId: ID;
  context: ConversationContext;
  turns: ConversationTurn[];
  startedAt: string;
  /** Rises with consecutive turns; drives the break suggestion. */
  consecutiveTurns: number;
}

/* --------------------------------- safety --------------------------------- */

export type SafetyAffordanceKind =
  | "report"
  | "talk-to-adult"
  | "take-a-break"
  | "go-offline"
  | "what-is-saved"
  | "end-conversation";

export interface SafetyAffordance {
  kind: SafetyAffordanceKind;
  label: string;
  description: string;
  glyph: string;
  /** Age bands where this affordance is shown prominently. */
  prominentFor: AgeBand[];
}

export interface SafetyDisclosure {
  id: ID;
  title: string;
  body: string;
  /** Plain-language version shown to the youngest band. */
  simpleBody: string;
}

export interface OfflineSuggestion {
  id: ID;
  title: string;
  description: string;
  minutes: number;
  /** Offline work is real work — this names what it practises. */
  practises: string;
}

export interface SafetyEvaluation {
  allowed: boolean;
  /** Present when the learner's message was redirected rather than answered. */
  redirect: {
    reason: string;
    reply: string;
    affordance: SafetyAffordanceKind;
  } | null;
}
