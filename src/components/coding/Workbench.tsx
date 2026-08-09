import { useEffect, useMemo, useRef, useState } from "react";
import {
  Blocks,
  Check,
  CircleAlert,
  FileCode2,
  History,
  ListChecks,
  Play,
  Save,
  Square,
  TerminalSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MentorPanel } from "@/components/coding/MentorPanel";
import { createMockSandboxAdapter, codingService } from "@/services/coding";
import type { AgeBand } from "@/types/domain";
import type {
  CodeBlock,
  CodeFile,
  CodingLab,
  ProjectSaveState,
  ProjectSnapshot,
  RunResult,
  TestResult,
} from "@/types/coding";

/* ------------------------------ file explorer ----------------------------- */

function FileExplorer({
  files,
  activePath,
  onSelect,
}: {
  files: CodeFile[];
  activePath: string;
  onSelect: (path: string) => void;
}) {
  return (
    <nav aria-label="Project files" className="surface-panel p-3">
      <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Files
      </p>
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => onSelect(f.path)}
              aria-current={f.path === activePath}
              className={cn(
                "flex min-h-9 w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors",
                f.path === activePath
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
              )}
            >
              <FileCode2 className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{f.path}</span>
              {f.readOnly && <span className="ms-auto text-xs">read only</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------- code editor ------------------------------ */

function CodeEditor({
  file,
  onChange,
}: {
  file: CodeFile;
  onChange: (contents: string) => void;
}) {
  const lineCount = file.contents.split("\n").length;
  return (
    <div className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="font-mono">{file.path}</span>
        <span>{file.language}</span>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)]">
        <ol
          aria-hidden
          className="select-none border-e border-border bg-surface px-3 py-3 text-end font-mono text-xs leading-6 text-muted-foreground"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <li key={i}>{i + 1}</li>
          ))}
        </ol>
        <textarea
          value={file.contents}
          onChange={(e) => onChange(e.target.value)}
          readOnly={file.readOnly}
          spellCheck={false}
          aria-label={`Code editor: ${file.path}`}
          className="min-h-64 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
}

/* ------------------------------ block editor ------------------------------ */

function BlockEditor({
  blocks,
  palette,
  onChange,
}: {
  blocks: CodeBlock[];
  palette: string[];
  onChange: (next: CodeBlock[]) => void;
}) {
  const tone: Record<CodeBlock["kind"], string> = {
    event: "border-primary/50 bg-primary/15 text-primary",
    action: "border-secondary/40 bg-secondary/10 text-secondary",
    control: "border-primary/40 bg-primary/10 text-primary",
    value: "border-border bg-surface text-foreground",
    operator: "border-border bg-surface text-muted-foreground",
  };

  function kindOf(label: string): CodeBlock["kind"] {
    const l = label.toLowerCase();
    if (l.startsWith("when")) return "event";
    if (l.startsWith("if") || l.startsWith("repeat")) return "control";
    if (l.includes("and") || l.includes("or") || l.includes("not")) return "operator";
    if (l.includes("<") || l.includes("token")) return "value";
    return "action";
  }

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="surface-panel space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Your program
        </p>
        <ul className="space-y-1.5">
          {blocks.map((b) => (
            <li key={b.id} style={{ marginInlineStart: `${b.depth * 20}px` }}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                  tone[b.kind],
                )}
              >
                <Blocks className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{b.label}</span>
                <button
                  type="button"
                  onClick={() => onChange(blocks.filter((x) => x.id !== b.id))}
                  aria-label={`Remove block: ${b.label}`}
                  className="ms-auto rounded p-1 hover:bg-background/40"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
          {blocks.length === 0 && (
            <li className="text-sm text-muted-foreground">Empty. Add a block to start.</li>
          )}
        </ul>
        <p className="pt-1 text-xs text-muted-foreground">{blocks.length} blocks</p>
      </div>

      <div className="surface-panel space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Palette
        </p>
        <ul className="space-y-1.5">
          {palette.map((label) => (
            <li key={label}>
              <button
                type="button"
                onClick={() =>
                  onChange([
                    ...blocks,
                    {
                      id: `b-${Date.now()}-${Math.round(Math.random() * 999)}`,
                      label,
                      kind: kindOf(label),
                      depth: 1,
                    },
                  ])
                }
                className="min-h-9 w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-start text-sm hover:border-primary/60"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* --------------------------- console and preview -------------------------- */

function ConsolePanel({ result }: { result: RunResult | null }) {
  return (
    <div className="surface-panel overflow-hidden" aria-label="Console">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <TerminalSquare className="size-4" aria-hidden />
        Console
        {result && <span className="ms-auto">{result.durationMs}ms</span>}
      </div>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-xs leading-6">
        {result?.console.length ? (
          result.console.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.stream === "stderr"
                  ? "text-destructive"
                  : line.stream === "system"
                    ? "text-muted-foreground"
                    : "text-foreground",
              )}
            >
              {line.stream === "system" ? "› " : ""}
              {line.text}
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">Nothing yet. Press Run.</div>
        )}
      </pre>
    </div>
  );
}

function OutputPreview({ result }: { result: RunResult | null }) {
  return (
    <div className="surface-panel overflow-hidden" aria-label="Output preview">
      <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">Output</div>
      <div className="p-4">
        {!result?.preview && <p className="text-sm text-muted-foreground">No visual output for this run.</p>}
        {result?.preview?.kind === "stage" && <p className="text-sm">{result.preview.body}</p>}
        {result?.preview?.kind === "html" && (
          <iframe
            title="Page preview"
            sandbox=""
            srcDoc={result.preview.body}
            className="h-56 w-full rounded-lg border border-border bg-background"
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------- test panel ------------------------------ */

function TestPanel({ tests }: { tests: TestResult[] }) {
  const passed = tests.filter((t) => t.status === "passed").length;
  return (
    <div className="surface-panel p-4" aria-label="Test results">
      <div className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
        <ListChecks className="size-4" aria-hidden />
        Checks
        <span className="ms-auto">
          {passed}/{tests.length} passing
        </span>
      </div>
      <ul className="space-y-1.5">
        {tests.map((t) => (
          <li
            key={t.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              t.status === "passed"
                ? "border-secondary/40 bg-secondary/10"
                : t.status === "failed"
                  ? "border-destructive/40 bg-destructive/10"
                  : "border-border bg-surface",
            )}
          >
            {t.status === "passed" ? (
              <Check className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden />
            ) : t.status === "failed" ? (
              <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            ) : (
              <Square className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="min-w-0">
              <span className="block">{t.label}</span>
              {t.observed && (
                <span className="block text-xs text-muted-foreground">{t.observed}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- debug panel ------------------------------ */

function DebugPanel({ result }: { result: RunResult | null }) {
  const fault = result?.error;
  return (
    <div className="surface-panel space-y-2 p-4" aria-label="Debugging">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CircleAlert className="size-4" aria-hidden />
        Debugging
      </div>
      {fault ? (
        <>
          <p className="text-sm font-medium text-destructive">{fault.message}</p>
          {fault.filePath && (
            <p className="font-mono text-xs text-muted-foreground">
              {fault.filePath}
              {fault.line ? `:${fault.line}` : ""}
            </p>
          )}
          <p className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
            {fault.askYourself}
          </p>
          <p className="text-xs text-muted-foreground">
            Reproduce → isolate → fix → re-test. In that order.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing threw. If the answer is still wrong, the bug is in your thinking, not the runtime —
          predict the output, then run and compare.
        </p>
      )}
    </div>
  );
}

/* ------------------------------ project history --------------------------- */

function HistoryPanel({
  saveState,
  snapshots,
  onSave,
}: {
  saveState: ProjectSaveState;
  snapshots: ProjectSnapshot[];
  onSave: () => void;
}) {
  const label =
    saveState.status === "unsaved"
      ? "Unsaved changes"
      : saveState.status === "saving"
        ? "Saving…"
        : saveState.status === "error"
          ? "Save failed"
          : saveState.lastSavedAt
            ? `Saved ${new Date(saveState.lastSavedAt).toLocaleTimeString()}`
            : "Saved";

  return (
    <div className="surface-panel space-y-3 p-4" aria-label="Project history">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <History className="size-4" aria-hidden />
        Versions
        <span
          className={cn(
            "ms-auto",
            saveState.status === "unsaved" && "text-primary",
            saveState.status === "error" && "text-destructive",
          )}
        >
          {label}
        </span>
      </div>
      <Button type="button" variant="secondary" className="w-full gap-2" onClick={onSave}>
        <Save className="size-4" aria-hidden />
        Save a version
      </Button>
      <ol className="space-y-2">
        {snapshots.map((s) => (
          <li key={s.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{new Date(s.savedAt).toLocaleTimeString()}</span>
              <span>
                {s.testsPassed}/{s.testsTotal} checks
              </span>
            </div>
            <p className="mt-1">{s.note}</p>
          </li>
        ))}
        {snapshots.length === 0 && (
          <li className="text-sm text-muted-foreground">No versions yet.</li>
        )}
      </ol>
    </div>
  );
}

/* -------------------------------- workbench ------------------------------- */

/**
 * The coding workbench.
 *
 * Every panel the spec calls for, wired to a `CodeSandboxAdapter`. The editor
 * form follows the adapter (blocks vs text), the instructions follow the age
 * layer, and the mentor sits beside the work rather than inside it.
 */
export function Workbench({
  lab,
  ageBand,
  initialHistory,
}: {
  lab: CodingLab;
  ageBand: AgeBand;
  initialHistory: ProjectSnapshot[];
}) {
  const adapter = useMemo(() => createMockSandboxAdapter(lab), [lab]);
  const [files, setFiles] = useState<CodeFile[]>(lab.files);
  const [blocks, setBlocks] = useState<CodeBlock[]>(lab.blocks ?? []);
  const [activePath, setActivePath] = useState(lab.files[0]?.path ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [tests, setTests] = useState<TestResult[]>(lab.tests);
  const [running, setRunning] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(initialHistory);
  const [saveState, setSaveState] = useState<ProjectSaveState>({ labId: lab.id, status: "clean" });
  const dirty = useRef(false);

  useEffect(() => {
    void adapter.init();
    return () => {
      void adapter.dispose();
    };
  }, [adapter]);

  const instructions = lab.instructions[ageBand];
  const activeFile = files.find((f) => f.path === activePath) ?? files[0];
  const isBlockLab = adapter.descriptor.editor === "blocks";

  function editFile(contents: string) {
    setFiles((prev) => prev.map((f) => (f.path === activePath ? { ...f, contents } : f)));
    dirty.current = true;
    setSaveState((s) => ({ ...s, status: "unsaved" }));
  }

  function editBlocks(next: CodeBlock[]) {
    setBlocks(next);
    dirty.current = true;
    setSaveState((s) => ({ ...s, status: "unsaved" }));
  }

  async function run() {
    setRunning(true);
    const next = await adapter.run({ files, blocks });
    setResult(next);
    setTests(next.tests);
    setRunning(false);
  }

  async function runTests() {
    setRunning(true);
    const next = await adapter.test({ files, blocks, tests: lab.tests });
    setTests(next);
    setRunning(false);
  }

  async function save(note?: string) {
    setSaveState((s) => ({ ...s, status: "saving" }));
    const snapshot = await codingService.save({
      labId: lab.id,
      files,
      note: note ?? "Saved by hand.",
      origin: "manual",
      testsPassed: tests.filter((t) => t.status === "passed").length,
      testsTotal: tests.length,
    });
    setSnapshots((prev) => [snapshot, ...prev]);
    dirty.current = false;
    setSaveState({ labId: lab.id, status: "clean", lastSavedAt: snapshot.savedAt });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        {/* Instructions */}
        <section className="surface-panel space-y-3 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              What you're doing
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">{instructions.goal}</h2>
          </div>
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            {instructions.steps.map((s, i) => (
              <li key={s}>
                <span className="me-2 tabular-nums text-primary">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
          {instructions.constraint && (
            <p className="rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
              Constraint: {instructions.constraint}
            </p>
          )}
          <div>
            <p className="text-sm font-semibold">Done when</p>
            <ul className="text-sm text-muted-foreground">
              {instructions.doneWhen.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Editor */}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={run} disabled={running} className="gap-2">
            <Play className="size-4" aria-hidden />
            {running ? "Running…" : "Run"}
          </Button>
          <Button type="button" variant="secondary" onClick={runTests} disabled={running} className="gap-2">
            <ListChecks className="size-4" aria-hidden />
            Check my work
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void adapter.stop()}
            disabled={!running}
            className="gap-2"
          >
            <Square className="size-4" aria-hidden />
            Stop
          </Button>
          <span className="ms-auto text-xs text-muted-foreground">
            {adapter.descriptor.label} · {adapter.descriptor.status === "available" ? "shell live" : "adapter planned"}
          </span>
        </div>

        {isBlockLab ? (
          <BlockEditor blocks={blocks} palette={lab.blockPalette ?? []} onChange={editBlocks} />
        ) : (
          <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
            <FileExplorer files={files} activePath={activePath} onSelect={setActivePath} />
            {activeFile && <CodeEditor file={activeFile} onChange={editFile} />}
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          {adapter.descriptor.supportsConsole && <ConsolePanel result={result} />}
          {adapter.descriptor.supportsPreview && <OutputPreview result={result} />}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <TestPanel tests={tests} />
          <DebugPanel result={result} />
        </div>
      </div>

      {/* Side rail */}
      <div className="space-y-4">
        <section className="surface-panel space-y-2 p-4" aria-label="Hints">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Hints
          </p>
          <ol className="space-y-2">
            {lab.hints.slice(0, revealedHints).map((h, i) => (
              <li key={h} className="rounded-lg border border-border bg-surface p-3 text-sm">
                <span className="me-2 text-primary">{i + 1}.</span>
                {h}
              </li>
            ))}
          </ol>
          {revealedHints < lab.hints.length ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setRevealedHints((n) => n + 1)}
            >
              {revealedHints === 0 ? "Reveal the first hint" : "One more hint"}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              That's every hint. The rest is yours — try a run and read what actually happened.
            </p>
          )}
        </section>

        <MentorPanel labId={lab.id} lastError={result?.error} />

        <HistoryPanel saveState={saveState} snapshots={snapshots} onSave={() => void save()} />
      </div>
    </div>
  );
}
