/**
 * Onboarding content: world intro beats, character-creation options, the
 * discovery conversation script and the recurring cast.
 *
 * All copy lives here so a future CMS or localisation backend can replace it
 * without touching a single component.
 */
import type {
  AccessoryId,
  AvatarConfig,
  CastMember,
  CharacterRelationship,
  ClothingStyle,
  DiscoveryPrompt,
  FaceShape,
  HairStyle,
} from "@/types/onboarding";
import type { Biome } from "@/components/world/WorldIllustration";

/* ------------------------------ arrival beats ------------------------------ */

export interface ArrivalBeat {
  id: string;
  biome: Biome;
  headline: string;
  line: string;
  voiceLine: string;
}

export const ARRIVAL_BEATS: ArrivalBeat[] = [
  {
    id: "beat-world",
    biome: "isles",
    headline: "A world made of questions",
    line: "Every island here holds something worth learning.",
    voiceLine: "Welcome. This world is built out of questions.",
  },
  {
    id: "beat-companion",
    biome: "orbit",
    headline: "You won't explore it alone",
    line: "Azouz travels with you, and remembers what you're working on.",
    voiceLine: "I'm Azouz. I'll travel with you.",
  },
  {
    id: "beat-character",
    biome: "forest",
    headline: "First, who are you here?",
    line: "Make a character. You can change it any time.",
    voiceLine: "Let's make your character.",
  },
];

/* --------------------------- character creation ---------------------------- */

export const FACE_SHAPES: { id: FaceShape; label: string }[] = [
  { id: "round", label: "Round" },
  { id: "oval", label: "Oval" },
  { id: "square", label: "Square" },
  { id: "heart", label: "Heart" },
];

export const SKIN_TONES: { id: string; label: string; value: string }[] = [
  { id: "s1", label: "Porcelain", value: "#f3d3bd" },
  { id: "s2", label: "Sand", value: "#e8b98f" },
  { id: "s3", label: "Honey", value: "#d09a63" },
  { id: "s4", label: "Amber", value: "#b3763f" },
  { id: "s5", label: "Umber", value: "#8a5330" },
  { id: "s6", label: "Cocoa", value: "#5d3620" },
  { id: "s7", label: "Ebony", value: "#3d2317" },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "curls", label: "Curls" },
  { id: "waves", label: "Waves" },
  { id: "braids", label: "Braids" },
  { id: "buzz", label: "Short" },
  { id: "afro", label: "Afro" },
  { id: "ponytail", label: "Ponytail" },
  { id: "locs", label: "Locs" },
  { id: "hijab", label: "Hijab" },
];

export const HAIR_COLORS: { id: string; label: string; value: string }[] = [
  { id: "h1", label: "Ink", value: "#1f1a17" },
  { id: "h2", label: "Chestnut", value: "#5a3620" },
  { id: "h3", label: "Copper", value: "#a2542a" },
  { id: "h4", label: "Wheat", value: "#c9a227" },
  { id: "h5", label: "Frost", value: "#cfd8e3" },
  { id: "h6", label: "Aurora", value: "#4fb7a5" },
  { id: "h7", label: "Nebula", value: "#8b6bd9" },
];

export const CLOTHING_STYLES: { id: ClothingStyle; label: string }[] = [
  { id: "explorer", label: "Explorer kit" },
  { id: "hoodie", label: "Hoodie" },
  { id: "labcoat", label: "Lab coat" },
  { id: "jacket", label: "Field jacket" },
  { id: "tunic", label: "Tunic" },
  { id: "jumpsuit", label: "Jumpsuit" },
];

export const OUTFIT_COLORS: { id: string; label: string; value: string }[] = [
  { id: "c1", label: "Ember", value: "#e08a3c" },
  { id: "c2", label: "Lagoon", value: "#3fa8a0" },
  { id: "c3", label: "Iris", value: "#7d6be0" },
  { id: "c4", label: "Moss", value: "#5f9e5b" },
  { id: "c5", label: "Rose", value: "#d96a8a" },
  { id: "c6", label: "Slate", value: "#6b7789" },
];

export const ACCESSORIES: { id: AccessoryId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "glasses", label: "Glasses" },
  { id: "headset", label: "Headset" },
  { id: "cap", label: "Cap" },
  { id: "scarf", label: "Scarf" },
  { id: "visor", label: "Visor" },
  { id: "badge", label: "Explorer badge" },
];

export const DEFAULT_AVATAR: AvatarConfig = {
  faceShape: "round",
  skinTone: SKIN_TONES[2]!.value,
  hairStyle: "curls",
  hairColor: HAIR_COLORS[1]!.value,
  clothing: "explorer",
  primaryColor: OUTFIT_COLORS[0]!.value,
  secondaryColor: OUTFIT_COLORS[1]!.value,
  accessory: "none",
};

export const INTEREST_OPTIONS = [
  "Space",
  "Animals",
  "Robots",
  "Drawing",
  "Music",
  "Games",
  "Sports",
  "Building",
  "Mysteries",
  "Cooking",
  "Nature",
  "Inventions",
];

export const THEME_OPTIONS = [
  "Ocean expedition",
  "Sky city",
  "Ancient ruins",
  "Deep space",
  "Rainforest lab",
  "Desert workshop",
];

export const ACTIVITY_OPTIONS = [
  "Making things",
  "Solving puzzles",
  "Telling stories",
  "Experiments",
  "Talking it through",
  "Drawing ideas",
];

/* --------------------------- discovery adventure --------------------------- */

export const DISCOVERY_PROMPTS: DiscoveryPrompt[] = [
  {
    id: "dp-subject",
    signal: "favoriteSubject",
    askedByRole: "main-companion",
    question: "If today could be about one thing, what would you pick?",
    questionExplorer: "What do you want to do today?",
    options: [
      { id: "a", label: "Words and stories", reply: "Stories it is.", value: "english" },
      { id: "b", label: "Making things work", reply: "A builder. Good.", value: "coding" },
      { id: "c", label: "How AI thinks", reply: "Big question. I like it.", value: "ai" },
      { id: "d", label: "Experiments", reply: "Let's test things then.", value: "science" },
    ],
  },
  {
    id: "dp-learning",
    signal: "learningPreference",
    askedByRole: "main-companion",
    question: "When something is new, what helps you most?",
    questionExplorer: "What helps you when something is new?",
    options: [
      { id: "a", label: "Show me a picture", reply: "Visuals first. Noted.", value: "visual" },
      { id: "b", label: "Let me try it", reply: "Hands on. My favourite.", value: "hands-on" },
      { id: "c", label: "Tell me out loud", reply: "I'll talk you through it.", value: "voice" },
      { id: "d", label: "Let me read it", reply: "I'll keep the notes clear.", value: "reading" },
    ],
  },
  {
    id: "dp-confidence",
    signal: "confidence",
    askedByRole: "wellbeing-companion",
    question: "When something gets hard, what usually happens?",
    questionExplorer: "When something is hard, what do you do?",
    options: [
      { id: "a", label: "I keep going", reply: "That's real persistence.", value: "high" },
      { id: "b", label: "I want a hint", reply: "Hints are smart, not cheating.", value: "medium" },
      { id: "c", label: "I take a break", reply: "Breaks help your brain. True.", value: "reset" },
      { id: "d", label: "I get stuck", reply: "Then I'll slow the pace down.", value: "support" },
    ],
  },
  {
    id: "dp-coding",
    signal: "codingFamiliarity",
    askedByRole: "coding-mentor",
    question: "Have you made anything with code before?",
    options: [
      { id: "a", label: "Never tried", reply: "Perfect starting point.", value: "new" },
      { id: "b", label: "Blocks like Scratch", reply: "Blocks count. Fully.", value: "blocks" },
      { id: "c", label: "A bit of Python or JS", reply: "Then we'll go further.", value: "script" },
      { id: "d", label: "I build projects", reply: "Bring one, I'll review it.", value: "advanced" },
    ],
  },
  {
    id: "dp-english",
    signal: "englishFamiliarity",
    askedByRole: "english-coach",
    question: "How does speaking English feel right now?",
    options: [
      { id: "a", label: "New for me", reply: "We'll start with sounds.", value: "beginner" },
      { id: "b", label: "Okay with words", reply: "Let's build sentences.", value: "developing" },
      { id: "c", label: "I can chat", reply: "Then we'll practise ideas.", value: "confident" },
      { id: "d", label: "I read whole books", reply: "Nuance next, then.", value: "advanced" },
    ],
  },
  {
    id: "dp-ai",
    signal: "aiFamiliarity",
    askedByRole: "ai-mentor",
    question: "What do you already think AI is?",
    options: [
      { id: "a", label: "No idea yet", reply: "We'll find out together.", value: "new" },
      { id: "b", label: "A robot brain", reply: "Close — it's patterns.", value: "intuition" },
      { id: "c", label: "I've used chatbots", reply: "Then let's look inside one.", value: "user" },
      { id: "d", label: "I know about models", reply: "Good. We'll test limits.", value: "informed" },
    ],
  },
  {
    id: "dp-problem",
    signal: "problemSolving",
    askedByRole: "science-mentor",
    question: "A puzzle lands in front of you. First move?",
    options: [
      { id: "a", label: "Try something fast", reply: "Experimenter.", value: "experiment" },
      { id: "b", label: "Plan it out", reply: "Planner. Useful.", value: "plan" },
      { id: "c", label: "Ask a question", reply: "The best first move.", value: "inquire" },
      { id: "d", label: "Break it up", reply: "Decomposition already.", value: "decompose" },
    ],
  },
  {
    id: "dp-story",
    signal: "storyPreference",
    askedByRole: "story-guide",
    question: "Which story would you step into?",
    options: [
      { id: "a", label: "A rescue mission", reply: "Stakes and speed.", value: "adventure" },
      { id: "b", label: "A mystery", reply: "Clues it is.", value: "mystery" },
      { id: "c", label: "Building a city", reply: "A maker's tale.", value: "builder" },
      { id: "d", label: "Meeting a creature", reply: "Wonder first.", value: "discovery" },
    ],
  },
  {
    id: "dp-challenge",
    signal: "challengePreference",
    askedByRole: "challenge-master",
    question: "How hard should the first challenge be?",
    options: [
      { id: "a", label: "Gentle warm-up", reply: "Warm-up set.", value: "gentle" },
      { id: "b", label: "Just right", reply: "Balanced start.", value: "balanced" },
      { id: "c", label: "Push me", reply: "Then I won't hold back.", value: "stretch" },
    ],
  },
  {
    id: "dp-creative",
    signal: "creativeInterest",
    askedByRole: "creativity-mentor",
    question: "What do you like making most?",
    options: [
      { id: "a", label: "Drawings", reply: "We'll sketch ideas.", value: "visual" },
      { id: "b", label: "Songs and sounds", reply: "Audio projects then.", value: "audio" },
      { id: "c", label: "Games", reply: "Game design suits you.", value: "games" },
      { id: "d", label: "Written stories", reply: "Writer's path.", value: "writing" },
    ],
  },
  {
    id: "dp-input",
    signal: "inputPreference",
    askedByRole: "main-companion",
    question: "Would you rather talk to me or type?",
    options: [
      { id: "a", label: "Talk out loud", reply: "Voice on by default.", value: "voice" },
      { id: "b", label: "Type", reply: "Typing it is.", value: "text" },
      { id: "c", label: "Both", reply: "I'll offer both every time.", value: "both" },
    ],
  },
  {
    id: "dp-activity",
    signal: "activityPreference",
    askedByRole: "project-reviewer",
    question: "What should your first project end with?",
    options: [
      { id: "a", label: "Something I can show", reply: "A shareable piece.", value: "artifact" },
      { id: "b", label: "Something that runs", reply: "Working build.", value: "working" },
      { id: "c", label: "Something I wrote", reply: "Words on record.", value: "written" },
    ],
  },
];

/* ---------------------------------- cast ----------------------------------- */

export const CAST: CastMember[] = [
  {
    id: "ch-azouz",
    name: "Azouz",
    role: "main-companion",
    roleLabel: "Primary companion",
    tagline: "Knows where you are and what's next.",
    responsibility: "Tracks your goals across every subject and keeps the path clear.",
    accentColor: "var(--color-primary)",
    metAtOnboarding: true,
  },
  {
    id: "ch-koda",
    name: "Koda",
    role: "coding-mentor",
    roleLabel: "Coding mentor",
    tagline: "Debugging partner who never hands you the answer.",
    responsibility: "Guides blocks, scripts and debugging at your level.",
    accentColor: "var(--color-primary)",
    metAtOnboarding: true,
  },
  {
    id: "ch-lina",
    name: "Lina",
    role: "english-coach",
    roleLabel: "English coach",
    tagline: "Conversation partner and language coach.",
    responsibility: "Practises speaking, listening and writing with real feedback.",
    accentColor: "var(--color-secondary)",
    metAtOnboarding: true,
  },
  {
    id: "ch-mira",
    name: "Mira",
    role: "creativity-mentor",
    roleLabel: "Creative mentor",
    tagline: "Pushes past your first obvious idea.",
    responsibility: "Helps you design, draft and revise creative work.",
    accentColor: "var(--color-accent)",
    metAtOnboarding: true,
  },
  {
    id: "ch-sable",
    name: "Sable",
    role: "science-mentor",
    roleLabel: "Science explorer",
    tagline: "Asks the question behind your question.",
    responsibility: "Runs experiments, fair tests and evidence checks with you.",
    accentColor: "var(--color-success)",
    metAtOnboarding: true,
  },
  {
    id: "ch-omar",
    name: "Omar",
    role: "entrepreneurship-mentor",
    roleLabel: "Entrepreneur mentor",
    tagline: "Turns ideas into tested ventures.",
    responsibility: "Shapes ideas into plans people actually need.",
    accentColor: "var(--color-warning)",
    metAtOnboarding: false,
  },
  {
    id: "ch-fable",
    name: "Fable",
    role: "story-guide",
    roleLabel: "Story guide",
    tagline: "Every mission is a chapter.",
    responsibility: "Frames learning inside stories and branching choices.",
    accentColor: "var(--color-secondary)",
    metAtOnboarding: true,
  },
  {
    id: "ch-rune",
    name: "Rune",
    role: "challenge-master",
    roleLabel: "Challenge master",
    tagline: "Sets the bar, then moves it fairly.",
    responsibility: "Designs challenges matched to your current level.",
    accentColor: "var(--color-destructive)",
    metAtOnboarding: false,
  },
  {
    id: "ch-sol",
    name: "Sol",
    role: "project-reviewer",
    roleLabel: "Project reviewer",
    tagline: "Reviews what you built, kindly and precisely.",
    responsibility: "Gives rubric-based feedback on finished projects.",
    accentColor: "var(--color-accent)",
    metAtOnboarding: false,
  },
  {
    id: "ch-hana",
    name: "Hana",
    role: "wellbeing-companion",
    roleLabel: "Reflection companion",
    tagline: "Checks in, then gets out of your way.",
    responsibility: "Helps you reflect, rest and decide your own next step.",
    accentColor: "var(--color-success)",
    metAtOnboarding: true,
  },
];

/* ------------------------------ relationships ------------------------------ */

const now = "2026-08-09T10:00:00.000Z";

export function starterRelationship(
  characterId: string,
  favoriteTopics: string[],
): CharacterRelationship {
  return {
    characterId,
    trust: 0.2,
    familiarity: 0.15,
    milestones: [
      {
        id: `${characterId}-m1`,
        label: "First meeting",
        description: "You met during your arrival in the world.",
        achievedAt: now,
      },
      {
        id: `${characterId}-m2`,
        label: "First mission together",
        description: "Finish one mission with this character.",
        achievedAt: null,
      },
      {
        id: `${characterId}-m3`,
        label: "You taught them something",
        description: "Explain your own method back to them.",
        achievedAt: null,
      },
    ],
    sharedMemories: [
      {
        id: `${characterId}-mem1`,
        summary: "You said how you like to learn — they wrote it down.",
        createdAt: now,
        topic: "Learning style",
      },
    ],
    favoriteTopics,
    recentConversations: [
      { id: `${characterId}-c1`, at: now, preview: "Welcome — tell me what you're curious about." },
    ],
    latestReaction: "curious",
    autonomyNote: "You choose when to talk. Nothing is lost if you don't.",
  };
}
