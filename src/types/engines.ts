/**
 * Engine + service contracts.
 *
 * These interfaces describe the capabilities a future backend must provide.
 * The frontend only ever talks to these shapes, so mock implementations can be
 * replaced with real network calls without touching a single component.
 */
import type {
  Achievement,
  Activity,
  AgeBand,
  AIConversation,
  AIMessage,
  Assessment,
  AuthSession,
  Challenge,
  Character,
  Competency,
  Guild,
  ID,
  Leaderboard,
  Learner,
  LearnerContext,
  LearningDomain,
  LearningObjective,
  MasteryRecord,
  Mission,
  Notification,
  PortfolioItem,
  Practice,
  ProgressRecord,
  Project,
  Recommendation,
  SafetySettings,
  Skill,
  VoiceState,
  World,
} from "./domain";

/* ------------------------------------------------------------------ */
/* Content entities that only exist on the experience layer for now     */
/* ------------------------------------------------------------------ */

export interface StoryBeat {
  id: ID;
  speakerCharacterId: ID | null;
  text: string;
  /** What the beat teaches — narrative always carries a learning payload. */
  teaches: string;
  choices: { id: ID; label: string; consequence: string }[];
}

export interface Story {
  id: ID;
  title: string;
  worldId: ID;
  domainId: ID;
  ageBands: AgeBand[];
  premise: string;
  minutes: number;
  beats: StoryBeat[];
}

export interface Simulation {
  id: ID;
  title: string;
  domainId: ID;
  ageBands: AgeBand[];
  scenario: string;
  variables: { id: ID; label: string; unit: string; min: number; max: number; value: number }[];
  successCriteria: string[];
  reflectionPrompt: string;
}

export interface EnglishDrill {
  id: ID;
  title: string;
  focus: "pronunciation" | "vocabulary" | "conversation" | "writing" | "listening";
  ageBands: AgeBand[];
  prompt: string;
  targetPhrases: string[];
  rubric: string[];
  voiceEnabled: boolean;
}

export interface CodingExercise {
  id: ID;
  title: string;
  surface: "visual-blocks" | "blocks-and-script" | "code-editor";
  language: "blocks" | "python" | "javascript" | "html";
  ageBands: AgeBand[];
  brief: string;
  starter: string;
  blocks: string[];
  checks: string[];
}

export interface SpacedReviewItem {
  id: ID;
  objectiveId: ID;
  prompt: string;
  dueAt: string;
  intervalDays: number;
  retentionEstimate: number;
}

export interface ParentInsight {
  id: ID;
  headline: string;
  detail: string;
  signal: "positive" | "watch" | "action";
  metric: string;
  value: string;
}

export interface AnalyticsSummary {
  weeklyMinutes: number[];
  domainBalance: { domainId: ID; share: number }[];
  focusScore: number;
  persistenceScore: number;
  curiosityScore: number;
}

export interface DifficultyDecision {
  objectiveId: ID;
  direction: "ease" | "hold" | "stretch";
  rationale: string;
}

export interface ContextualHint {
  id: ID;
  level: 1 | 2 | 3;
  text: string;
  revealsAnswer: boolean;
}

/* ------------------------------------------------------------------ */
/* Service contracts                                                    */
/* ------------------------------------------------------------------ */

export interface AuthService {
  getSession(): Promise<AuthSession>;
}

export interface LearnerService {
  getCurrent(): Promise<Learner>;
  getContext(): Promise<LearnerContext>;
}

export interface CharacterService {
  list(): Promise<Character[]>;
  get(id: ID): Promise<Character | null>;
}

export interface LearningService {
  listDomains(): Promise<LearningDomain[]>;
  listSkills(domainId?: ID): Promise<Skill[]>;
  listCompetencies(skillIds?: ID[]): Promise<Competency[]>;
  listObjectives(): Promise<LearningObjective[]>;
}

export interface MissionService {
  list(filter?: { worldId?: ID; domainId?: ID }): Promise<Mission[]>;
  get(id: ID): Promise<Mission | null>;
  listActivities(missionId: ID): Promise<Activity[]>;
}

export interface AssessmentService {
  list(): Promise<Assessment[]>;
}

export interface ProjectService {
  list(): Promise<Project[]>;
  get(id: ID): Promise<Project | null>;
}

export interface PortfolioService {
  list(): Promise<PortfolioItem[]>;
}

export interface AIService {
  getConversation(): Promise<AIConversation>;
  sendMessage(conversationId: ID, text: string): Promise<AIMessage>;
  listRecommendations(): Promise<Recommendation[]>;
  listHints(objectiveId: ID): Promise<ContextualHint[]>;
}

export interface VoiceService {
  start(): Promise<{ sessionId: ID; state: VoiceState }>;
  stop(sessionId: ID): Promise<{ transcript: string }>;
  speak(text: string): Promise<{ durationMs: number }>;
}

export interface ProgressService {
  listMastery(): Promise<MasteryRecord[]>;
  listProgress(): Promise<ProgressRecord[]>;
  listReview(): Promise<SpacedReviewItem[]>;
  listPractice(): Promise<Practice[]>;
}

export interface AchievementService {
  list(): Promise<Achievement[]>;
  listChallenges(): Promise<Challenge[]>;
}

export interface CommunityService {
  listGuilds(): Promise<Guild[]>;
  getLeaderboard(): Promise<Leaderboard>;
}

export interface NotificationService {
  list(): Promise<Notification[]>;
}

export interface ContentService {
  listWorlds(): Promise<World[]>;
  listStories(): Promise<Story[]>;
  getStory(id: ID): Promise<Story | null>;
  listSimulations(): Promise<Simulation[]>;
  listEnglishDrills(): Promise<EnglishDrill[]>;
  listCodingExercises(): Promise<CodingExercise[]>;
}

export interface AnalyticsService {
  getSummary(): Promise<AnalyticsSummary>;
  listParentInsights(): Promise<ParentInsight[]>;
}

export interface SafetyService {
  getSettings(): Promise<SafetySettings>;
}

export interface AdaptiveDifficultyEngine {
  decide(objectiveId: ID): Promise<DifficultyDecision>;
}
