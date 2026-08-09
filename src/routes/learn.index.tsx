import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { DomainCard } from "@/components/learning/Cards";
import { curriculumService, masteryService, queryKeys } from "@/services";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learn — Domains & skill trees | USAM for Kids" },
      {
        name: "description",
        content:
          "Thirteen learning domains, each with skills, competencies, objectives and mastery tracking.",
      },
      { property: "og:title", content: "Learn — Domains & skill trees | USAM for Kids" },
      {
        property: "og:description",
        content: "Explore English, coding, AI, creativity, entrepreneurship and more.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const { adaptation } = useExperience();
  const domainsQuery = useQuery({ queryKey: queryKeys.domains, queryFn: curriculumService.listDomains });
  const progressQuery = useQuery({ queryKey: queryKeys.progress, queryFn: masteryService.listProgress });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Learn"
        title="Learning domains"
        description="Domain → skill → competency → objective → activity → mastery. Every domain is scalable: new domains plug in without any UI rebuild."
      />
      <AsyncBoundary query={domainsQuery} loadingLabel="Loading domains" emptyTitle="No domains yet">
        {(domains) => (
          <div
            className={
              adaptation.cardsPerRow === 3
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-4 sm:grid-cols-2"
            }
          >
            {domains.map((d) => {
              const p = progressQuery.data?.find((x) => x.domainId === d.id);
              return (
                <DomainCard
                  key={d.id}
                  domain={d}
                  mastered={p?.masteredCompetencies ?? 0}
                  total={p?.totalCompetencies ?? d.skillIds.length}
                />
              );
            })}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
