import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Compass } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { masteryService, queryKeys } from "@/services";
import { DISCOVERIES } from "@/data/home";
import { useAgePresentation } from "@/design/AgePresentationProvider";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — USAM for Kids" },
      {
        name: "description",
        content:
          "Achievements earned from evidence of understanding, plus the discoveries made while exploring the world.",
      },
      { property: "og:title", content: "Achievements — USAM for Kids" },
      {
        property: "og:description",
        content: "Every achievement names the evidence behind it — never time spent or points collected.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { p, fit } = useAgePresentation();
  const achievementsQuery = useQuery({
    queryKey: queryKeys.achievements,
    queryFn: masteryService.listAchievements,
  });

  return (
    <div className={p.sectionGapClass}>
      <PageHeader
        eyebrow="Achievements"
        title="Proof of what you understand"
        description="Each one names the evidence behind it. None of them can be earned by spending time."
      />

      <AsyncBoundary
        query={achievementsQuery}
        loadingLabel="Gathering your evidence"
        emptyTitle="No achievements yet — that's normal"
        emptyDescription="They arrive when you show something you understand, so the first one is usually a conversation."
      >
        {(achievements) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {achievements.map((a) => (
              <article key={a.id} className="surface-panel p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning">
                  <Award className="size-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-heading font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{fit(a.evidence)}</p>
                {p.showSecondaryMeta && a.earnedAt && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Earned {new Date(a.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </AsyncBoundary>

      <section className="space-y-4">
        <h2 className="font-display text-heading font-semibold">Discoveries</h2>
        <p className="text-sm text-muted-foreground">
          Things you noticed in the world before anyone explained them.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DISCOVERIES.map((d) => (
            <article key={d.id} className="surface-panel p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
                <Compass className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-display text-heading font-semibold">{d.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{fit(d.note)}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {d.worldName} · {d.unlockedBy}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
