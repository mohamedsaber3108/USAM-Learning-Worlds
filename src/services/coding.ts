/**
 * Coding service.
 *
 * `createMockSandboxAdapter` is the only interesting part: it implements the
 * real `CodeSandboxAdapter` contract with a heuristic evaluator, so every
 * screen already talks to the shape a Pyodide worker / Scratch VM / sandboxed
 * iframe will present. Swapping in a real runtime is a factory change here and
 * nothing else.
 */
import {
  codingAdapters,
  codingConcepts,
  codingLabs,
  mentorFallback,
  mentorLibrary,
  projectHistorySeed,
} from "@/data/coding";
import type { AgeBand, ID } from "@/types/domain";
import type {
  AdapterDescriptor,
  AdapterId,
  CodeBlock,
  CodeFile,
  CodeSandboxAdapter,
  CodingConcept,
  CodingLab,
  CodingPathwaySnapshot,
  ConsoleLine,
  MentorSupport,
  MentorSupportRequest,
  ProjectSnapshot,
  RunResult,
  RuntimeFault,
  TestResult,
} from "@/types/coding";

const respond = <T,>(value: T, ms = 180): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* ----------------------------- mock evaluation ---------------------------- */

interface Evaluation {
  passed: Record<string, boolean>;
  console: ConsoleLine[];
  preview?: RunResult["preview"];
  error?: RuntimeFault | undefined;
}

const src = (files: CodeFile[], path?: string) =>
  (path ? files.filter((f) => f.path === path) : files).map((f) => f.contents).join("\n");

/**
 * Heuristic "runtime". It reads the learner's actual source, so the feedback
 * responds to real edits rather than a click counter.
 */
function evaluate(lab: CodingLab, files: CodeFile[], blocks: CodeBlock[]): Evaluation {
  switch (lab.id) {
    case "lab-signal-counter": {
      const code = src(files, "main.py");
      const hasLoop = /\bfor\b[^\n]*\bin\b/.test(code);
      const increments = /count\s*(\+=\s*1|=\s*count\s*\+\s*1)/.test(code);
      const compares = /(>=|>)\s*threshold|threshold\s*<=?/.test(code);
      const hardCoded = /return\s+\d+/.test(code);
      const works = hasLoop && increments && compares && !hardCoded;
      const printed = works ? "5" : "0";
      return {
        passed: {
          t1: works,
          t2: works,
          t3: works && compares,
          t4: !hardCoded,
        },
        console: [
          { stream: "system", text: "python3 main.py" },
          { stream: "stdout", text: printed },
          {
            stream: works ? "system" : "stderr",
            text: works
              ? "Process finished with exit code 0"
              : "No error thrown — but the value came back unchanged.",
          },
        ],
      };
    }
    case "lab-review-the-suggestion": {
      const code = src(files, "average.js");
      const offByOne = /i\s*<=\s*values\.length/.test(code);
      const guardsEmpty = /length\s*===?\s*0|!values\.length|length\s*<\s*1/.test(code);
      return {
        passed: { t1: !offByOne, t2: !offByOne, t3: guardsEmpty },
        console: offByOne
          ? [
              { stream: "system", text: "node average.test.js" },
              { stream: "stdout", text: "average([2, 4, 6]) → NaN" },
              { stream: "stderr", text: "Expected 4. Got NaN." },
            ]
          : [
              { stream: "system", text: "node average.test.js" },
              { stream: "stdout", text: "average([2, 4, 6]) → 4" },
              {
                stream: guardsEmpty ? "stdout" : "stderr",
                text: guardsEmpty ? "average([]) → 0" : "average([]) → NaN",
              },
            ],
        error: offByOne
          ? {
              message: "Reading past the end of the array produced undefined.",
              filePath: "average.js",
              line: 4,
              askYourself: "How many times does this loop run, and how many values are there?",
            }
          : undefined,
      };
    }
    case "lab-keeper-card": {
      const html = src(files, "index.html");
      const css = src(files, "styles.css");
      const semantic = /<article|<h2|<p/.test(html);
      const inline = /style\s*=/.test(html);
      const fixedWidth = /\.card\s*{[^}]*\bwidth\s*:\s*\d+px/.test(css);
      return {
        passed: {
          t1: semantic,
          t2: !inline,
          t3: !fixedWidth,
          t4: !fixedWidth && /word-break|overflow-wrap|max-width/.test(css),
        },
        console: [],
        preview: { kind: "html", body: html },
      };
    }
    case "lab-guard-gate": {
      const labels = blocks.map((b) => b.label.toLowerCase()).join(" | ");
      const hasAnd = labels.includes("and");
      const hasHour = labels.includes("hour");
      const hasToken = labels.includes("token");
      const nested = blocks.filter((b) => b.kind === "control").length > 1;
      const correct = hasAnd && hasHour && hasToken && !nested;
      return {
        passed: { t1: hasToken, t2: correct, t3: correct, t4: correct },
        console: [
          { stream: "system", text: "Simulating four visitors…" },
          { stream: "stdout", text: `token+09:00 → ${hasToken ? "open" : "shut"}` },
          { stream: "stdout", text: `token+20:00 → ${correct ? "shut" : "open"}` },
          { stream: "stdout", text: `none+09:00 → ${hasToken ? "shut" : "open"}` },
          { stream: "stdout", text: `none+20:00 → shut` },
        ],
        preview: { kind: "stage", body: correct ? "The gate holds. Two visitors turned away." : "The gate opened for someone it shouldn't have." },
      };
    }
    default: {
      // Lantern path and anything block-based added later.
      const labels = blocks.map((b) => b.label.toLowerCase());
      const usesRepeat = labels.some((l) => l.includes("repeat"));
      const lit = labels.filter((l) => l.includes("light")).length;
      const withinBudget = blocks.length <= 8;
      const duplicated = labels.length !== new Set(labels).size && !usesRepeat;
      const allLit = usesRepeat ? true : lit >= 6;
      return {
        passed: { t1: allLit, t2: withinBudget, t3: !duplicated },
        console: [
          { stream: "system", text: `Running ${blocks.length} blocks…` },
          {
            stream: "stdout",
            text: allLit ? "Six lanterns lit. The path glows end to end." : `${lit} lanterns lit. The path goes dark after that.`,
          },
        ],
        preview: {
          kind: "stage",
          body: allLit ? "The keeper stands at the far lantern, path fully lit." : "The keeper stopped partway. Darkness ahead.",
        },
      };
    }
  }
}

/* ------------------------------ the adapter ------------------------------- */

/**
 * A `CodeSandboxAdapter` backed by the heuristic evaluator above.
 *
 * Real adapters (Pyodide, Scratch VM, iframe) implement the same interface;
 * nothing in the UI needs to change when they land.
 */
export function createMockSandboxAdapter(lab: CodingLab): CodeSandboxAdapter {
  const descriptor =
    codingAdapters.find((a) => a.id === lab.adapterId) ?? codingAdapters[0]!;
  let booted = false;
  let cancelled = false;

  const applyTests = (tests: TestResult[], passed: Record<string, boolean>): TestResult[] =>
    tests.map((t) => ({
      ...t,
      status: passed[t.id] ? "passed" : "failed",
      observed: passed[t.id] ? undefined : "Not satisfied on the last run.",
    }));

  return {
    descriptor,
    async init() {
      if (booted) return;
      await respond(null, 120);
      booted = true;
    },
    async run({ files, blocks = [] }) {
      cancelled = false;
      const started = Date.now();
      await respond(null, 520);
      const result = evaluate(lab, files, blocks);
      if (cancelled) {
        return {
          status: "timeout",
          console: [{ stream: "system", text: "Run stopped." }],
          tests: lab.tests,
          durationMs: Date.now() - started,
        };
      }
      return {
        status: result.error ? "runtime-error" : "ok",
        console: result.console,
        preview: result.preview,
        tests: applyTests(lab.tests, result.passed),
        durationMs: Date.now() - started,
        error: result.error,
      };
    },
    async test({ files, blocks = [], tests }) {
      await respond(null, 420);
      const result = evaluate(lab, files, blocks);
      return applyTests(tests, result.passed);
    },
    async stop() {
      cancelled = true;
    },
    async dispose() {
      booted = false;
    },
  };
}

/* -------------------------------- service --------------------------------- */

const historyStore: Record<ID, ProjectSnapshot[]> = { ...projectHistorySeed };

function currentConcept(ageBand: AgeBand): CodingConcept {
  const forAge = codingConcepts.filter((c) => c.coreFor.includes(ageBand));
  return (
    forAge.find((c) => c.mastery === "developing" || c.mastery === "practicing") ??
    forAge.find((c) => c.mastery === "introduced") ??
    forAge[forAge.length - 1] ??
    codingConcepts[0]!
  );
}

export const codingService = {
  async pathway(ageBand: AgeBand): Promise<CodingPathwaySnapshot> {
    const concept = currentConcept(ageBand);
    const labs = codingLabs.filter((l) => l.ageBands.includes(ageBand));
    const recommended =
      labs.find((l) => l.conceptIds.includes(concept.id)) ?? labs[0] ?? codingLabs[0]!;
    return respond({
      ageBand,
      concepts: codingConcepts,
      currentConceptId: concept.id,
      labs: labs.length ? labs : codingLabs,
      adapters: codingAdapters,
      recommendation: {
        labId: recommended.id,
        because: `${concept.framing[ageBand].title} is the concept you're actively building. This lab is where it gets used.`,
      },
    });
  },

  async lab(labId: ID): Promise<CodingLab | null> {
    return respond(codingLabs.find((l) => l.id === labId) ?? null);
  },

  async adapter(id: AdapterId): Promise<AdapterDescriptor | null> {
    return respond(codingAdapters.find((a) => a.id === id) ?? null);
  },

  /**
   * Mentor support. Never returns the learner's solution — the response set is
   * bounded by `MentorSupportKind`, and repeated pulls escalate the *type* of
   * thinking asked for, not the amount given away.
   */
  async support(request: MentorSupportRequest): Promise<MentorSupport> {
    const perLab = mentorLibrary[request.labId] ?? {};
    const base = perLab[request.kind] ?? mentorFallback[request.kind];
    if (request.kind === "debugging-question" && request.lastError) {
      return respond({ ...base, body: request.lastError.askYourself, askBack: base.askBack }, 320);
    }
    if (request.used >= 3 && request.kind !== "reflection") {
      return respond(
        {
          ...base,
          body: `${base.body}\n\nThat's your fourth ask on this one. Try a run with a print or a smaller input before the next question — you'll learn more from what it does than from what I say.`,
        },
        320,
      );
    }
    return respond(base, 320);
  },

  async history(labId: ID): Promise<ProjectSnapshot[]> {
    return respond(historyStore[labId] ?? []);
  },

  async save(input: {
    labId: ID;
    files: CodeFile[];
    note: string;
    origin: ProjectSnapshot["origin"];
    testsPassed: number;
    testsTotal: number;
  }): Promise<ProjectSnapshot> {
    const snapshot: ProjectSnapshot = {
      id: `s-${Date.now()}`,
      labId: input.labId,
      savedAt: new Date().toISOString(),
      note: input.note,
      origin: input.origin,
      testsPassed: input.testsPassed,
      testsTotal: input.testsTotal,
      files: input.files,
    };
    historyStore[input.labId] = [snapshot, ...(historyStore[input.labId] ?? [])];
    return respond(snapshot, 260);
  },
};

export const codingKeys = {
  pathway: (ageBand: AgeBand) => ["coding", "pathway", ageBand] as const,
  lab: (labId: string) => ["coding", "lab", labId] as const,
  history: (labId: string) => ["coding", "history", labId] as const,
};
