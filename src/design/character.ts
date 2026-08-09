import type { MotionPreset } from "@/design/tokens";

/**
 * Character visual language.
 *
 * Characters are recurring personalities, not mascots: the same identity must
 * be recognisable across avatar, bust and full-body presentations, and must be
 * able to *express* what the AI is doing (listening, thinking, celebrating).
 *
 * Expressions are declared as data so future hand-drawn or rigged assets can
 * be dropped in per (characterId, expression) without touching components.
 */

export type CharacterExpression =
  | "idle"
  | "speaking"
  | "listening"
  | "thinking"
  | "excited"
  | "confused"
  | "encouraging"
  | "celebrating"
  | "concerned";

export type CharacterPresentation = "avatar" | "bust" | "full-body";

export interface ExpressionSpec {
  id: CharacterExpression;
  label: string;
  /** What this state means to the learner — used for a11y descriptions. */
  meaning: string;
  /** Semantic colour role for the aura ring. */
  aura: "primary" | "secondary" | "accent" | "success" | "warning" | "muted";
  motion: MotionPreset;
  /** Eye rendering: drives the procedural face and future asset selection. */
  eyes: "open" | "wide" | "soft" | "squint" | "half" | "arc";
  /** Mouth rendering. */
  mouth: "smile" | "open" | "flat" | "small" | "grin" | "wave";
  /** Whether the state should show live activity dots / bars. */
  activity: "none" | "dots" | "waveform" | "sparkles";
  /** True when this state means "the AI is currently occupied". */
  live: boolean;
}

export const CHARACTER_EXPRESSIONS: Record<CharacterExpression, ExpressionSpec> = {
  idle: {
    id: "idle",
    label: "Idle",
    meaning: "Present and available, waiting for you",
    aura: "muted",
    motion: "breathe",
    eyes: "open",
    mouth: "smile",
    activity: "none",
    live: false,
  },
  speaking: {
    id: "speaking",
    label: "Speaking",
    meaning: "Talking to you right now",
    aura: "primary",
    motion: "float",
    eyes: "open",
    mouth: "open",
    activity: "waveform",
    live: true,
  },
  listening: {
    id: "listening",
    label: "Listening",
    meaning: "Your microphone is open and being heard",
    aura: "secondary",
    motion: "breathe",
    eyes: "wide",
    mouth: "small",
    activity: "waveform",
    live: true,
  },
  thinking: {
    id: "thinking",
    label: "Thinking",
    meaning: "Working out a response — nothing is wrong",
    aura: "secondary",
    motion: "think",
    eyes: "half",
    mouth: "flat",
    activity: "dots",
    live: true,
  },
  excited: {
    id: "excited",
    label: "Excited",
    meaning: "Something interesting just happened",
    aura: "accent",
    motion: "celebrate",
    eyes: "wide",
    mouth: "grin",
    activity: "sparkles",
    live: false,
  },
  confused: {
    id: "confused",
    label: "Confused",
    meaning: "Did not understand — asking you to try again",
    aura: "warning",
    motion: "confused",
    eyes: "squint",
    mouth: "wave",
    activity: "none",
    live: false,
  },
  encouraging: {
    id: "encouraging",
    label: "Encouraging",
    meaning: "Nudging you to keep going after a hard step",
    aura: "primary",
    motion: "idle",
    eyes: "arc",
    mouth: "smile",
    activity: "none",
    live: false,
  },
  celebrating: {
    id: "celebrating",
    label: "Celebrating",
    meaning: "You reached mastery or finished a mission",
    aura: "success",
    motion: "celebrate",
    eyes: "arc",
    mouth: "grin",
    activity: "sparkles",
    live: false,
  },
  concerned: {
    id: "concerned",
    label: "Concerned",
    meaning: "Checking in — struggle, fatigue or a safety signal",
    aura: "warning",
    motion: "breathe",
    eyes: "soft",
    mouth: "flat",
    activity: "none",
    live: false,
  },
};

export const EXPRESSION_ORDER: CharacterExpression[] = [
  "idle",
  "speaking",
  "listening",
  "thinking",
  "excited",
  "confused",
  "encouraging",
  "celebrating",
  "concerned",
];

/** Voice states map onto expressions so voice UI and character stay in sync. */
export const VOICE_TO_EXPRESSION: Record<string, CharacterExpression> = {
  idle: "idle",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
  paused: "idle",
  error: "confused",
  muted: "idle",
  interrupted: "listening",
};

/** Moods coming from the domain model map onto the same expression set. */
export const MOOD_TO_EXPRESSION: Record<string, CharacterExpression> = {
  neutral: "idle",
  encouraging: "encouraging",
  curious: "thinking",
  celebrating: "celebrating",
  focused: "idle",
  concerned: "concerned",
  explaining: "speaking",
};

export const AURA_CLASS: Record<ExpressionSpec["aura"], string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  muted: "bg-muted-foreground",
};

export const AURA_TEXT: Record<ExpressionSpec["aura"], string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  muted: "text-muted-foreground",
};
