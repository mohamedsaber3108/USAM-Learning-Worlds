/**
 * Creative Studio domain.
 *
 * The unit of work is a *creation*, not a lesson. A creation moves through a
 * fixed nine-stage flow, and the flow is deliberately front-loaded with
 * thinking (idea → explore → plan) so that "create" is not the first thing a
 * child does. AI participates at every stage but is bounded by
 * `AssistKind` — there is no move that authors the work.
 */
import type { AgeBand, ID } from "@/types/domain";

export type StudioId =
  | "art"
  | "story"
  | "animation"
  | "game"
  | "design"
  | "music"
  | "video"
  | "presentation"
  | "writing";

/** The nine stages every creation passes through, in order. */
export type CreationStage =
  | "idea"
  | "explore"
  | "plan"
  | "create"
  | "iterate"
  | "feedback"
  | "improve"
  | "publish"
  | "portfolio";

export interface CreationStageMeta {
  id: CreationStage;
  label: string;
  /** What the child is actually doing here — one sentence, no jargon. */
  purpose: string;
  /** What has to exist before the stage can be called done. */
  exitCriterion: string;
  /** What the AI is allowed to contribute at this stage. */
  allowedAssists: AssistKind[];
}

/**
 * The complete set of things AI may do in a studio.
 *
 * There is no `generate-final-work` member and there must never be one. Adding
 * one would move authorship off the child, which is the single thing this
 * whole module exists to prevent.
 */
export type AssistKind =
  | "brainstorm"
  | "suggest"
  | "explain"
  | "starter-idea"
  | "feedback"
  | "debug"
  | "alternatives";

export interface AssistOffer {
  kind: AssistKind;
  label: string;
  /** Shown before the child asks, so the trade is visible up front. */
  cost: string;
}

export interface AssistResponse {
  id: ID;
  kind: AssistKind;
  stage: CreationStage;
  /** Always phrased as material to react to — never as finished work. */
  body: string[];
  /** The question handed back to the child, so the turn ends with them. */
  returnQuestion: string;
  /** Set when the request asked the AI to do the making itself. */
  declined?: string;
}

export type CreationStatus = "draft" | "in-progress" | "completed" | "featured";
export type CreationVisibility = "private" | "family" | "mentor" | "community";

export interface CreationMedium {
  /** What the child physically produces in this studio. */
  artifact: string;
  /** The tool surface the studio opens with, per layer. */
  surface: Record<AgeBand, string>;
}

export interface Studio {
  id: StudioId;
  name: string;
  tagline: string;
  /** Why this studio exists as a learning space, not a toy. */
  purpose: string;
  medium: CreationMedium;
  /** Craft skills this studio actually builds. */
  craftSkills: string[];
  /** Domains it quietly pulls from — creation is cross-curricular. */
  connectedDomains: string[];
  /** Prompts seeded per layer so the blank page is never truly blank. */
  seeds: Record<AgeBand, string[]>;
  accent: "primary" | "secondary" | "accent";
}

export interface CritiqueNote {
  id: ID;
  /** Who said it. Mentors and peers carry different weight in the UI. */
  source: "mentor" | "peer" | "self";
  author: string;
  /** Named so feedback is about the work, not the person. */
  focus: "strength" | "question" | "suggestion";
  body: string;
  /** Whether the child chose to act on it — declining is a valid answer. */
  response?: "applied" | "declined" | "deferred";
}

export interface CreationRevision {
  id: ID;
  version: number;
  changedAt: string;
  /** Written by the child: what changed and why. */
  note: string;
  /** Whether the change came from their own eye or from a critique note. */
  driver: "own-idea" | "critique" | "constraint";
}

export interface Creation {
  id: ID;
  studioId: StudioId;
  title: string;
  /** The child's own one-line description of the intent. */
  intent: string;
  stage: CreationStage;
  status: CreationStatus;
  visibility: CreationVisibility;
  updatedAt: string;
  plan: string[];
  revisions: CreationRevision[];
  critique: CritiqueNote[];
  /** Written at publish time; the thing that makes it portfolio-worthy. */
  artistStatement?: string;
  /** How much of the work the child attributes to AI help. Self-declared. */
  aiAssistLog: { kind: AssistKind; stage: CreationStage; at: string }[];
  portfolioItemId?: ID;
}

export interface StudioSnapshot {
  studio: Studio;
  creations: Creation[];
  stages: CreationStageMeta[];
}

export interface CreativeStudioSnapshot {
  studios: Studio[];
  recent: Creation[];
  stages: CreationStageMeta[];
  /** Aggregate honesty check across all creations. */
  authorship: { ownMoves: number; assistedMoves: number };
}
