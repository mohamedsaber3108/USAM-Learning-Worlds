import { Lock, Sword } from "lucide-react";
import type { CurriculumNode, CurriculumWorld, WorldLocation, WorldRegion } from "@/types/curriculum";
import { MasteryBadge, PathBadge } from "@/components/curriculum/mastery-ui";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<WorldLocation["kind"], string> = {
  region: "Region",
  building: "Building",
  lab: "Lab",
  studio: "Studio",
  arena: "Boss assessment",
  landmark: "Landmark",
  workshop: "Workshop",
};

/** What lives inside a world: regions, then the places you actually work in. */
export function WorldDetailPanel({
  world,
  regions,
  locations,
  nodes,
  onOpenNode,
}: {
  world: CurriculumWorld;
  regions: WorldRegion[];
  locations: WorldLocation[];
  nodes: CurriculumNode[];
  onOpenNode: (nodeId: string) => void;
}) {
  return (
    <section className="space-y-5">
      <header className="surface-panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{world.tagline}</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{world.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{world.description}</p>
        {!world.unlocked && world.unlockHint && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <Lock className="size-3.5" aria-hidden /> {world.unlockHint}
          </p>
        )}
      </header>

      {regions.map((region) => (
        <article key={region.id} className="surface-panel p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold">{region.name}</h3>
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary">{region.theme}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{region.summary}</p>

          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {locations
              .filter((l) => l.regionId === region.id)
              .map((location) => {
                const taught = nodes.filter((n) => n.locationId === location.id);
                return (
                  <li
                    key={location.id}
                    className={cn(
                      "rounded-2xl border border-border/70 bg-card/60 p-4",
                      !location.unlocked && "opacity-80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {KIND_LABEL[location.kind]}
                        </p>
                        <h4 className="font-display text-base font-semibold">{location.name}</h4>
                      </div>
                      {location.bossAssessment && (
                        <Sword className="size-4 shrink-0 text-accent" aria-hidden />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{location.summary}</p>

                    {location.bossAssessment && (
                      <p className="mt-3 rounded-xl bg-accent/10 p-3 text-xs text-accent">
                        <span className="font-semibold">{location.bossAssessment.title}: </span>
                        {location.bossAssessment.summary}
                      </p>
                    )}

                    {!location.unlocked && location.unlockRequirement && (
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" aria-hidden /> {location.unlockRequirement}
                      </p>
                    )}

                    {taught.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {taught.map((node) => (
                          <li key={node.id}>
                            <button
                              type="button"
                              onClick={() => onOpenNode(node.id)}
                              className="w-full rounded-xl border border-border/60 p-2.5 text-start transition-colors hover:border-primary/50 hover:bg-muted/40"
                            >
                              <span className="block text-sm font-semibold">{node.name}</span>
                              <span className="mt-1.5 flex flex-wrap gap-1.5">
                                <MasteryBadge state={node.mastery.state} />
                                <PathBadge status={node.pathStatus} />
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </article>
      ))}
    </section>
  );
}
