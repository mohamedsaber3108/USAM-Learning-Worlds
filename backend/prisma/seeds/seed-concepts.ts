/**
 * Concepts Seeding (Knowledge Graph layer)
 *
 * Seeds real curriculum concepts under each existing Competency,
 * with prerequisite links, so the Knowledge Graph / Concept engine
 * has real content instead of empty tables.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Concepts grouped by competency slug-ish match on competency name.
// Each competency gets 2-3 real, age-appropriate concepts with a simple
// prerequisite chain (concept[1] requires concept[0], etc.)
const conceptsByCompetency: Record<string, { name: string; slug: string; description: string }[]> = {
  'Understanding Place Value': [
    { name: 'Ones and Tens', slug: 'ones-and-tens', description: 'Recognizing the ones and tens place in a two-digit number' },
    { name: 'Hundreds Place', slug: 'hundreds-place', description: 'Recognizing the hundreds place in a three-digit number' },
    { name: 'Expanded Form', slug: 'expanded-form', description: 'Writing numbers as the sum of their place values, e.g. 347 = 300 + 40 + 7' },
  ],
  'Single Digit Addition': [
    { name: 'Counting On', slug: 'counting-on', description: 'Adding small numbers by counting up from the larger addend' },
    { name: 'Making Ten', slug: 'making-ten', description: 'Using pairs that make ten to add single digits quickly' },
  ],
  'Double Digit Addition': [
    { name: 'Adding Without Regrouping', slug: 'adding-without-regrouping', description: 'Adding two-digit numbers when no carrying is needed' },
    { name: 'Adding With Regrouping', slug: 'adding-with-regrouping', description: 'Adding two-digit numbers and carrying to the next place value' },
  ],
  'Times Tables 1-5': [
    { name: 'Repeated Addition', slug: 'repeated-addition', description: 'Understanding multiplication as repeated addition' },
    { name: 'Times Tables 2-5', slug: 'times-tables-2-5', description: 'Memorizing and applying multiplication facts for 2 through 5' },
  ],
  'Times Tables 6-12': [
    { name: 'Times Tables 6-9', slug: 'times-tables-6-9', description: 'Memorizing and applying multiplication facts for 6 through 9' },
    { name: 'Times Tables 10-12', slug: 'times-tables-10-12', description: 'Memorizing and applying multiplication facts for 10 through 12' },
  ],
  'Parts of a Plant': [
    { name: 'Roots and Stems', slug: 'roots-and-stems', description: 'What roots and stems do for a plant' },
    { name: 'Leaves and Flowers', slug: 'leaves-and-flowers', description: 'How leaves make food and flowers make seeds' },
  ],
  'Plant Life Cycle': [
    { name: 'Seed Germination', slug: 'seed-germination', description: 'How a seed sprouts into a seedling' },
    { name: 'Growth to Maturity', slug: 'growth-to-maturity', description: 'How a seedling grows into a mature, flowering plant' },
  ],
  'Planet Names & Order': [
    { name: 'Inner Planets', slug: 'inner-planets', description: 'Mercury, Venus, Earth, and Mars - the rocky inner planets' },
    { name: 'Outer Planets', slug: 'outer-planets', description: 'Jupiter, Saturn, Uranus, and Neptune - the gas and ice giants' },
  ],
  'Common Words': [
    { name: 'Sight Words', slug: 'sight-words', description: 'High-frequency words recognized instantly without sounding out' },
    { name: 'Everyday Vocabulary', slug: 'everyday-vocabulary', description: 'Common words used in daily conversation' },
  ],
  'Synonyms & Antonyms': [
    { name: 'Synonyms', slug: 'synonyms', description: 'Words that mean the same or nearly the same thing' },
    { name: 'Antonyms', slug: 'antonyms', description: 'Words that mean the opposite of each other' },
  ],
  'Sequences': [
    { name: 'Step-by-Step Instructions', slug: 'step-by-step-instructions', description: 'Ordering commands so a program runs in the right sequence' },
    { name: 'Debugging Sequences', slug: 'debugging-sequences', description: 'Finding and fixing an out-of-order step in a sequence' },
  ],
  'Loops': [
    { name: 'Repeat Blocks', slug: 'repeat-blocks', description: 'Using a repeat block to run the same steps multiple times' },
    { name: 'Loop Conditions', slug: 'loop-conditions', description: 'Stopping a loop when a condition becomes true' },
  ],
};

async function main() {
  console.log('🌱 Seeding Concepts (Knowledge Graph)...\n');

  const competencies = await prisma.competency.findMany();
  let created = 0;
  let updated = 0;
  const conceptIdBySlug: Record<string, string> = {};

  for (const competency of competencies) {
    const defs = conceptsByCompetency[competency.name];
    if (!defs) {
      console.log(`⚠️  No concept definitions for competency "${competency.name}" - skipping`);
      continue;
    }
    let order = 1;
    for (const def of defs) {
      const existing = await prisma.concept.findUnique({ where: { slug: def.slug } });
      const data = {
        competencyId: competency.id,
        name: def.name,
        slug: def.slug,
        description: def.description,
        order: order++,
        isActive: true,
      };
      let concept;
      if (existing) {
        concept = await prisma.concept.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        concept = await prisma.concept.create({ data });
        created++;
      }
      conceptIdBySlug[def.slug] = concept.id;
      console.log(`✅ ${competency.name} -> ${def.name}`);
    }
  }

  console.log(`\n📊 Concepts: created ${created}, updated ${updated}, total defined ${Object.keys(conceptIdBySlug).length}`);

  // Prerequisite chains: within each competency's concept list, concept[i] requires concept[i-1]
  console.log('\n🔗 Linking prerequisites...');
  let links = 0;
  for (const defs of Object.values(conceptsByCompetency)) {
    for (let i = 1; i < defs.length; i++) {
      const conceptId = conceptIdBySlug[defs[i].slug];
      const prereqId = conceptIdBySlug[defs[i - 1].slug];
      if (!conceptId || !prereqId) continue;
      await prisma.conceptPrerequisite.upsert({
        where: { conceptId_prerequisiteId: { conceptId, prerequisiteId: prereqId } },
        create: { conceptId, prerequisiteId: prereqId, type: 'REQUIRED' },
        update: {},
      });
      links++;
    }
  }
  console.log(`✅ Created/confirmed ${links} prerequisite links`);

  console.log('\n🎉 Concepts seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Concepts seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
