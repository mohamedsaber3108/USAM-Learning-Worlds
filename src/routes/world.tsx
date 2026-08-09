import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { WorldMapCanvas } from "@/components/curriculum/WorldMapCanvas";
import { WorldDetailPanel } from "@/components/curriculum/WorldDetailPanel";
import { MasteryLegend } from "@/components/curriculum/mastery-ui";
import { curriculumKeys, curriculumService, worldMapService } from "@/services/curriculum";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "World Map — USAM for Kids" },
      {
        name: "description",
        content:
          "Travel a map of nine learning worlds — English, Coding, AI, Creative, Entrepreneurship, STEM, Robotics, Communication and Digital Life.",
      },
      { property: "og:title", content: "World Map — USAM for Kids" },
      {
        property: "og:description",
        content: "Regions, labs, studios and boss assessments — a learning world, not a course catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorldMapPage,
});

function WorldMapPage() {
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>("cw-english");
  const navigate = useNavigate();
  const mapQuery = useQuery({ queryKey: curriculumKeys.map, queryFn: worldMapService.map });
  const nodesQuery = useQuery({ queryKey: curriculumKeys.nodes(), queryFn: () => curriculumService.nodes() });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Worlds"
        title="The learning world map"
        description="Nine worlds, each with its own regions, labs, studios and a boss assessment that asks you to prove something in public. Areas open through mastery, never through time spent."
        actions={
          <Link
            to="/curriculum"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Open skill graph
          </Link>
        }
      />

      <AsyncBoundary query={mapQuery} loadingLabel="Charting the worlds">
        {(map) => {
          const selected = map.worlds.find((w) => w.id === selectedWorldId) ?? map.worlds[0];
          return (
            <div className="space-y-6">
              <WorldMapCanvas
                worlds={map.worlds}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedWorldId}
              />
              {selected && (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <WorldDetailPanel
                    world={selected}
                    regions={map.regions.filter((r) => r.worldId === selected.id)}
                    locations={map.locations.filter((l) => l.worldId === selected.id)}
                    nodes={(nodesQuery.data ?? []).filter((n) => n.worldId === selected.id)}
                    onOpenNode={(nodeId) => {
                      void navigate({ to: "/curriculum", search: { skill: nodeId, world: selected.id } });
                    }}
                  />
                  <MasteryLegend />
                </div>
              )}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
