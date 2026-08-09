import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { RubricList, SessionSurface } from "@/components/english/SessionSurfaces";
import { glyphIcon } from "@/components/english/StrandBoard";
import { englishKeys, englishService } from "@/services/english";
import { useExperience } from "@/state/experience";
import { cn } from "@/lib/utils";
import type { EnglishVenueId } from "@/types/english";

export const Route = createFileRoute("/english/$venueId")({
  head: () => ({
    meta: [
      { title: "English venue — USAM for Kids" },
      {
        name: "description",
        content:
          "Practise a specific strand of English: listen, speak, read, write, roleplay or present, with a rubric and unlimited retries.",
      },
      { property: "og:title", content: "English venue — USAM for Kids" },
      {
        property: "og:description",
        content: "Age-adapted English practice with transcripts, feedback and retries.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VenuePage,
});

function VenuePage() {
  const { venueId } = Route.useParams();
  const { ageBand } = useExperience();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const venueQuery = useQuery({
    queryKey: englishKeys.venue(venueId),
    queryFn: () => englishService.venue(venueId as EnglishVenueId),
  });
  const sessionsQuery = useQuery({
    queryKey: englishKeys.sessions(venueId, ageBand),
    queryFn: () => englishService.sessions(venueId as EnglishVenueId, ageBand),
  });

  if (venueQuery.isSuccess && venueQuery.data === null) throw notFound();

  return (
    <div className="space-y-8">
      <Link
        to="/english"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to the English world
      </Link>

      <AsyncBoundary query={venueQuery} loadingLabel="Opening the venue">
        {(venue) => {
          const framing = venue.ageFraming[ageBand];
          const Glyph = glyphIcon(venue.glyph);
          return (
            <div className="space-y-8">
              <PageHeader
                eyebrow={venue.name}
                title={framing.title}
                description={framing.description}
                actions={
                  <span className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-primary">
                    <Glyph className="size-6" aria-hidden />
                  </span>
                }
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {framing.focus.map((f) => (
                  <p key={f} className="surface-panel p-4 text-sm">
                    {f}
                  </p>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Strands practised here: {venue.strandIds.join(" · ")}
              </p>

              <AsyncBoundary
                query={sessionsQuery}
                loadingLabel="Loading practice"
                emptyTitle="Nothing written for this age yet"
                emptyDescription="Sessions appear here as the curriculum opens up."
              >
                {(sessions) => {
                  const active = sessions.find((s) => s.id === sessionId) ?? sessions[0]!;
                  return (
                    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
                      <section className="space-y-3">
                        <SectionHeading title="Sessions" />
                        <ul className="space-y-2">
                          {sessions.map((s) => (
                            <li key={s.id}>
                              <button
                                type="button"
                                onClick={() => setSessionId(s.id)}
                                aria-current={active.id === s.id}
                                className={cn(
                                  "min-h-11 w-full rounded-xl border p-4 text-left transition-colors",
                                  active.id === s.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border bg-surface hover:border-primary/50",
                                )}
                              >
                                <p className="font-semibold">{s.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {s.kind} · {s.minutes} min
                                </p>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <RubricList rubric={active.rubric} />
                      </section>

                      <section className="space-y-4">
                        <div>
                          <h2 className="font-display text-xl font-semibold">{active.title}</h2>
                          <p className="text-sm text-muted-foreground">{active.purpose}</p>
                        </div>
                        <SessionSurface key={active.id} session={active} />
                      </section>
                    </div>
                  );
                }}
              </AsyncBoundary>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
