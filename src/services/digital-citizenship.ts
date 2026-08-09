/**
 * Digital Citizenship Service Implementation
 *
 * Mock service for teaching online safety and digital citizenship
 */

import type {
  ID,
  DigitalCitizenshipLesson,
  DigitalCitizenshipTopic,
  DigitalFootprint,
  DigitalCitizenshipService,
} from "@/types";

class DigitalCitizenshipServiceImpl implements DigitalCitizenshipService {
  async listLessons(topic?: DigitalCitizenshipTopic): Promise<DigitalCitizenshipLesson[]> {
    const { DIGITAL_CITIZENSHIP_LESSONS } = await import("@/data/digital-citizenship");
    if (!topic) return DIGITAL_CITIZENSHIP_LESSONS;
    return DIGITAL_CITIZENSHIP_LESSONS.filter((l) => l.topic === topic);
  }

  async getLesson(id: ID): Promise<DigitalCitizenshipLesson | null> {
    const lessons = await this.listLessons();
    return lessons.find((l) => l.id === id) || null;
  }

  async completeActivity(
    lessonId: ID,
    activityId: ID,
    response: unknown
  ): Promise<{ correct: boolean; feedback: string }> {
    const lesson = await this.getLesson(lessonId);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }

    const activity = lesson.activities.find((a) => a.id === activityId);
    if (!activity) {
      throw new Error(`Activity ${activityId} not found`);
    }

    if (activity.type === "scenario-decision" && activity.choices) {
      const choiceId = response as ID;
      const choice = activity.choices.find((c) => c.id === choiceId);
      if (choice) {
        return {
          correct: choice.safe,
          feedback: choice.explanation,
        };
      }
    }

    return {
      correct: true,
      feedback: "Good thinking!",
    };
  }

  async getDigitalFootprint(learnerId: ID): Promise<DigitalFootprint> {
    return {
      id: `footprint-${learnerId}`,
      learnerId,
      publicPosts: 12,
      privatePosts: 45,
      interactions: 234,
      reputation: "positive",
      tips: [
        "Great job keeping most posts private!",
        "You're being respectful in comments",
        "Remember to think before you post",
      ],
    };
  }
}

export const digitalCitizenshipService = new DigitalCitizenshipServiceImpl();
