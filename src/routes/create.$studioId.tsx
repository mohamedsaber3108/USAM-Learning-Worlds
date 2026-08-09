import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { Button } from "@/components/ui/button";
import { CreationCard, CreationFlowRail } from "@/components/studio/StudioCards";
import { CreationWorkspace } from "@/components/studio/CreationWorkspace";
import { studioKeys, studioService } from "@/services/studio";
import { useExperience } from "@/state/experience";
import type { Creation } from "@/types/studio";

export const Route = createFileRoute("/create/$studioId")({
  validateSearch: (search: Record<string, unknown>) => ({
    creation: typeof search["creation"] === "string" ? (search["creation"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Studio — USAM for Kids" },
      {
        name: "description",
        content:
          "Work through idea, explore, plan, create, iterate, feedback, improve, publish and portfolio — with AI as a thinking partner, not the author.",
      },
      { property: "og:title", content: "Studio — USAM for Kids" },
      {
        property: "og:description",
        content: "A workspace where the making stays yours and every version is recorded.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { studioId } = Route.useParams();
  const { creation: creationParam } = Route.useSearch();
  const { ageBand } = useExperience();
  const [openId, setOpenId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: studioKeys.studio(studioId),
    queryFn: () => studioService.studio(studioId),
  });

  if (query.isSuccess && query.data === null) throw notFound();

  return (
    <div className="space-y-8">
      <Link
        to="/create"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All studios
      </Link>

      <AsyncBoundary query={query} loadingLabel="Opening the studio">
        {({ studio, creations, stages }) => {
          const activeId = openId ?? creationParam ?? null;
          const active: Creation | undefined =
            creations.find((c) => c.id === activeId) ?? undefined;

          return (
            <div className="space-y-8">
              <PageHeader
                eyebrow={studio.name}
                title={studio.tagline}
                description={studio.purpose}
              />

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="surface-panel p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    What you make here
                  </h2>
                  <p className="mt-1 text-sm">{studio.medium.artifact}</p>
                </div>
                <div className="surface-panel p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your workspace
                  </h2>
                  <p className="mt-1 text-sm">{studio.medium.surface[ageBand]}</p>
                </div>
                <div className="surface-panel p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Craft you build
                  </h2>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {studio.craftSkills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {active ? (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
                    <ArrowLeft className="size-4" aria-hidden /> Back to this studio's work
                  </Button>
                  <CreationWorkspace
                    key={active.id}
                    studio={studio}
                    creation={active}
                    stages={stages}
                    ageBand={ageBand}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="surface-panel space-y-3 p-5">
                    <SectionHeading
                      title="The flow in this studio"
                      hint="Same nine stages everywhere — only the medium changes."
                    />
                    <CreationFlowRail stages={stages} current="idea" />
                  </section>

                  <section className="space-y-4">
                    <SectionHeading
                      title="Your work here"
                      hint="Open a piece to keep going, or start something new."
                      action={
                        <Button
                          size="sm"
                          onClick={() => setOpenId(creations[0]?.id ?? null)}
                          disabled={creations.length === 0}
                        >
                          <Plus className="size-4" aria-hidden /> New creation
                        </Button>
                      }
                    />
                    {creations.length === 0 ? (
                      <div className="surface-panel space-y-3 p-6">
                        <p className="text-sm text-muted-foreground">
                          Nothing here yet. Start from one of these, then bend it until it's yours:
                        </p>
                        <ul className="space-y-2">
                          {studio.seeds[ageBand].map((seed) => (
                            <li key={seed} className="rounded-xl bg-surface-raised/60 p-3 text-sm">
                              {seed}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {creations.map((creation) => (
                          <li key={creation.id}>
                            <button
                              type="button"
                              className="w-full text-start"
                              onClick={() => setOpenId(creation.id)}
                            >
                              <CreationCard
                                creation={creation}
                                studioName={studio.name}
                                stages={stages}
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              )}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
