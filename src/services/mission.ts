/**
 * Mission run service.
 *
 * Mock-backed, but shaped exactly like the backend that will replace it:
 * responses go out, evidence and decisions come back. The UI never decides
 * whether something was learned — it only renders what this layer returns.
 */
import {
  bossAssessments,
  missionActivities,
  missionRuns,
  nextRecommendationPool,
} from "@/data/missions";
import type { ID } from "@/types/domain";
import type { MasteryState } from "@/types/curriculum";
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

const respond = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const now = () => new Date().toISOString();

let evidenceCounter = 0;
const evidenceId = () => `ev-${Date.now().toString(36)}-${(evidenceCounter += 1)}`;

/** How much work a response actually contains — used to refuse click-through. */
export function effortMet(activity: MissionActivity, response: ActivityResponse): boolean {
  const req = activity.minimumEffort;
  if (!req) return true;
  if (req.kind === "characters") return (response.text?.trim().length ?? 0) >= req.value;
  if (req.kind === "selections") return (response.selectedOptionIds?.length ?? 0) >= req.value;
  return Object.keys(response.placements ?? {}).length >= req.value;
}

function gradePlacements(activity: MissionActivity, response: ActivityResponse) {
  const items = activity.items ?? [];
  const placed = response.placements ?? {};
  const correct = items.filter((i) => i.bucketId && placed[i.id] === i.bucketId).length;
  return { correct, total: items.length };
}

function gradeSelections(activity: MissionActivity, response: ActivityResponse) {
  const options = activity.options ?? [];
  const chosen = new Set(response.selectedOptionIds ?? []);
  const expected = options.filter((o) => o.correct).map((o) => o.id);
  const hits = expected.filter((id) => chosen.has(id)).length;
  const wrong = [...chosen].filter((id) => !expected.includes(id)).length;
  return { hits, wrong, expected: expected.length };
}

export const missionRunService = {
  list: (): Promise<MissionRun[]> => respond(missionRuns),

  /** Accepts either a run id or the underlying mission id. */
  get: (id: ID): Promise<MissionRun | null> =>
    respond(missionRuns.find((r) => r.id === id || r.missionId === id) ?? null),

  activities: (missionId: ID): Promise<MissionActivity[]> =>
    respond(missionActivities.filter((a) => a.missionId === missionId), 160),

  /**
   * Submit one activity response.
   *
   * Evidence is only produced when the response contains real work. Hint use
   * lowers confidence and marks the evidence assisted — it never blocks it.
   */
  submit: (activityId: ID, response: ActivityResponse): Promise<ActivityResult> => {
    const activity = missionActivities.find((a) => a.id === activityId);
    if (!activity) {
      return Promise.reject(new Error(`Unknown activity ${activityId}`));
    }

    if (!effortMet(activity, response)) {
      return respond<ActivityResult>({
        activityId,
        status: "revisit",
        feedback:
          "There isn't enough here yet for me to see what you can do. Nothing is wrong — it's just not finished.",
        characterId: activity.characterId,
        evidence: [],
        retryReason: "Not enough work to judge",
        nextSuggestion: "Add a little more, then send it again.",
      });
    }

    const unassisted = response.hintsUsed === 0;
    const hintPenalty = Math.min(response.hintsUsed * 0.12, 0.36);
    let confidence = 0.72 - hintPenalty;
    let feedback = "";
    let retryReason: string | null = null;

    if (activity.options?.length) {
      const { hits, wrong, expected } = gradeSelections(activity, response);
      const clean = hits === expected && wrong === 0;
      confidence = clean ? 0.86 - hintPenalty : 0.42 - hintPenalty;
      const chosen = (response.selectedOptionIds ?? [])
        .map((id) => activity.options?.find((o) => o.id === id))
        .filter(Boolean);
      const spoken = chosen.map((o) => o?.feedback).filter(Boolean).join(" ");
      feedback = spoken || (clean ? "That holds up." : "Not yet — look again at what each one actually claims.");
      if (!clean) retryReason = "The reasoning behind at least one choice doesn't hold yet";
    } else if (activity.items?.length) {
      const { correct, total } = gradePlacements(activity, response);
      const ratio = total ? correct / total : 0;
      confidence = Math.max(0.2, ratio * 0.9 - hintPenalty);
      feedback =
        ratio === 1
          ? "Every one of them placed for a reason you could defend."
          : `${correct} of ${total} are where I'd put them. Say your reason for the ones you're unsure about.`;
      if (ratio < 0.75) retryReason = "Several placements suggest the rule hasn't landed yet";
    } else {
      const length = response.text?.trim().length ?? 0;
      const criteria = activity.successCriteria?.length ?? 1;
      confidence = Math.min(0.9, 0.45 + length / 400) - hintPenalty;
      feedback =
        length > 160
          ? "There's real substance here — I can point at specific choices you made."
          : "It works. It's also thin; the next version of this should be harder to misread.";
      if (criteria > 2 && length < 60) retryReason = "Too short to show all of what this asks for";
    }

    const evidence: EvidenceSignal[] = retryReason
      ? []
      : [
          {
            id: evidenceId(),
            activityId,
            objectiveId: activity.objectiveId,
            kind: activity.evidenceKind,
            statement: evidenceStatement(activity),
            confidence: Math.max(0.15, Math.min(0.95, Number(confidence.toFixed(2)))),
            capturedAt: now(),
            unassisted,
          },
        ];

    return respond<ActivityResult>({
      activityId,
      status: retryReason ? "revisit" : "complete",
      feedback,
      characterId: activity.characterId,
      evidence,
      retryReason,
      nextSuggestion: retryReason
        ? "Try it once more. I'll stay here."
        : "Good. Next part is waiting when you are.",
    });
  },

  /**
   * Assemble the end-of-mission decision from collected evidence.
   * Thin evidence produces an honest "not yet", never a consolation pass.
   */
  complete: (missionId: ID, evidence: EvidenceSignal[], reflection: string | null): Promise<MissionCompletion> => {
    const run = missionRuns.find((r) => r.missionId === missionId || r.id === missionId);
    if (!run) return Promise.reject(new Error(`Unknown mission ${missionId}`));

    const kinds = new Set(evidence.map((e) => e.kind));
    const masteryDecisions = run.objectives.map<MasteryDecision>((objective) => {
      const own = evidence.filter((e) => e.objectiveId === objective.id);
      const transfer = own.filter((e) => e.kind === "transfer");
      const unassisted = own.filter((e) => e.unassisted);
      const avg = own.length ? own.reduce((s, e) => s + e.confidence, 0) / own.length : 0;
      const previousState = (run.skills[0]?.entryState ?? "introduced") as MasteryState;

      let decidedState: MasteryState = previousState;
      let sufficientEvidence = false;
      let rationale = "";
      let whatWouldStrengthenIt = "";

      if (own.length === 0) {
        decidedState = previousState;
        rationale = "You moved through the mission, but nothing here shows the skill yet.";
        whatWouldStrengthenIt = "One finished attempt with your own words would change this.";
      } else if (transfer.length > 0 && avg >= 0.7 && unassisted.length >= 2) {
        decidedState = "proficient";
        sufficientEvidence = true;
        rationale =
          "You used it in a setting you were never taught in, more than once, without leaning on hints.";
        whatWouldStrengthenIt = "Holding up when someone pushes back is what's left.";
      } else if (avg >= 0.6) {
        decidedState = "developing";
        sufficientEvidence = true;
        rationale = "Solid inside the mission. I haven't seen it hold outside this story yet.";
        whatWouldStrengthenIt = "One clean attempt somewhere unrelated to the bay.";
      } else {
        decidedState = "practicing";
        rationale = "You can do it with support nearby. That's a real state, not a failure.";
        whatWouldStrengthenIt = "Same task, fewer hints, and it moves.";
      }

      return {
        objectiveId: objective.id,
        objectiveStatement: objective.statement,
        previousState,
        decidedState,
        evidence: own,
        rationale,
        sufficientEvidence,
        whatWouldStrengthenIt,
      };
    });

    const rewardsEarned = run.rewards.filter((r) => r.requiresEvidence.every((k) => kinds.has(k)));
    const rewardsWithheld = run.rewards
      .filter((r) => !rewardsEarned.includes(r))
      .map((reward) => ({
        reward,
        missing: reward.requiresEvidence
          .filter((k) => !kinds.has(k))
          .map(evidenceKindLabel)
          .join(" and "),
      }));

    const objectiveIds = run.objectives.map((o) => o.id);
    const weak = masteryDecisions.some((d) => !d.sufficientEvidence);

    const reviewOptions: ReviewOption[] = [
      {
        mode: "instant-review",
        label: "Go back over it now",
        description: "Walk your own answers with Lina while it's still fresh.",
        scheduledFor: null,
        objectiveIds,
        reason: "Reviewing immediately catches the thing you almost noticed.",
        recommended: weak,
      },
      {
        mode: "later-review",
        label: "Look at it tomorrow",
        description: "Saved to your path for the next time you're here.",
        scheduledFor: inDays(1),
        objectiveIds,
        reason: "A night between attempt and review usually helps more than repeating now.",
        recommended: !weak,
      },
      {
        mode: "spaced-review",
        label: "Space it out",
        description: "Short check-ins at 2, 7 and 21 days.",
        scheduledFor: inDays(2),
        objectiveIds,
        reason: "Spacing is how this stops needing to be remembered on purpose.",
        recommended: !weak,
      },
      {
        mode: "practice-again",
        label: "Practise the same thing",
        description: "The same skill, smaller tasks, no story.",
        scheduledFor: null,
        objectiveIds,
        reason: "Useful when the idea is clear but the doing is still slow.",
        recommended: false,
      },
      {
        mode: "challenge-again",
        label: "Take the hard version",
        description: "Same skill, unfamiliar setting, no hints.",
        scheduledFor: null,
        objectiveIds,
        reason: "Only worth it if the last attempt felt too easy.",
        recommended: !weak && kinds.has("transfer"),
      },
    ];

    const nextRecommendations = nextRecommendationPool.filter((r) =>
      r.kind === "boss-assessment"
        ? Boolean(run.bossAssessmentId) && kinds.has("transfer")
        : r.kind === "practice"
          ? weak
          : true,
    );

    return respond<MissionCompletion>(
      {
        missionId: run.missionId,
        completedAt: now(),
        evidence,
        masteryDecisions,
        rewardsEarned,
        rewardsWithheld,
        reviewOptions,
        nextRecommendations,
        reflection,
      },
      320,
    );
  },
};

export const bossService = {
  list: (): Promise<BossAssessment[]> => respond(bossAssessments),
  get: (id: ID): Promise<BossAssessment | null> =>
    respond(bossAssessments.find((b) => b.id === id) ?? null),

  /** Boss grading looks at transfer and defence, never at recall. */
  submit: (assessmentId: ID, answers: Record<ID, string>): Promise<BossOutcome> => {
    const boss = bossAssessments.find((b) => b.id === assessmentId);
    if (!boss) return Promise.reject(new Error(`Unknown assessment ${assessmentId}`));

    const perTask = boss.tasks.map((task) => {
      const text = (answers[task.id] ?? "").trim();
      const required = task.minimumEffort?.value ?? 80;
      const met = text.length >= required;
      return {
        taskId: task.id,
        met,
        observation: met
          ? task.transferDistance === "far"
            ? "You carried the skill into a situation that shared none of the original setting."
            : "You applied it close to home, and you named your reasons."
          : "There isn't enough here to tell whether you can do this or not.",
      };
    });

    const metCount = perTask.filter((t) => t.met).length;
    const verdict: BossOutcome["verdict"] =
      metCount === boss.tasks.length
        ? "demonstrated"
        : metCount > 0
          ? "partially-demonstrated"
          : "not-yet";

    const evidence: EvidenceSignal[] = perTask
      .filter((t) => t.met)
      .map((t) => {
        const task = boss.tasks.find((x) => x.id === t.taskId)!;
        return {
          id: evidenceId(),
          activityId: t.taskId,
          objectiveId: boss.objectiveIds[0] ?? "",
          kind: task.kind === "defence" ? "decision-rationale" : "transfer",
          statement: `${task.title}: ${(task.lookingFor[0] ?? "held up").toLowerCase()}.`,
          confidence: task.transferDistance === "far" ? 0.88 : 0.76,
          capturedAt: now(),
          unassisted: true,
        };
      });

    const masteryDecisions: MasteryDecision[] = boss.objectiveIds.map((objectiveId) => ({
      objectiveId,
      objectiveStatement: objectiveId,
      previousState: "proficient",
      decidedState: verdict === "demonstrated" ? "mastered" : "proficient",
      evidence,
      rationale:
        verdict === "demonstrated"
          ? "It held in unfamiliar situations and it held when the table pushed back."
          : "It holds where you've practised. The table asks for more than that, and that's fine for today.",
      sufficientEvidence: verdict === "demonstrated",
      whatWouldStrengthenIt:
        verdict === "demonstrated"
          ? "Teach it to someone else. That's the last honest test."
          : "One far-transfer task finished properly would settle it.",
    }));

    const reviewOptions: ReviewOption[] = [
      {
        mode: "instant-review",
        label: "Hear the table's reasoning now",
        description: "Lina walks each task and says what she saw.",
        scheduledFor: null,
        objectiveIds: boss.objectiveIds,
        reason: "Boss feedback is most useful before you've explained it to yourself.",
        recommended: true,
      },
      {
        mode: "spaced-review",
        label: "Space it out",
        description: "Check-ins at 2, 7 and 21 days.",
        scheduledFor: inDays(2),
        objectiveIds: boss.objectiveIds,
        reason: "Assessment-level skills fade fastest without spacing.",
        recommended: verdict === "demonstrated",
      },
      {
        mode: "challenge-again",
        label: "Come back to the table",
        description: "Different questions, same standard.",
        scheduledFor: null,
        objectiveIds: boss.objectiveIds,
        reason: boss.retryPolicy,
        recommended: verdict !== "demonstrated",
      },
    ];

    return respond<BossOutcome>(
      {
        assessmentId,
        verdict,
        summary:
          verdict === "demonstrated"
            ? "Every task held, including the one designed to be unfamiliar."
            : verdict === "partially-demonstrated"
              ? "Part of it held. The part that didn't is worth naming honestly."
              : "Not today — and nothing was lost by trying.",
        perTask,
        evidence,
        masteryDecisions,
        reviewOptions,
      },
      360,
    );
  },
};

/* --------------------------------------------------------------- helpers ---- */

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

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

function evidenceStatement(activity: MissionActivity): string {
  const map: Record<EvidenceSignal["kind"], string> = {
    "correct-response": `Chose correctly in "${activity.title}" and could say why.`,
    explanation: `Explained the idea in their own words during "${activity.title}".`,
    artifact: `Produced a finished piece of work in "${activity.title}".`,
    transfer: `Used the skill in an unfamiliar setting in "${activity.title}".`,
    "self-correction": `Noticed and named a change in their own work.`,
    "spoken-response": `Spoke unscripted for the length of "${activity.title}".`,
    "decision-rationale": `Made a decision and gave the reasoning behind it.`,
    "process-trace": `Worked one hypothesis at a time instead of guessing.`,
  };
  return map[activity.evidenceKind];
}
