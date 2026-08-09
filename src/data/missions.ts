/**
 * Mock mission-run content.
 *
 * Authored as if it came from a content service: every activity names the
 * objective it serves and the evidence kind it is supposed to produce. No
 * factual claims are asserted as curriculum truth — the wording here is
 * scaffolding, and real content replaces it wholesale.
 */
import type {
  BossAssessment,
  MissionActivity,
  MissionRun,
  MissionStage,
  NextRecommendation,
} from "@/types/mission";
import type { AgeBand } from "@/types/domain";

const bands = <T,>(a: T, b: T, c: T): Record<AgeBand, T> => ({
  "8-9": a,
  "10-11": b,
  "12-14": c,
});

/* ------------------------------------------------ mission 1: lighthouse ---- */

const lighthouseActivities: MissionActivity[] = [
  {
    id: "ma-1-prior",
    missionId: "m-1",
    stage: "prior-knowledge",
    kind: "conversation",
    surface: "converse",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking"],
    title: "What do you already notice?",
    storyBeat: "Lina hands you the keeper's log, still open on last night's page.",
    prompt:
      "Look out at the bay in your head. Tell Lina three things you can see, in your own words.",
    estimatedMinutes: 3,
    framingByBand: bands(
      "Say three things you can see. Any words are fine.",
      "Name three things in the bay, as exactly as you can.",
      "Give three observations. Precision matters more than length.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: ["Three distinct things", "Your own words, not the log's"],
    hints: [
      { id: "h-1a", level: 1, label: "Nudge", body: "Start with whatever is closest to you.", characterId: "ch-lina" },
      { id: "h-1b", level: 2, label: "Strategy", body: "Go near, middle, far — three distances, three things.", characterId: "ch-lina" },
      { id: "h-1c", level: 3, label: "Worked step", body: "\"Wet rope on the rail, a green buoy tilting, a ship's light past the rocks.\" Now yours.", characterId: "ch-lina" },
    ],
    evidenceKind: "explanation",
    minimumEffort: { kind: "characters", value: 25 },
  },
  {
    id: "ma-1-concept",
    missionId: "m-1",
    stage: "concept",
    kind: "reading",
    surface: "read",
    objectiveId: "o-en-1",
    skillIds: ["s-en-reading"],
    title: "Words that carry a picture",
    storyBeat: "The old keeper wrote in a way ships could act on.",
    prompt:
      "Read two log entries. One tells a sailor what to do; one does not. Decide which, and be ready to say why.",
    estimatedMinutes: 4,
    framingByBand: bands(
      "Two short notes. Which one helps the ship?",
      "Two entries. Which one could a sailor act on?",
      "Two entries. Which one survives contact with a decision, and why?",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    options: [
      {
        id: "op-1a",
        label: "\"Weather bad tonight. Be careful out there.\"",
        correct: false,
        feedback: "It sets a mood. A sailor still doesn't know what to steer around.",
      },
      {
        id: "op-1b",
        label: "\"Fog to the north rocks, visibility under 200m, swell running east.\"",
        correct: true,
        feedback: "Every word maps to something a sailor can act on. That's the difference.",
      },
    ],
    hints: [
      { id: "h-2a", level: 1, label: "Nudge", body: "Ask: could I steer using only this sentence?", characterId: "ch-lina" },
      { id: "h-2b", level: 2, label: "Strategy", body: "Underline the words that name a specific thing.", characterId: "ch-lina" },
      { id: "h-2c", level: 3, label: "Worked step", body: "\"Bad\" and \"careful\" name nothing. \"North rocks\" and \"200m\" do.", characterId: "ch-lina" },
    ],
    evidenceKind: "correct-response",
    minimumEffort: { kind: "selections", value: 1 },
  },
  {
    id: "ma-1-guided",
    missionId: "m-1",
    stage: "guided-exploration",
    kind: "sorting",
    surface: "arrange",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking", "s-en-reading"],
    title: "Vague or precise?",
    storyBeat: "Half the log's words have washed out. Sort what's left.",
    prompt: "Put each word where it belongs. There is no trick — say your reason out loud as you go.",
    estimatedMinutes: 5,
    framingByBand: bands(
      "Drag each word into the right box.",
      "Sort each word. Vague or precise?",
      "Sort each word, then defend the two you found hardest.",
    ),
    characterId: "ch-lina",
    voiceSupported: false,
    buckets: [
      { id: "b-vague", label: "Vague" },
      { id: "b-precise", label: "Precise" },
    ],
    items: [
      { id: "it-1", label: "nice", bucketId: "b-vague" },
      { id: "it-2", label: "rusted", bucketId: "b-precise" },
      { id: "it-3", label: "stuff", bucketId: "b-vague" },
      { id: "it-4", label: "knee-deep", bucketId: "b-precise" },
      { id: "it-5", label: "big", bucketId: "b-vague" },
      { id: "it-6", label: "salt-stained", bucketId: "b-precise" },
    ],
    hints: [
      { id: "h-3a", level: 1, label: "Nudge", body: "If two people would picture different things, it's vague.", characterId: "ch-lina" },
      { id: "h-3b", level: 2, label: "Strategy", body: "Try the word on the buoy. Does it change what you'd draw?", characterId: "ch-lina" },
      { id: "h-3c", level: 3, label: "Worked step", body: "\"big\" — big like a boat or big like a crate? Vague.", characterId: "ch-lina" },
    ],
    evidenceKind: "correct-response",
    minimumEffort: { kind: "items", value: 6 },
  },
  {
    id: "ma-1-practice",
    missionId: "m-1",
    stage: "practice",
    kind: "writing",
    surface: "write",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking"],
    title: "Rewrite the washed-out line",
    storyBeat: "One line of the broadcast is unusable. It's yours now.",
    prompt:
      "Rewrite \"the water looked bad\" so a ship's captain could act on it. Use precise words only.",
    estimatedMinutes: 5,
    framingByBand: bands(
      "Say it again, but so we can picture it.",
      "Rewrite it with at least three precise words.",
      "Rewrite it so nothing in the sentence could mean two things.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: [
      "At least three precise words",
      "Nothing a reader has to guess at",
      "Still one sentence",
    ],
    hints: [
      { id: "h-4a", level: 1, label: "Nudge", body: "What kind of bad? Colour, height, speed?", characterId: "ch-lina" },
      { id: "h-4b", level: 2, label: "Strategy", body: "Replace \"bad\" with a measurement and a texture.", characterId: "ch-lina" },
      { id: "h-4c", level: 3, label: "Worked step", body: "Start: \"The water ran grey and choppy, waves about…\" — finish it your way.", characterId: "ch-lina" },
    ],
    evidenceKind: "artifact",
    minimumEffort: { kind: "characters", value: 40 },
  },
  {
    id: "ma-1-challenge",
    missionId: "m-1",
    stage: "challenge",
    kind: "voice-response",
    surface: "speak",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking"],
    title: "Live broadcast, 30 seconds",
    storyBeat: "The lamp is lit. The channel is open. No script.",
    prompt: "Describe the bay out loud for thirty seconds so a ship can navigate it.",
    estimatedMinutes: 4,
    framingByBand: bands(
      "Talk to the ships for a little while. You can start again if you want.",
      "Thirty seconds, out loud, no notes.",
      "Thirty seconds, unscripted. Precision under time pressure is the point.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: ["Unscripted", "At least five precise words", "A sailor could act on it"],
    hints: [
      { id: "h-5a", level: 1, label: "Nudge", body: "Near first, then far. It keeps you from freezing.", characterId: "ch-lina" },
      { id: "h-5b", level: 2, label: "Strategy", body: "One hazard, one landmark, one instruction.", characterId: "ch-lina" },
      { id: "h-5c", level: 3, label: "Worked step", body: "\"North rocks are fogged in. Green buoy is holding. Come around east of it.\"", characterId: "ch-lina" },
    ],
    evidenceKind: "spoken-response",
    minimumEffort: { kind: "characters", value: 60 },
  },
  {
    id: "ma-1-creation",
    missionId: "m-1",
    stage: "creation",
    kind: "creative-creation",
    surface: "build",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking", "s-create-story"],
    title: "Write tonight's keeper's page",
    storyBeat: "The log stays in the lighthouse. Whoever comes next reads what you wrote.",
    prompt: "Write the page for tonight: conditions, hazards, and one instruction for ships.",
    estimatedMinutes: 8,
    framingByBand: bands(
      "Three lines is plenty. Draw a little map beside it if you want.",
      "A short page: what it's like, what's dangerous, what to do.",
      "A page a stranger could use without asking you a single question.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: [
      "Conditions described precisely",
      "At least one hazard named exactly",
      "One clear instruction",
    ],
    hints: [
      { id: "h-6a", level: 1, label: "Nudge", body: "Reuse your best line from the broadcast.", characterId: "ch-lina" },
      { id: "h-6b", level: 2, label: "Strategy", body: "Conditions, hazards, instruction — in that order.", characterId: "ch-lina" },
      { id: "h-6c", level: 3, label: "Worked step", body: "Write the instruction first, then explain what made it necessary.", characterId: "ch-lina" },
    ],
    evidenceKind: "artifact",
    minimumEffort: { kind: "characters", value: 120 },
  },
  {
    id: "ma-1-reflect",
    missionId: "m-1",
    stage: "reflection",
    kind: "reflection",
    surface: "write",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking"],
    title: "What changed in your words?",
    storyBeat: "Lina sits on the rail and waits. She's in no hurry.",
    prompt:
      "Compare your first three things with tonight's page. What did you do differently the second time?",
    estimatedMinutes: 4,
    framingByBand: bands(
      "What's different about how you said it at the end?",
      "What did you change between your first try and your last?",
      "Name the specific move you made, and when you'd use it again.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: ["Points at something specific", "Not just \"it was better\""],
    hints: [
      { id: "h-7a", level: 1, label: "Nudge", body: "Find one word you swapped out.", characterId: "ch-lina" },
      { id: "h-7b", level: 2, label: "Strategy", body: "Read both out loud. The difference will be audible.", characterId: "ch-lina" },
      { id: "h-7c", level: 3, label: "Worked step", body: "\"I stopped saying 'big' and started saying how big.\"", characterId: "ch-lina" },
    ],
    evidenceKind: "self-correction",
    minimumEffort: { kind: "characters", value: 40 },
  },
  {
    id: "ma-1-assess",
    missionId: "m-1",
    stage: "assessment",
    kind: "short-answer",
    surface: "write",
    objectiveId: "o-en-1",
    skillIds: ["s-en-speaking"],
    title: "A place you've never described",
    storyBeat: "A different coast. A different keeper. Same job.",
    prompt:
      "Describe a crowded market at midday so someone who has never been there could find one stall.",
    estimatedMinutes: 6,
    framingByBand: bands(
      "Describe a busy market so a friend can find the bread stall.",
      "Describe a busy market precisely enough to find one stall.",
      "Describe a crowded market so a stranger reaches one specific stall unaided.",
    ),
    characterId: "ch-lina",
    voiceSupported: true,
    successCriteria: [
      "New setting, same precision",
      "Five or more precise words",
      "Someone could actually follow it",
    ],
    hints: [],
    evidenceKind: "transfer",
    minimumEffort: { kind: "characters", value: 80 },
  },
];

const lighthouseStages: MissionStage[] = [
  {
    kind: "story-setup",
    title: "The bay goes quiet",
    purpose: "Give the work a reason to exist before any task appears.",
    narration:
      "The lighthouse still turns, but the broadcast is dead. Ships are circling out past the rocks, waiting for someone to tell them what's out there.",
    characterId: "ch-lina",
    activityIds: [],
    interactive: false,
  },
  {
    kind: "objective",
    title: "What you're actually learning",
    purpose: "Name the learning out loud. No hidden curriculum.",
    narration:
      "By the end you'll describe a real scene precisely enough that someone can act on your words. That's the whole skill.",
    characterId: "ch-lina",
    activityIds: [],
    interactive: false,
  },
  {
    kind: "prior-knowledge",
    title: "What you bring",
    purpose: "Surface what the learner already has, so teaching attaches to it.",
    narration: "Before I show you anything — what do you already notice?",
    characterId: "ch-lina",
    activityIds: ["ma-1-prior"],
    interactive: true,
  },
  {
    kind: "concept",
    title: "The keeper's rule",
    purpose: "Introduce the idea once the learner has something to hang it on.",
    narration: "Two entries. One works. Let's find out why.",
    characterId: "ch-lina",
    activityIds: ["ma-1-concept"],
    interactive: true,
  },
  {
    kind: "guided-exploration",
    title: "Try it with me here",
    purpose: "First attempts with support close by.",
    narration: "I'll stay next to you for this one. Sort them however you can defend.",
    characterId: "ch-lina",
    activityIds: ["ma-1-guided"],
    interactive: true,
  },
  {
    kind: "practice",
    title: "Your turn, small",
    purpose: "Repetition on a bounded task before the stakes rise.",
    narration: "One line. Make it usable.",
    characterId: "ch-lina",
    activityIds: ["ma-1-practice"],
    interactive: true,
  },
  {
    kind: "challenge",
    title: "Live, unscripted",
    purpose: "Remove the scaffolding and see what holds.",
    narration: "No notes this time. I'll be listening, not helping.",
    characterId: "ch-lina",
    activityIds: ["ma-1-challenge"],
    interactive: true,
  },
  {
    kind: "creation",
    title: "Something that stays",
    purpose: "Turn the skill into an artifact the learner owns.",
    narration: "Write the page. It stays in the lighthouse after you leave.",
    characterId: "ch-lina",
    activityIds: ["ma-1-creation"],
    interactive: true,
  },
  {
    kind: "reflection",
    title: "Look back",
    purpose: "Make the learner's own change visible to them.",
    narration: "Nobody's timing this part.",
    characterId: "ch-lina",
    activityIds: ["ma-1-reflect"],
    interactive: true,
  },
  {
    kind: "assessment",
    title: "Somewhere else entirely",
    purpose: "Check the skill transfers away from the setting it was learned in.",
    narration: "Forget the bay. New place, same job.",
    characterId: "ch-lina",
    activityIds: ["ma-1-assess"],
    interactive: true,
  },
  {
    kind: "mastery-decision",
    title: "What the evidence says",
    purpose: "State the decision and the evidence behind it, plainly.",
    narration: "Here's what I actually saw you do — and what it isn't enough to claim yet.",
    characterId: "ch-lina",
    activityIds: [],
    interactive: false,
  },
  {
    kind: "reward",
    title: "What you earned",
    purpose: "Attach rewards to demonstrated evidence, never to attendance.",
    narration: "You earned this by doing it, not by finishing.",
    characterId: "ch-lina",
    activityIds: [],
    interactive: false,
  },
  {
    kind: "next-recommendation",
    title: "Where this goes",
    purpose: "Point at the next step and say why it's next.",
    narration: "You don't have to take my suggestion. But here's what I'd pick.",
    characterId: "ch-lina",
    activityIds: [],
    interactive: false,
  },
];

/* ------------------------------------------------------ mission 2: loop ---- */

const forgeActivities: MissionActivity[] = [
  {
    id: "ma-3-prior",
    missionId: "m-3",
    stage: "prior-knowledge",
    kind: "sorting",
    surface: "arrange",
    objectiveId: "o-code-2",
    skillIds: ["s-code-logic"],
    title: "Which of these repeat?",
    storyBeat: "Koda dumps yesterday's conveyor scripts on the bench.",
    prompt: "Sort these instruction lists: does each one repeat something, or not?",
    estimatedMinutes: 3,
    framingByBand: bands(
      "Which lists say the same thing more than once?",
      "Sort by whether the list repeats a step.",
      "Sort by repetition, then note which repeats vary by one value.",
    ),
    characterId: "ch-koda",
    voiceSupported: false,
    buckets: [
      { id: "b-rep", label: "Repeats" },
      { id: "b-once", label: "Runs once" },
    ],
    items: [
      { id: "fi-1", label: "step, step, step, step", bucketId: "b-rep" },
      { id: "fi-2", label: "open gate", bucketId: "b-once" },
      { id: "fi-3", label: "lift, drop, lift, drop", bucketId: "b-rep" },
      { id: "fi-4", label: "sound alarm", bucketId: "b-once" },
    ],
    hints: [
      { id: "fh-1a", level: 1, label: "Nudge", body: "Read each list out loud. Repetition is audible.", characterId: "ch-koda" },
      { id: "fh-1b", level: 2, label: "Strategy", body: "Cover the first line. Does the rest look the same?", characterId: "ch-koda" },
      { id: "fh-1c", level: 3, label: "Worked step", body: "\"lift, drop, lift, drop\" is one pair, done twice.", characterId: "ch-koda" },
    ],
    evidenceKind: "correct-response",
    minimumEffort: { kind: "items", value: 4 },
  },
  {
    id: "ma-3-guided",
    missionId: "m-3",
    stage: "guided-exploration",
    kind: "coding",
    surface: "build",
    objectiveId: "o-code-2",
    skillIds: ["s-code-logic", "s-code-build"],
    title: "Fold the repetition",
    storyBeat: "The conveyor script is forty lines of the same four.",
    prompt: "Rewrite this so the repeated part appears once, inside a loop.",
    estimatedMinutes: 8,
    framingByBand: bands(
      "Snap the repeat block around the steps.",
      "Wrap the repeated steps in a repeat block, then set the count.",
      "Replace the unrolled block with a loop. Keep behaviour identical.",
    ),
    characterId: "ch-koda",
    voiceSupported: false,
    starter: "move(1)\ndrop()\nmove(1)\ndrop()\nmove(1)\ndrop()\nmove(1)\ndrop()",
    successCriteria: ["The repeated steps appear once", "The count is explicit", "Same behaviour as before"],
    hints: [
      { id: "fh-2a", level: 1, label: "Nudge", body: "How many times does the pair appear?", characterId: "ch-koda" },
      { id: "fh-2b", level: 2, label: "Strategy", body: "Find the smallest block that repeats, then count it.", characterId: "ch-koda" },
      { id: "fh-2c", level: 3, label: "Worked step", body: "repeat 4 times: move(1); drop()", characterId: "ch-koda" },
    ],
    evidenceKind: "artifact",
    minimumEffort: { kind: "characters", value: 20 },
  },
  {
    id: "ma-3-challenge",
    missionId: "m-3",
    stage: "challenge",
    kind: "debugging",
    surface: "build",
    objectiveId: "o-code-2",
    skillIds: ["s-code-logic"],
    title: "The loop that runs one too many",
    storyBeat: "The conveyor drops a crate into empty air, every single cycle.",
    prompt: "Find why it overshoots. Change one thing, say what you expect, then check.",
    estimatedMinutes: 7,
    framingByBand: bands(
      "Something happens one extra time. Can you find it?",
      "The loop runs once too often. Fix it, and say why.",
      "Diagnose the off-by-one. State your hypothesis before you change anything.",
    ),
    characterId: "ch-koda",
    voiceSupported: false,
    starter: "count = 0\nrepeat 5 times:\n  move(1)\n  drop()\n  count = count + 1",
    successCriteria: ["A stated hypothesis", "One change at a time", "An explanation of the cause"],
    hints: [
      { id: "fh-3a", level: 1, label: "Nudge", body: "Count the crates by hand. How many slots exist?", characterId: "ch-koda" },
      { id: "fh-3b", level: 2, label: "Strategy", body: "Change only the count and predict the result first.", characterId: "ch-koda" },
      { id: "fh-3c", level: 3, label: "Worked step", body: "Four slots, five drops. The loop count is the suspect.", characterId: "ch-koda" },
    ],
    evidenceKind: "process-trace",
    minimumEffort: { kind: "characters", value: 50 },
  },
  {
    id: "ma-3-assess",
    missionId: "m-3",
    stage: "assessment",
    kind: "decision-making",
    surface: "choose",
    objectiveId: "o-code-2",
    skillIds: ["s-code-logic"],
    title: "Loop it or leave it?",
    storyBeat: "Three new machines. Only some of them want loops.",
    prompt: "For each machine, decide whether a loop helps — and be ready to defend the one you leave alone.",
    estimatedMinutes: 6,
    framingByBand: bands(
      "Which machines need a repeat block?",
      "Which of these should use a loop?",
      "Which should use a loop, and where would a loop make it worse?",
    ),
    characterId: "ch-koda",
    voiceSupported: false,
    options: [
      { id: "fo-1", label: "Stamps 12 identical plates", correct: true, feedback: "Same step, known count. A loop is exactly right." },
      { id: "fo-2", label: "Opens one gate at shift start", correct: false, feedback: "Once is once. A loop adds nothing but noise." },
      { id: "fo-3", label: "Sorts crates until the belt is empty", correct: true, feedback: "Unknown count, clear stop condition — a loop with a condition." },
    ],
    hints: [],
    evidenceKind: "transfer",
    minimumEffort: { kind: "selections", value: 1 },
  },
];

const forgeStages: MissionStage[] = lighthouseStages
  .filter((s) =>
    [
      "story-setup",
      "objective",
      "prior-knowledge",
      "guided-exploration",
      "challenge",
      "reflection",
      "assessment",
      "mastery-decision",
      "reward",
      "next-recommendation",
    ].includes(s.kind),
  )
  .map<MissionStage>((s) => {
    const activityIds = forgeActivities.filter((a) => a.stage === s.kind).map((a) => a.id);
    return { ...s, characterId: "ch-koda", activityIds, interactive: activityIds.length > 0 };
  })
  .map((s) =>
    s.kind === "story-setup"
      ? {
          ...s,
          title: "Forty lines of the same four",
          narration:
            "The conveyor works. It also repeats itself into the ground. Koda wants it folded down before the night shift.",
        }
      : s.kind === "objective"
        ? {
            ...s,
            title: "What you're actually learning",
            narration:
              "You'll replace repeated steps with a loop and a condition — and know when not to.",
          }
        : s.kind === "reflection"
          ? { ...s, activityIds: [], interactive: false, narration: "Say what the loop cost you and what it bought you." }
          : s,
  );

/* ------------------------------------------------------------- missions ---- */

export const missionRuns: MissionRun[] = [
  {
    id: "run-m-1",
    missionId: "m-1",
    worldId: "w-signal",
    title: "The Lighthouse Broadcast",
    storyContext: "The bay's lighthouse lost its voice.",
    storySetup:
      "Signal Bay runs on words. Tonight the broadcast failed and the ships are holding position past the north rocks, waiting on a description precise enough to steer by. Lina has the microphone. She's giving it to you.",
    guideCharacterId: "ch-lina",
    supportingCharacterIds: ["ch-azouz"],
    objectives: [
      {
        id: "o-en-1",
        statement: "Describe a scene using at least five precise adjectives.",
        skillId: "s-en-speaking",
      },
    ],
    skills: [
      { skillId: "s-en-speaking", name: "Speaking with precision", entryState: "practicing" },
      { skillId: "s-en-reading", name: "Reading for detail", entryState: "developing" },
    ],
    difficulty: "steady",
    estimatedMinutes: 39,
    ageBands: ["8-9", "10-11", "12-14"],
    stages: lighthouseStages,
    bossAssessmentId: "boss-long-table",
    rewards: [
      {
        id: "rw-keeper-log",
        name: "The Keeper's Page",
        description: "Your written page stays in the lighthouse and shows up in your portfolio.",
        glyph: "ScrollText",
        requiresEvidence: ["artifact"],
      },
      {
        id: "rw-clear-signal",
        name: "Clear Signal",
        description: "Granted only for describing a place you were never taught to describe.",
        glyph: "RadioTower",
        requiresEvidence: ["transfer"],
      },
      {
        id: "rw-own-ear",
        name: "Your Own Ear",
        description: "For catching and naming a change in your own work.",
        glyph: "Ear",
        requiresEvidence: ["self-correction"],
      },
    ],
  },
  {
    id: "run-m-3",
    missionId: "m-3",
    worldId: "w-forge",
    title: "Loop the Conveyor",
    storyContext: "The forge repeats itself endlessly.",
    storySetup:
      "Koda's conveyor script is forty lines long and says the same four things ten times. It runs fine. It's also unmaintainable, and tonight it started dropping crates into empty air.",
    guideCharacterId: "ch-koda",
    supportingCharacterIds: ["ch-azouz"],
    objectives: [
      {
        id: "o-code-2",
        statement: "Replace repeated steps with a loop and a condition.",
        skillId: "s-code-logic",
      },
    ],
    skills: [
      { skillId: "s-code-logic", name: "Logic and control flow", entryState: "practicing" },
      { skillId: "s-code-build", name: "Building working programs", entryState: "introduced" },
    ],
    difficulty: "stretch",
    estimatedMinutes: 24,
    ageBands: ["10-11", "12-14"],
    stages: forgeStages,
    bossAssessmentId: null,
    rewards: [
      {
        id: "rw-folded",
        name: "Folded Script",
        description: "Your rewritten conveyor script, saved to your portfolio.",
        glyph: "Repeat",
        requiresEvidence: ["artifact"],
      },
      {
        id: "rw-hypothesis",
        name: "One Hypothesis at a Time",
        description: "For debugging by testing, not by guessing.",
        glyph: "Bug",
        requiresEvidence: ["process-trace"],
      },
    ],
  },
];

export const missionActivities: MissionActivity[] = [...lighthouseActivities, ...forgeActivities];

/* ------------------------------------------------------- boss assessment ---- */

export const bossAssessments: BossAssessment[] = [
  {
    id: "boss-long-table",
    worldId: "w-signal",
    locationId: "loc-long-table",
    title: "The Long Table",
    premise:
      "The harbour council meets at a long table and asks questions nobody warned you about. You bring one piece of your own writing and defend it out loud.",
    examinerCharacterId: "ch-lina",
    skillIds: ["s-en-speaking", "s-en-reading", "s-comm-present"],
    objectiveIds: ["o-en-1", "o-en-2"],
    passStandard:
      "Recalling what you were taught is not enough here. You pass by using the skill in a situation you were never shown, and by holding up when someone pushes back.",
    entryRequirement: "Reach proficient in describing a scene precisely.",
    entryMet: true,
    ageBands: ["10-11", "12-14"],
    estimatedMinutes: 25,
    supportPolicy:
      "No hints at the table. Lina will tell you if a question is unfair, and you may ask her to repeat one.",
    retryPolicy:
      "You can come back whenever you want. Nothing is lost by not passing today, and nothing is gained by rushing it.",
    tasks: [
      {
        id: "bt-1",
        kind: "transfer",
        title: "A place with no water in it",
        scenario:
          "The council has never seen your bay. They want a place described that has nothing to do with the sea.",
        prompt:
          "Describe the inside of a workshop at closing time, precisely enough that a stranger could find one tool.",
        lookingFor: [
          "Precision carried into a new setting",
          "Nothing a listener has to guess at",
          "One thing a person could act on",
        ],
        transferDistance: "far",
        responseSurface: "write",
        minimumEffort: { kind: "characters", value: 120 },
      },
      {
        id: "bt-2",
        kind: "critique",
        title: "Someone else's paragraph",
        scenario: "A council clerk's notice is going out tonight. It's vague and it's already printed.",
        prompt:
          "Read the notice, name the two weakest words, and say what each one should become and why.",
        lookingFor: ["Two specific words named", "A reason, not a preference", "A concrete replacement"],
        transferDistance: "near",
        responseSurface: "write",
        minimumEffort: { kind: "characters", value: 100 },
      },
      {
        id: "bt-3",
        kind: "defence",
        title: "Three questions you didn't prepare for",
        scenario:
          "The table pushes back on your own writing. One question is fair, one is picky, one is wrong.",
        prompt:
          "Answer all three. You are allowed to say that a question is based on a misreading — if you can show where.",
        lookingFor: [
          "Holding a position under pressure",
          "Changing your mind when the point is good",
          "Evidence from your own text",
        ],
        transferDistance: "far",
        responseSurface: "write",
        minimumEffort: { kind: "characters", value: 140 },
      },
    ],
  },
];

/* -------------------------------------------------------- recommendations ---- */

export const nextRecommendationPool: NextRecommendation[] = [
  {
    id: "nr-boss",
    kind: "boss-assessment",
    title: "The Long Table",
    reason: "You described a place you'd never described before. That's what the table asks for.",
    targetPath: "/boss/boss-long-table",
    characterId: "ch-lina",
  },
  {
    id: "nr-practice",
    kind: "practice",
    title: "Short precision drills",
    reason: "Your unscripted answer wobbled more than your written one. Ten minutes closes that gap.",
    targetPath: "/practice",
    characterId: "ch-azouz",
  },
  {
    id: "nr-project",
    kind: "project",
    title: "Turn your keeper's page into a broadcast",
    reason: "You already wrote the hard part. This makes it something other people can hear.",
    targetPath: "/create",
    characterId: "ch-fable",
  },
  {
    id: "nr-rest",
    kind: "rest",
    title: "Stop here for today",
    reason: "You did the whole arc, including the part nobody enjoys. Coming back tomorrow is a real option.",
    targetPath: "/",
    characterId: "ch-azouz",
  },
];
