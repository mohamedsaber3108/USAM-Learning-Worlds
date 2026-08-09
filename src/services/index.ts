/**
 * Service layer — the single boundary between UI and data.
 *
 * Today every repository resolves from mock data. When a real backend exists,
 * only the bodies below change (fetch / server functions); no component,
 * hook or query key needs to move.
 */
import * as mock from "@/data/mock";
import * as content from "@/data/experience";
import type {
  AnalyticsSummary,
  CodingExercise,
  ContextualHint,
  DifficultyDecision,
  EnglishDrill,
  ParentInsight,
  Simulation,
  SpacedReviewItem,
  Story,
} from "@/types/engines";

import type {
  AIConversation,
  AIMessage,
  AuthSession,
  Achievement,
  Assessment,
  Challenge,
  Character,
  CharacterCustomization,
  Competency,
  Guild,
  ID,
  InventoryItem,
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
  World,
} from "@/types/domain";

/** Simulated network latency so loading states are real, not decorative. */
const LATENCY = 220;

function respond<T>(data: T, latency = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), latency));
}

export const learnerService = {
  getCurrent: (): Promise<Learner> => respond(mock.learner),
  getContext: (): Promise<LearnerContext> =>
    respond({
      learnerId: mock.learner.id,
      ageBand: mock.learner.profile.ageBand,
      currentWorldId: mock.learner.worldId,
      currentMissionId: mock.learner.currentMissionId,
      currentObjectiveId: "o-en-1",
      recentMastery: mock.masteryRecords.slice(0, 4),
      interests: mock.learner.profile.interests,
    }),
  getCustomization: (): Promise<CharacterCustomization> => respond(mock.customization),
  getInventory: (): Promise<InventoryItem[]> => respond(mock.inventory),
};

export const authService = {
  /** Placeholder only — no authentication logic is implemented. */
  getSession: (): Promise<AuthSession> =>
    respond({
      status: "authenticated",
      learnerId: mock.learner.id,
      role: "learner",
      permissions: ["learn:read", "project:write", "community:read"],
    }),
};

export const curriculumService = {
  listDomains: (): Promise<LearningDomain[]> => respond(mock.domains),
  getDomain: (id: ID): Promise<LearningDomain | null> =>
    respond(mock.domains.find((d) => d.id === id) ?? null),
  listSkills: (domainId?: ID): Promise<Skill[]> =>
    respond(domainId ? mock.skills.filter((s) => s.domainId === domainId) : mock.skills),
  listCompetencies: (skillIds?: ID[]): Promise<Competency[]> =>
    respond(
      skillIds ? mock.competencies.filter((c) => skillIds.includes(c.skillId)) : mock.competencies,
    ),
  listObjectives: (): Promise<LearningObjective[]> => respond(mock.objectives),
};

export const worldService = {
  list: (): Promise<World[]> => respond(mock.worlds),
  get: (id: ID): Promise<World | null> => respond(mock.worlds.find((w) => w.id === id) ?? null),
};

export const missionService = {
  list: (filter?: { worldId?: ID; domainId?: ID }): Promise<Mission[]> =>
    respond(
      mock.missions.filter(
        (m) =>
          (!filter?.worldId || m.worldId === filter.worldId) &&
          (!filter?.domainId || m.domainId === filter.domainId),
      ),
    ),
  get: (id: ID): Promise<Mission | null> => respond(mock.missions.find((m) => m.id === id) ?? null),
  listActivities: (missionId: ID) =>
    respond(mock.activities.filter((a) => a.missionId === missionId)),
};

export const practiceService = {
  listDue: (): Promise<Practice[]> => respond(mock.practices),
};

export const projectService = {
  list: (): Promise<Project[]> => respond(mock.projects),
  get: (id: ID): Promise<Project | null> => respond(mock.projects.find((p) => p.id === id) ?? null),
};

export const assessmentService = {
  list: (): Promise<Assessment[]> => respond(mock.assessments),
};

export const masteryService = {
  list: (): Promise<MasteryRecord[]> => respond(mock.masteryRecords),
  listProgress: (): Promise<ProgressRecord[]> => respond(mock.progressRecords),
  listAchievements: (): Promise<Achievement[]> => respond(mock.achievements),
};

export const characterService = {
  list: (): Promise<Character[]> => respond(mock.characters),
  get: (id: ID): Promise<Character | null> =>
    respond(mock.characters.find((ch) => ch.id === id) ?? null),
};

export const portfolioService = {
  list: (): Promise<PortfolioItem[]> => respond(mock.portfolio),
};

export const challengeService = {
  list: (): Promise<Challenge[]> => respond(mock.challenges),
};

export const communityService = {
  listGuilds: (): Promise<Guild[]> => respond(mock.guilds),
  getLeaderboard: (): Promise<Leaderboard> => respond(mock.leaderboard),
};

export const notificationService = {
  list: (): Promise<Notification[]> => respond(mock.notifications),
};

export const safetyService = {
  getSettings: (): Promise<SafetySettings> => respond(mock.safetySettings),
};

/**
 * AI surface. All behaviour here is a placeholder contract: a future backend
 * (streaming AI) plugs into exactly these method signatures.
 */
export const aiService = {
  getConversation: (): Promise<AIConversation> => respond(mock.conversation),
  listRecommendations: (): Promise<Recommendation[]> => respond(mock.recommendations),
  /** Placeholder echo — real generation happens server-side later. */
  sendMessage: async (conversationId: ID, text: string): Promise<AIMessage> => {
    await respond(null, 600);
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      author: "character",
      characterId: "ch-azouz",
      text: `Good — hold that thought. ${text.length > 40 ? "Now say it in one sentence." : "Can you add one more detail?"}`,
      kind: "chat",
      createdAt: new Date().toISOString(),
    };
  },
};

/** Voice surface — placeholder only; no microphone or speech API is called. */
export const voiceService = {
  start: async () => {
    await respond(null, 300);
    return { sessionId: `voice-${Date.now()}`, state: "listening" as const };
  },
  stop: async (_sessionId: ID) => {
    await respond(null, 400);
    return { transcript: "Grey clouds are stacking up and the air bites at 14 degrees." };
  },
  speak: async (text: string) => {
    await respond(null, 200);
    return { durationMs: Math.min(6000, text.length * 55) };
  },
};

export const contentService = {
  listStories: (): Promise<Story[]> => respond(content.stories),
  getStory: (id: ID): Promise<Story | null> =>
    respond(content.stories.find((s) => s.id === id) ?? null),
  listSimulations: (): Promise<Simulation[]> => respond(content.simulations),
  listEnglishDrills: (): Promise<EnglishDrill[]> => respond(content.englishDrills),
  listCodingExercises: (): Promise<CodingExercise[]> => respond(content.codingExercises),
};

export const reviewService = {
  listDue: (): Promise<SpacedReviewItem[]> => respond(content.spacedReview),
};

export const analyticsService = {
  getSummary: (): Promise<AnalyticsSummary> => respond(content.analyticsSummary),
  listParentInsights: (): Promise<ParentInsight[]> => respond(content.parentInsights),
};

export const hintService = {
  list: (_objectiveId: ID): Promise<ContextualHint[]> => respond(content.hintLadder),
};

/** Adaptive difficulty — a deterministic stand-in for the future engine. */
export const adaptiveService = {
  decide: async (objectiveId: ID): Promise<DifficultyDecision> => {
    await respond(null, 150);
    const objective = mock.objectives.find((o) => o.id === objectiveId);
    const record = mock.masteryRecords.find((m) => m.competencyId === objective?.competencyId);

    const confidence = record?.confidence ?? 0.5;
    if (confidence < 0.45)
      return { objectiveId, direction: "ease", rationale: "Confidence is low — rebuild with support." };
    if (confidence > 0.8)
      return { objectiveId, direction: "stretch", rationale: "Mastery is stable — raise the challenge." };
    return { objectiveId, direction: "hold", rationale: "Progressing well — keep the current level." };
  },
};

/** Stable query keys so a real API swap doesn't churn the cache layer. */

export const queryKeys = {
  learner: ["learner"] as const,
  learnerContext: ["learner", "context"] as const,
  customization: ["learner", "customization"] as const,
  inventory: ["learner", "inventory"] as const,
  session: ["auth", "session"] as const,
  domains: ["curriculum", "domains"] as const,
  domain: (id: ID) => ["curriculum", "domain", id] as const,
  skills: (domainId?: ID) => ["curriculum", "skills", domainId ?? "all"] as const,
  competencies: ["curriculum", "competencies"] as const,
  objectives: ["curriculum", "objectives"] as const,
  worlds: ["worlds"] as const,
  missions: (f?: object) => ["missions", f ?? {}] as const,
  practices: ["practices"] as const,
  projects: ["projects"] as const,
  assessments: ["assessments"] as const,
  mastery: ["mastery"] as const,
  progress: ["mastery", "progress"] as const,
  achievements: ["mastery", "achievements"] as const,
  characters: ["characters"] as const,
  portfolio: ["portfolio"] as const,
  challenges: ["challenges"] as const,
  guilds: ["community", "guilds"] as const,
  leaderboard: ["community", "leaderboard"] as const,
  notifications: ["notifications"] as const,
  safety: ["safety"] as const,
  conversation: ["ai", "conversation"] as const,
  recommendations: ["ai", "recommendations"] as const,
  stories: ["content", "stories"] as const,
  story: (id: ID) => ["content", "story", id] as const,
  simulations: ["content", "simulations"] as const,
  englishDrills: ["content", "english"] as const,
  codingExercises: ["content", "coding"] as const,
  review: ["review", "due"] as const,
  analytics: ["analytics", "summary"] as const,
  parentInsights: ["analytics", "parent-insights"] as const,
  hints: (objectiveId: ID) => ["ai", "hints", objectiveId] as const,
};
