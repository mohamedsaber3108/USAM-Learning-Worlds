# Phase 17 - Backend-Ready Frontend Contracts

## ✅ Complete Implementation

**CRITICAL: Explicit contracts for every backend dependency**

This document defines the complete TypeScript interface layer between frontend and backend, with mock implementations ready to swap for real API calls.

---

## 🎯 Core Principles

### What We Built

✅ **Explicit Interfaces** - Every entity fully typed  
✅ **Service Layer** - Single boundary between UI and data  
✅ **Mock Implementations** - Complete working mocks for every service  
✅ **API-Ready DTOs** - Clean boundaries for REST/GraphQL/RPC  
✅ **State Management** - Loading/error/empty/offline for every call  
✅ **Query Keys** - Stable cache keys for React Query  
✅ **No Direct Data Access** - UI only talks to services, never mock data  
✅ **Backend Agnostic** - No assumptions about REST vs GraphQL vs other  

### What We Explicitly REJECTED

❌ **Hard-coded backend URLs** - No fetch calls in components  
❌ **Direct mock data imports** - Components never import from `/data`  
❌ **Assumed transport** - Could be REST, GraphQL, WebSockets, gRPC  
❌ **Missing error states** - Every service call can fail  
❌ **Missing empty states** - Every list can be empty  
❌ **Missing loading states** - Every async operation takes time  

---

## 📊 Entity Model (Complete)

### Core Entities

All defined in **`src/types/domain.ts`**:

1. **Learner** - User profile, avatar, world position
2. **Character** - AI companions and mentors
3. **LearningDomain** - Top-level subjects (9 domains)
4. **Skill** - Competencies within domains (enhanced Phase 12)
5. **Competency** - Sub-skills within a skill
6. **LearningObjective** - Specific learning goals
7. **Mission** - Story-driven learning sequences
8. **Activity** - Individual learning interactions
9. **World** - Themed environments
10. **Practice** - Spaced repetition items
11. **Project** - Long-form creations
12. **Assessment** - Evaluations and checks
13. **MasteryRecord** - Progress tracking per competency
14. **ProgressRecord** - Domain-level progress
15. **Achievement** - Evidence-based accomplishments
16. **Challenge** - Community competitions
17. **Guild** - Learning communities
18. **Notification** - System messages
19. **Reward** - Unlockable content
20. **InventoryItem** - Avatar customization
21. **PortfolioItem** - Showcased work

### Mastery & Assessment (Phase 12)

All defined in **`src/types/curriculum.ts`**:

1. **MasteryStatus** - Enhanced with evidence tracking
2. **Evidence** - 8 evidence types
3. **SkillNode** - Graph representation
4. **SkillRelationship** - Skill dependencies
5. **CurriculumGraph** - Full skill map
6. **AssessmentTask** - Individual assessment items
7. **LearningPathway** - Personalized sequences

**Mastery States (7):**
- `not-started` → `introduced` → `exploring` → `practicing` → `developing` → `proficient` → `mastered` → `needs-review`

**Evidence Types (8):**
- `knowledge` - Can explain concept
- `application` - Can use in simple context
- `creation` - Can build something with it
- `explanation` - Can teach others
- `conversation` - Can discuss naturally
- `problem-solving` - Can apply to new problems
- `transfer` - Can connect across domains
- `reflection` - Can evaluate own work

### Projects & Portfolio (Phase 13)

All defined in **`src/types/projects.ts`**:

1. **Project** - Full project lifecycle
2. **ProjectState** - 7 states
3. **ProjectMilestone** - Progress markers
4. **ProjectArtifact** - Created outputs
5. **ProjectFeedback** - Mentor/peer input
6. **ProjectReflection** - Learner reflection
7. **Portfolio** - Collection of work
8. **PortfolioPresentation** - Age-adaptive views

**Project States (7):**
- `idea` → `planning` → `building` → `testing` → `improving` → `completed` → `featured`

**Privacy Levels (3):**
- `private` - Only learner and parent
- `family` - Shared with family
- `community` - Parent-approved public

### Progression & Game System (Phase 14)

All defined in **`src/types/progression.ts`**:

1. **XPGain** - Educational rewards only
2. **LearnerLevel** - Progress tiers
3. **CoinsBalance** - Virtual currency
4. **Avatar** - Visual identity
5. **Achievement** - Evidence-based
6. **PracticeStreak** - Responsible design
7. **Leaderboard** - Ethical rankings
8. **LearnerStats** - Progress metrics

**XP Sources:**
- Completing activities (base XP)
- Demonstrating evidence (bonus)
- Mastering skills (major milestone)
- Completing projects (creation bonus)
- Helping others (community bonus)
- Reflection sessions (metacognition bonus)

**NOT XP Sources:**
- ❌ Daily login
- ❌ Time spent
- ❌ Clicking around
- ❌ Watching videos
- ❌ Opening the app

### Safe Community (Phase 15)

All defined in **`src/types/community.ts`**:

1. **Team** - Small learning groups (2-8)
2. **Guild** - Larger communities (10-30)
3. **CoopMission** - Collaborative missions
4. **Showcase** - Public project displays
5. **CommunityChallenge** - Group competitions
6. **CommunityEvent** - Workshops/celebrations
7. **Hackathon** - Building events
8. **CollaborativeProject** - Multi-learner projects
9. **SafeMessage** - Structured communication
10. **ModerationState** - Content review status
11. **Report** - Safety reporting
12. **BlockedUser** - User blocking
13. **ParentalCommunityControls** - Full control panel

**Moderation States (6):**
- `draft` - Not submitted
- `pending` - Awaiting review
- `approved` - Reviewed and public
- `rejected` - Needs changes
- `flagged` - Additional review
- `removed` - Removed after approval

**Communication Model:**
- NO freeform messaging
- Structured templates only
- All moderated before delivery
- Context-bound (team/guild/project)
- Parent visibility

### Parent Experience (Phase 16)

All defined in **`src/types/parent.ts`**:

1. **ParentDashboard** - Complete overview
2. **LearningProgress** - Observation-based insights
3. **ObservationInsight** - Evidence-backed observations
4. **SkillsOverview** - Domain progress
5. **ProjectsOverview** - Project tracking
6. **EngagementPatterns** - Activity patterns
7. **TimeSpentInsights** - Learning time
8. **WorldProgression** - World exploration
9. **ParentRecommendation** - Actionable suggestions
10. **SafetyOverview** - Safety metrics
11. **CommunicationActivity** - Privacy-respecting
12. **WeeklyReport** - Visual storytelling
13. **MonthlyReport** - Growth trajectory
14. **MilestoneReport** - Celebrations

**Language Guidelines:**
- ✅ Observation-based ("Your child has spent time on...")
- ✅ Evidence-backed ("Based on completing 8 challenges...")
- ✅ Suggestion-focused ("Practice may be helpful...")
- ❌ NEVER diagnostic ("Your child has ADHD")
- ❌ NEVER labeling ("Your child is gifted/struggling")

### AI & Content Engines

All defined in **`src/types/engines.ts`**:

1. **Story** - Narrative content
2. **Simulation** - Interactive scenarios
3. **EnglishDrill** - Language practice
4. **CodingExercise** - Programming challenges
5. **SpacedReviewItem** - Review queue
6. **ContextualHint** - Adaptive hints
7. **DifficultyDecision** - Adaptive difficulty
8. **AnalyticsSummary** - Learning analytics
9. **ParentInsight** - Parent-facing analytics

---

## 🔌 Service Layer (Complete)

### Architecture Pattern

```typescript
// ✅ Components ONLY talk to services
import { learnerService } from "@/services";

// ❌ Components NEVER import mock data
// import { learner } from "@/data/mock"; // FORBIDDEN

// ✅ Service interface
export interface LearnerService {
  getCurrent(): Promise<Learner>;
  getContext(): Promise<LearnerContext>;
  updateProfile(updates: Partial<LearnerProfile>): Promise<void>;
}

// ✅ Mock implementation (today)
export const learnerService: LearnerService = {
  getCurrent: () => respond(mockLearner),
  // ... mock bodies
};

// ✅ Future real implementation (swap service file only)
export const learnerService: LearnerService = {
  getCurrent: () => fetch("/api/learner/current").then(r => r.json()),
  // ... real API calls
};
```

### Service Files

**`src/services/index.ts`** - Main service registry (existing)
- Exports all service interfaces
- Exports stable query keys
- Implements mock latency (220ms)
- 20+ service interfaces

**Additional service files:**
- `src/services/home.ts` - Home world composition
- `src/services/onboarding.ts` - Onboarding flow
- `src/services/coding.ts` - Coding world
- `src/services/english.ts` - English world
- `src/services/venture.ts` - Entrepreneurship world
- `src/services/ai-literacy.ts` - AI literacy world
- `src/services/studio.ts` - Creation studio
- `src/services/mission.ts` - Mission execution
- `src/services/curriculum.ts` - Curriculum data

### Core Services

#### 1. **AuthService**
```typescript
interface AuthService {
  getSession(): Promise<AuthSession>;
  signIn(credentials: SignInRequest): Promise<AuthSession>;
  signOut(): Promise<void>;
  refreshSession(): Promise<AuthSession>;
}
```

**Backend Requirements:**
- Authentication system (OAuth/JWT/sessions)
- Role-based access control (learner/parent/educator)
- Permission system
- Session management
- Refresh tokens

#### 2. **LearnerService**
```typescript
interface LearnerService {
  getCurrent(): Promise<Learner>;
  getContext(): Promise<LearnerContext>;
  getCustomization(): Promise<CharacterCustomization>;
  getInventory(): Promise<InventoryItem[]>;
  updateProfile(updates: Partial<LearnerProfile>): Promise<void>;
  updateCustomization(updates: Partial<CharacterCustomization>): Promise<void>;
}
```

**Backend Requirements:**
- User profile storage
- Avatar customization persistence
- Inventory management
- Context aggregation (current world, mission, progress)

#### 3. **CurriculumService**
```typescript
interface CurriculumService {
  listDomains(): Promise<LearningDomain[]>;
  getDomain(id: ID): Promise<LearningDomain | null>;
  listSkills(domainId?: ID): Promise<Skill[]>;
  getSkill(id: ID): Promise<Skill | null>;
  listCompetencies(skillIds?: ID[]): Promise<Competency[]>;
  listObjectives(): Promise<LearningObjective[]>;
  getSkillGraph(domainId: ID): Promise<CurriculumGraph>;
}
```

**Backend Requirements:**
- Curriculum content management
- Skill dependency graph
- Mastery tracking per skill
- Evidence aggregation
- Age-band filtering

#### 4. **WorldService**
```typescript
interface WorldService {
  list(): Promise<World[]>;
  get(id: ID): Promise<World | null>;
  unlock(id: ID): Promise<void>;
  getProgress(id: ID): Promise<WorldProgress>;
}
```

**Backend Requirements:**
- World content storage
- Unlock logic
- Progress tracking per world
- Mission availability

#### 5. **MissionService**
```typescript
interface MissionService {
  list(filter?: { worldId?: ID; domainId?: ID }): Promise<Mission[]>;
  get(id: ID): Promise<Mission | null>;
  start(id: ID): Promise<void>;
  complete(id: ID): Promise<MissionResult>;
  listActivities(missionId: ID): Promise<Activity[]>;
  getActivity(id: ID): Promise<Activity | null>;
  submitActivityResult(activityId: ID, result: ActivityResult): Promise<void>;
}
```

**Backend Requirements:**
- Mission content management
- Activity sequencing
- Progress tracking
- Result submission
- Rewards distribution

#### 6. **MasteryService**
```typescript
interface MasteryService {
  list(): Promise<MasteryRecord[]>;
  get(competencyId: ID): Promise<MasteryRecord | null>;
  recordEvidence(evidence: EvidenceSubmission): Promise<void>;
  listProgress(): Promise<ProgressRecord[]>;
  listAchievements(): Promise<Achievement[]>;
  getSkillStatus(skillId: ID): Promise<SkillStatus>;
}
```

**Backend Requirements:**
- Mastery tracking database
- Evidence processing
- Confidence calculation (adaptive engine)
- Spaced repetition scheduling
- Achievement unlocking

#### 7. **ProjectService**
```typescript
interface ProjectService {
  list(filter?: { state?: ProjectState }): Promise<Project[]>;
  get(id: ID): Promise<Project | null>;
  create(project: ProjectCreate): Promise<Project>;
  update(id: ID, updates: ProjectUpdate): Promise<void>;
  delete(id: ID): Promise<void>;
  submitForReview(id: ID): Promise<void>;
  addMilestone(projectId: ID, milestone: MilestoneCreate): Promise<void>;
  addArtifact(projectId: ID, artifact: ArtifactUpload): Promise<void>;
  addReflection(projectId: ID, reflection: ReflectionCreate): Promise<void>;
}
```

**Backend Requirements:**
- Project storage
- File upload (artifacts)
- Review workflow
- Milestone tracking
- Privacy controls
- Parent approval workflow

#### 8. **ProgressionService**
```typescript
interface ProgressionService {
  getLevel(): Promise<LearnerLevel>;
  getXPHistory(): Promise<XPGain[]>;
  getCoinsBalance(): Promise<CoinsBalance>;
  spendCoins(itemId: ID, amount: number): Promise<void>;
  getStreak(): Promise<PracticeStreak>;
  listAchievements(): Promise<Achievement[]>;
  getLeaderboard(scope: LeaderboardScope): Promise<Leaderboard>;
  optInLeaderboard(): Promise<void>;
  optOutLeaderboard(): Promise<void>;
}
```

**Backend Requirements:**
- XP calculation engine
- Level progression logic
- Coin economy
- Streak tracking (weekly reset)
- Achievement unlocking
- Leaderboard aggregation (opt-in only)

#### 9. **CommunityService**
```typescript
interface CommunityService {
  // Teams
  listTeams(): Promise<Team[]>;
  getTeam(id: ID): Promise<Team | null>;
  joinTeam(id: ID): Promise<void>;
  leaveTeam(id: ID): Promise<void>;
  
  // Guilds
  listGuilds(): Promise<Guild[]>;
  getGuild(id: ID): Promise<Guild | null>;
  joinGuild(id: ID): Promise<void>;
  leaveGuild(id: ID): Promise<void>;
  
  // Messages
  sendMessage(message: SafeMessageCreate): Promise<void>;
  listMessages(contextId: ID): Promise<SafeMessage[]>;
  
  // Showcases
  listShowcases(filter?: ShowcaseFilter): Promise<Showcase[]>;
  createShowcase(showcase: ShowcaseCreate): Promise<void>;
  reactToShowcase(showcaseId: ID, reaction: string): Promise<void>;
  
  // Challenges
  listChallenges(): Promise<CommunityChallenge[]>;
  joinChallenge(id: ID): Promise<void>;
  
  // Events
  listEvents(): Promise<CommunityEvent[]>;
  registerForEvent(id: ID): Promise<void>;
}
```

**Backend Requirements:**
- Group membership management
- Message moderation queue
- Showcase moderation
- Challenge tracking
- Event registration
- Age-based access enforcement

#### 10. **ModerationService**
```typescript
interface ModerationService {
  submitForReview(content: ContentSubmission): Promise<void>;
  getContentStatus(contentId: ID): Promise<ModerationState>;
  listPendingReviews(): Promise<ContentReview[]>;
  
  // Reporting
  submitReport(report: ReportCreate): Promise<void>;
  listReports(userId: ID): Promise<Report[]>;
  
  // Blocking
  blockUser(userId: ID, reason?: string): Promise<void>;
  unblockUser(userId: ID): Promise<void>;
  listBlockedUsers(): Promise<BlockedUser[]>;
}
```

**Backend Requirements:**
- Moderation queue system
- Auto-moderation (ML filters)
- Human review workflow
- Report management
- Block enforcement
- Audit logs

#### 11. **ParentService**
```typescript
interface ParentService {
  // Dashboard
  getDashboard(childId: ID): Promise<ParentDashboard>;
  
  // Reports
  getWeeklyReport(childId: ID): Promise<WeeklyReport>;
  getMonthlyReport(childId: ID, month: string): Promise<MonthlyReport>;
  listMilestoneReports(childId: ID): Promise<MilestoneReport[]>;
  
  // Controls
  getControls(childId: ID): Promise<ParentalCommunityControls>;
  updateControls(childId: ID, updates: ControlsUpdate): Promise<void>;
  
  // Approvals
  listPendingApprovals(childId: ID): Promise<PendingApproval[]>;
  approveItem(itemId: ID): Promise<void>;
  denyItem(itemId: ID, reason?: string): Promise<void>;
  
  // Safety
  getSafetyDashboard(childId: ID): Promise<SafetyDashboard>;
}
```

**Backend Requirements:**
- Parent-child relationship management
- Observation insight generation
- Report generation (weekly/monthly/milestone)
- Approval workflow
- Safety metrics aggregation
- Privacy-respecting activity logs

#### 12. **AIService**
```typescript
interface AIService {
  getConversation(id?: ID): Promise<AIConversation>;
  sendMessage(conversationId: ID, text: string): Promise<AIMessage>;
  streamMessage(conversationId: ID, text: string): AsyncIterable<AIMessageChunk>;
  listRecommendations(): Promise<Recommendation[]>;
  getHints(objectiveId: ID): Promise<ContextualHint[]>;
  generateExplanation(conceptId: ID): Promise<string>;
}
```

**Backend Requirements:**
- LLM integration (streaming)
- Conversation persistence
- Age-appropriate tone adaptation
- Safety filtering
- Context-aware recommendations
- Hint ladder generation

#### 13. **AdaptiveService**
```typescript
interface AdaptiveService {
  decideDifficulty(objectiveId: ID): Promise<DifficultyDecision>;
  getNextActivity(learnerId: ID): Promise<NextActivity>;
  scheduleReview(competencyId: ID): Promise<ReviewSchedule>;
  updateConfidence(competencyId: ID, result: ActivityResult): Promise<void>;
}
```

**Backend Requirements:**
- Adaptive engine (IRT/Bayesian/ML)
- Difficulty adjustment algorithm
- Spaced repetition algorithm
- Next-activity recommendation
- Confidence tracking

#### 14. **VoiceService**
```typescript
interface VoiceService {
  start(): Promise<VoiceSession>;
  stop(sessionId: ID): Promise<{ transcript: string }>;
  speak(text: string): Promise<{ durationMs: number }>;
  getSupportedLanguages(): Promise<string[]>;
}
```

**Backend Requirements:**
- Speech-to-text API
- Text-to-speech API
- Session management
- Language support

#### 15. **ContentService**
```typescript
interface ContentService {
  listStories(filter?: ContentFilter): Promise<Story[]>;
  getStory(id: ID): Promise<Story | null>;
  listSimulations(filter?: ContentFilter): Promise<Simulation[]>;
  listEnglishDrills(filter?: ContentFilter): Promise<EnglishDrill[]>;
  listCodingExercises(filter?: ContentFilter): Promise<CodingExercise[]>;
}
```

**Backend Requirements:**
- Content management system
- Age-band filtering
- Difficulty filtering
- Domain filtering
- Search/discovery

#### 16. **AnalyticsService**
```typescript
interface AnalyticsService {
  getSummary(learnerId: ID): Promise<AnalyticsSummary>;
  listParentInsights(childId: ID): Promise<ParentInsight[]>;
  trackEvent(event: AnalyticsEvent): Promise<void>;
}
```

**Backend Requirements:**
- Event tracking
- Analytics aggregation
- Parent insight generation
- Privacy-compliant data handling

#### 17. **SafetyService**
```typescript
interface SafetyService {
  getSettings(learnerId: ID): Promise<SafetySettings>;
  updateSettings(learnerId: ID, updates: SafetySettingsUpdate): Promise<void>;
  checkContent(content: string): Promise<ContentSafetyCheck>;
  reportIncident(incident: IncidentReport): Promise<void>;
}
```

**Backend Requirements:**
- Safety settings management
- Content filtering (ML-based)
- Incident reporting
- Emergency escalation

---

## 📦 DTO Boundaries

### Request DTOs

```typescript
// Authentication
interface SignInRequest {
  email: string;
  password: string;
}

// Content submission
interface ContentSubmission {
  type: "message" | "showcase" | "feedback" | "project";
  content: string;
  contextId: ID;
  metadata?: Record<string, unknown>;
}

// Evidence submission
interface EvidenceSubmission {
  competencyId: ID;
  evidenceType: EvidenceType;
  description: string;
  activityId?: ID;
  projectId?: ID;
  artifactUrl?: string;
}

// Activity result
interface ActivityResult {
  activityId: ID;
  objectiveId: ID;
  success: boolean;
  timeSpentMs: number;
  attempts: number;
  responseData?: Record<string, unknown>;
}

// Project creation
interface ProjectCreate {
  title: string;
  goal: string;
  domainIds: ID[];
  skillIds: ID[];
  visibility: ProjectVisibility;
}

// Project update
interface ProjectUpdate {
  title?: string;
  goal?: string;
  state?: ProjectState;
  visibility?: ProjectVisibility;
}

// Report creation
interface ReportCreate {
  targetType: "content" | "user" | "conversation";
  targetId: ID;
  reason: ReportReason;
  description?: string;
}

// Message creation
interface SafeMessageCreate {
  contextType: "team" | "guild" | "feedback" | "project";
  contextId: ID;
  recipientIds: ID[];
  templateId: ID;
  templateValues: Record<string, string>;
}
```

### Response DTOs

```typescript
// Mission completion result
interface MissionResult {
  missionId: ID;
  completedAt: ISODate;
  xpGained: number;
  coinsGained: number;
  achievementsUnlocked: ID[];
  rewardsUnlocked: ID[];
  nextMissionId: ID | null;
}

// Content safety check
interface ContentSafetyCheck {
  safe: boolean;
  reasons: string[];
  severity: "low" | "medium" | "high";
}

// Moderation status
interface ModerationStatus {
  state: ModerationState;
  submittedAt: ISODate;
  reviewedAt?: ISODate;
  reviewedBy?: "auto" | "human";
  feedback?: string;
}

// Review schedule
interface ReviewSchedule {
  competencyId: ID;
  nextReviewAt: ISODate;
  interval: number; // days
  reason: "spaced-repetition" | "low-confidence" | "pre-assessment";
}

// Skill status
interface SkillStatus {
  skillId: ID;
  masteryState: MasteryState;
  confidence: number;
  evidenceCount: number;
  recentEvidence: Evidence[];
  practiceCount: number;
  needsReview: boolean;
  nextRecommendation: SkillRecommendation | null;
}
```

---

## 🔄 State Management Patterns

### Loading States

Every service call must handle 5 states:

```typescript
type LoadState = "idle" | "loading" | "success" | "empty" | "error";

interface DataState<T> {
  data: T | null;
  state: LoadState;
  error: Error | null;
}

// Usage in components
const { data: learner, state, error } = useLearner();

if (state === "loading") return <LoadingSpinner />;
if (state === "error") return <ErrorMessage error={error} />;
if (state === "empty") return <EmptyState />;
return <LearnerProfile learner={learner} />;
```

### Error Handling

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}

// Network errors
try {
  const result = await service.someMethod();
} catch (error) {
  if (error.code === "NETWORK_ERROR") {
    // Show offline state
  } else if (error.code === "AUTH_REQUIRED") {
    // Redirect to login
  } else if (error.code === "FORBIDDEN") {
    // Show access denied
  } else {
    // Show generic error
  }
}
```

### Optimistic Updates

```typescript
// Example: Add milestone to project
const addMilestone = useMutation({
  mutationFn: (milestone: MilestoneCreate) => 
    projectService.addMilestone(projectId, milestone),
  onMutate: async (milestone) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(queryKeys.project(projectId));
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.project(projectId));
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.project(projectId), (old) => ({
      ...old,
      milestones: [...old.milestones, { ...milestone, id: `temp-${Date.now()}` }],
    }));
    
    return { previous };
  },
  onError: (_err, _milestone, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.project(projectId), context.previous);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries(queryKeys.project(projectId));
  },
});
```

### Offline Support (Future)

```typescript
// Service layer with offline fallback
export const learnerService: LearnerService = {
  getCurrent: async () => {
    try {
      const response = await fetch("/api/learner/current");
      const data = await response.json();
      // Cache in IndexedDB
      await offlineCache.set("learner:current", data);
      return data;
    } catch (error) {
      // Fallback to cached data
      if (error.code === "NETWORK_ERROR") {
        const cached = await offlineCache.get("learner:current");
        if (cached) return cached;
      }
      throw error;
    }
  },
};
```

---

## 🔑 Query Key Strategy

### Stable Query Keys

All query keys defined in **`src/services/index.ts`**:

```typescript
export const queryKeys = {
  // Learner
  learner: ["learner"] as const,
  learnerContext: ["learner", "context"] as const,
  customization: ["learner", "customization"] as const,
  inventory: ["learner", "inventory"] as const,
  
  // Auth
  session: ["auth", "session"] as const,
  
  // Curriculum
  domains: ["curriculum", "domains"] as const,
  domain: (id: ID) => ["curriculum", "domain", id] as const,
  skills: (domainId?: ID) => ["curriculum", "skills", domainId ?? "all"] as const,
  skill: (id: ID) => ["curriculum", "skill", id] as const,
  competencies: ["curriculum", "competencies"] as const,
  objectives: ["curriculum", "objectives"] as const,
  skillGraph: (domainId: ID) => ["curriculum", "skillGraph", domainId] as const,
  
  // Worlds & Missions
  worlds: ["worlds"] as const,
  world: (id: ID) => ["world", id] as const,
  missions: (f?: object) => ["missions", f ?? {}] as const,
  mission: (id: ID) => ["mission", id] as const,
  activities: (missionId: ID) => ["mission", missionId, "activities"] as const,
  
  // Projects
  projects: (filter?: object) => ["projects", filter ?? {}] as const,
  project: (id: ID) => ["project", id] as const,
  projectMilestones: (id: ID) => ["project", id, "milestones"] as const,
  projectArtifacts: (id: ID) => ["project", id, "artifacts"] as const,
  
  // Mastery
  mastery: ["mastery"] as const,
  masteryRecord: (competencyId: ID) => ["mastery", competencyId] as const,
  progress: ["mastery", "progress"] as const,
  achievements: ["mastery", "achievements"] as const,
  skillStatus: (skillId: ID) => ["skill", skillId, "status"] as const,
  
  // Progression
  level: ["progression", "level"] as const,
  xpHistory: ["progression", "xp"] as const,
  coins: ["progression", "coins"] as const,
  streak: ["progression", "streak"] as const,
  leaderboard: (scope: string) => ["leaderboard", scope] as const,
  
  // Community
  teams: ["community", "teams"] as const,
  team: (id: ID) => ["community", "team", id] as const,
  guilds: ["community", "guilds"] as const,
  guild: (id: ID) => ["community", "guild", id] as const,
  messages: (contextId: ID) => ["messages", contextId] as const,
  showcases: (filter?: object) => ["showcases", filter ?? {}] as const,
  challenges: ["community", "challenges"] as const,
  events: ["community", "events"] as const,
  
  // Moderation
  contentStatus: (contentId: ID) => ["moderation", "status", contentId] as const,
  blockedUsers: ["moderation", "blocked"] as const,
  reports: (userId: ID) => ["moderation", "reports", userId] as const,
  
  // Parent
  parentDashboard: (childId: ID) => ["parent", "dashboard", childId] as const,
  weeklyReport: (childId: ID) => ["parent", "report", "weekly", childId] as const,
  monthlyReport: (childId: ID, month: string) => ["parent", "report", "monthly", childId, month] as const,
  milestoneReports: (childId: ID) => ["parent", "reports", "milestone", childId] as const,
  parentalControls: (childId: ID) => ["parent", "controls", childId] as const,
  pendingApprovals: (childId: ID) => ["parent", "approvals", childId] as const,
  safetyDashboard: (childId: ID) => ["parent", "safety", childId] as const,
  
  // AI
  conversation: (id?: ID) => ["ai", "conversation", id ?? "current"] as const,
  recommendations: ["ai", "recommendations"] as const,
  hints: (objectiveId: ID) => ["ai", "hints", objectiveId] as const,
  
  // Content
  stories: (filter?: object) => ["content", "stories", filter ?? {}] as const,
  story: (id: ID) => ["content", "story", id] as const,
  simulations: (filter?: object) => ["content", "simulations", filter ?? {}] as const,
  englishDrills: (filter?: object) => ["content", "english", filter ?? {}] as const,
  codingExercises: (filter?: object) => ["content", "coding", filter ?? {}] as const,
  
  // Review
  reviewDue: ["review", "due"] as const,
  
  // Analytics
  analytics: (learnerId: ID) => ["analytics", "summary", learnerId] as const,
  parentInsights: (childId: ID) => ["analytics", "parent", childId] as const,
  
  // Voice
  voiceSession: (id: ID) => ["voice", "session", id] as const,
  
  // Safety
  safetySettings: (learnerId: ID) => ["safety", "settings", learnerId] as const,
  
  // Notifications
  notifications: ["notifications"] as const,
  
  // Portfolio
  portfolio: (learnerId: ID) => ["portfolio", learnerId] as const,
  
  // Characters
  characters: ["characters"] as const,
  character: (id: ID) => ["character", id] as const,
};
```

### Invalidation Patterns

```typescript
// When learner completes a mission:
queryClient.invalidateQueries(queryKeys.missions());
queryClient.invalidateQueries(queryKeys.progress);
queryClient.invalidateQueries(queryKeys.achievements);
queryClient.invalidateQueries(queryKeys.xpHistory);

// When learner submits evidence:
queryClient.invalidateQueries(queryKeys.masteryRecord(competencyId));
queryClient.invalidateQueries(queryKeys.skillStatus(skillId));
queryClient.invalidateQueries(queryKeys.progress);

// When parent updates controls:
queryClient.invalidateQueries(queryKeys.parentalControls(childId));
queryClient.invalidateQueries(queryKeys.safetySettings(childId));
```

---

## 🚀 Backend Implementation Checklist

### Infrastructure

- [ ] Choose backend stack (Node/Python/Go/other)
- [ ] Choose database (PostgreSQL/MongoDB/other)
- [ ] Choose transport (REST/GraphQL/gRPC/other)
- [ ] Set up authentication (OAuth/JWT/sessions)
- [ ] Set up file storage (S3/GCS/other)
- [ ] Set up CDN for static assets
- [ ] Set up caching layer (Redis/Memcached)
- [ ] Set up message queue (RabbitMQ/SQS/other)
- [ ] Set up monitoring (Datadog/New Relic/other)
- [ ] Set up error tracking (Sentry/Bugsnag/other)

### Data Layer

- [ ] Design database schema for all entities
- [ ] Create migration scripts
- [ ] Implement learner profile storage
- [ ] Implement curriculum storage
- [ ] Implement mastery tracking
- [ ] Implement project storage with file uploads
- [ ] Implement community features (teams, guilds, messages)
- [ ] Implement moderation queue
- [ ] Implement parent dashboard data aggregation
- [ ] Implement analytics events storage

### API Layer

- [ ] Implement AuthService endpoints
- [ ] Implement LearnerService endpoints
- [ ] Implement CurriculumService endpoints
- [ ] Implement WorldService endpoints
- [ ] Implement MissionService endpoints
- [ ] Implement MasteryService endpoints
- [ ] Implement ProjectService endpoints
- [ ] Implement ProgressionService endpoints
- [ ] Implement CommunityService endpoints
- [ ] Implement ModerationService endpoints
- [ ] Implement ParentService endpoints
- [ ] Implement AIService endpoints
- [ ] Implement AdaptiveService endpoints
- [ ] Implement VoiceService endpoints
- [ ] Implement ContentService endpoints
- [ ] Implement AnalyticsService endpoints
- [ ] Implement SafetyService endpoints

### Business Logic

- [ ] Implement mastery confidence calculation (adaptive engine)
- [ ] Implement spaced repetition algorithm
- [ ] Implement difficulty adjustment algorithm
- [ ] Implement XP calculation engine
- [ ] Implement achievement unlock logic
- [ ] Implement streak calculation (weekly reset)
- [ ] Implement leaderboard aggregation (opt-in only)
- [ ] Implement project review workflow
- [ ] Implement moderation auto-flagging (ML)
- [ ] Implement parent insight generation
- [ ] Implement report generation (weekly/monthly/milestone)

### AI Integration

- [ ] Integrate LLM provider (OpenAI/Anthropic/other)
- [ ] Implement streaming chat
- [ ] Implement age-appropriate tone adaptation
- [ ] Implement safety filtering
- [ ] Implement context-aware recommendations
- [ ] Implement hint ladder generation
- [ ] Implement content generation (explanations)

### Safety & Moderation

- [ ] Implement content moderation queue
- [ ] Implement auto-moderation (ML filters)
- [ ] Implement human review workflow
- [ ] Implement report handling
- [ ] Implement user blocking enforcement
- [ ] Implement parental approval workflow
- [ ] Implement audit logs for all safety actions

### Testing

- [ ] Unit tests for all service methods
- [ ] Integration tests for all API endpoints
- [ ] End-to-end tests for critical flows
- [ ] Load testing for concurrent users
- [ ] Security testing (OWASP Top 10)
- [ ] Privacy compliance testing (COPPA/GDPR)

### Deployment

- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Implement CI/CD pipeline
- [ ] Set up database backups
- [ ] Set up disaster recovery
- [ ] Set up SSL/TLS certificates
- [ ] Set up DNS
- [ ] Set up logging aggregation
- [ ] Set up alerting
- [ ] Document deployment process

---

## 📋 API Documentation Template

For each service, document:

```markdown
## ServiceName

### Endpoints

#### `GET /api/endpoint`

**Description:** What this endpoint does

**Auth Required:** Yes/No

**Permissions:** `permission:name`

**Request:**
```json
{
  "param": "value"
}
```

**Response:**
```json
{
  "data": {}
}
```

**Errors:**
- `400 BAD_REQUEST` - Invalid input
- `401 UNAUTHORIZED` - Authentication required
- `403 FORBIDDEN` - Insufficient permissions
- `404 NOT_FOUND` - Resource not found
- `500 INTERNAL_ERROR` - Server error

**Rate Limits:** 100 requests per minute

**Caching:** Cache-Control: max-age=300

**Example:**
```bash
curl -X GET https://api.usam.com/api/endpoint \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```
```

---

## 🎯 Frontend-Backend Contract Summary

**Frontend Guarantees:**

1. ✅ Only communicates through service layer
2. ✅ Handles all 5 load states (idle/loading/success/empty/error)
3. ✅ Uses stable query keys
4. ✅ Implements optimistic updates where appropriate
5. ✅ Validates user input before submission
6. ✅ Respects backend rate limits
7. ✅ Displays user-friendly error messages
8. ✅ Never exposes backend implementation details to users

**Backend Guarantees (Required):**

1. ✅ Returns consistent DTOs matching TypeScript interfaces
2. ✅ Provides clear error codes and messages
3. ✅ Implements authentication and authorization
4. ✅ Enforces age-based access rules
5. ✅ Moderates all user-generated content
6. ✅ Respects privacy controls (parent settings)
7. ✅ Tracks all safety-relevant events
8. ✅ Generates observation-based (not diagnostic) insights
9. ✅ Calculates mastery confidence accurately
10. ✅ Implements responsible progression (no dark patterns)

---

## 📁 Files Created/Updated

### New Files

**None** - Phase 17 documents existing contracts and prepares backend requirements. All service interfaces and types already exist in previous phases.

### Updated Files

**`PHASE_17_IMPLEMENTATION.md`** (this file)
- Complete backend contract documentation
- Service interface specifications
- DTO definitions
- State management patterns
- Query key strategy
- Backend implementation checklist

---

## ✅ Compliance Checklist

### Contracts
- [x] All entities explicitly typed
- [x] All service interfaces defined
- [x] All DTOs documented
- [x] All query keys defined
- [x] All error states handled
- [x] All loading states handled
- [x] All empty states handled

### Architecture
- [x] Service layer is single boundary
- [x] Components never import mock data
- [x] No hard-coded backend URLs
- [x] No assumptions about transport
- [x] Mock implementations complete
- [x] Ready to swap for real API

### Documentation
- [x] All backend requirements listed
- [x] All service methods documented
- [x] All state patterns documented
- [x] Implementation checklist complete
- [x] API documentation template provided

---

## 🎯 Backend-Ready Summary

**We Built:**

1. ✅ **17 complete service interfaces** with full method signatures
2. ✅ **100+ TypeScript entities** across 6 phases
3. ✅ **Working mock implementations** for every service
4. ✅ **Stable query keys** for React Query
5. ✅ **State management patterns** for loading/error/empty/offline
6. ✅ **Clear DTO boundaries** for API contracts
7. ✅ **Comprehensive backend checklist** for implementation
8. ✅ **Zero hard-coded assumptions** about backend implementation

**Backend can now:**

1. ✅ Implement any transport (REST/GraphQL/gRPC/WebSockets)
2. ✅ Use any database (SQL/NoSQL/Graph)
3. ✅ Use any auth system (OAuth/JWT/sessions)
4. ✅ Use any LLM provider (OpenAI/Anthropic/other)
5. ✅ Swap service implementations one at a time
6. ✅ Test against stable TypeScript contracts
7. ✅ Deploy incrementally without breaking frontend

**Every service method is:**
- Fully typed (input and output)
- Documented (purpose and behavior)
- Mocked (working placeholder)
- Ready to swap (no UI changes needed)

---

*Implementation completed: August 9, 2026*  
*Compliant with Phase 17 requirements*  
*Backend-ready frontend contracts complete*  
*Ready for backend development to begin*
