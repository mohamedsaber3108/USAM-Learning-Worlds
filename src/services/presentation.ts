/**
 * Presentation Skills Service Implementation
 *
 * Mock service for teaching presentation and public speaking
 */

import type {
  ID,
  PresentationProject,
  Slide,
  PracticeSession,
  PresentationFeedback,
  PresentationService,
} from "@/types";

class PresentationServiceImpl implements PresentationService {
  async createPresentation(title: string, topic: string): Promise<PresentationProject> {
    const { createMockPresentation } = await import("@/data/presentation");
    return createMockPresentation(title, topic);
  }

  async getPresentation(id: ID): Promise<PresentationProject | null> {
    const { PRESENTATION_PROJECTS } = await import("@/data/presentation");
    return PRESENTATION_PROJECTS.find((p) => p.id === id) || null;
  }

  async addSlide(presentationId: ID, slide: Omit<Slide, "id">): Promise<Slide> {
    const newSlide: Slide = {
      ...slide,
      id: `slide-${Date.now()}`,
    };
    console.log(`Add slide to presentation ${presentationId}:`, newSlide);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return newSlide;
  }

  async practice(presentationId: ID): Promise<PracticeSession> {
    const session: PracticeSession = {
      id: `practice-${Date.now()}`,
      date: new Date().toISOString(),
      duration: Math.floor(Math.random() * 10) + 5, // 5-15 minutes
      feedback: {
        pace: Math.random() > 0.5 ? "good" : Math.random() > 0.5 ? "too-fast" : "too-slow",
        volume: Math.random() > 0.7 ? "good" : Math.random() > 0.5 ? "too-quiet" : "too-loud",
        clarity: Math.random() * 0.4 + 0.6, // 0.6-1.0
        engagement: Math.random() * 0.4 + 0.6, // 0.6-1.0
      },
      improvements: [
        "Try slowing down on slide 3",
        "Make eye contact more often",
        "Use hand gestures to emphasize points",
      ],
    };
    await new Promise((resolve) => setTimeout(resolve, 500));
    return session;
  }

  async getFeedback(presentationId: ID): Promise<PresentationFeedback[]> {
    const { MOCK_FEEDBACK } = await import("@/data/presentation");
    return MOCK_FEEDBACK;
  }
}

export const presentationService = new PresentationServiceImpl();
