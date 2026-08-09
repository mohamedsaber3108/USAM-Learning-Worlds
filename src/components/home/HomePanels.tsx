import { Link } from "@tanstack/react-router";
import { Award, Compass, Sparkles, Timer } from "lucide-react";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { MissionTrack, ProgressRing, SkillConstellation } from "@/components/viz/Progress";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { Achievement, PortfolioItem } from "@/types/domain";
import type {
  CastRef,
  Discovery,
  HomeMissionFocus,
  HomeProgressPulse,
  NextActivity,
} from "@/types/home";
import type { SkillNode } from "@/components/viz/Progress";

/** The mission the learner is inside right now, told as a place with a guide. */
export function MissionFocusPanel({
  mission,
  cast,
}: {
  mission: HomeMissionFocus;
  cast: Record<string, CastRef>;
}) {
  const { p, fit } = useAgePresentation();
  const guide = cast[mission.guideCharacterId];
  return (
    <section className="surface-panel space-y-4 p-4 sm:p-5" aria-label="Current mission">
      <div className="flex items-start gap-4">
        <CharacterPortrait
          character={{
            id: mission.guideCharacterId,
            name: guide?.name ?? "Guide",
            accentColor: guide?.accentColor ?? "var(--color-secondary)",
          }}
          presentation="avatar"
          expression="encouraging"
          size={56}
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {mission.worldName} · with {guide?.name ?? "your guide"}
          </p>
          <h2 className="font-display text-heading font-semibold">{mission.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{fit(mission.premise)}</p>
        </div>
        <ProgressRing
          value={mission.progress}
          size={p.mode === "explorer" ? 88 : 72}
          label="Mission"
          {...(p.showSecondaryMeta ? { caption: `${mission.minutesLeft} min left` } : {})}
        />
      </div>
      {p.hierarchyDepth > 1 && <MissionTrack steps={mission.steps} title={mission.title} />}
      <Link
        to="/missions/$missionId"
        params={{ missionId: mission.missionId }}
        className="interactive inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
      >
        Continue the mission
      </Link>
    </section>
  );
}

/** The single next step, with the reason it was chosen always attached. */
export function NextActivityPanel({ activity }: { activity: NextActivity }) {
  const { fit } = useAgePresentation();
  return (
    <section className="surface-panel space-y-3 p-4 sm:p-5" aria-label="Next recommended activity">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden /> Next, if you want it
      </p>
      <h2 className="font-display text-heading font-semibold">{activity.title}</h2>
      <p className="text-sm text-muted-foreground">{fit(activity.because)}</p>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Timer className="size-3.5" aria-hidden /> {activity.kind} · {activity.minutes} min
      </p>
      <Link
        to={activity.action.to}
        params={activity.action.params as never}
        className="interactive inline-flex min-h-11 items-center rounded-xl border border-border bg-surface-raised px-4 text-sm font-semibold"
      >
        {activity.action.label}
      </Link>
    </section>
  );
}

/** Rhythm, not debt: streaks are described, never used as leverage. */
export function ProgressPulsePanel({ pulse }: { pulse: HomeProgressPulse }) {
  const { p } = useAgePresentation();
  return (
    <section className="surface-panel space-y-3 p-4 sm:p-5" aria-label="Progress">
      <h2 className="font-display text-heading font-semibold">Where you are</h2>
      <div className="flex items-center gap-4">
        <ProgressRing
          value={pulse.minutesToday / pulse.minutesGoal}
          size={80}
          label="Today"
          tone="secondary"
          {...(p.showSecondaryMeta ? { caption: `${pulse.minutesToday} min` } : {})}
        />
        <div className="min-w-0 text-sm">
          <p className="font-medium">{pulse.competenciesGrowing} competencies growing</p>
          {p.showStreaks && (
            <p className="mt-1 text-muted-foreground">{pulse.streakNote}</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function SkillsPanel({ skills }: { skills: SkillNode[] }) {
  return (
    <div className="[&_figure]:h-full">
      <SkillConstellation nodes={skills} title="Your skill map" />
    </div>
  );
}

export function CreationsPanel({ creations }: { creations: PortfolioItem[] }) {
  const { p, fit } = useAgePresentation();
  return (
    <section className="surface-panel space-y-3 p-4 sm:p-5" aria-label="Recent creations">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h2 className="font-display text-heading font-semibold">Things you made</h2>
        <Link to="/portfolio" className="text-xs font-medium text-primary hover:underline">
          Portfolio
        </Link>
      </div>
      <ul className="space-y-2">
        {creations.slice(0, p.mode === "explorer" ? 2 : 3).map((item) => (
          <li key={item.id} className="rounded-xl border border-border bg-surface-raised p-3">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">{fit(item.summary)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DiscoveriesPanel({ discoveries }: { discoveries: Discovery[] }) {
  const { p, fit } = useAgePresentation();
  return (
    <section className="surface-panel space-y-3 p-4 sm:p-5" aria-label="Discoveries">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h2 className="font-display text-heading font-semibold">Discoveries</h2>
        <Link to="/achievements" className="text-xs font-medium text-primary hover:underline">
          All
        </Link>
      </div>
      <ul className="space-y-2">
        {discoveries.slice(0, p.mode === "explorer" ? 2 : 3).map((d) => (
          <li key={d.id} className="flex gap-3">
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary"
              aria-hidden
            >
              <Compass className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{d.title}</span>
              <span className="block text-xs text-muted-foreground">{fit(d.note)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AchievementsPanel({ achievements }: { achievements: Achievement[] }) {
  const { p, fit } = useAgePresentation();
  return (
    <section className="surface-panel space-y-3 p-4 sm:p-5" aria-label="Achievements">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h2 className="font-display text-heading font-semibold">Earned with evidence</h2>
        <Link to="/achievements" className="text-xs font-medium text-primary hover:underline">
          All
        </Link>
      </div>
      <ul className={cn("space-y-2", p.cardDensity === "compact" && "space-y-1.5")}>
        {achievements.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning"
              aria-hidden
            >
              <Award className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{a.title}</span>
              <span className="block text-xs text-muted-foreground">{fit(a.evidence)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
