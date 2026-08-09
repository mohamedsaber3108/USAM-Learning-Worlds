import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { SimulationPanel } from "@/components/simulation/SimulationPanel";
import { contentService, queryKeys } from "@/services";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/simulations")({
  head: () => ({
    meta: [
      { title: "Simulations & Sandboxes — NOVA Learning World" },
      {
        name: "description",
        content:
          "Hands-on simulations where learners predict, adjust variables, run tests and reflect on their model.",
      },
      { property: "og:title", content: "Simulations & Sandboxes — NOVA Learning World" },
      {
        property: "og:description",
        content: "Predict-run-reflect sandboxes across science, AI and financial literacy.",
      },
    ],
  }),
  component: SimulationsPage,
});

function SimulationsPage() {
  const { ageBand } = useExperience();
  const simulationsQuery = useQuery({
    queryKey: queryKeys.simulations,
    queryFn: contentService.listSimulations,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Simulation engine"
        title="Test your thinking, not your luck"
        description="Make a prediction, change one variable, run it, then explain what surprised you."
      />

      <AsyncBoundary
        query={simulationsQuery}
        loadingLabel="Booting the sandbox"
        emptyTitle="No simulations yet"
        emptyDescription="Sandboxes unlock as your science and AI skills grow."
      >
        {(simulations) => {
          const forAge = simulations.filter((s) => s.ageBands.includes(ageBand));
          const list = forAge.length ? forAge : simulations;
          return (
            <div className="space-y-6">
              {list.map((simulation) => (
                <SimulationPanel key={simulation.id} simulation={simulation} />
              ))}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
