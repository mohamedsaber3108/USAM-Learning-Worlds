/**
 * Career Exploration Mock Data
 *
 * Mock data for career exploration and planning
 */

import type {
  ID,
  CareerProfile,
  CareerPathway,
  CareerExploration,
} from "@/types";

export const CAREER_PROFILES: CareerProfile[] = [
  {
    id: "career-001",
    title: "Software Developer",
    category: "technology",
    description:
      "Create apps, websites, and software that people use every day. Solve problems with code.",
    skills: ["Coding", "Problem solving", "Creativity", "Teamwork"],
    education: "College degree in Computer Science (usually 4 years)",
    workEnvironment: "Office or remote. Work with a team. Use computers all day.",
    typicalDay:
      "Write code, fix bugs, meet with team, design new features, test software",
    salary: { min: 60000, max: 150000, median: 90000, currency: "USD" },
    growth: "high-demand",
    relatedCareers: ["career-002", "career-003"],
  },
  {
    id: "career-002",
    title: "Game Developer",
    category: "technology",
    description:
      "Design and build video games. Combine art, storytelling, and programming.",
    skills: ["Coding", "3D design", "Creativity", "Storytelling"],
    education: "College degree in Game Design or Computer Science",
    workEnvironment: "Studio with a creative team. Use powerful computers.",
    typicalDay:
      "Program game mechanics, create characters, test gameplay, fix bugs, collaborate with artists",
    salary: { min: 50000, max: 130000, median: 75000, currency: "USD" },
    growth: "growing",
    relatedCareers: ["career-001", "career-004"],
  },
  {
    id: "career-003",
    title: "Data Scientist",
    category: "technology",
    description:
      "Use math and coding to find patterns in data. Help companies make smart decisions.",
    skills: ["Math", "Coding", "Analysis", "Communication"],
    education: "College degree in Math, Statistics, or Computer Science",
    workEnvironment: "Office or remote. Work with business teams.",
    typicalDay:
      "Analyze data, create charts, build models, present findings, solve business problems",
    salary: { min: 70000, max: 160000, median: 100000, currency: "USD" },
    growth: "high-demand",
    relatedCareers: ["career-001"],
  },
  {
    id: "career-004",
    title: "Graphic Designer",
    category: "arts",
    description:
      "Create visual designs for websites, apps, posters, and brands. Make things look amazing.",
    skills: ["Art", "Creativity", "Design software", "Communication"],
    education: "College degree in Graphic Design or Art (2-4 years)",
    workEnvironment: "Studio or remote. Work alone or with creative teams.",
    typicalDay:
      "Design logos, create layouts, choose colors, meet clients, refine designs",
    salary: { min: 40000, max: 90000, median: 55000, currency: "USD" },
    growth: "stable",
    relatedCareers: ["career-002", "career-005"],
  },
  {
    id: "career-005",
    title: "Teacher",
    category: "education",
    description:
      "Help students learn and grow. Share your knowledge and inspire young minds.",
    skills: ["Communication", "Patience", "Organization", "Subject knowledge"],
    education: "College degree in Education (4 years) + Teaching certificate",
    workEnvironment: "School classroom. Work with students, parents, and other teachers.",
    typicalDay:
      "Teach lessons, grade work, help struggling students, plan activities, communicate with parents",
    salary: { min: 40000, max: 80000, median: 55000, currency: "USD" },
    growth: "stable",
    relatedCareers: [],
  },
  {
    id: "career-006",
    title: "Environmental Scientist",
    category: "environment",
    description:
      "Study nature and find ways to protect our planet. Work on climate, pollution, and conservation.",
    skills: ["Science", "Research", "Problem solving", "Fieldwork"],
    education: "College degree in Environmental Science (4 years)",
    workEnvironment: "Mix of office and outdoor fieldwork. Work with teams.",
    typicalDay:
      "Collect samples, analyze data, write reports, conduct field research, present findings",
    salary: { min: 45000, max: 100000, median: 65000, currency: "USD" },
    growth: "growing",
    relatedCareers: [],
  },
];

export const CAREER_PATHWAYS: CareerPathway[] = [
  {
    id: "pathway-001",
    career: "career-001",
    steps: [
      {
        id: "step-001",
        age: "now",
        title: "Start Learning",
        actions: [
          "Learn coding basics (Scratch, Python)",
          "Build simple projects",
          "Join coding club",
        ],
        skills: ["Basic coding", "Problem solving"],
      },
      {
        id: "step-002",
        age: "high-school",
        title: "High School",
        actions: [
          "Take computer science classes",
          "Join robotics team",
          "Build portfolio projects",
          "Attend coding camps",
        ],
        skills: ["Advanced coding", "Team collaboration", "Project management"],
      },
      {
        id: "step-003",
        age: "college",
        title: "College",
        actions: [
          "Major in Computer Science",
          "Do internships",
          "Contribute to open source",
          "Build real-world projects",
        ],
        skills: ["Professional coding", "Software design", "Teamwork"],
      },
      {
        id: "step-004",
        age: "early-career",
        title: "First Job",
        actions: [
          "Apply for junior developer roles",
          "Keep learning new technologies",
          "Build professional network",
        ],
        skills: ["Professional experience", "Industry tools", "Collaboration"],
      },
    ],
    skills: [
      "Coding",
      "Problem solving",
      "Algorithms",
      "Data structures",
      "Teamwork",
      "Communication",
    ],
    education: [
      {
        level: "high-school",
        required: true,
        subjects: ["Computer Science", "Math"],
        duration: "4 years",
      },
      {
        level: "college",
        required: true,
        subjects: ["Computer Science", "Software Engineering"],
        duration: "4 years",
      },
    ],
  },
];

export function createMockExploration(learnerId: ID): CareerExploration {
  return {
    id: `explore-${learnerId}`,
    learnerId,
    interests: ["Technology", "Coding", "Games"],
    strengths: ["Problem solving", "Creativity", "Math"],
    exploredCareers: ["career-001", "career-002"],
    savedCareers: ["career-001"],
    activities: [],
  };
}
