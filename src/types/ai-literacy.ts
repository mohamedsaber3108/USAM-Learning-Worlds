/**
 * Phase 9 — AI literacy domain model.
 *
 * Two commitments encoded here:
 *
 * 1. AI literacy is not prompt engineering. `AiConceptId` is a twenty-two
 *    concept progression from "what is AI" through data, prediction, bias,
 *    privacy, copyright and agency. Prompting is *one* node inside it.
 * 2. AI is an object of study as much as a tool. Every playground runs the
 *    same seven-move experiment loop — input, action, output, compare,
 *    evaluate, improve, reflect — so a learner never lands on a screen whose
 *    only affordance is "ask the AI something".
 */
import type { AgeBand, ID } from "@/types/domain";
import type { MasteryState } from "@/types/curriculum";

/* ------------------------------------------------------------------ */
/* Progression                                                         */
/* ------------------------------------------------------------------ */

export type AiConceptId =
  | "what-is-ai"
  | "how-models-learn"
  | "data"
  | "patterns"
  | "prediction"
  | "generative-ai"
  | "language-models"
  | "images"
  | "voice"
  | "multimodal"
  | "prompting"
  | "evaluation"
  | "hallucinations"
  | "bias"
  | "privacy"
  | "safety"
  | "copyright"
  | "ethics"
  | "human-ai-collaboration"
  | "automation"
  | "agents"
  | "ai-projects";

/** The competency model. Mastery is claimed per competency, not per topic. */
export type AiCompetency = "understand" | "use" | "evaluate" | "create" | "reflect" | "act";

/** How a concept is spoken about at one age layer. The objective never moves. */
export interface AiConceptFraming {
  title: string;
  summary: string;
  /** Something concrete the learner does that shows they hold the idea. */
  provesIt: string;
  /** A question a learner of this age can actually ask about the system. */
  askThis: string;
}

export interface AiConcept {
  id: AiConceptId;
  /** Age-independent. This is what is assessed. */
  objective: string;
  requires: AiConceptId[];
  /** Competencies this concept mainly builds. */
  competencies: AiCompetency[];
  coreFor: AgeBand[];
  mastery: MasteryState;
  evidence: string[];
  /** A misconception this concept exists to dismantle. */
  misconception: string;
  framing: Record<AgeBand, AiConceptFraming>;
}

export interface CompetencyStanding {
  competency: AiCompetency;
  mastery: MasteryState;
  /** Plain-language description of what the learner has shown. */
  shown: string;
  /** The next thing that would count as evidence. */
  nextEvidence: string;
}

/* ------------------------------------------------------------------ */
/* Playgrounds                                                          */
/* ------------------------------------------------------------------ */

export type PlaygroundId =
  | "prompt-lab"
  | "image-ai-lab"
  | "voice-ai-lab"
  | "evaluation-lab"
  | "agent-lab"
  | "automation-lab"
  | "ethics-lab";

/** Which experiment surface a playground presents. */
export type ExperimentKind =
  | "prompt"
  | "image"
  | "voice"
  | "evaluation"
  | "agent"
  | "automation"
  | "ethics";

/** A choice of "model / action" the learner makes before running. */
export interface ActionOption {
  id: string;
  label: string;
  /** What this actually does, in a sentence a child can read. */
  describes: string;
  /** Honest note about the trade-off — cost, speed, reliability, risk. */
  tradeoff: string;
}

/** One rubric line the learner scores the output against. */
export interface EvaluationCriterion {
  id: string;
  label: string;
  /** What a strong answer looks like on this line. */
  strong: string;
  /** What a weak answer looks like. */
  weak: string;
}

export interface AiPlayground {
  id: PlaygroundId;
  kind: ExperimentKind;
  name: string;
  /** The learning purpose. Never "try the AI". */
  purpose: string;
  concepts: AiConceptId[];
  competencies: AiCompetency[];
  availableFor: AgeBand[];
  /** Guardrail copy shown before any run. */
  guardrail: string;
  status: "available" | "planned";
}

/* ------------------------------------------------------------------ */
/* Experiments                                                          */
/* ------------------------------------------------------------------ */

/** The seven moves. Every playground walks the same arc. */
export type ExperimentStep =
  | "input"
  | "action"
  | "output"
  | "compare"
  | "evaluate"
  | "improve"
  | "reflect";

export interface AiExperiment {
  id: ID;
  playgroundId: PlaygroundId;
  kind: ExperimentKind;
  title: string;
  /** The question the experiment answers about the system. */
  question: string;
  /** Framing per age layer — same experiment, different scaffolding. */
  framing: Record<AgeBand, { brief: string; watchFor: string }>;
  /** Label above the input box, e.g. "Your prompt" / "The rule you'd automate". */
  inputLabel: string;
  inputPlaceholder: string;
  /** Two or more starting inputs so "compare" is possible from the first run. */
  seeds: { id: string; label: string; value: string }[];
  actions: ActionOption[];
  criteria: EvaluationCriterion[];
  /** Prompts for the reflection move. Not optional — this is where learning lands. */
  reflectionPrompts: string[];
  /** How many runs the session allows. A hard stop, by design. */
  runBudget: number;
}

/** What the mock model returned for one run. */
export interface ExperimentRun {
  id: ID;
  experimentId: ID;
  input: string;
  actionId: string;
  at: string;
  output: ExperimentOutput;
  /** Learner scores, filled in during the evaluate move. */
  scores: Record<string, 1 | 2 | 3>;
  /** What the learner changed and why, filled in during improve. */
  improvementNote?: string;
}

export type ExperimentOutput =
  | { type: "text"; body: string; notes: OutputNote[] }
  | { type: "image"; caption: string; palette: string[]; notes: OutputNote[] }
  | { type: "transcript"; heard: string; confidence: number; notes: OutputNote[] }
  | { type: "judgement"; verdict: string; reasons: string[]; notes: OutputNote[] }
  | { type: "plan"; steps: { text: string; needsHuman: boolean }[]; notes: OutputNote[] };

/** A flag on the output. This is the teaching payload, not decoration. */
export interface OutputNote {
  kind: "hallucination" | "bias" | "privacy" | "copyright" | "uncertainty" | "strength";
  text: string;
}

export interface AiPathwaySnapshot {
  ageBand: AgeBand;
  concepts: AiConcept[];
  competencies: CompetencyStanding[];
  playgrounds: AiPlayground[];
  /** The concept the learner is actively building. */
  currentConceptId: AiConceptId;
  /** Session guardrail: how much AI-assisted time is left today. */
  session: { usedMinutes: number; capMinutes: number; runsToday: number };
}
