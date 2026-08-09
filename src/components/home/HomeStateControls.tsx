import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";
import { MOMENT_OPTIONS, TIME_OF_DAY } from "@/data/home";
import type { HomeMomentKind, HomeStateRequest, TimeOfDay } from "@/types/home";

/**
 * Mock-state controls.
 *
 * A design affordance, not a child feature: it lets the whole home world be
 * inspected in every state a backend will eventually produce. When live state
 * arrives, this component is deleted and nothing else changes.
 */
export function HomeStateControls({
  request,
  onChange,
}: {
  request: HomeStateRequest;
  onChange: (next: HomeStateRequest) => void;
}) {
  const { p } = useAgePresentation();
  if (!p.showSecondaryMeta) return null;
  return (
    <section
      aria-label="Preview home world state"
      className="surface-panel flex flex-wrap items-center gap-2 p-3 text-xs"
    >
      <span className="text-muted-foreground">Preview state:</span>
      <div className="flex gap-1" role="group" aria-label="Time of day">
        {TIME_OF_DAY.map((t: TimeOfDay) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ ...request, timeOfDay: t })}
            aria-pressed={request.timeOfDay === t}
            className={cn(
              "min-h-9 rounded-lg px-3 capitalize",
              request.timeOfDay === t
                ? "bg-primary/15 text-primary"
                : "bg-surface-raised text-muted-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <label className="ms-auto flex items-center gap-2">
        <span className="text-muted-foreground">Moment</span>
        <select
          value={request.moment}
          onChange={(e) =>
            onChange({ ...request, moment: e.target.value as HomeMomentKind | "calm" })
          }
          className="min-h-9 rounded-lg border border-border bg-surface-raised px-2"
        >
          {MOMENT_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
