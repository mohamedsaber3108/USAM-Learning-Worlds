import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AsyncBoundary } from "@/components/state/AsyncStates";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { RelationshipPanel } from "@/components/character/RelationshipPanel";
import { characterService, queryKeys } from "@/services";
import { onboardingKeys, relationshipService } from "@/services/onboarding";
import { useExperience } from "@/state/experience";

const roleLabel: Record<string, string> = {
  "main-companion": "Main companion",
  "english-coach": "English coach",
  "coding-mentor": "Coding mentor",
  "ai-mentor": "AI mentor",
  "creativity-mentor": "Creativity mentor",
  "entrepreneurship-mentor": "Entrepreneurship mentor",
  "science-mentor": "Science mentor",
  "story-guide": "Story guide",
  "challenge-master": "Challenge master",
  "project-reviewer": "Project reviewer",
  "wellbeing-companion": "Reflection companion",
  rival: "Rival",
  story: "Story character",
  "world-guide": "World guide",
};

export const Route = createFileRoute("/characters")({
  head: () => ({
    meta: [
      { title: "Characters — USAM for Kids" },
      {
        name: "description",
        content:
          "Meet Azouz and the mentor characters. Each has a role, a domain and an age-adapted teaching tone.",
      },
      { property: "og:title", content: "Characters — USAM for Kids" },
      {
        property: "og:description",
        content: "Roles, not skins: every character teaches something specific.",
      },
    ],
  }),
  component: CharactersPage,
});

function CharactersPage() {
  const { adaptation } = useExperience();
  const charactersQuery = useQuery({ queryKey: queryKeys.characters, queryFn: characterService.list });
  const relationshipsQuery = useQuery({
    queryKey: onboardingKeys.relationships,
    queryFn: relationshipService.list,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Characters"
        title="Your mentors and companions"
        description="Characters are defined by data — role, domains, tone per age band. New characters can be added without touching the UI."
      />
      <AsyncBoundary query={charactersQuery} loadingLabel="Gathering characters">
        {(characters) => (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {characters.map((ch) => (
              <article key={ch.id} className="surface-panel flex gap-4 p-5">
                <CharacterAvatar
                  character={ch}
                  mood={ch.role === "rival" ? "focused" : "encouraging"}
                  size="lg"
                />
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{ch.name}</h2>
                    {!ch.unlocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        <Lock className="size-3" aria-hidden /> Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {roleLabel[ch.role]}
                  </p>
                  <p className="text-sm text-muted-foreground">{ch.tagline}</p>
                  <p className="text-xs text-muted-foreground">
                    Tone for ages {adaptation.band}: {ch.toneByAgeBand[adaptation.band]}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </AsyncBoundary>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-heading font-semibold">Your relationships</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Trust and familiarity describe how well a mentor can help you — never how much you owe
            them. You decide when to talk, and nothing is lost when you don't.
          </p>
        </div>
        <AsyncBoundary query={relationshipsQuery} loadingLabel="Loading relationships">
          {(relationships) => (
            <div className="grid gap-4 lg:grid-cols-2">
              {relationships.map((rel) => (
                <RelationshipPanel key={rel.characterId} relationship={rel} />
              ))}
            </div>
          )}
        </AsyncBoundary>
      </section>
    </div>
  );
}
