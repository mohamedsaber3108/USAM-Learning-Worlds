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

  // Seed 12 domains
  const domains = [
    { name: 'Mathematics', slug: 'mathematics', icon: '🔢', color: '#3B82F6', order: 1 },
    { name: 'Science', slug: 'science', icon: '🔬', color: '#10B981', order: 2 },
    { name: 'Engineering', slug: 'engineering', icon: '⚙️', color: '#F59E0B', order: 3 },
    { name: 'Technology', slug: 'technology', icon: '💻', color: '#8B5CF6', order: 4 },
    { name: 'Arts', slug: 'arts', icon: '🎨', color: '#EC4899', order: 5 },
    { name: 'Language', slug: 'language', icon: '📚', color: '#EF4444', order: 6 },
    { name: 'Social Studies', slug: 'social-studies', icon: '🌍', color: '#14B8A6', order: 7 },
    { name: 'Health & Wellness', slug: 'health', icon: '❤️', color: '#F43F5E', order: 8 },
    { name: 'Music', slug: 'music', icon: '🎵', color: '#A855F7', order: 9 },
    { name: 'Physical Education', slug: 'physical-education', icon: '⚽', color: '#22C55E', order: 10 },
    { name: 'Critical Thinking', slug: 'critical-thinking', icon: '🧠', color: '#6366F1', order: 11 },
    { name: 'Creativity', slug: 'creativity', icon: '✨', color: '#F472B6', order: 12 },
  ];

  for (const domain of domains) {
    await prisma.domain.create({ data: domain });
  }

  console.log('✅ Created 12 domains');

  // Create sample skill for Mathematics
  const mathDomain = await prisma.domain.findUnique({
    where: { slug: 'mathematics' },
  });

  const skill = await prisma.skill.create({
    data: {
      domainId: mathDomain.id,
      name: 'Number Sense',
      slug: 'number-sense',
      description: 'Understanding numbers and their relationships',
      order: 1,
    },
  });

  console.log('✅ Created sample skill: Number Sense');

  // Create sample competency
  const competency = await prisma.competency.create({
    data: {
      skillId: skill.id,
      name: 'Understanding Place Value',
      description: 'Recognize the place value of digits in numbers',
      order: 1,
    },
  });

  console.log('✅ Created sample competency');

  // Create sample objective
  const objective = await prisma.learningObjective.create({
    data: {
      competencyId: competency.id,
      name: 'Identify place value in 3-digit numbers',
      description: 'Understand hundreds, tens, and ones places',
      order: 1,
    },
  });

  console.log('✅ Created sample objective');

  // Create sample activity
  await prisma.activity.create({
    data: {
      objectiveId: objective.id,
      type: 'SELECT',
      title: 'Place Value Challenge',
      description: 'Identify the place value of digits',
      difficulty: 'MEDIUM',
      content: {
        question: 'In the number 347, what is the value of the digit 4?',
        options: ['4', '40', '400', '4000'],
        correctAnswers: ['40'],
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

  // Create sample mission
  const mission = await prisma.mission.create({
    data: {
      title: 'Number Detective',
      description: 'Explore the world of place value and discover the secrets of numbers!',
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
