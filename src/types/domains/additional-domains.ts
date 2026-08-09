/**
 * Phase 20: Additional Domains
 *
 * Type definitions for remaining educational domains:
 * - Presentation Skills
 * - Digital Citizenship
 * - Robotics
 * - Career Exploration
 */

import type { ID, ISODate, AgeBand, MasteryState } from "@/types/domain";

/* ================================ PRESENTATION SKILLS ================================ */

export interface PresentationProject {
  id: ID;
  title: string;
  topic: string;
  audience: "peers" | "younger-kids" | "adults";
  format: "slides" | "video" | "demo" | "speech";
  slides: Slide[];
  script: PresentationScript;
  practice: PracticeSession[];
  feedback: PresentationFeedback[];
}

export interface Slide {
  id: ID;
  order: number;
  type: "title" | "content" | "image" | "video" | "demo";
  content: string;
  notes: string;
  media?: {
    type: "image" | "video";
    url: string;
  };
}

export interface PresentationScript {
  introduction: string;
  mainPoints: string[];
  conclusion: string;
  totalDuration: number; // estimated minutes
}

export interface PracticeSession {
  id: ID;
  date: ISODate;
  duration: number;
  feedback: {
    pace: "too-fast" | "good" | "too-slow";
    volume: "too-quiet" | "good" | "too-loud";
    clarity: number; // 0-1
    engagement: number; // 0-1
  };
  improvements: string[];
}

export interface PresentationFeedback {
  id: ID;
  from: "ai" | "peer" | "teacher";
  strengths: string[];
  suggestions: string[];
  rating: number; // 0-5
}

/* ================================ DIGITAL CITIZENSHIP ================================ */

export type DigitalCitizenshipTopic =
  | "online-safety"
  | "digital-footprint"
  | "cyberbullying"
  | "privacy"
  | "screen-time"
  | "misinformation"
  | "digital-etiquette"
  | "content-creation"
  | "digital-rights";

export interface DigitalCitizenshipLesson {
  id: ID;
  topic: DigitalCitizenshipTopic;
  title: string;
  scenario: string;
  objectives: string[];
  activities: DigitalCitizenshipActivity[];
  ageBands: AgeBand[];
}

export interface DigitalCitizenshipActivity {
  id: ID;
  type: "scenario-decision" | "quiz" | "discussion" | "reflection";
  title: string;
  content: string;
  choices?: {
    id: ID;
    option: string;
    safe: boolean;
    explanation: string;
  }[];
}

export interface DigitalFootprint {
  id: ID;
  learnerId: ID;
  publicPosts: number;
  privatePosts: number;
  interactions: number;
  reputation: "positive" | "neutral" | "needs-attention";
  tips: string[];
}

/* ================================ ROBOTICS ================================ */

export type RoboticsMode = "virtual" | "physical";

export interface RoboticsProject {
  id: ID;
  title: string;
  mode: RoboticsMode;
  robotType: "virtual-bot" | "physical-kit";
  objective: string;
  components: RobotComponent[];
  program: RobotProgram;
  tests: RobotTest[];
}

export interface RobotComponent {
  id: ID;
  type: "motor" | "sensor" | "controller" | "battery" | "wheel" | "arm";
  name: string;
  connected: boolean;
  configuration: Record<string, unknown>;
}

export interface RobotProgram {
  id: ID;
  language: "blocks" | "python" | "javascript";
  code: string;
  commands: RobotCommand[];
}

export interface RobotCommand {
  id: ID;
  type: "move" | "turn" | "sense" | "wait" | "repeat" | "if";
  parameters: Record<string, unknown>;
  order: number;
}

export interface RobotTest {
  id: ID;
  name: string;
  scenario: string;
  successCriteria: string[];
  result?: "pass" | "fail";
  attempts: number;
}

/* ================================ CAREER EXPLORATION ================================ */

export interface CareerProfile {
  id: ID;
  title: string;
  category: CareerCategory;
  description: string;
  skills: string[];
  education: string;
  workEnvironment: string;
  typicalDay: string;
  salary: SalaryRange;
  growth: "declining" | "stable" | "growing" | "high-demand";
  relatedCareers: ID[];
}

export type CareerCategory =
  | "technology"
  | "science"
  | "engineering"
  | "arts"
  | "business"
  | "education"
  | "healthcare"
  | "environment"
  | "media"
  | "social-services";

export interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
}

export interface CareerPathway {
  id: ID;
  career: ID;
  steps: CareerStep[];
  skills: string[];
  education: EducationPath[];
}

export interface CareerStep {
  id: ID;
  age: string; // "now", "high-school", "college", "early-career"
  title: string;
  actions: string[];
  skills: string[];
}

export interface EducationPath {
  level: "high-school" | "trade-school" | "college" | "graduate";
  required: boolean;
  subjects: string[];
  duration: string;
}

export interface CareerExploration {
  id: ID;
  learnerId: ID;
  interests: string[];
  strengths: string[];
  exploredCareers: ID[];
  savedCareers: ID[];
  activities: CareerActivity[];
}

export interface CareerActivity {
  id: ID;
  type: "job-shadow" | "interview" | "simulation" | "project";
  careerId: ID;
  title: string;
  completed: boolean;
  reflections?: string;
}

/* ================================ SERVICE INTERFACES ================================ */

export interface PresentationService {
  createPresentation(title: string, topic: string): Promise<PresentationProject>;
  getPresentation(id: ID): Promise<PresentationProject | null>;
  addSlide(presentationId: ID, slide: Omit<Slide, "id">): Promise<Slide>;
  practice(presentationId: ID): Promise<PracticeSession>;
  getFeedback(presentationId: ID): Promise<PresentationFeedback[]>;
}

export interface DigitalCitizenshipService {
  listLessons(topic?: DigitalCitizenshipTopic): Promise<DigitalCitizenshipLesson[]>;
  getLesson(id: ID): Promise<DigitalCitizenshipLesson | null>;
  completeActivity(lessonId: ID, activityId: ID, response: unknown): Promise<{
    correct: boolean;
    feedback: string;
  }>;
  getDigitalFootprint(learnerId: ID): Promise<DigitalFootprint>;
}

export interface RoboticsService {
  createProject(title: string, mode: RoboticsMode): Promise<RoboticsProject>;
  getProject(id: ID): Promise<RoboticsProject | null>;
  addComponent(projectId: ID, component: Omit<RobotComponent, "id">): Promise<void>;
  updateProgram(projectId: ID, program: RobotProgram): Promise<void>;
  runTest(projectId: ID, testId: ID): Promise<{
    result: "pass" | "fail";
    details: string;
  }>;
}

export interface CareerExplorationService {
  searchCareers(query: string, category?: CareerCategory): Promise<CareerProfile[]>;
  getCareer(id: ID): Promise<CareerProfile | null>;
  getCareerPathway(careerId: ID): Promise<CareerPathway>;
  getExploration(learnerId: ID): Promise<CareerExploration>;
  saveCareer(learnerId: ID, careerId: ID): Promise<void>;
  completeActivity(explorationId: ID, activity: Omit<CareerActivity, "id">): Promise<void>;
}

/**
 * CRITICAL: Domain Principles
 *
 * **Presentation Skills:**
 * ✅ Build confidence
 * ✅ Age-appropriate audience
 * ✅ Practice-focused
 * ✅ Constructive feedback
 *
 * **Digital Citizenship:**
 * ✅ Safety first
 * ✅ Responsible behavior
 * ✅ Critical thinking
 * ✅ Positive digital footprint
 *
 * **Robotics:**
 * ✅ Virtual option available
 * ✅ Physical kit support
 * ✅ Coding integration
 * ✅ Problem-solving focus
 *
 * **Career Exploration:**
 * ✅ Age-appropriate careers
 * ✅ Realistic expectations
 * ✅ Skills connection
 * ✅ Growth mindset
 */
