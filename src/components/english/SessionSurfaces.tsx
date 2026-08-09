import { useState } from "react";
import { Check, Headphones, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SpeakingPractice } from "@/components/english/SpeakingPractice";
import { englishService } from "@/services/english";
import type {
  ComprehensionQuestion,
  ConverseSession,
  EnglishSession,
  GrammarSession,
  ListenSession,
  PresentSession,
  ReadSession,
  RoleplaySession,
  RubricCriterion,
  VocabularySession,
  WriteSession,
} from "@/types/english";

/** One switchboard so every venue renders its own kind of work. */
export function SessionSurface({ session }: { session: EnglishSession }) {
  switch (session.kind) {
    case "speak":
      return (
        <SpeakingPractice
          sessionId={session.id}
          prompt={session.prompt}
          modelAnswer={session.modelAnswer}
          targetSounds={session.targetSounds}
          sentenceStarters={session.sentenceStarters}
          rubric={session.rubric}
        />
      );
    case "listen":
      return <ListenSurface session={session} />;
    case "read":
      return <ReadSurface session={session} />;
    case "write":
      return <WriteSurface session={session} />;
    case "vocabulary":
      return <VocabularySurface session={session} />;
    case "grammar":
      return <GrammarSurface session={session} />;
    case "roleplay":
      return <RoleplaySurface session={session} />;
    case "present":
      return <PresentSurface session={session} />;
    case "converse":
      return <ConverseSurface session={session} />;
  }
}

export function RubricList({ rubric }: { rubric: RubricCriterion[] }) {
  return (
    <div className="surface-panel p-5">
      <h4 className="font-display text-sm font-semibold">What counts as done well</h4>
      <ul className="mt-3 space-y-2">
        {rubric.map((c) => (
          <li key={c.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <span className="font-medium">{c.label}</span>
            <p className="mt-1 text-xs text-muted-foreground">{c.lookFor}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- listen --------------------------------- */

function ListenSurface({ session }: { session: ListenSession }) {
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [revealed, setRevealed] = useState(false);

  async function play() {
    setPlaying(true);
    const { durationMs } = await englishService.playModel(session.transcript);
    setPlays((n) => n + 1);
    setTimeout(() => setPlaying(false), Math.min(durationMs, 1500));
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Headphones className="size-5 text-accent" aria-hidden />
          <div className="min-w-0">
            <p className="font-medium">{session.audioLabel}</p>
            <p className="text-xs text-muted-foreground">{session.seconds} seconds</p>
          </div>
          <Button className="ms-auto" onClick={play} disabled={playing}>
            {playing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Volume2 className="size-4" aria-hidden />
            )}
            {plays === 0 ? "Play" : "Play again"}
          </Button>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Listen for
          </p>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
            {session.listenFor.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => setRevealed((v) => !v)}>
            {revealed ? "Hide the transcript" : "Show the transcript"}
          </Button>
          {revealed && (
            <p className="mt-2 rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground">
              {session.transcript}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Replays are free. Getting it on the third listen still counts.
          </p>
        </div>
      </div>
      <QuestionSet questions={session.questions} />
    </div>
  );
}

/* ---------------------------------- read ---------------------------------- */

function ReadSurface({ session }: { session: ReadSession }) {
  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {session.level}
        </p>
        <article className="space-y-3 text-base leading-relaxed">
          {session.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Words worth keeping
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {session.glossary.map((g) => (
              <li key={g.word}>
                <span className="font-medium">{g.word}</span> — {g.meaning}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <QuestionSet questions={session.questions} />
    </div>
  );
}

/* ---------------------------------- write --------------------------------- */

function WriteSurface({ session }: { session: WriteSession }) {
  const [draft, setDraft] = useState("");
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">The brief</p>
          <p className="mt-1 text-lg font-medium">{session.brief}</p>
          <p className="mt-1 text-sm text-muted-foreground">Written for: {session.audience}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.frames.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDraft((d) => (d ? `${d} ${f}` : f))}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs hover:border-primary/60"
            >
              {f}
            </button>
          ))}
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={10}
          placeholder="Start anywhere. You can move it later."
          aria-label="Your draft"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {words} words · aiming for around {session.wordTarget}
          </span>
          <Button size="sm" onClick={() => setSubmitted(true)} disabled={words < 5}>
            Send to Sol for review
          </Button>
        </div>
        {submitted && (
          <p className="rounded-lg border border-success/40 bg-success/10 p-3 text-sm">
            Sent. Sol reviews against the criteria below — not against anyone else's draft.
          </p>
        )}
      </div>
      <div className="surface-panel p-5">
        <h4 className="font-display text-sm font-semibold">When you revise, try these</h4>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {session.revisionPrompts.map((r) => (
            <li key={r} className="rounded-lg border border-border bg-surface p-3">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------- vocabulary -------------------------------- */

const STAGE_META = {
  seed: { label: "Just planted", tone: "border-border bg-surface", height: 20 },
  sprout: { label: "Sprouting", tone: "border-secondary/40 bg-secondary/10", height: 40 },
  leafing: { label: "Leafing", tone: "border-primary/40 bg-primary/10", height: 70 },
  rooted: { label: "Rooted", tone: "border-success/40 bg-success/10", height: 100 },
} as const;

function VocabularySurface({ session }: { session: VocabularySession }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Theme: <span className="font-medium text-foreground">{session.theme}</span>. A word is only
        rooted once you've used it yourself — recognising it isn't enough.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {session.words.map((w) => {
          const stage = STAGE_META[w.stage];
          const open = openId === w.id;
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : w.id)}
                aria-expanded={open}
                className={cn(
                  "flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                  stage.tone,
                )}
              >
                <div className="flex items-end justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{w.word}</span>
                  <span
                    aria-hidden
                    className="w-1.5 rounded-full bg-success/70"
                    style={{ height: `${stage.height * 0.32}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{stage.label}</span>
                {open && (
                  <div className="space-y-2 pt-1 text-sm">
                    <p>{w.meaning}</p>
                    <p className="text-muted-foreground">“{w.inContext}”</p>
                    <p className="text-xs text-muted-foreground">
                      Last seen {w.lastSeenDays === 0 ? "today" : `${w.lastSeenDays} days ago`}
                    </p>
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --------------------------------- grammar --------------------------------- */

function GrammarSurface({ session }: { session: GrammarSession }) {
  const [named, setNamed] = useState(false);
  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-4 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Look at what changes
        </p>
        <ul className="space-y-3">
          {session.contrasts.map((c) => (
            <li key={c.before} className="rounded-lg border border-border bg-surface p-3">
              <p className="text-sm text-muted-foreground line-through">{c.before}</p>
              <p className="mt-1 text-sm font-medium">{c.after}</p>
              <p className="mt-2 text-xs text-muted-foreground">{c.why}</p>
            </li>
          ))}
        </ul>
        <Button variant="secondary" size="sm" onClick={() => setNamed(true)} disabled={named}>
          {named ? "Named" : "Now tell me what it's called"}
        </Button>
        {named && (
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
            <p className="text-sm font-medium">{session.pattern}</p>
            <p className="mt-1 text-sm text-muted-foreground">{session.rule}</p>
          </div>
        )}
      </div>
      <QuestionSet questions={session.practice} />
    </div>
  );
}

/* -------------------------------- roleplay --------------------------------- */

function RoleplaySurface({ session }: { session: RoleplaySession }) {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Record<string, string>>({});
  const visible = session.turns.slice(0, step + 1);

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-2 p-5">
        <p className="text-lg font-medium">{session.scenario}</p>
        <p className="text-sm text-muted-foreground">{session.setting}</p>
        <p className="text-sm">
          You are <span className="font-medium">{session.learnerRole}</span>. They are{" "}
          <span className="font-medium">{session.characterRole}</span>.
        </p>
      </div>

      <div className="surface-panel space-y-3 p-5">
        {visible.map((turn) =>
          turn.speaker === "character" ? (
            <p
              key={turn.id}
              className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-surface p-3 text-sm"
            >
              {turn.line}
            </p>
          ) : (
            <div key={turn.id} className="ms-auto max-w-[85%] space-y-2">
              <p className="text-xs text-muted-foreground">Your turn: {turn.goal}</p>
              <Textarea
                rows={2}
                value={lines[turn.id] ?? ""}
                onChange={(e) => setLines((prev) => ({ ...prev, [turn.id]: e.target.value }))}
                placeholder="Say it, or type it if you'd rather."
                aria-label={`Your line: ${turn.goal ?? ""}`}
              />
            </div>
          ),
        )}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => setStep((s) => Math.min(s + 1, session.turns.length - 1))}
            disabled={step >= session.turns.length - 1}
          >
            Next line
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
            Start the scene again
          </Button>
        </div>
      </div>

      <div className="surface-panel p-5">
        <h4 className="font-display text-sm font-semibold">Phrases that fit this scene</h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {session.usefulPhrases.map((p) => (
            <li
              key={p}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
            >
              “{p}”
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------- present ---------------------------------- */

function PresentSurface({ session }: { session: PresentSession }) {
  const [checked, setChecked] = useState<string[]>([]);
  const total = session.sections.reduce((sum, s) => sum + s.seconds, 0);

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-2 p-5">
        <p className="text-lg font-medium">{session.brief}</p>
        <p className="text-sm text-muted-foreground">Audience: {session.audience}</p>
        <p className="text-xs text-muted-foreground">
          Total time {Math.round(total / 60)} min {total % 60}s
        </p>
      </div>

      <ol className="space-y-3">
        {session.sections.map((s, i) => (
          <li key={s.id} className="surface-panel flex gap-4 p-4">
            <span className="font-display text-2xl font-bold text-primary/70">{i + 1}</span>
            <div className="min-w-0">
              <p className="font-medium">
                {s.label}{" "}
                <span className="text-xs font-normal text-muted-foreground">· {s.seconds}s</span>
              </p>
              <p className="text-sm text-muted-foreground">{s.guidance}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="surface-panel p-5">
        <h4 className="font-display text-sm font-semibold">Delivery checklist</h4>
        <ul className="mt-3 space-y-2">
          {session.deliveryChecklist.map((item) => {
            const on = checked.includes(item);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() =>
                    setChecked((prev) =>
                      on ? prev.filter((i) => i !== item) : [...prev, item],
                    )
                  }
                  aria-pressed={on}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg border p-3 text-start text-sm",
                    on ? "border-success/40 bg-success/10" : "border-border bg-surface",
                  )}
                >
                  <Check
                    className={cn("size-4", on ? "text-success" : "text-muted-foreground/40")}
                    aria-hidden
                  />
                  {item}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------- converse --------------------------------- */

function ConverseSurface({ session }: { session: ConverseSession }) {
  const [turns, setTurns] = useState<{ who: "learner" | "lina"; text: string }[]>([]);
  const [draft, setDraft] = useState("");

  function send(text: string) {
    if (!text.trim()) return;
    setTurns((prev) => [
      ...prev,
      { who: "learner", text },
      {
        who: "lina",
        text:
          prev.length === 0
            ? "Right — tell me more about it. What did it look like?"
            : prev.length < 4
              ? "Good. Now one detail someone else would need to picture it."
              : "That's enough to act on. Say the plan back to me in one sentence.",
      },
    ]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <div className="surface-panel space-y-2 p-5">
        <p className="text-lg font-medium">{session.roomTopic}</p>
        <p className="text-sm text-muted-foreground">
          This room ends somewhere: {session.closingTask}
        </p>
      </div>

      <div className="surface-panel space-y-3 p-5">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {session.openers.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => send(o)}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs hover:border-primary/60"
              >
                “{o}”
              </button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <p
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl border p-3 text-sm",
              t.who === "learner"
                ? "ms-auto rounded-br-sm border-primary/40 bg-primary/10"
                : "rounded-bl-sm border-border bg-surface",
            )}
          >
            {t.text}
          </p>
        ))}
        <form
          className="flex gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <Textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your turn…"
            aria-label="Your turn"
          />
          <Button type="submit" disabled={!draft.trim()}>
            Send
          </Button>
        </form>
      </div>

      <div className="surface-panel p-5">
        <h4 className="font-display text-sm font-semibold">What each turn is for</h4>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {session.turnGoals.map((g) => (
            <li key={g}>• {g}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------- questions -------------------------------- */

function QuestionSet({ questions }: { questions: ComprehensionQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  return (
    <div className="surface-panel space-y-4 p-5">
      <h4 className="font-display text-sm font-semibold">Questions</h4>
      <ol className="space-y-4">
        {questions.map((q) => {
          const answered = answers[q.id];
          return (
            <li key={q.id} className="space-y-2">
              <p className="text-sm font-medium">{q.prompt}</p>
              {q.options ? (
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt, i) => {
                    const chosen = answered === i;
                    const correct = q.answerIndex === i;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                        className={cn(
                          "min-h-11 rounded-lg border px-3 py-2 text-sm",
                          chosen && correct && "border-success/50 bg-success/10",
                          chosen && !correct && "border-warning/50 bg-warning/10",
                          !chosen && "border-border bg-surface hover:border-primary/50",
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Textarea
                  rows={2}
                  value={typeof answered === "string" ? answered : ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Answer in your own words."
                  aria-label={q.prompt}
                />
              )}
              <p className="text-xs text-muted-foreground">Testing: {q.tests}</p>
              {typeof answered === "number" && q.answerIndex !== undefined && (
                <p className="text-xs">
                  {answered === q.answerIndex
                    ? "That's it — and you can say which part of the text proves it."
                    : "Not that one. Go back to the source before choosing again."}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
