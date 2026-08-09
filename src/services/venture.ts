/**
 * Entrepreneurship service.
 *
 * The simulation reducer is pure: `applyDecision` takes a run and a choice and
 * returns a new run. That keeps the whole world replayable and makes swapping
 * in a backend a matter of persisting `SimRun`, not rewriting the UI.
 */
import {
  decisionById,
  decisions,
  labById,
  labs,
  metrics,
  pitchCriteria,
  pitchSections,
  scenarios,
  scenariosByLab,
  skills,
} from "@/data/venture";
import type {
  Pitch,
  PitchFeedback,
  PitchFeedbackNote,
  PitchSectionId,
  PeerFeedback,
  PeerReviewRequest,
  SimDelta,
  SimRun,
  SimState,
  VentureLabSnapshot,
  VentureOverview,
} from "@/types/venture";

const respond = <T,>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const BOUNDED: (keyof SimState)[] = ["reputation", "quality", "team", "market", "risk"];

/** Clamp bounded metrics to 0–100; cash, customers and time stay open-ended. */
export function applyDelta(state: SimState, delta: SimDelta): SimState {
  const next = { ...state };
  (Object.keys(delta) as (keyof SimState)[]).forEach((key) => {
    const value = (next[key] ?? 0) + (delta[key] ?? 0);
    next[key] = BOUNDED.includes(key) ? Math.max(0, Math.min(100, value)) : Math.max(0, value);
  });
  return next;
}

export const ventureKeys = {
  overview: (band: string) => ["venture", "overview", band] as const,
  lab: (labId: string) => ["venture", "lab", labId] as const,
  pitch: () => ["venture", "pitch"] as const,
};

export const ventureService = {
  async overview(): Promise<VentureOverview> {
    return respond({
      labs,
      metrics,
      skills,
      activeRuns: [
        { runId: "run-demo-hq", scenarioId: "sc-hq", labId: "hq" as const, name: "The full run", step: 1, total: 3 },
      ],
    });
  },

  async lab(labId: string): Promise<VentureLabSnapshot | null> {
    const lab = labById.get(labId as never);
    if (!lab) return respond(null);
    const labScenarios = scenariosByLab(labId);
    const ids = new Set(labScenarios.flatMap((s) => s.decisionIds));
    return respond({
      lab,
      scenarios: labScenarios,
      decisions: decisions.filter((d) => ids.has(d.id)),
      metrics,
      skills,
    });
  },

  startRun(scenarioId: string): SimRun {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);
    return {
      id: uid("run"),
      scenarioId,
      state: { ...scenario.start },
      step: 0,
      status: "running",
      log: [],
    };
  },

  /** Pure reducer — no I/O, so a run can be replayed or persisted verbatim. */
  applyDecision(run: SimRun, decisionId: string, optionId: string): SimRun {
    const decision = decisionById.get(decisionId);
    const option = decision?.options.find((o) => o.id === optionId);
    const scenario = scenarios.find((s) => s.id === run.scenarioId);
    if (!decision || !option || !scenario) return run;

    const effects: SimDelta = { time: -1, ...option.effects };
    const state = applyDelta(run.state, effects);
    const step = run.step + 1;
    return {
      ...run,
      state,
      step,
      status: step >= scenario.decisionIds.length ? "complete" : "running",
      log: [
        ...run.log,
        {
          decisionId,
          optionId,
          optionLabel: option.label,
          effects,
          consequence: option.consequence,
          teachingPoint: decision.teachingPoint,
          skills: option.skills,
          after: state,
        },
      ],
    };
  },

  recordReflection(run: SimRun, reflection: string): SimRun {
    return { ...run, reflection };
  },

  pitchSections: () => pitchSections,
  pitchCriteria: () => pitchCriteria,

  /**
   * Mock coaching. Heuristic on purpose: it rewards specificity, evidence and
   * a real number, and it never returns a score — only a band plus one move.
   */
  async pitchFeedback(pitch: Pitch): Promise<PitchFeedback> {
    const filled = pitchSections.filter((s) => (pitch.sections[s.id] ?? "").trim().length > 12);
    const missing = pitchSections
      .filter((s) => (pitch.sections[s.id] ?? "").trim().length <= 12)
      .map((s) => s.id as PitchSectionId);
    const text = Object.values(pitch.sections).join(" ").toLowerCase();
    const hasNumber = /\d/.test(text);
    const hasQuote = /(said|told me|asked for|"|')/.test(text);
    const vague = /(everyone|everybody|all people|lots of people|anyone)/.test(text);

    const notes: PitchFeedbackNote[] = [];
    if (filled.length >= 4) {
      notes.push({
        criterionId: "pc-clarity",
        kind: "strength",
        body: "You answered most of the six questions, so a listener can follow the shape of it.",
      });
    }
    notes.push({
      criterionId: "pc-evidence",
      kind: hasQuote ? "strength" : "suggestion",
      body: hasQuote
        ? "You point at something a real person said. That's the part people believe."
        : "Add one sentence someone actually said to you. One quote beats three adjectives.",
    });
    notes.push({
      criterionId: "pc-money",
      kind: hasNumber ? "strength" : "suggestion",
      body: hasNumber
        ? "There's a number in here, which means your money section can be checked."
        : "Put in your cost and your price in Sim Coins, then say what's left.",
    });
    if (vague) {
      notes.push({
        criterionId: "pc-specific",
        kind: "question",
        body: "You said 'everyone' — who is it definitely not for? Naming that makes the rest sharper.",
      });
    }
    notes.push({
      criterionId: "pc-ask",
      kind: (pitch.sections.ask ?? "").trim().length > 12 ? "question" : "suggestion",
      body:
        (pitch.sections.ask ?? "").trim().length > 12
          ? "Could someone say yes to your ask today, or does it need a meeting first?"
          : "End with one specific ask. 'Any help' is not an ask.",
    });

    const strengthCount = notes.filter((n) => n.kind === "strength").length;
    const band: PitchFeedback["band"] =
      missing.length > 2 ? "getting-there" : strengthCount >= 3 ? "convincing" : "solid";

    return respond({
      id: uid("fb"),
      band,
      headline:
        band === "convincing"
          ? "A stranger could repeat this back to you correctly."
          : band === "solid"
            ? "The shape is right. Sharpen one section and it lands."
            : "There's a real idea in here — it just isn't fully said out loud yet.",
      notes,
      missing,
    }, 420);
  },

  /**
   * Peer feedback is architected, not open. Reviews stay gated behind adult
   * approval; this returns the structure so the UI is ready when it opens.
   */
  async peerReview(pitchId: string): Promise<{ request: PeerReviewRequest; received: PeerFeedback[] }> {
    return respond({
      request: { id: uid("pr"), pitchId, status: "awaiting-approval", reviewerCount: 3 },
      received: [
        {
          id: "peer-1",
          reviewer: "Reviewer A",
          kind: "strength",
          body: "I understood who it was for by the second sentence.",
          receivedAt: "2 days ago",
        },
        {
          id: "peer-2",
          reviewer: "Reviewer B",
          kind: "question",
          body: "How do you know people would pay rather than just liking it?",
          receivedAt: "2 days ago",
        },
      ],
    });
  },
};
