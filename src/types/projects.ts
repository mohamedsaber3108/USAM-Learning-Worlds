/**
 * Phase 13: Projects and Portfolio
 *
 * Complete project lifecycle from idea to featured portfolio piece.
 * Age-adaptive presentation while maintaining professional learning rigor.
 */
import type { AgeBand, ID, ISODate, MasteryState } from "@/types/domain";
import type { EvidenceType } from "@/types/curriculum";

/* -------------------------------- Project Lifecycle ------------------------------- */

/**
 * Phase 13: 7 project states
 */
export type ProjectState =
  | "idea"
  | "planning"
  | "building"
  | "testing"
  | "improving"
  | "completed"
  | "featured";

export const PROJECT_STATE_META: Record<
  ProjectState,
  { label: string; meaning: string; color: string; canEdit: boolean }
> = {
  idea: {
    label: "Idea",
    meaning: "You're figuring out what to make",
    color: "bg-gray-100 text-gray-700",
    canEdit: true,
  },
  planning: {
    label: "Planning",
    meaning: "Sketching it out before you build",
    color: "bg-blue-100 text-blue-700",
    canEdit: true,
  },
  building: {
    label: "Building",
    meaning: "Creating it piece by piece",
    color: "bg-purple-100 text-purple-700",
    canEdit: true,
  },
  testing: {
    label: "Testing",
    meaning: "Trying it out to see what works",
    color: "bg-orange-100 text-orange-700",
    canEdit: true,
  },
  improving: {
    label: "Improving",
    meaning: "Making it better based on what you learned",
    color: "bg-amber-100 text-amber-700",
    canEdit: true,
  },
  completed: {
    label: "Completed",
    meaning: "Finished and ready to share",
    color: "bg-green-100 text-green-700",
    canEdit: false,
  },
  featured: {
    label: "Featured",
    meaning: "Your mentor chose this as exceptional work",
    color: "bg-primary/20 text-primary",
    canEdit: false,
  },
};

/* -------------------------------- Project Model ------------------------------- */

export interface ProjectMilestone {
  id: ID;
  title: string;
  description: string;
  /** What must be true for this to be complete */
  completionCriteria: string[];
  completed: boolean;
  completedAt: ISODate | null;
  order: number;
}

export interface ProjectArtifact {
  id: ID;
  type: "code" | "design" | "writing" | "media" | "recording" | "other";
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: ISODate;
  /** Which milestone this artifact fulfills */
  milestoneId?: ID;
}

export interface ProjectFeedback {
  id: ID;
  fromCharacterId: ID;
  /** What's working well */
  strengths: string[];
  /** What to focus on next */
  nextSteps: string[];
  /** Specific skill demonstrated */
  skillDemonstrated?: string;
  timestamp: ISODate;
  /** Evidence type this feedback provides */
  evidenceType?: EvidenceType;
}

export interface ProjectReflection {
  id: ID;
  prompt: string;
  response: string;
  timestamp: ISODate;
}

export interface ProjectSkillConnection {
  skillId: ID;
  /** Current mastery level when project started */
  startingMastery: MasteryState;
  /** Expected mastery after completion */
  targetMastery: MasteryState;
  /** Whether this project is the primary demonstration */
  isPrimaryEvidence: boolean;
}

/**
 * Privacy settings for portfolio items
 * Default: private (Phase 13 requirement)
 */
export type ProjectVisibility = "private" | "family" | "community";

export const VISIBILITY_META: Record<
  ProjectVisibility,
  { label: string; description: string; requiresApproval: boolean }
> = {
  private: {
    label: "Private",
    description: "Only you can see this",
    requiresApproval: false,
  },
  family: {
    label: "Family",
    description: "Your parents can see this",
    requiresApproval: false,
  },
  community: {
    label: "Community",
    description: "Other learners in USAM can see this",
    requiresApproval: true, // Requires parent approval
  },
};

/**
 * Complete project model - Phase 13
 */
export interface Project {
  id: ID;
  title: string;

  /* Goal and Context */
  goal: string;
  brief: string;
  missionId?: ID;
  missionContext?: string;

  /* Skills and Domains */
  domainIds: ID[];
  skillConnections: ProjectSkillConnection[];
  competencyIds: ID[];

  /* Lifecycle */
  state: ProjectState;
  progress: number; // 0-1
  createdAt: ISODate;
  lastModifiedAt: ISODate;
  completedAt: ISODate | null;
  featuredAt: ISODate | null;

  /* Instructions and Guidance */
  instructions: string;
  ageBands: AgeBand[];
  estimatedHours: number;

  /* Progress Tracking */
  milestones: ProjectMilestone[];
  artifacts: ProjectArtifact[];

  /* Learning Support */
  mentorCharacterId: ID;
  feedback: ProjectFeedback[];
  reflections: ProjectReflection[];
  aiSupportEnabled: boolean;

  /* Portfolio */
  visibility: ProjectVisibility;
  portfolioStatus: "draft" | "published" | "featured";
  featuredReason?: string;

  /* Workspace */
  workspaceType: "code" | "design" | "writing" | "multimedia" | "mixed";
  workspaceData?: Record<string, unknown>;
}

/* -------------------------------- Portfolio ------------------------------- */

export interface PortfolioProject {
  projectId: ID;
  title: string;
  description: string;
  thumbnailUrl?: string;
  state: ProjectState;
  domainIds: ID[];
  completedAt: ISODate | null;
  featuredAt: ISODate | null;
  skillsCount: number;
  artifactsCount: number;
  visibility: ProjectVisibility;
}

export interface PortfolioSkillSummary {
  skillId: ID;
  skillName: string;
  domainId: ID;
  currentMastery: MasteryState;
  projectsCount: number;
  evidenceCount: number;
  firstDemonstratedAt: ISODate;
  lastDemonstratedAt: ISODate;
}

export interface PortfolioAchievement {
  achievementId: ID;
  title: string;
  description: string;
  earnedAt: ISODate;
  evidenceUrl?: string;
}

export interface PortfolioTimelineEntry {
  id: ID;
  type: "project-completed" | "skill-mastered" | "achievement-earned" | "milestone-reached";
  title: string;
  description: string;
  timestamp: ISODate;
  relatedId: ID;
  thumbnailUrl?: string;
}

/**
 * Complete portfolio model
 */
export interface Portfolio {
  learnerId: ID;

  /* Projects */
  projects: PortfolioProject[];
  featuredProjects: PortfolioProject[];

  /* Skills */
  skills: PortfolioSkillSummary[];
  skillsByDomain: Record<ID, PortfolioSkillSummary[]>;

  /* Achievements */
  achievements: PortfolioAchievement[];

  /* Timeline */
  timeline: PortfolioTimelineEntry[];

  /* Stats */
  stats: {
    totalProjects: number;
    completedProjects: number;
    featuredProjects: number;
    skillsMastered: number;
    totalArtifacts: number;
    learningHours: number;
    firstProjectAt: ISODate | null;
    joinedAt: ISODate;
  };

  /* Portfolio Settings */
  displayName: string;
  bio?: string;
  visibility: ProjectVisibility; // Default portfolio visibility
  customization: {
    theme: string;
    layout: "grid" | "timeline" | "gallery";
  };
}

/* -------------------------------- Age Adaptations ------------------------------- */

/**
 * Phase 13: Age-adaptive portfolio presentations
 */
export interface PortfolioPresentationStyle {
  ageBand: AgeBand;
  layout: "visual-gallery" | "creator-portfolio" | "professional-portfolio";
  showTimeline: boolean;
  showSkillBreakdown: boolean;
  showGrowthMetrics: boolean;
  emphasisOn: "visuals" | "creation-process" | "skills-demonstrated";
  vocabulary: "simple" | "descriptive" | "professional";
}

export const AGE_ADAPTIVE_PORTFOLIO: Record<AgeBand, PortfolioPresentationStyle> = {
  "8-9": {
    ageBand: "8-9",
    layout: "visual-gallery",
    showTimeline: false,
    showSkillBreakdown: false,
    showGrowthMetrics: false,
    emphasisOn: "visuals",
    vocabulary: "simple",
  },
  "10-11": {
    ageBand: "10-11",
    layout: "creator-portfolio",
    showTimeline: true,
    showSkillBreakdown: true,
    showGrowthMetrics: false,
    emphasisOn: "creation-process",
    vocabulary: "descriptive",
  },
  "12-14": {
    ageBand: "12-14",
    layout: "professional-portfolio",
    showTimeline: true,
    showSkillBreakdown: true,
    showGrowthMetrics: true,
    emphasisOn: "skills-demonstrated",
    vocabulary: "professional",
  },
};

/* -------------------------------- Services ------------------------------- */

export interface ProjectService {
  list(): Promise<Project[]>;
  get(id: ID): Promise<Project>;
  create(params: {
    title: string;
    goal: string;
    brief: string;
    domainIds: ID[];
    workspaceType: Project["workspaceType"];
  }): Promise<Project>;
  update(id: ID, updates: Partial<Project>): Promise<Project>;
  delete(id: ID): Promise<void>;

  /* State transitions */
  advanceState(id: ID): Promise<Project>;
  completeProject(id: ID): Promise<Project>;
  featureProject(id: ID, reason: string): Promise<Project>;

  /* Milestones */
  addMilestone(projectId: ID, milestone: Omit<ProjectMilestone, "id">): Promise<ProjectMilestone>;
  completeMilestone(projectId: ID, milestoneId: ID): Promise<ProjectMilestone>;

  /* Artifacts */
  addArtifact(projectId: ID, artifact: Omit<ProjectArtifact, "id">): Promise<ProjectArtifact>;
  deleteArtifact(projectId: ID, artifactId: ID): Promise<void>;

  /* Feedback */
  addFeedback(projectId: ID, feedback: Omit<ProjectFeedback, "id">): Promise<ProjectFeedback>;

  /* Reflections */
  addReflection(projectId: ID, reflection: Omit<ProjectReflection, "id">): Promise<ProjectReflection>;

  /* Privacy */
  updateVisibility(projectId: ID, visibility: ProjectVisibility): Promise<Project>;
}

export interface PortfolioService {
  get(learnerId: ID): Promise<Portfolio>;
  updateSettings(learnerId: ID, settings: Partial<Portfolio["customization"]>): Promise<Portfolio>;
  exportPortfolio(learnerId: ID): Promise<{ url: string; format: "pdf" | "html" }>;
}

/* -------------------------------- AI Support ------------------------------- */

export interface ProjectAISupport {
  /** AI can help brainstorm ideas */
  ideation: {
    enabled: boolean;
    prompts: string[];
  };

  /** AI can review work in progress */
  reviewSupport: {
    enabled: boolean;
    checkFor: ("clarity" | "completeness" | "skills-demonstrated")[];
  };

  /** AI can suggest next steps */
  guidance: {
    enabled: boolean;
    basedOn: "progress" | "milestones" | "feedback";
  };

  /** AI never does the work for the learner */
  boundaries: {
    noCodeGeneration: boolean;
    noContentWriting: boolean;
    questionsOnly: boolean;
  };
}

/**
 * IMPORTANT: Privacy and Safety (Phase 13)
 *
 * - Projects are PRIVATE by default
 * - Community sharing requires parent approval
 * - No public social profiles created
 * - Portfolio is learner-controlled
 * - Certificates come later (not in this phase)
 */
