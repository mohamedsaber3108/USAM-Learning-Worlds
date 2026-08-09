import { useMemo, useState } from "react";
import { Lightbulb, Mic, Send, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CharacterAvatar } from "@/components/character/CharacterAvatar";
import { useExperience } from "@/state/experience";
import type { Character } from "@/types/domain";
import type {
  ActivityResponse,
  ActivityResult,
  MissionActivity,
  MissionActivityKind,
} from "@/types/mission";
import { effortMet } from "@/services/mission";
import { cn } from "@/lib/utils";

/**
 * Presentation metadata for every supported activity kind.
 *
 * The renderer is chosen from `surface`, so a new kind only needs a row here —
 * the mission engine, evidence contract and grading path stay untouched.
 */
export const ACTIVITY_KIND_META: Record<
  MissionActivityKind,
  { label: string; doing: string }
> = {
  "multiple-choice": { label: "Choose", doing: "Pick and be ready to say why" },
  "short-answer": { label: "Short answer", doing: "A few sentences" },
  "free-response": { label: "Free response", doing: "As long as it needs to be" },
  matching: { label: "Matching", doing: "Pair them up" },
  sorting: { label: "Sorting", doing: "Put each one where it belongs" },
  "drag-drop": { label: "Drag & drop", doing: "Move things into place" },
  simulation: { label: "Simulation", doing: "Change something and watch" },
  conversation: { label: "Conversation", doing: "Talk it through" },
  "voice-response": { label: "Voice", doing: "Say it out loud" },
  reading: { label: "Reading", doing: "Read closely" },
  listening: { label: "Listening", doing: "Listen, then answer" },
  writing: { label: "Writing", doing: "Write it properly" },
  coding: { label: "Coding", doing: "Make it run" },
  debugging: { label: "Debugging", doing: "Find out why, not just fix" },
  "creative-creation": { label: "Create", doing: "Make something that stays" },
  design: { label: "Design", doing: "Design it for someone" },
  drawing: { label: "Drawing", doing: "Draw your thinking" },
  research: { label: "Research", doing: "Find out and check" },
  "decision-making": { label: "Decision", doing: "Decide and defend it" },
  "role-play": { label: "Role play", doing: "Be someone else for a bit" },
  "business-simulation": { label: "Venture sim", doing: "Run it and see" },
  "project-building": { label: "Project", doing: "Build the real thing" },
  reflection: { label: "Reflection", doing: "Look back honestly" },
};

export function ActivityRunner({
  activity,
  characters,
  result,
  submitting,
  onSubmit,
}: {
  activity: MissionActivity;
  characters: Character[];
  result: ActivityResult | null;
  submitting: boolean;
  onSubmit: (response: ActivityResponse) => void;
}) {
  const { ageBand, setVoiceState, voiceState } = useExperience();
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [hintsOpen, setHintsOpen] = useState(0);
  const startedAt = useMemo(() => Date.now(), [activity.id]);

  const character = characters.find((c) => c.id === activity.characterId);
  const meta = ACTIVITY_KIND_META[activity.kind];

  const response: ActivityResponse = {
    activityId: activity.id,
    hintsUsed: hintsOpen,
    secondsSpent: Math.round((Date.now() - startedAt) / 1000),
    ...(text ? { text } : {}),
    ...(selected.length ? { selectedOptionIds: selected } : {}),
    ...(Object.keys(placements).length ? { placements } : {}),
  };
  const ready = effortMet(activity, response);

  return (
    <article className="surface-panel space-y-5 p-5">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary">
            {meta.label}
          </span>
          <span className="text-muted-foreground">{meta.doing}</span>
          <span className="text-muted-foreground">· about {activity.estimatedMinutes} min</span>
          {activity.voiceSupported && <span className="text-secondary">Voice available</span>}
        </div>
        <h3 className="font-display text-xl font-semibold">{activity.title}</h3>
        <p className="text-sm italic text-muted-foreground">{activity.storyBeat}</p>
        <p className="text-sm">{activity.framingByBand[ageBand]}</p>
      </header>

      <div className="rounded-xl bg-surface p-4">
        <p className="text-sm font-medium">{activity.prompt}</p>

        {activity.successCriteria && activity.successCriteria.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {activity.successCriteria.map((c) => (
              <li key={c}>· {c}</li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          {activity.options?.length ? (
            <OptionPicker
              options={activity.options}
              selected={selected}
              onToggle={(id) =>
                setSelected((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              revealed={Boolean(result)}
            />
          ) : activity.items?.length && activity.buckets?.length ? (
            <BucketSorter
              items={activity.items}
              buckets={activity.buckets}
              placements={placements}
              onPlace={(itemId, bucketId) =>
                setPlacements((prev) => ({ ...prev, [itemId]: bucketId }))
              }
            />
          ) : (
            <WorkSurface
              activity={activity}
              value={text}
              onChange={setText}
              voiceActive={voiceState === "listening"}
              onVoiceToggle={() =>
                setVoiceState(voiceState === "listening" ? "idle" : "listening")
              }
            />
          )}
        </div>
      </div>

      {activity.hints.length > 0 && (
        <HintLadder
          activity={activity}
          characters={characters}
          opened={hintsOpen}
          onOpen={() => setHintsOpen((n) => Math.min(n + 1, activity.hints.length))}
        />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {ready
            ? "Enough here to look at."
            : "Not enough yet — finishing this is what makes it count."}
        </p>
        <Button onClick={() => onSubmit(response)} disabled={!ready || submitting}>
          <Send className="size-4" aria-hidden />
          {submitting ? "Sending…" : "Send to " + (character?.name ?? "your guide")}
        </Button>
      </footer>

      {result && <ActivityFeedback result={result} characters={characters} />}
    </article>
  );
}

/* ------------------------------------------------------------- surfaces ---- */

function WorkSurface({
  activity,
  value,
  onChange,
  voiceActive,
  onVoiceToggle,
}: {
  activity: MissionActivity;
  value: string;
  onChange: (v: string) => void;
  voiceActive: boolean;
  onVoiceToggle: () => void;
}) {
  const code = activity.surface === "build" && Boolean(activity.starter);
  const placeholder =
    activity.surface === "speak"
      ? "Say it out loud — a transcript appears here."
      : activity.surface === "converse"
        ? "Talk to your guide…"
        : code
          ? "Edit the program…"
          : "Write your answer…";

  return (
    <div className="space-y-3">
      {activity.starter && (
        <pre className="overflow-x-auto rounded-lg bg-surface-raised p-3 font-mono text-xs text-muted-foreground">
          {activity.starter}
        </pre>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={code ? 8 : 5}
        className={cn(code && "font-mono text-xs")}
        aria-label={activity.title}
      />
      {activity.voiceSupported && (
        <Button
          type="button"
          variant={voiceActive ? "default" : "secondary"}
          size="sm"
          onClick={onVoiceToggle}
        >
          <Mic className="size-4" aria-hidden />
          {voiceActive ? "Listening — tap to stop" : "Answer with your voice"}
        </Button>
      )}
    </div>
  );
}

function OptionPicker({
  options,
  selected,
  onToggle,
  revealed,
}: {
  options: NonNullable<MissionActivity["options"]>;
  selected: string[];
  onToggle: (id: string) => void;
  revealed: boolean;
}) {
  return (
    <ul className="space-y-2">
      {options.map((o) => {
        const isSelected = selected.includes(o.id);
        return (
          <li key={o.id}>
            <button
              type="button"
              onClick={() => onToggle(o.id)}
              aria-pressed={isSelected}
              className={cn(
                "w-full rounded-xl border p-3 text-start text-sm transition-colors",
                isSelected ? "border-primary bg-primary/10" : "border-border hover:bg-surface-raised",
              )}
            >
              {o.label}
              {revealed && isSelected && o.feedback && (
                <span className="mt-1.5 block text-xs text-muted-foreground">{o.feedback}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function BucketSorter({
  items,
  buckets,
  placements,
  onPlace,
}: {
  items: NonNullable<MissionActivity["items"]>;
  buckets: NonNullable<MissionActivity["buckets"]>;
  placements: Record<string, string>;
  onPlace: (itemId: string, bucketId: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid gap-2 rounded-xl bg-surface-raised p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <span className="text-sm font-medium">{item.label}</span>
          <div className="flex flex-wrap gap-2">
            {buckets.map((bucket) => {
              const active = placements[item.id] === bucket.id;
              return (
                <button
                  key={bucket.id}
                  type="button"
                  onClick={() => onPlace(item.id, bucket.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {bucket.label}
                </button>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------------------------------------------- help ---- */

function HintLadder({
  activity,
  characters,
  opened,
  onOpen,
}: {
  activity: MissionActivity;
  characters: Character[];
  opened: number;
  onOpen: () => void;
}) {
  const shown = activity.hints.slice(0, opened);
  const remaining = activity.hints.length - opened;

  return (
    <section className="space-y-2 rounded-xl border border-dashed border-border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldQuestion className="size-4 text-secondary" aria-hidden />
        Help, one step at a time
      </div>
      <p className="text-xs text-muted-foreground">
        Asking for help is recorded, never punished. It changes what the evidence can claim, not
        whether you're allowed it.
      </p>
      {shown.map((hint) => {
        const character = characters.find((c) => c.id === hint.characterId);
        return (
          <div key={hint.id} className="flex items-start gap-3 rounded-lg bg-surface p-3">
            {character && <CharacterAvatar character={character} size="sm" mood="encouraging" />}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-secondary">{hint.label}</p>
              <p className="text-sm">{hint.body}</p>
            </div>
          </div>
        );
      })}
      {remaining > 0 && (
        <Button type="button" variant="ghost" size="sm" onClick={onOpen}>
          <Lightbulb className="size-4" aria-hidden />
          {opened === 0 ? "Give me a nudge" : `Next level of help (${remaining} left)`}
        </Button>
      )}
    </section>
  );
}

function ActivityFeedback({
  result,
  characters,
}: {
  result: ActivityResult;
  characters: Character[];
}) {
  const character = characters.find((c) => c.id === result.characterId);
  return (
    <section
      className={cn(
        "flex items-start gap-3 rounded-xl p-4",
        result.retryReason ? "bg-secondary/10" : "bg-primary/10",
      )}
      aria-live="polite"
    >
      {character && (
        <CharacterAvatar
          character={character}
          mood={result.retryReason ? "curious" : "celebrating"}
          size="sm"
        />
      )}
      <div className="min-w-0 space-y-2">
        <p className="text-sm">{result.feedback}</p>
        {result.retryReason && (
          <p className="text-xs text-muted-foreground">Why: {result.retryReason}.</p>
        )}
        {result.evidence.map((e) => (
          <p key={e.id} className="text-xs text-muted-foreground">
            Evidence recorded — {e.statement} {e.unassisted ? "(unassisted)" : "(with help)"}
          </p>
        ))}
        <p className="text-xs text-muted-foreground">{result.nextSuggestion}</p>
      </div>
    </section>
  );
}
