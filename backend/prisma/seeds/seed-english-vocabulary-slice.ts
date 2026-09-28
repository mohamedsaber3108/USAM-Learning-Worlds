/**
 * English Domain — first production vertical slice (plans-local/69, Option A).
 *
 * Proves English plugs into the SHARED learning spine (no English-only engine):
 *   Domain(English) → Skill(Vocabulary) → Competency(Everyday words A1, tagged
 *   with the VOCABULARY EnglishStrand) → LearningObjective → Activities
 *   (SELECT + MATCH, with teaching content) → Mission → MissionActivity.
 *
 * Doing the mission then runs through the existing engine unchanged:
 *   MissionRun → ActivityAttempt → Evidence(competencyId) → MasteryRecord →
 *   reviewDue → recommendation → /balanced + portfolio.
 *
 * Real learning content (a child actually learns everyday nouns), not a demo.
 * Idempotent via upsert with fixed ids. Run: ts-node prisma/seeds/seed-english-vocabulary-slice.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_SLUG = 'english';
const SKILL_SLUG = 'english-vocabulary';
const COMPETENCY_ID = 'english-competency-everyday-words-a1';
const OBJECTIVE_ID = 'english-objective-everyday-words-a1';
const MISSION_ID = 'english-mission-everyday-words';

// Real A1 everyday-vocabulary activities. Each carries teaching context (the
// Learn step) so the child is taught before being checked.
const ACTIVITIES = [
  {
    id: 'english-act-everyday-fruit',
    type: 'SELECT' as const,
    title: 'Which word is a fruit?',
    description: 'Choose the everyday word that names a fruit.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'Which word is a fruit?',
      context: 'A fruit is a sweet food that grows on a plant or tree — like an apple or a banana.',
      keyPoints: ['apple = a round fruit', 'banana = a long yellow fruit'],
      options: ['apple', 'chair', 'river', 'happy'],
      correctAnswers: ['apple'],
    },
  },
  {
    id: 'english-act-everyday-animal',
    type: 'SELECT' as const,
    title: 'Which word is an animal?',
    description: 'Choose the everyday word that names an animal.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'FORMATIVE' as const,
    content: {
      question: 'Which word is an animal?',
      context: 'An animal is a living thing that can move and breathe — like a cat or a dog.',
      keyPoints: ['cat = a small furry pet', 'dog = a friendly pet that barks'],
      options: ['cat', 'table', 'blue', 'run'],
      correctAnswers: ['cat'],
    },
  },
  {
    id: 'english-act-everyday-match',
    type: 'MATCH' as const,
    title: 'Match the word to its meaning',
    description: 'Match each everyday word with what it means.',
    difficulty: 'EASY' as const,
    assessmentPurpose: 'SUMMATIVE' as const,
    content: {
      question: 'Match each word to its meaning.',
      context: 'Read each word and choose what it means. You use all of these words every day!',
      pairs: [
        { left: 'sun', right: 'the bright light in the sky' },
        { left: 'book', right: 'pages with words you read' },
        { left: 'water', right: 'what you drink when you are thirsty' },
      ],
    },
  },
];

async function main() {
  // Domain: English (shared spine root for the domain).
  const domain = await prisma.domain.upsert({
    where: { slug: DOMAIN_SLUG },
    update: {},
    create: {
      name: 'English',
      slug: DOMAIN_SLUG,
      description: 'Learn English — vocabulary, grammar, reading, and more.',
      icon: 'Languages',
      color: '#8b5cf6',
      order: 1,
    },
  });

  // Skill: Vocabulary.
  const skill = await prisma.skill.upsert({
    where: { slug: SKILL_SLUG },
    update: {},
    create: {
      domainId: domain.id,
      name: 'English Vocabulary',
      slug: SKILL_SLUG,
      description: 'Build a strong core English vocabulary.',
      order: 1,
    },
  });

  // Taxonomy: the VOCABULARY strand (family × CEFR). CEFR lives on the strand.
  // The strands are the taxonomy source of truth — this slice tags its
  // competency with its PRIMARY strand, it does NOT invent one. If the strands
  // have not been seeded yet, fail loudly rather than silently persisting a
  // null strandId (that would be a fake, taxonomy-less completion).
  const vocabStrand = await prisma.englishStrand.findFirst({
    where: { strandType: 'VOCABULARY' },
    orderBy: { order: 'asc' },
  });
  if (!vocabStrand) {
    throw new Error(
      'No VOCABULARY EnglishStrand found. Run `npm run seed:english:strands` ' +
        'before seeding the English vocabulary slice so the competency can be ' +
        'tagged with its taxonomy strand.',
    );
  }

  // Competency: Everyday words (A1), tagged with its PRIMARY strand.
  const competency = await prisma.competency.upsert({
    where: { id: COMPETENCY_ID },
    update: { strandId: vocabStrand.id },
    create: {
      id: COMPETENCY_ID,
      skillId: skill.id,
      name: 'Everyday words (A1)',
      description: 'Recognise and match everyday English words.',
      order: 1,
      strandId: vocabStrand.id,
    },
  });

  // Learning Objective.
  const objective = await prisma.learningObjective.upsert({
    where: { id: OBJECTIVE_ID },
    update: {},
    create: {
      id: OBJECTIVE_ID,
      competencyId: competency.id,
      name: 'Recognise & match everyday words',
      description: 'Choose and match common everyday words with confidence.',
      order: 1,
    },
  });

  // Attach to the English world if one exists (nullable — mission works either way).
  const englishWorld = await prisma.world.findFirst({
    where: { domain: { slug: DOMAIN_SLUG } },
    orderBy: { order: 'asc' },
  });

  // Mission (guided) — the child's entry into the learning loop.
  const mission = await prisma.mission.upsert({
    where: { id: MISSION_ID },
    update: { worldId: englishWorld?.id ?? null },
    create: {
      id: MISSION_ID,
      worldId: englishWorld?.id ?? null,
      title: 'Everyday Words',
      description: 'Learn and practise everyday English words with Luma.',
      type: 'GUIDED',
      estimatedMinutes: 10,
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
    `English vocabulary slice seeded: domain=${domain.slug} skill=${skill.slug} ` +
      `competency=${competency.id} strand=${vocabStrand.slug} ` +
      `mission=${mission.id} activities=${n}/${ACTIVITIES.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
