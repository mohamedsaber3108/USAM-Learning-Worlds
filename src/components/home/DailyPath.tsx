import { Link } from "@tanstack/react-router";
import { Check, Circle, Dot } from "lucide-react";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import type { DailyPathStep } from "@/types/home";

/**
 * The day as a walkable path.
 *
 * Deliberately short and finishable: the point is a coherent learning shape
 * for today, not a queue that grows when the learner rests.
 */
const KIND_LABEL: Record<DailyPathStep["kind"], string> = {
  "warm-up": "Warm up",
  learn: "Learn",
  create: "Create",
  practice: "Practice",
  reflect: "Reflect",
};

export function DailyPath({ steps }: { steps: DailyPathStep[] }) {
  const { p } = useAgePresentation();
  const done = steps.filter((s) => s.state === "done").length;
  const minutes = steps.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <section className="surface-panel p-4 sm:p-5" aria-label="Today's learning path">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h2 className="font-display text-heading font-semibold">Today's path</h2>
        <p className="text-xs text-muted-foreground">
          {done}/{steps.length} done · about {minutes} min
        </p>
      </div>
      <ol className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              to={step.to}
              className={cn(
                "interactive flex min-h-14 items-center gap-3 rounded-xl border px-3 py-2",
                step.state === "current"
                  ? "border-primary/60 bg-primary/10"
                  : "border-border bg-surface-raised",
                step.state === "done" && "opacity-70",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full",
                  step.state === "done"
                    ? "bg-success/20 text-success"
                    : step.state === "current"
                      ? "bg-primary/20 text-primary"
                      : "bg-surface text-muted-foreground",
                )}
                aria-hidden
              >
                {step.state === "done" ? (
                  <Check className="size-4" />
                ) : step.state === "current" ? (
                  <Dot className="size-6" />
                ) : (
                  <Circle className="size-3.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{step.title}</span>
                {p.showSecondaryMeta && (
                  <span className="block text-xs text-muted-foreground">
                    {KIND_LABEL[step.kind]} · {step.minutes} min
                  </span>
                )}
              </span>
              <span className="sr-only">{step.state}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
