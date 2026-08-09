/**
 * English learning world.
 *
 * English is treated as a full curriculum with fourteen strands, not a bag of
 * vocabulary games. Every venue below teaches named strands, produces
 * evidence, and reports mastery in the same language the rest of the platform
 * uses. Age adaptation changes framing and demand — never the strand itself.
 */
import type { MasteryState } from "@/types/curriculum";
import type { AgeBand, ID } from "@/types/domain";

/* --------------------------------- strands -------------------------------- */

export type EnglishStrandId =
  | "listening"
  | "speaking"
  | "reading"
  | "writing"
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "conversation"
  | "comprehension"
  | "storytelling"
  | "presentation"
  | "functional"
  | "communication"
  | "confidence";

/** How much weight a strand carries at a given age. Nothing ever disappears. */
export type StrandEmphasis = "core" | "supporting" | "stretch";

export interface EnglishStrand {
  id: EnglishStrandId;
  label: string;
  /** What the strand actually is, in plain words. */
  description: string;
  /** Why a child should care — used in the UI, not decoration. */
  whyItMatters: string;
  mastery: MasteryState;
  /** Self-reported comfort, kept separate from demonstrated mastery. */
  confidence: number;
  evidenceCount: number;
  emphasis: Record<AgeBand, StrandEmphasis>;
  venueIds: EnglishVenueId[];
}

/* --------------------------------- venues --------------------------------- */

export type EnglishVenueId =
  | "conversation-rooms"
  | "story-missions"
  | "listening-lab"
  | "speaking-studio"
  | "reading-library"
  | "writing-studio"
  | "vocabulary-garden"
  | "grammar-workshop"
  | "roleplay-theater"
  | "presentation-stage";

export interface VenueAgeFraming {
  title: string;
  description: string;
  /** Two or three things this age actually does here. */
  focus: string[];
}

export interface EnglishVenue {
  id: EnglishVenueId;
  name: string;
  tagline: string;
  /** lucide icon name, resolved by the UI. */
  glyph: string;
  accent: "primary" | "secondary" | "accent" | "success";
  /** Where it sits on the English world map (percentages). */
  position: { x: number; y: number };
  strandIds: EnglishStrandId[];
  /** Mentor who runs this place. */
  characterId: ID;
  ageFraming: Record<AgeBand, VenueAgeFraming>;
  openFor: AgeBand[];
}

/* -------------------------------- sessions -------------------------------- */

export type EnglishSessionKind =
  | "listen"
  | "speak"
  | "read"
  | "write"
  | "vocabulary"
  | "grammar"
  | "roleplay"
  | "present"
  | "converse";

export interface RubricCriterion {
  id: ID;
  label: string;
  /** What "met" looks like, written for the learner. */
  lookFor: string;
}

interface SessionBase {
  id: ID;
  venueId: EnglishVenueId;
  title: string;
  /** One sentence of why this exists. */
  purpose: string;
  strandIds: EnglishStrandId[];
  ageBands: AgeBand[];
  minutes: number;
  rubric: RubricCriterion[];
}

export interface ComprehensionQuestion {
  id: ID;
  prompt: string;
  options?: string[];
  /** Index into options, or omitted for open response. */
  answerIndex?: number;
  /** What the question is really testing. */
  tests: string;
}

export interface ListenSession extends SessionBase {
  kind: "listen";
  /** Stand-in for streamed audio; the transcript is the mock source of truth. */
  audioLabel: string;
  seconds: number;
  transcript: string;
  listenFor: string[];
  questions: ComprehensionQuestion[];
}

export interface SpeakSession extends SessionBase {
  kind: "speak";
  prompt: string;
  modelAnswer: string;
  /** Sounds or stress patterns this attempt is watching. */
  targetSounds: string[];
  sentenceStarters: string[];
}

export interface ReadSession extends SessionBase {
  kind: "read";
  level: string;
  paragraphs: string[];
  glossary: { word: string; meaning: string }[];
  questions: ComprehensionQuestion[];
}

export interface WriteSession extends SessionBase {
  kind: "write";
  brief: string;
  audience: string;
  wordTarget: number;
  frames: string[];
  revisionPrompts: string[];
}

export interface VocabularyWord {
  id: ID;
  word: string;
  meaning: string;
  inContext: string;
  /** Garden metaphor for spaced recall: seed → sprout → leafing → rooted. */
  stage: "seed" | "sprout" | "leafing" | "rooted";
  lastSeenDays: number;
}

export interface VocabularySession extends SessionBase {
  kind: "vocabulary";
  theme: string;
  words: VocabularyWord[];
}

export interface GrammarSession extends SessionBase {
  kind: "grammar";
  pattern: string;
  /** The rule is shown after the effect, never before. */
  rule: string;
  contrasts: { before: string; after: string; why: string }[];
  practice: ComprehensionQuestion[];
}

export interface RoleplayTurn {
  id: ID;
  speaker: "learner" | "character";
  line: string;
  /** For learner turns: what a good reply does. */
  goal?: string;
}

export interface RoleplaySession extends SessionBase {
  kind: "roleplay";
  scenario: string;
  setting: string;
  learnerRole: string;
  characterRole: string;
  usefulPhrases: string[];
  turns: RoleplayTurn[];
}

export interface PresentSession extends SessionBase {
  kind: "present";
  brief: string;
  audience: string;
  sections: { id: ID; label: string; guidance: string; seconds: number }[];
  deliveryChecklist: string[];
}

export interface ConverseSession extends SessionBase {
  kind: "converse";
  roomTopic: string;
  openers: string[];
  turnGoals: string[];
  /** Conversation rooms are never open-ended chat — they end somewhere. */
  closingTask: string;
}

export type EnglishSession =
  | ListenSession
  | SpeakSession
  | ReadSession
  | WriteSession
  | VocabularySession
  | GrammarSession
  | RoleplaySession
  | PresentSession
  | ConverseSession;

/* ------------------------- speaking attempt loop --------------------------- */

export type SpeakingPhase =
  | "idle"
  | "listening-to-model"
  | "recording"
  | "transcribing"
  | "feedback";

export interface SpeakingFeedback {
  transcript: string;
  /** One strength and one fix. Never a score out of ten. */
  strength: string;
  fix: string;
  criteriaMet: ID[];
  criteriaMissed: ID[];
  pronunciationNotes: { sound: string; note: string }[];
  wordsSpoken: number;
  /** Whether this attempt counts as evidence toward a strand. */
  countsAsEvidence: boolean;
}

export interface SpeakingAttempt {
  id: ID;
  sessionId: ID;
  attemptNumber: number;
  feedback: SpeakingFeedback;
}

/* ---------------------------- cross-world English -------------------------- */

/**
 * English is not a separate course. This records where it shows up inside the
 * other worlds, so the UI can prove it rather than claim it.
 */
export interface EnglishElsewhere {
  id: ID;
  worldId: ID;
  worldName: string;
  glyph: string;
  /** The non-English activity the learner is actually doing. */
  activity: string;
  /** The English demand hidden inside it. */
  englishDemand: string;
  strandIds: EnglishStrandId[];
}

export interface EnglishWorldSnapshot {
  strands: EnglishStrand[];
  venues: EnglishVenue[];
  elsewhere: EnglishElsewhere[];
  /** Suggested next place, with an honest reason. */
  recommendation: { venueId: EnglishVenueId; because: string };
}
