import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { communityService, queryKeys } from "@/services";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — USAM for Kids" },
      {
        name: "description",
        content: "Moderated guilds and evidence-based leaderboards, built for child safety first.",
      },
      { property: "og:title", content: "Community — USAM for Kids" },
      {
        property: "og:description",
        content: "Safe, moderated collaboration spaces with parent-aware controls.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const guildsQuery = useQuery({ queryKey: queryKeys.guilds, queryFn: communityService.listGuilds });
  const leaderboardQuery = useQuery({
    queryKey: queryKeys.leaderboard,
    queryFn: communityService.getLeaderboard,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Community"
        title="Learn alongside others"
        description="Every space is moderated. Open messaging is intentionally not available in this foundation."
      />

      <div className="surface-panel flex items-start gap-3 p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        <p className="text-muted-foreground">
          Social features shown here are placeholders with safety controls in place. Direct
          messaging, uploads and public profiles stay disabled until moderation is connected.
        </p>
      </div>

      <section className="space-y-3">
        <SectionHeading title="Your guilds" hint="Small, moderated, domain-focused groups." />
        <AsyncBoundary query={guildsQuery} loadingLabel="Loading guilds">
          {(guilds) => (
            <ul className="grid gap-3 sm:grid-cols-2">
              {guilds.map((g) => (
                <li key={g.id} className="surface-panel p-5">
                  <h3 className="font-semibold">{g.name}</h3>
                  <p className="text-sm text-muted-foreground">{g.memberCount} learners · moderated</p>
                </li>
              ))}
            </ul>
          )}
        </AsyncBoundary>
      </section>

      <section className="space-y-3">
        <SectionHeading
          title="Guild standing"
          hint="Ranked on competencies mastered, never on time online."
        />
        <AsyncBoundary query={leaderboardQuery} loadingLabel="Loading standings">
          {(board) => (
            <ol className="surface-panel divide-y divide-border">
              {board.entries.map((e) => (
                <li key={e.learnerId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4">
                  <span className="grid size-8 place-items-center rounded-full bg-surface-raised text-sm font-bold">
                    {e.rank}
                  </span>
                  <span className="min-w-0 truncate font-medium">{e.displayName}</span>
                  <span className="text-sm text-muted-foreground">
                    {e.competenciesMastered} mastered
                  </span>
                </li>
              ))}
            </ol>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}
