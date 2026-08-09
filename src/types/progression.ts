/**
 * Phase 14: Progression and Game System
 *
 * CRITICAL: Educationally responsible reward system
 *
 * We reward:
 * ✅ Practice, mastery, creation, curiosity, persistence, reflection, collaboration
 *
 * We DO NOT create:
 * ❌ Streak anxiety
 * ❌ Fear of losing progress
 * ❌ Excessive notifications
 * ❌ Pay-to-win mechanics
 * ❌ Social pressure
 * ❌ Leaderboard obsession
 *
 * Rewards reinforce learning behaviors, NOT just time spent.
 */
import type { AgeBand, ID, ISODate, MasteryState } from "@/types/domain";
import type { EvidenceType } from "@/types/curriculum";

/* -------------------------------- Core Progression ------------------------------- */

/**
 * XP (Experience Points)
 *
 * Earned through meaningful learning actions, NOT passive consumption.
 */
export interface XPGain {
  id: ID;
  amount: number;
  reason: string;
  /** What behavior earned this - must be active learning */
  source:
    | "skill-practiced"
    | "skill-mastered"
    | "project-completed"
    | "challenge-solved"
    | "reflection-written"
    | "peer-helped"
    | "question-asked"
    | "creation-shared"
    | "mistake-fixed"
    | "concept-explained";
  timestamp: ISODate;
  /** NO XP for just watching or passive time */
  requiresEvidence: boolean;
}

/**
 * Levels
 *
 * Levels represent overall progression but are NOT the primary motivation.
 * Skills and mastery are more important than level numbers.
 */
export interface LearnerLevel {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  /** Levels unlock new worlds/challenges, not arbitrary gates */
  unlocksAtNextLevel: string[];
}

/**
 * Coins (Soft currency)
 *
 * Used for avatar customization and optional items.
 * NEVER pay-to-win. Cosmetic only.
 */
export interface CoinsBalance {
  currentCoins: number;
  totalEarned: number;
  /** Coins earned through learning, not purchases */
  canPurchase: false; // No real money involved
}

export interface CoinGain {
  id: ID;
  amount: number;
  reason: string;
  source:
    | "milestone-reached"
    | "achievement-earned"
    | "daily-practice-complete"
    | "quest-completed"
    | "challenge-won";
  timestamp: ISODate;
}

/* -------------------------------- Avatar & Customization ------------------------------- */

export interface AvatarItem {
  id: ID;
  name: string;
  category: "hair" | "outfit" | "accessory" | "background" | "effect";
  description: string;
  thumbnailUrl: string;
  /** How to unlock - always through learning */
  unlockRequirement: {
    type: "skill-mastered" | "achievement" | "level" | "project-completed" | "coins";
    skillId?: ID;
    achievementId?: ID;
    level?: number;
    projectId?: ID;
    coinCost?: number;
  };
  unlocked: boolean;
  /** Trace back to learning */
  unlockedBy?: string; // "Mastered Loops & Iteration"
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface Avatar {
  characterId: ID;
  name: string;
  level: number;
  currentItems: {
    hair: ID | null;
    outfit: ID | null;
    accessory: ID | null;
    background: ID | null;
    effect: ID | null;
  };
  inventory: AvatarItem[];
  /** Avatar grows with learning, not purchases */
  evolutionStage: number;
}

/* -------------------------------- Achievements ------------------------------- */

export interface Achievement {
  id: ID;
  title: string;
  description: string;
  category: "skill" | "project" | "collaboration" | "curiosity" | "persistence" | "creativity";
  /** What this achievement recognizes */
  recognizes: string;
  /** Clear criteria */
  criteria: string[];
  progress: number; // 0-1
  completed: boolean;
  completedAt: ISODate | null;
  /** Always cite learning evidence */
  evidence?: string;
  /** Visual badge */
  badgeUrl: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  /** XP reward (reasonable, not excessive) */
  xpReward: number;
  coinReward: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  icon: string;
  achievements: Achievement[];
  completedCount: number;
  totalCount: number;
}

/* -------------------------------- Collections ------------------------------- */

export interface Collectible {
  id: ID;
  name: string;
  description: string;
  collectionId: ID;
  /** How to discover - through exploration and learning */
  discoveredBy: "exploring-world" | "completing-mission" | "asking-question" | "helping-peer";
  discovered: boolean;
  discoveredAt: ISODate | null;
  imageUrl: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface Collection {
  id: ID;
  name: string;
  description: string;
  themeIcon: string;
  collectibles: Collectible[];
  discoveredCount: number;
  totalCount: number;
  /** Collection reward for completion */
  completionReward: {
    xp: number;
    coins: number;
    unlocks?: string; // "Special badge" or "New world access"
  };
}

/* -------------------------------- Quests ------------------------------- */

/**
 * Quests are learning pathways, not fetch quests.
 * They guide meaningful learning sequences.
 */
export interface Quest {
  id: ID;
  title: string;
  description: string;
  /** Quest giver (character mentor) */
  fromCharacterId: ID;
  /** Learning objectives for this quest */
  objectives: QuestObjective[];
  /** Current objective */
  currentObjectiveIndex: number;
  progress: number; // 0-1
  status: "locked" | "available" | "in-progress" | "completed";
  /** Rewards tied to learning outcomes */
  rewards: {
    xp: number;
    coins: number;
    items?: ID[];
    unlocks?: string[];
  };
  /** Estimated learning time (honest) */
  estimatedMinutes: number;
  /** Related skills */
  skillIds: ID[];
}

export interface QuestObjective {
  id: ID;
  description: string;
  /** What to do - must be active learning */
  task:
    | "complete-activity"
    | "demonstrate-skill"
    | "create-artifact"
    | "solve-challenge"
    | "reflect"
    | "collaborate";
  completed: boolean;
  completedAt: ISODate | null;
  /** Progress indicator */
  progress: number; // 0-1
}

/* -------------------------------- Challenge Tiers ------------------------------- */

/**
 * Challenges for depth, not just difficulty.
 * Higher tiers = more sophisticated application, not just harder.
 */
export interface ChallengeTier {
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  description: string;
  /** What this tier requires */
  requires: {
    skillLevel: MasteryState;
    prerequisiteTiers: number[];
  };
  available: boolean;
}

export interface Challenge {
  id: ID;
  title: string;
  description: string;
  tier: ChallengeTier["tier"];
  domainId: ID;
  skillIds: ID[];
  /** Type of challenge */
  type: "puzzle" | "project" | "competition" | "collaboration" | "exploration";
  /** Difficulty represents sophistication, not frustration */
  difficulty: "approachable" | "interesting" | "ambitious" | "advanced";
  status: "locked" | "available" | "in-progress" | "completed";
  attempts: number;
  bestScore?: number;
  completedAt: ISODate | null;
  /** Rewards scale with tier */
  rewards: {
    xp: number;
    coins: number;
    badge?: ID;
  };
}

/* -------------------------------- Badges ------------------------------- */

export interface Badge {
  id: ID;
  name: string;
  description: string;
  /** What behavior this badge celebrates */
  celebrates: string;
  imageUrl: string;
  category: "skill" | "achievement" | "milestone" | "special";
  earnedAt: ISODate | null;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  /** Display on profile */
  displayable: boolean;
}

/* -------------------------------- Skill Trees ------------------------------- */

/**
 * Visual progression through a skill domain.
 * Shows relationships and unlocks naturally.
 */
export interface SkillTreeNode {
  skillId: ID;
  name: string;
  description: string;
  position: { x: number; y: number };
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: MasteryState;
  prerequisiteNodes: ID[];
  unlocksNodes: ID[];
  /** Visual indicator */
  icon: string;
}

export interface SkillTree {
  domainId: ID;
  name: string;
  description: string;
  nodes: SkillTreeNode[];
  progress: {
    nodesStarted: number;
    nodesMastered: number;
    totalNodes: number;
  };
}

/* -------------------------------- Milestones ------------------------------- */

/**
 * Major learning milestones - celebrate real progress.
 */
export interface Milestone {
  id: ID;
  title: string;
  description: string;
  /** What this milestone represents */
  significance: string;
  category: "skill-mastery" | "project-completion" | "world-discovery" | "collaboration";
  reached: boolean;
  reachedAt: ISODate | null;
  /** Evidence of achievement */
  evidence?: string;
  /** Visual celebration */
  celebrationMessage: string;
  rewards: {
    xp: number;
    coins: number;
    badge?: ID;
    unlocks?: string[];
  };
}

/* -------------------------------- World Unlocks ------------------------------- */

export interface WorldUnlock {
  worldId: ID;
  name: string;
  description: string;
  /** Unlocked by learning, not by waiting or paying */
  unlockRequirement: {
    type: "level" | "skill-mastered" | "mission-completed" | "achievement";
    level?: number;
    skillId?: ID;
    missionId?: ID;
    achievementId?: ID;
  };
  unlocked: boolean;
  unlockedAt: ISODate | null;
  /** Preview of what's inside */
  preview: string;
}

/* -------------------------------- Streaks (Responsible) ------------------------------- */

/**
 * IMPORTANT: Streaks WITHOUT anxiety
 *
 * - Celebrate consistency, don't punish breaks
 * - No "you lost your streak" messages
 * - Focus on "you practiced X days this week"
 * - Breaks are okay and expected
 */
export interface PracticeStreak {
  /** Current consecutive days (if active) */
  currentStreak: number;
  /** Longest ever (personal best) */
  longestStreak: number;
  /** Days practiced this week (out of 7) */
  daysThisWeek: number;
  /** Last practice date */
  lastPracticeDate: ISODate | null;
  /** NO penalties for breaks */
  streakBroken: false; // Never true - we don't break streaks
  /** Positive framing */
  message: string; // "You practiced 4 days this week - nice rhythm!"
}

/* -------------------------------- Leaderboards (Non-obsessive) ------------------------------- */

/**
 * IMPORTANT: Leaderboards WITHOUT pressure
 *
 * - Class/friends only, not global
 * - Show top learners but also "people near you"
 * - Celebrate multiple dimensions (not just XP)
 * - Opt-in only
 * - Can be hidden
 */
export interface Leaderboard {
  id: ID;
  name: string;
  scope: "class" | "guild" | "friends"; // Never global
  metric: "xp-this-week" | "skills-mastered" | "projects-completed" | "peers-helped";
  /** Learner's position */
  yourRank?: number;
  yourScore: number;
  /** Top performers */
  topEntries: LeaderboardEntry[];
  /** People near you (more relatable) */
  nearbyEntries: LeaderboardEntry[];
  /** Can be hidden */
  visible: boolean;
  /** Opt-in participation */
  participating: boolean;
}

export interface LeaderboardEntry {
  learnerId: ID;
  displayName: string;
  avatarUrl: string;
  score: number;
  rank: number;
}

/* -------------------------------- Age Adaptations ------------------------------- */

export interface ProgressionPresentation {
  ageBand: AgeBand;
  /** Reward visibility */
  showXPNumbers: boolean;
  showLevelNumbers: boolean;
  showCoinBalance: boolean;
  /** Language */
  rewardLanguage: "playful" | "balanced" | "achievement-focused";
  /** Emphasis */
  emphasize: "visible-rewards" | "balanced" | "skills-and-achievements";
  /** Vocabulary */
  vocabulary: {
    xp: string; // "Stars" | "XP" | "Experience"
    level: string; // "Level" | "Level" | "Progress Level"
    achievement: string; // "Badge" | "Achievement" | "Achievement"
  };
}

export const AGE_ADAPTIVE_PROGRESSION: Record<AgeBand, ProgressionPresentation> = {
  "8-9": {
    ageBand: "8-9",
    showXPNumbers: true,
    showLevelNumbers: true,
    showCoinBalance: true,
    rewardLanguage: "playful",
    emphasize: "visible-rewards",
    vocabulary: {
      xp: "Stars",
      level: "Level",
      achievement: "Badge",
    },
  },
  "10-11": {
    ageBand: "10-11",
    showXPNumbers: true,
    showLevelNumbers: true,
    showCoinBalance: true,
    rewardLanguage: "balanced",
    emphasize: "balanced",
    vocabulary: {
      xp: "XP",
      level: "Level",
      achievement: "Achievement",
    },
  },
  "12-14": {
    ageBand: "12-14",
    showXPNumbers: false, // De-emphasize game mechanics
    showLevelNumbers: false,
    showCoinBalance: true, // Still useful for customization
    rewardLanguage: "achievement-focused",
    emphasize: "skills-and-achievements",
    vocabulary: {
      xp: "Experience",
      level: "Progress Level",
      achievement: "Achievement",
    },
  },
};

/* -------------------------------- Anti-Anxiety Safeguards ------------------------------- */

/**
 * CRITICAL: Ethical design principles
 */
export const ETHICAL_DESIGN_RULES = {
  /** NO loss aversion triggers */
  noStreakPunishment: true,
  noProgressLoss: true,
  noTimeGates: true,

  /** NO excessive notifications */
  maxNotificationsPerDay: 3,
  onlyForMeaningfulMilestones: true,
  canDisableAll: true,

  /** NO pay-to-win */
  noPurchasableXP: true,
  noPurchasableSkills: true,
  noPurchasableProgress: true,
  cosmeticOnlyPurchases: true,

  /** NO social pressure */
  leaderboardsOptIn: true,
  noGlobalLeaderboards: true,
  canHideLeaderboards: true,
  noNameShaming: true,

  /** Positive framing */
  celebrateProgress: true,
  dontPunishBreaks: true,
  frameMistakesAsLearning: true,
  showGrowthNotRank: true,
};

/* -------------------------------- Services ------------------------------- */

export interface ProgressionService {
  /* XP and Levels */
  getXPBalance(): Promise<{ xp: number; level: number; xpForNext: number }>;
  awardXP(gain: Omit<XPGain, "id" | "timestamp">): Promise<XPGain>;

  /* Coins */
  getCoinBalance(): Promise<CoinsBalance>;
  awardCoins(gain: Omit<CoinGain, "id" | "timestamp">): Promise<CoinGain>;
  spendCoins(amount: number, itemId: ID): Promise<CoinsBalance>;

  /* Avatar */
  getAvatar(): Promise<Avatar>;
  updateAvatar(items: Partial<Avatar["currentItems"]>): Promise<Avatar>;
  unlockItem(itemId: ID): Promise<AvatarItem>;

  /* Achievements */
  listAchievements(): Promise<AchievementCategory[]>;
  checkAchievement(achievementId: ID): Promise<Achievement>;

  /* Collections */
  listCollections(): Promise<Collection[]>;
  discoverCollectible(collectibleId: ID): Promise<Collectible>;

  /* Quests */
  listQuests(): Promise<Quest[]>;
  startQuest(questId: ID): Promise<Quest>;
  updateQuestProgress(questId: ID, objectiveId: ID): Promise<Quest>;

  /* Challenges */
  listChallenges(): Promise<Challenge[]>;
  startChallenge(challengeId: ID): Promise<Challenge>;
  completeChallenge(challengeId: ID, score: number): Promise<Challenge>;

  /* Skill Trees */
  getSkillTree(domainId: ID): Promise<SkillTree>;

  /* Milestones */
  listMilestones(): Promise<Milestone[]>;

  /* World Unlocks */
  listWorldUnlocks(): Promise<WorldUnlock[]>;
  checkUnlock(worldId: ID): Promise<WorldUnlock>;

  /* Streaks (responsible) */
  getPracticeStreak(): Promise<PracticeStreak>;

  /* Leaderboards (opt-in) */
  listLeaderboards(): Promise<Leaderboard[]>;
  optInLeaderboard(leaderboardId: ID): Promise<void>;
  optOutLeaderboard(leaderboardId: ID): Promise<void>;
  hideLeaderboard(leaderboardId: ID): Promise<void>;
}

/**
 * EDUCATIONAL RESPONSIBILITY STATEMENT
 *
 * This progression system is designed to:
 * 1. Reward active learning behaviors
 * 2. Celebrate mastery and growth
 * 3. Support intrinsic motivation
 * 4. Avoid anxiety and manipulation
 * 5. Respect learner agency
 * 6. Age-adapt appropriately
 *
 * We explicitly reject:
 * - Dark patterns
 * - Loss aversion tactics
 * - Excessive notifications
 * - Pay-to-win mechanics
 * - Social manipulation
 * - Gamification without education
 *
 * Every reward traces back to learning.
 * Every unlock comes from mastery.
 * Every achievement celebrates growth.
 */
