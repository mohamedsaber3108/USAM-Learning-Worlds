/**
 * Phase 9 mock data — the AI literacy world.
 *
 * The progression is deliberately front-loaded with *how these systems work*
 * and back-loaded with prompting, evaluation and agency. A child meets data,
 * patterns and prediction long before they meet a text box.
 */
import type {
  AiCompetency,
  AiConcept,
  AiConceptFraming,
  AiConceptId,
  AiExperiment,
  AiPlayground,
  CompetencyStanding,
} from "@/types/ai-literacy";
import type { AgeBand } from "@/types/domain";
import type { MasteryState } from "@/types/curriculum";

const fr = (title: string, summary: string, provesIt: string, askThis: string): AiConceptFraming => ({
  title,
  summary,
  provesIt,
  askThis,
});

interface Seed {
  id: AiConceptId;
  objective: string;
  requires: AiConceptId[];
  competencies: AiCompetency[];
  coreFor: AgeBand[];
  mastery: MasteryState;
  evidence: string[];
  misconception: string;
  young: AiConceptFraming;
  middle: AiConceptFraming;
  older: AiConceptFraming;
}

const seeds: Seed[] = [
  {
    id: "what-is-ai",
    objective: "Distinguish systems that learn from data from ordinary programmed rules.",
    requires: [],
    competencies: ["understand"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "mastered",
    evidence: ["Sorted ten machines into 'follows rules' and 'learned from examples'."],
    misconception: "AI thinks and knows things the way a person does.",
    young: fr(
      "Machines that guess",
      "Some machines follow exact rules. Others learn from lots of examples and guess.",
      "You point at a toaster and a photo-sorter and say which one learned.",
      "Did somebody teach this with examples, or write it as rules?",
    ),
    middle: fr(
      "Rules vs learned behaviour",
      "A rule-based program does exactly what it was told. A model was fitted to examples.",
      "You explain why a spam filter and a calculator are different kinds of software.",
      "What examples was this trained on?",
    ),
    older: fr(
      "What we mean by 'AI'",
      "A statistical function fitted to data, deployed in a product, wrapped in interface promises.",
      "You separate the model, the product, and the marketing claim about a tool.",
      "Which part of this claim is the model, and which part is the interface?",
    ),
  },
  {
    id: "how-models-learn",
    objective: "Explain training as adjusting a model to reduce error on examples.",
    requires: ["what-is-ai"],
    competencies: ["understand"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "mastered",
    evidence: ["Played the guess-and-correct game and described what changed after each round."],
    misconception: "The model looks up the answer it was shown before.",
    young: fr(
      "Getting better by trying",
      "It guesses, gets told how wrong it was, and nudges itself. Again and again.",
      "You run the guessing game and say what got better between round one and round ten.",
      "How did it find out it was wrong?",
    ),
    middle: fr(
      "Training loops",
      "Examples in, prediction out, error measured, weights nudged. Millions of times.",
      "You describe the loop without using the word 'magic'.",
      "What was the error signal here?",
    ),
    older: fr(
      "Training, loss and generalisation",
      "Loss measures error; gradients nudge parameters; the goal is unseen data, not the training set.",
      "You explain why a model can score perfectly on training data and still fail in the world.",
      "Was this measured on data it had already seen?",
    ),
  },
  {
    id: "data",
    objective: "Trace an output back to the data that shaped it.",
    requires: ["how-models-learn"],
    competencies: ["understand", "evaluate"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "proficient",
    evidence: ["Predicted what a model trained only on cat photos would do with a dog."],
    misconception: "More data always means better answers.",
    young: fr(
      "What it was shown",
      "A model only knows the examples it saw. Show it only cats and it sees cats everywhere.",
      "You predict a mistake before it happens, from the examples alone.",
      "What did it see, and what did it never see?",
    ),
    middle: fr(
      "Datasets have edges",
      "Every dataset was collected by someone, somewhere, with gaps they didn't notice.",
      "You name a group missing from a dataset and the failure that follows.",
      "Who is missing from this data?",
    ),
    older: fr(
      "Provenance and coverage",
      "Source, sampling, labelling and licence all travel with the data into the model's behaviour.",
      "You audit a described dataset and predict two specific failure modes.",
      "How was this collected, and who consented?",
    ),
  },
  {
    id: "patterns",
    objective: "Identify the pattern a model is actually keying on, including the wrong one.",
    requires: ["data"],
    competencies: ["understand", "evaluate"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "proficient",
    evidence: ["Found the shortcut: the classifier was reading snow, not wolves."],
    misconception: "If it gets the answer right, it understood the question.",
    young: fr(
      "Spotting the clue",
      "Sometimes it's looking at the wrong thing and still gets lucky.",
      "You find the sneaky clue in a picture set.",
      "What is it really looking at?",
    ),
    middle: fr(
      "Shortcuts",
      "Models latch onto whatever correlates, even background snow instead of the animal.",
      "You design a test image that exposes a shortcut.",
      "Would it still be right if I removed the background?",
    ),
    older: fr(
      "Spurious correlation",
      "Correlated features are cheaper to learn than causal ones; benchmarks hide this.",
      "You propose a held-out test that would break a shortcut-learning model.",
      "What would falsify the claim that it learned the real feature?",
    ),
  },
  {
    id: "prediction",
    objective: "Read a model output as a prediction with confidence, not a fact.",
    requires: ["patterns"],
    competencies: ["understand", "evaluate"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "proficient",
    evidence: ["Rewrote three confident outputs as 'the model predicts…' statements."],
    misconception: "A confident answer is a correct answer.",
    young: fr(
      "Best guess",
      "The answer is a guess with a feeling of sureness attached. Sureness isn't truth.",
      "You say 'it guessed' instead of 'it knows', and mean it.",
      "How sure is it, and why?",
    ),
    middle: fr(
      "Confidence is not correctness",
      "A model can be very confident and completely wrong; the two are separate measurements.",
      "You find one high-confidence wrong answer and one low-confidence right one.",
      "What would change its confidence?",
    ),
    older: fr(
      "Probabilistic output",
      "Outputs are distributions; calibration is the question of whether confidence tracks accuracy.",
      "You explain calibration with an example from a run you did.",
      "Is this model calibrated on this kind of input?",
    ),
  },
  {
    id: "generative-ai",
    objective: "Explain generation as sampling plausible continuations, not retrieval.",
    requires: ["prediction"],
    competencies: ["understand"],
    coreFor: ["10-11", "12-14"],
    mastery: "developing",
    evidence: ["Ran the same prompt three times and explained why the answers differed."],
    misconception: "It fetched that text from somewhere.",
    young: fr(
      "Making new things",
      "It builds something new that looks like the things it saw. It isn't copying one thing.",
      "You run one prompt twice and notice the answers aren't the same.",
      "Why is it different this time?",
    ),
    middle: fr(
      "Generation, not lookup",
      "Each piece is chosen because it fits, so the same request can give different results.",
      "You explain the variation between two runs of the same prompt.",
      "What made it pick this word instead of another?",
    ),
    older: fr(
      "Sampling from a distribution",
      "Temperature and sampling strategy trade coherence against variety; determinism is a setting.",
      "You predict how lowering variety changes an output, then check it.",
      "What sampling settings produced this?",
    ),
  },
  {
    id: "language-models",
    objective: "Describe how a language model represents and continues text.",
    requires: ["generative-ai"],
    competencies: ["understand", "use"],
    coreFor: ["10-11", "12-14"],
    mastery: "developing",
    evidence: ["Predicted the next-word game better than random on twenty tries."],
    misconception: "The model understands the sentence the way a reader does.",
    young: fr(
      "The next-word machine",
      "It is very good at guessing what word comes next.",
      "You beat the machine at the next-word game once, and lose fairly.",
      "What word would you guess next?",
    ),
    middle: fr(
      "Context and continuation",
      "It reads everything so far, then continues. What you wrote earlier still shapes it.",
      "You show that changing the first line changes the last line.",
      "How much of what I wrote is it still using?",
    ),
    older: fr(
      "Tokens, context and attention",
      "Text becomes tokens; attention weights which earlier tokens matter for the next one.",
      "You explain a context-window failure you caused deliberately.",
      "What fell out of the context window here?",
    ),
  },
  {
    id: "images",
    objective: "Explain how image models are trained and where they fail.",
    requires: ["generative-ai"],
    competencies: ["understand", "create", "evaluate"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "practicing",
    evidence: ["Found the hands, the text and the physics errors in three generated images."],
    misconception: "If it looks real, it is real.",
    young: fr(
      "Pictures made by guessing",
      "It draws by guessing what pixels usually go together. Look at the hands.",
      "You find something impossible in a made-up picture.",
      "Is this a photo of something that happened?",
    ),
    middle: fr(
      "Image generation and its tells",
      "Text, hands, reflections and counts are where generated images fall apart.",
      "You run a five-point check on an image and reach a verdict.",
      "What in this image could not physically happen?",
    ),
    older: fr(
      "Synthesis and provenance",
      "Diffusion builds images from noise; provenance signals and metadata are the real defence.",
      "You argue a provenance case for one image without relying on vibes.",
      "What provenance evidence exists for this image?",
    ),
  },
  {
    id: "voice",
    objective: "Describe speech recognition and synthesis as separate, fallible systems.",
    requires: ["prediction"],
    competencies: ["understand", "use"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "practicing",
    evidence: ["Recorded one sentence three ways and compared the transcripts."],
    misconception: "It hears the way a person hears.",
    young: fr(
      "Listening machines",
      "It turns sound into words, and it gets names and noisy rooms wrong a lot.",
      "You make it mishear you on purpose, then explain why.",
      "Why did it get my name wrong?",
    ),
    middle: fr(
      "Recognition and synthesis",
      "One system turns speech into text; a different one turns text into speech.",
      "You show which half failed when something went wrong.",
      "Which part broke — the listening or the speaking?",
    ),
    older: fr(
      "ASR, TTS and voice cloning",
      "Accent coverage shapes error rate; synthetic voices raise consent questions immediately.",
      "You state a rule for when cloning a voice is not acceptable.",
      "Whose voice is this, and did they agree?",
    ),
  },
  {
    id: "multimodal",
    objective: "Explain what changes when one model handles text, image and audio together.",
    requires: ["images", "voice", "language-models"],
    competencies: ["understand"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    misconception: "Handling more kinds of input means it understands more.",
    young: fr(
      "Seeing and hearing",
      "Some helpers can look and listen at the same time.",
      "You name two things a looking-and-listening helper could do.",
      "Can it see this, or only read about it?",
    ),
    middle: fr(
      "More than one kind of input",
      "The same model can take a picture and a question together and answer about both.",
      "You design one task that needs both an image and a sentence.",
      "Does it need to see it, or is my description enough?",
    ),
    older: fr(
      "Shared representations",
      "Modalities are projected into one space, so errors in one channel leak into the others.",
      "You explain a failure where a bad transcript poisoned a correct image reading.",
      "Which modality is the weak link in this pipeline?",
    ),
  },
  {
    id: "prompting",
    objective: "Change an output predictably by changing one thing about the request.",
    requires: ["language-models"],
    competencies: ["use"],
    coreFor: ["10-11", "12-14"],
    mastery: "developing",
    evidence: ["Ran a controlled comparison: same task, one variable changed."],
    misconception: "Prompting is the skill. It is one node of twenty-two.",
    young: fr(
      "Asking clearly",
      "Say who it's for, what you want, and how long. Vague in, vague out.",
      "You improve one weak request and say what you added.",
      "Did I say what I actually wanted?",
    ),
    middle: fr(
      "Changing one thing at a time",
      "If you change three things and the answer improves, you learned nothing.",
      "You run an A/B with exactly one difference and report which won.",
      "What was the only difference between these two?",
    ),
    older: fr(
      "Specification, not incantation",
      "A prompt is a spec: audience, constraints, format, examples, and a success test.",
      "You write a prompt with a stated success criterion and test against it.",
      "How would I know if this output failed?",
    ),
  },
  {
    id: "evaluation",
    objective: "Judge an output against criteria set before the output was seen.",
    requires: ["prediction", "prompting"],
    competencies: ["evaluate"],
    coreFor: ["10-11", "12-14"],
    mastery: "practicing",
    evidence: ["Wrote three criteria first, then scored two outputs against them."],
    misconception: "The better-sounding answer is the better answer.",
    young: fr(
      "Checking the answer",
      "Decide what a good answer needs *before* you look at what it gave you.",
      "You write your checklist first, then score.",
      "What would make this a good answer?",
    ),
    middle: fr(
      "Rubrics beat vibes",
      "Fluent writing is not accuracy. Score each line separately.",
      "You score two outputs on the same rubric and defend the gap.",
      "Which line of my rubric does this fail?",
    ),
    older: fr(
      "Criteria, ground truth and disagreement",
      "Evaluation needs criteria fixed in advance, a source of truth, and a note where you're unsure.",
      "You mark one criterion 'cannot verify' and explain what evidence you'd need.",
      "What is my ground truth here?",
    ),
  },
  {
    id: "hallucinations",
    objective: "Detect confident fabrication and verify against an independent source.",
    requires: ["evaluation"],
    competencies: ["evaluate", "act"],
    coreFor: ["10-11", "12-14"],
    mastery: "practicing",
    evidence: ["Caught an invented citation and named how to check it."],
    misconception: "Hallucination is a bug that will be patched out.",
    young: fr(
      "Made-up facts",
      "Sometimes it invents things and says them just as confidently as true things.",
      "You spot one made-up detail and say how you'd check it.",
      "How could I find out if this is true?",
    ),
    middle: fr(
      "Confident invention",
      "Names, dates, quotes and links are the usual invention sites. Check those first.",
      "You verify one claim outside the tool before using it.",
      "Where else can I confirm this?",
    ),
    older: fr(
      "Why fabrication is structural",
      "A model optimised for plausible continuation has no truth check inside it.",
      "You explain why fluency and factuality are separate properties.",
      "What grounding does this answer have?",
    ),
  },
  {
    id: "bias",
    objective: "Show how data and design choices skew outputs toward some people.",
    requires: ["data", "patterns"],
    competencies: ["evaluate", "reflect", "act"],
    coreFor: ["10-11", "12-14"],
    mastery: "developing",
    evidence: ["Ran the same job description with two names and compared results."],
    misconception: "Bias means someone was being mean on purpose.",
    young: fr(
      "Unfair guesses",
      "If it mostly saw one kind of person, it guesses worse about everyone else.",
      "You notice who a system gets wrong more often.",
      "Who does this work badly for?",
    ),
    middle: fr(
      "Skew from the data",
      "Bias arrives through collection, labelling and who was in the room, not malice.",
      "You run a paired test that differs only by name or place.",
      "What did I hold constant in this comparison?",
    ),
    older: fr(
      "Measurement and harm",
      "Different fairness definitions conflict; you must name which harm you're measuring.",
      "You choose a fairness definition and justify it for one situation.",
      "Fair by which definition, and for whom?",
    ),
  },
  {
    id: "privacy",
    objective: "Decide what must never be typed into a system you don't control.",
    requires: ["data"],
    competencies: ["act"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "proficient",
    evidence: ["Rewrote a request to remove a full name, a school and an address."],
    misconception: "It forgets what I typed as soon as I close the tab.",
    young: fr(
      "Keep private things private",
      "Never your full name, school, address, or photos of other people.",
      "You rewrite a message to take the private bits out.",
      "Would I say this to a stranger on the street?",
    ),
    middle: fr(
      "Data leaves your hands",
      "What you type may be stored, reviewed, or used later. Assume it doesn't vanish.",
      "You strip identifying details and keep the task intact.",
      "Who could read this later?",
    ),
    older: fr(
      "Consent, retention and third parties",
      "Other people's data isn't yours to paste. Retention policies are a real thing to read.",
      "You handle someone else's information correctly without being told to.",
      "Did the person in this data agree to this?",
    ),
  },
  {
    id: "safety",
    objective: "Recognise unsafe uses and know the escalation route to a human.",
    requires: ["privacy"],
    competencies: ["act"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "proficient",
    evidence: ["Named three situations that go to an adult, not to a chatbot."],
    misconception: "The AI can help with anything if you ask the right way.",
    young: fr(
      "When to ask a person",
      "Feelings, safety, health and anything scary go to a grown-up you trust.",
      "You say who you'd go to, by name.",
      "Is this a person question or a machine question?",
    ),
    middle: fr(
      "Limits worth keeping",
      "Some questions need a person who knows you and can act in the real world.",
      "You redirect one question away from the tool, correctly.",
      "Can this thing actually do anything about it?",
    ),
    older: fr(
      "Failure modes and escalation",
      "Automation bias makes wrong answers stickier. Decide the escalation rule before you need it.",
      "You write the escalation rule for a project before you build it.",
      "What is the worst outcome if this is wrong?",
    ),
  },
  {
    id: "copyright",
    objective: "Attribute source and state what is yours in any AI-assisted work.",
    requires: ["generative-ai"],
    competencies: ["act", "create"],
    coreFor: ["10-11", "12-14"],
    mastery: "practicing",
    evidence: ["Labelled a project: what was generated, what was written, what was borrowed."],
    misconception: "If a machine made it, nobody owns anything.",
    young: fr(
      "Say who made it",
      "If a machine helped, say so. If you copied someone's art, say whose.",
      "You add an honest 'how this was made' line.",
      "Who made the parts I didn't make?",
    ),
    middle: fr(
      "Credit and permission",
      "Generated work was trained on other people's work. Attribution is the minimum.",
      "You write a credit line that would survive a question.",
      "Would the original artist recognise their work here?",
    ),
    older: fr(
      "Licensing and training data",
      "Licences, style imitation and derivative work are unresolved and worth arguing carefully.",
      "You state a defensible position on style imitation and its limits.",
      "What licence covers what I'm producing?",
    ),
  },
  {
    id: "ethics",
    objective: "Weigh who benefits and who is harmed by a specific deployment.",
    requires: ["bias", "privacy", "copyright"],
    competencies: ["reflect", "act"],
    coreFor: ["12-14"],
    mastery: "developing",
    evidence: ["Argued both sides of AI grading and then took a position."],
    misconception: "Ethics is a list of rules to memorise.",
    young: fr(
      "Fair and not fair",
      "Ask who it helps and who it hurts. Both lists are usually long.",
      "You name one person a tool helps and one it hurts.",
      "Who does this help, and who does it hurt?",
    ),
    middle: fr(
      "Weighing the sides",
      "Most real cases have a genuine benefit and a genuine cost. Say both out loud.",
      "You argue the side you disagree with, honestly.",
      "What's the strongest argument against me?",
    ),
    older: fr(
      "Deployment ethics",
      "Context decides: the same model is fine in one setting and indefensible in another.",
      "You change your position when given a stronger argument, and say why.",
      "What would change my mind?",
    ),
  },
  {
    id: "human-ai-collaboration",
    objective: "Divide a task into what you keep and what you delegate, with a reason.",
    requires: ["evaluation", "safety"],
    competencies: ["use", "reflect"],
    coreFor: ["10-11", "12-14"],
    mastery: "developing",
    evidence: ["Split a writing task and defended keeping the argument for themselves."],
    misconception: "Working with AI means letting it do the hard part.",
    young: fr(
      "Who does which bit",
      "You keep the thinking. It can do the boring, repeated part.",
      "You keep one part on purpose and say why.",
      "Which part should stay mine?",
    ),
    middle: fr(
      "Dividing the work",
      "Delegate what you could check. Never delegate what you couldn't recognise as wrong.",
      "You justify one delegation and one refusal.",
      "Could I tell if it did this badly?",
    ),
    older: fr(
      "Leverage and skill atrophy",
      "Delegating what you haven't learned yet costs you the skill you were about to gain.",
      "You refuse a delegation specifically to protect a skill you're building.",
      "Am I saving time or skipping learning?",
    ),
  },
  {
    id: "automation",
    objective: "Design a rule-triggered process and mark its human checkpoints.",
    requires: ["human-ai-collaboration"],
    competencies: ["create", "act"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    misconception: "Automating something means nobody needs to watch it.",
    young: fr(
      "Things that happen by themselves",
      "A rule that runs on its own: when this happens, do that.",
      "You write one when-this-then-that rule.",
      "What starts it?",
    ),
    middle: fr(
      "Triggers and steps",
      "Automation is a trigger, some steps, and a place where a person still checks.",
      "You mark the step a person must approve.",
      "Where does a human still look?",
    ),
    older: fr(
      "Reliability and blast radius",
      "The design question is what happens when a step fails silently at three in the morning.",
      "You add a failure path, not just a happy path.",
      "What breaks, and how loudly?",
    ),
  },
  {
    id: "agents",
    objective: "Explain why a system that takes actions needs narrower permissions than one that talks.",
    requires: ["automation", "safety"],
    competencies: ["understand", "act"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    misconception: "An agent is just a smarter chatbot.",
    young: fr(
      "Helpers that do things",
      "Some helpers don't just talk — they press buttons for you. That needs more care.",
      "You say one thing a helper should ask permission for.",
      "Should it be allowed to do that by itself?",
    ),
    middle: fr(
      "Talking vs doing",
      "A wrong sentence is annoying. A wrong action sends the email or deletes the file.",
      "You list which actions need approval and which don't.",
      "What can it do without asking me?",
    ),
    older: fr(
      "Tools, permissions and loops",
      "An agent is a model plus tools plus a loop; each tool widens what a bad step can reach.",
      "You scope a tool's permission to the smallest thing that still works.",
      "What is the smallest permission that does the job?",
    ),
  },
  {
    id: "ai-projects",
    objective: "Ship a small AI-assisted project with stated limits and honest credit.",
    requires: ["agents", "ethics", "human-ai-collaboration"],
    competencies: ["create", "reflect", "act"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    misconception: "The project is finished when it works once.",
    young: fr(
      "Make something small",
      "Build one useful thing, then tell people how it was made.",
      "You finish it and explain the AI part honestly.",
      "What did the machine do here?",
    ),
    middle: fr(
      "Build, test, label",
      "A real project says what it can't do, not only what it can.",
      "You write the 'this does not work when…' line.",
      "When does my thing fail?",
    ),
    older: fr(
      "Scope, evaluation and disclosure",
      "Define the task, an evaluation set, the failure policy, and the disclosure — before building.",
      "You ship with an evaluation and a disclosure statement.",
      "How will I know it's still working next month?",
    ),
  },
];

export const aiConcepts: AiConcept[] = seeds.map((s) => ({
  id: s.id,
  objective: s.objective,
  requires: s.requires,
  competencies: s.competencies,
  coreFor: s.coreFor,
  mastery: s.mastery,
  evidence: s.evidence,
  misconception: s.misconception,
  framing: { "8-9": s.young, "10-11": s.middle, "12-14": s.older },
}));

export const currentAiConceptId: AiConceptId = "evaluation";

/* ------------------------------------------------------------------ */
/* Competency model                                                     */
/* ------------------------------------------------------------------ */

export const COMPETENCY_META: Record<
  AiCompetency,
  { label: string; meaning: string }
> = {
  understand: { label: "Understand", meaning: "Can explain how the system works and where it breaks." },
  use: { label: "Use", meaning: "Can get useful work out of it, deliberately." },
  evaluate: { label: "Evaluate", meaning: "Can judge an output against criteria set beforehand." },
  create: { label: "Create", meaning: "Can build something with it and own the result." },
  reflect: { label: "Reflect", meaning: "Can say what it changed about their own thinking." },
  act: { label: "Act responsibly", meaning: "Does the right thing when nobody is checking." },
};

export const competencyStandings: CompetencyStanding[] = [
  {
    competency: "understand",
    mastery: "proficient",
    shown: "Explains training, data gaps and prediction without reaching for magic.",
    nextEvidence: "Explain a multimodal failure where one channel poisoned another.",
  },
  {
    competency: "use",
    mastery: "developing",
    shown: "Improves a weak request by adding audience, format and a constraint.",
    nextEvidence: "Run a controlled A/B with exactly one variable changed.",
  },
  {
    competency: "evaluate",
    mastery: "practicing",
    shown: "Writes criteria before looking at the output — most of the time.",
    nextEvidence: "Mark one criterion 'cannot verify' and say what evidence is missing.",
  },
  {
    competency: "create",
    mastery: "practicing",
    shown: "Made a poster with generated art and credited the tool.",
    nextEvidence: "Ship a small project with a stated failure case.",
  },
  {
    competency: "reflect",
    mastery: "developing",
    shown: "Noticed that using the tool first made the writing worse.",
    nextEvidence: "Refuse one delegation to protect a skill in progress.",
  },
  {
    competency: "act",
    mastery: "proficient",
    shown: "Removed a classmate's name from a request without being asked.",
    nextEvidence: "Write the escalation rule for a project before building it.",
  },
];

/* ------------------------------------------------------------------ */
/* Playgrounds                                                          */
/* ------------------------------------------------------------------ */

export const aiPlaygrounds: AiPlayground[] = [
  {
    id: "prompt-lab",
    kind: "prompt",
    name: "Prompt Lab",
    purpose: "Run controlled comparisons: same task, one variable changed, measured against a rubric.",
    concepts: ["prompting", "language-models", "evaluation"],
    competencies: ["use", "evaluate"],
    availableFor: ["10-11", "12-14"],
    guardrail: "Every run needs a question you're testing. Free chat is not a run.",
    status: "available",
  },
  {
    id: "image-ai-lab",
    kind: "image",
    name: "Image AI Lab",
    purpose: "Study how image models compose, where they fail, and what credit the output needs.",
    concepts: ["images", "copyright", "generative-ai"],
    competencies: ["understand", "create", "act"],
    availableFor: ["8-9", "10-11", "12-14"],
    guardrail: "No images of real people. Every output gets a made-with line.",
    status: "available",
  },
  {
    id: "voice-ai-lab",
    kind: "voice",
    name: "Voice AI Lab",
    purpose: "Compare transcripts across accents, speed and noise, and read confidence honestly.",
    concepts: ["voice", "prediction", "bias"],
    competencies: ["understand", "evaluate"],
    availableFor: ["8-9", "10-11", "12-14"],
    guardrail: "Your voice only. Recordings stay on this device in this build.",
    status: "available",
  },
  {
    id: "evaluation-lab",
    kind: "evaluation",
    name: "AI Evaluation Lab",
    purpose: "Score outputs against criteria written first, and catch confident fabrication.",
    concepts: ["evaluation", "hallucinations", "prediction"],
    competencies: ["evaluate", "reflect"],
    availableFor: ["10-11", "12-14"],
    guardrail: "Criteria before output. The rubric locks when the first run starts.",
    status: "available",
  },
  {
    id: "agent-lab",
    kind: "agent",
    name: "Agent Lab",
    purpose: "Give a system tools, watch the loop, and decide which steps need your approval.",
    concepts: ["agents", "safety", "automation"],
    competencies: ["understand", "act"],
    availableFor: ["12-14"],
    guardrail: "Nothing in this lab touches the real world. Every action is simulated.",
    status: "available",
  },
  {
    id: "automation-lab",
    kind: "automation",
    name: "Automation Lab",
    purpose: "Design trigger-and-step processes and mark where a human still has to look.",
    concepts: ["automation", "human-ai-collaboration"],
    competencies: ["create", "act"],
    availableFor: ["12-14"],
    guardrail: "Every design needs a failure path, not only a happy path.",
    status: "available",
  },
  {
    id: "ethics-lab",
    kind: "ethics",
    name: "AI Ethics Lab",
    purpose: "Take real deployment cases, argue both sides, then commit to a position you can defend.",
    concepts: ["ethics", "bias", "privacy", "copyright"],
    competencies: ["reflect", "act"],
    availableFor: ["10-11", "12-14"],
    guardrail: "You must write the strongest argument against your own position.",
    status: "available",
  },
];

/* ------------------------------------------------------------------ */
/* Experiments                                                          */
/* ------------------------------------------------------------------ */

export const aiExperiments: AiExperiment[] = [
  {
    id: "exp-prompt-spec",
    playgroundId: "prompt-lab",
    kind: "prompt",
    title: "One variable at a time",
    question: "Does naming the audience change the answer more than asking politely?",
    framing: {
      "8-9": {
        brief: "Ask for the same thing twice. Change one word. See what moves.",
        watchFor: "Did it get easier to read, or just longer?",
      },
      "10-11": {
        brief: "Write two requests that differ in exactly one way, then score both.",
        watchFor: "If you changed two things, the result tells you nothing.",
      },
      "12-14": {
        brief: "Treat the prompt as a spec. State audience, format, constraint and a success test.",
        watchFor: "Fluency is not accuracy. Score the lines separately.",
      },
    },
    inputLabel: "Your request",
    inputPlaceholder: "Explain tides to…",
    seeds: [
      { id: "a", label: "Vague", value: "Explain tides." },
      {
        id: "b",
        label: "Specified",
        value:
          "Explain tides to a 10-year-old in exactly 4 sentences. Use one everyday comparison. No new vocabulary without a definition.",
      },
    ],
    actions: [
      {
        id: "fast",
        label: "Small fast model",
        describes: "Answers quickly, keeps it short.",
        tradeoff: "Slips on anything that needs several steps of reasoning.",
      },
      {
        id: "careful",
        label: "Larger careful model",
        describes: "Takes longer, holds more of your constraints at once.",
        tradeoff: "Slower and more expensive; still invents confidently.",
      },
    ],
    criteria: [
      {
        id: "accurate",
        label: "Accurate",
        strong: "Nothing in it is false or invented.",
        weak: "Contains a claim you can't check.",
      },
      {
        id: "fit",
        label: "Fits the audience",
        strong: "A ten-year-old reads it without stopping.",
        weak: "Uses words the reader doesn't have yet.",
      },
      {
        id: "followed",
        label: "Followed the constraint",
        strong: "Obeyed the length and format you set.",
        weak: "Ignored the limits you wrote.",
      },
    ],
    reflectionPrompts: [
      "Which single change made the biggest difference?",
      "What did you learn about the model, not about the topic?",
      "Would you have got a good answer faster by writing it yourself?",
    ],
    runBudget: 6,
  },
  {
    id: "exp-image-tells",
    playgroundId: "image-ai-lab",
    kind: "image",
    title: "Find the tell",
    question: "Where does a generated image fall apart, and can you predict it beforehand?",
    framing: {
      "8-9": {
        brief: "Ask for a picture. Before you look, guess what it will get wrong.",
        watchFor: "Hands, letters, and how many of something there are.",
      },
      "10-11": {
        brief: "Predict the failure, then run the five-point check on the result.",
        watchFor: "Counting and text are the easiest tells to verify.",
      },
      "12-14": {
        brief: "Specify a scene with countable objects and readable text, then audit it.",
        watchFor: "Style imitation is a credit question, not only a quality question.",
      },
    },
    inputLabel: "Describe the picture",
    inputPlaceholder: "A lighthouse with…",
    seeds: [
      { id: "a", label: "Simple", value: "A lighthouse at night." },
      {
        id: "b",
        label: "Countable + text",
        value: "A lighthouse with exactly three windows and a sign reading OPEN, at night, in fog.",
      },
    ],
    actions: [
      {
        id: "sketch",
        label: "Sketch pass",
        describes: "Rough composition, fast.",
        tradeoff: "Detail and text will be a mess.",
      },
      {
        id: "detailed",
        label: "Detailed pass",
        describes: "More coherent surfaces and lighting.",
        tradeoff: "Still cannot reliably count or spell.",
      },
    ],
    criteria: [
      {
        id: "asked",
        label: "Matches what you asked",
        strong: "Every element you named is present and correct.",
        weak: "Silently dropped or changed something.",
      },
      {
        id: "possible",
        label: "Physically possible",
        strong: "Shadows, counts and structures hold together.",
        weak: "Something in it could not exist.",
      },
      {
        id: "credit",
        label: "Honest credit",
        strong: "Made-with line names the tool and your part.",
        weak: "Presented as if you drew it.",
      },
    ],
    reflectionPrompts: [
      "What did you predict correctly before seeing it?",
      "Whose work does this style resemble, and does that matter here?",
      "What would you have to draw yourself to make this yours?",
    ],
    runBudget: 5,
  },
  {
    id: "exp-voice-transcript",
    playgroundId: "voice-ai-lab",
    kind: "voice",
    title: "What it heard",
    question: "What makes a transcript worse — speed, accent, noise, or unusual names?",
    framing: {
      "8-9": {
        brief: "Say the same sentence loudly, quickly, and quietly. Compare what it wrote.",
        watchFor: "It will get names wrong most often.",
      },
      "10-11": {
        brief: "Change one condition per run and log the errors you find.",
        watchFor: "Confidence goes down before accuracy does — sometimes.",
      },
      "12-14": {
        brief: "Test with names and vocabulary outside the training distribution.",
        watchFor: "Higher error rates for some accents is a data problem, not a speaking problem.",
      },
    },
    inputLabel: "The sentence you said",
    inputPlaceholder: "Type what you actually said…",
    seeds: [
      { id: "a", label: "Everyday", value: "Please open the window before the storm arrives." },
      { id: "b", label: "Names", value: "Azouz and Nayla walked from Marrakech to Essaouira." },
    ],
    actions: [
      {
        id: "clean",
        label: "Quiet room",
        describes: "Clean audio, normal pace.",
        tradeoff: "Flatters the system. Not how real rooms sound.",
      },
      {
        id: "noisy",
        label: "Noisy room",
        describes: "Background chatter, faster speech.",
        tradeoff: "Error rate rises sharply; confidence lags behind.",
      },
    ],
    criteria: [
      {
        id: "words",
        label: "Right words",
        strong: "Transcript matches what you said.",
        weak: "Substituted words that sound similar.",
      },
      {
        id: "names",
        label: "Names handled",
        strong: "Kept names intact.",
        weak: "Turned a name into a common word.",
      },
      {
        id: "honest",
        label: "Honest confidence",
        strong: "Low confidence where it was wrong.",
        weak: "High confidence on a mistake.",
      },
    ],
    reflectionPrompts: [
      "Which condition broke it fastest?",
      "Who would this system serve worst, and why?",
      "Would you trust it to take notes for you unsupervised?",
    ],
    runBudget: 6,
  },
  {
    id: "exp-eval-fabrication",
    playgroundId: "evaluation-lab",
    kind: "evaluation",
    title: "Criteria first",
    question: "Can you catch a confident invention when the writing sounds excellent?",
    framing: {
      "8-9": {
        brief: "Write down what a good answer needs. Then look at the answer.",
        watchFor: "Nice writing is not the same as true writing.",
      },
      "10-11": {
        brief: "Lock your rubric, then score two answers on it and defend the gap.",
        watchFor: "Names, dates and quotes are where inventions hide.",
      },
      "12-14": {
        brief: "Score against fixed criteria and mark anything you cannot verify as unverified.",
        watchFor: "Unverifiable is a valid score. Guessing is not.",
      },
    },
    inputLabel: "The claim you're checking",
    inputPlaceholder: "Paste the answer you want to judge…",
    seeds: [
      {
        id: "a",
        label: "Fluent claim",
        value:
          "The 1873 Marrakech Tide Convention established the first standardised lighthouse signal code, cited in Delacroix (1874).",
      },
      {
        id: "b",
        label: "Hedged claim",
        value: "Lighthouse signal codes were standardised at different times in different countries.",
      },
    ],
    actions: [
      {
        id: "asis",
        label: "Judge as written",
        describes: "Score the output exactly as it arrived.",
        tradeoff: "You may reward confident fluency.",
      },
      {
        id: "grounded",
        label: "Ask for sources",
        describes: "Require a checkable source for each claim.",
        tradeoff: "Sources can be invented too — you still have to check them.",
      },
    ],
    criteria: [
      {
        id: "true",
        label: "Verifiable",
        strong: "Every claim can be checked somewhere else.",
        weak: "Names or dates you cannot find anywhere.",
      },
      {
        id: "hedge",
        label: "Honest uncertainty",
        strong: "Says when it doesn't know.",
        weak: "Equally confident about everything.",
      },
      {
        id: "useful",
        label: "Answers the question",
        strong: "Addresses what was actually asked.",
        weak: "Impressive and off-topic.",
      },
    ],
    reflectionPrompts: [
      "Which claim sounded most true and was least checkable?",
      "What source would settle it?",
      "Did the fluent answer nearly convince you?",
    ],
    runBudget: 5,
  },
  {
    id: "exp-agent-permissions",
    playgroundId: "agent-lab",
    kind: "agent",
    title: "What may it do alone?",
    question: "Which steps in a plan should never run without a human pressing yes?",
    framing: {
      "8-9": {
        brief: "A helper wants to do jobs for you. Say which ones need permission.",
        watchFor: "Sending things to other people always needs permission.",
      },
      "10-11": {
        brief: "Read the plan it made and mark the steps that need approval.",
        watchFor: "A wrong action costs more than a wrong sentence.",
      },
      "12-14": {
        brief: "Scope each tool to the smallest permission that still completes the goal.",
        watchFor: "Blast radius: what does a bad step reach?",
      },
    },
    inputLabel: "The goal you'd give it",
    inputPlaceholder: "Organise my science project…",
    seeds: [
      { id: "a", label: "Low stakes", value: "Sort my notes for the science project into three topics." },
      {
        id: "b",
        label: "Higher stakes",
        value: "Email my group the project plan and delete the old drafts.",
      },
    ],
    actions: [
      {
        id: "readonly",
        label: "Read-only tools",
        describes: "It can look, list and summarise. It cannot change anything.",
        tradeoff: "Safe, but you still do all the doing.",
      },
      {
        id: "acting",
        label: "Acting tools",
        describes: "It can send, write and delete.",
        tradeoff: "One misread instruction now has real consequences.",
      },
    ],
    criteria: [
      {
        id: "scoped",
        label: "Smallest permission",
        strong: "Each tool can do only what the goal needs.",
        weak: "Broad access 'just in case'.",
      },
      {
        id: "checkpoint",
        label: "Human checkpoints",
        strong: "Irreversible steps wait for approval.",
        weak: "Sends or deletes on its own.",
      },
      {
        id: "recovery",
        label: "Recoverable",
        strong: "You could undo every step.",
        weak: "A wrong step is permanent.",
      },
    ],
    reflectionPrompts: [
      "Which step would you never automate, at any age?",
      "What is the worst thing a bad step could reach here?",
      "How would you find out it went wrong?",
    ],
    runBudget: 4,
  },
  {
    id: "exp-automation-rule",
    playgroundId: "automation-lab",
    kind: "automation",
    title: "Trigger, steps, checkpoint",
    question: "Where does the human still have to look for this to be safe?",
    framing: {
      "8-9": {
        brief: "Write one when-this-then-that rule.",
        watchFor: "What starts it? What if it starts by mistake?",
      },
      "10-11": {
        brief: "Write the trigger and the steps, then mark the one a person approves.",
        watchFor: "A process with no checkpoint isn't finished.",
      },
      "12-14": {
        brief: "Design the happy path and the failure path. Both are required.",
        watchFor: "Silent failure at 3am is the case that matters.",
      },
    },
    inputLabel: "The process to automate",
    inputPlaceholder: "When a new reading arrives…",
    seeds: [
      {
        id: "a",
        label: "Simple",
        value: "When I finish a lab, save a copy of my notes to the project folder.",
      },
      {
        id: "b",
        label: "Consequential",
        value: "When a sensor reading is too high, message the whole class and stop the experiment.",
      },
    ],
    actions: [
      {
        id: "dryrun",
        label: "Dry run",
        describes: "Show what would happen without doing anything.",
        tradeoff: "Won't reveal problems that only appear for real.",
      },
      {
        id: "live",
        label: "Live (simulated)",
        describes: "Runs the steps against fake data.",
        tradeoff: "Fake data is always tidier than the real thing.",
      },
    ],
    criteria: [
      {
        id: "trigger",
        label: "Clear trigger",
        strong: "You can say exactly what starts it.",
        weak: "Starts 'when it seems right'.",
      },
      {
        id: "human",
        label: "Human checkpoint",
        strong: "A person approves anything that reaches other people.",
        weak: "Fully automatic with real consequences.",
      },
      {
        id: "failure",
        label: "Failure path",
        strong: "You wrote what happens when a step fails.",
        weak: "Only the happy path exists.",
      },
    ],
    reflectionPrompts: [
      "What does this save you, honestly, in minutes?",
      "Who gets hurt if it fires by accident?",
      "How would you notice it stopped working?",
    ],
    runBudget: 4,
  },
  {
    id: "exp-ethics-case",
    playgroundId: "ethics-lab",
    kind: "ethics",
    title: "Argue the other side",
    question: "Can you state the strongest case against your own position?",
    framing: {
      "8-9": {
        brief: "Say who it helps and who it hurts. Two lists.",
        watchFor: "Most things have both. That's normal.",
      },
      "10-11": {
        brief: "Take a side, then write the best argument against yourself.",
        watchFor: "If the other side sounds silly, you haven't understood it.",
      },
      "12-14": {
        brief: "Name the harm you're measuring, choose a position, and state what would change your mind.",
        watchFor: "Context decides. The same tool differs by setting.",
      },
    },
    inputLabel: "Your position",
    inputPlaceholder: "I think schools should…",
    seeds: [
      {
        id: "a",
        label: "Grading",
        value: "Schools should let AI grade written homework so feedback comes back the same day.",
      },
      {
        id: "b",
        label: "Voice",
        value: "It should be legal to clone a famous singer's voice for a school project.",
      },
    ],
    actions: [
      {
        id: "steelman",
        label: "Strongest opposing case",
        describes: "Returns the best version of the argument against you.",
        tradeoff: "It will be uncomfortable. That's the point.",
      },
      {
        id: "affected",
        label: "Who is affected",
        describes: "Lists the people this lands on, including ones you forgot.",
        tradeoff: "A list is not a decision. You still have to choose.",
      },
    ],
    criteria: [
      {
        id: "fair",
        label: "Fair to the other side",
        strong: "Someone who disagrees would accept your summary.",
        weak: "You built a version that's easy to knock down.",
      },
      {
        id: "specific",
        label: "Specific harm named",
        strong: "You said who, and how.",
        weak: "General worry with no person in it.",
      },
      {
        id: "movable",
        label: "Says what would change it",
        strong: "You named evidence that would move you.",
        weak: "Nothing could change your mind.",
      },
    ],
    reflectionPrompts: [
      "Did anything shift while you wrote the opposing case?",
      "Who is affected that you didn't think of at first?",
      "What evidence would change your position?",
    ],
    runBudget: 4,
  },
];

export const aiSession = { usedMinutes: 14, capMinutes: 35, runsToday: 5 };
