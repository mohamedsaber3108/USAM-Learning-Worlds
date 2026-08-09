import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { CurriculumGraph } from "@/components/curriculum/CurriculumGraph";
import { SkillNodeDetail } from "@/components/curriculum/SkillNodeDetail";
import { MasteryLegend, PATH_META, PathBadge } from "@/components/curriculum/mastery-ui";
import { curriculumKeys, curriculumService, worldMapService } from "@/services/curriculum";
import type { PathStatus } from "@/types/curriculum";
import { cn } from "@/lib/utils";

interface CurriculumSearch {
  world?: string | undefined;
  skill?: string | undefined;
}

export const Route = createFileRoute("/curriculum")({
  validateSearch: (search: Record<string, unknown>): CurriculumSearch => ({
    world: typeof search["world"] === "string" ? (search["world"] as string) : undefined,
    skill: typeof search["skill"] === "string" ? (search["skill"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Skill Graph — USAM for Kids" },
      {
        name: "description",
        content:
          "A prerequisite graph of skills with objectives, practice, projects, assessment evidence, mastery states and spaced review.",
      },
      { property: "og:title", content: "Skill Graph — USAM for Kids" },
      {
        property: "og:description",
        content: "See what depends on what, where mastery actually sits, and how the same objective changes with age.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CurriculumPage,
});

const PATH_ORDER: PathStatus[] = [
  "recommended-next",
  "needs-review",
  "available",
  "optional-challenge",
  "advanced-challenge",
  "locked",
];

function CurriculumPage() {
  const { world, skill } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const mapQuery = useQuery({ queryKey: curriculumKeys.map, queryFn: worldMapService.map });
  const nodesQuery = useQuery({ queryKey: curriculumKeys.nodes(), queryFn: () => curriculumService.nodes() });

  const setSearch = (next: CurriculumSearch) =>
    navigate({ search: (prev: CurriculumSearch) => ({ ...prev, ...next }), replace: true });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Curriculum graph"
        title="What depends on what"
        description="Skills are nodes, prerequisites are edges. Progress is a mastery state backed by evidence — never a lesson marked as watched."
      />

      <AsyncBoundary query={nodesQuery} loadingLabel="Loading the skill graph">
        {(allNodes) => {
          const worlds = mapQuery.data?.worlds ?? [];
          const filtered = world ? allNodes.filter((n) => n.worldId === world) : allNodes;
          const selected = allNodes.find((n) => n.id === skill) ?? filtered[0] ?? null;

          const counts = PATH_ORDER.map((status) => ({
            status,
            count: filtered.filter((n) => n.pathStatus === status).length,
          }));

          return (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={!world} onClick={() => setSearch({ world: undefined })}>
                  All worlds
                </FilterChip>
                {worlds.map((w) => (
                  <FilterChip key={w.id} active={world === w.id} onClick={() => setSearch({ world: w.id })}>
                    {w.name}
                  </FilterChip>
                ))}
              </div>

              <section className="surface-panel p-5">
                <h2 className="font-display text-lg font-semibold">Your adaptive path right now</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {counts.map(({ status, count }) => (
                    <li key={status} className="rounded-xl border border-border/60 p-3">
                      <PathBadge status={status} />
                      <p className="mt-2 text-sm font-semibold">{count} skills</p>
                      <p className="text-xs text-muted-foreground">{PATH_META[status].meaning}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <CurriculumGraph
                nodes={filtered}
                selectedId={selected?.id ?? null}
                onSelect={(id) => setSearch({ skill: id })}
              />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                {selected ? (
                  <SkillNodeDetail
                    node={selected}
                    allNodes={allNodes}
                    onSelect={(id) => setSearch({ skill: id })}
                  />
                ) : (
                  <p className="surface-panel p-5 text-sm text-muted-foreground">
                    No skills in this world yet — pick another world to explore.
                  </p>
                )}
                <MasteryLegend />
              </div>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border/70 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
