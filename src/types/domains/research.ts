/**
 * Phase 20: Research Skills Domain
 *
 * Teaching information literacy, research methods, critical evaluation, and academic inquiry
 */

import type { ID, ISODate, AgeBand, MasteryState } from "@/types/domain";

/* -------------------------------- Research Skills -------------------------------- */

export type ResearchSkill =
  | "questioning"
  | "information-seeking"
  | "source-evaluation"
  | "note-taking"
  | "organization"
  | "analysis"
  | "synthesis"
  | "citation"
  | "presentation"
  | "critical-thinking";

export interface ResearchSkillNode {
  id: ID;
  skill: ResearchSkill;
  name: string;
  description: string;
  ageBands: AgeBand[];
  mastery: MasteryState;
  prerequisites: ID[];
}

/* -------------------------------- Research Project ------------------------------- */

export interface ResearchProject {
  id: ID;
  title: string;
  question: string;
  topic: string;
  phase: ResearchPhase;
  progress: number;
  steps: ResearchStep[];
  sources: Source[];
  notes: Note[];
  outline: Outline;
  ageBand: AgeBand;
}

export type ResearchPhase =
  | "questioning"
  | "planning"
  | "gathering"
  | "evaluating"
  | "organizing"
  | "analyzing"
  | "synthesizing"
  | "presenting";

export interface ResearchStep {
  id: ID;
  phase: ResearchPhase;
  title: string;
  description: string;
  completed: boolean;
  feedback?: string;
}

/* -------------------------------- Information Sources ---------------------------- */

export interface Source {
  id: ID;
  type: SourceType;
  title: string;
  author?: string;
  date?: ISODate;
  url?: string;
  credibility: CredibilityScore;
  notes: string;
  citations: string[];
  relevance: number; // 0-1
}

export type SourceType =
  | "book"
  | "article"
  | "website"
  | "video"
  | "interview"
  | "experiment"
  | "observation"
  | "dataset";

export interface CredibilityScore {
  overall: number; // 0-1
  factors: {
    authorExpertise: number;
    sourceSafety: number; // Age-appropriate
    accuracy: number;
    bias: number; // Lower is better
    currency: number; // Up-to-date
  };
  reasoning: string;
}

/* -------------------------------- Note-Taking ------------------------------------ */

export interface Note {
  id: ID;
  sourceId?: ID;
  content: string;
  type: NoteType;
  tags: string[];
  createdAt: ISODate;
  highlighted: boolean;
}

export type NoteType = "fact" | "quote" | "idea" | "question" | "observation" | "summary";

export interface Outline {
  id: ID;
  sections: OutlineSection[];
}

export interface OutlineSection {
  id: ID;
  level: number; // 1, 2, 3 for heading levels
  title: string;
  notes: ID[]; // Note IDs
  subsections: OutlineSection[];
}

/* -------------------------------- Research Activities ---------------------------- */

export type ResearchActivityType =
  | "question-formulation"
  | "source-hunt"
  | "fact-check"
  | "note-practice"
  | "citation-game"
  | "bias-detection"
  | "synthesis-challenge";

export interface ResearchActivity {
  id: ID;
  type: ResearchActivityType;
  title: string;
  skill: ResearchSkill;
  scenario: string;
  objectives: string[];
  ageBands: AgeBand[];
}

/* -------------------------------- Source Evaluation ------------------------------ */

export interface SourceEvaluationActivity {
  id: ID;
  title: string;
  scenario: string;
  sources: EvaluationSource[];
  questions: EvaluationQuestion[];
}

export interface EvaluationSource {
  id: ID;
  content: string;
  metadata: {
    type: SourceType;
    author?: string;
    date?: ISODate;
    publisher?: string;
  };
  credible: boolean; // Correct answer
  issues?: string[]; // What's wrong with it
}

export interface EvaluationQuestion {
  id: ID;
  sourceId: ID;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

/* -------------------------------- Citation Practice ------------------------------ */

export interface CitationPractice {
  id: ID;
  title: string;
  style: CitationStyle;
  sources: Source[];
  challenges: CitationChallenge[];
}

export type CitationStyle = "simple" | "basic" | "standard"; // Age-appropriate

export interface CitationChallenge {
  id: ID;
  sourceId: ID;
  prompt: string;
  correctCitation: string;
  commonMistakes: string[];
}

/* -------------------------------- Research World --------------------------------- */

export interface ResearchWorld {
  id: "research-lab";
  name: string;
  description: string;
  mascot: "Omar"; // Research mentor
  regions: ResearchRegion[];
}

export type ResearchRegion =
  | "question-quarter"
  | "library-district"
  | "evaluation-center"
  | "synthesis-studio"
  | "presentation-hall";

/* -------------------------------- Age Adaptations -------------------------------- */

export const RESEARCH_AGE_ADAPTATION = {
  "8-9": {
    focus: ["questioning", "information-seeking", "note-taking"],
    sources: ["books", "videos", "safe-websites"],
    activities: ["question-formulation", "source-hunt", "note-practice"],
    skills: [
      "Ask good questions",
      "Find information in books",
      "Take simple notes",
      "Tell fact from opinion",
    ],
  },
  "10-11": {
    focus: ["source-evaluation", "organization", "analysis", "citation"],
    sources: ["articles", "websites", "interviews", "observations"],
    activities: ["source-hunt", "fact-check", "note-practice", "citation-game"],
    skills: [
      "Evaluate source credibility",
      "Organize research notes",
      "Compare sources",
      "Basic citation",
    ],
  },
  "12-14": {
    focus: ["critical-thinking", "synthesis", "presentation", "advanced-evaluation"],
    sources: ["all types", "datasets", "experiments"],
    activities: ["bias-detection", "synthesis-challenge", "citation-game"],
    skills: [
      "Detect bias",
      "Synthesize information",
      "Proper citation",
      "Present findings",
    ],
  },
} as const;

/* -------------------------------- Service Interface ------------------------------ */

export interface ResearchService {
  // Projects
  createProject(topic: string, question: string): Promise<ResearchProject>;
  getProject(id: ID): Promise<ResearchProject | null>;
  updateProject(id: ID, updates: Partial<ResearchProject>): Promise<void>;
  completeStep(projectId: ID, stepId: ID): Promise<void>;

  // Sources
  addSource(projectId: ID, source: Omit<Source, "id">): Promise<Source>;
  evaluateSource(sourceId: ID): Promise<CredibilityScore>;
  removeSource(projectId: ID, sourceId: ID): Promise<void>;

  // Notes
  addNote(projectId: ID, note: Omit<Note, "id">): Promise<Note>;
  organizeNotes(projectId: ID, outline: Outline): Promise<void>;

  // Activities
  listActivities(skill?: ResearchSkill): Promise<ResearchActivity[]>;
  getActivity(id: ID): Promise<ResearchActivity | null>;

  // Source evaluation practice
  startEvaluation(activityId: ID): Promise<SourceEvaluationActivity>;
  submitEvaluation(activityId: ID, answers: Record<ID, number>): Promise<{
    correct: number;
    total: number;
    feedback: string[];
  }>;

  // Citation practice
  startCitationPractice(style: CitationStyle): Promise<CitationPractice>;
  checkCitation(practiceId: ID, challengeId: ID, citation: string): Promise<{
    correct: boolean;
    feedback: string;
  }>;
}

/**
 * CRITICAL: Research Skills Principles
 *
 * ✅ Age-appropriate sources
 * ✅ Safe websites only
 * ✅ Credible information
 * ✅ Critical thinking
 * ✅ Academic integrity
 * ✅ Proper attribution
 * ✅ No plagiarism
 * ✅ Ethical research
 *
 * Teaching how to find, evaluate, and use information responsibly.
 */
