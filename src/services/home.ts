/**
 * Home world repository.
 *
 * Composes the living-home snapshot from the same mock sources the rest of
 * the app uses. A backend implementation swaps only this file's bodies: the
 * home screen consumes `HomeSnapshot` and nothing else.
 */
import * as mock from "@/data/mock";
import {
  ATMOSPHERES,
  DAILY_PATH,
  DISCOVERIES,
  GREETINGS,
  MISSION_STEPS,
  MOMENTS,
  PROGRESS_PULSE,
  QUICK_PROMPTS,
  SKILL_MAP,
} from "@/data/home";
import type {
  CastRef,
  HomeMoment,
  HomeRepository,
  HomeSnapshot,
  HomeStateRequest,
  NextActivity,
  TimeOfDay,
} from "@/types/home";
import type { CharacterExpression } from "@/design/character";

const LATENCY = 260;

function respond<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), LATENCY));
}

function cast(): Record<string, CastRef> {
  return Object.fromEntries(
    mock.characters.map((c) => [
      c.id,
      { id: c.id, name: c.name, role: c.role, accentColor: c.accentColor },
    ]),
  );
}

const MOMENT_EXPRESSION: Record<string, CharacterExpression> = {
  "new-mission": "excited",
  "mission-completed": "celebrating",
  "achievement-unlocked": "celebrating",
  "character-waiting": "thinking",
  "new-project": "excited",
  "returning-learner": "encouraging",
  "streak-milestone": "celebrating",
  "new-world-unlocked": "excited",
  calm: "idle",
};

const NEXT_ACTIVITY: Record<TimeOfDay, NextActivity> = {
  morning: {
    id: "na-morning",
    title: "Describe the bay out loud to Lina",
    kind: "Spoken practice",
    minutes: 6,
    because: "Your speaking is warmest early, and this mission step is waiting on your voice.",
    action: { label: "Start talking", to: "/english" },
  },
  afternoon: {
    id: "na-afternoon",
    title: "Build the conveyor loop in the Forge",
    kind: "Making",
    minutes: 12,
    because: "You proved sequencing yesterday — looping is the next honest step, not a harder version.",
    action: { label: "Open the Forge", to: "/code" },
  },
  evening: {
    id: "na-evening",
    title: "Say what changed in your thinking today",
    kind: "Reflection",
    minutes: 4,
    because: "Short reflection at night is what makes tomorrow's recall easier.",
    action: { label: "Reflect with Azouz", to: "/progress" },
  },
};

function momentsFor(request: HomeStateRequest): HomeMoment[] {
  if (request.moment === "calm") return [];
  return [MOMENTS[request.moment]];
}

function suggestionsFor(request: HomeStateRequest) {
  const base = [
    {
      label: "Finish the lighthouse broadcast",
      because: "It's one step from done and you already know the words.",
    },
    {
      label: "Try a loop puzzle in the Forge",
      because: "Koda opened it after your sequencing run.",
    },
  ];
  if (request.moment === "returning-learner")
    return [
      { label: "Warm up with something easy", because: "It's been a few days — recall first, new things after." },
      ...base.slice(0, 1),
    ];
  if (request.timeOfDay === "evening")
    return [
      { label: "Do a 4-minute reflection", because: "Short and thoughtful suits a tired brain." },
      { label: "Read back your Bay Radio draft", because: "You wrote it this week and haven't reread it." },
    ];
  return base;
}

export const homeRepository: HomeRepository = {
  async getSnapshot(request: HomeStateRequest): Promise<HomeSnapshot> {
    const azouz = mock.characters.find((c) => c.id === "ch-azouz")!;
    const mission = mock.missions.find((m) => m.id === "m-1")!;
    const completed = request.moment === "mission-completed";

    const snapshot: HomeSnapshot = {
      atmosphere: ATMOSPHERES[request.timeOfDay],
      cast: cast(),
      companion: {
        characterId: azouz.id,
        name: azouz.name,
        role: "Learning companion",
        accentColor: azouz.accentColor,
        mood: completed ? "celebrating" : "curious",
        expression: MOMENT_EXPRESSION[request.moment] ?? "idle",
        greeting: GREETINGS[request.timeOfDay],
        quickPrompts: QUICK_PROMPTS,
        contextualSuggestions: suggestionsFor(request),
      },
      moments: momentsFor(request),
      mission: {
        missionId: mission.id,
        title: mission.title,
        premise: mission.premise,
        worldName: "Signal Bay",
        guideCharacterId: "ch-lina",
        progress: completed ? 1 : mission.progress,
        minutesLeft: completed ? 0 : 9,
        steps: completed
          ? MISSION_STEPS.map((s) => ({ ...s, state: "complete" as const }))
          : MISSION_STEPS,
      },
      nextActivity: NEXT_ACTIVITY[request.timeOfDay],
      dailyPath: DAILY_PATH,
      progress: PROGRESS_PULSE[request.timeOfDay],
      skills: SKILL_MAP,
      creations: mock.portfolio,
      discoveries: DISCOVERIES,
      achievements: mock.achievements.slice(0, 3),
    };

    return respond(snapshot);
  },
};

export const homeService = homeRepository;

export const homeQueryKeys = {
  snapshot: (request: HomeStateRequest) =>
    ["home", "snapshot", request.timeOfDay, request.moment] as const,
};
