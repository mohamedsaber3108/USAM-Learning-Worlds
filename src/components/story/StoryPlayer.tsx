import { useState } from "react";
import { BookOpen, CornerDownRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { characters } from "@/data/mock";
import type { Story } from "@/types/engines";

/**
 * Story surface. Narrative beats always carry a stated learning payload, so
 * the story never becomes decoration around the objective.
 */
export function StoryPlayer({ story }: { story: Story }) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const beat = story.beats[index];
  if (!beat) return null;
  const speaker = characters.find((c) => c.id === beat.speakerCharacterId);
  const choice = beat.choices.find((c) => c.id === chosen[beat.id]);

  return (
    <article className="surface-panel space-y-5 p-5 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-primary">
            Beat {index + 1} of {story.beats.length}
          </p>
          <h2 className="truncate font-display text-xl font-bold">{story.title}</h2>
        </div>
        <Badge variant="secondary" className="shrink-0">
          <BookOpen className="mr-1 size-3" aria-hidden />
          {story.minutes} min
        </Badge>
      </div>

      <div className="flex gap-4">
        {speaker && <CharacterAvatar character={speaker} size="md" />}
        <div className="min-w-0 space-y-2">
          {speaker && <p className="text-sm font-semibold">{speaker.name}</p>}
          <p className="text-base leading-relaxed">{beat.text}</p>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Teaches:</span> {beat.teaches}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {beat.choices.map((c) => {
          const selected = chosen[beat.id] === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setChosen((prev) => ({ ...prev, [beat.id]: c.id }))}
              aria-pressed={selected}
              className={`w-full rounded-xl border p-4 text-left text-sm transition-colors min-h-11 ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface hover:border-primary/50"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {choice && (
        <p className="flex items-start gap-2 rounded-xl bg-surface p-4 text-sm text-muted-foreground">
          <CornerDownRight className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
          {choice.consequence}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setIndex((i) => Math.min(i + 1, story.beats.length - 1))}
          disabled={!choice || index === story.beats.length - 1}
          className="min-h-11"
        >
          Continue the story
        </Button>
        <Button
          variant="ghost"
          className="min-h-11"
          onClick={() => {
            setIndex(0);
            setChosen({});
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Restart
        </Button>
      </div>
    </article>
  );
}
