/**
 * Robotics Service Implementation
 *
 * Mock service for robotics education (virtual and physical)
 */

import type {
  ID,
  RoboticsProject,
  RobotComponent,
  RobotProgram,
  RoboticsMode,
  RoboticsService,
} from "@/types";

class RoboticsServiceImpl implements RoboticsService {
  async createProject(title: string, mode: RoboticsMode): Promise<RoboticsProject> {
    const { createMockRoboticsProject } = await import("@/data/robotics");
    return createMockRoboticsProject(title, mode);
  }

  async getProject(id: ID): Promise<RoboticsProject | null> {
    const { ROBOTICS_PROJECTS } = await import("@/data/robotics");
    return ROBOTICS_PROJECTS.find((p) => p.id === id) || null;
  }

  async addComponent(projectId: ID, component: Omit<RobotComponent, "id">): Promise<void> {
    console.log(`Add component to project ${projectId}:`, component);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async updateProgram(projectId: ID, program: RobotProgram): Promise<void> {
    console.log(`Update program for project ${projectId}:`, program);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async runTest(
    projectId: ID,
    testId: ID
  ): Promise<{ result: "pass" | "fail"; details: string }> {
    const project = await this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const test = project.tests.find((t) => t.id === testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    // Mock test result
    const result = Math.random() > 0.3 ? "pass" : "fail";
    const details =
      result === "pass"
        ? `All criteria met: ${test.successCriteria.join(", ")}`
        : `Some criteria not met. Try adjusting your program.`;

    return { result, details };
  }
}

export const roboticsService = new RoboticsServiceImpl();
