/**
 * Entrepreneurship World domain.
 *
 * The unit of learning is a *decision*, not a lesson. A child sets a
 * simulation running, makes a choice, and watches eight coupled metrics move —
 * including the ones that punish greed (reputation, risk, team). Every value in
 * here is fictional: the currency is Sim Coins, never a real unit, and nothing
 * in this module may ever accept, display or imply real money.
 */
import type { AgeBand, ID } from "@/types/domain";

export type VentureLabId =
  | "idea"
  | "problem"
  | "customer"
  | "product"
  | "brand"
  | "marketing"
  | "sales"
  | "finance"
  | "hq"
  | "pitch";

/** The sixteen skills this world claims to build. Decisions map onto these. */
export type VentureSkill =
  | "problem-identification"
  | "ideation"
  | "customer-understanding"
  | "value-proposition"
  | "pricing"
  | "budgeting"
  | "revenue"
  | "cost"
  | "profit"
  | "marketing"
  | "sales"
  | "negotiation"
  | "communication"
  | "pitching"
  | "teamwork"
  | "decision-making";

export interface VentureSkillMeta {
  id: VentureSkill;
  label: string;
  /** What it means at this age, in plain language. */
  meaning: string;
}

/* ------------------------------ simulation ------------------------------- */

/** The eight things a venture simulation tracks. Nothing else is a metric. */
export type SimMetricId =
  | "cash"
  | "customers"
  | "reputation"
  | "quality"
  | "team"
  | "market"
  | "time"
  | "risk";

export interface SimMetricMeta {
  id: SimMetricId;
  label: string;
  /** Suffix or currency marker. `SC` = Sim Coins, a fictional currency. */
  unit: string;
  /** Whether more is better, or whether the number wants to stay in a band. */
  direction: "higher-better" | "lower-better" | "balance";
  /** Ceiling used for the meter. Cash and customers are open-ended. */
  scale?: number;
  description: string;
}

export type SimState = Record<SimMetricId, number>;

export type SimDelta = Partial<Record<SimMetricId, number>>;

export interface DecisionOption {
  id: ID;
  label: string;
  /** The honest cost of this option, shown before choosing. */
  tradeoff: string;
  effects: SimDelta;
  /** Skills this choice exercises regardless of whether it works out. */
  skills: VentureSkill[];
  /** What the world says back once the option is taken. */
  consequence: string;
}

export interface VentureDecision {
  id: ID;
  labId: VentureLabId;
  title: string;
  /** The situation, told as a scene rather than a word problem. */
  situation: string;
  question: string;
  options: DecisionOption[];
  /** Named after the choice so the lesson is earned, not previewed. */
  teachingPoint: string;
}

export interface ScenarioVariant {
  /** Age-appropriate framing. The mechanics underneath stay identical. */
  title: string;
  premise: string;
  /** What "doing well" means here — not a score. */
  successLooksLike: string;
}

export interface VentureScenario {
  id: ID;
  labId: VentureLabId;
  name: string;
  variants: Record<AgeBand, ScenarioVariant>;
  start: SimState;
  decisionIds: ID[];
  closingReflection: string[];
}

export interface SimLogEntry {
  decisionId: ID;
  optionId: ID;
  optionLabel: string;
  effects: SimDelta;
  consequence: string;
  teachingPoint: string;
  skills: VentureSkill[];
  /** State captured after the choice, so the run can be replayed visually. */
  after: SimState;
}

export type SimRunStatus = "running" | "complete";

export interface SimRun {
  id: ID;
  scenarioId: ID;
  state: SimState;
  step: number;
  status: SimRunStatus;
  log: SimLogEntry[];
  /** Written by the child at the end; the run isn't finished without it. */
  reflection?: string;
}

/* --------------------------------- labs ---------------------------------- */

export interface VentureLab {
  id: VentureLabId;
  name: string;
  tagline: string;
  /** Why the lab exists as a thinking space. */
  purpose: string;
  /** What the child leaves with. */
  output: string;
  skills: VentureSkill[];
  /** The room's framing per layer — shop, small business, startup. */
  framing: Record<AgeBand, string>;
  accent: "primary" | "secondary" | "accent";
  /** Pitch Stage is not a simulation; it runs the pitch surface instead. */
  kind: "simulation" | "pitch";
}

export interface VentureLabSnapshot {
  lab: VentureLab;
  scenarios: VentureScenario[];
  decisions: VentureDecision[];
  metrics: SimMetricMeta[];
  skills: VentureSkillMeta[];
}

export interface VentureOverview {
  labs: VentureLab[];
  metrics: SimMetricMeta[];
  skills: VentureSkillMeta[];
  /** Runs already in flight, so the hub shows work rather than a menu. */
  activeRuns: { runId: ID; scenarioId: ID; labId: VentureLabId; name: string; step: number; total: number }[];
}

/* --------------------------------- pitch --------------------------------- */

export type PitchSectionId =
  | "problem"
  | "customer"
  | "solution"
  | "different"
  | "money"
  | "ask";

export interface PitchSectionMeta {
  id: PitchSectionId;
  label: string;
  /** The one question the section has to answer. */
  question: string;
  hint: Record<AgeBand, string>;
  /** Seconds this section should take on stage. */
  seconds: number;
}

export interface Pitch {
  id: ID;
  ventureName: string;
  sections: Record<PitchSectionId, string>;
  updatedAt: string;
}

export interface PitchCriterion {
  id: ID;
  label: string;
  /** What a strong version sounds like. Shown before feedback, not after. */
  strongLooksLike: string;
}

export interface PitchFeedbackNote {
  criterionId: ID;
  /** Deliberately three kinds only — praise, question, and one concrete move. */
  kind: "strength" | "question" | "suggestion";
  body: string;
}

export interface PitchFeedback {
  id: ID;
  /** Simulated coaching. Never a grade — bands, and always with a next move. */
  band: "getting-there" | "solid" | "convincing";
  headline: string;
  notes: PitchFeedbackNote[];
  /** Sections the model could not find an answer for. */
  missing: PitchSectionId[];
}

export interface PeerReviewRequest {
  id: ID;
  pitchId: ID;
  /** Peer review is architected but gated: adults approve before it opens. */
  status: "not-requested" | "awaiting-approval" | "open" | "closed";
  reviewerCount: number;
}

export interface PeerFeedback {
  id: ID;
  reviewer: string;
  /** Same three-kind structure as AI feedback, so the shape is learnable. */
  kind: PitchFeedbackNote["kind"];
  body: string;
  receivedAt: string;
}
