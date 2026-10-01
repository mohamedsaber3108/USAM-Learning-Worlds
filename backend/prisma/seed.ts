import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { seedCharacterUniverse } from './seeds/seed-character-universe';
import { seedCosmetics } from './seeds/seed-cosmetics';
import { seedReflectionPrompts } from './seeds/seed-reflection-prompts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test learner user
  const passwordHash = await bcrypt.hash('password123', 10);

  const learnerUser = await prisma.user.create({
    data: {
      email: 'learner@test.com',
      passwordHash,
      role: 'LEARNER',
      learner: {
        create: {
          firstName: 'Alex',
          lastName: 'Explorer',
          displayName: 'AlexTheExplorer',
          ageBand: 'AGE_10_11',
          dateOfBirth: new Date('2014-01-15'),
        },
      },
    },
    include: { learner: true },
  });

  console.log('✅ Created test learner:', learnerUser.email);

  // Create progression record
  await prisma.progression.create({
    data: {
      learnerId: learnerUser.learner.id,
      level: 1,
      totalXP: 0,
      coins: 100,
    },
  });

  console.log('✅ Created progression for learner');

  // Create test guardian
  const guardianUser = await prisma.user.create({
    data: {
      email: 'parent@test.com',
      passwordHash,
      role: 'GUARDIAN',
      guardian: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567890',
        },
      },
    },
    include: { guardian: true },
  });

  console.log('✅ Created test guardian:', guardianUser.email);

  // Link guardian to learner
  await prisma.guardianship.create({
    data: {
      guardianId: guardianUser.guardian.id,
      learnerId: learnerUser.learner.id,
      relationship: 'PARENT',
      status: 'ACTIVE',
      consentedAt: new Date(),
    },
  });

  console.log('✅ Linked guardian to learner');

  // Seed the 4 LOCKED primary domains (product-first reconstruction, Option A).
  // See plans-local/01_PRODUCT_SCOPE.md + 08_CURRICULUM.md. The previous 12
  // school-subject domains (Math/Science/PE/Music/…) were WRONG for the product
  // and are retired. Real domain breadth content is seeded by the named
  // `seed:*` scripts (english/coding/ai-literacy/entrepreneurship); this default
  // seeder establishes the correct domain shells + a demonstrative English slice.
  // Idempotent (upsert) so re-running against an existing db is safe.
  const domains = [
    { name: 'English', slug: 'english', icon: '📖', color: '#2563EB', order: 1,
      description: 'Language acquisition: vocabulary, grammar, reading, listening, speaking, writing, conversation (CEFR).' },
    { name: 'Coding', slug: 'coding', icon: '💻', color: '#7C3AED', order: 2,
      description: 'Computational thinking: decomposition, patterns, abstraction, algorithms, real coding + projects.' },
    { name: 'AI Literacy', slug: 'ai-literacy', icon: '🤖', color: '#0D9488', order: 3,
      description: 'How AI works, data & bias, judging AI output, responsible creation (AI4K12 five big ideas).' },
    { name: 'Entrepreneurship', slug: 'entrepreneurship', icon: '🚀', color: '#EA580C', order: 4,
      description: 'Young business building: problem → idea → user → solution → create → test → value → pitch.' },
  ];

  for (const domain of domains) {
    await prisma.domain.upsert({
      where: { slug: domain.slug },
      update: { name: domain.name, icon: domain.icon, color: domain.color, order: domain.order, description: domain.description },
      create: domain,
    });
  }

  console.log('✅ Created/updated the 4 primary domains (English, Coding, AI Literacy, Entrepreneurship)');

  // Demonstrative vertical slice under English (a LOCKED domain). Real breadth
  // comes from `seed:english:*` scripts; this proves the spine end-to-end.
  const englishDomain = await prisma.domain.findUnique({
    where: { slug: 'english' },
  });

  const skill = await prisma.skill.create({
    data: {
      domainId: englishDomain.id,
      name: 'Vocabulary',
      slug: 'english-vocabulary',
      description: 'Recognising and using everyday words.',
      order: 1,
    },
  });

  console.log('✅ Created sample skill: Vocabulary (English)');

  // Create sample competency
  const competency = await prisma.competency.create({
    data: {
      skillId: skill.id,
      name: 'Everyday words (A1)',
      description: 'Recognise and match common everyday words.',
      order: 1,
    },
  });

  console.log('✅ Created sample competency');

  // Create sample objective
  const objective = await prisma.learningObjective.create({
    data: {
      competencyId: competency.id,
      name: 'Recognise & match everyday words',
      description: 'Match everyday words to their meaning or picture.',
      order: 1,
    },
  });

  console.log('✅ Created sample objective');

  // Create sample activity
  await prisma.activity.create({
    data: {
      objectiveId: objective.id,
      type: 'SELECT',
      title: 'Everyday Words',
      description: 'Pick the word that matches the picture.',
      difficulty: 'EASY',
      content: {
        question: 'Which word means a place where you live?',
        options: ['house', 'river', 'cloud', 'spoon'],
        correctAnswers: ['house'],
      },
      order: 1,
    },
  });

  console.log('✅ Created sample activity');

  // Create the full Character Universe (15 named characters, including Azouz)
  await seedCharacterUniverse();
  await seedCosmetics(prisma);

  // Metacognition Engine: reflection prompt bank shown after mission
  // completion (see ReflectionQuickCheck.tsx). Was previously an orphaned
  // seed file never invoked by `npm run seed` — wired in here so a fresh
  // database actually has the 3 prompt rows the frontend/controller expect.
  await seedReflectionPrompts(prisma);

  // Create sample mission (English everyday-words slice)
  const mission = await prisma.mission.create({
    data: {
      title: 'Everyday Words',
      description: 'Meet the words you use every day and learn to spot them fast!',
      type: 'GUIDED',
      estimatedMinutes: 15,
      order: 1,
    },
  });

  console.log('✅ Created sample mission');

  console.log('\n🎉 Seed data complete!\n');
  console.log('📧 Test Accounts:');
  console.log('   Learner: learner@test.com / password123');
  console.log('   Guardian: parent@test.com / password123');
  console.log('\n🚀 Start the server with: npm run start:dev');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
