/**
 * Phase 16: Parent Experience
 *
 * CRITICAL: Educational insights, NOT surveillance
 *
 * Principles:
 * ✅ Focus on learning progress and patterns
 * ✅ Use observation-based language
 * ✅ Provide actionable recommendations
 * ✅ Respect child's privacy
 * ✅ Visual storytelling over spreadsheets
 *
 * ❌ NEVER make diagnostic claims
 * ❌ NEVER expose all private conversations
 * ❌ NEVER use labels like "gifted" or "struggling"
 */
import type { AgeBand, ID, ISODate, MasteryState } from "@/types/domain";
import type { ProjectState } from "@/types/projects";

/* -------------------------------- Parent Dashboard ------------------------------- */

export interface ParentDashboard {
  childId: ID;
  childName: string;
  ageBand: AgeBand;
  /** When this snapshot was generated */
  generatedAt: ISODate;

  /** Core insights */
  learningProgress: LearningProgress;
  skillsOverview: SkillsOverview;
  projectsOverview: ProjectsOverview;
  engagementPatterns: EngagementPatterns;
  timeSpent: TimeSpentInsights;
  worldProgression: WorldProgression;

  /** Recommendations for parents */
  recommendations: ParentRecommendation[];

  /** Safety and settings */
  safetyOverview: SafetyOverview;
  communicationActivity: CommunicationActivity;
}

/* -------------------------------- Learning Progress ------------------------------- */

export interface LearningProgress {
  /** Overall summary (observation-based) */
  summary: string; // "Your child has been actively learning this week"

  /** Skills being developed */
  activeSkills: {
    skillId: ID;
    skillName: string;
    domainName: string;
    currentMastery: MasteryState;
    progressDirection: "improving" | "steady" | "needs-attention";
    recentActivity: string; // "Practiced 4 times this week"
  }[];

  /** Areas of strength (observation-based) */
  strengths: ObservationInsight[];

  /** Areas that may benefit from practice */
  practiceOpportunities: ObservationInsight[];

  /** Recent milestones */
  recentMilestones: {
    id: ID;
    title: string;
    description: string;
    achievedAt: ISODate;
    significance: string; // What this milestone means
  }[];
}

/**
 * CRITICAL: Observation-based insights
 *
 * Use language like:
 * ✅ "Your child has spent time on..."
 * ✅ "Practice in X may be helpful..."
 * ✅ "Your child appears to engage more with..."
 * ✅ "Recent activity shows focus on..."
 *
 * NEVER:
 * ❌ "Your child has ADHD"
 * ❌ "Your child is gifted"
 * ❌ "Your child has low intelligence"
 * ❌ "Your child is struggling"
 */
export interface ObservationInsight {
  id: ID;
  /** Observation-based title */
  observation: string; // "Your child appears to engage deeply with coding challenges"
  /** Evidence for this observation */
  evidence: string[]; // ["Completed 8 coding challenges this week", "Spent 45 minutes on advanced puzzle"]
  /** What this suggests (carefully worded) */
  interpretation: string; // "This suggests curiosity and persistence in problem-solving"
  /** Actionable suggestion for parent */
  suggestion?: string; // "You might encourage exploration of more advanced coding projects"
}

/* -------------------------------- Skills Overview ------------------------------- */

export interface SkillsOverview {
  /** By domain */
  byDomain: {
    domainId: ID;
    domainName: string;
    skillsMastered: number;
    skillsInProgress: number;
    totalSkills: number;
    recentProgress: string; // "2 skills mastered this month"
  }[];

  /** Skills approaching mastery */
  approachingMastery: {
    skillId: ID;
    skillName: string;
    domainName: string;
    currentMastery: MasteryState;
    progressSummary: string; // "Close to mastery - has demonstrated this skill 8 times"
  }[];

  /** Skills that may benefit from review */
  needsReview: {
    skillId: ID;
    skillName: string;
    domainName: string;
    lastPracticedAt: ISODate;
    suggestion: string; // "A quick review session may help maintain this skill"
  }[];
}

/* -------------------------------- Projects Overview ------------------------------- */

export interface ProjectsOverview {
  /** Active projects */
  activeProjects: {
    projectId: ID;
    title: string;
    state: ProjectState;
    progress: number;
    startedAt: ISODate;
    lastWorkedOn: ISODate;
    skillsBeingDeveloped: string[];
  }[];

  /** Completed projects */
  completedProjects: {
    projectId: ID;
    title: string;
    completedAt: ISODate;
    skillsDemonstrated: string[];
    artifactCount: number;
    featured: boolean;
  }[];

  /** Project engagement patterns */
  patterns: {
    observation: string; // "Your child tends to work on projects in focused sessions"
    suggestion?: string; // "Consider setting aside dedicated project time"
  }[];
}

/* -------------------------------- Engagement Patterns ------------------------------- */

/**
 * Observation-based engagement insights
 * NEVER diagnostic
 */
export interface EngagementPatterns {
  /** Overall summary */
  summary: string; // "Your child shows consistent engagement with varied activities"

  /** Time of day preferences (observation) */
  timePreferences: {
    observation: string; // "Most active learning happens in afternoon hours"
    data: {
      morning: number;    // Hours
      afternoon: number;
      evening: number;
    };
  };

  /** Activity type preferences (observation) */
  activityPreferences: {
    observation: string; // "Your child appears to prefer hands-on building activities"
    activities: {
      type: string;
      engagementLevel: "high" | "medium" | "low";
      timeSpent: number; // Minutes
      completionRate: number; // 0-1
    }[];
  };

  /** Session patterns (observation) */
  sessionPatterns: {
    observation: string; // "Learning sessions typically last 15-25 minutes"
    averageSessionMinutes: number;
    sessionsPerWeek: number;
    consistency: "very-consistent" | "consistent" | "variable";
  };

  /** Collaboration preferences (observation) */
  collaborationPatterns: {
    observation: string; // "Your child engages well in both solo and collaborative work"
    soloVsCollaborative: {
      solo: number;         // Percentage
      collaborative: number;
    };
  };
}

/* -------------------------------- Time Spent ------------------------------- */

export interface TimeSpentInsights {
  /** This week */
  thisWeek: {
    totalMinutes: number;
    byDomain: { domainId: ID; domainName: string; minutes: number }[];
    comparedToLastWeek: number; // Percentage change
    daysActive: number; // Out of 7
  };

  /** This month */
  thisMonth: {
    totalMinutes: number;
    byDomain: { domainId: ID; domainName: string; minutes: number }[];
    weeksActive: number; // Out of 4
  };

  /** Learning consistency */
  consistency: {
    observation: string; // "Your child practices regularly, with 5 active days this week"
    pattern: "very-consistent" | "consistent" | "variable" | "just-started";
    longestStreak: number; // Days (personal best, not current to avoid anxiety)
  };

  /** Visual time distribution */
  weeklyDistribution: {
    date: ISODate;
    minutes: number;
  }[];
}

/* -------------------------------- World Progression ------------------------------- */

export interface WorldProgression {
  /** Worlds unlocked and explored */
  worlds: {
    worldId: ID;
    worldName: string;
    domainName: string;
    unlocked: boolean;
    progress: number; // 0-1
    missionsCompleted: number;
    totalMissions: number;
    lastVisited: ISODate | null;
  }[];

  /** Current focus */
  currentFocus: {
    worldId: ID;
    worldName: string;
    observation: string; // "Your child is currently exploring Signal Bay"
  };
}

/* -------------------------------- Recommendations ------------------------------- */

/**
 * Actionable, helpful recommendations for parents
 * Based on observations, not diagnoses
 */
export interface ParentRecommendation {
  id: ID;
  type: "practice" | "encouragement" | "activity" | "conversation" | "resource";
  priority: "high" | "medium" | "low";
  title: string;
  /** Why this recommendation */
  reason: string; // "Based on recent coding progress..."
  /** What parent can do */
  action: string; // "Ask your child to show you their lighthouse project"
  /** Expected benefit */
  benefit: string; // "This reinforces learning and gives them a chance to explain"
  /** Optional: Link to activity/resource */
  linkTo?: {
    type: "project" | "skill" | "activity" | "resource";
    id: ID;
    label: string;
  };
}

/* -------------------------------- Safety Overview ------------------------------- */

export interface SafetyOverview {
  /** Overall status */
  status: "all-clear" | "needs-attention" | "action-required";
  summary: string;

  /** Recent safety events */
  recentEvents: {
    id: ID;
    type: "report-submitted" | "report-received" | "content-flagged" | "user-blocked";
    description: string;
    date: ISODate;
    requiresAction: boolean;
  }[];

  /** Pending approvals count */
  pendingApprovals: number;

  /** Community settings status */
  communityEnabled: boolean;
  activeRestrictions: string[];
}

/* -------------------------------- Communication Activity ------------------------------- */

/**
 * CRITICAL: Privacy-respecting
 *
 * Show activity patterns, NOT full conversation content
 */
export interface CommunicationActivity {
  /** Summary (not detailed content) */
  summary: string; // "Your child exchanged 5 messages this week in team projects"

  /** Communication contexts (where, not what) */
  contexts: {
    context: "team" | "guild" | "feedback" | "project";
    messageCount: number;
    lastActive: ISODate;
  }[];

  /** All moderated status */
  moderationNote: string; // "All messages are reviewed before delivery"

  /** NOT included: actual message content (respects privacy) */
}

/* -------------------------------- Reports ------------------------------- */

/**
 * Visual storytelling reports
 */
export interface ParentReport {
  id: ID;
  type: "weekly" | "monthly" | "milestone";
  generatedAt: ISODate;
  periodStart: ISODate;
  periodEnd: ISODate;
  childId: ID;
  childName: string;

  /** Report sections */
  sections: ReportSection[];

  /** Downloadable/shareable */
  exportUrl?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  sectionType:
    | "hero-stat"
    | "visual-timeline"
    | "skill-growth"
    | "project-showcase"
    | "engagement-chart"
    | "milestone-celebration"
    | "recommendations"
    | "narrative";
  data: unknown; // Section-specific data
}

/* -------------------------------- Weekly Report ------------------------------- */

export interface WeeklyReport extends ParentReport {
  type: "weekly";

  /** Hero stat */
  heroStat: {
    label: string; // "Learning Time This Week"
    value: string; // "3 hours 45 minutes"
    change?: string; // "15 minutes more than last week"
    positive?: boolean;
  };

  /** This week's story */
  narrative: string; // "This week, your child explored coding challenges and completed their first animation project."

  /** Key highlights */
  highlights: {
    icon: string;
    title: string;
    description: string;
  }[];

  /** Skills practiced */
  skillsPracticed: {
    skillName: string;
    domainName: string;
    timesP racticed: number;
    progress: "new" | "improving" | "maintained";
  }[];

  /** Looking ahead */
  lookingAhead: string; // "Next week focuses on..."
}

/* -------------------------------- Monthly Report ------------------------------- */

export interface MonthlyReport extends ParentReport {
  type: "monthly";

  /** Month in review */
  narrative: string;

  /** Growth trajectory */
  growth: {
    skillsMastered: number;
    projectsCompleted: number;
    worldsExplored: number;
    learningHours: number;
  };

  /** Visual skill progression */
  skillProgression: {
    skillName: string;
    domainName: string;
    startingMastery: MasteryState;
    endingMastery: MasteryState;
    visualStory: string; // "Went from practicing to proficient"
  }[];

  /** Project journey */
  projects: {
    title: string;
    completed: boolean;
    skillsDeveloped: string[];
    timeSpent: number;
    featured: boolean;
  }[];

  /** Engagement trends */
  trends: {
    observation: string;
    visualization: "chart" | "timeline" | "comparison";
    data: unknown;
  }[];
}

/* -------------------------------- Milestone Report ------------------------------- */

export interface MilestoneReport extends ParentReport {
  type: "milestone";

  /** What was achieved */
  milestone: {
    title: string;
    description: string;
    achievedAt: ISODate;
    significance: string;
  };

  /** The journey to this milestone */
  journey: {
    startedAt: ISODate;
    keyMoments: {
      date: ISODate;
      description: string;
      type: "practice" | "breakthrough" | "project" | "collaboration";
    }[];
  };

  /** Skills demonstrated */
  skillsDemonstrated: {
    skillName: string;
    evidence: string;
  }[];

  /** Celebration message */
  celebration: string;

  /** What this unlocks */
  unlocks: string[];
}

/* -------------------------------- Visual Components ------------------------------- */

/**
 * Data structures for visual storytelling
 */
export interface VisualTimelineEvent {
  date: ISODate;
  type: "milestone" | "project" | "skill" | "achievement";
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface SkillGrowthVisualization {
  skillName: string;
  domainName: string;
  dataPoints: {
    date: ISODate;
    mastery: MasteryState;
    confidence: number;
  }[];
  narrative: string;
}

export interface EngagementChart {
  title: string;
  observation: string;
  chartType: "line" | "bar" | "area" | "donut";
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
}

/* -------------------------------- Services ------------------------------- */

export interface ParentService {
  /* Dashboard */
  getDashboard(childId: ID): Promise<ParentDashboard>;

  /* Reports */
  getWeeklyReport(childId: ID): Promise<WeeklyReport>;
  getMonthlyReport(childId: ID, month: string): Promise<MonthlyReport>;
  listMilestoneReports(childId: ID): Promise<MilestoneReport[]>;

  /* Settings */
  updateSafetySettings(childId: ID, settings: unknown): Promise<void>;
  approvePendingItem(itemId: ID): Promise<void>;
  denyPendingItem(itemId: ID, reason?: string): Promise<void>;
}

/**
 * CRITICAL PRINCIPLES FOR PARENT EXPERIENCE
 *
 * Language Guidelines:
 * ✅ Observation-based: "Your child has spent time on..."
 * ✅ Suggestion-focused: "Practice in X may be helpful..."
 * ✅ Pattern-noting: "Your child appears to engage more with..."
 * ✅ Evidence-backed: "Based on completing 8 challenges..."
 *
 * NEVER:
 * ❌ Diagnostic: "Your child has ADHD"
 * ❌ Labeling: "Your child is gifted/struggling"
 * ❌ Intelligence claims: "Your child has low intelligence"
 * ❌ Comparative: "Your child is behind peers"
 * ❌ Prescriptive: "Your child must do X"
 *
 * Privacy:
 * ✅ Show communication PATTERNS (how much, where)
 * ❌ Don't show full private conversations
 * ✅ Highlight safety events that need attention
 * ❌ Don't surveil every interaction
 *
 * Visualization:
 * ✅ Visual storytelling (charts, timelines, narratives)
 * ❌ Raw data spreadsheets
 * ✅ Meaningful insights
 * ❌ Overwhelming metrics
 *
 * Actionability:
 * ✅ Concrete recommendations
 * ✅ Things parents can do/say
 * ✅ Resources and activities
 * ❌ Vague advice
 * ❌ Expert-only suggestions
 */
