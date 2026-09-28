/**
 * Coding Domain — first production vertical slice (canonical spine, Option A).
 *
 * Coding was a CATALOG ISLAND: a flat `CodingConcept` table + AI-coach endpoints
 * that never created an ActivityAttempt or recorded Evidence. The 18 concepts
 * had no Domain/Skill/Competency/Objective/Mission/Activity chain, so no learner
 * loop existed (the frontend literally said "coming soon"). This seed plugs
 * Coding into the SAME shared spine English uses — no coding-specific engine:
 *
 *   Domain(Coding) → Skill(Programming Fundamentals) → Competency(Loops) →
 *   LearningObjective → CODE Activities (with teaching context + requiredKeywords)
 *   → Mission(GUIDED) → MissionActivity.
 *
 * Doing the mission runs through the existing engine unchanged:
 *   MissionRun → ActivityAttempt → Evidence(competencyId) → MasteryRecord →
 *   reviewDue → recommendation.
 *
 * CODE activities are graded by the shared ActivityEvaluator.evaluateCode
 * (server-side keyword check on content.requiredKeywords vs response.code →
 * CREATION evidence). Real in-sandbox execution (Pyodide/tests) is a documented
 * later upgrade; this slice proves the loop with the engine that exists today.
 *
 * IMPORTANT: the Domain NAME must be exactly "Coding" — GET /coding/learner/progress
 * filters masteryRecords by skill.domain.name === 'Coding'.
 *
 * Idempotent via upsert with fixed ids.
 * Run: npm run seed:coding:vertical  (ts-node prisma/seeds/seed-coding-vertical-slice.ts)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'coding';
const SKILL_SLUG = 'coding-programming-fundamentals';
const COMPETENCY_ID = 'coding-competency-loops-intro';
const OBJECTIVE_ID = 'coding-objective-loops-intro';
const MISSION_ID = 'coding-mission-first-loops';

// Real intro-to-loops activities. Each carries teaching context (the Learn
// step) so the child is taught before being checked. CODE activities are graded
// on required keywords by the shared evaluator.
const ACTIVITIES = [
  {
    id: 'coding-act-loops-which-keyword',
    type: 'SELECT' as const,
    title: 'Which keyword repeats an action?',
    description: 'Pick the keyword used to repeat something many times.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'Which keyword do we use to repeat an action several times?',
      context:
        'A loop repeats code so you do not have to write it again and again. In many languages we use the word "for" to loop a set number of times.',
      keyPoints: ['for = repeat a set number of times', 'while = repeat while something is true'],
      options: ['for', 'color', 'print', 'banana'],
      correctAnswers: ['for'],
    },
  },
  {
    id: 'coding-act-loops-print-1-to-3',
    type: 'CODE' as const,
    title: 'Print the numbers 1 to 3 with a loop',
    description: 'Write a small loop that prints 1, 2, 3.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      prompt: 'Use a for loop to print the numbers 1, 2 and 3, each on its own line.',
      context:
        'A "for" loop repeats code. `for i in range(1, 4):` counts i = 1, 2, 3. Inside the loop, `print(i)` shows each number. The two lines together print 1, 2, 3.',
      // Shared ActivityEvaluator.evaluateCode: correct when ALL of these appear
      // in the submitted code (case-sensitive substring). Kept minimal + robust
      // so a genuinely-correct loop passes without real execution.
      requiredKeywords: ['for', 'print'],
      language: 'python',
      starterCode: '# write a loop that prints 1, 2, 3\n',
      sampleSolution: 'for i in range(1, 4):\n    print(i)',
    },
  },
  {
    id: 'coding-act-loops-sum-with-loop',
    type: 'CODE' as const,
    title: 'Add up numbers with a loop',
    description: 'Use a loop to add the numbers 1 to 5.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      prompt: 'Use a for loop to add the numbers 1 to 5 into a total, then print the total.',
      context:
        'Start a total at 0, loop over the numbers with `for`, add each to the total, then `print` the total. This shows a loop that builds up a result.',
      requiredKeywords: ['for', 'print'],
      language: 'python',
      starterCode: 'total = 0\n# loop and add, then print total\n',
      sampleSolution: 'total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)',
    },
  },
];

async function main() {
  // Domain: Coding. NAME must be exactly "Coding" (progress endpoint depends on it).
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: { name: 'Coding' },
    create: {
      name: 'Coding',
      slug: DOMAIN_SLUG,
      description: 'Learn to code — variables, logic, loops, data, and more.',
      icon: 'Code',
      color: '#0ea5e9',
      order: 2,
    },
  });

  // Skill: Programming Fundamentals.
  const skill = await prisma.skill.upsert({
    where: { slug: SKILL_SLUG },
    update: {},
    create: {
      domainId: domain.id,
      name: 'Programming Fundamentals',
      slug: SKILL_SLUG,
      description: 'Core building blocks of programming.',
      order: 1,
    },
  });

  // Competency: Loops (intro). Mirrors the "Loops" CodingConcept catalog entry
  // (slug 'loops') but lives in the canonical mastery graph.
  const competency = await prisma.competency.upsert({
    where: { id: COMPETENCY_ID },
    update: {},
    create: {
      id: COMPETENCY_ID,
      skillId: skill.id,
      name: 'Loops (intro)',
      description: 'Use a simple loop to repeat an action and build a result.',
      order: 1,
    },
  });

  // Learning Objective.
  const objective = await prisma.learningObjective.upsert({
    where: { id: OBJECTIVE_ID },
    update: {},
    create: {
      id: OBJECTIVE_ID,
      competencyId: competency.id,
      name: 'Repeat actions with a for loop',
      description: 'Write a basic for loop to repeat work and accumulate a result.',
      order: 1,
    },
  });

  // Attach to the Coding world if one exists (nullable — mission works either way).
  const codingWorld = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  // Mission (guided) — the child's entry into the coding learning loop.
  const mission = await prisma.mission.upsert({
    where: { id: MISSION_ID },
    update: { worldId: codingWorld?.id ?? null },
    create: {
      id: MISSION_ID,
      worldId: codingWorld?.id ?? null,
      title: 'First Loops',
      description: 'Learn how loops repeat actions, then write your first loops with Codey.',
      type: 'GUIDED',
      estimatedMinutes: 12,
      order: 1,
    },
  });

  // Activities + mission join (shared Activity shell + evaluator).
  let n = 0;
  for (const [index, a] of ACTIVITIES.entries()) {
    const activity = await prisma.activity.upsert({
      where: { id: a.id },
      update: { content: a.content, title: a.title, description: a.description },
      create: {
        id: a.id,
        objectiveId: objective.id,
        type: a.type,
        title: a.title,
        description: a.description,
        difficulty: a.difficulty,
        assessmentPurpose: a.assessmentPurpose,
        order: index,
        content: a.content,
      },
    });
    await prisma.missionActivity.upsert({
      where: { missionId_activityId: { missionId: mission.id, activityId: activity.id } },
      update: {},
      create: { missionId: mission.id, activityId: activity.id, order: index, isRequired: true },
    });
    n += 1;
  }

  console.log(
    `Coding vertical slice seeded: domain=${domain.slug} skill=${skill.slug} ` +
      `competency=${competency.id} mission=${mission.id} activities=${n}/${ACTIVITIES.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
