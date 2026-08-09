import { useState } from "react";
import { Loader2, Mic, RotateCcw, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { englishService } from "@/services/english";
import { useExperience } from "@/state/experience";
import type { RubricCriterion, SpeakingAttempt, SpeakingPhase } from "@/types/english";

/**
 * The speaking loop: listen → speak → transcript → feedback → retry.
 *
 * No microphone is opened here. Every phase is driven through `englishService`
 * so a real STT stream and assessment model slot in behind the same contract.
 * Retry is unlimited and never framed as a penalty.
 */
export function SpeakingPractice({
  sessionId,
  prompt,
  modelAnswer,
  targetSounds,
  sentenceStarters,
  rubric,
}: {
  sessionId: string;
  prompt: string;
  modelAnswer: string;
  targetSounds: string[];
  sentenceStarters: string[];
  rubric: RubricCriterion[];
}) {
  const { setVoiceState } = useExperience();
  const [phase, setPhase] = useState<SpeakingPhase>("idle");
  const [attempts, setAttempts] = useState<SpeakingAttempt[]>([]);
  const latest = attempts[attempts.length - 1];

  async function playModel() {
    setPhase("listening-to-model");
    setVoiceState("speaking");
    const { durationMs } = await englishService.playModel(modelAnswer);
    setTimeout(() => {
      setVoiceState("idle");
      setPhase("idle");
    }, Math.min(durationMs, 1600));
  }

  function startRecording() {
    setPhase("recording");
    setVoiceState("listening");
  }

  async function stopRecording() {
    setPhase("transcribing");
    setVoiceState("thinking");
    const attempt = await englishService.submitSpeech(sessionId, attempts.length + 1);
    setAttempts((prev) => [...prev, attempt]);
    setVoiceState("idle");
    setPhase("feedback");
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Say this</p>
          <p className="mt-1 text-lg font-medium">{prompt}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={playModel} disabled={phase !== "idle"}>
            <Volume2 className="size-4" aria-hidden />
            Hear one way of saying it
          </Button>
          {phase === "recording" ? (
            <Button onClick={stopRecording}>
              <Square className="size-4" aria-hidden />
              Stop and check
            </Button>
          ) : (
            <Button
              onClick={startRecording}
              disabled={phase === "transcribing" || phase === "listening-to-model"}
            >
              {phase === "transcribing" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Mic className="size-4" aria-hidden />
              )}
              {attempts.length ? "Try it again" : "Start speaking"}
            </Button>
          )}
          <PhasePill phase={phase} />
        </div>

        {phase === "listening-to-model" && (
          <p className="rounded-lg border border-secondary/40 bg-secondary/10 p-3 text-sm">
            “{modelAnswer}”
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sounds we're listening for
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {targetSounds.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              If you're stuck, start with
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {sentenceStarters.map((s) => (
                <li key={s}>“{s}”</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {latest && <FeedbackPanel attempt={latest} rubric={rubric} total={attempts.length} />}

      {attempts.length > 1 && (
        <div className="surface-panel p-5">
          <h4 className="font-display text-sm font-semibold">Your attempts, in order</h4>
          <ol className="mt-3 space-y-2 text-sm">
            {attempts.map((a) => (
              <li key={a.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  #{a.attemptNumber}
                </span>
                <span className="text-muted-foreground">“{a.feedback.transcript}”</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <RotateCcw className="size-3.5" aria-hidden />
            Retries don't cost anything. Only your best attempt is kept as evidence.
          </p>
        </div>
      )}
    </div>
  );
}

function PhasePill({ phase }: { phase: SpeakingPhase }) {
  const meta: Record<SpeakingPhase, { label: string; tone: string }> = {
    idle: { label: "Ready", tone: "text-muted-foreground border-border" },
    "listening-to-model": { label: "Playing", tone: "text-secondary border-secondary/40" },
    recording: { label: "Listening to you", tone: "text-primary border-primary/50" },
    transcribing: { label: "Working out what you said", tone: "text-accent border-accent/40" },
    feedback: { label: "Feedback ready", tone: "text-success border-success/40" },
  };
  const m = meta[phase];
  return (
    <span
      aria-live="polite"
      className={cn("rounded-full border px-3 py-1 text-xs font-medium", m.tone)}
    >
      {m.label}
    </span>
  );
}

function FeedbackPanel({
  attempt,
  rubric,
  total,
}: {
  attempt: SpeakingAttempt;
  rubric: RubricCriterion[];
  total: number;
}) {
  const { feedback } = attempt;
  return (
    <div className="surface-panel space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Transcript · attempt {total}
        </p>
        <p className="mt-1 rounded-lg border border-border bg-surface p-3 text-sm">
          “{feedback.transcript}”
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{feedback.wordsSpoken} words spoken.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-success/40 bg-success/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-success">What worked</p>
          <p className="mt-1 text-sm">{feedback.strength}</p>
        </div>
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">One thing next</p>
          <p className="mt-1 text-sm">{feedback.fix}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Against the rubric
        </p>
        <ul className="mt-2 space-y-2">
          {rubric.map((c) => {
            const met = feedback.criteriaMet.includes(c.id);
            return (
              <li
                key={c.id}
                className={cn(
                  "rounded-lg border p-3 text-sm",
                  met ? "border-success/40 bg-success/5" : "border-border bg-surface",
                )}
              >
                <span className="font-medium">{c.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {met ? "met" : "not yet"}
                </span>
                <p className="mt-1 text-xs text-muted-foreground">{c.lookFor}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {feedback.pronunciationNotes.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pronunciation notes
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {feedback.pronunciationNotes.map((n) => (
              <li key={n.sound}>
                <span className="font-medium">{n.sound}</span> — {n.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {feedback.countsAsEvidence
          ? "This attempt meets every criterion, so it counts as evidence for your speaking strand."
          : "Not evidence yet — one criterion is still open. Another go will do it."}
      </p>
    </div>
  );
}
