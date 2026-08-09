/**
 * Phase 15: Safe Community System
 *
 * CRITICAL: Child safety is the absolute top priority
 *
 * Safety Principles:
 * ❌ NO unrestricted child-to-child messaging
 * ✅ All user-generated content is moderated
 * ✅ Easy reporting and blocking
 * ✅ Parental controls on all community features
 * ✅ Age-appropriate access rules
 * ✅ Clear moderation states
 * ✅ Transparent safety features
 */
import type { AgeBand, ID, ISODate, MasteryState } from "@/types/domain";

/* -------------------------------- Moderation States ------------------------------- */

/**
 * Every piece of user-generated content has a moderation state.
 * Frontend must display these states clearly.
 */
export type ModerationState =
  | "draft"           // Not submitted yet
  | "pending"         // Submitted, awaiting review
  | "approved"        // Reviewed and approved
  | "rejected"        // Rejected by moderator
  | "flagged"         // Flagged for additional review
  | "removed";        // Removed after approval

export interface ModerationStatus {
  state: ModerationState;
  submittedAt: ISODate | null;
  reviewedAt: ISODate | null;
  reviewedBy?: "auto" | "human";
  /** Why rejected/removed (shown to creator) */
  reason?: string;
  /** What needs to be fixed */
  guidance?: string;
}

/* -------------------------------- Safety Features ------------------------------- */

/**
 * Reporting system - easy and visible
 */
export interface Report {
  id: ID;
  reportedBy: ID;
  reportedAt: ISODate;
  targetType: "user" | "content" | "message" | "project" | "comment";
  targetId: ID;
  reason: ReportReason;
  description: string;
  status: "submitted" | "under-review" | "resolved";
  resolution?: string;
}

export type ReportReason =
  | "inappropriate-content"
  | "bullying"
  | "spam"
  | "personal-info-shared"
  | "unsafe-behavior"
  | "other";

export const REPORT_REASONS: Record<ReportReason, { label: string; description: string }> = {
  "inappropriate-content": {
    label: "Inappropriate Content",
    description: "Content that's not okay for kids",
  },
  bullying: {
    label: "Bullying or Mean Behavior",
    description: "Someone is being mean or hurtful",
  },
  spam: {
    label: "Spam",
    description: "Repeated or unwanted messages",
  },
  "personal-info-shared": {
    label: "Personal Information Shared",
    description: "Someone shared personal details (address, phone, etc.)",
  },
  "unsafe-behavior": {
    label: "Unsafe Behavior",
    description: "Something that makes you feel unsafe",
  },
  other: {
    label: "Other",
    description: "Something else that concerns you",
  },
};

/**
 * Blocking system
 */
export interface BlockedUser {
  userId: ID;
  blockedAt: ISODate;
  reason?: string;
}

/**
 * Parental Controls
 */
export interface ParentalCommunityControls {
  /** Can child access community features at all */
  communityEnabled: boolean;
  /** Can join teams/guilds */
  canJoinGroups: boolean;
  /** Can participate in challenges */
  canJoinChallenges: boolean;
  /** Can showcase projects publicly */
  canShowcasePublicly: boolean;
  /** Can give/receive peer feedback */
  canGivePeerFeedback: boolean;
  /** Can participate in events */
  canJoinEvents: boolean;
  /** Require approval for each action */
  requireApprovalFor: ("join-group" | "showcase" | "feedback" | "event")[];
  /** Parent receives notifications for */
  notifyParentFor: ("reports" | "flags" | "new-connections" | "all")[];
}

/**
 * Age-Based Access Rules
 */
export interface AgeAccessRules {
  ageBand: AgeBand;
  /** What community features are available */
  availableFeatures: CommunityFeature[];
  /** Requires parent approval */
  requiresParentApproval: CommunityFeature[];
  /** Additional restrictions */
  restrictions: {
    maxGroupSize: number;
    mustBeSupervised: boolean;
    adultMustBePresent: boolean;
  };
}

export type CommunityFeature =
  | "teams"
  | "guilds"
  | "co-op-missions"
  | "showcases"
  | "challenges"
  | "events"
  | "hackathons"
  | "collaborative-projects"
  | "peer-feedback";

export const AGE_COMMUNITY_RULES: Record<AgeBand, AgeAccessRules> = {
  "8-9": {
    ageBand: "8-9",
    availableFeatures: ["teams", "co-op-missions", "challenges"],
    requiresParentApproval: ["teams", "co-op-missions"],
    restrictions: {
      maxGroupSize: 4,
      mustBeSupervised: true,
      adultMustBePresent: true,
    },
  },
  "10-11": {
    ageBand: "10-11",
    availableFeatures: [
      "teams",
      "guilds",
      "co-op-missions",
      "showcases",
      "challenges",
      "events",
      "peer-feedback",
    ],
    requiresParentApproval: ["guilds", "showcases"],
    restrictions: {
      maxGroupSize: 6,
      mustBeSupervised: true,
      adultMustBePresent: false,
    },
  },
  "12-14": {
    ageBand: "12-14",
    availableFeatures: [
      "teams",
      "guilds",
      "co-op-missions",
      "showcases",
      "challenges",
      "events",
      "hackathons",
      "collaborative-projects",
      "peer-feedback",
    ],
    requiresParentApproval: ["guilds"],
    restrictions: {
      maxGroupSize: 8,
      mustBeSupervised: false,
      adultMustBePresent: false,
    },
  },
};

/* -------------------------------- Communication Model ------------------------------- */

/**
 * CRITICAL: NO unrestricted child-to-child messaging
 *
 * Communication is:
 * - Structured (predefined templates)
 * - Moderated (reviewed before delivery)
 * - Context-bound (related to learning activities)
 * - Parent-visible (parents can see all communication)
 */
export interface SafeMessage {
  id: ID;
  from: ID;
  to: ID[];
  context: "team" | "guild" | "project" | "feedback" | "challenge";
  contextId: ID;
  /** Structured message type */
  type:
    | "encouragement"      // "Great work!"
    | "question"           // "How did you do X?"
    | "suggestion"         // "Maybe try Y?"
    | "celebration"        // "We did it!"
    | "help-request"       // "Can someone help with Z?"
    | "feedback";          // Structured peer feedback
  /** Templated content (not freeform) */
  templateId: string;
  /** Filled-in values (sanitized) */
  values: Record<string, string>;
  /** Final composed message */
  content: string;
  moderationStatus: ModerationStatus;
  sentAt: ISODate | null; // Only set when approved
  readAt: ISODate | null;
}

/**
 * Message templates (structured communication)
 */
export interface MessageTemplate {
  id: string;
  type: SafeMessage["type"];
  template: string; // "Great work on {project}!"
  fields: MessageField[];
  ageAppropriate: AgeBand[];
}

export interface MessageField {
  name: string;
  type: "text" | "select" | "project-reference" | "skill-reference";
  maxLength?: number;
  options?: string[];
  validation: "safe-content" | "reference-only" | "predefined-only";
}

/* -------------------------------- Teams ------------------------------- */

/**
 * Small learning teams (2-4 learners)
 * Focused on specific missions or projects
 */
export interface Team {
  id: ID;
  name: string;
  description: string;
  /** Max size based on age */
  maxSize: number;
  currentSize: number;
  members: TeamMember[];
  /** What this team is working on */
  focusType: "mission" | "project" | "challenge";
  focusId: ID;
  /** Team mentor (adult supervisor) */
  mentorId?: ID;
  /** Created by teacher/mentor, not child */
  createdBy: "teacher" | "system";
  createdAt: ISODate;
  status: "active" | "completed" | "archived";
  /** Parent visibility */
  parentVisible: boolean;
  moderationStatus: ModerationStatus;
}

export interface TeamMember {
  userId: ID;
  role: "member" | "leader"; // Leader assigned by teacher
  joinedAt: ISODate;
  /** Parent approved this membership */
  parentApproved: boolean;
}

/* -------------------------------- Guilds ------------------------------- */

/**
 * Larger learning communities (10-30 learners)
 * Organized around domains or interests
 */
export interface Guild {
  id: ID;
  name: string;
  description: string;
  domainId: ID;
  iconUrl: string;
  /** Guild leader (adult) */
  leaderId: ID;
  /** Member count */
  memberCount: number;
  maxMembers: number;
  /** Guild level (based on collective achievements) */
  level: number;
  /** Collective stats */
  stats: {
    totalProjects: number;
    totalSkillsMastered: number;
    eventsCompleted: number;
  };
  /** Minimum age to join */
  minAge: number;
  /** Requires parent approval */
  requiresParentApproval: boolean;
  moderationStatus: ModerationStatus;
  createdAt: ISODate;
}

export interface GuildMember {
  userId: ID;
  guildId: ID;
  joinedAt: ISODate;
  role: "member" | "officer"; // Officer assigned by guild leader (adult)
  contributionScore: number;
  parentApproved: boolean;
}

/* -------------------------------- Co-op Missions ------------------------------- */

/**
 * Collaborative missions requiring teamwork
 */
export interface CoopMission {
  id: ID;
  title: string;
  description: string;
  domainIds: ID[];
  skillIds: ID[];
  /** Team size */
  minPlayers: number;
  maxPlayers: number;
  /** Roles within the mission */
  roles: MissionRole[];
  /** Estimated time */
  estimatedMinutes: number;
  /** Age appropriateness */
  ageBands: AgeBand[];
  /** Current teams working on this */
  activeTeams: number;
  /** Requires mentor supervision */
  requiresMentor: boolean;
  moderationStatus: ModerationStatus;
}

export interface MissionRole {
  id: string;
  name: string;
  description: string;
  responsibilities: string[];
  skillRequirements: ID[];
}

export interface CoopMissionProgress {
  missionId: ID;
  teamId: ID;
  progress: number; // 0-1
  rolesAssigned: Record<string, ID>; // roleId -> userId
  completedObjectives: ID[];
  startedAt: ISODate;
  completedAt: ISODate | null;
}

/* -------------------------------- Showcases ------------------------------- */

/**
 * Public display of completed work
 * HEAVILY moderated
 */
export interface Showcase {
  id: ID;
  projectId: ID;
  creatorId: ID;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: "coding" | "art" | "writing" | "multimedia" | "other";
  tags: string[];
  /** Age-appropriate visibility */
  visibleToAge: AgeBand[];
  viewCount: number;
  /** Reactions (structured, not freeform) */
  reactions: Record<ReactionType, number>;
  /** When showcased */
  showcasedAt: ISODate;
  /** Heavy moderation */
  moderationStatus: ModerationStatus;
  /** Featured by moderator */
  featured: boolean;
}

export type ReactionType = "inspiring" | "creative" | "clever" | "helpful";

/* -------------------------------- Challenges ------------------------------- */

/**
 * Community-wide learning challenges
 */
export interface CommunityChallenge {
  id: ID;
  title: string;
  description: string;
  type: "solo" | "team" | "guild";
  domainId: ID;
  skillIds: ID[];
  /** Start and end */
  startsAt: ISODate;
  endsAt: ISODate;
  /** Participation */
  participants: number;
  maxParticipants?: number;
  /** Age groups */
  ageBands: AgeBand[];
  /** Requires parent approval */
  requiresParentApproval: boolean;
  /** Prizes (learning-focused) */
  prizes: ChallengePrize[];
  moderationStatus: ModerationStatus;
}

export interface ChallengePrize {
  rank: number;
  title: string;
  description: string;
  /** Cosmetic or learning content */
  type: "badge" | "avatar-item" | "skill-unlock";
  itemId?: ID;
}

/* -------------------------------- Events ------------------------------- */

/**
 * Live or scheduled community events
 */
export interface CommunityEvent {
  id: ID;
  title: string;
  description: string;
  type: "workshop" | "showcase-day" | "challenge-kickoff" | "celebration";
  /** When */
  startsAt: ISODate;
  endsAt: ISODate;
  /** Who can attend */
  ageBands: AgeBand[];
  maxAttendees?: number;
  registeredCount: number;
  /** Host (adult) */
  hostId: ID;
  /** Requires parent approval */
  requiresParentApproval: boolean;
  /** Is this supervised */
  supervised: boolean;
  moderationStatus: ModerationStatus;
}

export interface EventRegistration {
  eventId: ID;
  userId: ID;
  registeredAt: ISODate;
  parentApproved: boolean;
  attended: boolean;
}

/* -------------------------------- Hackathons ------------------------------- */

/**
 * Multi-day collaborative building events
 * Heavily supervised
 */
export interface Hackathon {
  id: ID;
  title: string;
  description: string;
  theme: string;
  /** When */
  startsAt: ISODate;
  endsAt: ISODate;
  /** Team-based */
  minTeamSize: number;
  maxTeamSize: number;
  registeredTeams: number;
  maxTeams?: number;
  /** Age restrictions */
  ageBands: AgeBand[];
  /** Mentor assignments */
  mentorIds: ID[];
  /** Judging criteria */
  judgingCriteria: JudgingCriterion[];
  /** Prizes */
  prizes: ChallengePrize[];
  /** Requires parent approval */
  requiresParentApproval: boolean;
  moderationStatus: ModerationStatus;
}

export interface JudgingCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1
}

/* -------------------------------- Collaborative Projects ------------------------------- */

/**
 * Long-term projects worked on by multiple learners
 */
export interface CollaborativeProject {
  id: ID;
  title: string;
  description: string;
  goal: string;
  /** Collaborators */
  ownerId: ID;
  collaborators: Collaborator[];
  maxCollaborators: number;
  /** Project details */
  domainIds: ID[];
  skillIds: ID[];
  workspaceType: "code" | "design" | "writing" | "multimedia" | "mixed";
  /** Progress */
  progress: number;
  status: "planning" | "building" | "testing" | "completed";
  /** Mentor assigned */
  mentorId?: ID;
  /** Moderation */
  moderationStatus: ModerationStatus;
  /** Parent approval for each collaborator */
  requiresParentApproval: boolean;
  createdAt: ISODate;
  lastActivityAt: ISODate;
}

export interface Collaborator {
  userId: ID;
  role: "owner" | "contributor" | "viewer";
  joinedAt: ISODate;
  parentApproved: boolean;
  contributionCount: number;
}

/* -------------------------------- Peer Feedback ------------------------------- */

/**
 * Structured peer feedback on projects
 * HEAVILY moderated
 */
export interface PeerFeedback {
  id: ID;
  projectId: ID;
  fromUserId: ID;
  toUserId: ID;
  /** Structured feedback */
  type: "strengths" | "suggestions" | "questions";
  /** Templated content */
  templateId: string;
  content: string;
  /** Moderation state */
  moderationStatus: ModerationStatus;
  submittedAt: ISODate;
  deliveredAt: ISODate | null; // Only when approved
  /** Helpful votes (by recipient only) */
  markedHelpful: boolean;
}

export interface FeedbackTemplate {
  id: string;
  type: PeerFeedback["type"];
  prompt: string;
  maxLength: number;
  examples: string[];
  ageAppropriate: AgeBand[];
}

/* -------------------------------- Content Review Queue ------------------------------- */

/**
 * For moderation UI
 */
export interface ContentReviewItem {
  id: ID;
  contentType: "message" | "showcase" | "feedback" | "project-description" | "team-name";
  contentId: ID;
  creatorId: ID;
  creatorAge: number;
  content: string;
  context: string;
  submittedAt: ISODate;
  priority: "high" | "medium" | "low";
  autoModFlags: string[]; // Automated red flags
  moderationStatus: ModerationStatus;
}

/* -------------------------------- Safety Dashboard ------------------------------- */

/**
 * For parents and moderators
 */
export interface SafetyDashboard {
  userId: ID;
  /** Recent activity */
  recentActivity: {
    teamsJoined: number;
    messagesReceived: number;
    showcasesCreated: number;
    feedbackGiven: number;
    feedbackReceived: number;
  };
  /** Safety metrics */
  safetyMetrics: {
    reportsReceived: number;
    reportsSubmitted: number;
    blockedUsers: number;
    flaggedContent: number;
  };
  /** Parental controls */
  controls: ParentalCommunityControls;
  /** Pending approvals */
  pendingApprovals: {
    type: string;
    id: ID;
    description: string;
    submittedAt: ISODate;
  }[];
}

/* -------------------------------- Services ------------------------------- */

export interface CommunityService {
  /* Teams */
  listTeams(): Promise<Team[]>;
  getTeam(id: ID): Promise<Team>;
  joinTeam(teamId: ID): Promise<{ requiresApproval: boolean }>;
  leaveTeam(teamId: ID): Promise<void>;

  /* Guilds */
  listGuilds(): Promise<Guild[]>;
  getGuild(id: ID): Promise<Guild>;
  joinGuild(guildId: ID): Promise<{ requiresApproval: boolean }>;
  leaveGuild(guildId: ID): Promise<void>;

  /* Showcases */
  listShowcases(filters?: { category?: string; ageGroup?: AgeBand }): Promise<Showcase[]>;
  submitShowcase(projectId: ID, description: string): Promise<{ status: ModerationState }>;
  reactToShowcase(showcaseId: ID, reaction: ReactionType): Promise<void>;

  /* Challenges */
  listChallenges(): Promise<CommunityChallenge[]>;
  joinChallenge(challengeId: ID): Promise<{ requiresApproval: boolean }>;

  /* Events */
  listEvents(): Promise<CommunityEvent[]>;
  registerForEvent(eventId: ID): Promise<{ requiresApproval: boolean }>;

  /* Peer Feedback */
  submitFeedback(feedback: Omit<PeerFeedback, "id" | "moderationStatus">): Promise<{ status: ModerationState }>;
  listReceivedFeedback(): Promise<PeerFeedback[]>;

  /* Safety */
  reportContent(report: Omit<Report, "id" | "status">): Promise<Report>;
  blockUser(userId: ID, reason?: string): Promise<void>;
  unblockUser(userId: ID): Promise<void>;
  listBlockedUsers(): Promise<BlockedUser[]>;
}

/**
 * CRITICAL SAFETY PRINCIPLES
 *
 * 1. NO unrestricted messaging - all communication is structured and moderated
 * 2. Parent approval required for most community features
 * 3. Age-appropriate access rules enforced
 * 4. Every piece of content goes through moderation
 * 5. Easy and visible reporting and blocking
 * 6. Transparent safety features
 * 7. Parent visibility into all activity
 * 8. Adult supervision for younger ages
 * 9. Clear moderation states shown to users
 * 10. Educational focus maintained in all community features
 *
 * The frontend displays all these states and controls.
 * Backend will implement the actual moderation logic.
 */
