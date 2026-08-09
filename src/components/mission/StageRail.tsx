import { Check, Circle, Dot } from "lucide-react";
import { useExperience } from "@/state/experience";
import type { MissionStage, MissionStageKind } from "@/types/mission";
import { cn } from "@/lib/utils";

/** Short labels for the compact (12–14) rail. */
const SHORT_LABEL: Record<MissionStageKind, string> = {
  "story-setup": "Story",
  objective: "Goal",
  "prior-knowledge": "You already",
  concept: "Idea",
  "guided-exploration": "Together",
  practice: "Practice",
  challenge: "Challenge",
  creation: "Make",
  reflection: "Look back",
  assessment: "Show it",
  "mastery-decision": "Decision",
  reward: "Earned",
  "next-recommendation": "Next",
};

/**
 * The mission arc, always visible. A child can see how far the adventure runs
 * and what each part is for — the pedagogy is never hidden behind a story.
 */
export function StageRail({
  stages,
  activeIndex,
  completed,
  onSelect,
}: {
  stages: MissionStage[];
  activeIndex: number;
  completed: Set<MissionStageKind>;
  onSelect: (index: number) => void;
}) {
  const { adaptation } = useExperience();
  const compact = adaptation.band === "12-14";

  return (
    <nav aria-label="Mission arc" className="surface-panel p-3">
      <ol className={cn("flex gap-2 overflow-x-auto pb-1", compact ? "text-xs" : "text-sm")}>
        {stages.map((stage, index) => {
          const isDone = completed.has(stage.kind);
          const isActive = index === activeIndex;
          const reachable = index <= activeIndex || isDone;
          return (
            <li key={stage.kind} className="shrink-0">
              <button
                type="button"
                onClick={() => reachable && onSelect(index)}
                disabled={!reachable}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
                  compact ? "py-1" : "py-2",
                  isActive
                    ? "border-primary bg-primary/15 text-primary"
                    : isDone
                      ? "border-secondary/40 bg-secondary/10 text-secondary"
                      : "border-border text-muted-foreground",
                  !reachable && "opacity-50",
                )}
              >
                {isDone ? (
                  <Check className="size-3.5" aria-hidden />
                ) : isActive ? (
                  <Dot className="size-4" aria-hidden />
                ) : (
                  <Circle className="size-3" aria-hidden />
                )}
                <span className="whitespace-nowrap font-medium">
                  {compact ? SHORT_LABEL[stage.kind] : stage.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
