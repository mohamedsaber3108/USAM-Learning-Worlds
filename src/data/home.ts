/**
 * Mock content for the living home world.
 *
 * Everything here is authored per state so the home screen can be seen in
 * every condition it will meet in production — morning through evening, calm
 * arrival through streak milestone — before a backend exists.
 */
import type {
  DailyPathStep,
  Discovery,
  HomeAtmosphere,
  HomeMoment,
  HomeMomentKind,
  HomeProgressPulse,
  TimeOfDay,
} from "@/types/home";
import type { SkillNode } from "@/components/viz/Progress";
import type { MissionStep } from "@/components/viz/Progress";

export const TIME_OF_DAY: TimeOfDay[] = ["morning", "afternoon", "evening"];

export const MOMENT_OPTIONS: { id: HomeMomentKind | "calm"; label: string }[] = [
  { id: "calm", label: "Calm arrival" },
  { id: "returning-learner", label: "Returning learner" },
  { id: "new-mission", label: "New mission" },
  { id: "mission-completed", label: "Mission completed" },
  { id: "achievement-unlocked", label: "Achievement unlocked" },
  { id: "character-waiting", label: "Character waiting" },
  { id: "new-project", label: "New project" },
  { id: "streak-milestone", label: "Streak milestone" },
  { id: "new-world-unlocked", label: "New world unlocked" },
];

export const ATMOSPHERES: Record<TimeOfDay, HomeAtmosphere> = {
  morning: {
    timeOfDay: "morning",
    placeName: "Signal Bay",
    placeLine: "The harbour is waking up and the lighthouse is still blinking.",
    biome: "isles",
    accent: "var(--color-secondary)",
    skyFrom: "color-mix(in oklab, var(--color-secondary) 26%, transparent)",
    skyTo: "color-mix(in oklab, var(--color-warning) 14%, transparent)",
    weatherLine: "Clear and cool · a good hour for talking out loud",
  },
  afternoon: {
    timeOfDay: "afternoon",
    placeName: "Signal Bay",
    placeLine: "Full daylight over the workshops. Everything is open.",
    biome: "city",
    accent: "var(--color-primary)",
    skyFrom: "color-mix(in oklab, var(--color-primary) 24%, transparent)",
    skyTo: "color-mix(in oklab, var(--color-accent) 16%, transparent)",
    weatherLine: "Bright and busy · a good hour for building",
  },
  evening: {
    timeOfDay: "evening",
    placeName: "Signal Bay",
    placeLine: "Lamps on along the pier. The bay has gone quiet.",
    biome: "orbit",
    accent: "var(--color-accent)",
    skyFrom: "color-mix(in oklab, var(--color-accent) 26%, transparent)",
    skyTo: "color-mix(in oklab, var(--color-primary) 12%, transparent)",
    weatherLine: "Low light · a good hour for thinking back",
  },
};

export const GREETINGS: Record<TimeOfDay, string> = {
  morning: "Morning. The bay is quiet, so your voice will carry. Want to start by talking?",
  afternoon: "You're back at the good hour — the workshops are open and nothing is waiting on you.",
  evening: "Evening. Short and thoughtful beats long and tired. One idea is plenty tonight.",
};

/** Always-available intents. These never change with state — they are the child's own voice. */
export const QUICK_PROMPTS = [
  "Help me with this.",
  "What should I do next?",
  "I want to build something.",
  "I want to practice English.",
  "I want a challenge.",
];

export const MOMENTS: Record<HomeMomentKind, HomeMoment> = {
  "new-mission": {
    id: "mo-new-mission",
    kind: "new-mission",
    characterId: "ch-koda",
    title: "Koda opened the conveyor floor",
    body: "A new mission is standing open in the Logic Forge: make a loop do the boring part for you.",
    action: { label: "Look at the mission", to: "/missions/$missionId", params: { missionId: "m-3" } },
    evidence: "Unlocked because you sequenced 9 steps without hints.",
  },
  "mission-completed": {
    id: "mo-mission-complete",
    kind: "mission-completed",
    characterId: "ch-lina",
    title: "The Lighthouse Broadcast is finished",
    body: "You described the bay clearly enough that a stranger could picture it. Lina kept the recording.",
    action: { label: "See what you proved", to: "/progress" },
    evidence: "5+ precise adjectives across 3 unscripted turns.",
  },
  "achievement-unlocked": {
    id: "mo-achievement",
    kind: "achievement-unlocked",
    characterId: "ch-azouz",
    title: "New achievement: Precise Describer",
    body: "Not for time spent — for making a listener see something they had never seen.",
    action: { label: "Open achievements", to: "/achievements" },
    evidence: "Earned from real conversation, not a quiz score.",
  },
  "character-waiting": {
    id: "mo-waiting",
    kind: "character-waiting",
    characterId: "ch-mira",
    title: "Mira is waiting at the studio",
    body: "She read your Bay Radio draft and has one question about the opening line.",
    action: { label: "Go and hear it", to: "/characters" },
    evidence: null,
  },
  "new-project": {
    id: "mo-new-project",
    kind: "new-project",
    characterId: "ch-nova",
    title: "A project brief just arrived",
    body: "Build a classifier that can tell your hobbies apart. Nova will review it when you're ready.",
    action: { label: "Read the brief", to: "/create" },
    evidence: "Suggested because your AI literacy is moving fastest.",
  },
  "returning-learner": {
    id: "mo-returning",
    kind: "returning-learner",
    characterId: "ch-azouz",
    title: "It's been six days — nothing was lost",
    body: "Your work is exactly where you left it. We'll warm up with something you already know.",
    action: { label: "Warm up first", to: "/practice" },
    evidence: null,
  },
  "streak-milestone": {
    id: "mo-streak",
    kind: "streak-milestone",
    characterId: "ch-azouz",
    title: "Ten days of showing up",
    body: "Worth noticing, not worth protecting. If you miss tomorrow, this stays true.",
    action: { label: "See your rhythm", to: "/progress" },
    evidence: "Rhythm, not reward — the streak unlocks nothing.",
  },
  "new-world-unlocked": {
    id: "mo-world",
    kind: "new-world-unlocked",
    characterId: "ch-atlas",
    title: "The Logic Forge opened its gates",
    body: "Atlas cleared the road east. A whole region of machines and puzzles is reachable now.",
    action: { label: "Travel there", to: "/world" },
    evidence: "Opened by proving loops and conditions, twice.",
  },
};

export const MISSION_STEPS: MissionStep[] = [
  { id: "s1", title: "Arrive at the lighthouse", state: "complete", kind: "learn" },
  { id: "s2", title: "Describe the bay to Lina", state: "current", kind: "practice" },
  { id: "s3", title: "Record the broadcast", state: "locked", kind: "build" },
  { id: "s4", title: "Which words made it clearer?", state: "locked", kind: "reflect" },
];

export const SKILL_MAP: SkillNode[] = [
  { id: "sk-speak", name: "Spoken fluency", level: 3, x: 40, y: 42 },
  { id: "sk-describe", name: "Describing", level: 4, x: 96, y: 24, requires: ["sk-speak"] },
  { id: "sk-reason", name: "Reasoning", level: 2, x: 104, y: 96, requires: ["sk-speak"] },
  { id: "sk-loops", name: "Loops", level: 3, x: 164, y: 62, requires: ["sk-reason"] },
  { id: "sk-model", name: "Modelling", level: 1, x: 210, y: 100, requires: ["sk-loops"] },
];

export const DISCOVERIES: Discovery[] = [
  {
    id: "dis-1",
    title: "The Whispering Buoy",
    note: "Sound travels further over water — that's why the harbour warnings are heard, not seen.",
    foundAt: "2026-08-07T09:10:00Z",
    worldName: "Signal Bay",
    unlockedBy: "You explained why the buoy is louder at night.",
  },
  {
    id: "dis-2",
    title: "A loop hidden in a song",
    note: "The chorus is a loop with a counter. Koda showed you the pattern in a lullaby.",
    foundAt: "2026-08-05T16:40:00Z",
    worldName: "The Logic Forge",
    unlockedBy: "You spotted the repeat before Koda named it.",
  },
  {
    id: "dis-3",
    title: "Machines guess, they don't know",
    note: "A classifier answered confidently and was wrong. That was the lesson.",
    foundAt: "2026-08-02T11:05:00Z",
    worldName: "Model Coast",
    unlockedBy: "You broke a model on purpose and explained how.",
  },
];

export const DAILY_PATH: DailyPathStep[] = [
  { id: "dp-1", title: "Warm up your voice", kind: "warm-up", minutes: 3, state: "done", to: "/english" },
  { id: "dp-2", title: "Finish the lighthouse broadcast", kind: "learn", minutes: 9, state: "current", to: "/missions" },
  { id: "dp-3", title: "Build one loop in the Forge", kind: "create", minutes: 8, state: "upcoming", to: "/code" },
  { id: "dp-4", title: "Retrieve: loops & conditions", kind: "practice", minutes: 5, state: "upcoming", to: "/practice" },
  { id: "dp-5", title: "Say what changed in your thinking", kind: "reflect", minutes: 2, state: "upcoming", to: "/progress" },
];

export const PROGRESS_PULSE: Record<TimeOfDay, HomeProgressPulse> = {
  morning: {
    minutesToday: 3,
    minutesGoal: 25,
    competenciesGrowing: 4,
    streakDays: 9,
    streakNote: "Nine days of showing up. Missing one changes nothing you've learned.",
  },
  afternoon: {
    minutesToday: 14,
    minutesGoal: 25,
    competenciesGrowing: 5,
    streakDays: 9,
    streakNote: "You're mid-rhythm today. Stop whenever thinking gets tired.",
  },
  evening: {
    minutesToday: 22,
    minutesGoal: 25,
    competenciesGrowing: 5,
    streakDays: 10,
    streakNote: "Ten days. It's a note in your story, not a score to defend.",
  },
};
