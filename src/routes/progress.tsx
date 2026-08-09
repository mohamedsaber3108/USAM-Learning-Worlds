import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { MasteryMeter } from "@/components/learning/Mastery";
import { curriculumService, masteryService, queryKeys } from "@/services";
import { competencies as allCompetencies } from "@/data/mock";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Mastery — USAM for Kids" },
      {
        name: "description",
        content:
          "Mastery by domain, evidence counts and review schedules — a measurable picture of learning.",
      },
      { property: "og:title", content: "Progress & Mastery — USAM for Kids" },
      {
        property: "og:description",
        content: "Progress measured as competency mastery, not points or streaks.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const progressQuery = useQuery({ queryKey: queryKeys.progress, queryFn: masteryService.listProgress });
  const masteryQuery = useQuery({ queryKey: queryKeys.mastery, queryFn: masteryService.list });
  const achievementsQuery = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: masteryService.listAchievements,
  });
  const domainsQuery = useQuery({ queryKey: queryKeys.domains, queryFn: curriculumService.listDomains });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Progress"
        title="What you've actually learned"
        description="Every number here traces back to evidence: performance tasks, conversations, projects and retrieval practice."
      />

      <section className="space-y-3">
        <SectionHeading title="By domain" />
        <AsyncBoundary query={progressQuery} loadingLabel="Calculating mastery">
          {(records) => (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {records.map((r) => {
                const domain = domainsQuery.data?.find((d) => d.id === r.domainId);
                const pct = Math.round((r.masteredCompetencies / r.totalCompetencies) * 100);
                return (
                  <article key={r.domainId} className="surface-panel p-5">
                    <h3 className="font-semibold">{domain?.shortName ?? r.domainId}</h3>
                    <p className="mt-1 text-3xl font-bold text-primary">{pct}%</p>
                    <p className="text-xs text-muted-foreground">
                      {r.masteredCompetencies}/{r.totalCompetencies} competencies ·{" "}
                      {r.minutesLearned} minutes
                    </p>
                    <div className="mt-4 flex h-14 items-end gap-1" aria-hidden>
                      {r.weeklyMinutes.map((m, i) => (
                        <span
                          key={i}
                          className="flex-1 rounded-t bg-secondary/50"
                          style={{ height: `${Math.max(8, (m / 80) * 100)}%` }}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">Last 7 days</p>
                  </article>
                );
              })}
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Competency detail" hint="Confidence and evidence per competency." />
        <AsyncBoundary query={masteryQuery} loadingLabel="Loading competencies">
          {(records) => (
            <div className="surface-panel grid gap-6 p-5 sm:grid-cols-2">
              {records.map((r) => (
                <MasteryMeter
                  key={r.competencyId}
                  state={r.state}
                  confidence={r.confidence}
                  evidenceCount={r.evidenceCount}
                  label={allCompetencies.find((c) => c.id === r.competencyId)?.name ?? r.competencyId}
                />
              ))}
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Achievements" hint="Each one names the evidence behind it." />
        <AsyncBoundary query={achievementsQuery} loadingLabel="Loading achievements">
          {(achievements) => (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {achievements.map((a) => (
                <li key={a.id} className="surface-panel p-5">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.evidence}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {a.earnedAt ? `Earned ${new Date(a.earnedAt).toLocaleDateString()}` : "In progress"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}
