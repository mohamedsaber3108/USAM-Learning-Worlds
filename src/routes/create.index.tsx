import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Code2, FlaskConical, FolderKanban, ArrowRight } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import {
  AuthorshipLedger,
  CreationCard,
  CreationFlowRail,
  StudioCard,
} from "@/components/studio/StudioCards";
import { studioKeys, studioService } from "@/services/studio";
import { useExperience } from "@/state/experience";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import type { FileRouteTypes } from "@/routeTree.gen";

export const Route = createFileRoute("/create/")({
  head: () => ({
    meta: [
      { title: "Creative Studio — USAM for Kids" },
      {
        name: "description",
        content:
          "Nine studios — art, story, animation, game, design, music, video, presentation and writing — with a nine-stage flow from idea to portfolio artifact.",
      },
      { property: "og:title", content: "Creative Studio — USAM for Kids" },
      {
        property: "og:description",
        content:
          "Move from consuming to creating. AI brainstorms, explains and critiques — it never makes the thing for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

const OTHER_MAKING_PLACES: {
  to: FileRouteTypes["to"];
  label: string;
  line: string;
  icon: typeof Code2;
}[] = [
  { to: "/code", label: "Code Lab", line: "Blocks or a real editor, depending on your layer.", icon: Code2 },
  { to: "/simulations", label: "Simulation Bench", line: "Change one variable and watch what happens.", icon: FlaskConical },
  { to: "/projects", label: "Project Briefs", line: "Longer builds that become portfolio evidence.", icon: FolderKanban },
];

function CreatePage() {
  const { p } = useAgePresentation();
  const { ageBand } = useExperience();
  const overviewQuery = useQuery({
    queryKey: studioKeys.overview(ageBand),
    queryFn: studioService.overview,
  });

  return (
    <div className={p.sectionGapClass}>
      <PageHeader
        eyebrow="Creative Studio"
        title="Make something that didn't exist this morning"
        description="Nine studios, one flow. Every finished piece can become a portfolio artifact you're able to explain — which is why the making stays yours."
      />

      <AsyncBoundary query={overviewQuery} loadingLabel="Opening the studios">
        {(overview) => (
          <div className="space-y-10">
            <section className="surface-panel space-y-3 p-5">
              <SectionHeading
                title="How a creation moves"
                hint="Three stages of thinking before you make anything, and three of judgement after."
              />
              <CreationFlowRail stages={overview.stages} current="create" />
              <p className="text-sm text-muted-foreground">
                Azouz can brainstorm, explain, suggest, critique and help you debug. He will not
                produce the work — a piece you didn't make is a piece you can't defend.
              </p>
            </section>

            <section className="space-y-4">
              <SectionHeading title="The studios" hint="Pick the medium; the flow is the same in all nine." />
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {overview.studios.map((studio) => (
                  <li key={studio.id}>
                    <StudioCard studio={studio} ageBand={ageBand} />
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
              <section className="space-y-4">
                <SectionHeading title="What you're working on" hint="Unfinished work is not failed work." />
                <ul className="grid gap-4 sm:grid-cols-2">
                  {overview.recent.map((creation) => (
                    <li key={creation.id}>
                      <CreationCard
                        creation={creation}
                        studioName={
                          overview.studios.find((s) => s.id === creation.studioId)?.name ?? "Studio"
                        }
                        stages={overview.stages}
                      />
                    </li>
                  ))}
                </ul>
              </section>
              <div className="space-y-4">
                <AuthorshipLedger
                  ownMoves={overview.authorship.ownMoves}
                  assistedMoves={overview.authorship.assistedMoves}
                />
                <section className="space-y-3">
                  <h2 className="font-display text-base font-semibold">Other places you build</h2>
                  {OTHER_MAKING_PLACES.map((place) => (
                    <Link
                      key={place.to}
                      to={place.to}
                      className="surface-panel interactive group flex items-center gap-3 p-4"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary/15 text-secondary">
                        <place.icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{place.label}</span>
                        <span className="block text-xs text-muted-foreground">{place.line}</span>
                      </span>
                      <ArrowRight
                        className="ms-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  ))}
                </section>
              </div>
            </div>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
