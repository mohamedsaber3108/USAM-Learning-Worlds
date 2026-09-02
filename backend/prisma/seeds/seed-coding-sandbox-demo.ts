/**
 * Coding Sandbox v1 demo seed.
 *
 * Creates one real CODE-type Activity (with the coding-sandbox mission
 * spec in its `content` JSON: starterCode + assertions), wrapped in a
 * Mission so the existing /missions/:id/start + ActivityAttempt flow
 * gives the new coding-sandbox module something real to grade against.
 *
 * Reuses existing models (Domain, Skill, Competency, LearningObjective,
 * Activity, Mission, MissionActivity) — no schema changes, no new
 * migration. Idempotent: safe to re-run.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domain = await prisma.domain.upsert({
    where: { slug: 'coding-sandbox-demo' },
    update: {},
    create: {
      name: 'Coding Sandbox Demo',
      slug: 'coding-sandbox-demo',
      description: 'Demo domain for Coding Sandbox v1 (Pyodide/Sandpack).',
      order: 999,
    },
  });

  const skill = await prisma.skill.upsert({
    where: { slug: 'coding-sandbox-demo-skill' },
    update: {},
    create: {
      domainId: domain.id,
      name: 'Coding Sandbox Demo Skill',
      slug: 'coding-sandbox-demo-skill',
      order: 0,
    },
  });

  const competency = await prisma.competency.upsert({
    where: { id: 'coding-sandbox-demo-competency' },
    update: {},
    create: {
      id: 'coding-sandbox-demo-competency',
      skillId: skill.id,
      name: 'Coding Sandbox Demo Competency',
      order: 0,
    },
  });

  const objective = await prisma.learningObjective.upsert({
    where: { id: 'coding-sandbox-demo-objective' },
    update: {},
    create: {
      id: 'coding-sandbox-demo-objective',
      competencyId: competency.id,
      name: 'Print doubled value',
      order: 0,
    },
  });

  const activity = await prisma.activity.upsert({
    where: { id: 'coding-sandbox-demo-activity' },
    update: {
      content: {
        language: 'python',
        prompt: 'Write Python that prints the double of 21 (i.e. print(42)).',
        starterCode: 'x = 21\nprint(x)\n',
        assertions: [
          {
            id: 'prints-42',
            description: 'Program prints 42',
            type: 'stdout-contains',
            expected: '42',
          },
        ],
      },
    },
    create: {
      id: 'coding-sandbox-demo-activity',
      objectiveId: objective.id,
      type: 'CODE',
      title: 'Double it',
      description: 'Write Python that prints the double of 21.',
      difficulty: 'EASY',
      order: 0,
      content: {
        language: 'python',
        prompt: 'Write Python that prints the double of 21 (i.e. print(42)).',
        starterCode: 'x = 21\nprint(x)\n',
        assertions: [
          {
            id: 'prints-42',
            description: 'Program prints 42',
            type: 'stdout-contains',
            expected: '42',
          },
        ],
      },
    },
  });

  const mission = await prisma.mission.upsert({
    where: { id: 'coding-sandbox-demo-mission' },
    update: {},
    create: {
      id: 'coding-sandbox-demo-mission',
      title: 'Coding Sandbox Demo',
      description: 'Demo mission wrapping the Coding Sandbox v1 CODE activity.',
      type: 'GUIDED',
      order: 999,
    },
  });

  await prisma.missionActivity.upsert({
    where: {
      missionId_activityId: { missionId: mission.id, activityId: activity.id },
    },
    update: {},
    create: {
      missionId: mission.id,
      activityId: activity.id,
      order: 0,
      isRequired: true,
    },
  });

  console.log('Coding Sandbox v1 demo mission seeded:', mission.id, activity.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
