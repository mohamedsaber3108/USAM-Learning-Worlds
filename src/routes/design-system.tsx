import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Compass,
  Loader2,
  Palette,
  Sparkles,
  Type as TypeIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AGE_MODE_ORDER, AGE_PRESENTATIONS } from "@/design/age-presentation";
import { LOCALES, useAgePresentation } from "@/design/AgePresentationProvider";
import { CHARACTER_EXPRESSIONS, EXPRESSION_ORDER } from "@/design/character";
import { MOTION_PRESETS, TOKEN_GROUPS } from "@/design/tokens";
import { CharacterPortrait, CharacterPresence } from "@/components/character/CharacterPortrait";
import { DialogueBubble, SuggestionChips, TypingIndicator } from "@/components/ai/Dialogue";
import { VoiceOrb, VoiceStatusBar } from "@/components/voice/VoiceOrb";
import {
  MasteryLadder,
  MissionTrack,
  ProgressRing,
  SkillConstellation,
} from "@/components/viz/Progress";
import { WorldIllustration, WorldRegionCard, type Biome } from "@/components/world/WorldIllustration";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/domain";

export const Route = createFileRoute("/design-system")({
  component: DesignSystemPage,
  head: () => ({
    meta: [
      { title: "Design System — USAM for Kids" },
      {
        name: "description",
        content:
          "The USAM for Kids design system: age-adaptive tokens, character expressions, world illustration, progress visualisation and voice UI.",
      },
      { property: "og:title", content: "Design System — USAM for Kids" },
      {
        property: "og:description",
        content:
          "Internal documentation of every component, state and age mode in the USAM for Kids learning platform.",
      },
    ],
  }),
});

const AZOUZ = { id: "azouz", name: "Azouz", accentColor: "var(--color-primary)" };
const MENTORS = [
  { id: "lina", name: "Lina", accentColor: "var(--color-secondary)", role: "English Coach" },
  { id: "kaz", name: "Kaz", accentColor: "var(--color-primary)", role: "Coding Mentor" },
  { id: "nia", name: "Nia", accentColor: "var(--color-accent)", role: "Creativity Mentor" },
];

const BIOMES: { biome: Biome; label: string }[] = [
  { biome: "isles", label: "Language Isles" },
  { biome: "forest", label: "Logic Forest" },
  { biome: "city", label: "Builder City" },
  { biome: "orbit", label: "AI Orbit" },
  { biome: "desert", label: "Idea Desert" },
  { biome: "reef", label: "Story Reef" },
];

function DesignSystemPage() {
  const { p, band, setBand, locale, setLocale, dir, reducedMotion } = useAgePresentation();
  const [voice, setVoice] = useState<VoiceState>("idle");

  return (
    <div className="space-y-12 pb-16">
      <header className="surface-panel aurora-bg space-y-4 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Internal documentation
        </p>
        <h1 className={p.titleClass}>Design system</h1>
        <p className="max-w-3xl text-muted-foreground">
          One premium system, three age presentations. Every surface below is live — switch the
          mode or the locale and watch typography, density, motion, colour saturation and
          gamification visibility adapt without a single component branching on age.
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <fieldset className="flex flex-wrap items-center gap-2">
            <legend className="sr-only">Age presentation mode</legend>
            {AGE_MODE_ORDER.map((b) => {
              const mode = AGE_PRESENTATIONS[b];
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBand(b)}
                  aria-pressed={band === b}
                  className={cn(
                    "interactive min-h-11 rounded-full border px-4 text-sm font-medium",
                    band === b
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface-raised",
                  )}
                >
                  {mode.modeLabel} · {mode.name} {mode.ages}
                </button>
              );
            })}
          </fieldset>

          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Locale</legend>
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLocale(l.id)}
                aria-pressed={locale === l.id}
                className={cn(
                  "interactive min-h-11 rounded-full border px-4 text-sm",
                  locale === l.id
                    ? "border-secondary bg-secondary text-secondary-foreground"
                    : "border-border bg-surface-raised",
                )}
              >
                {l.label}
              </button>
            ))}
            <span className="text-xs text-muted-foreground">dir={dir}</span>
          </fieldset>
        </div>

        <dl className="grid gap-3 pt-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Mode", `${p.modeLabel} — ${p.name}`],
            ["Density", p.cardDensity],
            ["Motion", `${p.animationIntensity} ×${p.motionMultiplier}`],
            ["Gamification", p.gamificationVisibility],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[var(--radius)] border border-border p-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
              <dd className="font-medium capitalize">{v}</dd>
            </div>
          ))}
        </dl>
        {reducedMotion && (
          <p className="text-xs text-warning">
            Reduced motion is on — all decorative animation is suppressed.
          </p>
        )}
      </header>

      {/* ------------------------------ age modes ---------------------------- */}
      <Section
        id="age-modes"
        title="Age-adaptive presentation"
        blurb="The AgePresentationProvider is the only place age is decided. Components read named knobs — never an age number."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {AGE_MODE_ORDER.map((b) => {
            const m = AGE_PRESENTATIONS[b];
            return (
              <article
                key={b}
                className={cn(
                  "surface-panel space-y-3 p-5",
                  band === b && "elevation-glow border-primary",
                )}
              >
                <p className="text-xs uppercase tracking-wide text-primary">{m.modeLabel}</p>
                <h3 className="font-display text-heading font-semibold">
                  {m.name} · {m.ages}
                </h3>
                <p className="text-sm text-muted-foreground">{m.summary}</p>
                <dl className="space-y-1 text-xs text-muted-foreground">
                  {(
                    [
                      ["Typography", m.titleClass.includes("5xl") ? "Large display" : "Tight display"],
                      ["Illustration", m.illustrationDensity],
                      ["Character", m.characterPresentation],
                      ["Navigation", `${m.navComplexity} (${m.maxPrimaryNavItems} primary)`],
                      ["Interaction", m.interactionComplexity],
                      ["Copy budget", `${m.copyBudget} chars`],
                      ["Coding surface", m.codingSurface],
                      ["Cards / row", String(m.cardColumns)],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt>{k}</dt>
                      <dd className="text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </Section>

      {/* -------------------------------- tokens ----------------------------- */}
      <Section
        id="tokens"
        title="Design tokens"
        blurb="Colour, typography, spacing, motion and elevation live in CSS custom properties so themes, age modes and locales re-map them safely."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {TOKEN_GROUPS.map((group) => (
            <article key={group.id} className="surface-panel space-y-3 p-5">
              <h3 className="flex items-center gap-2 font-display text-heading font-semibold">
                <Icon as={group.id === "color" ? Palette : TypeIcon} size="sm" />
                {group.title}
              </h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              {group.id === "color" && (
                <div className="flex flex-wrap gap-2">
                  {group.tokens.map((t) => (
                    <span
                      key={t.name}
                      title={`${t.name} — ${t.description}`}
                      className="size-9 rounded-lg border border-border"
                      style={{ background: `var(${t.name})` }}
                    />
                  ))}
                </div>
              )}
              <ul className="divide-y divide-border text-sm">
                {group.tokens.map((t) => (
                  <li key={t.name} className="grid gap-1 py-2 sm:grid-cols-[1fr_auto]">
                    <code className="text-xs text-primary">{t.name}</code>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      {/* ------------------------------ typography --------------------------- */}
      <Section
        id="typography"
        title="Typography"
        blurb="Outfit for display, Figtree for reading. The whole scale shifts per mode, and Arabic swaps the face while keeping the rhythm."
      >
        <div className="surface-panel space-y-4 p-6">
          <p style={{ fontSize: "var(--type-display-1)" }} className="font-display font-bold">
            Learning feels like a world
          </p>
          <p style={{ fontSize: "var(--type-display-2)" }} className="font-display font-semibold">
            Missions, mastery and making
          </p>
          <p style={{ fontSize: "var(--type-heading)" }} className="font-display font-semibold">
            Section heading
          </p>
          <p style={{ fontSize: "var(--type-body-lg)" }}>
            Body copy adapts in length as well as size — the provider trims to the mode's copy
            budget so translated strings never break a card.
          </p>
          <p className="text-sm text-muted-foreground">Secondary and metadata copy.</p>
        </div>
      </Section>

      {/* ------------------------------- surfaces ---------------------------- */}
      <Section
        id="elevation"
        title="Elevation & surfaces"
        blurb="Four depth steps plus a glow reserved for live AI and active missions."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {["elevation-1", "elevation-2", "elevation-3", "elevation-glow", ""].map((e, i) => (
            <div
              key={e || "flat"}
              className={cn(
                "rounded-[var(--radius)] border border-border bg-surface p-5 text-sm",
                e,
              )}
            >
              {e || "elevation-0"}
              <p className="mt-1 text-xs text-muted-foreground">
                {["Rows", "Panels", "Overlays", "Live AI", "Flat"][i]}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------ interaction -------------------------- */}
      <Section
        id="interaction"
        title="Interaction states"
        blurb="Hover, active, focus-visible and disabled are one shared utility, so every pressable thing feels identical. Tap targets never go below 44px."
      >
        <div className="surface-panel flex flex-wrap items-center gap-3 p-6">
          <Button className="min-h-11">Primary</Button>
          <Button variant="secondary" className="min-h-11">
            Secondary
          </Button>
          <Button variant="outline" className="min-h-11">
            Outline
          </Button>
          <Button variant="ghost" className="min-h-11">
            Ghost
          </Button>
          <Button className="min-h-11" disabled>
            Disabled
          </Button>
          <Button className="min-h-11 gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Working
          </Button>
          <Button size="icon" aria-label="Continue" className="min-h-11 min-w-11">
            <Icon as={ArrowRight} size="sm" directional />
          </Button>
          <div className="w-full max-w-xs">
            <label htmlFor="ds-input" className="mb-1 block text-sm">
              Input
            </label>
            <Input id="ds-input" placeholder="Type something…" className="min-h-11" />
          </div>
        </div>
      </Section>

      {/* ------------------------------ iconography -------------------------- */}
      <Section
        id="icons"
        title="Iconography"
        blurb="Lucide, five sizes, stroke weight tuned per age mode. Directional icons mirror in RTL automatically."
      >
        <div className="surface-panel flex flex-wrap items-end gap-6 p-6">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
              <Icon as={Compass} size={s} className="text-primary" />
              {s}
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <Icon as={ArrowRight} size="lg" directional className="text-secondary" />
            directional
          </div>
        </div>
      </Section>

      {/* ------------------------------- motion ------------------------------ */}
      <Section
        id="motion"
        title="Motion"
        blurb="Motion always encodes state or progress. Intensity scales with the age mode and is fully suppressed under prefers-reduced-motion."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {Object.entries(MOTION_PRESETS).map(([name, cls]) => (
            <div key={name} className="surface-panel grid place-items-center gap-2 p-5 text-xs">
              <span className={cn("size-8 rounded-full bg-primary", !reducedMotion && cls)} />
              {name}
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------ characters --------------------------- */}
      <Section
        id="characters"
        title="Character system"
        blurb="Characters are recurring personalities with a shared expression contract: avatar, bust and full body all read the same state, and future illustrated or rigged assets slot in without component changes."
      >
        <div className="space-y-6">
          <div className="surface-panel grid gap-6 p-6 sm:grid-cols-3">
            {(["avatar", "bust", "full-body"] as const).map((pres) => (
              <div key={pres} className="grid place-items-center gap-2">
                <CharacterPortrait character={AZOUZ} presentation={pres} expression="encouraging" />
                <span className="text-xs text-muted-foreground">{pres}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
            {EXPRESSION_ORDER.map((ex) => (
              <div key={ex} className="surface-panel grid place-items-center gap-2 p-4 text-center">
                <CharacterPortrait character={AZOUZ} expression={ex} presentation="avatar" />
                <span className="text-xs font-medium">{CHARACTER_EXPRESSIONS[ex].label}</span>
                <span className="text-[11px] leading-tight text-muted-foreground">
                  {CHARACTER_EXPRESSIONS[ex].meaning}
                </span>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {MENTORS.map((m) => (
              <CharacterPresence
                key={m.id}
                character={m}
                role={m.role}
                expression="speaking"
                utterance="Let's look at that last step together — I think you're closer than you feel."
              />
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------- world ----------------------------- */}
      <Section
        id="world"
        title="World illustration"
        blurb="Regions are places built from one primitive language — sky wash, horizon, landmark, foreground. Illustration density follows the age mode."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BIOMES.map((b, i) => (
            <WorldRegionCard
              key={b.biome}
              scene={{ biome: b.biome, accent: "", label: b.label }}
              title={b.label}
              status={(["complete", "in-progress", "available", "available", "locked", "locked"] as const)[i]!}
              description="A region of the learning world where a family of skills lives and grows."
            />
          ))}
        </div>
        <div className="mt-4 h-40 overflow-hidden rounded-[var(--radius)] border border-border">
          <WorldIllustration scene={{ biome: "orbit", accent: "", label: "AI Orbit" }} />
        </div>
      </Section>

      {/* ------------------------------- progress ---------------------------- */}
      <Section
        id="progress"
        title="Progress, skills & missions"
        blurb="Progress reads as confidence and evidence, not points. Every visual carries a text equivalent."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-panel flex flex-wrap items-center justify-around gap-4 p-6">
            <ProgressRing value={0.72} label="Mission progress" caption="Mission" />
            <ProgressRing value={0.34} label="Domain mastery" caption="Mastery" tone="secondary" />
            <ProgressRing value={1} label="Weekly goal" caption="Goal" tone="success" />
          </div>
          <div className="surface-panel space-y-5 p-6">
            <MasteryLadder skill="Asking clarifying questions" level={3} evidenceCount={4} />
            <MasteryLadder skill="Loops and repetition" level={2} evidenceCount={2} />
            <MasteryLadder skill="Prompting an AI safely" level={4} evidenceCount={6} />
          </div>
          <SkillConstellation
            title="Coding foundations"
            nodes={[
              { id: "s1", name: "Sequence", level: 4, x: 40, y: 40 },
              { id: "s2", name: "Loops", level: 3, x: 110, y: 26, requires: ["s1"] },
              { id: "s3", name: "Conditions", level: 2, x: 108, y: 92, requires: ["s1"] },
              { id: "s4", name: "Functions", level: 0, x: 190, y: 58, requires: ["s2", "s3"] },
            ]}
          />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <MissionTrack
            title="Mission — Build a weather bot"
            steps={[
              { id: "1", title: "Meet the problem", state: "complete", kind: "learn" },
              { id: "2", title: "Practise conditions", state: "complete", kind: "practice" },
              { id: "3", title: "Build your bot", state: "current", kind: "build" },
              { id: "4", title: "Explain your thinking", state: "locked", kind: "reflect" },
            ]}
          />
          <div className="surface-panel space-y-3 p-6">
            <h3 className="font-display text-heading font-semibold">Gamification visibility</h3>
            <p className="text-sm text-muted-foreground">
              Rewards support learning — they never drive it. Mode C hides streaks and points
              entirely in favour of evidence.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Icon as={Check} size="sm" className="text-success" /> Evidence and mastery: always
                visible
              </li>
              <li className="flex items-center gap-2">
                <Icon as={Sparkles} size="sm" className="text-primary" /> Streaks:{" "}
                {p.showStreaks ? "shown" : "hidden"} in {p.name}
              </li>
              <li className="flex items-center gap-2">
                <Icon as={Sparkles} size="sm" className="text-accent" /> Points:{" "}
                {p.showPoints ? "shown" : "hidden"} in {p.name}
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------- dialogue ---------------------------- */}
      <Section
        id="dialogue"
        title="AI dialogue"
        blurb="The learner can always tell what kind of thing the companion said: chat, hint, explanation, reflection or safety notice."
      >
        <div className="surface-panel space-y-3 p-6">
          <DialogueBubble author="companion">
            Ready to keep building your weather bot?
          </DialogueBubble>
          <DialogueBubble author="learner">I'm stuck on the if-block.</DialogueBubble>
          <DialogueBubble author="companion" kind="hint">
            Try reading your condition out loud as a sentence — what should happen when it's true?
          </DialogueBubble>
          <DialogueBubble author="companion" kind="explanation">
            A condition is a question the program asks. If the answer is yes, it runs the block
            inside.
          </DialogueBubble>
          <DialogueBubble author="companion" kind="reflection-prompt">
            What was the trickiest part of this step, and how did you get past it?
          </DialogueBubble>
          <DialogueBubble author="companion" kind="safety-notice">
            Let's keep personal details out of chat — I'll help without them.
          </DialogueBubble>
          <TypingIndicator />
          <SuggestionChips
            suggestions={["Show me an example", "Give me a smaller hint", "I want to try again", "Explain it differently"]}
          />
        </div>
      </Section>

      {/* --------------------------------- voice ----------------------------- */}
      <Section
        id="voice"
        title="Voice interaction"
        blurb="Presentational only — a future voice service drives exactly these states, so the visuals never change."
      >
        <div className="surface-panel space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-8">
            {(["idle", "listening", "thinking", "speaking", "error"] as VoiceState[]).map((s) => (
              <div key={s} className="grid place-items-center gap-2">
                <VoiceOrb state={s} size={96} onToggle={() => setVoice(s)} />
                <span className="text-xs text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
          <VoiceStatusBar
            state={voice}
            transcript={voice === "listening" ? "I think the loop runs three times" : null}
            onSetState={setVoice}
          />
        </div>
      </Section>

      {/* ------------------------------ localization ------------------------- */}
      <Section
        id="localization"
        title="Localization & RTL"
        blurb="Layouts use logical properties and flex/grid rather than fixed sides, directional icons mirror, and copy budgets absorb longer translations. Switch to العربية above to flip the whole system."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="surface-panel space-y-2 p-5">
            <h3 className="font-display text-heading font-semibold">Continue your mission</h3>
            <p className="text-sm text-muted-foreground">
              Short English string alongside a longer translated equivalent.
            </p>
            <Button className="min-h-11 gap-2">
              Continue <Icon as={ArrowRight} size="sm" directional />
            </Button>
          </div>
          <div className="surface-panel space-y-2 p-5" dir="rtl" lang="ar">
            <h3 className="font-display text-heading font-semibold">واصل مهمتك</h3>
            <p className="text-sm text-muted-foreground">
              نص عربي أطول لاختبار الاتجاه والمسافات وطول المحتوى داخل نفس المكوّن.
            </p>
            <Button className="min-h-11 gap-2">
              متابعة <Icon as={ArrowRight} size="sm" directional />
            </Button>
          </div>
        </div>
      </Section>

      {/* --------------------------- accessibility --------------------------- */}
      <Section
        id="accessibility"
        title="Accessibility"
        blurb="Non-negotiable baseline for a children's product."
      >
        <ul className="surface-panel grid gap-3 p-6 text-sm sm:grid-cols-2">
          {[
            "Semantic tokens guarantee AA contrast in every age mode.",
            "Focus is always visible — a 3px ring, never removed.",
            "Interactive targets are at least 44×44px.",
            "Every state has a text equivalent for screen readers.",
            "Animation respects prefers-reduced-motion completely.",
            "Live AI states announce through aria-live regions.",
            "Colour is never the only carrier of meaning.",
            "Copy budgets keep instructions readable at every age.",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <Icon as={Check} size="sm" className="mt-0.5 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  blurb,
  children,
}: {
  id: string;
  title: string;
  blurb: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="space-y-4 scroll-mt-24">
      <div className="max-w-3xl">
        <h2 id={`${id}-title`} className="font-display text-2xl font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </section>
  );
}
