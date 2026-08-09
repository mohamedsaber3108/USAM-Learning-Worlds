import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { EnglishWorldMap, VenueCard } from "@/components/english/EnglishWorldMap";
import { StrandBoard, StrandDetail, glyphIcon } from "@/components/english/StrandBoard";
import { englishKeys, englishService } from "@/services/english";
import { useExperience } from "@/state/experience";
import type { EnglishStrandId } from "@/types/english";

export const Route = createFileRoute("/english/")({
  head: () => ({
    meta: [
      { title: "English World — USAM for Kids" },
      {
        name: "description",
        content:
          "A full English curriculum for ages 8–14: listening, speaking, reading, writing, grammar, conversation, storytelling and presentation, with evidence-based mastery.",
      },
      { property: "og:title", content: "English World — USAM for Kids" },
      {
        property: "og:description",
        content:
          "Fourteen strands of English taught across ten places — conversation rooms, listening lab, speaking studio, writing studio and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnglishWorldPage,
});

function EnglishWorldPage() {
  const { ageBand } = useExperience();
  const [strandId, setStrandId] = useState<EnglishStrandId | null>(null);
  const snapshotQuery = useQuery({
    queryKey: englishKeys.snapshot(ageBand),
    queryFn: () => englishService.snapshot(ageBand),
  });

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="English world"
        title="English, all fourteen strands of it"
        description="Not vocabulary games. Listening, speaking, reading, writing, grammar, conversation, storytelling and presentation — each with places to practise and evidence that you can."
      />

      <AsyncBoundary query={snapshotQuery} loadingLabel="Opening the English world">
        {(snapshot) => {
          const selected = snapshot.strands.find((s) => s.id === strandId) ?? null;
          const recommended = snapshot.venues.find(
            (v) => v.id === snapshot.recommendation.venueId,
          );

          return (
            <>
              {recommended && (
                <Link
                  to="/english/$venueId"
                  params={{ venueId: recommended.id }}
                  className="surface-panel flex flex-wrap items-center gap-4 border-primary/40 bg-primary/5 p-5 transition-colors hover:border-primary"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Suggested next
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      {recommended.ageFraming[ageBand].title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {snapshot.recommendation.because}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-primary" aria-hidden />
                </Link>
              )}

              <section className="space-y-4">
                <SectionHeading
                  title="The English world"
                  hint="Ten places. Each one teaches named strands and produces evidence."
                />
                <EnglishWorldMap venues={snapshot.venues} ageBand={ageBand} />
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {snapshot.venues.map((venue) => (
                    <li key={venue.id}>
                      <VenueCard venue={venue} ageBand={ageBand} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  title="Strands"
                  hint="All of them, always. Your age changes how much weight each one carries right now."
                />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <StrandBoard
                    strands={snapshot.strands}
                    ageBand={ageBand}
                    selectedId={strandId}
                    onSelect={(id) => setStrandId((prev) => (prev === id ? null : id))}
                  />
                  {selected ? (
                    <StrandDetail strand={selected} ageBand={ageBand} />
                  ) : (
                    <div className="surface-panel p-5 text-sm text-muted-foreground">
                      Pick a strand to see what it actually means and why it's worth your time.
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading
                  title="English isn't only here"
                  hint="Where the same strands show up while you're doing something else entirely."
                />
                <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {snapshot.elsewhere.map((item) => {
                    const Glyph = glyphIcon(item.glyph);
                    return (
                      <li key={item.id} className="surface-panel space-y-2 p-4">
                        <div className="flex items-center gap-2">
                          <Glyph className="size-4 text-secondary" aria-hidden />
                          <span className="text-sm font-semibold">{item.worldName}</span>
                        </div>
                        <p className="text-sm">{item.activity}</p>
                        <p className="text-sm text-muted-foreground">{item.englishDemand}</p>
                        <ul className="flex flex-wrap gap-1.5 pt-1">
                          {item.strandIds.map((s) => (
                            <li
                              key={s}
                              className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
