/**
 * AI Literacy Domain — first production vertical slice (canonical spine).
 *
 * AI Literacy was a CATALOG ISLAND (flat AILiteracyConcept table, no
 * Domain/Skill/Competency/Objective/Mission/Activity chain, no learner loop).
 * This plugs it into the SAME shared spine English + Coding use — no
 * AI-literacy-specific engine:
 *
 *   Domain(AI Literacy) → Skill(Understanding AI) → Competency(What is AI?) →
 *   LearningObjective → Activities (SELECT + MATCH, with teaching context) →
 *   Mission(GUIDED) → MissionActivity.
 *
 * Doing the mission runs the existing engine unchanged:
 *   MissionRun → ActivityAttempt → Evidence(competencyId) → MasteryRecord →
 *   reviewDue → recommendation.
 *
 * Real, age-appropriate content (a child learns what AI is and isn't).
 * Idempotent via upsert with fixed ids.
 * Run: npm run seed:ai-literacy:vertical
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'ai-literacy';
const SKILL_SLUG = 'ai-understanding-ai';
const COMPETENCY_ID = 'ai-competency-what-is-ai';
const OBJECTIVE_ID = 'ai-objective-what-is-ai';
const MISSION_ID = 'ai-mission-meet-ai';

const ACTIVITIES = [
  {
    id: 'ai-act-what-is-ai',
    type: 'SELECT' as const,
    title: 'What is AI?',
    description: 'Choose the best description of artificial intelligence.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'What is artificial intelligence (AI)?',
      context:
        'AI is a computer program that can learn from examples and make guesses or decisions — like suggesting a video you might like. It is made by people and only knows what it has been shown.',
      keyPoints: ['AI learns from examples', 'AI is made by people', 'AI can be wrong'],
      options: [
        'A computer program that learns from examples to make guesses',
        'A living robot that thinks and feels like a person',
        'Magic inside the computer',
        'A kind of video game',
      ],
      correctAnswers: ['A computer program that learns from examples to make guesses'],
    },
  },
  {
    id: 'ai-act-ai-can-be-wrong',
    type: 'SELECT' as const,
    title: 'Can AI make mistakes?',
    description: 'Decide whether AI can be wrong.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'Can AI make mistakes?',
      context:
        'Yes! AI only knows what it was shown, so it can be wrong or unfair if its examples were wrong. That is why people should always check what AI says.',
      keyPoints: ['AI can be wrong', 'Always check AI answers'],
      options: [
        'Yes — AI can be wrong, so we should check its answers',
        'No — AI is always right',
        'Only on weekends',
        'AI never answers anything',
      ],
      correctAnswers: ['Yes — AI can be wrong, so we should check its answers'],
    },
  },
  {
    id: 'ai-act-match-ai-examples',
    type: 'MATCH' as const,
    title: 'Match AI to what it does',
    description: 'Match each everyday AI to what it helps with.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      question: 'Match each AI helper to what it does.',
      context: 'AI shows up in lots of everyday tools. Match each one to its job.',
      pairs: [
        { left: 'Video app suggestions', right: 'guesses videos you might like' },
        { left: 'Voice assistant', right: 'understands what you say out loud' },
        { left: 'Spam filter', right: 'sorts junk email away from real email' },
      ],
    },
  },
];

async function main() {
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: { name: 'AI Literacy' },
    create: {
      name: 'AI Literacy',
      slug: DOMAIN_SLUG,
      description: 'Understand what AI is, how it learns, and how to use it wisely.',
      icon: 'Bot',
      color: '#6366f1',
      order: 13,
    },
  });

  const skill = await prisma.skill.upsert({
    where: { slug: SKILL_SLUG },
    update: {},
    create: {
      domainId: domain.id,
      name: 'Understanding AI',
      slug: SKILL_SLUG,
      description: 'The big ideas behind artificial intelligence.',
      order: 1,
    },
  });

  const competency = await prisma.competency.upsert({
    where: { id: COMPETENCY_ID },
    update: {},
    create: {
      id: COMPETENCY_ID,
      skillId: skill.id,
      name: 'What is AI?',
      description: 'Explain what AI is, that people make it, and that it can be wrong.',
      order: 1,
    },
  });

  const objective = await prisma.learningObjective.upsert({
    where: { id: OBJECTIVE_ID },
    update: {},
    create: {
      id: OBJECTIVE_ID,
      competencyId: competency.id,
      name: 'Describe what AI is and its limits',
      description: 'Recognise AI, know people build it, and know it can make mistakes.',
      order: 1,
    },
  });

  const world = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  const mission = await prisma.mission.upsert({
    where: { id: MISSION_ID },
    update: { worldId: world?.id ?? null },
    create: {
      id: MISSION_ID,
      worldId: world?.id ?? null,
      title: 'Meet AI',
      description: 'Find out what AI really is, and learn to think for yourself about it.',
      type: 'GUIDED',
      estimatedMinutes: 10,
      order: 1,
    },
  });

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
    `AI Literacy vertical slice seeded: domain=${domain.slug} skill=${skill.slug} ` +
      `competency=${competency.id} mission=${mission.id} activities=${n}/${ACTIVITIES.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
