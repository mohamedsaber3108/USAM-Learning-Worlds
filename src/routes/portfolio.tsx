import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Lock, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { portfolioService, queryKeys } from "@/services";

const visibilityIcon = { private: Lock, family: Eye, community: Users } as const;

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — USAM for Kids" },
      {
        name: "description",
        content: "A growing body of real work: projects, write-ups and media, with parent-aware sharing.",
      },
      { property: "og:title", content: "Portfolio — USAM for Kids" },
      {
        property: "og:description",
        content: "Evidence of learning the learner actually owns.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const portfolioQuery = useQuery({ queryKey: queryKeys.portfolio, queryFn: portfolioService.list });
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Portfolio"
        title="Your body of work"
        description="Work stays private by default. Sharing beyond family requires parent approval."
      />
      <AsyncBoundary
        query={portfolioQuery}
        loadingLabel="Loading your work"
        emptyTitle="No work published yet"
        emptyDescription="Finish a project to add your first portfolio piece."
      >
        {(items) => (
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const Icon = visibilityIcon[item.visibility];
              return (
                <li key={item.id} className="surface-panel p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <h2 className="min-w-0 font-display text-lg font-semibold">{item.title}</h2>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-raised px-2.5 py-1 text-xs capitalize">
                      <Icon className="size-3.5" aria-hidden /> {item.visibility}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}
