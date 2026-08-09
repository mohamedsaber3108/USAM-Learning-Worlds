import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { ParentInsightCard } from "@/components/parents/ParentInsightCard";
import { analyticsService, queryKeys, reviewService, safetyService } from "@/services";
import { domains, objectives } from "@/data/mock";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Route = createFileRoute("/parents")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard — NOVA Learning World" },
      {
        name: "description",
        content:
          "Evidence-based insight for parents: learning balance, habits, review debt and safety controls.",
      },
      { property: "og:title", content: "Parent Dashboard — NOVA Learning World" },
      {
        property: "og:description",
        content: "See what your child is mastering, not just how many minutes they spent.",
      },
    ],
  }),
  component: ParentsPage,
});

function ParentsPage() {
  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: analyticsService.getSummary,
  });
  const insightsQuery = useQuery({
    queryKey: queryKeys.parentInsights,
    queryFn: analyticsService.listParentInsights,
  });
  const reviewQuery = useQuery({ queryKey: queryKeys.review, queryFn: reviewService.listDue });
  const safetyQuery = useQuery({ queryKey: queryKeys.safety, queryFn: safetyService.getSettings });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Parent dashboard"
        title="What learning actually happened"
        description="Signals are drawn from mastery evidence and learning behaviour, not screen time alone."
      />

      <section className="space-y-3">
        <SectionHeading title="This week" />
        <AsyncBoundary query={analyticsQuery} loadingLabel="Gathering learning signals">
          {(summary) => (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="surface-panel p-5">
                <h3 className="text-sm font-semibold">Minutes of active learning</h3>
                <ul className="mt-4 flex h-40 items-stretch gap-2">
                  {summary.weeklyMinutes.map((minutes, i) => (
                    <li key={DAYS[i]} className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-md bg-primary/70 motion-safe:transition-all"
                          style={{ height: `${Math.max(4, Math.min(100, (minutes / 60) * 100))}%` }}
                          role="img"
                          aria-label={`${DAYS[i]}: ${minutes} minutes`}
                        />
                      </div>
                      <span className="text-center text-[11px] text-muted-foreground">{DAYS[i]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-panel space-y-4 p-5">
                <h3 className="text-sm font-semibold">Learning behaviour</h3>
                {(
                  [
                    ["Focus", summary.focusScore],
                    ["Persistence", summary.persistenceScore],
                    ["Curiosity", summary.curiosityScore],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className="text-muted-foreground">{Math.round(value * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-raised">
                      <div
                        className="h-2 rounded-full bg-secondary"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <h4 className="mt-2 text-sm font-semibold">Domain balance</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {summary.domainBalance.map((d) => (
                      <li key={d.domainId} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {domains.find((x) => x.id === d.domainId)?.name ?? d.domainId}
                        </span>
                        <span className="shrink-0">{Math.round(d.share * 100)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Insights" hint="What to do next, in plain language." />
        <AsyncBoundary query={insightsQuery} loadingLabel="Reading the signals">
          {(insights) => (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight) => (
                <ParentInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Review schedule" hint="Spaced review protects mastery." />
        <AsyncBoundary query={reviewQuery} loadingLabel="Checking review debt">
          {(items) => (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="surface-panel grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {objectives.find((o) => o.id === item.objectiveId)?.statement}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-raised px-3 py-1 text-xs">
                    <Clock className="size-3" aria-hidden />
                    {Math.round(item.retentionEstimate * 100)}% retained
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading title="Safety controls" hint="Placeholder controls — no account is connected." />
        <AsyncBoundary query={safetyQuery} loadingLabel="Loading safety settings">
          {(settings) => (
            <div className="surface-panel space-y-2 p-5 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-secondary" aria-hidden />
                Session limit {settings.sessionLimitMinutes} minutes/day
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>· Content filter: {settings.contentFilter}</li>
                <li>· Community access: {settings.communityEnabled ? "on" : "off"}</li>
                <li>· Voice capture: {settings.voiceEnabled ? "allowed" : "disabled"}</li>
              </ul>
            </div>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}
