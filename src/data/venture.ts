/**
 * Entrepreneurship World data.
 *
 * Fictional throughout. Currency is Sim Coins (SC) and every number is set so
 * that the "obvious" greedy move costs something visible — usually reputation,
 * quality or team — because the point of the simulation is trade-offs, not
 * accumulation.
 */
import type {
  PitchCriterion,
  PitchSectionMeta,
  SimMetricMeta,
  VentureDecision,
  VentureLab,
  VentureScenario,
  VentureSkillMeta,
} from "@/types/venture";

export const SIM_CURRENCY = "SC";

export const metrics: SimMetricMeta[] = [
  {
    id: "cash",
    label: "Cash",
    unit: SIM_CURRENCY,
    direction: "higher-better",
    scale: 600,
    description: "Sim Coins you can actually spend. Not real money, and never will be.",
  },
  {
    id: "customers",
    label: "Customers",
    unit: "people",
    direction: "higher-better",
    scale: 200,
    description: "People who chose you at least once. Keeping them is a different metric.",
  },
  {
    id: "reputation",
    label: "Reputation",
    unit: "/100",
    direction: "higher-better",
    scale: 100,
    description: "What people say when you aren't in the room. Slow to build, quick to drop.",
  },
  {
    id: "quality",
    label: "Product quality",
    unit: "/100",
    direction: "higher-better",
    scale: 100,
    description: "How good the thing itself is, separate from how well it's sold.",
  },
  {
    id: "team",
    label: "Team energy",
    unit: "/100",
    direction: "higher-better",
    scale: 100,
    description: "Whether the people helping you would help again next week.",
  },
  {
    id: "market",
    label: "Market fit",
    unit: "/100",
    direction: "higher-better",
    scale: 100,
    description: "How well what you built matches what people were already trying to solve.",
  },
  {
    id: "time",
    label: "Time left",
    unit: "weeks",
    direction: "balance",
    scale: 12,
    description: "Every decision spends some. Rushing and stalling both cost you.",
  },
  {
    id: "risk",
    label: "Risk",
    unit: "/100",
    direction: "lower-better",
    scale: 100,
    description: "How much of this falls apart if one thing goes wrong.",
  },
];

export const skills: VentureSkillMeta[] = [
  { id: "problem-identification", label: "Spotting problems", meaning: "Noticing what annoys people before inventing anything." },
  { id: "ideation", label: "Ideation", meaning: "Making many options, not defending the first one." },
  { id: "customer-understanding", label: "Understanding customers", meaning: "Asking instead of assuming." },
  { id: "value-proposition", label: "Value proposition", meaning: "Saying who it's for and why it beats doing nothing." },
  { id: "pricing", label: "Pricing", meaning: "Choosing a number and being able to justify it." },
  { id: "budgeting", label: "Budgeting", meaning: "Deciding what not to spend on." },
  { id: "revenue", label: "Revenue", meaning: "Money coming in, before anything is taken out." },
  { id: "cost", label: "Cost", meaning: "What each sale actually consumes." },
  { id: "profit", label: "Profit", meaning: "What's left — the number that decides if this survives." },
  { id: "marketing", label: "Marketing", meaning: "Helping the right people find you honestly." },
  { id: "sales", label: "Sales", meaning: "Listening well enough to know if you should sell at all." },
  { id: "negotiation", label: "Negotiation", meaning: "Finding a deal both sides would repeat." },
  { id: "communication", label: "Communication", meaning: "Being understood the first time." },
  { id: "pitching", label: "Pitching", meaning: "Making someone care in ninety seconds." },
  { id: "teamwork", label: "Teamwork", meaning: "Sharing work and credit in the same proportion." },
  { id: "decision-making", label: "Decision-making", meaning: "Choosing under uncertainty, then owning the result." },
];

export const labs: VentureLab[] = [
  {
    id: "idea",
    name: "Idea Lab",
    tagline: "Twenty ideas before one favourite.",
    purpose: "Train fluency in generating options so the first idea stops being the only idea.",
    output: "A shortlist of three ideas with reasons",
    skills: ["ideation", "decision-making", "problem-identification"],
    framing: {
      "8-9": "What could you make for your street?",
      "10-11": "What could a small business here actually do?",
      "12-14": "Which of these is a real opportunity, and which is just interesting?",
    },
    accent: "primary",
    kind: "simulation",
  },
  {
    id: "problem",
    name: "Problem Lab",
    tagline: "The problem is the product.",
    purpose: "Separate a real, frequent, painful problem from a mildly annoying one.",
    output: "A problem statement you can defend",
    skills: ["problem-identification", "customer-understanding", "decision-making"],
    framing: {
      "8-9": "What makes people sigh?",
      "10-11": "Who has this problem, how often, and how much does it cost them?",
      "12-14": "Is this problem urgent, frequent and expensive enough to be a business?",
    },
    accent: "secondary",
    kind: "simulation",
  },
  {
    id: "customer",
    name: "Customer Lab",
    tagline: "Ask five people before building anything.",
    purpose: "Replace assumptions with evidence gathered from actual people.",
    output: "Five interviews and what surprised you",
    skills: ["customer-understanding", "communication", "value-proposition"],
    framing: {
      "8-9": "Who is this for?",
      "10-11": "Ask them what they do today instead.",
      "12-14": "Interview without pitching — the moment you sell, the data dies.",
    },
    accent: "accent",
    kind: "simulation",
  },
  {
    id: "product",
    name: "Product Lab",
    tagline: "Smallest useful version wins.",
    purpose: "Scope a first version that can be finished, tested and improved.",
    output: "A version-one plan with what's deliberately missing",
    skills: ["value-proposition", "decision-making", "cost"],
    framing: {
      "8-9": "Make one really good thing.",
      "10-11": "What can you finish this week?",
      "12-14": "Cut scope until it ships, then earn the right to add.",
    },
    accent: "primary",
    kind: "simulation",
  },
  {
    id: "brand",
    name: "Brand Studio",
    tagline: "A promise, not a logo.",
    purpose: "Understand brand as the consistent promise a customer can rely on.",
    output: "A name, a promise and a tone",
    skills: ["communication", "value-proposition", "marketing"],
    framing: {
      "8-9": "What's your shop called, and what colour is it?",
      "10-11": "What should people expect every single time?",
      "12-14": "Positioning: who you're for, and who you're deliberately not for.",
    },
    accent: "secondary",
    kind: "simulation",
  },
  {
    id: "marketing",
    name: "Marketing Studio",
    tagline: "Get found by the right people.",
    purpose: "Practise honest reach: message, channel, and measuring whether it worked.",
    output: "One campaign and its result",
    skills: ["marketing", "communication", "budgeting"],
    framing: {
      "8-9": "Make a poster people actually read.",
      "10-11": "Pick one channel and do it properly.",
      "12-14": "Message, channel, cost per customer — and honesty as a constraint.",
    },
    accent: "accent",
    kind: "simulation",
  },
  {
    id: "sales",
    name: "Sales Room",
    tagline: "Listening is most of it.",
    purpose: "Learn selling as diagnosis, including saying no when it isn't a fit.",
    output: "Three conversations, one honest no",
    skills: ["sales", "negotiation", "communication"],
    framing: {
      "8-9": "Be friendly and tell the truth.",
      "10-11": "Ask what they need before you say what you have.",
      "12-14": "Handle objections without pressure — and walk away from bad fits.",
    },
    accent: "primary",
    kind: "simulation",
  },
  {
    id: "finance",
    name: "Finance Room",
    tagline: "Revenue is not profit.",
    purpose: "Build the cash instinct: price, cost, margin, runway.",
    output: "A simple profit model in Sim Coins",
    skills: ["pricing", "budgeting", "revenue", "cost", "profit"],
    framing: {
      "8-9": "If it costs 2 and you sell for 5, what's left?",
      "10-11": "Track money in, money out, money left.",
      "12-14": "Unit economics, fixed vs variable cost, and how long your runway is.",
    },
    accent: "secondary",
    kind: "simulation",
  },
  {
    id: "hq",
    name: "Startup HQ",
    tagline: "Where all eight numbers move at once.",
    purpose: "Run a whole venture where every choice trades one metric against another.",
    output: "A full run with a decision ledger",
    skills: ["decision-making", "teamwork", "profit", "marketing"],
    framing: {
      "8-9": "Run your shop for a few weeks.",
      "10-11": "Run a small business through a busy month.",
      "12-14": "Run a startup with limited runway and real trade-offs.",
    },
    accent: "accent",
    kind: "simulation",
  },
  {
    id: "pitch",
    name: "Pitch Stage",
    tagline: "Ninety seconds, six answers.",
    purpose: "Turn everything above into something a stranger understands and believes.",
    output: "A rehearsed pitch and a reflection",
    skills: ["pitching", "communication", "value-proposition"],
    framing: {
      "8-9": "Tell us about your shop.",
      "10-11": "Explain the problem, then your fix.",
      "12-14": "Problem, customer, solution, edge, money, ask.",
    },
    accent: "primary",
    kind: "pitch",
  },
];

export const labById = new Map(labs.map((lab) => [lab.id, lab]));

/* ------------------------------- decisions -------------------------------- */

export const decisions: VentureDecision[] = [
  /* Idea Lab */
  {
    id: "d-idea-1",
    labId: "idea",
    title: "The first idea feeling",
    situation:
      "You've had one idea and it feels brilliant. Everyone at the table is already drawing the logo.",
    question: "What do you do next?",
    teachingPoint:
      "The first idea is rarely the best one — it's just the fastest. Fluency beats attachment.",
    options: [
      {
        id: "o-idea-1a",
        label: "Build it immediately",
        tradeoff: "Fast and exciting, but you never saw the alternatives.",
        effects: { time: -2, quality: -5, risk: 12, market: -8 },
        skills: ["decision-making"],
        consequence: "Week two: someone asks why not the simpler version, and you have no answer.",
      },
      {
        id: "o-idea-1b",
        label: "List twenty ideas first",
        tradeoff: "Costs a week and feels slow when you're keen.",
        effects: { time: -1, market: 10, risk: -8, quality: 4 },
        skills: ["ideation", "decision-making"],
        consequence: "Idea fourteen is a smaller version of your favourite — and finishable.",
      },
      {
        id: "o-idea-1c",
        label: "Ask three people what annoys them",
        tradeoff: "You might lose the idea you loved.",
        effects: { time: -1, market: 14, customers: 3, risk: -6 },
        skills: ["problem-identification", "customer-understanding"],
        consequence: "Two of them describe the same irritation, and it isn't your idea.",
      },
    ],
  },
  {
    id: "d-idea-2",
    labId: "idea",
    title: "Choosing between three",
    situation: "Your shortlist is down to three. One is fun, one is easy, one is useful.",
    question: "Which do you take forward?",
    teachingPoint:
      "'Fun for me' and 'useful for them' aren't the same axis. Good founders can name which one they picked.",
    options: [
      {
        id: "o-idea-2a",
        label: "The fun one",
        tradeoff: "Motivation is high, demand is unproven.",
        effects: { team: 10, market: -6, risk: 8, time: -1 },
        skills: ["decision-making"],
        consequence: "You work happily for two weeks on something nobody asked for.",
      },
      {
        id: "o-idea-2b",
        label: "The easy one",
        tradeoff: "You'll finish, but so could anyone else.",
        effects: { time: -1, quality: 6, market: 2, risk: -4 },
        skills: ["decision-making", "cost"],
        consequence: "It ships early. A similar thing appears down the road a week later.",
      },
      {
        id: "o-idea-2c",
        label: "The useful one",
        tradeoff: "Harder, and you'll need help you don't have yet.",
        effects: { market: 12, quality: -4, team: -4, risk: 4, time: -2 },
        skills: ["value-proposition", "decision-making"],
        consequence: "The first person you show it to asks when they can have it.",
      },
    ],
  },

  /* Problem Lab */
  {
    id: "d-problem-1",
    labId: "problem",
    title: "Annoying or expensive?",
    situation:
      "Two problems are on the board: a small daily annoyance, and something that costs people an afternoon once a month.",
    question: "Which problem is worth solving?",
    teachingPoint:
      "Frequency times pain beats either one alone. Write the problem down before you write the solution.",
    options: [
      {
        id: "o-problem-1a",
        label: "Daily annoyance",
        tradeoff: "Constant demand, low willingness to pay.",
        effects: { customers: 25, market: 8, cash: -10, risk: 4 },
        skills: ["problem-identification"],
        consequence: "Lots of people nod. Very few reach for their Sim Coins.",
      },
      {
        id: "o-problem-1b",
        label: "Monthly afternoon",
        tradeoff: "Fewer moments to sell, much stronger pull.",
        effects: { customers: 8, market: 14, cash: 30, risk: -2 },
        skills: ["problem-identification", "value-proposition"],
        consequence: "One customer says they'd pay today if it existed.",
      },
      {
        id: "o-problem-1c",
        label: "Write both down and interview first",
        tradeoff: "Another week gone before you build.",
        effects: { time: -2, market: 16, risk: -10 },
        skills: ["customer-understanding", "problem-identification"],
        consequence: "Neither problem was quite right — the real one sat between them.",
      },
    ],
  },
  {
    id: "d-problem-2",
    labId: "problem",
    title: "The problem behind the request",
    situation: "A customer says: 'I want a faster delivery bag.' You ask why. They pause.",
    question: "How do you handle the pause?",
    teachingPoint:
      "People ask for solutions. Your job is to find the problem underneath the request.",
    options: [
      {
        id: "o-problem-2a",
        label: "Build the faster bag",
        tradeoff: "You solved their words, not their problem.",
        effects: { quality: 6, market: -8, cash: -25, time: -2 },
        skills: ["decision-making"],
        consequence: "They use it twice. The real trouble was the route, not the bag.",
      },
      {
        id: "o-problem-2b",
        label: "Ask 'what happened last time?'",
        tradeoff: "Slower conversation, some awkward silence.",
        effects: { market: 14, customers: 4, time: -1, reputation: 5 },
        skills: ["customer-understanding", "communication"],
        consequence: "The story reveals three failed handovers. That's the actual problem.",
      },
    ],
  },

  /* Customer Lab */
  {
    id: "d-customer-1",
    labId: "customer",
    title: "The interview trap",
    situation: "You're five minutes into an interview and they haven't mentioned your idea once.",
    question: "What now?",
    teachingPoint:
      "The second you pitch, the interview becomes politeness. Ask about the past, not the future.",
    options: [
      {
        id: "o-customer-1a",
        label: "Pitch the idea and ask if they'd buy",
        tradeoff: "You'll get a yes that means nothing.",
        effects: { market: -10, reputation: 2, risk: 10 },
        skills: ["communication"],
        consequence: "'Sounds great!' Nobody who says that has ever bought anything.",
      },
      {
        id: "o-customer-1b",
        label: "Ask what they did the last time this happened",
        tradeoff: "Harder to steer, and it may kill your idea.",
        effects: { market: 16, risk: -10, customers: 2, time: -1 },
        skills: ["customer-understanding"],
        consequence: "They describe a workaround involving three text messages and a sticky note.",
      },
      {
        id: "o-customer-1c",
        label: "Ask what they already pay for",
        tradeoff: "Feels blunt to ask about money.",
        effects: { market: 10, risk: -6 },
        skills: ["customer-understanding", "pricing"],
        consequence: "They already spend Sim Coins on a worse fix — that's your price ceiling.",
      },
    ],
  },
  {
    id: "d-customer-2",
    labId: "customer",
    title: "Five people, one pattern",
    situation: "Four of five interviews said the same thing. The fifth was your friend, who loved everything.",
    question: "Whose answer do you weight?",
    teachingPoint: "Friendly data is the most dangerous data. Pattern beats enthusiasm.",
    options: [
      {
        id: "o-customer-2a",
        label: "Trust your friend — they get it",
        tradeoff: "Comfortable, and quietly wrong.",
        effects: { team: 6, market: -12, risk: 12 },
        skills: ["decision-making"],
        consequence: "Your friend is still your only user in week six.",
      },
      {
        id: "o-customer-2b",
        label: "Follow the pattern from the four",
        tradeoff: "Means changing the part you liked most.",
        effects: { market: 15, quality: -4, customers: 10, risk: -8 },
        skills: ["customer-understanding", "decision-making"],
        consequence: "Two of the four ask to be told when it's ready.",
      },
    ],
  },

  /* Product Lab */
  {
    id: "d-product-1",
    labId: "product",
    title: "Scope",
    situation: "You have four weeks and a feature list with eleven items on it.",
    question: "What ships first?",
    teachingPoint:
      "Cut until it's finishable. A shipped small thing teaches you more than an unfinished big one.",
    options: [
      {
        id: "o-product-1a",
        label: "All eleven, working late",
        tradeoff: "Team energy is not infinite.",
        effects: { team: -20, quality: -10, time: -4, risk: 15 },
        skills: ["decision-making"],
        consequence: "Nine features half-work. Nobody can tell what the product is for.",
      },
      {
        id: "o-product-1b",
        label: "The three that solve the core problem",
        tradeoff: "You'll have to say no to people you like.",
        effects: { quality: 15, time: -2, market: 8, team: 4 },
        skills: ["value-proposition", "decision-making"],
        consequence: "It's small, it's finished, and it does the one thing cleanly.",
      },
      {
        id: "o-product-1c",
        label: "One feature, polished to a shine",
        tradeoff: "May be too thin to be useful.",
        effects: { quality: 20, market: -5, customers: -5, time: -1 },
        skills: ["cost", "decision-making"],
        consequence: "Beautiful. Two customers ask what else it does, and there is no else.",
      },
    ],
  },
  {
    id: "d-product-2",
    labId: "product",
    title: "The bug before launch",
    situation: "Launch is Friday. You find a bug that affects one customer in ten.",
    question: "Ship or hold?",
    teachingPoint:
      "Quality decisions are reputation decisions in disguise, and reputation compounds.",
    options: [
      {
        id: "o-product-2a",
        label: "Ship and fix quietly",
        tradeoff: "Speed now, trust later.",
        effects: { customers: 12, reputation: -14, risk: 12, cash: 25 },
        skills: ["decision-making"],
        consequence: "Two customers hit it publicly. The fix is now a story about you.",
      },
      {
        id: "o-product-2b",
        label: "Hold a week and fix it",
        tradeoff: "You lose the launch moment.",
        effects: { time: -1, quality: 12, reputation: 8, cash: -15 },
        skills: ["decision-making", "cost"],
        consequence: "Quieter launch, zero complaints, and a team that trusts the bar.",
      },
      {
        id: "o-product-2c",
        label: "Ship and say exactly what's broken",
        tradeoff: "Admitting a flaw in public is uncomfortable.",
        effects: { customers: 8, reputation: 10, risk: -4, cash: 15 },
        skills: ["communication", "decision-making"],
        consequence: "Someone reposts your honesty note. It brings more customers than the launch.",
      },
    ],
  },

  /* Brand Studio */
  {
    id: "d-brand-1",
    labId: "brand",
    title: "What the name promises",
    situation: "Two names on the wall: one clever and hard to say, one plain and instantly clear.",
    question: "Which goes on the door?",
    teachingPoint: "A brand is a promise repeated. Clever is only worth it if it's also clear.",
    options: [
      {
        id: "o-brand-1a",
        label: "The clever one",
        tradeoff: "Memorable to you, confusing to strangers.",
        effects: { reputation: 4, customers: -8, market: -4 },
        skills: ["communication"],
        consequence: "Three people spell it wrong and can't find you again.",
      },
      {
        id: "o-brand-1b",
        label: "The plain one",
        tradeoff: "Nobody will call it exciting.",
        effects: { customers: 10, reputation: 6, market: 5 },
        skills: ["communication", "marketing"],
        consequence: "People describe you accurately to other people. That's the whole job.",
      },
    ],
  },
  {
    id: "d-brand-2",
    labId: "brand",
    title: "Keeping the promise",
    situation: "You promised same-day help. This week you're one person short.",
    question: "What do you do with the promise?",
    teachingPoint: "A promise you break loudly costs more than a promise you narrow quietly and early.",
    options: [
      {
        id: "o-brand-2a",
        label: "Keep promising, hope it holds",
        tradeoff: "Every missed one is public.",
        effects: { reputation: -16, team: -12, risk: 14, customers: 4 },
        skills: ["decision-making"],
        consequence: "Four late replies. Two of them mention it to other people.",
      },
      {
        id: "o-brand-2b",
        label: "Change it to next-day and say why",
        tradeoff: "Feels like a downgrade.",
        effects: { reputation: 6, team: 8, customers: -3, risk: -8 },
        skills: ["communication", "teamwork"],
        consequence: "Nobody minds. What they'd have minded is being told nothing.",
      },
    ],
  },

  /* Marketing Studio */
  {
    id: "d-marketing-1",
    labId: "marketing",
    title: "Where to spend 60 Sim Coins",
    situation: "You have 60 SC of marketing budget and three ways to spend it.",
    question: "Where does it go?",
    teachingPoint:
      "Cost per customer is the number that matters, not how many people saw it.",
    options: [
      {
        id: "o-marketing-1a",
        label: "Posters everywhere",
        tradeoff: "Wide reach, mostly wrong people.",
        effects: { cash: -60, customers: 14, market: -2, reputation: 2 },
        skills: ["marketing", "budgeting"],
        consequence: "About 4 SC per customer, and few of them come back.",
      },
      {
        id: "o-marketing-1b",
        label: "One stall where your customers already gather",
        tradeoff: "Small audience, high intent.",
        effects: { cash: -35, customers: 20, market: 8, reputation: 6 },
        skills: ["marketing", "customer-understanding"],
        consequence: "Under 2 SC per customer, and half ask a real question.",
      },
      {
        id: "o-marketing-1c",
        label: "Overstate the results to get attention",
        tradeoff: "It works once.",
        effects: { cash: -20, customers: 26, reputation: -25, risk: 20 },
        skills: ["marketing"],
        consequence: "The claim gets checked. Refunds and a story that outlives the campaign.",
      },
    ],
  },

  /* Sales Room */
  {
    id: "d-sales-1",
    labId: "sales",
    title: "The wrong customer",
    situation:
      "Someone wants to buy, but as they talk it's clear your product won't solve their problem.",
    question: "Do you take the sale?",
    teachingPoint:
      "Selling to a bad fit buys Sim Coins today and pays for them with reputation for months.",
    options: [
      {
        id: "o-sales-1a",
        label: "Take the money",
        tradeoff: "Short-term cash, long-term complaint.",
        effects: { cash: 45, customers: 1, reputation: -18, risk: 12 },
        skills: ["sales"],
        consequence: "A refund request and an honest review you can't argue with.",
      },
      {
        id: "o-sales-1b",
        label: "Say it isn't right and point elsewhere",
        tradeoff: "You walk away from cash you needed.",
        effects: { cash: 0, reputation: 14, customers: 3, market: 6 },
        skills: ["sales", "communication"],
        consequence: "They send two friends who are the right fit.",
      },
      {
        id: "o-sales-1c",
        label: "Offer a smaller version that does fit",
        tradeoff: "Less revenue, more work to define.",
        effects: { cash: 20, customers: 2, reputation: 8, quality: -2, time: -1 },
        skills: ["negotiation", "sales", "value-proposition"],
        consequence: "They buy the small thing and upgrade a month later.",
      },
    ],
  },
  {
    id: "d-sales-2",
    labId: "sales",
    title: "The discount ask",
    situation: "A big buyer wants 40% off for ordering ten units.",
    question: "How do you answer?",
    teachingPoint:
      "A discount is a negotiation, not a reflex. Trade it for something you need.",
    options: [
      {
        id: "o-sales-2a",
        label: "Say yes immediately",
        tradeoff: "You just taught them your price was fake.",
        effects: { cash: 60, reputation: -4, risk: 8, market: -4 },
        skills: ["sales"],
        consequence: "Next order they ask for 50%.",
      },
      {
        id: "o-sales-2b",
        label: "Offer 15% if they pay up front",
        tradeoff: "They may say no.",
        effects: { cash: 85, risk: -6, reputation: 4 },
        skills: ["negotiation", "pricing", "profit"],
        consequence: "They take it. Cash arrives early, which is worth more than the discount.",
      },
      {
        id: "o-sales-2c",
        label: "Hold the price and explain the cost",
        tradeoff: "You might lose the order.",
        effects: { cash: 40, reputation: 8, customers: -1 },
        skills: ["negotiation", "cost", "communication"],
        consequence: "They order six instead of ten — at full price.",
      },
    ],
  },

  /* Finance Room */
  {
    id: "d-finance-1",
    labId: "finance",
    title: "Setting the price",
    situation: "Each unit costs you 6 SC to make. Similar things sell nearby for 14 SC.",
    question: "What do you charge?",
    teachingPoint:
      "Price below cost isn't kindness, it's a countdown. Margin is what keeps you open.",
    options: [
      {
        id: "o-finance-1a",
        label: "5 SC — cheapest around",
        tradeoff: "Every sale loses a coin.",
        effects: { customers: 30, cash: -40, risk: 22, reputation: 4 },
        skills: ["pricing", "cost", "profit"],
        consequence: "Busiest week you've had, and less cash at the end of it than the start.",
      },
      {
        id: "o-finance-1b",
        label: "12 SC — slightly under the market",
        tradeoff: "Modest margin, steady demand.",
        effects: { customers: 18, cash: 70, risk: -4, market: 6 },
        skills: ["pricing", "profit", "revenue"],
        consequence: "6 SC left per unit. It's not glamorous, and it works.",
      },
      {
        id: "o-finance-1c",
        label: "20 SC — premium, with a real reason",
        tradeoff: "You must earn it every single time.",
        effects: { customers: 7, cash: 60, quality: -0, reputation: 6, risk: 6 },
        skills: ["pricing", "value-proposition"],
        consequence: "Fewer buyers, better ones — but one bad batch and the story collapses.",
      },
    ],
  },
  {
    id: "d-finance-2",
    labId: "finance",
    title: "The runway question",
    situation: "You have 180 SC. Costs run at 45 SC a week whether you sell anything or not.",
    question: "What do you do with the fourth week of runway?",
    teachingPoint:
      "Runway is time bought with money. Spending it on learning is usually the better trade.",
    options: [
      {
        id: "o-finance-2a",
        label: "Spend it on more stock",
        tradeoff: "Stock isn't cash until it sells.",
        effects: { cash: -70, customers: 10, risk: 16, time: -1 },
        skills: ["budgeting", "cost"],
        consequence: "Shelves full, wallet thin. One slow week and you're stuck.",
      },
      {
        id: "o-finance-2b",
        label: "Cut costs and extend to six weeks",
        tradeoff: "Slower growth, more room to be wrong.",
        effects: { cash: 25, time: 2, team: -6, risk: -14 },
        skills: ["budgeting", "decision-making"],
        consequence: "Less exciting, and you're still here next month.",
      },
      {
        id: "o-finance-2c",
        label: "Spend it testing two prices",
        tradeoff: "Costs cash and gives no product.",
        effects: { cash: -30, market: 14, risk: -8, time: -1 },
        skills: ["pricing", "revenue", "decision-making"],
        consequence: "You learn 12 SC outsells 9 SC. That finding pays for itself twice over.",
      },
    ],
  },

  /* Startup HQ */
  {
    id: "d-hq-1",
    labId: "hq",
    title: "Week one: where does effort go?",
    situation: "Three people, one week, and everything feels urgent.",
    question: "What gets the week?",
    teachingPoint: "Doing everything a bit is how nothing gets finished. Sequence beats effort.",
    options: [
      {
        id: "o-hq-1a",
        label: "Talk to customers",
        tradeoff: "No visible progress on the product.",
        effects: { market: 14, customers: 6, time: -1, quality: -2 },
        skills: ["customer-understanding", "decision-making"],
        consequence: "You cut two planned features because nobody wanted them.",
      },
      {
        id: "o-hq-1b",
        label: "Improve the product",
        tradeoff: "Better thing, same unclear demand.",
        effects: { quality: 14, time: -1, market: -2, team: 4 },
        skills: ["decision-making"],
        consequence: "It's noticeably better. Whether it's needed is still unknown.",
      },
      {
        id: "o-hq-1c",
        label: "Split the team across all three",
        tradeoff: "Everyone's busy, nothing lands.",
        effects: { team: -10, quality: 4, market: 3, risk: 8, time: -1 },
        skills: ["teamwork"],
        consequence: "Three half-finished things and a tired team.",
      },
    ],
  },
  {
    id: "d-hq-2",
    labId: "hq",
    title: "A teammate is carrying too much",
    situation: "One person has done most of the work for two weeks and has gone quiet.",
    question: "How do you respond?",
    teachingPoint: "Team energy is a resource with no shortcut. Ignoring it is the expensive option.",
    options: [
      {
        id: "o-hq-2a",
        label: "Push through — the deadline matters",
        tradeoff: "You spend a person to save a week.",
        effects: { team: -22, quality: 6, risk: 16, time: 1 },
        skills: ["decision-making"],
        consequence: "They stop volunteering for anything. The pace drops for a month.",
      },
      {
        id: "o-hq-2b",
        label: "Redistribute and drop one feature",
        tradeoff: "Ship less, keep everyone.",
        effects: { team: 16, quality: -4, time: -1, reputation: 4 },
        skills: ["teamwork", "decision-making"],
        consequence: "The feature is missed by nobody. The person is still here in month three.",
      },
      {
        id: "o-hq-2c",
        label: "Ask them what would help",
        tradeoff: "Costs a conversation and some honesty.",
        effects: { team: 12, market: 2, time: -1, quality: 2 },
        skills: ["teamwork", "communication"],
        consequence: "Turns out one small task was eating half their week. You delete it.",
      },
    ],
  },
  {
    id: "d-hq-3",
    labId: "hq",
    title: "An offer arrives",
    situation:
      "Someone offers 200 SC to be your only supplier. It's good money and it locks you in for six weeks.",
    question: "Do you sign?",
    teachingPoint:
      "Risk is what breaks if one thing goes wrong. Concentration is the most common hidden risk.",
    options: [
      {
        id: "o-hq-3a",
        label: "Sign — the cash solves this month",
        tradeoff: "One relationship now decides your fate.",
        effects: { cash: 200, risk: 25, market: -4, time: -1 },
        skills: ["negotiation", "decision-making"],
        consequence: "Week four they're late. There is no plan B, because you sold it.",
      },
      {
        id: "o-hq-3b",
        label: "Sign for three weeks instead",
        tradeoff: "Less cash, more room to leave.",
        effects: { cash: 110, risk: 4, market: 2 },
        skills: ["negotiation", "budgeting"],
        consequence: "Shorter deal, same money per week, and an exit if it sours.",
      },
      {
        id: "o-hq-3c",
        label: "Decline and keep two suppliers",
        tradeoff: "You stay poorer and freer.",
        effects: { cash: -10, risk: -18, quality: 4, reputation: 4 },
        skills: ["decision-making", "cost"],
        consequence: "One supplier fails in week five. You barely notice.",
      },
    ],
  },
];

export const decisionById = new Map(decisions.map((d) => [d.id, d]));

/* ------------------------------- scenarios -------------------------------- */

const base = {
  cash: 180,
  customers: 12,
  reputation: 55,
  quality: 50,
  team: 70,
  market: 40,
  time: 8,
  risk: 30,
};

export const scenarios: VentureScenario[] = [
  {
    id: "sc-idea",
    labId: "idea",
    name: "Twenty before one",
    variants: {
      "8-9": {
        title: "The stall idea",
        premise: "You have a small table at the weekend market and no idea what to put on it.",
        successLooksLike: "You had lots of ideas before choosing, and you can say why you chose.",
      },
      "10-11": {
        title: "Choosing what to make",
        premise: "A small business needs a first product. Three shortlisted, one week to choose.",
        successLooksLike: "Your choice is based on what people need, not just what you like.",
      },
      "12-14": {
        title: "Opportunity screening",
        premise: "Three opportunities. Only one survives contact with real demand.",
        successLooksLike: "You screened for demand and evidence before committing effort.",
      },
    },
    start: { ...base, market: 30 },
    decisionIds: ["d-idea-1", "d-idea-2"],
    closingReflection: [
      "Which idea did you drop, and what would have made you keep it?",
      "Did you choose for you, or for a customer? Both are allowed — name which.",
    ],
  },
  {
    id: "sc-problem",
    labId: "problem",
    name: "Find the real problem",
    variants: {
      "8-9": {
        title: "What makes people sigh?",
        premise: "Two things bother people around you. Only one is worth fixing.",
        successLooksLike: "You can say who has the problem and how often.",
      },
      "10-11": {
        title: "Problem before product",
        premise: "You have a product idea. Now find out if the problem is real.",
        successLooksLike: "You wrote the problem down before the solution.",
      },
      "12-14": {
        title: "Frequency, pain, cost",
        premise: "Score two problems on how often they occur and what they cost.",
        successLooksLike: "You chose using evidence, not preference.",
      },
    },
    start: { ...base, market: 35, cash: 150 },
    decisionIds: ["d-problem-1", "d-problem-2"],
    closingReflection: [
      "Write the problem in one sentence with no solution in it.",
      "What would prove you wrong?",
    ],
  },
  {
    id: "sc-customer",
    labId: "customer",
    name: "Five conversations",
    variants: {
      "8-9": {
        title: "Ask five people",
        premise: "Before you build, five people get to tell you what they actually do.",
        successLooksLike: "You listened more than you talked.",
      },
      "10-11": {
        title: "Interviews without pitching",
        premise: "Five interviews. The rule: no selling until all five are done.",
        successLooksLike: "You found something that surprised you.",
      },
      "12-14": {
        title: "Evidence over enthusiasm",
        premise: "Distinguish signal from politeness across five interviews.",
        successLooksLike: "You weighted patterns above your most enthusiastic supporter.",
      },
    },
    start: { ...base, market: 32, customers: 5 },
    decisionIds: ["d-customer-1", "d-customer-2"],
    closingReflection: [
      "What did someone say that you didn't want to hear?",
      "What will you change because of it?",
    ],
  },
  {
    id: "sc-product",
    labId: "product",
    name: "Version one",
    variants: {
      "8-9": {
        title: "One good thing",
        premise: "You can make one thing really well, or four things badly.",
        successLooksLike: "You finished something and know what you left out.",
      },
      "10-11": {
        title: "Ship in four weeks",
        premise: "Eleven features, four weeks, one team.",
        successLooksLike: "You cut scope on purpose and can explain each cut.",
      },
      "12-14": {
        title: "Scope, quality, launch",
        premise: "Scope the smallest version that solves the core problem — then defend the bar.",
        successLooksLike: "You traded scope for quality deliberately, not accidentally.",
      },
    },
    start: { ...base, quality: 45, time: 6 },
    decisionIds: ["d-product-1", "d-product-2"],
    closingReflection: [
      "What did you leave out, and how will you know if it was the wrong cut?",
      "Which mattered more this run: shipping fast, or shipping right?",
    ],
  },
  {
    id: "sc-brand",
    labId: "brand",
    name: "A promise you can keep",
    variants: {
      "8-9": {
        title: "Your shop's promise",
        premise: "What should people expect from you every single time?",
        successLooksLike: "Your promise is small enough that you always keep it.",
      },
      "10-11": {
        title: "Name, promise, tone",
        premise: "Choose a name people can repeat and a promise you can survive.",
        successLooksLike: "Strangers describe you the way you'd describe yourself.",
      },
      "12-14": {
        title: "Positioning under pressure",
        premise: "Your promise meets a bad week. Something has to give.",
        successLooksLike: "You adjusted the promise before breaking it.",
      },
    },
    start: { ...base, reputation: 50 },
    decisionIds: ["d-brand-1", "d-brand-2"],
    closingReflection: [
      "Write your promise in seven words or fewer.",
      "What's the first thing that would break it?",
    ],
  },
  {
    id: "sc-marketing",
    labId: "marketing",
    name: "Sixty Sim Coins",
    variants: {
      "8-9": {
        title: "Getting noticed",
        premise: "You have a little money to tell people you exist.",
        successLooksLike: "You told the truth and reached the right people.",
      },
      "10-11": {
        title: "One channel, done properly",
        premise: "60 SC of budget and three tempting options.",
        successLooksLike: "You can say what each customer cost you.",
      },
      "12-14": {
        title: "Cost per customer",
        premise: "Reach is vanity. Work out which spend actually converts.",
        successLooksLike: "You optimised for cost per customer and refused the dishonest option.",
      },
    },
    start: { ...base, cash: 160, customers: 10 },
    decisionIds: ["d-marketing-1"],
    closingReflection: [
      "How much did each customer cost you in Sim Coins?",
      "Was anything you said in that campaign not strictly true?",
    ],
  },
  {
    id: "sc-sales",
    labId: "sales",
    name: "Three conversations",
    variants: {
      "8-9": {
        title: "Being honest at the counter",
        premise: "Someone wants something that won't help them.",
        successLooksLike: "You told the truth even when it cost a sale.",
      },
      "10-11": {
        title: "Listening first",
        premise: "Two customers, one discount request, one bad fit.",
        successLooksLike: "You diagnosed before you sold.",
      },
      "12-14": {
        title: "Objections and walk-aways",
        premise: "Handle a discount negotiation and a poor-fit buyer in the same week.",
        successLooksLike: "You traded rather than caved, and you walked away once.",
      },
    },
    start: { ...base, cash: 120, reputation: 60 },
    decisionIds: ["d-sales-1", "d-sales-2"],
    closingReflection: [
      "What did you say no to, and what did it cost you?",
      "Which question told you the most about the customer?",
    ],
  },
  {
    id: "sc-finance",
    labId: "finance",
    name: "Price, cost, runway",
    variants: {
      "8-9": {
        title: "What's left over?",
        premise: "It costs 6 to make. What should it cost to buy?",
        successLooksLike: "You know the difference between money in and money left.",
      },
      "10-11": {
        title: "Money in, money out",
        premise: "Set a price, then decide what to do with your last weeks of money.",
        successLooksLike: "You kept enough Sim Coins to survive a slow week.",
      },
      "12-14": {
        title: "Unit economics and runway",
        premise: "Margin per unit, fixed costs per week, and four weeks of runway.",
        successLooksLike: "You can state your margin and your runway without guessing.",
      },
    },
    start: { ...base, cash: 180, time: 4, market: 45 },
    decisionIds: ["d-finance-1", "d-finance-2"],
    closingReflection: [
      "What do you keep from each sale after costs?",
      "How many weeks could you survive with no sales at all?",
    ],
  },
  {
    id: "sc-hq",
    labId: "hq",
    name: "The full run",
    variants: {
      "8-9": {
        title: "Run your shop",
        premise: "A few weeks of choices: what to do, who helps, what to say yes to.",
        successLooksLike: "Your shop is still open and your helpers still want to help.",
      },
      "10-11": {
        title: "A busy month",
        premise: "A small business with a tired team, a tempting deal and limited weeks.",
        successLooksLike: "You balanced money against people instead of choosing one.",
      },
      "12-14": {
        title: "Limited runway",
        premise: "Three people, eight weeks, one concentrating offer that could sink you.",
        successLooksLike: "You managed risk deliberately rather than discovering it.",
      },
    },
    start: { ...base },
    decisionIds: ["d-hq-1", "d-hq-2", "d-hq-3"],
    closingReflection: [
      "Which decision would you take back, and what would you need to know to decide better?",
      "Which metric did you quietly ignore all run?",
      "Where did short-term money cost you something slower to rebuild?",
    ],
  },
];

export const scenariosByLab = (labId: string) => scenarios.filter((s) => s.labId === labId);

/* --------------------------------- pitch ---------------------------------- */

export const pitchSections: PitchSectionMeta[] = [
  {
    id: "problem",
    label: "The problem",
    question: "What's wrong right now, for someone real?",
    hint: {
      "8-9": "What makes people sigh?",
      "10-11": "Who has this problem and how often?",
      "12-14": "State frequency and cost. Avoid the word 'everyone'.",
    },
    seconds: 15,
  },
  {
    id: "customer",
    label: "Who it's for",
    question: "Who exactly, and who is it not for?",
    hint: {
      "8-9": "Name one person it helps.",
      "10-11": "Describe them like you've met them, because you have.",
      "12-14": "One segment, named narrowly. Breadth reads as vagueness.",
    },
    seconds: 12,
  },
  {
    id: "solution",
    label: "What you made",
    question: "What is it, in one sentence a stranger understands?",
    hint: {
      "8-9": "Say what it does, not how clever it is.",
      "10-11": "One sentence. No feature list yet.",
      "12-14": "Lead with the outcome, not the mechanism.",
    },
    seconds: 18,
  },
  {
    id: "different",
    label: "Why yours",
    question: "Why is this better than what they do today?",
    hint: {
      "8-9": "What's special about yours?",
      "10-11": "Compare to what they use now, not to nothing.",
      "12-14": "Your alternative is the status quo. Beat that first.",
    },
    seconds: 15,
  },
  {
    id: "money",
    label: "The money",
    question: "What does it cost you, what do you charge, what's left?",
    hint: {
      "8-9": "It costs this much, I sell it for that much.",
      "10-11": "Price minus cost equals what you keep.",
      "12-14": "Margin per unit and how many units to break even. Sim Coins only.",
    },
    seconds: 18,
  },
  {
    id: "ask",
    label: "The ask",
    question: "What do you want from the room?",
    hint: {
      "8-9": "What help would you like?",
      "10-11": "Ask for one specific thing.",
      "12-14": "One ask, specific and small enough to say yes to.",
    },
    seconds: 12,
  },
];

export const pitchCriteria: PitchCriterion[] = [
  { id: "pc-clarity", label: "Clarity", strongLooksLike: "A stranger could repeat your idea back correctly." },
  { id: "pc-evidence", label: "Evidence", strongLooksLike: "You quote something a real person said or did." },
  { id: "pc-specific", label: "Specificity", strongLooksLike: "Numbers and names instead of 'lots' and 'everyone'." },
  { id: "pc-money", label: "Money sense", strongLooksLike: "You know your cost, your price and what's left." },
  { id: "pc-ask", label: "The ask", strongLooksLike: "One request, small enough that someone can say yes today." },
];
