/**
 * Phase 20: Character System Enhancements
 *
 * Character creation, relationships, memory, and progression
 */

import type { ID, ISODate, AgeBand, MasteryState } from "@/types/domain";
import type { CharacterRole, CharacterMood } from "@/types/character";

/* ================================ CHARACTER CREATION ================================ */

export interface CharacterCreationWizard {
  step: CharacterCreationStep;
  progress: number; // 0-1
  character: CharacterInProgress;
}

export type CharacterCreationStep =
  | "welcome"
  | "choose-base"
  | "customize-appearance"
  | "choose-name"
  | "select-traits"
  | "set-voice"
  | "complete";

export interface CharacterInProgress {
  baseCharacter?: ID;
  appearance: {
    skinTone?: string;
    hairStyle?: string;
    hairColor?: string;
    eyeColor?: string;
    outfit?: string;
    accessories?: string[];
  };
  name?: string;
  traits: CharacterTrait[];
  voiceSettings: {
    speed: number; // 0.5 - 2.0
    pitch: number; // 0.5 - 2.0
    voice: string; // voice ID
  };
}

export interface CharacterTrait {
  id: ID;
  name: string;
  description: string;
  category: "personality" | "interest" | "strength";
  icon: string;
}

export interface CharacterBaseOption {
  id: ID;
  name: string;
  description: string;
  personality: string;
  defaultAppearance: CharacterInProgress["appearance"];
  preview: string; // URL
  ageBands: AgeBand[];
}

/* ================================ CHARACTER RELATIONSHIPS ================================ */

export interface CharacterRelationship {
  characterId: ID;
  characterName: string;
  level: number; // 1-10
  trust: number; // 0-1
  interactions: number;
  lastInteraction: ISODate;
  milestones: RelationshipMilestone[];
  memories: SharedMemory[];
  activities: SharedActivity[];
}

export interface RelationshipMilestone {
  id: ID;
  level: number;
  title: string;
  description: string;
  unlockedAt?: ISODate;
  rewards: string[];
}

export interface SharedMemory {
  id: ID;
  type: "mission" | "achievement" | "conversation" | "project";
  title: string;
  description: string;
  date: ISODate;
  importance: "low" | "medium" | "high";
  emotion?: CharacterMood;
}

export interface SharedActivity {
  id: ID;
  type: "mission" | "challenge" | "project" | "conversation";
  title: string;
  completedAt: ISODate;
  outcome: "success" | "learning" | "struggle";
  impactOnRelationship: number; // -1 to 1
}

/* ================================ CHARACTER MEMORY ================================ */

export interface CharacterMemory {
  characterId: ID;
  categories: MemoryCategory[];
  recentInteractions: MemoryEntry[];
  importantMoments: MemoryEntry[];
  learningJourney: LearningMemory[];
}

export interface MemoryCategory {
  id: ID;
  name: string;
  icon: string;
  count: number;
  lastUpdated: ISODate;
}

export interface MemoryEntry {
  id: ID;
  category: string;
  title: string;
  content: string;
  date: ISODate;
  relatedTo: {
    type: "skill" | "mission" | "project" | "conversation";
    id: ID;
  };
  emotion?: CharacterMood;
  importance: number; // 0-1
}

export interface LearningMemory {
  skillId: ID;
  skillName: string;
  firstIntroduction: ISODate;
  masteryProgress: {
    state: MasteryState;
    date: ISODate;
  }[];
  characterComments: string[];
}

/* ================================ CHARACTER PROGRESSION ================================ */

export interface CharacterProgression {
  characterId: ID;
  level: number;
  experience: number;
  nextLevelAt: number;
  abilities: CharacterAbility[];
  unlocks: CharacterUnlock[];
  evolution: CharacterEvolution[];
}

export interface CharacterAbility {
  id: ID;
  name: string;
  description: string;
  level: number; // Level unlocked at
  type: "hint" | "feedback" | "encouragement" | "teaching";
  unlocked: boolean;
  usageCount: number;
}

export interface CharacterUnlock {
  id: ID;
  type: "expression" | "outfit" | "ability" | "dialogue" | "story";
  name: string;
  description: string;
  level: number;
  unlocked: boolean;
  unlockedAt?: ISODate;
}

export interface CharacterEvolution {
  level: number;
  title: string;
  description: string;
  visualChange?: string;
  newAbilities: ID[];
  celebration: string;
}

/* ================================ CHARACTER REACTIONS ================================ */

export interface CharacterReaction {
  characterId: ID;
  trigger: ReactionTrigger;
  reaction: Reaction;
  timestamp: ISODate;
}

export interface ReactionTrigger {
  type: "achievement" | "mistake" | "question" | "progress" | "struggle" | "breakthrough";
  context: string;
  relatedTo?: {
    type: "skill" | "mission" | "activity";
    id: ID;
  };
}

export interface Reaction {
  expression: CharacterMood;
  message: string;
  gesture?: "wave" | "thumbs-up" | "clap" | "think" | "encourage";
  sound?: string; // Sound effect
  duration: number; // ms
}

export interface ReactionLibrary {
  characterId: ID;
  reactions: {
    [key in ReactionTrigger["type"]]: ReactionTemplate[];
  };
}

export interface ReactionTemplate {
  id: ID;
  condition: string;
  ageBand: AgeBand;
  expression: CharacterMood;
  messages: string[];
  gesture?: string;
}

/* ================================ SERVICE INTERFACES ================================ */

export interface CharacterCreationService {
  // Wizard
  startWizard(): Promise<CharacterCreationWizard>;
  nextStep(wizardId: ID, data: Partial<CharacterInProgress>): Promise<CharacterCreationWizard>;
  completeWizard(wizardId: ID): Promise<ID>; // Returns character ID

  // Options
  listBaseOptions(ageBand: AgeBand): Promise<CharacterBaseOption[]>;
  listTraits(category?: string): Promise<CharacterTrait[]>;
  listVoices(): Promise<{ id: string; name: string; preview: string }[]>;
}

export interface CharacterRelationshipService {
  getRelationship(characterId: ID): Promise<CharacterRelationship>;
  listMilestones(characterId: ID): Promise<RelationshipMilestone[]>;
  listMemories(characterId: ID): Promise<SharedMemory[]>;
  listActivities(characterId: ID): Promise<SharedActivity[]>;

  // Interactions
  recordInteraction(characterId: ID, type: string): Promise<void>;
  addMemory(characterId: ID, memory: Omit<SharedMemory, "id">): Promise<void>;
}

export interface CharacterMemoryService {
  getMemory(characterId: ID): Promise<CharacterMemory>;
  listEntries(characterId: ID, category?: string): Promise<MemoryEntry[]>;
  getLearningMemory(characterId: ID, skillId?: ID): Promise<LearningMemory[]>;
}

export interface CharacterProgressionService {
  getProgression(characterId: ID): Promise<CharacterProgression>;
  gainExperience(characterId: ID, amount: number): Promise<{
    leveledUp: boolean;
    newLevel?: number;
    unlocks?: CharacterUnlock[];
  }>;
  unlockAbility(characterId: ID, abilityId: ID): Promise<void>;
  getEvolution(characterId: ID, level: number): Promise<CharacterEvolution | null>;
}

export interface CharacterReactionService {
  getReaction(characterId: ID, trigger: ReactionTrigger): Promise<Reaction>;
  recordReaction(characterId: ID, reaction: CharacterReaction): Promise<void>;
  getReactionLibrary(characterId: ID): Promise<ReactionLibrary>;
}

/**
 * CRITICAL: Character System Principles
 *
 * ✅ Age-appropriate customization
 * ✅ Safe default options
 * ✅ Positive relationships
 * ✅ Educational progression
 * ✅ Memory respects privacy
 * ✅ Reactions are encouraging
 * ✅ No negative emotions aimed at learner
 * ✅ Character evolution celebrates learning
 */
