/**
 * Robotics Mock Data
 *
 * Mock data for robotics projects (virtual and physical)
 */

import type { RoboticsProject, RoboticsMode } from "@/types";

export const ROBOTICS_PROJECTS: RoboticsProject[] = [
  {
    id: "robot-001",
    title: "My First Robot",
    mode: "virtual",
    robotType: "virtual-bot",
    objective: "Make the robot move forward and turn",
    components: [
      {
        id: "comp-001",
        type: "motor",
        name: "Left Motor",
        connected: true,
        configuration: { speed: 100 },
      },
      {
        id: "comp-002",
        type: "motor",
        name: "Right Motor",
        connected: true,
        configuration: { speed: 100 },
      },
      {
        id: "comp-003",
        type: "sensor",
        name: "Distance Sensor",
        connected: true,
        configuration: { range: 50 },
      },
    ],
    program: {
      id: "prog-001",
      language: "blocks",
      code: "move_forward(10); turn_right(90);",
      commands: [
        {
          id: "cmd-001",
          type: "move",
          parameters: { direction: "forward", distance: 10 },
          order: 1,
        },
        {
          id: "cmd-002",
          type: "turn",
          parameters: { direction: "right", degrees: 90 },
          order: 2,
        },
      ],
    },
    tests: [
      {
        id: "test-001",
        name: "Move Forward Test",
        scenario: "Robot should move forward 10 units",
        successCriteria: [
          "Moves in straight line",
          "Travels 10 units",
          "Stops at end",
        ],
        attempts: 0,
      },
    ],
  },
];

export function createMockRoboticsProject(
  title: string,
  mode: RoboticsMode
): RoboticsProject {
  return {
    id: `robot-${Date.now()}`,
    title,
    mode,
    robotType: mode === "virtual" ? "virtual-bot" : "physical-kit",
    objective: "Complete the robot challenge",
    components: [
      {
        id: `comp-${Date.now()}-1`,
        type: "motor",
        name: "Motor 1",
        connected: true,
        configuration: {},
      },
    ],
    program: {
      id: `prog-${Date.now()}`,
      language: "blocks",
      code: "",
      commands: [],
    },
    tests: [],
  };
}
