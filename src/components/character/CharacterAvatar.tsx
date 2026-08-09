import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import type { Character, CharacterMood } from "@/types/domain";

const moodRing: Record<CharacterMood, string> = {
  neutral: "ring-border",
  encouraging: "ring-primary/60",
  curious: "ring-secondary/60",
  celebrating: "ring-success/70",
  focused: "ring-secondary/50",
  concerned: "ring-warning/60",
  explaining: "ring-accent/60",
};

const sizeMap = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
  xl: "size-28",
} as const;

export interface CharacterAvatarProps {
  character: Pick<Character, "name" | "glyph" | "accentColor">;
  mood?: CharacterMood;
  size?: keyof typeof sizeMap;
  pulsing?: boolean;
  className?: string;
}

/** Renders any character from data — new characters need no new component. */
export function CharacterAvatar({
  character,
  mood = "neutral",
  size = "md",
  pulsing = false,
  className,
}: CharacterAvatarProps) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[character.glyph] ?? Icons.User;
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {pulsing && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring"
        />
      )}
      <span
        className={cn(
          "grid place-items-center rounded-full ring-2 bg-surface-raised",
          sizeMap[size],
          moodRing[mood],
        )}
        style={{ boxShadow: `inset 0 0 24px -8px ${character.accentColor}` }}
      >
        <Icon
          className="size-1/2"
          style={{ color: character.accentColor }}
          aria-hidden
          strokeWidth={1.75}
        />
      </span>
      <span className="sr-only">{character.name}</span>
    </span>
  );
}
