/**
 * Real-World Challenge Engine — Seeding
 *
 * Seeds 4 real Project rows flagged isRealWorldChallenge=true with an
 * externalSourceUrl pointing at the real-world program/organization the
 * challenge is modeled on, owned by the platform's seeded test learner
 * (mirrors seed-projects-rubrics.ts's pattern of Project templates).
 *
 * Built from scratch per USAM_KIDS_ENGINE_GAP_MATRIX.md's "Real-World
 * Challenge Engine | Missing" row — was zero-trace before this pass. No
 * new system: just two fields (isRealWorldChallenge, externalSourceUrl)
 * added directly to the existing Project model.
 *
 * Run with: npx ts-node prisma/seeds/seed-real-world-challenges.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ChallengeSeed {
  title: string;
  description: string;
  ageBand: string;
  skills: string[];
  externalSourceUrl: string;
}

const challenges: ChallengeSeed[] = [
  {
    title: 'Design a Recycling System for Your School',
    description:
      'Real schools waste huge amounts of recyclable material because bins are confusing or in the wrong places. Study your school\'s current trash/recycling setup, find the biggest problem, and design a better system (bin placement, labeling, or a sorting guide) you could actually propose to your school.',
    ageBand: 'AGE_10_11',
    skills: ['sustainability', 'systems-thinking', 'research', 'persuasive-writing'],
    externalSourceUrl: 'https://www.epa.gov/recycle/recycling-schools',
  },
  {
    title: 'Map a Safer Walking Route to School',
    description:
      'Many city safety programs ask residents to map hazards (missing crosswalks, no sidewalks, poor lighting) on common walking routes. Pick a route you or a friend actually walks, note at least 3 real hazards, and sketch a map with suggested fixes.',
    ageBand: 'AGE_10_11',
    skills: ['mapping', 'research', 'civic-thinking', 'observation'],
    externalSourceUrl: 'https://www.saferoutespartnership.org/',
  },
  {
    title: 'Design a Water Conservation Plan for Your Home',
    description:
      'Water utilities in drought-prone regions publish real household water-saving challenges. Track your household\'s water use for a few days, identify the biggest use (showers, laundry, dishes), and design a realistic plan to cut it — with numbers, not just guesses.',
    ageBand: 'AGE_12_14',
    skills: ['data-collection', 'sustainability', 'financial-literacy', 'critical-thinking'],
    externalSourceUrl: 'https://www.epa.gov/watersense',
  },
  {
    title: 'Propose a Fix for a Real Local Litter Problem',
    description:
      'Community clean-up organizations often start with someone identifying one specific problem spot (a park, a stretch of sidewalk, a beach). Identify a real litter spot near you, document it with notes or photos, and propose one realistic fix a small group of kids could actually do.',
    ageBand: 'AGE_8_9',
    skills: ['observation', 'civic-thinking', 'problem-solving', 'community'],
    externalSourceUrl: 'https://www.keepamericabeautiful.org/',
  },
];

async function main() {
  const learner = await prisma.learner.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (!learner) {
    throw new Error(
      'No learner found in the database. Run the base prisma/seed.ts first to create the test learner.',
    );
  }

  console.log(`Using learner: ${learner.displayName} (${learner.id})`);

  let created = 0;
  for (const c of challenges) {
    const existing = await prisma.project.findFirst({
      where: { learnerId: learner.id, title: c.title },
    });

    if (existing) {
      console.log(`Already exists, reusing: ${c.title}`);
      if (!existing.isRealWorldChallenge || existing.externalSourceUrl !== c.externalSourceUrl) {
        await prisma.project.update({
          where: { id: existing.id },
          data: { isRealWorldChallenge: true, externalSourceUrl: c.externalSourceUrl },
        });
        console.log('  -> backfilled isRealWorldChallenge/externalSourceUrl');
      }
      continue;
    }

    await prisma.project.create({
      data: {
        learnerId: learner.id,
        title: c.title,
        description: c.description,
        state: 'PLANNING',
        visibility: 'PUBLIC',
        skills: c.skills,
        isRealWorldChallenge: true,
        externalSourceUrl: c.externalSourceUrl,
      },
    });
    created++;
    console.log(`Created real-world challenge: ${c.title}`);
  }

  console.log(`\nReal-world challenge seeding complete. Created: ${created}/${challenges.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
