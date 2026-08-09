/**
 * Phase 20: Financial Literacy Domain
 *
 * Teaching money management, budgeting, saving, investing, and financial responsibility
 */

import type { ID, ISODate, AgeBand, MasteryState } from "@/types/domain";

/* -------------------------------- Financial Concepts ----------------------------- */

export type FinancialConcept =
  | "money-basics"
  | "earning"
  | "spending"
  | "saving"
  | "budgeting"
  | "banking"
  | "investing"
  | "credit"
  | "debt"
  | "taxes"
  | "insurance"
  | "entrepreneurship"
  | "financial-planning"
  | "economic-systems";

export interface FinancialSkill {
  id: ID;
  concept: FinancialConcept;
  name: string;
  description: string;
  ageBands: AgeBand[];
  mastery: MasteryState;
  prerequisites: ID[];
}

/* -------------------------------- Financial Activities --------------------------- */

export type FinancialActivityType =
  | "budget-simulation"
  | "savings-challenge"
  | "investment-game"
  | "business-simulation"
  | "shopping-decision"
  | "goal-planning"
  | "cost-comparison"
  | "income-tracking";

export interface FinancialActivity {
  id: ID;
  type: FinancialActivityType;
  title: string;
  concept: FinancialConcept;
  scenario: string;
  objectives: string[];
  initialBalance?: number;
  duration: "short" | "medium" | "long"; // 10min, 20min, multi-session
  ageBands: AgeBand[];
}

/* -------------------------------- Budget Simulation ------------------------------ */

export interface BudgetSimulation {
  id: ID;
  title: string;
  scenario: string;
  income: number;
  expenses: BudgetCategory[];
  goals: FinancialGoal[];
  duration: number; // days/weeks in simulation
  decisions: BudgetDecision[];
}

export interface BudgetCategory {
  id: ID;
  name: string;
  type: "need" | "want" | "savings" | "giving";
  amount: number;
  recurring: boolean;
}

export interface FinancialGoal {
  id: ID;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: ISODate;
  priority: "high" | "medium" | "low";
}

export interface BudgetDecision {
  id: ID;
  prompt: string;
  options: BudgetOption[];
  consequence: string;
}

export interface BudgetOption {
  id: ID;
  label: string;
  impact: {
    balance: number;
    category?: ID;
    goalProgress?: ID;
  };
}

/* -------------------------------- Savings Challenge ------------------------------ */

export interface SavingsChallenge {
  id: ID;
  title: string;
  goal: number;
  startDate: ISODate;
  endDate: ISODate;
  strategy: "weekly" | "daily" | "percentage" | "round-up";
  progress: number;
  milestones: SavingsMilestone[];
}

export interface SavingsMilestone {
  id: ID;
  amount: number;
  reward: string;
  reached: boolean;
}

/* -------------------------------- Investment Game -------------------------------- */

export interface InvestmentGame {
  id: ID;
  title: string;
  scenario: string;
  startingCapital: number;
  timeframe: number; // simulation weeks
  options: InvestmentOption[];
  portfolio: Portfolio;
  marketEvents: MarketEvent[];
}

export interface InvestmentOption {
  id: ID;
  name: string;
  type: "stocks" | "bonds" | "savings" | "business";
  riskLevel: "low" | "medium" | "high";
  potentialReturn: string;
  description: string;
  ageAppropriate: AgeBand[];
}

export interface Portfolio {
  id: ID;
  investments: PortfolioItem[];
  totalValue: number;
  growth: number; // percentage
}

export interface PortfolioItem {
  optionId: ID;
  amount: number;
  purchasePrice: number;
  currentValue: number;
}

export interface MarketEvent {
  id: ID;
  week: number;
  title: string;
  description: string;
  impact: Record<ID, number>; // investmentId -> percentage change
}

/* -------------------------------- Business Simulation ---------------------------- */

export interface BusinessSimulation {
  id: ID;
  title: string;
  businessType: string;
  startingCapital: number;
  phases: BusinessPhase[];
  decisions: BusinessDecision[];
  metrics: BusinessMetrics;
}

export interface BusinessPhase {
  id: ID;
  name: string;
  objectives: string[];
  challenges: string[];
}

export interface BusinessDecision {
  id: ID;
  phase: ID;
  scenario: string;
  options: {
    id: ID;
    label: string;
    cost: number;
    impact: {
      revenue?: number;
      customers?: number;
      reputation?: number;
    };
  }[];
}

export interface BusinessMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  customers: number;
  reputation: number;
}

/* -------------------------------- Financial World -------------------------------- */

export interface FinancialWorld {
  id: "financial-literacy";
  name: string;
  description: string;
  mascot: "Zara"; // Money-smart mentor
  regions: FinancialRegion[];
}

export type FinancialRegion =
  | "money-basics-town"
  | "savings-city"
  | "investment-district"
  | "entrepreneur-plaza"
  | "planning-center";

/* -------------------------------- Age Adaptations -------------------------------- */

export const FINANCIAL_AGE_ADAPTATION = {
  "8-9": {
    focus: ["money-basics", "earning", "spending", "saving"],
    vocabulary: "simple",
    activities: ["savings-challenge", "shopping-decision"],
    concepts: [
      "What is money",
      "Earning through chores",
      "Needs vs wants",
      "Saving for a goal",
    ],
  },
  "10-11": {
    focus: ["saving", "budgeting", "banking", "entrepreneurship"],
    vocabulary: "moderate",
    activities: ["budget-simulation", "savings-challenge", "business-simulation"],
    concepts: [
      "Making a budget",
      "Bank accounts",
      "Starting a small business",
      "Compound interest basics",
    ],
  },
  "12-14": {
    focus: ["investing", "credit", "financial-planning", "economic-systems"],
    vocabulary: "advanced",
    activities: ["investment-game", "business-simulation", "financial-planning"],
    concepts: [
      "Investment basics",
      "Credit and debt",
      "Long-term planning",
      "How economy works",
    ],
  },
} as const;

/* -------------------------------- Service Interface ------------------------------ */

export interface FinancialLiteracyService {
  // Skills
  listSkills(): Promise<FinancialSkill[]>;
  getSkill(id: ID): Promise<FinancialSkill | null>;

  // Activities
  listActivities(concept?: FinancialConcept): Promise<FinancialActivity[]>;
  getActivity(id: ID): Promise<FinancialActivity | null>;

  // Simulations
  startBudgetSimulation(id: ID): Promise<BudgetSimulation>;
  makeBudgetDecision(simulationId: ID, decisionId: ID, optionId: ID): Promise<void>;

  startSavingsChallenge(challengeId: ID): Promise<SavingsChallenge>;
  logSavings(challengeId: ID, amount: number): Promise<void>;

  startInvestmentGame(gameId: ID): Promise<InvestmentGame>;
  makeInvestment(gameId: ID, optionId: ID, amount: number): Promise<void>;

  startBusinessSimulation(id: ID): Promise<BusinessSimulation>;
  makeBusinessDecision(simulationId: ID, decisionId: ID, optionId: ID): Promise<void>;
}

/**
 * CRITICAL: Financial Literacy Principles
 *
 * ✅ Age-appropriate content
 * ✅ Real-world relevance
 * ✅ Practical skills focus
 * ✅ Safe simulations (virtual money)
 * ✅ Ethical money habits
 * ✅ No gambling mechanics
 * ✅ No real money transactions
 * ✅ Parent visibility
 *
 * Teaching responsible financial behavior for life.
 */
