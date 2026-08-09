/**
 * AI literacy service.
 *
 * The "model" here is a heuristic that reads the learner's actual input, so
 * the seven-move loop responds to real editing rather than a click counter.
 * It is deliberately *unflattering*: vague inputs produce vague outputs, and
 * confident fabrication is injected on purpose so evaluation has something to
 * catch. A real gateway call drops in behind `runExperiment` unchanged.
 */
import {
  aiConcepts,
  aiExperiments,
  aiPlaygrounds,
  aiSession,
  competencyStandings,
  currentAiConceptId,
} from "@/data/ai-literacy";
import type {
  AiConcept,
  AiExperiment,
  AiPathwaySnapshot,
  AiPlayground,
  ExperimentOutput,
  ExperimentRun,
  OutputNote,
  PlaygroundId,
} from "@/types/ai-literacy";
import type { AgeBand, ID } from "@/types/domain";

const respond = <T,>(value: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* ------------------------------- heuristics ------------------------------- */

interface Read {
  words: number;
  specific: boolean;
  hasAudience: boolean;
  hasFormat: boolean;
  hasConstraint: boolean;
  countable: boolean;
  privacyRisk: boolean;
  namesPeople: boolean;
}

const read = (input: string): Read => {
  const t = input.toLowerCase();
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  return {
    words,
    specific: words >= 12,
    hasAudience: /\b(\d{1,2}[- ]year[- ]old|beginner|class|teacher|parent|for a )\b/.test(t),
    hasFormat: /\b(sentence|bullet|list|steps|paragraph|table|words|lines)\b/.test(t),
    hasConstraint: /\b(exactly|no more than|only|without|under|at most|must)\b/.test(t),
    countable: /\b(exactly|three|two|four|five|\d+)\b/.test(t),
    privacyRisk: /\b(my address|full name|school is|phone|@|street)\b/.test(t),
    namesPeople: /\b[A-Z][a-z]{2,}\s[A-Z][a-z]{2,}\b/.test(input),
  };
};

const note = (kind: OutputNote["kind"], text: string): OutputNote => ({ kind, text });

function generate(exp: AiExperiment, input: string, actionId: string): ExperimentOutput {
  const r = read(input);
  const careful = actionId === "careful" || actionId === "detailed" || actionId === "grounded";
  const notes: OutputNote[] = [];
  if (r.privacyRisk)
    notes.push(note("privacy", "You included something identifying. Take it out and run again."));

  switch (exp.kind) {
    case "prompt": {
      if (!r.specific) {
        notes.push(
          note("uncertainty", "The request left almost everything open, so the model picked for you."),
          note("hallucination", "Unasked-for detail appeared. Nothing checked it."),
        );
        return {
          type: "text",
          body:
            "Tides are the rise and fall of the sea. They are caused by the moon, and also by the sun, and they happen roughly twice a day in most places — though in some harbours, records from the 1840s show four daily peaks.",
          notes,
        };
      }
      if (r.hasAudience && r.hasConstraint) notes.push(note("strength", "It kept your length and audience."));
      if (!careful) notes.push(note("uncertainty", "The fast model dropped one of your constraints."));
      notes.push(note("hallucination", "Check the comparison it invented — is it actually true?"));
      return {
        type: "text",
        body: careful
          ? "The moon pulls on the ocean. Water on the moon's side bulges toward it, and water on the far side is left behind. As Earth turns, your beach passes through both bulges. That is why the sea comes in and goes out about twice a day."
          : "Tides happen because the moon pulls the water. It goes up and down twice a day, like a very slow breath, and the sun helps a bit too. Sailors have used this for thousands of years to time their journeys.",
        notes,
      };
    }
    case "image": {
      notes.push(
        note("copyright", "Trained on other people's pictures. Any use of this needs a made-with line."),
      );
      if (r.countable)
        notes.push(note("uncertainty", "You asked for a specific count. Count them in the result."));
      if (!careful) notes.push(note("hallucination", "Sketch pass: any lettering will be nonsense."));
      else notes.push(note("strength", "Lighting and surfaces hold together at this pass."));
      return {
        type: "image",
        caption: careful
          ? "A fog-lit tower, four windows on the visible face, sign lettering reading 'OPFN'."
          : "A rough tower shape, glow smeared across the fog, sign lettering unreadable.",
        palette: careful
          ? ["#12233b", "#2a4a6b", "#d8a24a", "#f2e2c0"]
          : ["#1b2230", "#3a4a5c", "#a98a52", "#d8d2c4"],
        notes,
      };
    }
    case "voice": {
      const noisy = actionId === "noisy";
      const heard = noisy
        ? input.replace(/\bAzouz\b/g, "as us").replace(/\bEssaouira\b/g, "a sweater").replace(/\bstorm\b/g, "store")
        : input.replace(/\bNayla\b/g, "Nayla").replace(/\bEssaouira\b/g, "Essaouira");
      if (r.namesPeople)
        notes.push(note("bias", "Names outside the training data fail first. That is a data gap, not your speech."));
      notes.push(
        noisy
          ? note("uncertainty", "Confidence stayed high while accuracy fell. That gap is the lesson.")
          : note("strength", "Clean audio flatters the system. Real rooms are not this quiet."),
      );
      return { type: "transcript", heard, confidence: noisy ? 0.91 : 0.97, notes };
    }
    case "evaluation": {
      const grounded = actionId === "grounded";
      const fabricated = /1873|Delacroix|Convention/i.test(input);
      if (fabricated)
        notes.push(
          note("hallucination", "The date, the treaty and the citation are all invented — fluently."),
        );
      else notes.push(note("strength", "Hedged language. Less impressive, more honest."));
      return {
        type: "judgement",
        verdict: fabricated
          ? grounded
            ? "Sources requested. Two of the three returned do not exist."
            : "Reads as authoritative. Nothing in it is checkable."
          : "Broadly supportable, low specificity.",
        reasons: fabricated
          ? [
              "A precise date makes a claim feel checked. It isn't.",
              "The citation has an author, a year, and no existence.",
              grounded
                ? "Asking for sources surfaced the problem — but the sources were invented too."
                : "Nothing in the surface of the text signals invention.",
            ]
          : [
              "Vague enough to be true, which limits how useful it is.",
              "Names no specific case you could verify or refute.",
            ],
        notes,
      };
    }
    case "agent": {
      const acting = actionId === "acting";
      notes.push(
        acting
          ? note("privacy", "Acting tools reach other people. Every send is irreversible.")
          : note("strength", "Read-only: the worst failure is a wrong summary."),
      );
      return {
        type: "plan",
        steps: [
          { text: "Read the notes and group them by topic.", needsHuman: false },
          { text: "Draft a summary of each group.", needsHuman: false },
          { text: acting ? "Email the summary to the group." : "Show the summary for you to send.", needsHuman: acting },
          { text: acting ? "Delete the old drafts." : "List old drafts you might delete.", needsHuman: acting },
        ],
        notes,
      };
    }
    case "automation": {
      const live = actionId === "live";
      if (!/when|if/i.test(input))
        notes.push(note("uncertainty", "No trigger stated. A process without a trigger can't be built."));
      notes.push(
        live
          ? note("uncertainty", "Ran on tidy fake data. Real inputs are messier than this.")
          : note("strength", "Dry run: nothing happened, which is the correct default."),
      );
      return {
        type: "plan",
        steps: [
          { text: "Trigger: the condition you described fires.", needsHuman: false },
          { text: "Collect the relevant items.", needsHuman: false },
          { text: "Notify people affected.", needsHuman: true },
          { text: "Failure path: if a step fails, stop and raise it to a person.", needsHuman: true },
        ],
        notes,
      };
    }
    case "ethics": {
      const steel = actionId === "steelman";
      notes.push(note("bias", "This answer reflects one cultural default. Say whose."));
      return {
        type: "judgement",
        verdict: steel
          ? "Strongest case against your position:"
          : "People this lands on, including the ones usually left out:",
        reasons: steel
          ? [
              "Faster feedback only helps if the feedback is right — and errors arrive at scale.",
              "Students who write unusually get scored down for being unusual.",
              "A teacher who stops reading the work stops knowing the student.",
            ]
          : [
              "The student who writes in a second language.",
              "The teacher whose judgement is now overruled by a score.",
              "The parent who cannot appeal a decision nobody can explain.",
            ],
        notes,
      };
    }
  }
}

/* -------------------------------- service -------------------------------- */

export const aiKeys = {
  pathway: (ageBand: AgeBand) => ["ai-literacy", "pathway", ageBand] as const,
  playground: (id: string) => ["ai-literacy", "playground", id] as const,
};

let runSeq = 0;

export const aiLiteracyService = {
  async pathway(ageBand: AgeBand): Promise<AiPathwaySnapshot> {
    return respond({
      ageBand,
      concepts: aiConcepts,
      competencies: competencyStandings,
      playgrounds: aiPlaygrounds,
      currentConceptId: currentAiConceptId,
      session: aiSession,
    });
  },

  async playground(
    id: string,
  ): Promise<{ playground: AiPlayground; experiment: AiExperiment; concepts: AiConcept[] } | null> {
    const playground = aiPlaygrounds.find((p) => p.id === (id as PlaygroundId));
    if (!playground) return respond(null);
    const experiment = aiExperiments.find((e) => e.playgroundId === playground.id);
    if (!experiment) return respond(null);
    return respond({
      playground,
      experiment,
      concepts: aiConcepts.filter((c) => playground.concepts.includes(c.id)),
    });
  },

  /**
   * The seam. Swap this body for a gateway call and every screen keeps working:
   * the contract is input + chosen action in, structured output with teaching
   * notes out.
   */
  async runExperiment(experiment: AiExperiment, input: string, actionId: string): Promise<ExperimentRun> {
    runSeq += 1;
    const run: ExperimentRun = {
      id: `run-${experiment.id}-${runSeq}` as ID,
      experimentId: experiment.id,
      input,
      actionId,
      at: new Date().toISOString(),
      output: generate(experiment, input, actionId),
      scores: {},
    };
    return respond(run, 520);
  },
};
