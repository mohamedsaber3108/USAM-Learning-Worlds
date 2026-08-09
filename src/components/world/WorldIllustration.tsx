import { useAgePresentation } from "@/design/AgePresentationProvider";
import { cn } from "@/lib/utils";

/**
 * World illustration system.
 *
 * Learning regions are places, not list items. Each biome renders from the
 * same primitive language (sky wash, horizon, landmark, foreground) so new
 * regions are data, and illustration density follows the age mode.
 */

export type Biome = "isles" | "forest" | "city" | "orbit" | "desert" | "reef";

export interface WorldScene {
  biome: Biome;
  /** Semantic accent for the region. */
  accent: string;
  label: string;
}

const BIOME_ACCENT: Record<Biome, string> = {
  isles: "var(--color-secondary)",
  forest: "var(--color-success)",
  city: "var(--color-primary)",
  orbit: "var(--color-accent)",
  desert: "var(--color-warning)",
  reef: "var(--color-secondary)",
};

function Landmark({ biome, accent }: { biome: Biome; accent: string }) {
  switch (biome) {
    case "forest":
      return (
        <g fill={accent}>
          <path d="M60 120 l22 -46 22 46z" opacity="0.9" />
          <path d="M74 132 l18 -38 18 38z" opacity="0.7" />
          <path d="M150 128 l20 -42 20 42z" opacity="0.8" />
        </g>
      );
    case "city":
      return (
        <g fill={accent}>
          <rect x="62" y="70" width="26" height="62" rx="4" opacity="0.9" />
          <rect x="96" y="52" width="30" height="80" rx="4" opacity="0.75" />
          <rect x="134" y="84" width="24" height="48" rx="4" opacity="0.85" />
        </g>
      );
    case "orbit":
      return (
        <g>
          <circle cx="120" cy="86" r="26" fill={accent} opacity="0.85" />
          <ellipse
            cx="120"
            cy="86"
            rx="52"
            ry="16"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            opacity="0.7"
          />
        </g>
      );
    case "desert":
      return (
        <g fill={accent}>
          <path d="M50 132 q34 -46 68 0z" opacity="0.85" />
          <path d="M112 132 q28 -34 56 0z" opacity="0.65" />
        </g>
      );
    case "reef":
      return (
        <g stroke={accent} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M76 132 v-32 M76 112 l-14 -12 M76 106 l16 -14" opacity="0.85" />
          <path d="M148 132 v-24 M148 116 l14 -12" opacity="0.7" />
        </g>
      );
    default:
      return (
        <g fill={accent}>
          <path d="M46 132 q30 -40 62 -6 q22 -26 46 6z" opacity="0.85" />
          <circle cx="168" cy="60" r="14" opacity="0.6" />
        </g>
      );
  }
}

export function WorldIllustration({
  scene,
  className,
  interactive = false,
}: {
  scene: WorldScene;
  className?: string;
  interactive?: boolean;
}) {
  const { p, reducedMotion } = useAgePresentation();
  const accent = scene.accent || BIOME_ACCENT[scene.biome];
  const rich = p.illustrationDensity === "rich";
  const moderate = p.illustrationDensity !== "restrained";

  return (
    <svg
      viewBox="0 0 240 150"
      role="img"
      aria-label={`${scene.label} region illustration`}
      className={cn(
        "h-full w-full rounded-[var(--radius)]",
        interactive && "interactive",
        className,
      )}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`sky-${scene.biome}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={rich ? 0.45 : 0.28} />
          <stop offset="100%" stopColor="var(--color-background)" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" fill={`url(#sky-${scene.biome})`} />
      {moderate && (
        <g fill="var(--color-foreground)" opacity="0.12" aria-hidden>
          <circle cx="34" cy="30" r="2" />
          <circle cx="86" cy="18" r="1.6" />
          <circle cx="196" cy="34" r="2.2" />
          <circle cx="220" cy="18" r="1.4" />
        </g>
      )}
      <g className={cn(rich && !reducedMotion && "animate-float decorative-motion")}>
        <Landmark biome={scene.biome} accent={accent} />
      </g>
      <path
        d="M0 132 q60 -14 120 0 t120 0 V150 H0z"
        fill="var(--color-surface)"
        opacity="0.92"
      />
      {rich && (
        <g fill={accent} opacity="0.55" aria-hidden>
          <circle cx="30" cy="138" r="4" />
          <circle cx="206" cy="141" r="3" />
        </g>
      )}
    </svg>
  );
}

export function WorldRegionCard({
  scene,
  title,
  status,
  description,
}: {
  scene: WorldScene;
  title: string;
  status: "locked" | "available" | "in-progress" | "complete";
  description: string;
}) {
  const { p, fit } = useAgePresentation();
  const statusCopy: Record<typeof status, string> = {
    locked: "Locked",
    available: "Ready to explore",
    "in-progress": "In progress",
    complete: "Complete",
  };
  return (
    <article
      className={cn(
        "surface-panel interactive overflow-hidden",
        status === "locked" && "opacity-60",
      )}
      aria-disabled={status === "locked"}
    >
      <div className="h-28">
        <WorldIllustration scene={scene} />
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-display text-heading font-semibold">{title}</h3>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {statusCopy[status]}
        </p>
        {p.showSecondaryMeta && (
          <p className="text-sm text-muted-foreground">{fit(description)}</p>
        )}
      </div>
    </article>
  );
}
