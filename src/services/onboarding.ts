/**
 * Onboarding service — mock implementation of `OnboardingRepository`.
 *
 * Drafts persist to localStorage today so a refresh mid-onboarding is not
 * punished. Swapping this for a real API means replacing the bodies only:
 * the repository contract and the query keys stay identical.
 */
import { CAST, DEFAULT_AVATAR, starterRelationship } from "@/data/onboarding";
import { bandForAge } from "@/lib/age";
import type {
  CharacterProfile,
  LearningMapNode,
  OnboardingDraft,
  OnboardingOutcome,
  OnboardingRepository,
  StarterMission,
  StarterRecommendation,
  StarterWorld,
} from "@/types/onboarding";
import type { Achievement, InteractionStyle, LearnerProfile, MotivationDriver } from "@/types/domain";

const DRAFT_KEY = "usam.onboarding.draft.v1";
const OUTCOME_KEY = "usam.onboarding.outcome.v1";
const LATENCY = 180;

function respond<T>(data: T, latency = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), latency));
}

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage is a convenience, never a requirement */
  }
}

export function emptyDraft(): OnboardingDraft {
  return {
    step: "arrival",
    age: null,
    ageBand: null,
    name: "",
    nickname: "",
    avatar: { ...DEFAULT_AVATAR },
    interests: [],
    favoriteThemes: [],
    favoriteActivities: [],
    communicationPreference: "visual",
    discovery: {},
    metCharacterIds: [],
    completedAt: null,
  };
}

/* --------------------------- outcome generation ---------------------------- */

const SUBJECT_TO_WORLD: Record<string, StarterWorld> = {
  english: {
    id: "w-signal",
    name: "Signal Bay",
    description: "A harbour city where language, sound and story move the tides.",
    biome: "reef",
    guideCharacterId: "ch-lina",
  },
  coding: {
    id: "w-forge",
    name: "The Logic Forge",
    description: "Machines here only run on well-formed thinking.",
    biome: "city",
    guideCharacterId: "ch-koda",
  },
  ai: {
    id: "w-lumen",
    name: "Lumen Orbit",
    description: "A station where models are opened up and questioned.",
    biome: "orbit",
    guideCharacterId: "ch-nova",
  },
  science: {
    id: "w-verdant",
    name: "Verdant Field Lab",
    description: "A living laboratory where every claim needs evidence.",
    biome: "forest",
    guideCharacterId: "ch-sable",
  },
};

const SUBJECT_TO_DOMAIN: Record<string, string> = {
  english: "d-english",
  coding: "d-coding",
  ai: "d-ai",
  science: "d-science",
};

const STORY_LABEL: Record<string, string> = {
  adventure: "A rescue",
  mystery: "A mystery",
  builder: "A city-building",
  discovery: "A discovery",
};

function first(values: string[] | undefined, fallback: string): string {
  return values?.[0] ?? fallback;
}

function styleFrom(input: string, learning: string): InteractionStyle {
  if (input === "voice") return "voice";
  if (learning === "hands-on") return "hands-on";
  if (learning === "reading") return "reading";
  if (learning === "voice") return "voice";
  return "visual";
}

function driversFrom(draft: OnboardingDraft): MotivationDriver[] {
  const drivers: MotivationDriver[] = ["curiosity"];
  const challenge = first(draft.discovery.challengePreference, "balanced");
  const creative = first(draft.discovery.creativeInterest, "visual");
  if (challenge === "stretch") drivers.push("mastery");
  if (creative === "games" || creative === "writing") drivers.push("creation");
  if (draft.favoriteActivities.includes("Talking it through")) drivers.push("social");
  return drivers;
}

function buildMission(subject: string, challenge: string): StarterMission {
  const titles: Record<string, string> = {
    english: "Broadcast from Signal Bay",
    coding: "Wake the Forge",
    ai: "Open the black box",
    science: "The first fair test",
  };
  const purposes: Record<string, string> = {
    english: "Say one clear idea out loud and be understood.",
    coding: "Make a sequence run exactly as you intended.",
    ai: "Explain in your own words how a model guesses.",
    science: "Change one thing at a time and record what happens.",
  };
  const intensity = challenge === "stretch" ? "Stretch" : challenge === "gentle" ? "Warm-up" : "Core";
  return {
    id: `m-start-${subject}`,
    title: titles[subject] ?? titles["coding"]!,
    purpose: purposes[subject] ?? purposes["coding"]!,
    steps: [
      { id: "s1", label: `${intensity}: meet the idea`, kind: "learn" },
      { id: "s2", label: "Try it with support", kind: "practice" },
      { id: "s3", label: "Make your own version", kind: "make" },
      { id: "s4", label: "Say what changed in your thinking", kind: "reflect" },
    ],
  };
}

function buildMap(subject: string, draft: OnboardingDraft): LearningMapNode[] {
  const familiar = {
    "d-coding": first(draft.discovery.codingFamiliarity, "new"),
    "d-english": first(draft.discovery.englishFamiliarity, "beginner"),
    "d-ai": first(draft.discovery.aiFamiliarity, "new"),
  } as Record<string, string>;

  const base: LearningMapNode[] = [
    {
      domainId: "d-english",
      label: "English",
      state: familiar["d-english"] === "beginner" ? "introduced" : "practicing",
      reason: "Based on how speaking English feels to you right now.",
    },
    {
      domainId: "d-coding",
      label: "Coding",
      state:
        familiar["d-coding"] === "new"
          ? "not-started"
          : familiar["d-coding"] === "advanced"
            ? "proficient"
            : "practicing",
      reason: "You told Koda what you've built before.",
    },
    {
      domainId: "d-ai",
      label: "AI literacy",
      state: familiar["d-ai"] === "new" ? "not-started" : "introduced",
      reason: "Starting from what you already believe AI is.",
    },
    {
      domainId: "d-creativity",
      label: "Creativity",
      state: "introduced",
      reason: `You picked ${first(draft.discovery.creativeInterest, "making things")} as your making style.`,
    },
    {
      domainId: "d-problem",
      label: "Problem solving",
      state: "introduced",
      reason: `Your first move on a puzzle: ${first(draft.discovery.problemSolving, "ask a question")}.`,
    },
  ];

  const starterDomain = SUBJECT_TO_DOMAIN[subject];
  return base.map((node) =>
    node.domainId === starterDomain
      ? { ...node, reason: `${node.reason} This is where you start.` }
      : node,
  );
}

function buildRecommendations(
  subject: string,
  draft: OnboardingDraft,
): StarterRecommendation[] {
  const input = first(draft.discovery.inputPreference, "both");
  const story = first(draft.discovery.storyPreference, "adventure");
  const recs: StarterRecommendation[] = [
    {
      id: "rec-mission",
      title: "Start your first mission",
      reason: "It matches the subject you chose today.",
      to: "/missions",
    },
    {
      id: "rec-story",
      title: `${STORY_LABEL[story] ?? "A new"} chapter with Fable`,
      reason: "You said this is the kind of story you'd step into.",
      to: "/stories",
    },
  ];
  if (input !== "text") {
    recs.push({
      id: "rec-voice",
      title: "Speak one line with Lina",
      reason: "You'd rather talk than type — so we start with your voice.",
      to: "/english",
    });
  }
  if (subject === "coding" || first(draft.discovery.codingFamiliarity, "new") !== "new") {
    recs.push({
      id: "rec-code",
      title: "Open the Code Lab",
      reason: "Sized to what you've already built.",
      to: "/code",
    });
  }
  return recs.slice(0, 4);
}

function buildOutcome(draft: OnboardingDraft): OnboardingOutcome {
  const age = draft.age ?? 10;
  const ageBand = draft.ageBand ?? bandForAge(age);
  const subject = first(draft.discovery.favoriteSubject, "coding");
  const world = SUBJECT_TO_WORLD[subject] ?? SUBJECT_TO_WORLD["coding"]!;
  const learningStyle = first(draft.discovery.learningPreference, "visual");
  const input = first(draft.discovery.inputPreference, "both");
  const createdAt = new Date().toISOString();

  const learnerProfile: LearnerProfile = {
    displayName: draft.nickname || draft.name || "Explorer",
    age,
    ageBand,
    developmentalStage: ageBand === "8-9" ? "explorer" : ageBand === "10-11" ? "builder" : "creator",
    interests: draft.interests,
    motivationDrivers: driversFrom(draft),
    preferredInteractionStyle: styleFrom(input, learningStyle),
    languages: ["en"],
    reducedMotion: false,
    audioFirst: input !== "text",
  };

  const character: CharacterProfile = {
    id: "cp-1",
    learnerId: "l-1",
    name: draft.name || "Explorer",
    nickname: draft.nickname || draft.name || "Explorer",
    avatar: draft.avatar,
    interests: draft.interests,
    favoriteThemes: draft.favoriteThemes,
    favoriteActivities: draft.favoriteActivities,
    communicationPreference: learnerProfile.preferredInteractionStyle,
    createdAt,
  };

  const achievement: Achievement = {
    id: "ach-arrival",
    title: "Arrival",
    evidence: "You described how you learn, and set your own first direction.",
    competencyId: "c-self-direction",
    earnedAt: createdAt,
  };

  const topics = draft.interests.slice(0, 3);
  const relationships = CAST.filter((c) => c.metAtOnboarding).map((c) =>
    starterRelationship(c.id, topics.length ? topics : ["Getting started"]),
  );

  return {
    learnerProfile,
    character,
    companionId: "ch-azouz",
    world,
    mission: buildMission(subject, first(draft.discovery.challengePreference, "balanced")),
    learningMap: buildMap(subject, draft),
    recommendations: buildRecommendations(subject, draft),
    achievement,
    relationships,
  };
}

/* -------------------------------- repository ------------------------------- */

export const onboardingService: OnboardingRepository = {
  async loadDraft() {
    return respond(read<OnboardingDraft>(DRAFT_KEY));
  },
  async saveDraft(draft) {
    write(DRAFT_KEY, draft);
    return respond(draft, 0);
  },
  async complete(draft) {
    const finished: OnboardingDraft = {
      ...draft,
      step: "launch",
      completedAt: new Date().toISOString(),
    };
    const outcome = buildOutcome(finished);
    write(DRAFT_KEY, finished);
    write(OUTCOME_KEY, outcome);
    return respond(outcome, 600);
  },
  async loadOutcome() {
    return respond(read<OnboardingOutcome>(OUTCOME_KEY));
  },
  async reset() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(OUTCOME_KEY);
    }
    return respond(undefined, 0);
  },
};

/** Relationship reads are separate so a real backend can page them. */
export const relationshipService = {
  async list() {
    const outcome = read<OnboardingOutcome>(OUTCOME_KEY);
    return respond(
      outcome?.relationships ??
        CAST.filter((c) => c.metAtOnboarding).map((c) => starterRelationship(c.id, ["Getting started"])),
    );
  },
};

export const onboardingKeys = {
  draft: ["onboarding", "draft"] as const,
  outcome: ["onboarding", "outcome"] as const,
  relationships: ["onboarding", "relationships"] as const,
};
