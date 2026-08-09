import { useAgePresentation } from "@/design/AgePresentationProvider";
import { AvatarPreview } from "@/components/onboarding/AvatarPreview";
import {
  ACCESSORIES,
  CLOTHING_STYLES,
  FACE_SHAPES,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFIT_COLORS,
  SKIN_TONES,
} from "@/data/onboarding";
import { cn } from "@/lib/utils";
import type { AvatarConfig } from "@/types/onboarding";

/**
 * Character creation.
 *
 * Deliberately reads as "make a character", not "create a profile": no email,
 * no birthdate, no last name. Nickname is what the world calls you.
 */
export function AvatarBuilder({
  name,
  nickname,
  avatar,
  onName,
  onNickname,
  onAvatar,
}: {
  name: string;
  nickname: string;
  avatar: AvatarConfig;
  onName: (value: string) => void;
  onNickname: (value: string) => void;
  onAvatar: (patch: Partial<AvatarConfig>) => void;
}) {
  const { p } = useAgePresentation();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="surface-panel flex flex-col items-center gap-4 p-6 text-center">
        <AvatarPreview config={avatar} size={p.mode === "explorer" ? 176 : 148} />
        <div className="w-full space-y-3 text-start">
          <label className="block space-y-1">
            <span className="text-sm font-medium">Character name</span>
            <input
              value={name}
              onChange={(e) => onName(e.target.value)}
              maxLength={24}
              placeholder="e.g. Yara"
              className="min-h-11 w-full rounded-[var(--radius)] border border-border bg-surface-raised px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Nickname</span>
            <input
              value={nickname}
              onChange={(e) => onNickname(e.target.value)}
              maxLength={16}
              placeholder="What should we call you?"
              className="min-h-11 w-full rounded-[var(--radius)] border border-border bg-surface-raised px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Use any name you like. We never ask for your real full name, address or school.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <OptionRow label="Face">
          {FACE_SHAPES.map((f) => (
            <TextChip
              key={f.id}
              active={avatar.faceShape === f.id}
              onClick={() => onAvatar({ faceShape: f.id })}
            >
              {f.label}
            </TextChip>
          ))}
        </OptionRow>

        <OptionRow label="Skin tone">
          {SKIN_TONES.map((s) => (
            <Swatch
              key={s.id}
              color={s.value}
              label={s.label}
              active={avatar.skinTone === s.value}
              onClick={() => onAvatar({ skinTone: s.value })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Hair">
          {HAIR_STYLES.map((h) => (
            <TextChip
              key={h.id}
              active={avatar.hairStyle === h.id}
              onClick={() => onAvatar({ hairStyle: h.id })}
            >
              {h.label}
            </TextChip>
          ))}
        </OptionRow>

        <OptionRow label="Hair colour">
          {HAIR_COLORS.map((h) => (
            <Swatch
              key={h.id}
              color={h.value}
              label={h.label}
              active={avatar.hairColor === h.value}
              onClick={() => onAvatar({ hairColor: h.value })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Clothing">
          {CLOTHING_STYLES.map((c) => (
            <TextChip
              key={c.id}
              active={avatar.clothing === c.id}
              onClick={() => onAvatar({ clothing: c.id })}
            >
              {c.label}
            </TextChip>
          ))}
        </OptionRow>

        <OptionRow label="Main colour">
          {OUTFIT_COLORS.map((c) => (
            <Swatch
              key={c.id}
              color={c.value}
              label={c.label}
              active={avatar.primaryColor === c.value}
              onClick={() => onAvatar({ primaryColor: c.value })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Second colour">
          {OUTFIT_COLORS.map((c) => (
            <Swatch
              key={`s-${c.id}`}
              color={c.value}
              label={c.label}
              active={avatar.secondaryColor === c.value}
              onClick={() => onAvatar({ secondaryColor: c.value })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Accessory">
          {ACCESSORIES.map((a) => (
            <TextChip
              key={a.id}
              active={avatar.accessory === a.id}
              onClick={() => onAvatar({ accessory: a.id })}
            >
              {a.label}
            </TextChip>
          ))}
        </OptionRow>
      </div>
    </div>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function TextChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "interactive min-h-11 rounded-full border px-4 text-sm",
        active
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border bg-surface-raised text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Swatch({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "interactive size-11 rounded-full border-2",
        active ? "border-primary" : "border-border",
      )}
      style={{ background: color }}
    />
  );
}
