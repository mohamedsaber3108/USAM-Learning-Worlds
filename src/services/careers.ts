/**
 * Career Exploration Service Implementation
 *
 * Mock service for career exploration and planning
 */

import type {
  ID,
  CareerProfile,
  CareerCategory,
  CareerPathway,
  CareerExploration,
  CareerActivity,
  CareerExplorationService,
} from "@/types";

class CareerExplorationServiceImpl implements CareerExplorationService {
  async searchCareers(query: string, category?: CareerCategory): Promise<CareerProfile[]> {
    const { CAREER_PROFILES } = await import("@/data/careers");
    let results = CAREER_PROFILES;

    if (category) {
      results = results.filter((c) => c.category === category);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.title.toLowerCase().includes(lowerQuery) ||
          c.description.toLowerCase().includes(lowerQuery) ||
          c.skills.some((s) => s.toLowerCase().includes(lowerQuery))
      );
    }

    return results;
  }

  async getCareer(id: ID): Promise<CareerProfile | null> {
    const careers = await this.searchCareers("");
    return careers.find((c) => c.id === id) || null;
  }

  async getCareerPathway(careerId: ID): Promise<CareerPathway> {
    const { CAREER_PATHWAYS } = await import("@/data/careers");
    const pathway = CAREER_PATHWAYS.find((p) => p.career === careerId);
    if (!pathway) {
      throw new Error(`Career pathway for ${careerId} not found`);
    }
    return pathway;
  }

  async getExploration(learnerId: ID): Promise<CareerExploration> {
    const { createMockExploration } = await import("@/data/careers");
    return createMockExploration(learnerId);
  }

  async saveCareer(learnerId: ID, careerId: ID): Promise<void> {
    console.log(`Save career ${careerId} for learner ${learnerId}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async completeActivity(
    explorationId: ID,
    activity: Omit<CareerActivity, "id">
  ): Promise<void> {
    console.log(`Complete activity for exploration ${explorationId}:`, activity);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export const careerExplorationService = new CareerExplorationServiceImpl();
