/**
 * Experience-layer mock content: stories, simulations, practice surfaces,
 * analytics and parent insights. Shapes match `@/types/engines`.
 */
import type {
  AnalyticsSummary,
  CodingExercise,
  ContextualHint,
  EnglishDrill,
  ParentInsight,
  Simulation,
  SpacedReviewItem,
  Story,
} from "@/types/engines";

export const stories: Story[] = [
  {
    id: "st-signal-lost",
    title: "The Lost Signal",
    worldId: "w-signal",
    domainId: "d-english",
    ageBands: ["8-9", "10-11"],
    premise:
      "A weather station stopped sending words. Azouz needs a speaker brave enough to describe what the machines can only measure.",
    minutes: 8,
    beats: [
      {
        id: "b1",
        speakerCharacterId: "ch-azouz",
        text: "The station sends numbers, but no story. Numbers alone can't warn the village. Can you turn 14 degrees and grey clouds into a sentence someone would listen to?",
        teaches: "Turning data into descriptive language",
        choices: [
          { id: "c1", label: "It is cold and cloudy today.", consequence: "Clear, but flat — Azouz asks for one sensory detail." },
          { id: "c2", label: "Grey clouds are stacking up and the air bites at 14 degrees.", consequence: "Vivid and accurate — the village listens." },
        ],
      },
      {
        id: "b2",
        speakerCharacterId: "ch-lina",
        text: "Good. Now say it out loud twice — once for a friend, once for a crowd. Notice how your voice changes.",
        teaches: "Audience awareness in spoken English",
        choices: [
          { id: "c3", label: "Practise out loud", consequence: "Voice practice unlocked." },
          { id: "c4", label: "Write it instead", consequence: "Writing rubric opens instead — both routes reach the objective." },
        ],
      },
      {
        id: "b3",
        speakerCharacterId: "ch-azouz",
        text: "The signal is restored. Before we leave: what made your second version stronger than your first?",
        teaches: "Metacognitive reflection",
        choices: [{ id: "c5", label: "Record my reflection", consequence: "Reflection saved to portfolio evidence." }],
      },
    ],
  },
  {
    id: "st-forge-glitch",
    title: "Glitch in the Forge",
    worldId: "w-forge",
    domainId: "d-coding",
    ageBands: ["10-11", "12-14"],
    premise:
      "A conveyor loop in the Forge repeats forever. Koda thinks the bug is in the condition, not the loop.",
    minutes: 12,
    beats: [
      {
        id: "b1",
        speakerCharacterId: "ch-koda",
        text: "Read the loop before you change it. Where does the counter actually change?",
        teaches: "Tracing state through iteration",
        choices: [
          { id: "c1", label: "Inside the loop body", consequence: "Correct — now check whether it moves toward the stop condition." },
          { id: "c2", label: "In the condition itself", consequence: "Not quite — Koda walks the trace with you line by line." },
        ],
      },
      {
        id: "b2",
        speakerCharacterId: "ch-koda",
        text: "Fix it, then predict the output before running. Prediction first is how engineers build models, not guesses.",
        teaches: "Predict-then-run debugging discipline",
        choices: [{ id: "c3", label: "Write my prediction", consequence: "Prediction logged and compared to real output." }],
      },
    ],
  },
  {
    id: "st-market-pitch",
    title: "The Two-Minute Pitch",
    worldId: "w-market",
    domainId: "d-entrepreneurship",
    ageBands: ["12-14"],
    premise:
      "Sable opens a stall for one day only. You have a product, a price and two minutes to prove someone needs it.",
    minutes: 15,
    beats: [
      {
        id: "b1",
        speakerCharacterId: "ch-sable",
        text: "Before features: who is the person, and what is going wrong in their day without you?",
        teaches: "Problem framing before solution design",
        choices: [
          { id: "c1", label: "Describe the customer's bad day", consequence: "Strong start — the pitch now has a human at the centre." },
          { id: "c2", label: "List my product features", consequence: "Sable pushes back: features without a problem don't sell." },
        ],
      },
      {
        id: "b2",
        speakerCharacterId: "ch-sable",
        text: "Now price it. Explain the number using cost, value and what a fair trade looks like.",
        teaches: "Value-based pricing reasoning",
        choices: [{ id: "c3", label: "Justify my price", consequence: "Pricing rationale added to venture portfolio." }],
      },
    ],
  },
];

export const simulations: Simulation[] = [
  {
    id: "sim-bridge",
    title: "Load Test the Sky Bridge",
    domainId: "d-science",
    ageBands: ["10-11", "12-14"],
    scenario:
      "Adjust span, material thickness and load, then predict where the bridge fails before you run the test.",
    variables: [
      { id: "span", label: "Span", unit: "m", min: 4, max: 40, value: 18 },
      { id: "thickness", label: "Beam thickness", unit: "cm", min: 2, max: 24, value: 9 },
      { id: "load", label: "Load", unit: "kg", min: 50, max: 2000, value: 600 },
    ],
    successCriteria: [
      "Predict the failure point before running",
      "Explain why thickness matters more than span at high load",
      "Reach a stable configuration in under 6 runs",
    ],
    reflectionPrompt: "Which variable surprised you, and what does that tell you about your model?",
  },
  {
    id: "sim-recommender",
    title: "Train a Tiny Recommender",
    domainId: "d-ai",
    ageBands: ["12-14"],
    scenario:
      "Feed a small model different examples and watch how bias in the data changes what it recommends.",
    variables: [
      { id: "examples", label: "Training examples", unit: "items", min: 10, max: 500, value: 120 },
      { id: "diversity", label: "Data diversity", unit: "%", min: 0, max: 100, value: 45 },
      { id: "threshold", label: "Confidence threshold", unit: "%", min: 10, max: 95, value: 60 },
    ],
    successCriteria: [
      "Show one case where low diversity produces an unfair result",
      "Describe the trade-off when raising the confidence threshold",
      "Write a rule you would give the model's designers",
    ],
    reflectionPrompt: "Who could be harmed by this model, and what would you change first?",
  },
  {
    id: "sim-budget",
    title: "Run the Maker Stall Budget",
    domainId: "d-finance",
    ageBands: ["10-11", "12-14"],
    scenario: "Balance materials, price and expected sales across one market week.",
    variables: [
      { id: "price", label: "Unit price", unit: "coin", min: 1, max: 40, value: 12 },
      { id: "materials", label: "Material cost", unit: "coin", min: 1, max: 25, value: 5 },
      { id: "demand", label: "Expected buyers", unit: "people", min: 5, max: 200, value: 60 },
    ],
    successCriteria: [
      "Reach profit without raising price above value",
      "Explain fixed vs variable cost in your own words",
      "Plan for a week where demand halves",
    ],
    reflectionPrompt: "What would you cut first if sales dropped, and why that first?",
  },
];

export const englishDrills: EnglishDrill[] = [
  {
    id: "en-1",
    title: "Describe the weather like a reporter",
    focus: "pronunciation",
    ageBands: ["8-9"],
    prompt: "Say the sentence out loud, then say it again slower and clearer.",
    targetPhrases: ["grey clouds", "it feels cold", "bring a jacket"],
    rubric: ["Every word is audible", "Sentence has a clear ending", "Voice stays steady"],
    voiceEnabled: true,
  },
  {
    id: "en-2",
    title: "Ask three follow-up questions",
    focus: "conversation",
    ageBands: ["10-11", "12-14"],
    prompt: "Lina tells you about her invention. Keep the conversation alive with real questions.",
    targetPhrases: ["What made you try that?", "How did you test it?", "What would you change?"],
    rubric: ["Questions build on the answer", "No yes/no dead ends", "Listener repeats key detail"],
    voiceEnabled: true,
  },
  {
    id: "en-3",
    title: "Rewrite for a sharper argument",
    focus: "writing",
    ageBands: ["12-14"],
    prompt: "Take your paragraph and cut it by a third without losing the claim or the evidence.",
    targetPhrases: ["because", "the evidence shows", "however"],
    rubric: ["Claim stated once, clearly", "Evidence stays attached to the claim", "No filler sentences"],
    voiceEnabled: false,
  },
  {
    id: "en-4",
    title: "Listen and retell",
    focus: "listening",
    ageBands: ["8-9", "10-11"],
    prompt: "Listen to the short story, then retell it in four sentences.",
    targetPhrases: ["first", "then", "after that", "in the end"],
    rubric: ["Order is correct", "Main character named", "Ending included"],
    voiceEnabled: true,
  },
];

export const codingExercises: CodingExercise[] = [
  {
    id: "code-1",
    title: "Make the rover patrol",
    surface: "visual-blocks",
    language: "blocks",
    ageBands: ["8-9"],
    brief: "Snap blocks so the rover walks the square path and stops at the flag.",
    starter: "when start\n  repeat 4\n    move forward 2\n    turn right",
    blocks: ["when start", "repeat", "move forward", "turn right", "stop at flag"],
    checks: ["Rover returns to start", "Uses a repeat block", "Stops instead of looping forever"],
  },
  {
    id: "code-2",
    title: "Fix the endless loop",
    surface: "blocks-and-script",
    language: "python",
    ageBands: ["10-11"],
    brief: "The counter never reaches the stop condition. Trace it, then repair it.",
    starter: "count = 0\nwhile count < 5:\n    print(count)\n# the counter never changes",
    blocks: ["while", "if", "print", "increment"],
    checks: ["Loop terminates", "Prints 0 through 4", "Student predicted output before running"],
  },
  {
    id: "code-3",
    title: "Build a data filter",
    surface: "code-editor",
    language: "python",
    ageBands: ["12-14"],
    brief:
      "Write a function that filters readings above a threshold and explain the edge case you chose to handle.",
    starter:
      "def filter_readings(readings, threshold):\n    \"\"\"Return readings strictly above threshold.\"\"\"\n    return []",
    blocks: [],
    checks: ["Handles an empty list", "Does not mutate the input", "Explains the boundary case"],
  },
];

export const spacedReview: SpacedReviewItem[] = [
  {
    id: "sr-1",
    objectiveId: "o-en-1",
    prompt: "Describe today's weather using two sensory details.",
    dueAt: "2026-08-09T16:00:00.000Z",
    intervalDays: 3,
    retentionEstimate: 0.72,
  },
  {
    id: "sr-2",
    objectiveId: "o-en-2",
    prompt: "Ask a follow-up question that cannot be answered with yes or no.",
    dueAt: "2026-08-10T16:00:00.000Z",
    intervalDays: 5,
    retentionEstimate: 0.61,
  },
  {
    id: "sr-3",
    objectiveId: "o-ent-1",
    prompt: "Name the customer problem before naming the product.",
    dueAt: "2026-08-12T16:00:00.000Z",
    intervalDays: 8,
    retentionEstimate: 0.84,
  },
];

export const parentInsights: ParentInsight[] = [
  {
    id: "pi-1",
    headline: "Speaking confidence is rising",
    detail:
      "Voice activities completed without a retry went from 2 in 5 to 4 in 5 over two weeks. Encourage out-loud retelling at home.",
    signal: "positive",
    metric: "Spoken attempts without retry",
    value: "4 / 5",
  },
  {
    id: "pi-2",
    headline: "Debugging patience dips after 20 minutes",
    detail:
      "Hint requests spike late in coding sessions. Shorter sessions with a break are likely to hold mastery better.",
    signal: "watch",
    metric: "Hints in last 10 minutes",
    value: "3.1 avg",
  },
  {
    id: "pi-3",
    headline: "Review is overdue in two objectives",
    detail:
      "Spaced review keeps mastery from decaying. Two English objectives are past their review window.",
    signal: "action",
    metric: "Overdue reviews",
    value: "2",
  },
];

export const analyticsSummary: AnalyticsSummary = {
  weeklyMinutes: [24, 38, 41, 15, 52, 47, 33],
  domainBalance: [
    { domainId: "d-english", share: 0.28 },
    { domainId: "d-coding", share: 0.24 },
    { domainId: "d-ai", share: 0.16 },
    { domainId: "d-creativity", share: 0.12 },
    { domainId: "d-entrepreneurship", share: 0.11 },
    { domainId: "d-science", share: 0.09 },
  ],
  focusScore: 0.74,
  persistenceScore: 0.68,
  curiosityScore: 0.81,
};

export const hintLadder: ContextualHint[] = [
  { id: "h1", level: 1, text: "Read the condition out loud. What has to be true for the loop to stop?", revealsAnswer: false },
  { id: "h2", level: 2, text: "Nothing inside the loop changes the counter — find the line that should.", revealsAnswer: false },
  { id: "h3", level: 3, text: "Add `count = count + 1` as the last line inside the loop.", revealsAnswer: true },
];
