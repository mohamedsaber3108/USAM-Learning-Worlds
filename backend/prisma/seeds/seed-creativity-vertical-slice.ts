/**
 * Creativity Domain — first production vertical slice (canonical spine).
 *
 * Creativity had a flat CreativityPrompt catalog + CreativitySubmission, but no
 * Domain→Skill→Competency→Objective→Mission→Activity learner loop feeding the
 * shared Evidence/Mastery spine. This plugs it in — no creativity-specific
 * engine:
 *
 *   Domain(Creativity) → Skill(Idea Generation) → Competency(Brainstorming) →
 *   Objective → Activities (SELECT + CREATE) → Mission(GUIDED) → MissionActivity.
 *
 * The CREATE activity is graded by the shared ActivityEvaluator (completion +
 * substance) → CREATION evidence, same as any other domain. Idempotent.
 * Run: npm run seed:creativity:vertical
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'creativity';
const SKILL_SLUG = 'creativity-idea-generation';
const COMPETENCY_ID = 'creativity-competency-brainstorming';
const OBJECTIVE_ID = 'creativity-objective-brainstorming';
const MISSION_ID = 'creativity-mission-idea-spark';

const ACTIVITIES = [
  {
    id: 'creativity-act-what-is-brainstorm',
    type: 'SELECT' as const,
    title: 'What makes a good brainstorm?',
    description: 'Choose the best idea about brainstorming.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'What is the MOST important rule when you brainstorm ideas?',
      context:
        'Brainstorming means getting LOTS of ideas out without judging them yet. Wild ideas are welcome — you pick the best ones later. Quantity first, then quality.',
      keyPoints: ['Get many ideas', 'Don\'t judge yet', 'Wild ideas welcome'],
      options: [
        'Write down as many ideas as you can, even silly ones',
        'Only write the one perfect idea',
        'Stop after your first idea',
        'Copy someone else\'s idea',
      ],
      correctAnswers: ['Write down as many ideas as you can, even silly ones'],
    },
  },
  {
    id: 'creativity-act-brainstorm-uses',
    type: 'CREATE' as const,
    title: 'Brainstorm: new uses for a paperclip',
    description: 'List as many creative uses for a paperclip as you can.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      prompt: 'Think of at least 3 different, creative uses for a paperclip. Write them in a list.',
      context:
        'There are no wrong answers in a brainstorm — stretch your imagination. A paperclip could be a tiny hook, a bookmark, a zipper pull… what else?',
      rubric: ['At least 3 ideas', 'Ideas are different from each other', 'At least one unusual idea'],
    },
  },
];

async function main() {
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: { name: 'Creativity' },
    create: {
      name: 'Creativity',
      slug: DOMAIN_SLUG,
      description: 'Generate ideas, imagine, and create.',
      icon: 'Sparkles',
      color: '#f472b6',
      order: 12,
    },
  });

  const skill = await prisma.skill.upsert({
    where: { slug: SKILL_SLUG },
    update: {},
    create: {
      domainId: domain.id,
      name: 'Idea Generation',
      slug: SKILL_SLUG,
      description: 'Coming up with lots of ideas.',
      order: 1,
    },
  });

  const competency = await prisma.competency.upsert({
    where: { id: COMPETENCY_ID },
    update: {},
    create: {
      id: COMPETENCY_ID,
      skillId: skill.id,
      name: 'Brainstorming',
      description: 'Generate many varied ideas without judging them prematurely.',
      order: 1,
    },
  });

  const objective = await prisma.learningObjective.upsert({
    where: { id: OBJECTIVE_ID },
    update: {},
    create: {
      id: OBJECTIVE_ID,
      competencyId: competency.id,
      name: 'Generate many varied ideas',
      description: 'Produce several distinct ideas for an open-ended prompt.',
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
      title: 'Idea Spark',
      description: 'Learn how brainstorming works, then spark a bunch of your own ideas.',
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
    `Creativity vertical slice seeded: domain=${domain.slug} skill=${skill.slug} ` +
      `competency=${competency.id} mission=${mission.id} activities=${n}/${ACTIVITIES.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
