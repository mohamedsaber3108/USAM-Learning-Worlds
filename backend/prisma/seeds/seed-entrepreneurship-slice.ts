/**
 * Entrepreneurship Domain — first production vertical slice.
 *
 * Entrepreneurship is the 4th LOCKED primary domain (plans-local/01, 28) and
 * was the thinnest content-wise (no dedicated slice existed). This proves it
 * plugs into the SAME shared learning spine as English/Coding — no bespoke
 * engine:
 *   Domain(Entrepreneurship) → Skill(Idea to Pitch) → Competency(Find a real
 *   problem, A1) → LearningObjective → Activities (SELECT + MATCH + EXPLAIN,
 *   each with teaching content) → Mission → MissionActivity.
 *
 * Running the mission then flows through the existing engine unchanged:
 *   MissionRun → ActivityAttempt → Evidence(competencyId) → MasteryRecord →
 *   reviewDue → recommendation → portfolio.
 *
 * Age-appropriate + mindset-over-theory (directive §24): the design-thinking
 * loop Problem → Idea → User → Solution → Pitch, framed with Adam the
 * entrepreneurship mentor. NO real money / no real purchases — "value" is play
 * money and pretend customers only.
 *
 * Idempotent via upsert with fixed ids.
 * Run: ts-node -r tsconfig-paths/register prisma/seeds/seed-entrepreneurship-slice.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'entrepreneurship';
const SKILL_SLUG = 'entrepreneurship-idea-to-pitch';
const COMPETENCY_ID = 'entrepreneurship-competency-find-a-problem-a1';
const OBJECTIVE_ID = 'entrepreneurship-objective-find-a-problem-a1';
const MISSION_ID = 'entrepreneurship-mission-first-idea';

// Real A1 "find a real problem → shape an idea → name a user → pitch it"
// activities. Each carries teaching context (the Learn step) so the child is
// taught the idea before being checked. Mindset, not business theory.
const ACTIVITIES = [
  {
    id: 'entrepreneurship-act-find-problem',
    type: 'SELECT' as const,
    title: 'What is a good problem to solve?',
    description: 'A great idea starts with a real problem someone has.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'Which of these is a REAL problem you could help with an idea?',
      context:
        'Entrepreneurs start by noticing a problem — something that annoys people or makes their day harder. A good problem is real, and someone actually has it.',
      keyPoints: [
        'A problem is something that makes life harder for a real person.',
        'The best ideas fix a problem someone truly has.',
      ],
      options: [
        'Kids forget their water bottle at school and get thirsty',
        'The sky is blue',
        'Two plus two equals four',
        'Mondays come after Sundays',
      ],
      correctAnswers: ['Kids forget their water bottle at school and get thirsty'],
    },
  },
  {
    id: 'entrepreneurship-act-name-the-user',
    type: 'SELECT' as const,
    title: 'Who is it for?',
    description: 'Every idea needs a real person who would want it.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question:
        'You invented a bag tag that reminds kids to pack their water bottle. Who is this idea FOR?',
      context:
        'Adam always asks: "Who, exactly, would want this?" An idea needs one real person (a user) who has the problem. "Everyone" is not an answer.',
      keyPoints: [
        'A user is the real person who has the problem.',
        'Name ONE kind of person, not "everyone".',
      ],
      options: [
        'Kids who keep forgetting their water bottle',
        'Everyone in the whole world',
        'Nobody',
        'Grown-ups who already never forget anything',
      ],
      correctAnswers: ['Kids who keep forgetting their water bottle'],
    },
  },
  {
    id: 'entrepreneurship-act-match-steps',
    type: 'MATCH' as const,
    title: 'The idea journey',
    description: 'Match each step of turning an idea into something real.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      question: 'Match each step to what it means.',
      context:
        'Every idea follows a journey: find a Problem, shape an Idea, pick a User, then Pitch it — explain it so someone else gets excited too.',
      pairs: [
        { left: 'Problem', right: 'Something that makes life harder' },
        { left: 'Idea', right: 'Your plan to fix the problem' },
        { left: 'User', right: 'The real person it is for' },
        { left: 'Pitch', right: 'Telling someone about your idea' },
      ],
    },
  },
  {
    id: 'entrepreneurship-act-pitch-it',
    type: 'EXPLAIN' as const,
    title: 'Pitch your idea',
    description: 'Say your idea out loud in one clear sentence.',
    difficulty: 'MEDIUM' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      question:
        'In one sentence, pitch an idea that solves a problem you have noticed. Tell us the problem, your idea, and who it is for.',
      context:
        'A pitch is one clear sentence: "I help [who] who have [problem] by [your idea]." Keep it short — Adam says a good pitch fits in one breath.',
      keyPoints: [
        'Name the user (who it is for).',
        'Name the problem.',
        'Name your idea (how it helps).',
      ],
    },
  },
];

async function main() {
  // Domain: Entrepreneurship (must already exist from the default seed; create
  // defensively so this slice can run standalone against any environment).
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: {},
    create: {
      name: 'Entrepreneurship',
      slug: DOMAIN_SLUG,
      description:
        'Young business building: problem → idea → user → solution → create → test → value → pitch.',
      icon: 'Rocket',
      color: '#EA580C',
      order: 4,
    },
  });

  // Skill: Idea to Pitch.
  const skill = await prisma.skill.upsert({
    where: { slug: SKILL_SLUG },
    update: {},
    create: {
      domainId: domain.id,
      name: 'From Idea to Pitch',
      slug: SKILL_SLUG,
      description: 'Spot a real problem, shape an idea for a real user, and pitch it.',
      order: 1,
    },
  });

  // Competency: Find a real problem (A1).
  const competency = await prisma.competency.upsert({
    where: { id: COMPETENCY_ID },
    update: {},
    create: {
      id: COMPETENCY_ID,
      skillId: skill.id,
      name: 'Find a real problem (A1)',
      description: 'Notice a real problem, name who it is for, and pitch a simple idea.',
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
      name: 'Find a problem, name the user, and pitch an idea',
      description: 'Spot a real problem, say who it is for, and pitch a simple idea in one sentence.',
      order: 1,
    },
  });

  // Attach to the Entrepreneurship world if one exists (nullable).
  const world = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  // Mission (guided) — the child's entry into the entrepreneurship loop, with Adam.
  const mission = await prisma.mission.upsert({
    where: { id: MISSION_ID },
    update: { worldId: world?.id ?? null },
    create: {
      id: MISSION_ID,
      worldId: world?.id ?? null,
      title: 'My First Big Idea',
      description: 'Find a real problem and pitch your first idea with Adam.',
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
    `Entrepreneurship slice seeded: domain=${domain.slug} skill=${skill.slug} ` +
      `competency=${competency.id} mission=${mission.id} activities=${n}/${ACTIVITIES.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
