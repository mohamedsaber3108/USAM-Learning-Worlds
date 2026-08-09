import type { AgeBand, DevelopmentalStage } from "@/types/domain";

export const AGE_BANDS: AgeBand[] = ["8-9", "10-11", "12-14"];

export interface AgeAdaptation {
  band: AgeBand;
  label: string;
  stage: DevelopmentalStage;
  /** Rules the UI reads instead of branching on age numbers everywhere. */
  textDensity: "minimal" | "moderate" | "full";
  voiceFirst: boolean;
  cardsPerRow: 1 | 2 | 3;
  showAdvancedTools: boolean;
  narrativeWeight: "high" | "medium" | "low";
  codingSurface: "visual-blocks" | "blocks-and-script" | "code-editor";
  headingScale: string;
  summary: string;
}

export const AGE_ADAPTATIONS: Record<AgeBand, AgeAdaptation> = {
  "8-9": {
    band: "8-9",
    label: "Explorer",
    stage: "explorer",
    textDensity: "minimal",
    voiceFirst: true,
    cardsPerRow: 2,
    showAdvancedTools: false,
    narrativeWeight: "high",
    codingSurface: "visual-blocks",
    headingScale: "text-3xl sm:text-4xl",
    summary: "Story-led, voice-friendly, short activities with big visual interactions.",
  },
  "10-11": {
    band: "10-11",
    label: "Creator",
    stage: "builder",
    textDensity: "moderate",
    voiceFirst: true,
    cardsPerRow: 2,
    showAdvancedTools: false,
    narrativeWeight: "medium",
    codingSurface: "blocks-and-script",
    headingScale: "text-3xl sm:text-5xl",
    summary: "Structured missions, block coding, conversation practice and real projects.",
  },
  "12-14": {
    band: "12-14",
    label: "Pathfinder",
    stage: "creator",
    textDensity: "full",
    voiceFirst: false,
    cardsPerRow: 3,
    showAdvancedTools: true,
    narrativeWeight: "low",
    codingSurface: "code-editor",
    headingScale: "text-4xl sm:text-5xl",
    summary: "Autonomous pathways, code environments, AI tools, ventures and portfolio work.",
  },
};

export function bandForAge(age: number): AgeBand {
  if (age <= 9) return "8-9";
  if (age <= 11) return "10-11";
  return "12-14";
}

export function adaptationFor(band: AgeBand): AgeAdaptation {
  return AGE_ADAPTATIONS[band];
}
