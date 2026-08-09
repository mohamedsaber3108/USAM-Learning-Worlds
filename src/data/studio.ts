import type {
  Creation,
  CreationStageMeta,
  Studio,
  StudioId,
} from "@/types/studio";

export const creationStages: CreationStageMeta[] = [
  {
    id: "idea",
    label: "Idea",
    purpose: "Say what you want to make and who it is for.",
    exitCriterion: "One sentence you can say out loud without hedging.",
    allowedAssists: ["brainstorm", "starter-idea"],
  },
  {
    id: "explore",
    label: "Explore",
    purpose: "Look at how other people solved something similar.",
    exitCriterion: "Two references, and one thing you will do differently.",
    allowedAssists: ["explain", "alternatives", "suggest"],
  },
  {
    id: "plan",
    label: "Plan",
    purpose: "Break the making into steps small enough to start today.",
    exitCriterion: "Three to six steps, in the order you will do them.",
    allowedAssists: ["suggest", "alternatives", "explain"],
  },
  {
    id: "create",
    label: "Create",
    purpose: "Make the first real version. Rough is correct here.",
    exitCriterion: "Something that exists end to end, however scrappy.",
    allowedAssists: ["explain", "debug"],
  },
  {
    id: "iterate",
    label: "Iterate",
    purpose: "Change one thing at a time and keep what worked.",
    exitCriterion: "At least two versions with a note on what changed.",
    allowedAssists: ["debug", "alternatives", "explain"],
  },
  {
    id: "feedback",
    label: "Get feedback",
    purpose: "Show it to a mentor or a peer while you can still change it.",
    exitCriterion: "Notes from someone who is not you.",
    allowedAssists: ["feedback"],
  },
  {
    id: "improve",
    label: "Improve",
    purpose: "Act on the notes you agree with, and say why you skipped the rest.",
    exitCriterion: "Every note marked applied, declined or deferred.",
    allowedAssists: ["suggest", "debug", "explain"],
  },
  {
    id: "publish",
    label: "Publish privately",
    purpose: "Finish it, name it, and write what you were going for.",
    exitCriterion: "A title and an artist statement in your own words.",
    allowedAssists: ["feedback"],
  },
  {
    id: "portfolio",
    label: "Add to portfolio",
    purpose: "Decide whether this is evidence of what you can do now.",
    exitCriterion: "You can explain the hardest decision you made in it.",
    allowedAssists: [],
  },
];

export const studios: Studio[] = [
  {
    id: "art",
    name: "Art Studio",
    tagline: "Composition, colour and the courage of a first mark.",
    purpose:
      "Visual thinking as a discipline: seeing shape before detail, and learning that a drawing is a sequence of decisions you can defend.",
    medium: {
      artifact: "An illustration, digital painting or mixed-media piece",
      surface: {
        "8-9": "Big canvas, chunky brushes, six-colour palette",
        "10-11": "Layers, palette builder and a reference board",
        "12-14": "Full layer stack, blend modes and a composition grid",
      },
    },
    craftSkills: ["Composition", "Colour relationships", "Value and contrast", "Visual storytelling"],
    connectedDomains: ["Design", "English", "AI literacy"],
    seeds: {
      "8-9": ["A creature that lives where nobody has looked", "Your street on the loudest day of the year"],
      "10-11": ["The same scene at three times of day", "An object redesigned for someone with one hand"],
      "12-14": ["A poster that argues a position without text", "A limited palette study: three colours, no more"],
    },
    accent: "primary",
  },
  {
    id: "story",
    name: "Story Studio",
    tagline: "Characters who want something, and something in the way.",
    purpose:
      "Narrative structure made visible: setup, tension, turn and consequence — so a story is engineered, not wished into being.",
    medium: {
      artifact: "An illustrated or branching story",
      surface: {
        "8-9": "Scene cards with pictures and one line each",
        "10-11": "Beat sheet plus a branching map",
        "12-14": "Full outline, POV control and branch consequence tracking",
      },
    },
    craftSkills: ["Structure", "Character motivation", "Pacing", "Dialogue"],
    connectedDomains: ["English", "Art", "Coding"],
    seeds: {
      "8-9": ["Someone loses the one thing they were trusted with", "A door that only opens for the truth"],
      "10-11": ["Two friends want the same thing for good reasons", "A story where the villain is right about one thing"],
      "12-14": ["A branching story where every ending costs something", "Tell it twice: once from each side"],
    },
    accent: "secondary",
  },
  {
    id: "animation",
    name: "Animation Studio",
    tagline: "Timing is the whole art. Everything else is decoration.",
    purpose:
      "Movement as communication: weight, anticipation and spacing, which teach cause and effect more physically than any diagram.",
    medium: {
      artifact: "A short animated sequence or loop",
      surface: {
        "8-9": "Frame flipper with onion skin and a play button",
        "10-11": "Timeline with keyframes and easing presets",
        "12-14": "Curve editor, layered rigs and export settings",
      },
    },
    craftSkills: ["Timing and spacing", "Anticipation", "Weight", "Loop construction"],
    connectedDomains: ["Art", "Coding", "Science"],
    seeds: {
      "8-9": ["A ball that is clearly heavy, then clearly light", "A door opening in the least boring way"],
      "10-11": ["Six seconds that show a mood change with no face", "Animate a machine that does one useless job perfectly"],
      "12-14": ["A seamless loop where the seam is the joke", "Two characters, one movement, opposite personalities"],
    },
    accent: "accent",
  },
  {
    id: "game",
    name: "Game Studio",
    tagline: "Rules, feedback and the moment a player understands.",
    purpose:
      "Systems design: writing rules, playing them, and discovering that a game teaches through its constraints rather than its instructions.",
    medium: {
      artifact: "A playable game or prototype",
      surface: {
        "8-9": "Board-and-rules builder with pieces and turn cards",
        "10-11": "Block-based scene, sprites, score and win conditions",
        "12-14": "Code editor, state machine and playtest instrumentation",
      },
    },
    craftSkills: ["Rule design", "Difficulty curves", "Feedback loops", "Playtesting"],
    connectedDomains: ["Coding", "Maths", "Design"],
    seeds: {
      "8-9": ["A game where losing is funny", "One rule only — make it interesting"],
      "10-11": ["A game that gets harder without adding enemies", "Teach the controls with no words"],
      "12-14": ["A game with a real trade-off every 30 seconds", "Balance it so both strategies can win"],
    },
    accent: "primary",
  },
  {
    id: "design",
    name: "Design Studio",
    tagline: "Solving somebody else's problem, on purpose.",
    purpose:
      "Design as service: a brief, a real user, constraints, and a result judged by whether it works — not by whether it is pretty.",
    medium: {
      artifact: "A poster, product concept, logo or interface",
      surface: {
        "8-9": "Shape and sticker layout with alignment guides",
        "10-11": "Grid, type scale and a brief checklist",
        "12-14": "Component thinking, contrast checks and a rationale panel",
      },
    },
    craftSkills: ["Hierarchy", "Typography", "Constraint reading", "Rationale"],
    connectedDomains: ["Art", "English", "Digital literacy"],
    seeds: {
      "8-9": ["A sign that stops people running in the corridor", "Redesign a cereal box for someone who cannot read"],
      "10-11": ["A poster readable from ten metres and from ten centimetres", "One brand, three sizes"],
      "12-14": ["Redesign a form that people get wrong", "A dark-mode version that is not just inverted"],
    },
    accent: "secondary",
  },
  {
    id: "music",
    name: "Music Studio",
    tagline: "Pattern, repetition and the surprise that lands because of them.",
    purpose:
      "Structure you can hear: motif, variation and arrangement, which make abstract pattern-thinking immediate and physical.",
    medium: {
      artifact: "A loop, song sketch or soundtrack cue",
      surface: {
        "8-9": "Grid sequencer with four instruments",
        "10-11": "Multi-track loops, tempo and simple arrangement",
        "12-14": "Arrangement timeline, automation and mixing basics",
      },
    },
    craftSkills: ["Rhythm", "Motif and variation", "Arrangement", "Dynamics"],
    connectedDomains: ["Maths", "Animation", "Video"],
    seeds: {
      "8-9": ["A four-bar loop for a character who is sneaking", "Make the same tune happy, then worried"],
      "10-11": ["Write a motif, then hide it in three places", "Score eight seconds of someone waiting"],
      "12-14": ["Build tension without getting louder", "Two-part arrangement: verse earns the chorus"],
    },
    accent: "accent",
  },
  {
    id: "video",
    name: "Video Studio",
    tagline: "What you cut is the message.",
    purpose:
      "Editing as argument: shot order, pacing and sound shape meaning, and that makes media literacy something you feel from the inside.",
    medium: {
      artifact: "A short film, explainer or documentary clip",
      surface: {
        "8-9": "Clip strip with trim handles and a title card",
        "10-11": "Two-track timeline with cuts, audio and captions",
        "12-14": "Multi-track edit, B-roll, sound bed and export presets",
      },
    },
    craftSkills: ["Shot selection", "Pacing", "Sound design", "Honest editing"],
    connectedDomains: ["English", "AI literacy", "Digital literacy"],
    seeds: {
      "8-9": ["Explain one thing you are good at in 30 seconds", "A day, told in six shots"],
      "10-11": ["Cut the same footage two ways: kind and unkind", "A how-to with no talking"],
      "12-14": ["A 90-second doc with one interview and one claim you verify", "Show a bias by re-editing a clip"],
    },
    accent: "primary",
  },
  {
    id: "presentation",
    name: "Presentation Studio",
    tagline: "Say the hard part clearly, then sit down.",
    purpose:
      "Explaining under constraint: one idea per slide, evidence behind claims, and delivery that respects the audience's time.",
    medium: {
      artifact: "A talk with slides and speaker notes",
      surface: {
        "8-9": "Three big slides: what, why, show it",
        "10-11": "Slide plan, one-idea rule and a timing check",
        "12-14": "Argument outline, evidence slots and a rehearsal timer",
      },
    },
    craftSkills: ["Structuring an argument", "Slide restraint", "Evidence", "Delivery"],
    connectedDomains: ["English", "AI literacy", "Any project world"],
    seeds: {
      "8-9": ["Teach us the rules of a game in three slides", "Show one thing you built and one thing you fixed"],
      "10-11": ["Explain something you got wrong first", "A talk where the last slide is a question"],
      "12-14": ["Defend a position with three pieces of evidence", "Two minutes, no slide with more than six words"],
    },
    accent: "secondary",
  },
  {
    id: "writing",
    name: "Creative Writing Studio",
    tagline: "Drafting, cutting, and the sentence you were avoiding.",
    purpose:
      "Writing as revision: the first draft is raw material, and the craft lives in what happens to it afterwards.",
    medium: {
      artifact: "A poem, script, essay or short piece",
      surface: {
        "8-9": "Line-by-line writer with word bank and read-aloud",
        "10-11": "Draft view, revision highlighter and a form picker",
        "12-14": "Draft/revision split, line editing and a submission format",
      },
    },
    craftSkills: ["Voice", "Imagery", "Revision", "Reading aloud"],
    connectedDomains: ["English", "Story", "Presentation"],
    seeds: {
      "8-9": ["Write about a place using only sounds", "A letter from something that cannot write"],
      "10-11": ["A poem where the last line changes the first", "Rewrite a scene in half the words"],
      "12-14": ["A monologue from someone who is lying", "Same event, three forms: poem, script, report"],
    },
    accent: "accent",
  },
];

export const creations: Creation[] = [
  {
    id: "creation-tide-poster",
    studioId: "design",
    title: "Don't run in the corridor (but nicely)",
    intent: "A sign that makes people slow down without telling them off.",
    stage: "improve",
    status: "in-progress",
    visibility: "private",
    updatedAt: "2026-08-08T16:20:00.000Z",
    plan: [
      "Watch where people actually speed up",
      "Sketch three versions: funny, calm, official",
      "Test the calm one at ten metres",
      "Fix the type size, print it",
    ],
    revisions: [
      { id: "rev-1", version: 1, changedAt: "2026-08-05T10:00:00.000Z", note: "First version — too many words.", driver: "own-idea" },
      { id: "rev-2", version: 2, changedAt: "2026-08-07T09:30:00.000Z", note: "Cut to four words, made the arrow bigger.", driver: "critique" },
    ],
    critique: [
      { id: "note-1", source: "mentor", author: "Lina", focus: "strength", body: "The arrow does the work. You could delete half the text and lose nothing.", response: "applied" },
      { id: "note-2", source: "peer", author: "Sami", focus: "question", body: "Would this still read from the far end of the corridor?", response: "deferred" },
      { id: "note-3", source: "self", author: "You", focus: "suggestion", body: "The yellow is fighting the arrow.", response: "declined" },
    ],
    aiAssistLog: [
      { kind: "brainstorm", stage: "idea", at: "2026-08-04T12:00:00.000Z" },
      { kind: "feedback", stage: "feedback", at: "2026-08-07T09:00:00.000Z" },
    ],
  },
  {
    id: "creation-heavy-ball",
    studioId: "animation",
    title: "Heavy, then not",
    intent: "Show weight change using only timing — no squash, no labels.",
    stage: "portfolio",
    status: "completed",
    visibility: "family",
    updatedAt: "2026-08-02T14:05:00.000Z",
    plan: ["Study a real bounce", "Block the keys", "Fix the spacing", "Loop it"],
    revisions: [
      { id: "rev-3", version: 1, changedAt: "2026-07-28T11:00:00.000Z", note: "Even spacing — looked like it was floating.", driver: "own-idea" },
      { id: "rev-4", version: 2, changedAt: "2026-07-30T15:00:00.000Z", note: "Bunched frames at the top of the arc.", driver: "critique" },
      { id: "rev-5", version: 3, changedAt: "2026-08-02T13:40:00.000Z", note: "Cut two frames on the impact. That was the whole fix.", driver: "own-idea" },
    ],
    critique: [
      { id: "note-4", source: "mentor", author: "Koda", focus: "suggestion", body: "Your spacing is even. Real weight lives in uneven spacing.", response: "applied" },
    ],
    artistStatement:
      "I wanted weight without squashing anything. The hardest decision was deleting frames instead of adding them — it felt wrong until I played it back.",
    aiAssistLog: [{ kind: "explain", stage: "iterate", at: "2026-07-29T10:00:00.000Z" }],
    portfolioItemId: "portfolio-heavy-ball",
  },
  {
    id: "creation-lighthouse",
    studioId: "story",
    title: "The keeper who wouldn't look",
    intent: "A branching story where every ending costs the keeper something.",
    stage: "create",
    status: "draft",
    visibility: "private",
    updatedAt: "2026-08-09T08:15:00.000Z",
    plan: ["Decide what the keeper is protecting", "Write the branch point", "Write both endings", "Read it aloud"],
    revisions: [
      { id: "rev-6", version: 1, changedAt: "2026-08-09T08:00:00.000Z", note: "Opening scene drafted. Branch point still vague.", driver: "own-idea" },
    ],
    critique: [],
    aiAssistLog: [{ kind: "starter-idea", stage: "idea", at: "2026-08-08T19:00:00.000Z" }],
  },
  {
    id: "creation-sneak-loop",
    studioId: "music",
    title: "Sneaking, four bars",
    intent: "A loop that sounds like someone trying not to be heard.",
    stage: "feedback",
    status: "in-progress",
    visibility: "mentor",
    updatedAt: "2026-08-06T17:45:00.000Z",
    plan: ["Find the rhythm first", "Add one melody note at a time", "Keep it under four instruments"],
    revisions: [
      { id: "rev-7", version: 1, changedAt: "2026-08-05T16:00:00.000Z", note: "Too busy — took out the snare.", driver: "own-idea" },
      { id: "rev-8", version: 2, changedAt: "2026-08-06T17:30:00.000Z", note: "Slowed it down; the gaps do the sneaking.", driver: "constraint" },
    ],
    critique: [
      { id: "note-5", source: "peer", author: "Nour", focus: "strength", body: "The silence between notes is the scariest part.", response: "applied" },
    ],
    aiAssistLog: [],
  },
  {
    id: "creation-tide-talk",
    studioId: "presentation",
    title: "Why my first game was unfair",
    intent: "Explain a balance mistake and how I found it.",
    stage: "plan",
    status: "draft",
    visibility: "private",
    updatedAt: "2026-08-09T11:00:00.000Z",
    plan: ["Show the broken version first", "One slide of playtest data", "What I changed", "What I'd still fix"],
    revisions: [],
    critique: [],
    aiAssistLog: [{ kind: "suggest", stage: "plan", at: "2026-08-09T10:40:00.000Z" }],
  },
  {
    id: "creation-market-scene",
    studioId: "art",
    title: "Market, three times of day",
    intent: "Same street, three light conditions, same composition.",
    stage: "iterate",
    status: "in-progress",
    visibility: "private",
    updatedAt: "2026-08-07T13:10:00.000Z",
    plan: ["Block the composition once", "Morning palette", "Midday palette", "Evening palette"],
    revisions: [
      { id: "rev-9", version: 1, changedAt: "2026-08-06T12:00:00.000Z", note: "Morning done. Too many colours.", driver: "own-idea" },
      { id: "rev-10", version: 2, changedAt: "2026-08-07T13:00:00.000Z", note: "Cut to five colours per version.", driver: "constraint" },
    ],
    critique: [
      { id: "note-6", source: "mentor", author: "Azouz", focus: "question", body: "Which one would you keep if you could only show one? Why?", response: "deferred" },
    ],
    aiAssistLog: [{ kind: "alternatives", stage: "explore", at: "2026-08-05T15:00:00.000Z" }],
  },
];

export const studioById = (id: string): Studio | undefined =>
  studios.find((s) => s.id === (id as StudioId));
