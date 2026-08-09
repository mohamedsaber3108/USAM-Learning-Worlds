import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary, EmptyState } from "@/components/state/AsyncStates";
import { MasteryBadge } from "@/components/learning/Mastery";
import { MissionCard } from "@/components/learning/Cards";
import { curriculumService, masteryService, missionService, queryKeys } from "@/services";
import { competencies as allCompetencies, objectives as allObjectives } from "@/data/mock";

export const Route = createFileRoute("/learn/$domainId")({
  head: () => ({
    meta: [
      { title: "Domain skill tree — USAM for Kids" },
      {
        name: "description",
        content: "Skills, competencies, learning objectives and mastery evidence for this domain.",
      },
      { property: "og:title", content: "Domain skill tree — USAM for Kids" },
      {
        property: "og:description",
        content: "See exactly which competencies are mastered, practising or due for review.",
      },
    ],
  }),
  component: DomainPage,
});

function DomainPage() {
  const { domainId } = Route.useParams();
  const domainQuery = useQuery({
    queryKey: queryKeys.domain(domainId),
    queryFn: () => curriculumService.getDomain(domainId),
  });
  const skillsQuery = useQuery({
    queryKey: queryKeys.skills(domainId),
    queryFn: () => curriculumService.listSkills(domainId),
  });
  const masteryQuery = useQuery({ queryKey: queryKeys.mastery, queryFn: masteryService.list });
  const missionsQuery = useQuery({
    queryKey: queryKeys.missions({ domainId }),
    queryFn: () => missionService.list({ domainId }),
  });

  return (
    <div className="space-y-8">
      <Link
        to="/learn"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden /> All domains
      </Link>

      <AsyncBoundary query={domainQuery} loadingLabel="Loading domain">
        {(domain) => (
          <PageHeader eyebrow="Domain" title={domain.name} description={domain.description} />
        )}
      </AsyncBoundary>

      <section className="space-y-4">
        <SectionHeading title="Skill tree" hint="Skill → competency → learning objective." />
        <AsyncBoundary query={skillsQuery} loadingLabel="Loading skills">
          {(skills) => (
            <div className="space-y-4">
              {skills.map((skill) => (
                <article key={skill.id} className="surface-panel p-5">
                  <h3 className="font-display text-lg font-semibold">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                  <ul className="mt-4 space-y-3">
                    {allCompetencies
                      .filter((c) => c.skillId === skill.id)
                      .map((comp) => {
                        const record = masteryQuery.data?.find((m) => m.competencyId === comp.id);
                        return (
                          <li
                            key={comp.id}
                            className="rounded-xl border border-border bg-surface-raised p-4"
                          >
                            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                              <p className="min-w-0 font-medium">{comp.name}</p>
                              <MasteryBadge state={record?.state ?? "not-started"} />
                            </div>
                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {allObjectives
                                .filter((o) => o.competencyId === comp.id)
                                .map((o) => (
                                  <li key={o.id}>
                                    {o.statement}{" "}
                                    <span className="text-xs uppercase tracking-wide text-secondary">
                                      {o.cognitiveLevel}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </li>
                        );
                      })}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-4">
        <SectionHeading title="Missions in this domain" />
        {missionsQuery.data && missionsQuery.data.length === 0 ? (
          <EmptyState
            title="No missions here yet"
            description="New missions are authored for this domain each season."
          />
        ) : (
          <AsyncBoundary query={missionsQuery} loadingLabel="Loading missions">
            {(missions) => (
              <div className="grid gap-4 sm:grid-cols-2">
                {missions.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    domainName={domainQuery.data?.shortName ?? "Learning"}
                  />
                ))}
              </div>
            )}
          </AsyncBoundary>
        )}
      </section>
    </div>
  );
}
