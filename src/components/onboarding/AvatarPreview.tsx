import { cn } from "@/lib/utils";
import type { AvatarConfig } from "@/types/onboarding";

/**
 * Procedural learner avatar.
 *
 * Asset-free by design: every combination the child picks renders immediately,
 * and swapping in illustrated art later only changes this one file.
 */
export function AvatarPreview({
  config,
  size = 128,
  className,
}: {
  config: AvatarConfig;
  size?: number;
  className?: string;
}) {
  const { faceShape, skinTone, hairStyle, hairColor, clothing, primaryColor, secondaryColor, accessory } =
    config;

  const faceRx = faceShape === "oval" ? 26 : faceShape === "square" ? 28 : 30;
  const faceRy = faceShape === "oval" ? 32 : faceShape === "heart" ? 29 : 30;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Your character"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#av-bg)" />

      {/* shoulders / clothing */}
      <ClothingShape clothing={clothing} primary={primaryColor} secondary={secondaryColor} />

      {/* neck */}
      <rect x="52" y="70" width="16" height="14" rx="7" fill={skinTone} />

      {/* face */}
      <ellipse cx="60" cy="52" rx={faceRx} ry={faceRy} fill={skinTone} />

      {/* hair */}
      <HairShape style={hairStyle} color={hairColor} />

      {/* eyes + smile */}
      <g fill="#241a14">
        <circle cx="50" cy="52" r="3.2" />
        <circle cx="70" cy="52" r="3.2" />
      </g>
      <path
        d="M50 63 q10 8 20 0"
        fill="none"
        stroke="#241a14"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      <AccessoryShape accessory={accessory} accent={secondaryColor} />
    </svg>
  );
}

function ClothingShape({
  clothing,
  primary,
  secondary,
}: {
  clothing: AvatarConfig["clothing"];
  primary: string;
  secondary: string;
}) {
  const body = <path d="M24 120 q0 -32 36 -32 t36 32z" fill={primary} />;
  switch (clothing) {
    case "hoodie":
      return (
        <g>
          {body}
          <path d="M44 90 q16 14 32 0" fill="none" stroke={secondary} strokeWidth="4" />
          <rect x="57" y="92" width="6" height="24" rx="3" fill={secondary} />
        </g>
      );
    case "labcoat":
      return (
        <g>
          {body}
          <path d="M60 88 V120" stroke={secondary} strokeWidth="4" />
          <circle cx="74" cy="102" r="3" fill={secondary} />
        </g>
      );
    case "jacket":
      return (
        <g>
          {body}
          <path d="M48 90 L60 106 L72 90" fill="none" stroke={secondary} strokeWidth="4" />
        </g>
      );
    case "tunic":
      return (
        <g>
          {body}
          <path d="M34 108 h52" stroke={secondary} strokeWidth="5" />
        </g>
      );
    case "jumpsuit":
      return (
        <g>
          {body}
          <rect x="40" y="96" width="40" height="6" rx="3" fill={secondary} />
        </g>
      );
    default:
      return (
        <g>
          {body}
          <path d="M40 96 L80 108" stroke={secondary} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
  }
}

function HairShape({ style, color }: { style: AvatarConfig["hairStyle"]; color: string }) {
  switch (style) {
    case "buzz":
      return <path d="M30 46 q30 -32 60 0 q-30 -14 -60 0z" fill={color} />;
    case "waves":
      return <path d="M28 46 q8 -30 32 -30 t32 30 q-16 -12 -32 -8 t-32 8z" fill={color} />;
    case "afro":
      return <circle cx="60" cy="34" r="30" fill={color} />;
    case "braids":
      return (
        <g fill={color}>
          <path d="M28 44 q32 -34 64 0 q-32 -16 -64 0z" />
          <rect x="24" y="40" width="8" height="38" rx="4" />
          <rect x="88" y="40" width="8" height="38" rx="4" />
        </g>
      );
    case "ponytail":
      return (
        <g fill={color}>
          <path d="M28 46 q32 -34 64 0 q-32 -18 -64 0z" />
          <path d="M90 44 q16 16 6 40 q-4 -22 -14 -30z" />
        </g>
      );
    case "locs":
      return (
        <g fill={color}>
          <path d="M28 44 q32 -34 64 0 q-32 -16 -64 0z" />
          {[32, 42, 78, 88].map((x) => (
            <rect key={x} x={x} y="38" width="6" height="34" rx="3" />
          ))}
        </g>
      );
    case "hijab":
      return (
        <path
          d="M26 56 q0 -40 34 -40 t34 40 q0 26 -12 34 q6 -30 -22 -30 t-22 30 q-12 -8 -12 -34z"
          fill={color}
        />
      );
    default:
      return (
        <g fill={color}>
          <path d="M28 46 q32 -36 64 0 q-32 -14 -64 0z" />
          <circle cx="34" cy="42" r="8" />
          <circle cx="86" cy="42" r="8" />
          <circle cx="60" cy="24" r="12" />
        </g>
      );
  }
}

function AccessoryShape({
  accessory,
  accent,
}: {
  accessory: AvatarConfig["accessory"];
  accent: string;
}) {
  switch (accessory) {
    case "glasses":
      return (
        <g fill="none" stroke={accent} strokeWidth="2.6">
          <circle cx="50" cy="52" r="8" />
          <circle cx="70" cy="52" r="8" />
          <path d="M58 52 h4" />
        </g>
      );
    case "headset":
      return (
        <g fill={accent}>
          <path d="M30 50 q30 -34 60 0" fill="none" stroke={accent} strokeWidth="4" />
          <rect x="24" y="46" width="10" height="16" rx="5" />
          <rect x="86" y="46" width="10" height="16" rx="5" />
        </g>
      );
    case "cap":
      return (
        <g fill={accent}>
          <path d="M30 38 q30 -30 60 0z" />
          <rect x="86" y="34" width="18" height="6" rx="3" />
        </g>
      );
    case "scarf":
      return <path d="M40 86 q20 12 40 0 v8 q-20 12 -40 0z" fill={accent} />;
    case "visor":
      return <rect x="34" y="44" width="52" height="12" rx="6" fill={accent} opacity="0.75" />;
    case "badge":
      return <circle cx="80" cy="102" r="6" fill={accent} />;
    default:
      return null;
  }
}
