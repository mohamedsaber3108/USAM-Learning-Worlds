import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { LabCard } from "@/components/venture/SimulationRunner";
import { ventureKeys, ventureService } from "@/services/venture";
import { SIM_CURRENCY } from "@/data/venture";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/venture/")({
  head: () => ({
    meta: [
      { title: "Entrepreneurship World — USAM for Kids" },
      {
        name: "description",
        content:
          "Ten labs and a decision-driven business simulation: cash, customers, reputation, quality, team, market, time and risk — all in fictional Sim Coins.",
      },
      { property: "og:title", content: "Entrepreneurship World — USAM for Kids" },
      {
        property: "og:description",
        content: "Make a decision, watch eight numbers move, then explain why you chose it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VentureHub,
});

function VentureHub() {
  const { ageBand } = useExperience();
  const query = useQuery({ queryKey: ventureKeys.overview(ageBand), queryFn: ventureService.overview });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Entrepreneurship World"
        title="Every choice costs something"
        description="Ten labs, one simulation. You decide, the world moves, and eight numbers tell you what the decision really cost."
      />

      <AsyncBoundary query={query} loadingLabel="Opening the labs">
        {(overview) => (
          <div className="space-y-10">
            <section className="surface-panel space-y-3 p-5">
              <SectionHeading
                title="What the simulation tracks"
                hint="Eight coupled metrics. Push one up and something else usually moves down."
              />
              <ul className="flex flex-wrap gap-2">
                {overview.metrics.map((metric) => (
                  <li
                    key={metric.id}
                    className="whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {metric.label}
                  </li>
                ))}
              </ul>
              <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Coins className="size-4 shrink-0" aria-hidden />
                Money in this world is Sim Coins ({SIM_CURRENCY}) — a fictional currency. Nothing here
                touches real money, ever.
              </p>
            </section>

            <section className="space-y-3">
              <SectionHeading title="The labs" hint="Nine simulations and one stage." />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {overview.labs.map((lab) => (
                  <LabCard key={lab.id} lab={lab} ageBand={ageBand} />
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <SectionHeading title="Skills this world builds" hint="Named, so progress isn't guesswork." />
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {overview.skills.map((skill) => (
                  <div key={skill.id} className="surface-panel p-4">
                    <p className="font-medium">{skill.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{skill.meaning}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
