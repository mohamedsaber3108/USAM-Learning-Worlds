/**
 * Phase 8 — coding domain model.
 *
 * Two things this file is careful about:
 *
 * 1. The runtime is an *adapter*, not the curriculum. A concept like "loops"
 *    is the same concept in Blockly and in Python; only the surface changes.
 *    `CodeSandboxAdapter` is the seam a real sandbox (Pyodide worker, iframe
 *    runner, Scratch VM) drops into later without touching a single screen.
 * 2. The AI mentor cannot type for the learner. Its whole vocabulary is the
 *    `MentorSupportKind` union — seven ways of handing thinking back.
 */
import type { AgeBand, ID } from "@/types/domain";
import type { MasteryState } from "@/types/curriculum";

/* ------------------------------------------------------------------ */
/* Learning progression                                                */
/* ------------------------------------------------------------------ */

/** The full computer-science spine, in teaching order. */
export type CodingConceptId =
  | "computational-thinking"
  | "sequences"
  | "logic"
  | "patterns"
  | "conditionals"
  | "loops"
  | "variables"
  | "functions"
  | "debugging"
  | "data"
  | "algorithms"
  | "abstraction"
  | "visual-programming"
  | "python"
  | "web"
  | "javascript"
  | "projects"
  | "ai-coding";

/** How a concept is framed for one age layer. Objectives stay stable. */
export interface ConceptFraming {
  /** What we call it out loud at this age. */
  title: string;
  /** One sentence a learner of this age would actually read. */
  summary: string;
  /** The surface the learner meets it on. */
  surface: CodingSurface;
  /** A concrete thing they can do that proves it. */
  provesIt: string;
}

export type CodingSurface = "unplugged" | "blocks" | "blocks-plus-text" | "text" | "project";

export interface CodingConcept {
  id: CodingConceptId;
  /** Stable, age-independent objective. This is what mastery is measured on. */
  objective: string;
  /** Prerequisite concepts. Drives the pathway graph. */
  requires: CodingConceptId[];
  /** Which age layers meet this concept as core work. */
  coreFor: AgeBand[];
  mastery: MasteryState;
  /** Evidence collected so far, in plain language. */
  evidence: string[];
  framing: Record<AgeBand, ConceptFraming>;
}

/* ------------------------------------------------------------------ */
/* Runtime adapters                                                     */
/* ------------------------------------------------------------------ */

export type AdapterId = "scratch" | "blockly" | "pyodide" | "javascript" | "html-css" | "react";

export type AdapterStatus = "available" | "planned";

export interface AdapterDescriptor {
  id: AdapterId;
  label: string;
  /** What the learner writes in. */
  editor: "blocks" | "text" | "markup";
  language: string;
  status: AdapterStatus;
  /** Honest note about what the shell does today versus later. */
  note: string;
  supportsConsole: boolean;
  supportsPreview: boolean;
  supportsTests: boolean;
}

export interface CodeFile {
  id: ID;
  /** Path within the project, e.g. "main.py" or "src/index.html". */
  path: string;
  language: "python" | "javascript" | "html" | "css" | "blocks" | "text";
  contents: string;
  /** Locked files are scaffolding the learner reads but does not edit. */
  readOnly?: boolean;
}

/** One block in a visual program. Flat list plus depth keeps it renderable. */
export interface CodeBlock {
  id: ID;
  label: string;
  kind: "event" | "action" | "control" | "value" | "operator";
  depth: number;
}

export interface ConsoleLine {
  stream: "stdout" | "stderr" | "system";
  text: string;
}

export interface TestResult {
  id: ID;
  label: string;
  status: "passed" | "failed" | "not-run";
  /** Shown on failure. Describes the gap, never the fix. */
  observed?: string | undefined;
  expected?: string | undefined;
}

export interface RunResult {
  status: "ok" | "runtime-error" | "timeout";
  console: ConsoleLine[];
  /** HTML/CSS and drawing adapters return a preview description or markup. */
  preview?: { kind: "html" | "stage"; body: string } | undefined;
  tests: TestResult[];
  durationMs: number;
  /** Present when something threw. Feeds the debugging panel. */
  error?: RuntimeFault | undefined;
}

export interface RuntimeFault {
  message: string;
  filePath?: string;
  line?: number;
  /** A question, not an answer. The debugging panel leads with this. */
  askYourself: string;
}

/**
 * The seam a real execution backend implements.
 *
 * Nothing in the UI knows whether this is a Pyodide worker, a sandboxed
 * iframe, a Scratch VM, or (today) a mock. Deliberately small.
 */
export interface CodeSandboxAdapter {
  readonly descriptor: AdapterDescriptor;
  /** Boot the runtime. Idempotent. */
  init(): Promise<void>;
  /** Execute the current project and return everything the UI renders. */
  run(input: { files: CodeFile[]; blocks?: CodeBlock[]; entry?: string }): Promise<RunResult>;
  /** Run the lab's checks without showing raw output. */
  test(input: { files: CodeFile[]; blocks?: CodeBlock[]; tests: TestResult[] }): Promise<TestResult[]>;
  /** Stop a run in progress. */
  stop(): Promise<void>;
  /** Release the runtime. */
  dispose(): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* AI mentor — support without authorship                              */
/* ------------------------------------------------------------------ */

/**
 * Every way the mentor is allowed to help. There is no "write it for me",
 * and there never will be: the union is the guardrail.
 */
export type MentorSupportKind =
  | "hint"
  | "explanation"
  | "debugging-question"
  | "guided-correction"
  | "example"
  | "concept-explanation"
  | "reflection";

export interface MentorSupport {
  kind: MentorSupportKind;
  /** Character delivering it — Koda by default in the coding worlds. */
  characterId: ID;
  body: string;
  /** Optional follow-up the learner answers themselves. */
  askBack?: string | undefined;
  /** For examples: deliberately a *different* problem, never the lab's. */
  exampleOf?: string;
}

export interface MentorSupportRequest {
  labId: ID;
  kind: MentorSupportKind;
  /** How many supports the learner already pulled on this lab. */
  used: number;
  lastError?: RuntimeFault;
}

/* ------------------------------------------------------------------ */
/* Labs and projects                                                   */
/* ------------------------------------------------------------------ */

export interface LabInstructions {
  goal: string;
  steps: string[];
  /** What "done" means, in the learner's terms. */
  doneWhen: string[];
  /** Optional constraint that makes the thinking necessary. */
  constraint?: string;
}

export interface CodingLab {
  id: ID;
  title: string;
  /** Story wrapper. One line — the work is the point. */
  premise: string;
  adapterId: AdapterId;
  conceptIds: CodingConceptId[];
  ageBands: AgeBand[];
  minutes: number;
  instructions: Record<AgeBand, LabInstructions>;
  files: CodeFile[];
  blocks?: CodeBlock[];
  /** Palette the block editor offers. */
  blockPalette?: string[];
  tests: TestResult[];
  /** Hint ladder — vaguest first. Revealed one at a time. */
  hints: string[];
}

export interface ProjectSnapshot {
  id: ID;
  labId: ID;
  savedAt: string;
  /** Learner- or system-written note about what changed. */
  note: string;
  origin: "manual" | "auto" | "run";
  testsPassed: number;
  testsTotal: number;
  files: CodeFile[];
}

export interface ProjectSaveState {
  labId: ID;
  status: "clean" | "unsaved" | "saving" | "error";
  lastSavedAt?: string;
}

export interface CodingPathwaySnapshot {
  ageBand: AgeBand;
  /** Concepts in teaching order with mastery and framing resolved. */
  concepts: CodingConcept[];
  /** Where the learner is standing right now. */
  currentConceptId: CodingConceptId;
  labs: CodingLab[];
  adapters: AdapterDescriptor[];
  recommendation: { labId: ID; because: string };
}
