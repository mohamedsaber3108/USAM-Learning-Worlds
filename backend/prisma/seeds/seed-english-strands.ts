/**
 * English Strands Seeding
 *
 * Seeds 14 English learning strands with CEFR progression
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const englishStrands = [
  {
    name: 'Reading Comprehension',
    slug: 'reading-comprehension',
    description: 'Understanding and analyzing written texts',
    cefrLevel: 'A1',
    order: 1,
  },
  {
    name: 'Writing Skills',
    slug: 'writing-skills',
    description: 'Expressing ideas clearly in written form',
    cefrLevel: 'A1',
    order: 2,
  },
  {
    name: 'Speaking & Conversation',
    slug: 'speaking-conversation',
    description: 'Engaging in spoken communication',
    cefrLevel: 'A1',
    order: 3,
  },
  {
    name: 'Listening Skills',
    slug: 'listening-skills',
    description: 'Understanding spoken English',
    cefrLevel: 'A1',
    order: 4,
  },
  {
    name: 'Grammar Fundamentals',
    slug: 'grammar-fundamentals',
    description: 'Understanding sentence structure and grammar rules',
    cefrLevel: 'A1',
    order: 5,
  },
  {
    name: 'Vocabulary Building',
    slug: 'vocabulary-building',
    description: 'Expanding word knowledge and usage',
    cefrLevel: 'A1',
    order: 6,
  },
  {
    name: 'Pronunciation & Phonics',
    slug: 'pronunciation-phonics',
    description: 'Correct pronunciation and sound awareness',
    cefrLevel: 'A1',
    order: 7,
  },
  {
    name: 'Fluency Development',
    slug: 'fluency-development',
    description: 'Speaking and writing smoothly and naturally',
    cefrLevel: 'A2',
    order: 8,
  },
  {
    name: 'Storytelling',
    slug: 'storytelling',
    description: 'Narrating events and creating stories',
    cefrLevel: 'A2',
    order: 9,
  },
  {
    name: 'Presentation Skills',
    slug: 'presentation-skills',
    description: 'Speaking confidently to groups',
    cefrLevel: 'B1',
    order: 10,
  },
  {
    name: 'Academic English',
    slug: 'academic-english',
    description: 'English for educational contexts',
    cefrLevel: 'B1',
    order: 11,
  },
  {
    name: 'Business English',
    slug: 'business-english',
    description: 'Professional communication skills',
    cefrLevel: 'B2',
    order: 12,
  },
  {
    name: 'Creative Writing',
    slug: 'creative-writing',
    description: 'Imaginative and expressive writing',
    cefrLevel: 'B1',
    order: 13,
  },
  {
    name: 'Critical Reading',
    slug: 'critical-reading',
    description: 'Analyzing and evaluating texts',
    cefrLevel: 'B2',
    order: 14,
  },
];

async function seedEnglishStrands() {
  console.log('📚 Starting English strands seeding...\n');

  let created = 0;
  let updated = 0;

  for (const strand of englishStrands) {
    const existing = await prisma.englishStrand.findUnique({
      where: { slug: strand.slug },
    });

    if (existing) {
      await prisma.englishStrand.update({
        where: { id: existing.id },
        data: strand,
      });
      updated++;
    } else {
      await prisma.englishStrand.create({
        data: strand,
      });
      created++;
    }

    console.log(`✅ ${strand.name} (${strand.cefrLevel})`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} strands`);
  console.log(`   Updated: ${updated} strands`);
  console.log(`   Total: ${englishStrands.length} strands`);
  console.log('\n🎉 English strands seeding complete!\n');
}

seedEnglishStrands()
  .catch((e) => {
    console.error('❌ English strands seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
