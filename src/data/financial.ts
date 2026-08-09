/**
 * Financial Literacy Mock Data
 *
 * Mock data for financial literacy domain
 */

import type {
  FinancialSkill,
  FinancialActivity,
  BudgetSimulation,
  SavingsChallenge,
  InvestmentGame,
  BusinessSimulation,
  FinancialConcept,
  AgeBand,
} from "@/types";

/* -------------------------------- Skills ------------------------------------- */

export const FINANCIAL_SKILLS: FinancialSkill[] = [
  {
    id: "fin-skill-001",
    concept: "money-basics",
    name: "Understanding Money",
    description: "Learn what money is and how it works",
    ageBands: ["8-9", "10-11"],
    mastery: "not-started",
    prerequisites: [],
  },
  {
    id: "fin-skill-002",
    concept: "earning",
    name: "Earning Money",
    description: "Understand how people earn money through work",
    ageBands: ["8-9", "10-11", "12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-001"],
  },
  {
    id: "fin-skill-003",
    concept: "spending",
    name: "Smart Spending",
    description: "Learn to make wise spending decisions",
    ageBands: ["8-9", "10-11", "12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-001"],
  },
  {
    id: "fin-skill-004",
    concept: "saving",
    name: "Saving Money",
    description: "Build the habit of saving for goals",
    ageBands: ["8-9", "10-11", "12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-003"],
  },
  {
    id: "fin-skill-005",
    concept: "budgeting",
    name: "Making a Budget",
    description: "Plan how to use money wisely",
    ageBands: ["10-11", "12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-003", "fin-skill-004"],
  },
  {
    id: "fin-skill-006",
    concept: "investing",
    name: "Investing Basics",
    description: "Learn how money can grow over time",
    ageBands: ["12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-004", "fin-skill-005"],
  },
  {
    id: "fin-skill-007",
    concept: "entrepreneurship",
    name: "Starting a Business",
    description: "Understand how businesses work",
    ageBands: ["10-11", "12-14"],
    mastery: "not-started",
    prerequisites: ["fin-skill-002"],
  },
];

/* -------------------------------- Activities --------------------------------- */

export const FINANCIAL_ACTIVITIES: FinancialActivity[] = [
  {
    id: "fin-act-001",
    type: "savings-challenge",
    title: "Save for a Goal",
    concept: "saving",
    scenario: "You want to buy a new game that costs $60. Can you save enough?",
    objectives: [
      "Set a savings goal",
      "Make a savings plan",
      "Track your progress",
      "Reach your goal",
    ],
    initialBalance: 10,
    duration: "medium",
    ageBands: ["8-9", "10-11"],
  },
  {
    id: "fin-act-002",
    type: "budget-simulation",
    title: "Weekly Budget Challenge",
    concept: "budgeting",
    scenario: "You have $20 for the week. Budget for snacks, activities, and savings.",
    objectives: [
      "Create a budget",
      "Track spending",
      "Stay within budget",
      "Save leftover money",
    ],
    initialBalance: 20,
    duration: "medium",
    ageBands: ["10-11", "12-14"],
  },
  {
    id: "fin-act-003",
    type: "shopping-decision",
    title: "Needs vs Wants",
    concept: "spending",
    scenario: "You have $50. Choose between needs and wants.",
    objectives: [
      "Identify needs vs wants",
      "Make spending choices",
      "Explain decisions",
    ],
    initialBalance: 50,
    duration: "short",
    ageBands: ["8-9", "10-11"],
  },
  {
    id: "fin-act-004",
    type: "investment-game",
    title: "Grow Your Money",
    concept: "investing",
    scenario: "Start with $100. Choose investments and watch them grow.",
    objectives: [
      "Learn about different investments",
      "Understand risk and return",
      "Build a portfolio",
      "Track performance",
    ],
    initialBalance: 100,
    duration: "long",
    ageBands: ["12-14"],
  },
  {
    id: "fin-act-005",
    type: "business-simulation",
    title: "Lemonade Stand",
    concept: "entrepreneurship",
    scenario: "Start a lemonade stand business. Make smart decisions to succeed.",
    objectives: [
      "Calculate costs",
      "Set prices",
      "Manage inventory",
      "Track profit",
    ],
    initialBalance: 50,
    duration: "long",
    ageBands: ["10-11", "12-14"],
  },
];

/* -------------------------------- Budget Simulations ------------------------- */

export const BUDGET_SIMULATIONS: BudgetSimulation[] = [
  {
    id: "budget-sim-001",
    title: "Weekly Allowance Budget",
    scenario: "You get $20 allowance each week. Plan how to spend and save it.",
    income: 20,
    expenses: [
      { id: "exp-001", name: "Snacks", type: "want", amount: 0, recurring: true },
      { id: "exp-002", name: "School lunch", type: "need", amount: 0, recurring: true },
      { id: "exp-003", name: "Activities", type: "want", amount: 0, recurring: true },
      { id: "exp-004", name: "Savings", type: "savings", amount: 0, recurring: true },
    ],
    goals: [
      {
        id: "goal-001",
        name: "Save for new game",
        targetAmount: 60,
        currentAmount: 0,
        priority: "high",
      },
    ],
    duration: 4, // weeks
    decisions: [
      {
        id: "dec-001",
        prompt: "Your friend invites you to the movies ($12). What do you do?",
        options: [
          {
            id: "opt-001",
            label: "Go to the movies",
            impact: { balance: -12, category: "exp-003" },
          },
          {
            id: "opt-002",
            label: "Suggest a free activity instead",
            impact: { balance: 0 },
          },
          {
            id: "opt-003",
            label: "Go but spend less on snacks this week",
            impact: { balance: -12, category: "exp-001" },
          },
        ],
        consequence: "Making choices helps you reach your goals!",
      },
    ],
  },
];

/* -------------------------------- Savings Challenges ------------------------- */

export const SAVINGS_CHALLENGES: SavingsChallenge[] = [
  {
    id: "save-chal-001",
    title: "52-Week Savings Challenge (Kid Version)",
    goal: 60,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 52 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    strategy: "weekly",
    progress: 0,
    milestones: [
      { id: "mile-001", amount: 15, reward: "Bronze Saver Badge", reached: false },
      { id: "mile-002", amount: 30, reward: "Silver Saver Badge", reached: false },
      { id: "mile-003", amount: 45, reward: "Gold Saver Badge", reached: false },
      { id: "mile-004", amount: 60, reward: "Master Saver Badge", reached: false },
    ],
  },
];

/* -------------------------------- Investment Games --------------------------- */

export const INVESTMENT_GAMES: InvestmentGame[] = [
  {
    id: "invest-game-001",
    title: "Grow Your $100",
    scenario: "You have $100 to invest. Choose wisely and watch it grow over 12 weeks.",
    startingCapital: 100,
    timeframe: 12, // weeks
    options: [
      {
        id: "inv-opt-001",
        name: "Savings Account",
        type: "savings",
        riskLevel: "low",
        potentialReturn: "1-2% per year",
        description: "Very safe, but slow growth. Good for money you need soon.",
        ageAppropriate: ["8-9", "10-11", "12-14"],
      },
      {
        id: "inv-opt-002",
        name: "Company Stocks",
        type: "stocks",
        riskLevel: "medium",
        potentialReturn: "5-10% per year (can go up or down)",
        description: "Buy part of a company. Value can go up or down.",
        ageAppropriate: ["12-14"],
      },
      {
        id: "inv-opt-003",
        name: "Start a Small Business",
        type: "business",
        riskLevel: "high",
        potentialReturn: "10-50% (or lose money)",
        description: "Use money to start a business. Higher risk, higher reward.",
        ageAppropriate: ["12-14"],
      },
    ],
    portfolio: {
      id: "port-001",
      investments: [],
      totalValue: 100,
      growth: 0,
    },
    marketEvents: [
      {
        id: "event-001",
        week: 3,
        title: "Tech Company Releases Popular Game",
        description: "A tech company's new game is a huge hit!",
        impact: { "inv-opt-002": 15 }, // +15% for stocks
      },
      {
        id: "event-002",
        week: 6,
        title: "Economic Slowdown",
        description: "People are spending less money.",
        impact: { "inv-opt-002": -10, "inv-opt-003": -20 },
      },
    ],
  },
];

/* -------------------------------- Business Simulations ----------------------- */

export const BUSINESS_SIMULATIONS: BusinessSimulation[] = [
  {
    id: "biz-sim-001",
    title: "Lemonade Stand Empire",
    businessType: "Lemonade Stand",
    startingCapital: 50,
    phases: [
      {
        id: "phase-001",
        name: "Planning",
        objectives: [
          "Calculate costs",
          "Set prices",
          "Choose location",
        ],
        challenges: [
          "Limited budget",
          "Competition",
        ],
      },
      {
        id: "phase-002",
        name: "Opening Day",
        objectives: [
          "Make first sale",
          "Manage inventory",
          "Track expenses",
        ],
        challenges: [
          "Weather changes",
          "Customer preferences",
        ],
      },
      {
        id: "phase-003",
        name: "Growing",
        objectives: [
          "Increase customers",
          "Improve product",
          "Expand offerings",
        ],
        challenges: [
          "Keeping quality high",
          "Managing growth",
        ],
      },
    ],
    decisions: [
      {
        id: "dec-001",
        phase: "phase-001",
        scenario: "How much should you charge per cup?",
        options: [
          {
            id: "opt-001",
            label: "$0.50 (cheap)",
            cost: 0,
            impact: { revenue: 50, customers: 100, reputation: 5 },
          },
          {
            id: "opt-002",
            label: "$1.00 (fair)",
            cost: 0,
            impact: { revenue: 80, customers: 80, reputation: 10 },
          },
          {
            id: "opt-003",
            label: "$2.00 (premium)",
            cost: 0,
            impact: { revenue: 60, customers: 30, reputation: 8 },
          },
        ],
      },
    ],
    metrics: {
      revenue: 0,
      expenses: 50,
      profit: -50,
      customers: 0,
      reputation: 5,
    },
  },
];
