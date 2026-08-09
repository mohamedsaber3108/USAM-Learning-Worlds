import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HomeSky, PlaceBanner } from "@/components/home/HomeSky";
import { MomentBanner } from "@/components/home/MomentBanner";
import { CompanionDock } from "@/components/home/CompanionDock";
import { DailyPath } from "@/components/home/DailyPath";
import {
  AchievementsPanel,
  CreationsPanel,
  DiscoveriesPanel,
  MissionFocusPanel,
  NextActivityPanel,
  ProgressPulsePanel,
  SkillsPanel,
} from "@/components/home/HomePanels";
import { HomeStateControls } from "@/components/home/HomeStateControls";
import { WorldEmpty, WorldError, WorldLoading } from "@/components/state/WorldStates";
import { homeQueryKeys, homeService } from "@/services/home";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import type { HomeStateRequest } from "@/types/home";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your world — USAM for Kids" },
      {
        name: "description",
        content:
          "A living learning world for ages 8–14: your companion, your current mission, today's path, your skills and the things you've made.",
      },
      { property: "og:title", content: "Your world — USAM for Kids" },
      {
        property: "og:description",
        content: "Not a dashboard — a place you arrive in, with a companion who already knows you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomeWorld,
});

function defaultTimeOfDay(): HomeStateRequest["timeOfDay"] {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function HomeWorld() {
  const { p } = useAgePresentation();
  const [request, setRequest] = useState<HomeStateRequest>({
    timeOfDay: defaultTimeOfDay(),
    moment: "new-mission",
  });

  const snapshotQuery = useQuery({
    queryKey: homeQueryKeys.snapshot(request),
    queryFn: () => homeService.getSnapshot(request),
  });

  if (snapshotQuery.isPending) return <WorldLoading />;
  if (snapshotQuery.isError)
    return (
      <WorldError
        message="I couldn't reach Signal Bay just now. Nothing you made is lost — it's a connection problem, not your work."
        onRetry={() => void snapshotQuery.refetch()}
      />
    );

  const snapshot = snapshotQuery.data;

  return (
    <div className={cn(p.sectionGapClass, "pb-4")}>
      <HomeSky atmosphere={snapshot.atmosphere} className="space-y-5">
        <PlaceBanner atmosphere={snapshot.atmosphere} />
        <CompanionDock companion={snapshot.companion} />
      </HomeSky>

      {snapshot.moments.length > 0 && (
        <div className="space-y-3">
          {snapshot.moments.map((moment) => (
            <MomentBanner key={moment.id} moment={moment} cast={snapshot.cast} />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {snapshot.mission ? (
            <MissionFocusPanel mission={snapshot.mission} cast={snapshot.cast} />
          ) : (
            <WorldEmpty
              title="No mission open right now"
              body="That's a fine place to be. Pick a world and someone there will have work for you."
            />
          )}
          {snapshot.nextActivity && <NextActivityPanel activity={snapshot.nextActivity} />}
          {p.hierarchyDepth > 1 && <SkillsPanel skills={snapshot.skills} />}
        </div>

        <div className="space-y-4">
          <DailyPath steps={snapshot.dailyPath} />
          <ProgressPulsePanel pulse={snapshot.progress} />
          <DiscoveriesPanel discoveries={snapshot.discoveries} />
          {p.showSecondaryMeta && <CreationsPanel creations={snapshot.creations} />}
          <AchievementsPanel achievements={snapshot.achievements} />
        </div>
      </div>

      <HomeStateControls request={request} onChange={setRequest} />
    </div>
  );
}
