/**
 * Coding Concepts Seeding
 *
 * Seeds 18 core coding concepts with categories and difficulty
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const codingConcepts = [
  // BASICS
  {
    name: 'Variables',
    slug: 'variables',
    description: 'Storing and using data in your programs',
    category: 'BASICS',
    difficulty: 1,
    order: 1,
  },
  {
    name: 'Data Types',
    slug: 'data-types',
    description: 'Different kinds of data: numbers, text, true/false',
    category: 'BASICS',
    difficulty: 1,
    order: 2,
  },
  {
    name: 'Operators',
    slug: 'operators',
    description: 'Mathematical and logical operations',
    category: 'BASICS',
    difficulty: 1,
    order: 3,
  },

  // LOGIC
  {
    name: 'Conditionals',
    slug: 'conditionals',
    description: 'Making decisions with if/else statements',
    category: 'LOGIC',
    difficulty: 2,
    order: 4,
  },
  {
    name: 'Loops',
    slug: 'loops',
    description: 'Repeating actions with for and while loops',
    category: 'LOGIC',
    difficulty: 2,
    order: 5,
  },
  {
    name: 'Functions',
    slug: 'functions',
    description: 'Reusable blocks of code',
    category: 'LOGIC',
    difficulty: 2,
    order: 6,
  },
  {
    name: 'Boolean Logic',
    slug: 'boolean-logic',
    description: 'AND, OR, NOT operations for complex conditions',
    category: 'LOGIC',
    difficulty: 2,
    order: 7,
  },

  // DATA
  {
    name: 'Arrays & Lists',
    slug: 'arrays-lists',
    description: 'Storing collections of data',
    category: 'DATA',
    difficulty: 3,
    order: 8,
  },
  {
    name: 'Objects & Dictionaries',
    slug: 'objects-dictionaries',
    description: 'Organizing data with key-value pairs',
    category: 'DATA',
    difficulty: 3,
    order: 9,
  },
  {
    name: 'String Manipulation',
    slug: 'string-manipulation',
    description: 'Working with text data',
    category: 'DATA',
    difficulty: 2,
    order: 10,
  },

  // ALGORITHMS
  {
    name: 'Sorting',
    slug: 'sorting',
    description: 'Arranging data in order',
    category: 'ALGORITHMS',
    difficulty: 3,
    order: 11,
  },
  {
    name: 'Searching',
    slug: 'searching',
    description: 'Finding specific items in data',
    category: 'ALGORITHMS',
    difficulty: 3,
    order: 12,
  },
  {
    name: 'Recursion',
    slug: 'recursion',
    description: 'Functions that call themselves',
    category: 'ALGORITHMS',
    difficulty: 4,
    order: 13,
  },

  // DESIGN
  {
    name: 'Classes & Objects',
    slug: 'classes-objects',
    description: 'Object-oriented programming basics',
    category: 'DESIGN',
    difficulty: 4,
    order: 14,
  },
  {
    name: 'Modules & Imports',
    slug: 'modules-imports',
    description: 'Organizing code into files',
    category: 'DESIGN',
    difficulty: 3,
    order: 15,
  },
  {
    name: 'Events & Callbacks',
    slug: 'events-callbacks',
    description: 'Responding to user actions',
    category: 'DESIGN',
    difficulty: 4,
    order: 16,
  },
  {
    name: 'Async Programming',
    slug: 'async-programming',
    description: 'Handling operations that take time',
    category: 'DESIGN',
    difficulty: 5,
    order: 17,
  },
  {
    name: 'APIs & Web Requests',
    slug: 'apis-web-requests',
    description: 'Getting data from the internet',
    category: 'DESIGN',
    difficulty: 4,
    order: 18,
  },
];

async function seedCodingConcepts() {
  console.log('💻 Starting coding concepts seeding...\n');

  let created = 0;
  let updated = 0;

  for (const concept of codingConcepts) {
    const existing = await prisma.codingConcept.findUnique({
      where: { slug: concept.slug },
    });

    if (existing) {
      await prisma.codingConcept.update({
        where: { id: existing.id },
        data: concept,
      });
      updated++;
    } else {
      await prisma.codingConcept.create({
        data: concept,
      });
      created++;
    }

    const difficultyStars = '⭐'.repeat(concept.difficulty);
    console.log(`✅ ${concept.name} [${concept.category}] ${difficultyStars}`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} concepts`);
  console.log(`   Updated: ${updated} concepts`);
  console.log(`   Total: ${codingConcepts.length} concepts`);

  console.log(`\n📚 By Category:`);
  const categories = codingConcepts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} concepts`);
  });

  console.log('\n🎉 Coding concepts seeding complete!\n');
}

seedCodingConcepts()
  .catch((e) => {
    console.error('❌ Coding concepts seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
