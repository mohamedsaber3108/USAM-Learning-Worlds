import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WorldIntro } from "@/components/onboarding/WorldIntro";
import { AvatarBuilder, TextChip } from "@/components/onboarding/AvatarBuilder";
import { DiscoveryConversation } from "@/components/onboarding/DiscoveryConversation";
import { CastIntroduction } from "@/components/onboarding/CastIntroduction";
import { OnboardingComplete } from "@/components/onboarding/OnboardingComplete";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { useAgePresentation } from "@/design/AgePresentationProvider";
import { ACTIVITY_OPTIONS, INTEREST_OPTIONS, THEME_OPTIONS } from "@/data/onboarding";
import { bandForAge } from "@/lib/age";
import { emptyDraft, onboardingKeys, onboardingService } from "@/services/onboarding";
import { cn } from "@/lib/utils";
import type { AvatarConfig, OnboardingDraft, OnboardingStepId } from "@/types/onboarding";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Enter the world — USAM for Kids" },
      {
        name: "description",
        content:
          "Create your character, meet Azouz and the mentor cast, and find your first mission in the USAM learning world.",
      },
      { property: "og:title", content: "Enter the world — USAM for Kids" },
      {
        property: "og:description",
        content: "A character-first arrival: no forms, no registration — a world and a first step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS: { id: OnboardingStepId; label: string }[] = [
  { id: "arrival", label: "Arrival" },
  { id: "age", label: "Your layer" },
  { id: "character", label: "Character" },
  { id: "interests", label: "Interests" },
  { id: "discovery", label: "Discovery" },
  { id: "cast", label: "The cast" },
  { id: "launch", label: "Launch" },
];

function OnboardingPage() {
  const { setBand } = useAgePresentation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<OnboardingDraft>(() => emptyDraft());

  const savedDraft = useQuery({
    queryKey: onboardingKeys.draft,
    queryFn: onboardingService.loadDraft,
  });

  useEffect(() => {
    if (savedDraft.data && !savedDraft.data.completedAt) setDraft(savedDraft.data);
  }, [savedDraft.data]);

  const complete = useMutation({
    mutationFn: () => onboardingService.complete(draft),
    onSuccess: (outcome) => {
      queryClient.setQueryData(onboardingKeys.outcome, outcome);
      setBand(outcome.learnerProfile.ageBand);
    },
  });

  function patch(next: Partial<OnboardingDraft>) {
    setDraft((prev) => {
      const merged = { ...prev, ...next };
      void onboardingService.saveDraft(merged);
      return merged;
    });
  }

  const stepIndex = STEPS.findIndex((s) => s.id === draft.step);
  const step = STEPS[stepIndex]!;

  function go(id: OnboardingStepId) {
    patch({ step: id });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const canContinue = useMemo(() => {
    if (draft.step === "character") return draft.name.trim().length > 0;
    if (draft.step === "age") return draft.age !== null;
    if (draft.step === "interests") return draft.interests.length > 0;
    return true;
  }, [draft]);

  if (complete.data) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <OnboardingComplete outcome={complete.data} />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Onboarding progress">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            aria-current={s.id === draft.step ? "step" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              i < stepIndex && "border-success text-success",
              s.id === draft.step && "border-primary bg-primary/10 text-foreground",
              i > stepIndex && "border-border text-muted-foreground",
            )}
          >
            {s.label}
          </li>
        ))}
      </ol>

      {draft.step === "arrival" && <WorldIntro onEnter={() => go("age")} />}

      {draft.step === "age" && (
        <StepFrame
          title="Which layer of the world fits you?"
          subtitle="This changes how the world looks and talks — not what you're allowed to learn."
        >
          <div className="flex flex-wrap gap-3">
            {[8, 9, 10, 11, 12, 13, 14].map((age) => (
              <TextChip
                key={age}
                active={draft.age === age}
                onClick={() => {
                  const band = bandForAge(age);
                  patch({ age, ageBand: band });
                  setBand(band);
                }}
              >
                {age} years
              </TextChip>
            ))}
          </div>
        </StepFrame>
      )}

      {draft.step === "character" && (
        <StepFrame title="Make your character" subtitle="You can change all of this later.">
          <AvatarBuilder
            name={draft.name}
            nickname={draft.nickname}
            avatar={draft.avatar}
            onName={(name) => patch({ name })}
            onNickname={(nickname) => patch({ nickname })}
            onAvatar={(p: Partial<AvatarConfig>) => patch({ avatar: { ...draft.avatar, ...p } })}
          />
        </StepFrame>
      )}

      {draft.step === "interests" && (
        <StepFrame
          title="What pulls you in?"
          subtitle="Pick as many as you like. This shapes your missions and stories."
        >
          <div className="space-y-6">
            <ChipGroup
              label="Interests"
              options={INTEREST_OPTIONS}
              selected={draft.interests}
              onToggle={(v) => patch({ interests: toggle(draft.interests, v) })}
            />
            <ChipGroup
              label="Favourite worlds"
              options={THEME_OPTIONS}
              selected={draft.favoriteThemes}
              onToggle={(v) => patch({ favoriteThemes: toggle(draft.favoriteThemes, v) })}
            />
            <ChipGroup
              label="Favourite activities"
              options={ACTIVITY_OPTIONS}
              selected={draft.favoriteActivities}
              onToggle={(v) => patch({ favoriteActivities: toggle(draft.favoriteActivities, v) })}
            />
          </div>
        </StepFrame>
      )}

      {draft.step === "discovery" && (
        <StepFrame
          title="A short discovery adventure"
          subtitle="Just a conversation. Nothing here is a test."
        >
          <DiscoveryConversation
            discovery={draft.discovery}
            onAnswer={(prompt, value) =>
              patch({ discovery: { ...draft.discovery, [prompt.signal]: [value] } })
            }
            onFinished={() => go("cast")}
          />
        </StepFrame>
      )}

      {draft.step === "cast" && (
        <StepFrame title="The people you'll keep meeting" subtitle="Tap anyone to say hello.">
          <CastIntroduction
            metIds={draft.metCharacterIds}
            onMeet={(member) =>
              patch({ metCharacterIds: toggle(draft.metCharacterIds, member.id) })
            }
          />
        </StepFrame>
      )}

      {draft.step === "launch" && (
        <StepFrame
          title="Ready to step in"
          subtitle="Azouz is building your world, your first mission and your map."
        >
          <div className="surface-panel flex flex-col items-center gap-4 p-10 text-center">
            <CharacterPortrait
              character={{ id: "ch-azouz", name: "Azouz" }}
              expression={complete.isPending ? "thinking" : "excited"}
            />
            <p className="max-w-md text-muted-foreground">
              {complete.isPending
                ? "Placing your first island…"
                : `Everything is based on what you told us, ${draft.nickname || draft.name || "explorer"}.`}
            </p>
            <button
              type="button"
              disabled={complete.isPending}
              onClick={() => complete.mutate()}
              className="interactive inline-flex min-h-12 items-center rounded-full bg-primary px-8 font-medium text-primary-foreground disabled:opacity-60"
            >
              {complete.isPending ? "Opening the world" : "Enter the world"}
            </button>
          </div>
        </StepFrame>
      )}

      {draft.step !== "arrival" && draft.step !== "launch" && (
        <nav className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => go(STEPS[Math.max(0, stepIndex - 1)]!.id)}
            className="interactive inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-5 text-sm"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void onboardingService.reset();
                navigate({ to: "/" });
              }}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Not now
            </button>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => go(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)]!.id)}
              className="interactive inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground disabled:opacity-50"
            >
              Continue
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </button>
          </div>
        </nav>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Step {stepIndex + 1} of {STEPS.length} — {step.label}. We only ask what helps us teach you
        well: no address, no school, no phone number.
      </p>
    </main>
  );
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function StepFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-display font-semibold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <TextChip key={o} active={selected.includes(o)} onClick={() => onToggle(o)}>
            {o}
          </TextChip>
        ))}
      </div>
    </fieldset>
  );
}
