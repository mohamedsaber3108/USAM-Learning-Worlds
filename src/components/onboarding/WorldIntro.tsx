import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { WorldIllustration } from "@/components/world/WorldIllustration";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { VoiceOrb } from "@/components/voice/VoiceOrb";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { ARRIVAL_BEATS } from "@/data/onboarding";
import { cn } from "@/lib/utils";

/**
 * Arrival: three short cinematic beats.
 *
 * Lightweight on purpose — no long text, no forms. The child is introduced to
 * the world, then to the companion, then invited to make a character.
 */
export function WorldIntro({ onEnter }: { onEnter: () => void }) {
  const { p, reducedMotion } = useAgePresentation();
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(true);
  const beat = ARRIVAL_BEATS[index]!;
  const isLast = index === ARRIVAL_BEATS.length - 1;

  useEffect(() => {
    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 2200);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border">
      <div className="absolute inset-0 -z-10">
        <WorldIllustration scene={{ biome: beat.biome, label: beat.headline, accent: "" }} />
      </div>
      <div className="flex min-h-[26rem] flex-col justify-end gap-6 bg-gradient-to-t from-background via-background/85 to-transparent p-6 sm:p-10">
        <div className="flex items-end gap-4">
          <CharacterPortrait
            character={{ id: "ch-azouz", name: "Azouz" }}
            expression={speaking ? "speaking" : "encouraging"}
            presentation={p.mode === "pathfinder" ? "bust" : "full-body"}
          />
          <div className={cn("space-y-2", !reducedMotion && "animate-rise")} key={beat.id}>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {index + 1} / {ARRIVAL_BEATS.length}
            </p>
            <h1 className="font-display text-display font-semibold">{beat.headline}</h1>
            <p className="max-w-md text-muted-foreground">{beat.line}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <VoiceOrb state={speaking ? "speaking" : "idle"} size={64} onToggle={() => setSpeaking((s) => !s)} />
          <p className="text-sm text-muted-foreground">
            {speaking ? `“${beat.voiceLine}”` : "Tap Azouz to hear it again."}
          </p>
          <button
            type="button"
            onClick={() => (isLast ? onEnter() : setIndex((i) => i + 1))}
            className="interactive ms-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground"
          >
            {isLast ? "Make my character" : "Keep going"}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
}
