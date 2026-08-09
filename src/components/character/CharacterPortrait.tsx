import { useMemo, type ReactElement } from "react";
import {
  AURA_CLASS,
  CHARACTER_EXPRESSIONS,
  type CharacterExpression,
  type CharacterPresentation,
} from "@/design/character";
import { MOTION_PRESETS } from "@/design/tokens";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";

/**
 * Procedural character face.
 *
 * Deliberately asset-free: every character renders from a seeded palette plus
 * an expression spec, so new personalities exist the moment they exist in data.
 * When illustrated or rigged assets arrive, pass `assetSrc` and the same
 * expression contract drives the artwork instead.
 */

export interface CharacterIdentity {
  id: string;
  name: string;
  /** Semantic accent, e.g. `var(--color-secondary)`. */
  accentColor?: string;
  assetSrc?: string;
}

const EYE_SHAPES: Record<string, (x: number) => ReactElement> = {
  open: (x) => <circle cx={x} cy={44} r={5} fill="currentColor" />,
  wide: (x) => <circle cx={x} cy={43} r={6.8} fill="currentColor" />,
  soft: (x) => <ellipse cx={x} cy={45} rx={5} ry={3.6} fill="currentColor" />,
  squint: (x) => <rect x={x - 5} y={42} width={10} height={3.4} rx={1.7} fill="currentColor" />,
  half: (x) => <path d={`M${x - 6} 44 a6 6 0 0 1 12 0 z`} fill="currentColor" />,
  arc: (x) => (
    <path
      d={`M${x - 6} 46 q6 -8 12 0`}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    />
  ),
};

const MOUTH_SHAPES: Record<string, ReactElement> = {
  smile: (
    <path
      d="M42 62 q14 10 28 0"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
    />
  ),
  open: <ellipse cx={56} cy={64} rx={8} ry={7} fill="currentColor" />,
  flat: (
    <path
      d="M45 64 h22"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.4}
      strokeLinecap="round"
    />
  ),
  small: <circle cx={56} cy={64} r={4} fill="currentColor" />,
  grin: <path d="M40 60 q16 16 32 0 z" fill="currentColor" />,
  wave: (
    <path
      d="M44 64 q5 -6 9 0 t9 0"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.2}
      strokeLinecap="round"
    />
  ),
};

const SIZE_BY_PRESENTATION: Record<CharacterPresentation, number> = {
  avatar: 56,
  bust: 96,
  "full-body": 148,
};

export function CharacterPortrait({
  character,
  expression = "idle",
  presentation,
  size,
  showAura = true,
  className,
}: {
  character: CharacterIdentity;
  expression?: CharacterExpression;
  presentation?: CharacterPresentation;
  size?: number;
  showAura?: boolean;
  className?: string;
}) {
  const { p, reducedMotion } = useAgePresentation();
  const mode = presentation ?? p.characterPresentation;
  const px = Math.round((size ?? SIZE_BY_PRESENTATION[mode]) * (size ? 1 : p.characterScale));
  const spec = CHARACTER_EXPRESSIONS[expression];
  const accent = character.accentColor ?? "var(--color-primary)";
  const motionClass = reducedMotion ? "" : MOTION_PRESETS[spec.motion];

  const eyes = useMemo(() => EYE_SHAPES[spec.eyes] ?? EYE_SHAPES["open"]!, [spec.eyes]);

  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: px, height: px }}
    >
      {showAura && spec.live && !reducedMotion && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full opacity-30 animate-pulse-ring",
            AURA_CLASS[spec.aura],
          )}
        />
      )}
      {character.assetSrc ? (
        <img
          src={character.assetSrc}
          alt=""
          width={px}
          height={px}
          className={cn("rounded-full object-contain", motionClass)}
        />
      ) : (
        <svg
          viewBox="0 0 112 112"
          width={px}
          height={px}
          role="img"
          aria-label={`${character.name} — ${spec.label}`}
          className={cn("overflow-visible", motionClass)}
        >
          <defs>
            <radialGradient id={`face-${character.id}-${expression}`} cx="35%" cy="28%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
            </radialGradient>
          </defs>
          {mode === "full-body" && (
            <path
              d="M32 104 q24 -22 48 0 z"
              fill={accent}
              opacity="0.35"
            />
          )}
          <circle
            cx="56"
            cy="54"
            r="42"
            fill={`url(#face-${character.id}-${expression})`}
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          <g className="text-background">
            {eyes(41)}
            {eyes(71)}
            {MOUTH_SHAPES[spec.mouth] ?? MOUTH_SHAPES["smile"]}
          </g>
          {spec.activity === "sparkles" && !reducedMotion && (
            <g className="text-accent" fill="currentColor" aria-hidden>
              <path d="M96 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" className="animate-sparkle" />
              <path
                d="M16 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"
                className="animate-sparkle"
                style={{ animationDelay: "0.5s" }}
              />
            </g>
          )}
        </svg>
      )}
      {spec.activity === "dots" && (
        <span className="absolute -bottom-1 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("size-1.5 rounded-full animate-think", AURA_CLASS[spec.aura])}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      )}
      {spec.activity === "waveform" && (
        <span className="absolute -bottom-1 flex items-end gap-0.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn("w-1 rounded-full animate-think", AURA_CLASS[spec.aura])}
              style={{ height: 6 + (i % 3) * 5, animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
      )}
      <span className="sr-only">{spec.meaning}</span>
    </span>
  );
}

/** Character card: identity + role + current state, reused across surfaces. */
export function CharacterPresence({
  character,
  role,
  expression = "idle",
  utterance,
  className,
}: {
  character: CharacterIdentity;
  role: string;
  expression?: CharacterExpression;
  utterance?: string;
  className?: string;
}) {
  const { p, fit } = useAgePresentation();
  const spec = CHARACTER_EXPRESSIONS[expression];
  return (
    <article className={cn("surface-panel interactive flex gap-4 p-4", className)}>
      <CharacterPortrait character={character} expression={expression} />
      <div className="min-w-0">
        <h3 className="font-display text-heading font-semibold">{character.name}</h3>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{role}</p>
        {p.showSecondaryMeta && (
          <p className="mt-1 text-xs text-muted-foreground">{spec.label} · {spec.meaning}</p>
        )}
        {utterance && <p className="mt-2 text-sm text-foreground">{fit(utterance)}</p>}
      </div>
    </article>
  );
}
