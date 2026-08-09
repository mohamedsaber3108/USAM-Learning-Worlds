/**
 * Research Skills Mock Data
 *
 * Mock data for research skills domain
 */

import type {
  ID,
  ResearchProject,
  ResearchActivity,
  SourceEvaluationActivity,
  CitationPractice,
  CredibilityScore,
} from "@/types";

/* -------------------------------- Research Projects -------------------------- */

export const RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: "res-proj-001",
    title: "My First Research Project",
    question: "How do plants grow?",
    topic: "Science",
    phase: "questioning",
    progress: 0.1,
    steps: [
      {
        id: "step-001",
        phase: "questioning",
        title: "Ask a research question",
        description: "Think of a question you want to answer",
        completed: true,
      },
      {
        id: "step-002",
        phase: "planning",
        title: "Make a research plan",
        description: "Decide what sources you'll use",
        completed: false,
      },
      {
        id: "step-003",
        phase: "gathering",
        title: "Find information",
        description: "Collect information from sources",
        completed: false,
      },
    ],
    sources: [],
    notes: [],
    outline: {
      id: "outline-001",
      sections: [],
    },
    ageBand: "8-9",
  },
];

export function createMockResearchProject(topic: string, question: string): ResearchProject {
  return {
    id: `res-proj-${Date.now()}`,
    title: `Research: ${topic}`,
    question,
    topic,
    phase: "questioning",
    progress: 0,
    steps: [
      {
        id: "step-001",
        phase: "questioning",
        title: "Ask a research question",
        description: "Think of a question you want to answer",
        completed: true,
      },
      {
        id: "step-002",
        phase: "planning",
        title: "Make a research plan",
        description: "Decide what sources you'll use",
        completed: false,
      },
    ],
    sources: [],
    notes: [],
    outline: { id: `outline-${Date.now()}`, sections: [] },
    ageBand: "10-11",
  };
}

/* -------------------------------- Research Activities ------------------------ */

export const RESEARCH_ACTIVITIES: ResearchActivity[] = [
  {
    id: "res-act-001",
    type: "question-formulation",
    title: "Ask Good Questions",
    skill: "questioning",
    scenario: "Learn how to turn curiosity into research questions",
    objectives: [
      "Start with what you wonder about",
      "Make questions specific",
      "Avoid yes/no questions",
      "Ask questions you can research",
    ],
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "res-act-002",
    type: "source-hunt",
    title: "Find Good Sources",
    skill: "information-seeking",
    scenario: "Practice finding reliable sources for your research",
    objectives: [
      "Know different source types",
      "Find books in library",
      "Search safe websites",
      "Ask experts",
    ],
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "res-act-003",
    type: "fact-check",
    title: "Check the Facts",
    skill: "source-evaluation",
    scenario: "Learn to tell if information is true and trustworthy",
    objectives: [
      "Check who wrote it",
      "Look for evidence",
      "Compare sources",
      "Spot bias",
    ],
    ageBands: ["10-11", "12-14"],
  },
  {
    id: "res-act-004",
    type: "note-practice",
    title: "Take Smart Notes",
    skill: "note-taking",
    scenario: "Practice taking notes that help you remember",
    objectives: [
      "Write key ideas",
      "Use your own words",
      "Note where you found it",
      "Organize notes by topic",
    ],
    ageBands: ["8-9", "10-11", "12-14"],
  },
  {
    id: "res-act-005",
    type: "citation-game",
    title: "Give Credit Game",
    skill: "citation",
    scenario: "Learn to give credit to your sources",
    objectives: [
      "Understand why citation matters",
      "Practice basic citations",
      "Avoid plagiarism",
      "Build a bibliography",
    ],
    ageBands: ["10-11", "12-14"],
  },
];

/* -------------------------------- Source Evaluation -------------------------- */

export const SOURCE_EVALUATION_ACTIVITIES: SourceEvaluationActivity[] = [
  {
    id: "eval-act-001",
    title: "Is This Source Reliable?",
    scenario: "You're researching climate change. Evaluate these sources.",
    sources: [
      {
        id: "eval-src-001",
        content:
          "Article: 'Climate Change Facts' by Dr. Sarah Johnson, NASA Scientist. Published 2023 on NASA.gov",
        metadata: {
          type: "article",
          author: "Dr. Sarah Johnson",
          date: "2023-01-15",
          publisher: "NASA",
        },
        credible: true,
      },
      {
        id: "eval-src-002",
        content:
          "Blog post: 'Why Climate Change is Fake' by Anonymous. No date. Found on random-blog.com",
        metadata: {
          type: "website",
          date: undefined,
        },
        credible: false,
        issues: ["Anonymous author", "No date", "Unreliable website", "Biased title"],
      },
    ],
    questions: [
      {
        id: "q-001",
        sourceId: "eval-src-001",
        question: "Is this source credible?",
        options: ["Yes, very credible", "Somewhat credible", "Not credible"],
        correctAnswer: 0,
        explanation:
          "This source is very credible because it's written by an expert (NASA scientist), published recently, and on an official website (NASA.gov).",
      },
      {
        id: "q-002",
        sourceId: "eval-src-002",
        question: "Is this source credible?",
        options: ["Yes, very credible", "Somewhat credible", "Not credible"],
        correctAnswer: 2,
        explanation:
          "This source is not credible because the author is anonymous, there's no date, the website is unknown, and the title shows strong bias.",
      },
    ],
  },
];

export function evaluateMockSource(sourceId: ID): CredibilityScore {
  return {
    overall: 0.8,
    factors: {
      authorExpertise: 0.9,
      sourceSafety: 1.0,
      accuracy: 0.8,
      bias: 0.7,
      currency: 0.9,
    },
    reasoning:
      "This source is from a reputable organization with expert authors. The information appears accurate and recent. Some mild bias detected in tone.",
  };
}

/* -------------------------------- Citation Practice -------------------------- */

export const CITATION_PRACTICES: CitationPractice[] = [
  {
    id: "cite-prac-001",
    title: "Simple Citations for Kids",
    style: "simple",
    sources: [
      {
        id: "src-001",
        type: "book",
        title: "All About Dinosaurs",
        author: "Dr. Jane Smith",
        date: "2022-01-01",
        credibility: {
          overall: 0.9,
          factors: {
            authorExpertise: 0.9,
            sourceSafety: 1.0,
            accuracy: 0.9,
            bias: 0.1,
            currency: 0.8,
          },
          reasoning: "Expert author, reliable publisher",
        },
        notes: "Information about T-Rex",
        citations: [],
        relevance: 0.9,
      },
    ],
    challenges: [
      {
        id: "chal-001",
        sourceId: "src-001",
        prompt: "Write a simple citation for this book",
        correctCitation: "Smith, Jane. All About Dinosaurs. 2022.",
        commonMistakes: [
          "Forgetting the author",
          "Forgetting the year",
          "Wrong punctuation",
        ],
      },
    ],
  },
  {
    id: "cite-prac-002",
    title: "Basic Citations",
    style: "basic",
    sources: [
      {
        id: "src-002",
        type: "website",
        title: "How Plants Grow",
        author: "National Geographic Kids",
        url: "https://kids.nationalgeographic.com/plants",
        date: "2023-05-10",
        credibility: {
          overall: 0.95,
          factors: {
            authorExpertise: 0.9,
            sourceSafety: 1.0,
            accuracy: 0.95,
            bias: 0.1,
            currency: 0.95,
          },
          reasoning: "Trusted educational site for kids",
        },
        notes: "Explains photosynthesis",
        citations: [],
        relevance: 1.0,
      },
    ],
    challenges: [
      {
        id: "chal-002",
        sourceId: "src-002",
        prompt: "Write a citation for this website",
        correctCitation:
          "National Geographic Kids. 'How Plants Grow.' 2023. https://kids.nationalgeographic.com/plants",
        commonMistakes: ["Forgetting the URL", "Wrong date format", "Missing quotes"],
      },
    ],
  },
];
