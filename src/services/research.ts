/**
 * Research Skills Service Implementation
 *
 * Mock service for teaching information literacy, research methods, source evaluation
 */

import type {
  ID,
  ResearchProject,
  ResearchSkill,
  ResearchActivity,
  Source,
  CredibilityScore,
  Note,
  Outline,
  SourceEvaluationActivity,
  CitationPractice,
  CitationStyle,
  ResearchService,
} from "@/types";

class ResearchServiceImpl implements ResearchService {
  // Projects
  async createProject(topic: string, question: string): Promise<ResearchProject> {
    const { createMockResearchProject } = await import("@/data/research");
    return createMockResearchProject(topic, question);
  }

  async getProject(id: ID): Promise<ResearchProject | null> {
    const { RESEARCH_PROJECTS } = await import("@/data/research");
    return RESEARCH_PROJECTS.find((p) => p.id === id) || null;
  }

  async updateProject(id: ID, updates: Partial<ResearchProject>): Promise<void> {
    console.log(`Update research project: ${id}`, updates);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async completeStep(projectId: ID, stepId: ID): Promise<void> {
    console.log(`Complete step: ${projectId}, ${stepId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Sources
  async addSource(projectId: ID, source: Omit<Source, "id">): Promise<Source> {
    const newSource: Source = {
      ...source,
      id: `src-${Date.now()}`,
    };
    console.log(`Add source to project ${projectId}:`, newSource);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return newSource;
  }

  async evaluateSource(sourceId: ID): Promise<CredibilityScore> {
    const { evaluateMockSource } = await import("@/data/research");
    return evaluateMockSource(sourceId);
  }

  async removeSource(projectId: ID, sourceId: ID): Promise<void> {
    console.log(`Remove source ${sourceId} from project ${projectId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Notes
  async addNote(projectId: ID, note: Omit<Note, "id">): Promise<Note> {
    const newNote: Note = {
      ...note,
      id: `note-${Date.now()}`,
    };
    console.log(`Add note to project ${projectId}:`, newNote);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return newNote;
  }

  async organizeNotes(projectId: ID, outline: Outline): Promise<void> {
    console.log(`Organize notes for project ${projectId}:`, outline);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Activities
  async listActivities(skill?: ResearchSkill): Promise<ResearchActivity[]> {
    const { RESEARCH_ACTIVITIES } = await import("@/data/research");
    if (!skill) return RESEARCH_ACTIVITIES;
    return RESEARCH_ACTIVITIES.filter((a) => a.skill === skill);
  }

  async getActivity(id: ID): Promise<ResearchActivity | null> {
    const activities = await this.listActivities();
    return activities.find((a) => a.id === id) || null;
  }

  // Source evaluation practice
  async startEvaluation(activityId: ID): Promise<SourceEvaluationActivity> {
    const { SOURCE_EVALUATION_ACTIVITIES } = await import("@/data/research");
    const activity = SOURCE_EVALUATION_ACTIVITIES.find((a) => a.id === activityId);
    if (!activity) {
      throw new Error(`Source evaluation activity ${activityId} not found`);
    }
    return activity;
  }

  async submitEvaluation(
    activityId: ID,
    answers: Record<ID, number>
  ): Promise<{ correct: number; total: number; feedback: string[] }> {
    const activity = await this.startEvaluation(activityId);
    let correct = 0;
    const feedback: string[] = [];

    activity.questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer === q.correctAnswer) {
        correct++;
        feedback.push(`✅ ${q.question}: Correct!`);
      } else {
        feedback.push(`❌ ${q.question}: ${q.explanation}`);
      }
    });

    return {
      correct,
      total: activity.questions.length,
      feedback,
    };
  }

  // Citation practice
  async startCitationPractice(style: CitationStyle): Promise<CitationPractice> {
    const { CITATION_PRACTICES } = await import("@/data/research");
    const practice = CITATION_PRACTICES.find((p) => p.style === style);
    if (!practice) {
      throw new Error(`Citation practice for style ${style} not found`);
    }
    return practice;
  }

  async checkCitation(
    practiceId: ID,
    challengeId: ID,
    citation: string
  ): Promise<{ correct: boolean; feedback: string }> {
    const { CITATION_PRACTICES } = await import("@/data/research");
    const practice = CITATION_PRACTICES.find((p) => p.id === practiceId);
    if (!practice) {
      throw new Error(`Citation practice ${practiceId} not found`);
    }

    const challenge = practice.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      throw new Error(`Challenge ${challengeId} not found`);
    }

    const correct = citation.trim() === challenge.correctCitation.trim();
    const feedback = correct
      ? "Perfect! Your citation is correct."
      : `Not quite. The correct citation is: ${challenge.correctCitation}`;

    return { correct, feedback };
  }
}

export const researchService = new ResearchServiceImpl();
