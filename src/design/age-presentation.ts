import type { AgeBand } from "@/types/domain";

/**
 * Age presentation model.
 *
 * One design system, three presentations. Components must NEVER branch on an
 * age band directly — they read a named knob from this contract. Adding a new
 * mode later means adding one entry here, not auditing the component tree.
 */

export type AgeModeId = "explorer" | "creator" | "pathfinder";

export interface AgePresentation {
  band: AgeBand;
  mode: AgeModeId;
  /** "Mode A" etc. — used in documentation and the mode switcher. */
  modeLabel: string;
  name: string;
  ages: string;
  summary: string;

  /* typography */
  titleClass: string;
  bodyClass: string;
  /** Maximum characters a body paragraph should carry before it is trimmed. */
  copyBudget: number;

  /* density & hierarchy */
  cardColumns: 1 | 2 | 3;
  cardDensity: "airy" | "balanced" | "compact";
  sectionGapClass: string;
  /** How many levels of information a surface may reveal at once. */
  hierarchyDepth: 1 | 2 | 3;
  /** Secondary metadata (timestamps, rubric detail) is hidden in mode A. */
  showSecondaryMeta: boolean;

  /* illustration & character */
  illustrationDensity: "rich" | "moderate" | "restrained";
  characterPresentation: "full-body" | "bust" | "avatar";
  characterScale: number;
  /** Younger modes get bigger, more frequent companion presence. */
  companionProminence: "hero" | "sidekick" | "ambient";

  /* motion */
  animationIntensity: "playful" | "expressive" | "subtle";
  motionMultiplier: number;

  /* colour */
  saturation: "vivid" | "balanced" | "muted";

  /* navigation & interaction */
  navComplexity: "essential" | "expanded" | "full";
  /** Max primary destinations surfaced before an overflow group is used. */
  maxPrimaryNavItems: number;
  interactionComplexity: "tap-first" | "guided" | "expert";
  voiceFirst: boolean;
  codingSurface: "visual-blocks" | "blocks-and-script" | "code-editor";

  /* gamification */
  gamificationVisibility: "prominent" | "supportive" | "minimal";
  showStreaks: boolean;
  showPoints: boolean;
}

export const AGE_PRESENTATIONS: Record<AgeBand, AgePresentation> = {
  "8-9": {
    band: "8-9",
    mode: "explorer",
    modeLabel: "Mode A",
    name: "Explorer",
    ages: "8–9",
    summary:
      "Voice-friendly, story-led and highly visual. One decision at a time, a companion who is always on screen, and progress you can see without reading.",
    titleClass: "font-display text-4xl sm:text-5xl font-bold",
    bodyClass: "text-body-lg leading-relaxed",
    copyBudget: 90,
    cardColumns: 2,
    cardDensity: "airy",
    sectionGapClass: "space-y-10",
    hierarchyDepth: 1,
    showSecondaryMeta: false,
    illustrationDensity: "rich",
    characterPresentation: "full-body",
    characterScale: 1.2,
    companionProminence: "hero",
    animationIntensity: "playful",
    motionMultiplier: 1.25,
    saturation: "vivid",
    navComplexity: "essential",
    maxPrimaryNavItems: 5,
    interactionComplexity: "tap-first",
    voiceFirst: true,
    codingSurface: "visual-blocks",
    gamificationVisibility: "prominent",
    showStreaks: true,
    showPoints: true,
  },
  "10-11": {
    band: "10-11",
    mode: "creator",
    modeLabel: "Mode B",
    name: "Creator",
    ages: "10–11",
    summary:
      "Structured missions with real making. Blocks meet script, the companion becomes a collaborator, and evidence starts to matter more than points.",
    titleClass: "font-display text-3xl sm:text-4xl font-bold",
    bodyClass: "text-base leading-relaxed",
    copyBudget: 160,
    cardColumns: 2,
    cardDensity: "balanced",
    sectionGapClass: "space-y-8",
    hierarchyDepth: 2,
    showSecondaryMeta: true,
    illustrationDensity: "moderate",
    characterPresentation: "bust",
    characterScale: 1,
    companionProminence: "sidekick",
    animationIntensity: "expressive",
    motionMultiplier: 1,
    saturation: "balanced",
    navComplexity: "expanded",
    maxPrimaryNavItems: 7,
    interactionComplexity: "guided",
    voiceFirst: true,
    codingSurface: "blocks-and-script",
    gamificationVisibility: "supportive",
    showStreaks: true,
    showPoints: true,
  },
  "12-14": {
    band: "12-14",
    mode: "pathfinder",
    modeLabel: "Mode C",
    name: "Pathfinder",
    ages: "12–14",
    summary:
      "A serious creative workspace. Dense information, real editors, mastery evidence and portfolio thinking — the companion advises rather than leads.",
    titleClass: "font-display text-3xl sm:text-4xl font-semibold tracking-tight",
    bodyClass: "text-sm sm:text-base leading-relaxed",
    copyBudget: 320,
    cardColumns: 3,
    cardDensity: "compact",
    sectionGapClass: "space-y-6",
    hierarchyDepth: 3,
    showSecondaryMeta: true,
    illustrationDensity: "restrained",
    characterPresentation: "avatar",
    characterScale: 0.85,
    companionProminence: "ambient",
    animationIntensity: "subtle",
    motionMultiplier: 0.65,
    saturation: "muted",
    navComplexity: "full",
    maxPrimaryNavItems: 9,
    interactionComplexity: "expert",
    voiceFirst: false,
    codingSurface: "code-editor",
    gamificationVisibility: "minimal",
    showStreaks: false,
    showPoints: false,
  },
};

export const AGE_MODE_ORDER: AgeBand[] = ["8-9", "10-11", "12-14"];

export function presentationFor(band: AgeBand): AgePresentation {
  return AGE_PRESENTATIONS[band];
}

/**
 * Copy variants keyed by mode. Content length is an age concern, so surfaces
 * declare all three variants and the provider picks one.
 */
export type CopyVariants = Partial<Record<AgeModeId, string>> & { default: string };

export function resolveCopy(variants: CopyVariants, mode: AgeModeId): string {
  return variants[mode] ?? variants.default;
}
