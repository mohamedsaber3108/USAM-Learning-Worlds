/**
 * Mission run service.
 *
 * Wired to the real backend (`backend/src/modules/missions/missions.controller.ts`,
 * mounted at `/api/missions`). The backend's `Mission`/`MissionRun`/`Activity`/
 * `ActivityAttempt` models are much flatter than the frontend's rich
 * `MissionRun`/`MissionActivity`/`EvidenceSignal` contracts (no stages, no
 * story beats, no hint ladders, no evidence-kind taxonomy — see
 * `backend/prisma/schema.prisma`). This file maps what's real (mission
 * metadata, activity attempts, evaluator feedback) onto those contracts and
 * is explicit — via `UNMAPPED_*` fields left empty — about what the backend
 * does not yet model, instead of inventing story content client-side.
 *
 * Backend enums are UPPERCASE (`MissionType.GUIDED`, `ActivityType.SELECT`,
 * `MissionRunStatus.IN_PROGRESS`); the frontend types are lowercase strings.
 * All enum crossings are translated explicitly below (CONF-003/CONF-004,
 * docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md).
 */
import { fetchAPI } from "@/services/api";
import type { ID } from "@/types/domain";
import type {
  ActivityResponse,
  ActivityResult,
  BossAssessment,
  BossOutcome,
  EvidenceSignal,
  MasteryDecision,
  MissionActivity,
  MissionCompletion,
  MissionRun,
  ReviewOption,
} from "@/types/mission";

/* --------------------------- backend response shapes --------------------- */

type BackendMissionType = "GUIDED" | "EXPLORATION" | "CHALLENGE" | "PROJECT_BASED";
type BackendActivityType = "SELECT" | "MATCH" | "SEQUENCE" | "CODE" | "EXPLAIN" | "CREATE" | "SOLVE";
type BackendRunStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

interface BackendActivity {
  id: string;
  objectiveId: string;
  type: BackendActivityType;
  title: string;
  description?: string | null;
  content: any;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "CHALLENGE";
  order: number;
  missionOrder?: number;
  isRequired?: boolean;
  objective?: { id: string; name: string; competency?: { id: string; name: string } };
}

interface BackendMission {
  id: string;
  worldId: string | null;
  title: string;
  description: string;
  type: BackendMissionType;
  estimatedMinutes: number | null;
  order: number;
  isActive: boolean;
  activities?: BackendActivity[];
}

interface BackendMissionRun {
  id: string;
  learnerId: string;
  missionId: string;
  status: BackendRunStatus;
  currentStageIndex: number;
  startedAt: string;
  completedAt: string | null;
  mission: BackendMission;
  attempts?: BackendActivityAttempt[];
}

interface BackendActivityAttempt {
  id: string;
  runId: string;
  activityId: string;
  response: any;
  success: boolean;
  score: number | null;
  feedback: string | null;
  createdAt: string;
  activity?: BackendActivity;
}

interface BackendSubmitResult {
  attempt: BackendActivityAttempt;
  evaluation: { correct: boolean; score: number; feedback: string };
  activity: { id: string; title: string; type: BackendActivityType };
}

/* ------------------------------- mappers ---------------------------------- */

const activitySurfaceFor = (type: BackendActivityType): MissionActivity["surface"] => {
  switch (type) {
    case "SELECT":
    case "MATCH":
    case "SEQUENCE":
      return "choose";
    case "CODE":
      return "build";
    case "EXPLAIN":
      return "write";
    case "CREATE":
      return "build";
    case "SOLVE":
      return "write";
    default:
      return "choose";
  }
};

const activityKindFor = (type: BackendActivityType): MissionActivity["kind"] => {
  switch (type) {
    case "SELECT":
      return "multiple-choice";
    case "MATCH":
      return "matching";
    case "SEQUENCE":
      return "sorting";
    case "CODE":
      return "coding";
    case "EXPLAIN":
      return "short-answer";
    case "CREATE":
      return "creative-creation";
    case "SOLVE":
      return "free-response";
    default:
      return "short-answer";
  }
};

function backendActivityToMissionActivity(a: BackendActivity, missionId: string): MissionActivity {
  const content = a.content ?? {};
  return {
    id: a.id,
    missionId,
    // Backend has no explicit stage machine — all real activities render as "practice".
    stage: "practice",
    kind: activityKindFor(a.type),
    surface: activitySurfaceFor(a.type),
    objectiveId: a.objectiveId,
    skillIds: a.objective?.competency ? [a.objective.competency.id] : [],
    title: a.title,
    storyBeat: "",
    prompt: a.description ?? content.prompt ?? "",
    estimatedMinutes: 5,
    framingByBand: { "8-9": a.title, "10-11": a.title, "12-14": a.title },
    characterId: "",
    voiceSupported: false,
    options: Array.isArray(content.options)
      ? content.options.map((o: any, i: number) => ({
          id: o.id ?? `${a.id}-opt-${i}`,
          label: o.label ?? String(o),
          correct: o.correct,
          feedback: o.feedback,
        }))
      : undefined,
    items: Array.isArray(content.items) ? content.items : undefined,
    buckets: Array.isArray(content.buckets) ? content.buckets : undefined,
    successCriteria: Array.isArray(content.successCriteria) ? content.successCriteria : undefined,
    starter: content.starter,
    hints: [],
    // Backend has no EvidenceKind taxonomy on Activity — default to correct-response.
    evidenceKind: "correct-response",
    minimumEffort: undefined,
  };
}

function backendMissionRunToMissionRun(run: BackendMissionRun): MissionRun {
  const activities = run.mission.activities ?? [];
  return {
    id: run.id,
    missionId: run.missionId,
    worldId: run.mission.worldId ?? "",
    title: run.mission.title,
    storyContext: run.mission.description,
    storySetup: run.mission.description,
    guideCharacterId: "",
    supportingCharacterIds: [],
    objectives: [...new Set(activities.map((a) => a.objectiveId))].map((id) => ({
      id,
      statement: activities.find((a) => a.objectiveId === id)?.objective?.name ?? id,
      skillId: activities.find((a) => a.objectiveId === id)?.objective?.competency?.id ?? "",
    })),
    skills: [],
    difficulty: "steady",
    estimatedMinutes: run.mission.estimatedMinutes ?? 15,
    ageBands: ["8-9", "10-11", "12-14"],
    stages: [],
    bossAssessmentId: null,
    rewards: [],
  };
}

/* -------------------------------- service ---------------------------------- */

/** in-memory run id lookup so missionRunService.get(missionId) can resolve to a real run. */
const runsByMissionId = new Map<ID, ID>();

export function effortMet(_activity: MissionActivity, response: ActivityResponse): boolean {
  // Backend's ActivityEvaluator decides pass/fail server-side; the frontend no
  // longer pre-filters, it always submits and reads the real evaluation result.
  return Boolean(response.text || response.selectedOptionIds?.length || response.placements);
}

export const missionRunService = {
  list: async (): Promise<MissionRun[]> => {
    const missions = await fetchAPI<BackendMission[]>("/missions");
    // No run exists yet for these — surface as zero-progress runs derived from mission metadata.
    return missions.map((m) => ({
      id: m.id,
      missionId: m.id,
      worldId: m.worldId ?? "",
      title: m.title,
      storyContext: m.description,
      storySetup: m.description,
      guideCharacterId: "",
      supportingCharacterIds: [],
      objectives: [],
      skills: [],
      difficulty: "steady" as const,
      estimatedMinutes: m.estimatedMinutes ?? 15,
      ageBands: ["8-9", "10-11", "12-14"] as MissionRun["ageBands"],
      stages: [],
      bossAssessmentId: null,
      rewards: [],
    }));
  },

  /** Accepts either a run id or the underlying mission id. */
  get: async (id: ID): Promise<MissionRun | null> => {
    try {
      // If we've started this mission before, `id` may already be a runId.
      const run = await fetchAPI<BackendMissionRun>(`/missions/runs/${id}`).catch(() => null);
      if (run) {
        runsByMissionId.set(run.missionId, run.id);
        return backendMissionRunToMissionRun(run);
      }
      // Otherwise treat `id` as a missionId and start/resume it.
      const started = await fetchAPI<BackendMissionRun>(`/missions/${id}/start`, { method: "POST" });
      runsByMissionId.set(started.missionId, started.id);
      return backendMissionRunToMissionRun(started);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[mission service] get failed", err);
      return null;
    }
  },

  activities: async (missionId: ID): Promise<MissionActivity[]> => {
    const mission = await fetchAPI<BackendMission>(`/missions/${missionId}`);
    return (mission.activities ?? []).map((a) => backendActivityToMissionActivity(a, missionId));
  },

  /** Submit one activity response via the real backend evaluator. */
  submit: async (activityId: ID, response: ActivityResponse): Promise<ActivityResult> => {
    // Need the run id this activity belongs to; caller flows always fetch
    // `get()` first, which populates `runsByMissionId`, but we resolve
    // defensively via the most recently touched run.
    const runId = [...runsByMissionId.values()].pop();
    if (!runId) {
      return Promise.reject(new Error("No active mission run — call missionRunService.get() first"));
    }

    const result = await fetchAPI<BackendSubmitResult>(`/missions/runs/${runId}/submit`, {
      method: "POST",
      body: JSON.stringify({
        activityId,
        response: {
          text: response.text,
          selectedOptionIds: response.selectedOptionIds,
          placements: response.placements,
          order: response.order,
        },
      }),
    });

    const evidence: EvidenceSignal[] = result.evaluation.correct
      ? [
          {
            id: `ev-${result.attempt.id}`,
            activityId,
            objectiveId: "",
            kind: "correct-response",
            statement: result.evaluation.feedback,
            confidence: Math.max(0, Math.min(1, result.evaluation.score ?? 0.7)),
            capturedAt: result.attempt.createdAt,
            unassisted: response.hintsUsed === 0,
          },
        ]
      : [];

    return {
      activityId,
      status: result.evaluation.correct ? "complete" : "revisit",
      feedback: result.evaluation.feedback,
      characterId: "",
      evidence,
      retryReason: result.evaluation.correct ? null : "The backend evaluator did not mark this correct yet.",
      nextSuggestion: result.evaluation.correct
        ? "Good. Next part is waiting when you are."
        : "Try it once more.",
    };
  },

  /** Complete the mission run via the real backend. */
  complete: async (
    missionId: ID,
    evidence: EvidenceSignal[],
    reflection: string | null,
  ): Promise<MissionCompletion> => {
    const runId = runsByMissionId.get(missionId) ?? [...runsByMissionId.values()].pop();
    if (!runId) {
      return Promise.reject(new Error(`No active run for mission ${missionId}`));
    }

    await fetchAPI(`/missions/runs/${runId}/complete`, { method: "POST" });

    // Backend `completeMission` only flips run status — it does not yet compute
    // MasteryDecisions/rewards/review scheduling. Surface the real evidence
    // collected client-side, and leave the pedagogical decision fields empty
    // (rather than fabricate a verdict) until that logic exists server-side.
    return {
      missionId,
      completedAt: new Date().toISOString(),
      evidence,
      masteryDecisions: [] as MasteryDecision[],
      rewardsEarned: [],
      rewardsWithheld: [],
      reviewOptions: [] as ReviewOption[],
      nextRecommendations: [],
      reflection,
    };
  },
};

export const bossService = {
  // No backend BossAssessment model/endpoint exists yet — see
  // docs/architecture/USAM_KIDS_ENGINE_GAP_MATRIX.md. Left unimplemented
  // rather than fabricated.
  list: (): Promise<BossAssessment[]> =>
    Promise.reject(new Error("No backend boss-assessment endpoint yet")),
  get: (_id: ID): Promise<BossAssessment | null> =>
    Promise.reject(new Error("No backend boss-assessment endpoint yet")),
  submit: (_assessmentId: ID, _answers: Record<ID, string>): Promise<BossOutcome> =>
    Promise.reject(new Error("No backend boss-assessment endpoint yet")),
};

/* --------------------------------------------------------------- helpers ---- */

export function evidenceKindLabel(kind: EvidenceSignal["kind"]): string {
  const map: Record<EvidenceSignal["kind"], string> = {
    "correct-response": "a correct answer with reasoning",
    explanation: "an explanation in your own words",
    artifact: "something you made",
    transfer: "using it somewhere new",
    "self-correction": "catching your own change",
    "spoken-response": "saying it out loud",
    "decision-rationale": "a defended decision",
    "process-trace": "a visible way of working",
  };
  return map[kind];
}
