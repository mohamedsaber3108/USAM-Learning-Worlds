import { Clock, Gauge, Target } from "lucide-react";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { MASTERY_META } from "@/components/curriculum/mastery-ui";
import { Progress } from "@/components/ui/progress";
import { useExperience } from "@/state/experience";
import type { Character } from "@/types/domain";
import type { MissionRun } from "@/types/mission";
import { cn } from "@/lib/utils";

const DIFFICULTY_META: Record<MissionRun["difficulty"], { label: string; meaning: string }> = {
  gentle: { label: "Gentle", meaning: "You'll mostly recognise this." },
  steady: { label: "Steady", meaning: "Comfortable, with one part that isn't." },
  stretch: { label: "Stretch", meaning: "You should expect to get stuck once." },
  expedition: { label: "Expedition", meaning: "Long. Bring patience, not speed." },
};

/** The briefing: story, character, objectives, cost in time and effort, skills. */
export function MissionBriefing({
  run,
  guide,
  progress,
}: {
  run: MissionRun;
  guide?: Character;
  progress: number;
}) {
  const { adaptation, ageBand } = useExperience();
  const difficulty = DIFFICULTY_META[run.difficulty];

  return (
    <section className="surface-panel overflow-hidden">
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {run.storyContext}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight">{run.title}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{run.storySetup}</p>

          <ul className="space-y-2 border-s-2 border-primary/40 ps-4">
            {run.objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-2 text-sm">
                <Target className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{o.statement}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> about {run.estimatedMinutes} minutes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="size-3.5" aria-hidden /> {difficulty.label} — {difficulty.meaning}
            </span>
            {!run.ageBands.includes(ageBand) && (
              <span>Adapted for your layer ({adaptation.label})</span>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          {guide && (
            <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <CharacterAvatar character={guide} mood="focused" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{guide.name}</p>
                <p className="text-xs text-muted-foreground">{guide.toneByAgeBand[ageBand]}</p>
              </div>
            </div>
          )}

          <div className="space-y-2 rounded-xl bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Skills in play
            </p>
            {run.skills.map((s) => {
              const meta = MASTERY_META[s.entryState];
              return (
                <div key={s.skillId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span
                    className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.tone)}
                  >
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 rounded-xl bg-surface p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mission progress</span>
              <span className="font-semibold">{Math.round(progress * 100)}%</span>
            </div>
            <Progress value={progress * 100} aria-label="Mission progress" />
            <p className="text-[11px] text-muted-foreground">
              Progress tracks stages passed, not time spent.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
