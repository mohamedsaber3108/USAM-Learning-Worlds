import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { StoryPlayer } from "@/components/story/StoryPlayer";
import { contentService, queryKeys } from "@/services";
import { domains, worlds } from "@/data/mock";
import { useExperience } from "@/state/experience";

export const Route = createFileRoute("/stories")({
  head: () => ({
    meta: [
      { title: "Stories — NOVA Learning World" },
      {
        name: "description",
        content:
          "Branching learning stories where every narrative beat carries a stated learning objective for ages 8–14.",
      },
      { property: "og:title", content: "Stories — NOVA Learning World" },
      {
        property: "og:description",
        content: "Narrative missions that teach language, coding and enterprise thinking.",
      },
    ],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  const { ageBand } = useExperience();
  const [selected, setSelected] = useState<string | null>(null);
  const storiesQuery = useQuery({
    queryKey: queryKeys.stories,
    queryFn: contentService.listStories,
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Story engine"
        title="Learn inside the story"
        description="Every beat states what it teaches. Choices change the path, never the objective."
      />

      <AsyncBoundary
        query={storiesQuery}
        loadingLabel="Opening the story archive"
        emptyTitle="No stories yet"
        emptyDescription="New narrative arcs unlock as your world expands."
      >
        {(stories) => {
          const forAge = stories.filter((s) => s.ageBands.includes(ageBand));
          const list = forAge.length ? forAge : stories;
          const active = list.find((s) => s.id === selected) ?? list[0];
          return (
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <section className="space-y-3">
                <SectionHeading title="Story arcs" hint={`Tuned for ${ageBand}`} />
                <ul className="space-y-2">
                  {list.map((story) => (
                    <li key={story.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(story.id)}
                        aria-current={active?.id === story.id}
                        className={`w-full rounded-xl border p-4 text-left transition-colors min-h-11 ${
                          active?.id === story.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-surface hover:border-primary/50"
                        }`}
                      >
                        <p className="font-semibold">{story.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {worlds.find((w) => w.id === story.worldId)?.name} ·{" "}
                          {domains.find((d) => d.id === story.domainId)?.name}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">{story.premise}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              {active && <StoryPlayer key={active.id} story={active} />}
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
