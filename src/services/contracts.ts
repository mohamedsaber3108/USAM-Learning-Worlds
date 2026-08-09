/**
 * Phase 17: Backend Service Contracts
 *
 * Complete TypeScript interfaces for all backend services.
 * Frontend ONLY talks to these interfaces - backend can implement however it wants.
 *
 * CRITICAL: These are contracts, not implementations.
 * Every service interface here must be implemented (mock today, real tomorrow).
 */

import type { ID, ISODate, AgeBand, MasteryState } from "@/types/domain";
import type { ProjectState, ProjectVisibility } from "@/types/projects";
import type { ModerationState } from "@/types/community";
import type { EvidenceType } from "@/types/curriculum";

/* -------------------------------- Request DTOs ------------------------------- */

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ContentSubmission {
  type: "message" | "showcase" | "feedback" | "project" | "comment";
  content: string;
  contextId: ID;
  metadata?: Record<string, unknown>;
}

export interface EvidenceSubmission {
  competencyId: ID;
  evidenceType: EvidenceType;
  description: string;
  activityId?: ID;
  projectId?: ID;
  artifactUrl?: string;
  timestamp: ISODate;
}

export interface ActivityResult {
  activityId: ID;
  objectiveId: ID;
  success: boolean;
  timeSpentMs: number;
  attempts: number;
  responseData?: Record<string, unknown>;
}

export interface ProjectCreate {
  title: string;
  goal: string;
  domainIds: ID[];
  skillIds: ID[];
  visibility: ProjectVisibility;
  ageBand: AgeBand;
}

export interface ProjectUpdate {
  title?: string;
  goal?: string;
  state?: ProjectState;
  visibility?: ProjectVisibility;
  progress?: number;
}

export interface MilestoneCreate {
  title: string;
  description: string;
  targetDate?: ISODate;
  order: number;
}

export interface ArtifactUpload {
  title: string;
  description: string;
  fileUrl?: string;
  fileType?: string;
  thumbnailUrl?: string;
}

export interface ReflectionCreate {
  prompt: string;
  response: string;
  mood?: string;
}

export interface ReportCreate {
  targetType: "content" | "user" | "conversation" | "project";
  targetId: ID;
  reason: ReportReason;
  description?: string;
}

export type ReportReason =
  | "inappropriate-content"
  | "bullying"
  | "spam"
  | "personal-info"
  | "unsafe-behavior"
  | "other";

export interface SafeMessageCreate {
  contextType: "team" | "guild" | "feedback" | "project";
  contextId: ID;
  recipientIds: ID[];
  templateId: ID;
  templateValues: Record<string, string>;
}

export interface ShowcaseCreate {
  projectId: ID;
  title: string;
  description: string;
  thumbnailUrl: string;
  visibility: ProjectVisibility;
}

export interface ShowcaseFilter {
  domainId?: ID;
  ageBand?: AgeBand;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface ControlsUpdate {
  communityEnabled?: boolean;
  canJoinGroups?: boolean;
  canJoinChallenges?: boolean;
  canShowcasePublicly?: boolean;
  canGivePeerFeedback?: boolean;
  canJoinEvents?: boolean;
  requireApprovalFor?: Array<"join-group" | "showcase" | "feedback" | "event">;
  notifyParentFor?: Array<"reports" | "flags" | "new-connections" | "all">;
}

export interface SafetySettingsUpdate {
  parentalControlsEnabled?: boolean;
  communityEnabled?: boolean;
  voiceEnabled?: boolean;
  sessionLimitMinutes?: number;
  contentFilter?: "strict" | "balanced";
}

export interface ContentFilter {
  domainId?: ID;
  ageBand?: AgeBand;
  difficulty?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AnalyticsEvent {
  type: string;
  learnerId: ID;
  timestamp: ISODate;
  metadata?: Record<string, unknown>;
}

export interface IncidentReport {
  learnerId: ID;
  type: "safety-concern" | "technical-issue" | "content-issue";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  contextId?: ID;
  timestamp: ISODate;
}

/* -------------------------------- Response DTOs ------------------------------ */

export interface MissionResult {
  missionId: ID;
  completedAt: ISODate;
  xpGained: number;
  coinsGained: number;
  achievementsUnlocked: ID[];
  rewardsUnlocked: ID[];
  nextMissionId: ID | null;
}

export interface ContentSafetyCheck {
  safe: boolean;
  reasons: string[];
  severity: "low" | "medium" | "high";
  blockedWords?: string[];
}

export interface ModerationStatus {
  state: ModerationState;
  submittedAt: ISODate;
  reviewedAt?: ISODate;
  reviewedBy?: "auto" | "human";
  feedback?: string;
}

export interface ReviewSchedule {
  competencyId: ID;
  nextReviewAt: ISODate;
  interval: number; // days
  reason: "spaced-repetition" | "low-confidence" | "pre-assessment";
}

export interface SkillStatus {
  skillId: ID;
  masteryState: MasteryState;
  confidence: number;
  evidenceCount: number;
  recentEvidence: Array<{
    type: EvidenceType;
    description: string;
    timestamp: ISODate;
  }>;
  practiceCount: number;
  needsReview: boolean;
  nextRecommendation: SkillRecommendation | null;
}

export interface SkillRecommendation {
  type: "practice" | "project" | "assessment" | "review";
  title: string;
  reason: string;
  targetId?: ID;
}

export interface WorldProgress {
  worldId: ID;
  unlocked: boolean;
  missionsCompleted: number;
  totalMissions: number;
  progress: number; // 0-1
  lastVisited: ISODate | null;
}

export interface NextActivity {
  id: ID;
  title: string;
  kind: string;
  minutes: number;
  because: string;
  action: { label: string; to: string };
}

export interface PendingApproval {
  id: ID;
  type: "join-group" | "showcase" | "feedback" | "event";
  description: string;
  submittedAt: ISODate;
  childId: ID;
  targetId: ID;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

export interface AIMessageChunk {
  delta: string;
  done: boolean;
}

/* -------------------------------- Service Interfaces ------------------------- */

export interface AuthService {
  getSession(): Promise<import("@/types/domain").AuthSession>;
  signIn(credentials: SignInRequest): Promise<import("@/types/domain").AuthSession>;
  signOut(): Promise<void>;
  refreshSession(): Promise<import("@/types/domain").AuthSession>;
}

export interface LearnerService {
  getCurrent(): Promise<import("@/types/domain").Learner>;
  getContext(): Promise<import("@/types/domain").LearnerContext>;
  getCustomization(): Promise<import("@/types/domain").CharacterCustomization>;
  getInventory(): Promise<import("@/types/domain").InventoryItem[]>;
  updateProfile(updates: Partial<import("@/types/domain").LearnerProfile>): Promise<void>;
  updateCustomization(
    updates: Partial<import("@/types/domain").CharacterCustomization>
  ): Promise<void>;
}

export interface CurriculumService {
  listDomains(): Promise<import("@/types/domain").LearningDomain[]>;
  getDomain(id: ID): Promise<import("@/types/domain").LearningDomain | null>;
  listSkills(domainId?: ID): Promise<import("@/types/domain").Skill[]>;
  getSkill(id: ID): Promise<import("@/types/domain").Skill | null>;
  listCompetencies(skillIds?: ID[]): Promise<import("@/types/domain").Competency[]>;
  listObjectives(): Promise<import("@/types/domain").LearningObjective[]>;
  getSkillGraph(domainId: ID): Promise<import("@/types/curriculum").CurriculumGraph>;
}

export interface WorldService {
  list(): Promise<import("@/types/domain").World[]>;
  get(id: ID): Promise<import("@/types/domain").World | null>;
  unlock(id: ID): Promise<void>;
  getProgress(id: ID): Promise<WorldProgress>;
}

export interface MissionService {
  list(filter?: { worldId?: ID; domainId?: ID }): Promise<import("@/types/domain").Mission[]>;
  get(id: ID): Promise<import("@/types/domain").Mission | null>;
  start(id: ID): Promise<void>;
  complete(id: ID): Promise<MissionResult>;
  listActivities(missionId: ID): Promise<import("@/types/domain").Activity[]>;
  getActivity(id: ID): Promise<import("@/types/domain").Activity | null>;
  submitActivityResult(activityId: ID, result: ActivityResult): Promise<void>;
}

export interface MasteryService {
  list(): Promise<import("@/types/domain").MasteryRecord[]>;
  get(competencyId: ID): Promise<import("@/types/domain").MasteryRecord | null>;
  recordEvidence(evidence: EvidenceSubmission): Promise<void>;
  listProgress(): Promise<import("@/types/domain").ProgressRecord[]>;
  listAchievements(): Promise<import("@/types/domain").Achievement[]>;
  getSkillStatus(skillId: ID): Promise<SkillStatus>;
}

export interface ProjectService {
  list(filter?: { state?: ProjectState }): Promise<import("@/types/projects").Project[]>;
  get(id: ID): Promise<import("@/types/projects").Project | null>;
  create(project: ProjectCreate): Promise<import("@/types/projects").Project>;
  update(id: ID, updates: ProjectUpdate): Promise<void>;
  delete(id: ID): Promise<void>;
  submitForReview(id: ID): Promise<void>;
  addMilestone(projectId: ID, milestone: MilestoneCreate): Promise<void>;
  addArtifact(projectId: ID, artifact: ArtifactUpload): Promise<void>;
  addReflection(projectId: ID, reflection: ReflectionCreate): Promise<void>;
}

export interface ProgressionService {
  getLevel(): Promise<import("@/types/progression").LearnerLevel>;
  getXPHistory(): Promise<import("@/types/progression").XPGain[]>;
  getCoinsBalance(): Promise<import("@/types/progression").CoinsBalance>;
  spendCoins(itemId: ID, amount: number): Promise<void>;
  getStreak(): Promise<import("@/types/progression").PracticeStreak>;
  listAchievements(): Promise<import("@/types/progression").Achievement[]>;
  getLeaderboard(scope: string): Promise<import("@/types/progression").Leaderboard>;
  optInLeaderboard(): Promise<void>;
  optOutLeaderboard(): Promise<void>;
}

export interface CommunityService {
  // Teams
  listTeams(): Promise<import("@/types/community").Team[]>;
  getTeam(id: ID): Promise<import("@/types/community").Team | null>;
  joinTeam(id: ID): Promise<void>;
  leaveTeam(id: ID): Promise<void>;

  // Guilds
  listGuilds(): Promise<import("@/types/community").Guild[]>;
  getGuild(id: ID): Promise<import("@/types/community").Guild | null>;
  joinGuild(id: ID): Promise<void>;
  leaveGuild(id: ID): Promise<void>;

  // Messages
  sendMessage(message: SafeMessageCreate): Promise<void>;
  listMessages(contextId: ID): Promise<import("@/types/community").SafeMessage[]>;

  // Showcases
  listShowcases(filter?: ShowcaseFilter): Promise<import("@/types/community").Showcase[]>;
  createShowcase(showcase: ShowcaseCreate): Promise<void>;
  reactToShowcase(showcaseId: ID, reaction: string): Promise<void>;

  // Challenges
  listChallenges(): Promise<import("@/types/community").CommunityChallenge[]>;
  joinChallenge(id: ID): Promise<void>;

  // Events
  listEvents(): Promise<import("@/types/community").CommunityEvent[]>;
  registerForEvent(id: ID): Promise<void>;
}

export interface ModerationService {
  submitForReview(content: ContentSubmission): Promise<void>;
  getContentStatus(contentId: ID): Promise<ModerationStatus>;
  listPendingReviews(): Promise<Array<{ id: ID; type: string; submittedAt: ISODate }>>;

  // Reporting
  submitReport(report: ReportCreate): Promise<void>;
  listReports(userId: ID): Promise<Array<{ id: ID; targetId: ID; reason: string; status: string }>>;

  // Blocking
  blockUser(userId: ID, reason?: string): Promise<void>;
  unblockUser(userId: ID): Promise<void>;
  listBlockedUsers(): Promise<Array<{ userId: ID; blockedAt: ISODate; reason?: string }>>;
}

export interface ParentService {
  // Dashboard
  getDashboard(childId: ID): Promise<import("@/types/parent").ParentDashboard>;

  // Reports
  getWeeklyReport(childId: ID): Promise<import("@/types/parent").WeeklyReport>;
  getMonthlyReport(childId: ID, month: string): Promise<import("@/types/parent").MonthlyReport>;
  listMilestoneReports(childId: ID): Promise<import("@/types/parent").MilestoneReport[]>;

  // Controls
  getControls(childId: ID): Promise<import("@/types/community").ParentalCommunityControls>;
  updateControls(childId: ID, updates: ControlsUpdate): Promise<void>;

  // Approvals
  listPendingApprovals(childId: ID): Promise<PendingApproval[]>;
  approveItem(itemId: ID): Promise<void>;
  denyItem(itemId: ID, reason?: string): Promise<void>;

  // Safety
  getSafetyDashboard(childId: ID): Promise<import("@/types/community").SafetyDashboard>;
}

export interface AIService {
  getConversation(id?: ID): Promise<import("@/types/domain").AIConversation>;
  sendMessage(conversationId: ID, text: string): Promise<import("@/types/domain").AIMessage>;
  streamMessage(conversationId: ID, text: string): AsyncIterable<AIMessageChunk>;
  listRecommendations(): Promise<import("@/types/domain").Recommendation[]>;
  getHints(objectiveId: ID): Promise<import("@/types/engines").ContextualHint[]>;
  generateExplanation(conceptId: ID): Promise<string>;
}

export interface AdaptiveService {
  decideDifficulty(objectiveId: ID): Promise<import("@/types/engines").DifficultyDecision>;
  getNextActivity(learnerId: ID): Promise<NextActivity>;
  scheduleReview(competencyId: ID): Promise<ReviewSchedule>;
  updateConfidence(competencyId: ID, result: ActivityResult): Promise<void>;
}

export interface VoiceService {
  start(): Promise<import("@/types/domain").VoiceSession>;
  stop(sessionId: ID): Promise<{ transcript: string }>;
  speak(text: string): Promise<{ durationMs: number }>;
  getSupportedLanguages(): Promise<string[]>;
}

export interface ContentService {
  listStories(filter?: ContentFilter): Promise<import("@/types/engines").Story[]>;
  getStory(id: ID): Promise<import("@/types/engines").Story | null>;
  listSimulations(filter?: ContentFilter): Promise<import("@/types/engines").Simulation[]>;
  listEnglishDrills(filter?: ContentFilter): Promise<import("@/types/engines").EnglishDrill[]>;
  listCodingExercises(filter?: ContentFilter): Promise<import("@/types/engines").CodingExercise[]>;
}

export interface AnalyticsService {
  getSummary(learnerId: ID): Promise<import("@/types/engines").AnalyticsSummary>;
  listParentInsights(childId: ID): Promise<import("@/types/engines").ParentInsight[]>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
}

export interface SafetyService {
  getSettings(learnerId: ID): Promise<import("@/types/domain").SafetySettings>;
  updateSettings(learnerId: ID, updates: SafetySettingsUpdate): Promise<void>;
  checkContent(content: string): Promise<ContentSafetyCheck>;
  reportIncident(incident: IncidentReport): Promise<void>;
}

export interface NotificationService {
  list(): Promise<import("@/types/domain").Notification[]>;
  markRead(id: ID): Promise<void>;
  markAllRead(): Promise<void>;
  delete(id: ID): Promise<void>;
}

export interface CharacterService {
  list(): Promise<import("@/types/domain").Character[]>;
  get(id: ID): Promise<import("@/types/domain").Character | null>;
  unlock(id: ID): Promise<void>;
  getState(id: ID): Promise<import("@/types/domain").CharacterState | null>;
}

export interface PortfolioService {
  list(learnerId: ID): Promise<import("@/types/domain").PortfolioItem[]>;
  add(item: Omit<import("@/types/domain").PortfolioItem, "id">): Promise<void>;
  update(id: ID, updates: Partial<import("@/types/domain").PortfolioItem>): Promise<void>;
  delete(id: ID): Promise<void>;
}

export interface ReviewService {
  listDue(): Promise<import("@/types/engines").SpacedReviewItem[]>;
  complete(itemId: ID, success: boolean): Promise<void>;
}

/**
 * CRITICAL: Backend Implementation Notes
 *
 * 1. **Transport Agnostic**
 *    - These interfaces work with REST, GraphQL, gRPC, or any other transport
 *    - Frontend doesn't care how data is fetched, only that it matches types
 *
 * 2. **Error Handling**
 *    - Every method can throw ServiceError
 *    - Frontend handles: NETWORK_ERROR, AUTH_REQUIRED, FORBIDDEN, NOT_FOUND, etc.
 *
 * 3. **Loading States**
 *    - Every async call is wrapped in React Query
 *    - Frontend handles: idle, loading, success, empty, error
 *
 * 4. **Validation**
 *    - Frontend validates before submission
 *    - Backend MUST validate again (never trust client)
 *
 * 5. **Authentication**
 *    - AuthService provides session
 *    - All other services assume authenticated context
 *    - Backend MUST verify auth on every request
 *
 * 6. **Authorization**
 *    - Age-based access rules enforced on backend
 *    - Parent approval requirements enforced on backend
 *    - Moderation requirements enforced on backend
 *
 * 7. **Privacy**
 *    - Backend NEVER exposes data user shouldn't see
 *    - Parent service respects privacy rules
 *    - Moderation logs are admin-only
 *
 * 8. **Safety**
 *    - All content goes through SafetyService.checkContent
 *    - All user submissions go through ModerationService
 *    - All reports handled with urgency
 *
 * 9. **Performance**
 *    - Use pagination for large lists (limit/offset in filters)
 *    - Cache aggressively on backend
 *    - Frontend uses React Query for caching
 *
 * 10. **Backward Compatibility**
 *     - Once deployed, these interfaces are contracts
 *     - Backend can add fields, but not remove or change types
 *     - Version API if breaking changes needed
 */
