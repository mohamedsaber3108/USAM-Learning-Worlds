/**
 * Living home world model.
 *
 * The home screen is an environment, not a dashboard: it has a time of day,
 * a place, a companion who is present, and moments that just happened. Every
 * field below is something a future backend can compute per learner — the UI
 * never decides what is true, only how it looks.
 */
import type { FileRouteTypes } from "@/routeTree.gen";
import type { Achievement, CharacterMood, ID, ISODate, PortfolioItem } from "@/types/domain";
import type { CharacterExpression } from "@/design/character";
import type { Biome } from "@/components/world/WorldIllustration";
import type { SkillNode } from "@/components/viz/Progress";
import type { MissionStep } from "@/components/viz/Progress";

export type AppRoute = FileRouteTypes["to"];

export type TimeOfDay = "morning" | "afternoon" | "evening";

/** Things that can have just happened when the learner arrives. */
export type HomeMomentKind =
  | "new-mission"
  | "mission-completed"
  | "achievement-unlocked"
  | "character-waiting"
  | "new-project"
  | "returning-learner"
  | "streak-milestone"
  | "new-world-unlocked";

export interface HomeMoment {
  id: ID;
  kind: HomeMomentKind;
  /** Who is delivering this moment — moments arrive through characters. */
  characterId: ID;
  title: string;
  body: string;
  action: { label: string; to: AppRoute; params?: Record<string, string> } | null;
  /** Learning evidence behind the moment; celebrations never float free. */
  evidence: string | null;
}

export interface HomeAtmosphere {
  timeOfDay: TimeOfDay;
  /** Human name of the place the learner is standing in. */
  placeName: string;
  placeLine: string;
  biome: Biome;
  accent: string;
  /** Sky wash blended behind the whole home surface. */
  skyFrom: string;
  skyTo: string;
  weatherLine: string;
}

export interface CompanionPresence {
  characterId: ID;
  name: string;
  role: string;
  accentColor: string;
  mood: CharacterMood;
  expression: CharacterExpression;
  /** What the companion says on arrival, before any learner input. */
  greeting: string;
  /** Fixed, always-available intents. */
  quickPrompts: string[];
  /** Suggestions computed from the learner's current state. */
  contextualSuggestions: { label: string; because: string }[];
}

export interface HomeMissionFocus {
  missionId: ID;
  title: string;
  premise: string;
  worldName: string;
  guideCharacterId: ID;
  progress: number;
  minutesLeft: number;
  steps: MissionStep[];
}

export interface NextActivity {
  id: ID;
  title: string;
  kind: string;
  minutes: number;
  /** Why this, right now — always shown to the learner. */
  because: string;
  action: { label: string; to: AppRoute; params?: Record<string, string> };
}

export interface DailyPathStep {
  id: ID;
  title: string;
  kind: "warm-up" | "learn" | "create" | "practice" | "reflect";
  minutes: number;
  state: "done" | "current" | "upcoming";
  to: AppRoute;
}

export interface Discovery {
  id: ID;
  title: string;
  note: string;
  foundAt: ISODate;
  worldName: string;
  /** Discoveries are unlocked by understanding, not by wandering. */
  unlockedBy: string;
}

export interface HomeProgressPulse {
  minutesToday: number;
  minutesGoal: number;
  competenciesGrowing: number;
  /** Streaks exist, but they are shown as rhythm, never as debt. */
  streakDays: number;
  streakNote: string;
}

/** Minimal cast card, so any surface can render "who said this" without a second fetch. */
export interface CastRef {
  id: ID;
  name: string;
  role: string;
  accentColor: string;
}

export interface HomeSnapshot {
  atmosphere: HomeAtmosphere;
  companion: CompanionPresence;
  cast: Record<ID, CastRef>;
  moments: HomeMoment[];
  mission: HomeMissionFocus | null;
  nextActivity: NextActivity | null;
  dailyPath: DailyPathStep[];
  progress: HomeProgressPulse;
  skills: SkillNode[];
  creations: PortfolioItem[];
  discoveries: Discovery[];
  achievements: Achievement[];
}

/** The mock-state selector the home screen can be driven by. */
export interface HomeStateRequest {
  timeOfDay: TimeOfDay;
  moment: HomeMomentKind | "calm";
}

export interface HomeRepository {
  getSnapshot(request: HomeStateRequest): Promise<HomeSnapshot>;
}
