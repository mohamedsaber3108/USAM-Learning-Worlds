/**
 * Mock curriculum data.
 *
 * Everything here is illustrative structure, not authoritative content. It
 * exists so the UI can be built against the real shape of a curriculum
 * service. Objectives are written as learning targets, not as facts to trust.
 */
import type {
  AgeVariant,
  CurriculumNode,
  CurriculumWorld,
  MasteryState,
  PathStatus,
  WorldLocation,
  WorldRegion,
} from "@/types/curriculum";
import type { AgeBand, ID } from "@/types/domain";

/* --------------------------------- helpers -------------------------------- */

const bandFor = (age: 8 | 10 | 12 | 14): AgeBand =>
  age <= 9 ? "8-9" : age <= 11 ? "10-11" : "12-14";

function variants(
  rows: [
    framing: string,
    challenge: string,
    surface: AgeVariant["surface"],
    support: AgeVariant["supportLevel"],
  ][],
): AgeVariant[] {
  const ages = [8, 10, 12, 14] as const;
  return rows.map(([framing, challenge, surface, supportLevel], i) => ({
    age: ages[i] ?? 14,
    band: bandFor(ages[i] ?? 14),
    framing,
    challenge,
    surface,
    supportLevel,
  }));
}

const days = (n: number) => {
  const d = new Date(Date.UTC(2026, 7, 9));
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
};

/* ---------------------------------- worlds -------------------------------- */

interface WorldSeed {
  id: ID;
  name: string;
  domainId: ID;
  tagline: string;
  description: string;
  glyph: string;
  accentColor: string;
  guideCharacterId: ID;
  x: number;
  y: number;
  unlocked: boolean;
  unlockHint: string | null;
  neighbourWorldIds: ID[];
  regions: {
    name: string;
    theme: string;
    summary: string;
    locations: {
      name: string;
      kind: WorldLocation["kind"];
      summary: string;
      x: number;
      y: number;
      unlocked?: boolean;
      unlockRequirement?: string;
      boss?: { title: string; summary: string; ready: boolean };
    }[];
  }[];
}

const WORLD_SEEDS: WorldSeed[] = [
  {
    id: "cw-english",
    name: "English World",
    domainId: "d-english",
    tagline: "Where language moves the tides",
    description:
      "A harbour city built on stories. Every building here asks you to say, read or write something real.",
    glyph: "Languages",
    accentColor: "var(--color-primary)",
    guideCharacterId: "ch-lina",
    x: 14,
    y: 18,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-communication", "cw-creative"],
    regions: [
      {
        name: "Signal Bay",
        theme: "Speaking & listening",
        summary: "Open water, open mouths. Conversation practice with people who answer back.",
        locations: [
          { name: "Harbour Studio", kind: "studio", summary: "Record, replay and rebuild how you sound.", x: 22, y: 34 },
          { name: "Listening Tower", kind: "building", summary: "Short audio, real accents, one question at a time.", x: 46, y: 22 },
        ],
      },
      {
        name: "Ink Quarter",
        theme: "Reading & writing",
        summary: "Narrow streets of drafts, edits and things worth reading twice.",
        locations: [
          { name: "Draft House", kind: "workshop", summary: "Where first attempts are supposed to be messy.", x: 66, y: 52 },
          {
            name: "The Long Table",
            kind: "arena",
            summary: "Defend a piece of writing out loud.",
            x: 78,
            y: 74,
            unlocked: false,
            unlockRequirement: "Reach proficient in Structuring a paragraph",
            boss: {
              title: "The Long Table",
              summary: "Present a piece you wrote and answer three unscripted questions about it.",
              ready: false,
            },
          },
        ],
      },
    ],
  },
  {
    id: "cw-coding",
    name: "Coding World",
    domainId: "d-coding",
    tagline: "Machines that do what you meant",
    description: "Foundries and workshops where instructions become behaviour you can watch.",
    glyph: "Code2",
    accentColor: "var(--color-secondary)",
    guideCharacterId: "ch-koda",
    x: 46,
    y: 50,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-robotics", "cw-ai"],
    regions: [
      {
        name: "The Forge",
        theme: "Sequence, loops, logic",
        summary: "First instructions, first bugs, first fixes.",
        locations: [
          { name: "Block Foundry", kind: "lab", summary: "Snap logic together and watch it run.", x: 20, y: 30 },
          { name: "Loop Yard", kind: "workshop", summary: "Do it again — but on purpose.", x: 44, y: 46 },
        ],
      },
      {
        name: "Script Ridge",
        theme: "Text programming",
        summary: "Where blocks become typed code and mistakes get louder.",
        locations: [
          { name: "Terminal Lab", kind: "lab", summary: "Write, run, read the error, try again.", x: 68, y: 30 },
          {
            name: "Debug Arena",
            kind: "arena",
            summary: "Fix someone else's broken program under pressure.",
            x: 82,
            y: 62,
            unlocked: false,
            unlockRequirement: "Reach developing in Reading an error message",
            boss: { title: "Debug Arena", summary: "Repair three unfamiliar programs and explain each fix.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-ai",
    name: "AI World",
    domainId: "d-ai",
    tagline: "How machines guess, and when they're wrong",
    description: "Bright labs where models are trained, tested and questioned out loud.",
    glyph: "Sparkles",
    accentColor: "var(--color-accent)",
    guideCharacterId: "ch-nova",
    x: 46,
    y: 18,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-coding", "cw-digital"],
    regions: [
      {
        name: "Lumen Labs",
        theme: "Pattern & prediction",
        summary: "Teach a machine by example, then find where it breaks.",
        locations: [
          { name: "Training Room", kind: "lab", summary: "Feed examples in, watch predictions change.", x: 26, y: 32 },
          { name: "Bias Bench", kind: "building", summary: "Whose examples were missing?", x: 54, y: 54 },
        ],
      },
      {
        name: "Prompt Gardens",
        theme: "Working with AI",
        summary: "Asking well, checking answers, staying the author.",
        locations: [
          { name: "Prompt Greenhouse", kind: "studio", summary: "Same question, five ways, different results.", x: 76, y: 36 },
          {
            name: "Verification Gate",
            kind: "arena",
            summary: "Catch the confident wrong answer.",
            x: 84,
            y: 70,
            unlocked: false,
            unlockRequirement: "Reach practicing in Checking an AI answer",
            boss: { title: "Verification Gate", summary: "Review five AI answers and justify which to trust.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-creative",
    name: "Creative World",
    domainId: "d-creativity",
    tagline: "Make something that wasn't there",
    description: "Studios for image, sound, story and design — with critique that is kind and specific.",
    glyph: "Palette",
    accentColor: "var(--color-primary)",
    guideCharacterId: "ch-fable",
    x: 14,
    y: 82,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-english", "cw-entrepreneurship"],
    regions: [
      {
        name: "Prism Quarter",
        theme: "Visual & sound",
        summary: "Colour, composition, rhythm — choices you can defend.",
        locations: [
          { name: "Colour Studio", kind: "studio", summary: "Why this palette and not that one.", x: 24, y: 38 },
          { name: "Sound Room", kind: "lab", summary: "Layer, cut, and listen again.", x: 52, y: 60 },
        ],
      },
      {
        name: "Story Hill",
        theme: "Narrative craft",
        summary: "Character, want, obstacle, change.",
        locations: [
          { name: "Writers' Loft", kind: "workshop", summary: "Draft a scene, cut it in half, keep the good part.", x: 74, y: 40 },
          {
            name: "Showcase Hall",
            kind: "arena",
            summary: "Publish and take real critique.",
            x: 86,
            y: 72,
            unlocked: false,
            unlockRequirement: "Publish one project to your portfolio",
            boss: { title: "Showcase Hall", summary: "Present a finished creation and revise it after feedback.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-entrepreneurship",
    name: "Entrepreneurship World",
    domainId: "d-entrepreneurship",
    tagline: "Ideas that survive contact with people",
    description: "A trading rise where an idea must meet a real person before it counts.",
    glyph: "Store",
    accentColor: "var(--color-secondary)",
    guideCharacterId: "ch-omar",
    x: 46,
    y: 82,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-creative", "cw-communication"],
    regions: [
      {
        name: "Market Rise",
        theme: "Value & customers",
        summary: "Who is this for, and what changes for them?",
        locations: [
          { name: "Idea Stalls", kind: "workshop", summary: "Pitch in one sentence, watch faces.", x: 26, y: 34 },
          { name: "Interview Bench", kind: "building", summary: "Ask five people, change your mind once.", x: 56, y: 56 },
        ],
      },
      {
        name: "Ledger Row",
        theme: "Numbers & decisions",
        summary: "Cost, price, trade-off — small numbers, real reasoning.",
        locations: [
          {
            name: "Pitch Stage",
            kind: "arena",
            summary: "Ninety seconds, one idea, three questions.",
            x: 80,
            y: 60,
            unlocked: false,
            unlockRequirement: "Complete one customer interview activity",
            boss: { title: "Pitch Stage", summary: "Pitch a venture idea and answer challenge questions live.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-stem",
    name: "STEM World",
    domainId: "d-science",
    tagline: "Test it before you believe it",
    description: "A ridge of observatories and benches where a claim needs evidence.",
    glyph: "FlaskConical",
    accentColor: "var(--color-accent)",
    guideCharacterId: "ch-sol",
    x: 80,
    y: 50,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-robotics", "cw-ai"],
    regions: [
      {
        name: "Vantage Ridge",
        theme: "Observe & measure",
        summary: "Notice carefully, record honestly.",
        locations: [
          { name: "Field Bench", kind: "lab", summary: "Measure the same thing three times.", x: 28, y: 36 },
          { name: "Model Shed", kind: "workshop", summary: "Build a simple model, then break it.", x: 58, y: 58 },
        ],
      },
      {
        name: "Proof Basin",
        theme: "Experiment & evidence",
        summary: "Fair tests, controlled variables, honest conclusions.",
        locations: [
          {
            name: "Experiment Hall",
            kind: "arena",
            summary: "Design a fair test from scratch.",
            x: 82,
            y: 34,
            unlocked: false,
            unlockRequirement: "Reach practicing in Making a fair test",
            boss: { title: "Experiment Hall", summary: "Run an experiment and defend the conclusion you drew.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-robotics",
    name: "Robotics World",
    domainId: "d-problem",
    tagline: "Code that touches the real world",
    description: "Gearworks bays where sensors, motors and mistakes make noise.",
    glyph: "Bot",
    accentColor: "var(--color-secondary)",
    guideCharacterId: "ch-rune",
    x: 80,
    y: 82,
    unlocked: false,
    unlockHint: "Opens when Coding World reaches developing in Loops with a purpose",
    neighbourWorldIds: ["cw-coding", "cw-stem"],
    regions: [
      {
        name: "Gearworks Bay",
        theme: "Sense & move",
        summary: "Read a sensor, decide, act.",
        locations: [
          { name: "Sensor Lab", kind: "lab", summary: "What the robot can actually tell.", x: 30, y: 40 },
          { name: "Assembly Floor", kind: "workshop", summary: "Build it badly, then better.", x: 62, y: 58 },
        ],
      },
      {
        name: "Trial Track",
        theme: "Control & tuning",
        summary: "Small adjustments, measured results.",
        locations: [
          {
            name: "Course Trials",
            kind: "arena",
            summary: "Get the machine through a course it has never seen.",
            x: 84,
            y: 40,
            unlocked: false,
            unlockRequirement: "Assemble one working sensor loop",
            boss: { title: "Course Trials", summary: "Tune a robot through an unfamiliar course and explain each change.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-communication",
    name: "Communication World",
    domainId: "d-communication",
    tagline: "Being understood on purpose",
    description: "Echo Commons: presenting, listening, disagreeing well.",
    glyph: "MessagesSquare",
    accentColor: "var(--color-primary)",
    guideCharacterId: "ch-hana",
    x: 14,
    y: 50,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-english", "cw-entrepreneurship"],
    regions: [
      {
        name: "Echo Commons",
        theme: "Explaining",
        summary: "Say the hard thing simply.",
        locations: [
          { name: "Explain Booth", kind: "studio", summary: "Teach one idea in sixty seconds.", x: 30, y: 40 },
          { name: "Question Garden", kind: "building", summary: "Better questions, fewer assumptions.", x: 64, y: 56 },
        ],
      },
      {
        name: "Bridge Row",
        theme: "Collaboration",
        summary: "Disagree with the idea, not the person.",
        locations: [
          {
            name: "Roundtable",
            kind: "arena",
            summary: "Hold a position, then update it in public.",
            x: 84,
            y: 36,
            unlocked: false,
            unlockRequirement: "Reach practicing in Explaining your thinking",
            boss: { title: "Roundtable", summary: "Debate respectfully and summarise the other side fairly.", ready: false },
          },
        ],
      },
    ],
  },
  {
    id: "cw-digital",
    name: "Digital Life World",
    domainId: "d-digital",
    tagline: "Living well online",
    description: "Waypoint: sources, safety, footprints and attention.",
    glyph: "ShieldCheck",
    accentColor: "var(--color-accent)",
    guideCharacterId: "ch-sable",
    x: 80,
    y: 18,
    unlocked: true,
    unlockHint: null,
    neighbourWorldIds: ["cw-ai", "cw-communication"],
    regions: [
      {
        name: "Waypoint",
        theme: "Sources & truth",
        summary: "Where did this come from, and who benefits?",
        locations: [
          { name: "Source Desk", kind: "building", summary: "Trace a claim back to somewhere.", x: 28, y: 34 },
          { name: "Footprint Room", kind: "lab", summary: "What you leave behind, and for how long.", x: 58, y: 58 },
        ],
      },
      {
        name: "Quiet District",
        theme: "Attention & wellbeing",
        summary: "Choosing where your attention goes.",
        locations: [
          {
            name: "Signal Check",
            kind: "arena",
            summary: "Sort real from engineered in a live feed.",
            x: 84,
            y: 38,
            unlocked: false,
            unlockRequirement: "Reach practicing in Checking a source",
            boss: { title: "Signal Check", summary: "Assess a mixed feed and justify every judgement.", ready: false },
          },
        ],
      },
    ],
  },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const curriculumWorlds: CurriculumWorld[] = [];
export const worldRegions: WorldRegion[] = [];
export const worldLocations: WorldLocation[] = [];

for (const seed of WORLD_SEEDS) {
  const regionIds: ID[] = [];
  seed.regions.forEach((region) => {
    const regionId = `${seed.id}-r-${slug(region.name)}`;
    const locationIds: ID[] = [];
    region.locations.forEach((loc) => {
      const locationId = `${seed.id}-l-${slug(loc.name)}`;
      locationIds.push(locationId);
      worldLocations.push({
        id: locationId,
        worldId: seed.id,
        regionId,
        name: loc.name,
        kind: loc.kind,
        summary: loc.summary,
        x: loc.x,
        y: loc.y,
        unlocked: loc.unlocked ?? seed.unlocked,
        unlockRequirement: loc.unlockRequirement ?? null,
        missionIds: [],
        projectIds: [],
        challengeIds: [],
        bossAssessment: loc.boss
          ? { id: `${locationId}-boss`, title: loc.boss.title, summary: loc.boss.summary, ready: loc.boss.ready }
          : null,
        skillNodeIds: [],
      });
    });
    regionIds.push(regionId);
    worldRegions.push({
      id: regionId,
      worldId: seed.id,
      name: region.name,
      theme: region.theme,
      summary: region.summary,
      locationIds,
    });
  });

  curriculumWorlds.push({
    id: seed.id,
    name: seed.name,
    domainId: seed.domainId,
    tagline: seed.tagline,
    description: seed.description,
    glyph: seed.glyph,
    accentColor: seed.accentColor,
    guideCharacterId: seed.guideCharacterId,
    x: seed.x,
    y: seed.y,
    unlocked: seed.unlocked,
    unlockHint: seed.unlockHint,
    regionIds,
    neighbourWorldIds: seed.neighbourWorldIds,
  });
}

/* ------------------------------ curriculum nodes -------------------------- */

interface NodeSeed {
  id: ID;
  name: string;
  summary: string;
  worldId: ID;
  domainId: ID;
  locationName: string;
  ageRange: [number, number];
  tier: number;
  prerequisiteIds: ID[];
  relatedIds: ID[];
  objectives: [string, CurriculumNode["objectives"][number]["cognitiveLevel"]][];
  activities: [string, CurriculumNode["activities"][number]["kind"], number][];
  practice: [string, CurriculumNode["practice"][number]["format"], number][];
  projects: [string, string][];
  assessment: [string, CurriculumNode["assessment"]["kind"], string];
  threshold: [number, number, boolean];
  intervals: number[];
  mastery: [MasteryState, number, number, string];
  pathStatus: PathStatus;
  variants: AgeVariant[];
}

const NODE_SEEDS: NodeSeed[] = [
  {
    id: "cn-eng-listening",
    name: "Listening for meaning",
    summary: "Hold on to what was said long enough to do something with it.",
    worldId: "cw-english",
    domainId: "d-english",
    locationName: "Listening Tower",
    ageRange: [8, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-com-explain"],
    objectives: [
      ["Retell the main idea of a short spoken passage in your own words", "understand"],
      ["Identify a detail that changes the meaning of what was said", "analyze"],
    ],
    activities: [
      ["Sound of the harbour", "story", 6],
      ["Say it back", "conversation", 8],
    ],
    practice: [["Retell drills", "spaced-review", 8]],
    projects: [["Audio postcard", "Listen to a clip and reply with your own recording."]],
    assessment: ["Retell without notes", "formative", "A recording where the main idea survives the retelling."],
    threshold: [0.8, 3, true],
    intervals: [1, 3, 7, 16],
    mastery: ["proficient", 0.82, 7, "Retells reliably; detail work is still developing."],
    pathStatus: "available",
    variants: variants([
      ["Listen, then tell me what happened.", "One short clip, pictures to point at.", "visual", "modelled"],
      ["Listen and retell the main idea.", "Two speakers, no pictures.", "conversation", "guided"],
      ["Summarise the argument, not just the events.", "Faster speech, unfamiliar accent.", "conversation", "coached"],
      ["Identify the claim, the evidence and the gap.", "Live discussion with follow-up questions.", "conversation", "independent"],
    ]),
  },
  {
    id: "cn-eng-paragraph",
    name: "Structuring a paragraph",
    summary: "One idea, supported, in an order that helps the reader.",
    worldId: "cw-english",
    domainId: "d-english",
    locationName: "Draft House",
    ageRange: [9, 14],
    tier: 1,
    prerequisiteIds: ["cn-eng-listening"],
    relatedIds: ["cn-cre-story"],
    objectives: [
      ["Write a paragraph that keeps to a single idea", "apply"],
      ["Support a statement with a reason or example", "apply"],
      ["Revise a paragraph after reading it aloud", "evaluate"],
    ],
    activities: [
      ["Find the wandering sentence", "guided-practice", 7],
      ["Draft, read aloud, cut", "build", 12],
    ],
    practice: [["Sentence ordering", "puzzle", 10], ["Revision reps", "spaced-review", 6]],
    projects: [["Harbour notice", "Write a short public notice people can act on."]],
    assessment: ["Draft and revision", "performance", "Two versions of a paragraph with the reasons for each change."],
    threshold: [0.75, 3, true],
    intervals: [2, 5, 12, 25],
    mastery: ["developing", 0.61, 4, "Single idea holds; supporting evidence is thin."],
    pathStatus: "recommended-next",
    variants: variants([
      ["Put your sentences in an order that makes sense.", "Three sentences, one picture prompt.", "visual", "modelled"],
      ["Write a paragraph about one idea.", "Add one reason for what you said.", "studio", "guided"],
      ["Structure a paragraph with claim and support.", "Revise after a peer reads it.", "studio", "coached"],
      ["Control emphasis and order for a specific reader.", "Rewrite for two different audiences.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-eng-argument",
    name: "Defending a position",
    summary: "Say what you think, show why, and handle a challenge.",
    worldId: "cw-english",
    domainId: "d-english",
    locationName: "The Long Table",
    ageRange: [11, 14],
    tier: 2,
    prerequisiteIds: ["cn-eng-paragraph"],
    relatedIds: ["cn-com-disagree"],
    objectives: [
      ["State a position and the evidence behind it", "evaluate"],
      ["Respond to a counter-question without abandoning or defending blindly", "evaluate"],
    ],
    activities: [["Three unscripted questions", "conversation", 15]],
    practice: [["Counter-question reps", "conversation", 5]],
    projects: [["Open letter", "Write and defend a letter about something you actually care about."]],
    assessment: ["The Long Table", "boss", "A live exchange where the position is held or changed for a stated reason."],
    threshold: [0.8, 2, true],
    intervals: [4, 10, 21],
    mastery: ["introduced", 0.18, 0, "Not yet attempted — prerequisite still developing."],
    pathStatus: "locked",
    variants: variants([
      ["Tell me what you think and why.", "One reason is enough.", "conversation", "modelled"],
      ["Give two reasons for your opinion.", "Answer one follow-up question.", "conversation", "guided"],
      ["Defend a position with evidence.", "Three unscripted questions.", "conversation", "coached"],
      ["Hold or revise a position under scrutiny.", "Argue a side you disagree with.", "conversation", "independent"],
    ]),
  },
  {
    id: "cn-cod-sequence",
    name: "Instructions in order",
    summary: "Computers do exactly what you said, in the order you said it.",
    worldId: "cw-coding",
    domainId: "d-coding",
    locationName: "Block Foundry",
    ageRange: [8, 12],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-cod-loops"],
    objectives: [
      ["Order steps so a program reaches a stated goal", "apply"],
      ["Predict what a short sequence will do before running it", "understand"],
    ],
    activities: [["Move the crane", "visual-coding", 8], ["Predict, then run", "guided-practice", 6]],
    practice: [["Sequence puzzles", "puzzle", 12]],
    projects: [["Foundry routine", "Program a machine to complete a five-step job."]],
    assessment: ["Predict and explain", "formative", "Correct prediction plus a reason, before the program runs."],
    threshold: [0.8, 3, false],
    intervals: [1, 3, 8, 18],
    mastery: ["mastered", 0.93, 11, "Consistent across new puzzles, including unfamiliar ones."],
    pathStatus: "available",
    variants: variants([
      ["Put the blocks in the right order.", "Four blocks, one goal.", "blocks", "modelled"],
      ["Plan the steps before you build them.", "Eight blocks, two goals.", "blocks", "guided"],
      ["Trace execution step by step.", "Predict output before running.", "blocks-and-script", "coached"],
      ["Reason about order and side effects.", "Refactor a working sequence to be shorter.", "code", "independent"],
    ]),
  },
  {
    id: "cn-cod-loops",
    name: "Loops with a purpose",
    summary: "Repeat something because repeating it is the right idea.",
    worldId: "cw-coding",
    domainId: "d-coding",
    locationName: "Loop Yard",
    ageRange: [9, 14],
    tier: 1,
    prerequisiteIds: ["cn-cod-sequence"],
    relatedIds: ["cn-rob-sense"],
    objectives: [
      ["Replace repeated steps with a loop", "apply"],
      ["Choose a stopping condition that matches the goal", "analyze"],
    ],
    activities: [["Shrink the program", "visual-coding", 9], ["Off-by-one hunt", "guided-practice", 8]],
    practice: [["Loop reps", "drill", 10], ["Condition choices", "spaced-review", 6]],
    projects: [["Pattern printer", "Draw a repeating pattern with the fewest instructions."]],
    assessment: ["Shrink and justify", "performance", "A shorter program that still works, with the loop choice explained."],
    threshold: [0.75, 3, true],
    intervals: [2, 5, 12, 26],
    mastery: ["practicing", 0.48, 3, "Loops work; stopping conditions still guessed sometimes."],
    pathStatus: "needs-review",
    variants: variants([
      ["Do it again — but let the computer repeat it.", "Repeat a fixed number of times.", "blocks", "modelled"],
      ["Use a loop instead of copying blocks.", "Pick when the loop should stop.", "blocks", "guided"],
      ["Choose between count and condition loops.", "Handle an off-by-one bug.", "blocks-and-script", "coached"],
      ["Reason about loop invariants and termination.", "Optimise a nested loop.", "code", "independent"],
    ]),
  },
  {
    id: "cn-cod-debug",
    name: "Reading an error message",
    summary: "The error is information, not a verdict.",
    worldId: "cw-coding",
    domainId: "d-coding",
    locationName: "Terminal Lab",
    ageRange: [10, 14],
    tier: 2,
    prerequisiteIds: ["cn-cod-loops"],
    relatedIds: ["cn-ai-check"],
    objectives: [
      ["Locate the line an error refers to", "understand"],
      ["Form and test one hypothesis at a time", "analyze"],
    ],
    activities: [["Break it on purpose", "code", 10], ["One change at a time", "guided-practice", 12]],
    practice: [["Bug hunts", "drill", 8]],
    projects: [["Rescue a program", "Repair an unfamiliar broken program and document each fix."]],
    assessment: ["Debug Arena", "boss", "Three repairs with a stated hypothesis for each."],
    threshold: [0.75, 3, true],
    intervals: [3, 7, 16],
    mastery: ["introduced", 0.22, 1, "Seen once with support."],
    pathStatus: "locked",
    variants: variants([
      ["Something went wrong — let's find it together.", "Colour highlights the broken block.", "blocks", "modelled"],
      ["Read the message, then check that line.", "One bug, one program.", "blocks-and-script", "guided"],
      ["Form a hypothesis before changing code.", "Two bugs, one unfamiliar.", "code", "coached"],
      ["Debug systematically under time pressure.", "Unfamiliar codebase, three bugs.", "code", "independent"],
    ]),
  },
  {
    id: "cn-ai-pattern",
    name: "How machines find patterns",
    summary: "Examples in, prediction out — and the examples decide a lot.",
    worldId: "cw-ai",
    domainId: "d-ai",
    locationName: "Training Room",
    ageRange: [8, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-ai-check"],
    objectives: [
      ["Describe how examples shape a prediction", "understand"],
      ["Predict how a model behaves on an example unlike its training set", "analyze"],
    ],
    activities: [["Teach the sorter", "explore", 10], ["Break the sorter", "explore", 8]],
    practice: [["Prediction reps", "spaced-review", 6]],
    projects: [["Your own classifier", "Train a small classifier and document where it fails."]],
    assessment: ["Explain a failure", "performance", "A failure case with a plausible explanation of why it happened."],
    threshold: [0.7, 2, true],
    intervals: [3, 8, 18],
    mastery: ["practicing", 0.52, 3, "Explains the idea; struggles to predict edge cases."],
    pathStatus: "available",
    variants: variants([
      ["Show the computer lots of examples.", "Sort pictures into two boxes.", "visual", "modelled"],
      ["Notice what examples you did not give it.", "Find one thing it gets wrong.", "visual", "guided"],
      ["Relate training data to model behaviour.", "Design a test set that exposes a gap.", "studio", "coached"],
      ["Analyse dataset bias and its consequences.", "Argue what data was missing and why it matters.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-ai-check",
    name: "Checking an AI answer",
    summary: "Confident is not the same as correct.",
    worldId: "cw-ai",
    domainId: "d-ai",
    locationName: "Prompt Greenhouse",
    ageRange: [9, 14],
    tier: 1,
    prerequisiteIds: ["cn-ai-pattern"],
    relatedIds: ["cn-dig-source"],
    objectives: [
      ["Verify a claim from an AI answer against another source", "evaluate"],
      ["Decide when an AI answer is not good enough to use", "evaluate"],
    ],
    activities: [["Spot the confident mistake", "guided-practice", 9], ["Ask it again, differently", "conversation", 8]],
    practice: [["Verification reps", "spaced-review", 8]],
    projects: [["Fact trail", "Take one AI answer and trace every claim it made."]],
    assessment: ["Verification Gate", "boss", "Five judgements, each with the check that justified it."],
    threshold: [0.8, 3, true],
    intervals: [2, 6, 14, 30],
    mastery: ["needs-review", 0.44, 2, "Was proficient in June; review window has lapsed."],
    pathStatus: "needs-review",
    variants: variants([
      ["Ask a grown-up or check a book.", "Is this answer sensible?", "visual", "modelled"],
      ["Find one other place that says the same thing.", "Two claims to check.", "conversation", "guided"],
      ["Verify claims and note what you could not verify.", "Contradictory sources.", "studio", "coached"],
      ["Judge reliability and state your confidence.", "Plausible but wrong answers.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-cre-story",
    name: "Building a character",
    summary: "Someone who wants something and cannot easily get it.",
    worldId: "cw-creative",
    domainId: "d-creativity",
    locationName: "Writers' Loft",
    ageRange: [8, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-eng-paragraph"],
    objectives: [
      ["Give a character a want and an obstacle", "create"],
      ["Show a trait through action instead of description", "create"],
    ],
    activities: [["Want and wall", "story", 8], ["Show, don't tell", "build", 10]],
    practice: [["Character sketches", "drill", 6]],
    projects: [["Scene one", "Write a scene where the want and the obstacle both appear."]],
    assessment: ["Scene review", "portfolio-review", "A scene where a reader can name the want without being told."],
    threshold: [0.7, 2, false],
    intervals: [4, 10, 22],
    mastery: ["developing", 0.66, 5, "Strong wants; obstacles still resolve too easily."],
    pathStatus: "available",
    variants: variants([
      ["Who is your character and what do they want?", "Draw them, then say one sentence.", "visual", "modelled"],
      ["Give your character a problem.", "Write a short scene.", "studio", "guided"],
      ["Reveal character through action.", "No adjectives allowed.", "studio", "coached"],
      ["Control subtext and motivation.", "Two characters who want opposite things.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-cre-critique",
    name: "Giving useful critique",
    summary: "Specific, kind, and about the work.",
    worldId: "cw-creative",
    domainId: "d-creativity",
    locationName: "Showcase Hall",
    ageRange: [10, 14],
    tier: 1,
    prerequisiteIds: ["cn-cre-story"],
    relatedIds: ["cn-com-disagree"],
    objectives: [
      ["Name one specific strength and one specific change", "evaluate"],
      ["Act on critique without abandoning your intent", "create"],
    ],
    activities: [["Two notes", "conversation", 8], ["Revise once", "build", 12]],
    practice: [["Critique reps", "conversation", 4]],
    projects: [["Revision pair", "Swap work, critique, revise, compare versions."]],
    assessment: ["Showcase Hall", "boss", "A published piece plus the revision it went through."],
    threshold: [0.7, 2, true],
    intervals: [5, 12, 26],
    mastery: ["introduced", 0.3, 1, "Kind, but not yet specific."],
    pathStatus: "optional-challenge",
    variants: variants([
      ["Say one thing you liked.", "Use the sentence starters.", "visual", "modelled"],
      ["One thing that worked, one thing to try.", "Give notes on a partner's work.", "conversation", "guided"],
      ["Critique against the creator's own intent.", "Receive notes and revise.", "studio", "coached"],
      ["Run a critique round for a group.", "Balance conflicting feedback.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-ent-value",
    name: "Who is this for?",
    summary: "An idea is not a business until someone specific wants it.",
    worldId: "cw-entrepreneurship",
    domainId: "d-entrepreneurship",
    locationName: "Idea Stalls",
    ageRange: [10, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-com-explain"],
    objectives: [
      ["Describe a specific person an idea helps", "understand"],
      ["Change an idea after hearing from a real person", "evaluate"],
    ],
    activities: [["One-sentence pitch", "conversation", 6], ["Five questions", "explore", 12]],
    practice: [["Pitch reps", "drill", 5]],
    projects: [["Interview log", "Interview five people and record what changed your mind."]],
    assessment: ["Pitch Stage", "boss", "A pitch plus the specific feedback that reshaped it."],
    threshold: [0.7, 2, true],
    intervals: [4, 9, 20],
    mastery: ["practicing", 0.5, 2, "Pitches clearly; audience still described in general terms."],
    pathStatus: "available",
    variants: variants([
      ["Who would like your idea?", "Name one person you know.", "visual", "modelled"],
      ["Describe the person your idea helps.", "Ask two people what they think.", "conversation", "guided"],
      ["Define a customer and their problem.", "Interview five people.", "studio", "coached"],
      ["Validate demand and revise the concept.", "Present evidence, not enthusiasm.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-stm-fairtest",
    name: "Making a fair test",
    summary: "Change one thing, keep the rest the same.",
    worldId: "cw-stem",
    domainId: "d-science",
    locationName: "Field Bench",
    ageRange: [8, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-ai-pattern"],
    objectives: [
      ["Identify what to change and what to keep the same", "apply"],
      ["Explain why a result may not be trustworthy", "evaluate"],
    ],
    activities: [["Measure three times", "explore", 10], ["Spoil the test", "guided-practice", 8]],
    practice: [["Variable spotting", "puzzle", 10]],
    projects: [["Bench report", "Run a small test and report honestly, including what went wrong."]],
    assessment: ["Experiment Hall", "boss", "A test design where the controlled variables are justified."],
    threshold: [0.75, 3, true],
    intervals: [3, 8, 18, 35],
    mastery: ["developing", 0.63, 4, "Controls one variable well; forgets repeats."],
    pathStatus: "available",
    variants: variants([
      ["Only change one thing.", "Two cups, one difference.", "visual", "modelled"],
      ["Plan what stays the same.", "Record three measurements.", "studio", "guided"],
      ["Design a controlled experiment.", "Explain sources of error.", "studio", "coached"],
      ["Evaluate validity and reliability.", "Critique someone else's method.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-rob-sense",
    name: "Sense, decide, act",
    summary: "A robot is a loop with a body.",
    worldId: "cw-robotics",
    domainId: "d-problem",
    locationName: "Sensor Lab",
    ageRange: [10, 14],
    tier: 1,
    prerequisiteIds: ["cn-cod-loops"],
    relatedIds: ["cn-stm-fairtest"],
    objectives: [
      ["Connect a sensor reading to a chosen action", "apply"],
      ["Tune a threshold using measured results", "analyze"],
    ],
    activities: [["Read the sensor", "explore", 9], ["Tune the threshold", "build", 14]],
    practice: [["Threshold reps", "drill", 6]],
    projects: [["Line follower", "Build and tune a robot that follows a line it has not seen."]],
    assessment: ["Course Trials", "boss", "A tuned run plus the reasoning behind each adjustment."],
    threshold: [0.75, 2, true],
    intervals: [4, 10, 22],
    mastery: ["introduced", 0.12, 0, "Locked behind Loops with a purpose."],
    pathStatus: "locked",
    variants: variants([
      ["The robot looks, then moves.", "Press to test.", "blocks", "modelled"],
      ["Choose what the robot does when it sees something.", "One sensor, two actions.", "blocks", "guided"],
      ["Set thresholds from measured data.", "Noisy sensor readings.", "blocks-and-script", "coached"],
      ["Implement a control loop and tune it.", "Unfamiliar course, timed run.", "code", "independent"],
    ]),
  },
  {
    id: "cn-com-explain",
    name: "Explaining your thinking",
    summary: "Make the invisible steps visible to someone else.",
    worldId: "cw-communication",
    domainId: "d-communication",
    locationName: "Explain Booth",
    ageRange: [8, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-eng-listening"],
    objectives: [
      ["Describe the steps you took to reach an answer", "understand"],
      ["Adapt an explanation when the listener is lost", "evaluate"],
    ],
    activities: [["Sixty-second teach", "conversation", 8]],
    practice: [["Explain reps", "conversation", 5]],
    projects: [["Teach it back", "Teach one idea to someone younger and record what confused them."]],
    assessment: ["Teach-back", "performance", "A listener who can restate the idea correctly."],
    threshold: [0.7, 3, true],
    intervals: [2, 6, 14, 28],
    mastery: ["proficient", 0.79, 6, "Clear explanations; adapts when prompted."],
    pathStatus: "available",
    variants: variants([
      ["Tell me how you did it.", "Point at the steps.", "visual", "modelled"],
      ["Explain your steps in order.", "Teach a partner.", "conversation", "guided"],
      ["Adapt the explanation to your listener.", "Teach someone younger.", "conversation", "coached"],
      ["Explain a complex idea to a non-expert.", "No jargon allowed.", "conversation", "independent"],
    ]),
  },
  {
    id: "cn-com-disagree",
    name: "Disagreeing well",
    summary: "Argue with the idea and keep the person.",
    worldId: "cw-communication",
    domainId: "d-communication",
    locationName: "Roundtable",
    ageRange: [11, 14],
    tier: 1,
    prerequisiteIds: ["cn-com-explain"],
    relatedIds: ["cn-eng-argument"],
    objectives: [
      ["Restate an opposing view fairly before responding", "evaluate"],
      ["Change your mind publicly when the evidence justifies it", "evaluate"],
    ],
    activities: [["Steelman it", "conversation", 12]],
    practice: [["Restatement reps", "conversation", 4]],
    projects: [["Two-sided brief", "Write both sides of a disagreement you actually have."]],
    assessment: ["Roundtable", "boss", "A fair summary of the other side, in their words."],
    threshold: [0.75, 2, true],
    intervals: [5, 12, 25],
    mastery: ["introduced", 0.2, 0, "Not yet started."],
    pathStatus: "advanced-challenge",
    variants: variants([
      ["Listen first, then say what you think.", "Take turns.", "visual", "modelled"],
      ["Say their idea back before you answer.", "One disagreement, calm voices.", "conversation", "guided"],
      ["Steelman the other side.", "Then respond to the strongest version.", "conversation", "coached"],
      ["Hold a structured debate and update in public.", "Argue the side you oppose.", "conversation", "independent"],
    ]),
  },
  {
    id: "cn-dig-source",
    name: "Checking a source",
    summary: "Who said it, how do they know, and who gains?",
    worldId: "cw-digital",
    domainId: "d-digital",
    locationName: "Source Desk",
    ageRange: [9, 14],
    tier: 0,
    prerequisiteIds: [],
    relatedIds: ["cn-ai-check"],
    objectives: [
      ["Trace a claim back to where it came from", "analyze"],
      ["Identify who benefits if a claim is believed", "evaluate"],
    ],
    activities: [["Follow the claim", "explore", 10]],
    practice: [["Source reps", "spaced-review", 8]],
    projects: [["Claim trail", "Take one viral claim and document its origin."]],
    assessment: ["Signal Check", "boss", "Judgements on a mixed feed with the reasoning shown."],
    threshold: [0.75, 3, true],
    intervals: [3, 7, 16, 32],
    mastery: ["practicing", 0.47, 3, "Finds the source; motive analysis is new."],
    pathStatus: "available",
    variants: variants([
      ["Where did this come from?", "Two choices, clear difference.", "visual", "modelled"],
      ["Find who first said it.", "Check one other source.", "studio", "guided"],
      ["Trace and evaluate a claim's origin.", "Conflicting sources.", "studio", "coached"],
      ["Assess credibility and incentive.", "Sophisticated misinformation.", "studio", "independent"],
    ]),
  },
  {
    id: "cn-dig-footprint",
    name: "Your digital footprint",
    summary: "What you leave behind, and for how long.",
    worldId: "cw-digital",
    domainId: "d-digital",
    locationName: "Footprint Room",
    ageRange: [10, 14],
    tier: 1,
    prerequisiteIds: ["cn-dig-source"],
    relatedIds: [],
    objectives: [
      ["Predict what a post reveals beyond its content", "analyze"],
      ["Choose sharing settings that match your intent", "apply"],
    ],
    activities: [["What does this reveal?", "guided-practice", 9]],
    practice: [["Privacy reps", "spaced-review", 6]],
    projects: [["Footprint audit", "Audit a fictional profile and recommend changes."]],
    assessment: ["Footprint audit", "performance", "Recommendations with the reasoning behind each one."],
    threshold: [0.7, 2, false],
    intervals: [6, 14, 30],
    mastery: ["introduced", 0.25, 1, "Aware of the idea; not yet applied."],
    pathStatus: "optional-challenge",
    variants: variants([
      ["Some things stay online.", "Sort: share or keep private.", "visual", "modelled"],
      ["Think before you post.", "What does this photo tell people?", "visual", "guided"],
      ["Analyse metadata and inference.", "Audit a sample profile.", "studio", "coached"],
      ["Reason about long-term consequences.", "Advise someone else on their footprint.", "studio", "independent"],
    ]),
  },
];

const locationIdByName = new Map(worldLocations.map((l) => [`${l.worldId}::${l.name}`, l.id]));

export const curriculumNodes: CurriculumNode[] = NODE_SEEDS.map((seed) => {
  const locationId = locationIdByName.get(`${seed.worldId}::${seed.locationName}`) ?? "";
  const [confidence, demonstrations, transferRequired] = seed.threshold;
  const [state, conf, evidence, note] = seed.mastery;
  return {
    id: seed.id,
    name: seed.name,
    summary: seed.summary,
    domainId: seed.domainId,
    worldId: seed.worldId,
    locationId,
    ageRange: { min: seed.ageRange[0], max: seed.ageRange[1] },
    tier: seed.tier,
    prerequisiteIds: seed.prerequisiteIds,
    relatedIds: seed.relatedIds,
    objectives: seed.objectives.map(([statement, cognitiveLevel], i) => ({
      id: `${seed.id}-o${i + 1}`,
      statement,
      cognitiveLevel,
    })),
    activities: seed.activities.map(([title, kind, minutes], i) => ({
      id: `${seed.id}-a${i + 1}`,
      title,
      kind,
      minutes,
      ageBands: ["8-9", "10-11", "12-14"] as AgeBand[],
    })),
    practice: seed.practice.map(([title, format, itemCount], i) => ({
      id: `${seed.id}-p${i + 1}`,
      title,
      format,
      itemCount,
    })),
    projects: seed.projects.map(([title, brief], i) => ({
      id: `${seed.id}-pr${i + 1}`,
      title,
      brief,
      ageBands: ["8-9", "10-11", "12-14"] as AgeBand[],
    })),
    assessment: {
      id: `${seed.id}-as`,
      title: seed.assessment[0],
      kind: seed.assessment[1],
      evidence: seed.assessment[2],
    },
    masteryThreshold: { confidence, demonstrations, transferRequired },
    reviewSchedule: {
      intervalsDays: seed.intervals,
      nextReviewAt: state === "needs-review" ? days(-2) : state === "introduced" ? null : days(seed.intervals[1] ?? 7),
      lastReviewedAt: evidence > 0 ? days(-(seed.intervals[0] ?? 2)) : null,
    },
    mastery: {
      state,
      confidence: conf,
      evidenceCount: evidence,
      lastDemonstratedAt: evidence > 0 ? days(-1) : null,
      note,
    },
    pathStatus: seed.pathStatus,
    ageVariants: seed.variants,
  };
});

// Back-link skills onto the locations that teach them.
for (const node of curriculumNodes) {
  const loc = worldLocations.find((l) => l.id === node.locationId);
  if (loc) loc.skillNodeIds.push(node.id);
}
