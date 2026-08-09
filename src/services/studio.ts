/**
 * Creative Studio service.
 *
 * The interesting part is `requestAssist`: it is the enforcement point for the
 * rule that AI does not author the work. Every response ends by handing a
 * decision back to the child, and any request that reads as "make it for me"
 * is declined with a reason rather than silently reshaped. Swapping in a real
 * model later means replacing the body generation only — the refusal path and
 * the stage/assist allow-list stay exactly where they are.
 */
import { creationStages, creations, studioById, studios } from "@/data/studio";
import type {
  AssistKind,
  AssistResponse,
  Creation,
  CreationStage,
  CreationStatus,
  CreationVisibility,
  CreativeStudioSnapshot,
  Studio,
  StudioSnapshot,
} from "@/types/studio";
import type { AgeBand } from "@/types/domain";

const respond = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const TAKEOVER = [
  "make it for me",
  "do it for me",
  "write the whole",
  "write it all",
  "just give me the answer",
  "finish it for me",
  "generate the whole",
  "do the rest",
];

const looksLikeTakeover = (ask: string) =>
  TAKEOVER.some((phrase) => ask.toLowerCase().includes(phrase));

const uid = () => `assist-${Math.random().toString(36).slice(2, 10)}`;

/* ----------------------------- assist bodies ----------------------------- */

function bodyFor(kind: AssistKind, studio: Studio, ask: string, ageBand: AgeBand): string[] {
  const subject = ask.trim() || studio.medium.artifact.toLowerCase();
  const craft = studio.craftSkills;
  switch (kind) {
    case "brainstorm":
      return [
        `Angle one — smallest version: ${subject}, but scoped so you could finish a rough pass today.`,
        `Angle two — flip it: whatever the obvious version does, do the opposite and see if it still works.`,
        `Angle three — real audience: make it for one specific person you know, not "everyone".`,
      ];
    case "starter-idea":
      return studio.seeds[ageBand].map((seed) => `Starting point: ${seed}`).concat(
        "None of these are yours yet. Take one and bend it until it is.",
      );
    case "suggest":
      return [
        `Try ordering the work by risk: do the part you're least sure about first, while you still have energy to redo it.`,
        `A constraint that usually helps here: limit yourself on ${craft[0]!.toLowerCase()} — fewer choices, sharper result.`,
      ];
    case "explain":
      return [
        `${craft[0]} is the part doing the heavy lifting in ${studio.name.toLowerCase()}: it decides what a viewer notices first.`,
        `Concretely, in ${subject}: change only that, keep everything else fixed, and compare the two versions side by side.`,
      ];
    case "alternatives":
      return [
        `Route A — keep your current direction and push it further than feels comfortable.`,
        `Route B — same idea, different medium constraint (half the elements, half the length).`,
        `Route C — hand the same brief to a different audience and see what has to change.`,
      ];
    case "feedback":
      return [
        `What's working: your intent is legible — someone can tell what you were going for without you explaining.`,
        `What I'd question: is ${craft[1]?.toLowerCase() ?? "the pacing"} carrying its weight, or is it just present?`,
        `One concrete experiment: make a version with one element removed. If nothing breaks, it wasn't load-bearing.`,
      ];
    case "debug":
      return [
        `Narrow it first: what is the smallest piece that still shows the problem?`,
        `Then check the boundary — the moment right before it goes wrong is usually where the cause lives, not where you noticed it.`,
        `I'm not going to fix it for you; tell me what you observe at that boundary and we'll go from there.`,
      ];
  }
}

const RETURN_QUESTION: Record<AssistKind, string> = {
  brainstorm: "Which of these is closest to something you actually want to spend a week on?",
  "starter-idea": "What would you change about the one you like least?",
  suggest: "Which suggestion are you going to ignore, and why?",
  explain: "Say it back in your own words — where does it not fit your piece?",
  alternatives: "Pick a route and name the thing you're giving up by picking it.",
  feedback: "Which note do you disagree with? Disagreeing is allowed if you can say why.",
  debug: "What did you see at the boundary?",
};

/* -------------------------------- service -------------------------------- */

export const studioKeys = {
  all: ["studios"] as const,
  overview: (ageBand: AgeBand) => ["studios", "overview", ageBand] as const,
  studio: (id: string) => ["studios", "studio", id] as const,
  creation: (id: string) => ["studios", "creation", id] as const,
};

export const studioService = {
  overview: async (): Promise<CreativeStudioSnapshot> => {
    const assistedMoves = creations.reduce((n, c) => n + c.aiAssistLog.length, 0);
    const ownMoves = creations.reduce(
      (n, c) => n + c.revisions.length + c.plan.length + c.critique.filter((x) => x.response).length,
      0,
    );
    return respond({
      studios,
      recent: [...creations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      stages: creationStages,
      authorship: { ownMoves, assistedMoves },
    });
  },

  studio: async (id: string): Promise<StudioSnapshot | null> => {
    const studio = studioById(id);
    if (!studio) return respond(null);
    return respond({
      studio,
      creations: creations.filter((c) => c.studioId === studio.id),
      stages: creationStages,
    });
  },

  creation: async (id: string): Promise<Creation | null> =>
    respond(creations.find((c) => c.id === id) ?? null),

  /** Assist requests are checked against the stage allow-list before anything else. */
  requestAssist: async (input: {
    studioId: string;
    stage: CreationStage;
    kind: AssistKind;
    ask: string;
    ageBand: AgeBand;
  }): Promise<AssistResponse> => {
    const studio = studioById(input.studioId)!;
    const stage = creationStages.find((s) => s.id === input.stage)!;

    if (!stage.allowedAssists.includes(input.kind)) {
      return respond({
        id: uid(),
        kind: input.kind,
        stage: input.stage,
        body: [
          `Not at this stage. "${stage.label}" is where ${stage.purpose.toLowerCase().replace(/\.$/, "")} — that part is yours.`,
          `Available here: ${stage.allowedAssists.map((a) => a).join(", ") || "nothing — this stage is entirely yours."}`,
        ],
        returnQuestion: `What's the next thing you'd do without help?`,
        declined: "That kind of help is turned off at this stage on purpose.",
      });
    }

    if (looksLikeTakeover(input.ask)) {
      return respond({
        id: uid(),
        kind: input.kind,
        stage: input.stage,
        body: [
          `I won't make it for you — not as a rule I'm following, but because the version I'd produce wouldn't teach you anything and you couldn't defend it in your portfolio.`,
          `What I can do: ${stage.allowedAssists.join(", ")}. Tell me where you're actually stuck and we'll work from there.`,
        ],
        returnQuestion: "What have you tried so far?",
        declined: "Asked the AI to author the work.",
      });
    }

    return respond(
      {
        id: uid(),
        kind: input.kind,
        stage: input.stage,
        body: bodyFor(input.kind, studio, input.ask, input.ageBand),
        returnQuestion: RETURN_QUESTION[input.kind],
      },
      450,
    );
  },

  /** Publishing is a two-part promise: a status and a visibility, never assumed. */
  publish: async (input: {
    creationId: string;
    status: CreationStatus;
    visibility: CreationVisibility;
    artistStatement: string;
  }): Promise<{ ok: true; portfolioItemId: string }> =>
    respond({ ok: true as const, portfolioItemId: `portfolio-${input.creationId}` }, 350),
};
