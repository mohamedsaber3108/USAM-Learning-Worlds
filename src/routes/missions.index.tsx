import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { MissionCard } from "@/components/learning/Cards";
import { curriculumService, missionService, queryKeys } from "@/services";

export const Route = createFileRoute("/missions/")({
  head: () => ({
    meta: [
      { title: "Missions — USAM for Kids" },
      {
        name: "description",
        content:
          "Story-driven missions that carry real learning objectives, activities, practice and assessment.",
      },
      { property: "og:title", content: "Missions — USAM for Kids" },
      {
        property: "og:description",
        content: "Every mission maps to explicit learning objectives and mastery evidence.",
      },
    ],
  }),
  component: MissionsPage,
});

function MissionsPage() {
  const missionsQuery = useQuery({ queryKey: queryKeys.missions(), queryFn: () => missionService.list() });
  const domainsQuery = useQuery({ queryKey: queryKeys.domains, queryFn: curriculumService.listDomains });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Missions"
        title="Your active missions"
        description="World → mission → objective → activity → practice → project → assessment → mastery."
      />
      <AsyncBoundary query={missionsQuery} loadingLabel="Loading missions">
        {(missions) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {missions.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                domainName={domainsQuery.data?.find((d) => d.id === m.domainId)?.shortName ?? "Learning"}
              />
            ))}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
