/**
 * Coding pathway mock data.
 *
 * The concept spine is written once with a compact framing tuple per age so
 * the eighteen entries stay readable and stay in teaching order. The labs are
 * fully authored — they are what the workbench actually renders.
 */
import type {
  AdapterDescriptor,
  CodeFile,
  CodingConcept,
  CodingConceptId,
  CodingLab,
  ConceptFraming,
  MentorSupport,
  MentorSupportKind,
  ProjectSnapshot,
} from "@/types/coding";
import type { MasteryState } from "@/types/curriculum";

type FramingTuple = [title: string, summary: string, surface: ConceptFraming["surface"], provesIt: string];

function framing(t: FramingTuple): ConceptFraming {
  return { title: t[0], summary: t[1], surface: t[2], provesIt: t[3] };
}

interface ConceptSeed {
  id: CodingConceptId;
  objective: string;
  requires: CodingConceptId[];
  coreFor: CodingConcept["coreFor"];
  mastery: MasteryState;
  evidence: string[];
  young: FramingTuple;
  middle: FramingTuple;
  older: FramingTuple;
}

const seeds: ConceptSeed[] = [
  {
    id: "computational-thinking",
    objective: "Break a problem into steps a machine could follow, before writing anything.",
    requires: [],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "mastered",
    evidence: ["Wrote a nine-step sandwich algorithm a partner could follow exactly."],
    young: ["Thinking in steps", "Big jobs are lots of small jobs in order.", "unplugged", "You told a partner how to draw a house and they drew it right."],
    middle: ["Decomposition", "Split a problem until each piece is small enough to solve.", "unplugged", "You planned a project on paper before opening the editor."],
    older: ["Computational thinking", "Decomposition, pattern recognition, abstraction, algorithm design.", "unplugged", "You wrote a design note that survived contact with the code."],
  },
  {
    id: "sequences",
    objective: "Order instructions so the result is predictable and repeatable.",
    requires: ["computational-thinking"],
    coreFor: ["8-9"],
    mastery: "mastered",
    evidence: ["Rover reached the flag in twelve blocks with no wasted moves."],
    young: ["Order matters", "Swap two steps and everything changes.", "blocks", "You fixed a program by moving one block."],
    middle: ["Sequence", "Programs run top to bottom unless you say otherwise.", "blocks", "You predicted the output before pressing run — and were right."],
    older: ["Control flow: sequence", "Statements execute in order; order is a design decision.", "text", "You traced execution line by line on paper."],
  },
  {
    id: "logic",
    objective: "Reason about true and false, and combine conditions correctly.",
    requires: ["sequences"],
    coreFor: ["8-9", "10-11"],
    mastery: "proficient",
    evidence: ["Sorted twelve statements into true/false with no help."],
    young: ["True or not true", "Some things are yes, some are no. Computers only know those two.", "blocks", "You said which door opens before testing it."],
    middle: ["Boolean logic", "and, or, not — and what they do to a decision.", "blocks-plus-text", "You wrote a rule with two conditions that behaved as expected."],
    older: ["Boolean algebra", "Truth tables, short-circuiting, De Morgan's laws in practice.", "text", "You simplified a tangled condition without changing behaviour."],
  },
  {
    id: "patterns",
    objective: "Spot repetition and structure that can be generalised.",
    requires: ["sequences"],
    coreFor: ["8-9", "10-11"],
    mastery: "proficient",
    evidence: ["Found the repeat in a 24-block program and named it."],
    young: ["Spot the repeat", "If you did it three times, there's a shortcut.", "blocks", "You circled the part that repeated."],
    middle: ["Pattern recognition", "Repetition in code is a signal, not a coincidence.", "blocks-plus-text", "You replaced copy-pasted blocks with one loop."],
    older: ["Generalisation", "Recognise the shape of a problem you have solved before.", "text", "You reused an approach across two unrelated labs."],
  },
  {
    id: "conditionals",
    objective: "Make a program choose between paths based on a condition.",
    requires: ["logic"],
    coreFor: ["8-9", "10-11"],
    mastery: "proficient",
    evidence: ["Built a two-branch traffic light that never showed both colours."],
    young: ["If this, then that", "Ask a question, do something different depending on the answer.", "blocks", "Your sprite dodged the wall only when it was close."],
    middle: ["Conditionals", "if / else if / else, and why order of tests matters.", "blocks-plus-text", "You caught a bug caused by branch order."],
    older: ["Branching", "Guard clauses, exhaustive branches, and unreachable code.", "text", "You rewrote nested ifs as early returns."],
  },
  {
    id: "loops",
    objective: "Repeat work without repeating yourself, with a condition that ends.",
    requires: ["patterns", "conditionals"],
    coreFor: ["10-11"],
    mastery: "developing",
    evidence: ["Turned nine repeated blocks into one repeat-9."],
    young: ["Do it again", "One block can say 'do this ten times'.", "blocks", "You drew a square with a repeat block."],
    middle: ["Loops", "Counted loops and conditional loops, and how to stop one.", "blocks-plus-text", "You found and fixed a loop that never ended."],
    older: ["Iteration", "for / while, loop invariants, off-by-one errors.", "text", "You explained why a loop ran one time too many."],
  },
  {
    id: "variables",
    objective: "Store, name, and update a value that changes over time.",
    requires: ["sequences"],
    coreFor: ["10-11"],
    mastery: "developing",
    evidence: [],
    young: ["Boxes that remember", "A box with a name holds a number for later.", "blocks", "Your score went up when the sprite scored."],
    middle: ["Variables", "Naming, assigning, updating — and choosing a good name.", "blocks-plus-text", "You renamed x to lives and the code got easier to read."],
    older: ["State", "Scope, mutation, and why shared state causes bugs.", "text", "You narrowed a bug to one variable being written in two places."],
  },
  {
    id: "functions",
    objective: "Wrap a behaviour in a name and reuse it with different inputs.",
    requires: ["loops", "variables"],
    coreFor: ["10-11", "12-14"],
    mastery: "practicing",
    evidence: [],
    young: ["Make your own block", "Teach the computer a new move and use it anywhere.", "blocks", "You made a 'draw star' block and used it five times."],
    middle: ["Functions", "Inputs go in, behaviour comes out, and the name explains why.", "blocks-plus-text", "Your function worked with three different inputs."],
    older: ["Functions and parameters", "Arguments, return values, purity, and single responsibility.", "text", "You extracted a function and the file got shorter."],
  },
  {
    id: "debugging",
    objective: "Find the cause of a defect by evidence, not by guessing.",
    requires: ["sequences"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "developing",
    evidence: ["Located a bug by printing one value at a time."],
    young: ["Find the mistake", "Something's wrong. Look at what actually happened, not what you meant.", "blocks", "You found the wrong block by testing halves."],
    middle: ["Debugging", "Reproduce, isolate, fix, re-test — in that order.", "blocks-plus-text", "You wrote down what you expected before running."],
    older: ["Systematic debugging", "Read the trace, form a hypothesis, test it, narrow the search.", "text", "You fixed a bug the error message did not point at."],
  },
  {
    id: "data",
    objective: "Hold many values together and get the one you need back out.",
    requires: ["variables"],
    coreFor: ["10-11", "12-14"],
    mastery: "practicing",
    evidence: [],
    young: ["Lists of things", "One name, lots of things inside it.", "blocks", "Your sprite picked a random word from a list."],
    middle: ["Lists and records", "Indexes, adding, removing, and looping through.", "blocks-plus-text", "You built a quiz from a list of questions."],
    older: ["Data structures", "Lists, dictionaries, nesting, and choosing the right shape.", "text", "You picked a dict over a list and said why."],
  },
  {
    id: "algorithms",
    objective: "Compare two correct solutions and judge which is better, and why.",
    requires: ["loops", "data"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    young: ["A better way", "Two ways can both work. One can still be smarter.", "unplugged", "You found the shorter path on the grid."],
    middle: ["Algorithms", "Search and sort, and counting the steps each takes.", "blocks-plus-text", "You counted comparisons for two sorts."],
    older: ["Algorithmic thinking", "Correctness, complexity, trade-offs, and edge cases.", "text", "You argued for an approach on grounds other than 'it works'."],
  },
  {
    id: "abstraction",
    objective: "Hide detail behind a name so the next problem gets simpler.",
    requires: ["functions", "algorithms"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    young: ["Give it a name", "Once it works, you don't have to think about the inside again.", "blocks", "You used your own block without reopening it."],
    middle: ["Abstraction", "Interfaces: what it does, not how it does it.", "text", "You used a function you wrote last week without re-reading it."],
    older: ["Abstraction layers", "Modules, contracts, and leaky abstractions.", "text", "You changed an implementation without changing its callers."],
  },
  {
    id: "visual-programming",
    objective: "Build a working program in a block environment with real structure.",
    requires: ["conditionals", "loops"],
    coreFor: ["8-9", "10-11"],
    mastery: "proficient",
    evidence: ["Shipped a three-scene animation with events and loops."],
    young: ["Building with blocks", "Snap blocks together and watch it happen.", "blocks", "You built something you wanted to show someone."],
    middle: ["Scratch and Blockly", "Events, sprites, broadcasts, and clean block structure.", "blocks", "Your project ran twice the same way."],
    older: ["Blocks as scaffolding", "The same constructs you're about to type by hand.", "blocks-plus-text", "You read your block program back as pseudocode."],
  },
  {
    id: "python",
    objective: "Write, run, and fix a text program in Python.",
    requires: ["functions", "data"],
    coreFor: ["12-14"],
    mastery: "practicing",
    evidence: [],
    young: ["Real words", "Grown-up code is just typing what the blocks said.", "blocks-plus-text", "You read a line of Python and knew what it did."],
    middle: ["First Python", "print, input, if, for — the same ideas, typed.", "blocks-plus-text", "You typed a working program without a block reference."],
    older: ["Python", "Functions, collections, files, and the standard library.", "text", "You built a tool you actually use."],
  },
  {
    id: "web",
    objective: "Structure and style a page that works on any screen.",
    requires: ["abstraction"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    young: ["Making a page", "Websites are boxes with words in them.", "blocks-plus-text", "You changed a heading and saw it update."],
    middle: ["HTML and CSS", "Elements, nesting, classes, and the box model.", "text", "You built a page from a sketch."],
    older: ["Web fundamentals", "Semantics, layout, responsiveness, and accessibility.", "text", "Your page worked with a keyboard alone."],
  },
  {
    id: "javascript",
    objective: "Make a page respond to what a person does.",
    requires: ["web", "python"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    young: ["Buttons that do things", "Click it, something happens.", "blocks-plus-text", "You wired a button to a change on screen."],
    middle: ["JavaScript basics", "Events, the DOM, and updating what's on screen.", "text", "Your page reacted without reloading."],
    older: ["JavaScript", "Events, state, async, and keeping UI and data in step.", "text", "You debugged an async ordering bug."],
  },
  {
    id: "projects",
    objective: "Take something from idea to a finished thing someone else can use.",
    requires: ["visual-programming"],
    coreFor: ["8-9", "10-11", "12-14"],
    mastery: "developing",
    evidence: ["Finished and published the Lantern animation."],
    young: ["Finishing things", "Started, stuck, finished. That's the whole skill.", "project", "Someone else used what you made."],
    middle: ["Projects", "Scope, iterate, test with a real user, ship.", "project", "You cut a feature to finish on time."],
    older: ["Engineering a project", "Plan, version, test, document, release.", "project", "Your project has a README someone could follow."],
  },
  {
    id: "ai-coding",
    objective: "Use an AI assistant without letting it do your thinking.",
    requires: ["debugging", "abstraction"],
    coreFor: ["12-14"],
    mastery: "introduced",
    evidence: [],
    young: ["Asking for a clue", "Ask for a nudge, not the answer.", "blocks", "You asked a question instead of asking for code."],
    middle: ["Working with an AI mentor", "Ask why, ask what to check, ask for an example of something else.", "blocks-plus-text", "You rejected a suggestion you couldn't explain."],
    older: ["AI-assisted development", "Review, verify, and take responsibility for every line you keep.", "text", "You found a bug in a suggestion before running it."],
  },
];

export const codingConcepts: CodingConcept[] = seeds.map((s) => ({
  id: s.id,
  objective: s.objective,
  requires: s.requires,
  coreFor: s.coreFor,
  mastery: s.mastery,
  evidence: s.evidence,
  framing: { "8-9": framing(s.young), "10-11": framing(s.middle), "12-14": framing(s.older) },
}));

/* ------------------------------- adapters -------------------------------- */

export const codingAdapters: AdapterDescriptor[] = [
  {
    id: "scratch",
    label: "Scratch",
    editor: "blocks",
    language: "Scratch blocks",
    status: "planned",
    note: "Shell renders the block stack and stage. The Scratch VM mounts here later.",
    supportsConsole: false,
    supportsPreview: true,
    supportsTests: true,
  },
  {
    id: "blockly",
    label: "Blockly",
    editor: "blocks",
    language: "Blockly",
    status: "available",
    note: "Block list and palette are live against mock execution.",
    supportsConsole: true,
    supportsPreview: true,
    supportsTests: true,
  },
  {
    id: "pyodide",
    label: "Python",
    editor: "text",
    language: "Python 3",
    status: "planned",
    note: "Editor, console and tests are wired. A Pyodide worker replaces the mock runner.",
    supportsConsole: true,
    supportsPreview: false,
    supportsTests: true,
  },
  {
    id: "javascript",
    label: "JavaScript",
    editor: "text",
    language: "JavaScript",
    status: "planned",
    note: "Runs in a sandboxed iframe later. Console contract is already fixed.",
    supportsConsole: true,
    supportsPreview: true,
    supportsTests: true,
  },
  {
    id: "html-css",
    label: "HTML & CSS",
    editor: "markup",
    language: "HTML / CSS",
    status: "available",
    note: "Preview renders the markup the learner writes, no execution needed.",
    supportsConsole: false,
    supportsPreview: true,
    supportsTests: true,
  },
  {
    id: "react",
    label: "React",
    editor: "text",
    language: "JSX",
    status: "planned",
    note: "Reserved for the 12–14 project track. Not offered to learners yet.",
    supportsConsole: true,
    supportsPreview: true,
    supportsTests: true,
  },
];

/* --------------------------------- labs ---------------------------------- */

const file = (path: string, language: CodeFile["language"], contents: string, readOnly = false): CodeFile => ({
  id: `f-${path.replace(/[^a-z0-9]/gi, "-")}`,
  path,
  language,
  contents,
  readOnly,
});

export const codingLabs: CodingLab[] = [
  {
    id: "lab-lantern-path",
    title: "Light the Lantern Path",
    premise: "The path lanterns went dark. Walk the keeper along it and light each one.",
    adapterId: "blockly",
    conceptIds: ["sequences", "loops", "visual-programming"],
    ageBands: ["8-9", "10-11"],
    minutes: 15,
    instructions: {
      "8-9": {
        goal: "Light all six lanterns.",
        steps: ["Move the keeper forward.", "Light a lantern when you're on it.", "Do it again until they all glow."],
        doneWhen: ["Six lanterns are lit.", "You used a repeat block instead of six copies."],
        constraint: "Use eight blocks or fewer.",
      },
      "10-11": {
        goal: "Light all six lanterns in eight blocks or fewer.",
        steps: [
          "Read the path: what repeats?",
          "Write one pass of the pattern first.",
          "Wrap the repeating part in a repeat block.",
          "Run, then count blocks.",
        ],
        doneWhen: ["All six lanterns lit.", "Eight blocks or fewer.", "No copy-pasted stacks."],
        constraint: "Eight blocks maximum — copy-paste won't fit.",
      },
      "12-14": {
        goal: "Express the path as a loop, then read your block program back as pseudocode.",
        steps: ["Identify the loop body.", "Find the terminating condition.", "Minimise the block count."],
        doneWhen: ["All lanterns lit.", "You can state the loop invariant in one sentence."],
        constraint: "Eight blocks maximum.",
      },
    },
    files: [file("path.blocks", "blocks", "// The block stack is the program.", true)],
    blocks: [
      { id: "b1", label: "when run clicked", kind: "event", depth: 0 },
      { id: "b2", label: "move forward", kind: "action", depth: 1 },
      { id: "b3", label: "light lantern", kind: "action", depth: 1 },
      { id: "b4", label: "move forward", kind: "action", depth: 1 },
      { id: "b5", label: "light lantern", kind: "action", depth: 1 },
    ],
    blockPalette: ["move forward", "turn left", "light lantern", "repeat ( ) times", "if on lantern", "wait 1 second"],
    tests: [
      { id: "t1", label: "All six lanterns are lit", status: "not-run" },
      { id: "t2", label: "Program uses eight blocks or fewer", status: "not-run" },
      { id: "t3", label: "No repeated stack of the same two blocks", status: "not-run" },
    ],
    hints: [
      "Look at your stack. Say out loud what repeats.",
      "How many times does that pair happen? That number goes somewhere.",
      "A repeat block holds other blocks inside it. What goes inside?",
    ],
  },
  {
    id: "lab-guard-gate",
    title: "The Gate That Decides",
    premise: "The gate should open only for someone carrying the right token, at the right hour.",
    adapterId: "blockly",
    conceptIds: ["logic", "conditionals", "variables"],
    ageBands: ["10-11"],
    minutes: 20,
    instructions: {
      "8-9": {
        goal: "Open the gate only when both things are true.",
        steps: ["Check the token.", "Check the hour.", "Open only if both are yes."],
        doneWhen: ["The gate stays shut when one answer is no."],
      },
      "10-11": {
        goal: "Open the gate when the visitor has a token AND the hour is before 18.",
        steps: [
          "Write the two checks separately first.",
          "Combine them with and.",
          "Test all four combinations, not just the one you expect.",
        ],
        doneWhen: ["Opens for token + hour 9.", "Stays shut for the other three cases."],
        constraint: "One if statement. No nesting.",
      },
      "12-14": {
        goal: "Express the gate rule as a single boolean expression and prove it with a truth table.",
        steps: ["Write the expression.", "Enumerate all four input pairs.", "Check each against the intended behaviour."],
        doneWhen: ["All four cases behave correctly.", "You wrote the truth table before running."],
      },
    },
    files: [file("gate.blocks", "blocks", "// Blocks drive the gate.", true)],
    blocks: [
      { id: "g1", label: "when visitor arrives", kind: "event", depth: 0 },
      { id: "g2", label: "if ( has token )", kind: "control", depth: 1 },
      { id: "g3", label: "open gate", kind: "action", depth: 2 },
    ],
    blockPalette: ["if ( ) then", "( ) and ( )", "( ) or ( )", "not ( )", "has token", "hour < ( )", "open gate", "say ( )"],
    tests: [
      { id: "t1", label: "Opens for: token yes, hour 9", status: "not-run" },
      { id: "t2", label: "Shut for: token yes, hour 20", status: "not-run" },
      { id: "t3", label: "Shut for: token no, hour 9", status: "not-run" },
      { id: "t4", label: "Shut for: token no, hour 20", status: "not-run" },
    ],
    hints: [
      "Your gate opens for two of the four visitors. Which two should it be?",
      "One check is missing entirely. What has the program never looked at?",
      "'and' means both. Where would a second condition attach to your if?",
    ],
  },
  {
    id: "lab-signal-counter",
    title: "Count the Signals",
    premise: "The relay tower logs every ping. Tell the keeper how many were strong enough to matter.",
    adapterId: "pyodide",
    conceptIds: ["loops", "variables", "data", "python"],
    ageBands: ["12-14"],
    minutes: 25,
    instructions: {
      "8-9": {
        goal: "Count the big numbers in the list.",
        steps: ["Look at each number.", "Add one to your count if it's big enough."],
        doneWhen: ["The count is right."],
      },
      "10-11": {
        goal: "Count how many readings are 40 or higher.",
        steps: ["Start a counter at zero.", "Loop through every reading.", "Add one when the reading qualifies.", "Print the counter."],
        doneWhen: ["It prints 5 for the sample data.", "It still works if the list changes."],
      },
      "12-14": {
        goal: "Return the count of readings at or above the threshold, for any list and any threshold.",
        steps: [
          "Write count_strong(readings, threshold).",
          "Do not hard-code the sample data or the answer.",
          "Handle the empty list without special-casing it.",
        ],
        doneWhen: ["Passes the sample.", "Passes an empty list.", "Passes a different threshold."],
        constraint: "No hard-coded 5.",
      },
    },
    files: [
      file(
        "main.py",
        "python",
        `readings = [12, 44, 51, 8, 40, 39, 67, 22]\n\ndef count_strong(values, threshold):\n    # Your work goes here.\n    count = 0\n    return count\n\nprint(count_strong(readings, 40))\n`,
      ),
      file("tower.py", "python", `# Provided. Reads the relay log.\n\ndef load_log(path):\n    return [12, 44, 51, 8, 40, 39, 67, 22]\n`, true),
    ],
    tests: [
      { id: "t1", label: "count_strong(sample, 40) == 5", status: "not-run" },
      { id: "t2", label: "count_strong([], 40) == 0", status: "not-run" },
      { id: "t3", label: "count_strong(sample, 60) == 1", status: "not-run" },
      { id: "t4", label: "No hard-coded return value", status: "not-run" },
    ],
    hints: [
      "Your function returns the same number no matter what you pass it. Where does count ever change?",
      "The loop that visits every reading — is it there yet?",
      "Inside the loop you need a decision: does this reading count? What does Python use for that?",
    ],
  },
  {
    id: "lab-keeper-card",
    title: "Build the Keeper's Card",
    premise: "Every keeper gets a card in the hall. Yours has to hold up on a phone screen.",
    adapterId: "html-css",
    conceptIds: ["web", "abstraction"],
    ageBands: ["12-14"],
    minutes: 25,
    instructions: {
      "8-9": {
        goal: "Put a name and a picture on the card.",
        steps: ["Write the name in a heading.", "Add a line about them."],
        doneWhen: ["The card shows a name."],
      },
      "10-11": {
        goal: "Build a card with a heading, a description and a role tag.",
        steps: ["Structure it in HTML first.", "Then style it.", "Check it at phone width."],
        doneWhen: ["All three parts are present.", "Nothing overflows at 320px."],
      },
      "12-14": {
        goal: "Build a semantic, responsive card that survives a long name and a narrow screen.",
        steps: [
          "Choose elements by meaning, not by looks.",
          "Style with classes, not inline styles.",
          "Test with a 40-character name at 320px.",
        ],
        doneWhen: ["Semantic elements used.", "No inline styles.", "No overflow at 320px."],
        constraint: "No fixed pixel widths on the card itself.",
      },
    },
    files: [
      file(
        "index.html",
        "html",
        `<article class="card">\n  <h2 class="card__name">Koda</h2>\n  <p class="card__role">Coding mentor</p>\n</article>\n`,
      ),
      file(
        "styles.css",
        "css",
        `.card {\n  padding: 1rem;\n  border: 1px solid #3a3a3a;\n  border-radius: 12px;\n}\n`,
      ),
    ],
    tests: [
      { id: "t1", label: "Uses semantic elements (article, h2, p)", status: "not-run" },
      { id: "t2", label: "No inline style attributes", status: "not-run" },
      { id: "t3", label: "No fixed width on .card", status: "not-run" },
      { id: "t4", label: "Long name does not overflow at 320px", status: "not-run" },
    ],
    hints: [
      "Open it narrow. What is the first thing that breaks?",
      "Something in your CSS is telling the card exactly how wide to be. Find it.",
      "A card that can't grow can't fit a long name. What could you use instead of a fixed width?",
    ],
  },
  {
    id: "lab-review-the-suggestion",
    title: "Review the Suggestion",
    premise: "An AI assistant proposed a fix. It runs. It is also wrong. Find out where.",
    adapterId: "javascript",
    conceptIds: ["debugging", "ai-coding", "javascript"],
    ageBands: ["12-14"],
    minutes: 20,
    instructions: {
      "8-9": {
        goal: "Find the mistake in the code someone else wrote.",
        steps: ["Read it slowly.", "Try it with a small example."],
        doneWhen: ["You found the wrong line."],
      },
      "10-11": {
        goal: "Test the suggested code and find the case where it gives the wrong answer.",
        steps: ["Predict the output.", "Run it.", "Try an edge case."],
        doneWhen: ["You named the failing case."],
      },
      "12-14": {
        goal: "Identify the defect in an AI suggestion, explain it in one sentence, then fix it yourself.",
        steps: [
          "Do not run it first. Read it and predict.",
          "Find an input where prediction and behaviour differ.",
          "Write the one-sentence explanation before editing.",
        ],
        doneWhen: ["Failing input identified.", "Explanation written.", "All tests pass after your fix."],
        constraint: "You may not ask the mentor to write the fix. It won't.",
      },
    },
    files: [
      file(
        "average.js",
        "javascript",
        `// Suggested by an assistant. Review before keeping.\nexport function average(values) {\n  let total = 0;\n  for (let i = 0; i <= values.length; i++) {\n    total += values[i];\n  }\n  return total / values.length;\n}\n`,
      ),
    ],
    tests: [
      { id: "t1", label: "average([2, 4, 6]) === 4", status: "not-run" },
      { id: "t2", label: "average([5]) === 5", status: "not-run" },
      { id: "t3", label: "average([]) does not return NaN", status: "not-run" },
    ],
    hints: [
      "Run it on [2, 4, 6]. Is the answer a number you recognise?",
      "Count the times the loop body runs. Compare that to how many values exist.",
      "Look hard at the comparison in the loop header. What is the last index that actually exists?",
    ],
  },
];

/* ------------------------------ mentor voice ------------------------------ */

/** Per-lab mentor lines, keyed by support kind. Koda unless noted. */
export const mentorLibrary: Record<string, Partial<Record<MentorSupportKind, MentorSupport>>> = {
  "lab-signal-counter": {
    hint: {
      kind: "hint",
      characterId: "koda",
      body: "Your function gives back the same number every time. Something inside it never changes.",
      askBack: "Which line is supposed to change count?",
    },
    explanation: {
      kind: "explanation",
      characterId: "koda",
      body: "A counter needs three things: a starting value, a place where it goes up, and a place where it's handed back. You have two of the three.",
      askBack: "Which one is missing?",
    },
    "debugging-question": {
      kind: "debugging-question",
      characterId: "koda",
      body: "Before you change anything: if you printed count inside the loop, what would you expect to see?",
      askBack: "Now run it and print it. Did it match?",
    },
    "guided-correction": {
      kind: "guided-correction",
      characterId: "koda",
      body: "You're close. Line 5 needs to run once per reading, not once total. Move it — I'm not going to tell you where.",
      askBack: "Which block of lines runs once per reading?",
    },
    example: {
      kind: "example",
      characterId: "koda",
      exampleOf: "counting in a different problem",
      body: "Different problem: counting vowels in a word.\n\ncount = 0\nfor letter in word:\n    if letter in 'aeiou':\n        count += 1\n\nSame shape. Not your data.",
      askBack: "What is the equivalent of 'letter in aeiou' in your lab?",
    },
    "concept-explanation": {
      kind: "concept-explanation",
      characterId: "koda",
      body: "A variable is a name pointing at a value. count += 1 means: take what count points at, add one, point count at the new value. It is not a fact about the world; it's a running total you maintain.",
    },
    reflection: {
      kind: "reflection",
      characterId: "koda",
      body: "You got there. Worth noticing: you found it by printing, not by staring.",
      askBack: "What would you print first next time something returns a constant?",
    },
  },
  "lab-review-the-suggestion": {
    hint: {
      kind: "hint",
      characterId: "koda",
      body: "The code runs. That is not the same as the code being right.",
      askBack: "What's the smallest input you could check by hand?",
    },
    "debugging-question": {
      kind: "debugging-question",
      characterId: "koda",
      body: "The array has three items. How many times does that loop run?",
      askBack: "What is at values[3]?",
    },
    "guided-correction": {
      kind: "guided-correction",
      characterId: "koda",
      body: "The defect is in the loop header, and it is one character wide. I'm not typing it for you — that's the whole exercise.",
    },
    "concept-explanation": {
      kind: "concept-explanation",
      characterId: "koda",
      body: "Indexes start at 0, so an array of length 3 has valid indexes 0, 1, 2. A loop that continues while i <= length touches one index too many. That is an off-by-one error, and it is the most common bug in the world.",
    },
    example: {
      kind: "example",
      characterId: "koda",
      exampleOf: "a correct loop over a different array",
      body: "for (let i = 0; i < names.length; i++) { console.log(names[i]); }\n\nLook at the comparison. Compare it to yours.",
    },
    reflection: {
      kind: "reflection",
      characterId: "koda",
      body: "You caught a bug in code you didn't write, before trusting it. That is the actual skill in AI-assisted development.",
      askBack: "What will you check first on the next suggestion?",
    },
  },
};

export const mentorFallback: Record<MentorSupportKind, MentorSupport> = {
  hint: {
    kind: "hint",
    characterId: "koda",
    body: "Say out loud what you expected to happen, then what actually happened. The gap between those two is where the answer lives.",
    askBack: "Which one surprised you?",
  },
  explanation: {
    kind: "explanation",
    characterId: "koda",
    body: "Read your program back one line at a time as if you were the computer. No skipping. The line where your story stops matching is the line to look at.",
  },
  "debugging-question": {
    kind: "debugging-question",
    characterId: "koda",
    body: "What is the smallest input where this still goes wrong?",
    askBack: "Try it and tell me what you saw.",
  },
  "guided-correction": {
    kind: "guided-correction",
    characterId: "koda",
    body: "You're in the right area. The problem is in the part you wrote last — go back to it and change one thing, then test.",
  },
  example: {
    kind: "example",
    characterId: "koda",
    exampleOf: "a similar shape on different data",
    body: "Here's the same idea solving a different problem. Read the shape, not the words — then map it onto yours yourself.",
  },
  "concept-explanation": {
    kind: "concept-explanation",
    characterId: "koda",
    body: "Let's step off the lab for a second and get the idea straight, because once it's straight the lab is small.",
  },
  reflection: {
    kind: "reflection",
    characterId: "koda",
    body: "Before you move on: what did you try that didn't work, and what did that tell you?",
    askBack: "Would you do it in the same order next time?",
  },
};

/* ------------------------------ save history ------------------------------ */

export const projectHistorySeed: Record<string, ProjectSnapshot[]> = {
  "lab-signal-counter": [
    {
      id: "s3",
      labId: "lab-signal-counter",
      savedAt: "2026-08-09T13:40:00Z",
      note: "Added the loop. Still returns 0.",
      origin: "run",
      testsPassed: 1,
      testsTotal: 4,
      files: [],
    },
    {
      id: "s2",
      labId: "lab-signal-counter",
      savedAt: "2026-08-09T13:22:00Z",
      note: "Renamed values → readings so it reads properly.",
      origin: "manual",
      testsPassed: 0,
      testsTotal: 4,
      files: [],
    },
    {
      id: "s1",
      labId: "lab-signal-counter",
      savedAt: "2026-08-09T13:05:00Z",
      note: "Opened the lab.",
      origin: "auto",
      testsPassed: 0,
      testsTotal: 4,
      files: [],
    },
  ],
};
