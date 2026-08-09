import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  Lightbulb,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreationFlowRail, StatusPill, VisibilityPill } from "@/components/studio/StudioCards";
import { studioService } from "@/services/studio";
import type {
  AssistKind,
  AssistResponse,
  Creation,
  CreationStage,
  CreationStageMeta,
  CreationStatus,
  CreationVisibility,
  Studio,
} from "@/types/studio";
import type { AgeBand } from "@/types/domain";

const ASSIST_LABEL: Record<AssistKind, string> = {
  brainstorm: "Brainstorm with me",
  suggest: "Suggest an approach",
  explain: "Explain the craft",
  "starter-idea": "Give me starting points",
  feedback: "Give me feedback",
  debug: "Help me debug",
  alternatives: "Show alternatives",
};

const STATUS_OPTIONS: CreationStatus[] = ["draft", "in-progress", "completed", "featured"];
const VISIBILITY_OPTIONS: CreationVisibility[] = ["private", "family", "mentor", "community"];

export function CreationWorkspace({
  studio,
  creation,
  stages,
  ageBand,
}: {
  studio: Studio;
  creation: Creation;
  stages: CreationStageMeta[];
  ageBand: AgeBand;
}) {
  const [stage, setStage] = useState<CreationStage>(creation.stage);
  const [ask, setAsk] = useState("");
  const [responses, setResponses] = useState<AssistResponse[]>([]);
  const [status, setStatus] = useState<CreationStatus>(creation.status);
  const [visibility, setVisibility] = useState<CreationVisibility>(creation.visibility);
  const [statement, setStatement] = useState(creation.artistStatement ?? "");
  const [published, setPublished] = useState(false);

  const stageMeta = stages.find((s) => s.id === stage)!;

  const assist = useMutation({
    mutationFn: (kind: AssistKind) =>
      studioService.requestAssist({ studioId: studio.id, stage, kind, ask, ageBand }),
    onSuccess: (response) => setResponses((prev) => [response, ...prev]),
  });

  const publish = useMutation({
    mutationFn: () =>
      studioService.publish({
        creationId: creation.id,
        status,
        visibility,
        artistStatement: statement,
      }),
    onSuccess: () => setPublished(true),
  });

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-4 p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {studio.name}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{creation.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{creation.intent}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusPill status={status} />
            <VisibilityPill visibility={visibility} />
          </div>
        </div>
        <CreationFlowRail stages={stages} current={stage} onSelect={setStage} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="space-y-5">
          <section className="surface-panel space-y-3 p-5">
            <h3 className="font-display text-base font-semibold">{stageMeta.label}</h3>
            <p className="text-sm text-muted-foreground">{stageMeta.purpose}</p>
            <div className="rounded-xl border border-border/70 bg-surface-raised/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Done when
              </p>
              <p className="mt-1 text-sm">{stageMeta.exitCriterion}</p>
            </div>
          </section>

          <section className="surface-panel space-y-4 p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Bot className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold">Ask for help</h3>
                <p className="text-sm text-muted-foreground">
                  Azouz can think with you. He will not make the thing — that part stays yours.
                </p>
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Where are you stuck?</span>
              <Textarea
                value={ask}
                onChange={(event) => setAsk(event.target.value)}
                rows={3}
                placeholder="I can't decide between two endings and both feel flat."
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {stageMeta.allowedAssists.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No AI help at this stage. Deciding whether this is your best work is a judgement
                  only you can make.
                </p>
              ) : (
                stageMeta.allowedAssists.map((kind) => (
                  <Button
                    key={kind}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={assist.isPending}
                    onClick={() => assist.mutate(kind)}
                  >
                    {ASSIST_LABEL[kind]}
                  </Button>
                ))
              )}
            </div>

            {assist.isPending && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Thinking with you…
              </p>
            )}

            <ul className="space-y-3">
              {responses.map((response) => (
                <li
                  key={response.id}
                  className={cn(
                    "rounded-xl border p-4",
                    response.declined
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-surface-raised/50",
                  )}
                >
                  <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {response.declined ? (
                      <ShieldAlert className="size-4 text-destructive" aria-hidden />
                    ) : (
                      <Sparkles className="size-4 text-primary" aria-hidden />
                    )}
                    {ASSIST_LABEL[response.kind]}
                  </p>
                  {response.declined && (
                    <p className="mt-2 text-sm font-medium text-destructive">{response.declined}</p>
                  )}
                  <ul className="mt-2 space-y-2">
                    {response.body.map((line, index) => (
                      <li key={index} className="text-sm leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-border/60 pt-3 text-sm font-medium">
                    {response.returnQuestion}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-panel space-y-4 p-5">
            <h3 className="font-display text-base font-semibold">Publish privately</h3>
            <p className="text-sm text-muted-foreground">
              Publishing means finished, not public. Everything beyond family needs a grown-up to
              say yes first.
            </p>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Status</legend>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={status === option ? "default" : "outline"}
                    onClick={() => setStatus(option)}
                  >
                    {option === "in-progress" ? "In progress" : option}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Who can see it</legend>
              <div className="flex flex-wrap gap-2">
                {VISIBILITY_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={visibility === option ? "default" : "outline"}
                    onClick={() => setVisibility(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {visibility === "community" && (
                <p className="text-xs text-muted-foreground">
                  Sent to a parent for approval. It stays private until they approve.
                </p>
              )}
            </fieldset>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                Artist statement — what were you going for?
              </span>
              <Textarea
                value={statement}
                onChange={(event) => setStatement(event.target.value)}
                rows={3}
                placeholder="I wanted weight without squashing anything. The hardest decision was…"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={statement.trim().length < 12 || publish.isPending}
                onClick={() => publish.mutate()}
              >
                {publish.isPending && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Add to portfolio
              </Button>
              {statement.trim().length < 12 && (
                <p className="text-xs text-muted-foreground">
                  Write the statement first — it's what turns a file into evidence.
                </p>
              )}
            </div>

            {published && (
              <p className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                Saved as a portfolio artifact. You can change the status or visibility any time.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="surface-panel space-y-3 p-5">
            <h3 className="font-display text-base font-semibold">Your plan</h3>
            {creation.plan.length === 0 ? (
              <p className="text-sm text-muted-foreground">No steps yet — that's the plan stage.</p>
            ) : (
              <ol className="space-y-2">
                {creation.plan.map((step, index) => (
                  <li key={step} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="surface-panel space-y-3 p-5">
            <h3 className="font-display text-base font-semibold">Versions</h3>
            {creation.revisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing saved yet. The first rough version counts.
              </p>
            ) : (
              <ul className="space-y-3">
                {[...creation.revisions].reverse().map((revision) => (
                  <li key={revision.id} className="rounded-xl bg-surface-raised/60 p-3">
                    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">v{revision.version}</span>
                      <span>{new Date(revision.changedAt).toLocaleDateString()}</span>
                      <span className="rounded-full border border-border px-2 py-0.5">
                        {revision.driver.replace("-", " ")}
                      </span>
                    </p>
                    <p className="mt-1 text-sm">{revision.note}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="surface-panel space-y-3 p-5">
            <h3 className="font-display text-base font-semibold">Notes from other people</h3>
            {creation.critique.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nobody has seen it yet. Show it while you can still change it.
              </p>
            ) : (
              <ul className="space-y-3">
                {creation.critique.map((note) => (
                  <li key={note.id} className="rounded-xl border border-border/70 p-3">
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold">{note.author}</span>
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-muted-foreground">
                        {note.focus}
                      </span>
                      {note.response && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-muted-foreground">
                          {note.response}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm">{note.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="surface-panel space-y-2 p-5">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <Lightbulb className="size-4 text-accent" aria-hidden />
              Starting points for you
            </h3>
            <ul className="space-y-1.5">
              {studio.seeds[ageBand].map((seed) => (
                <li key={seed} className="text-sm text-muted-foreground">
                  {seed}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
