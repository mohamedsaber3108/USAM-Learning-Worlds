/**
 * World Engine seeding — ONE world per LOCKED primary domain.
 *
 * Product-first reconstruction (plans-local/01, 08): the four primary domains
 * are English, Coding, AI Literacy, Entrepreneurship. This replaces the former
 * 7 school-subject worlds (Numeria/Verdantia/Circuit City/… mapped to
 * mathematics/science/technology/arts/engineering), which no longer match the
 * seeded domains and would all be skipped ("domain slug not found").
 *
 * Each World's `domainId` is looked up live by the domain `slug` (see
 * backend/prisma/seed.ts), so this stays in sync with the domain seed and is
 * safe to re-run (idempotent upsert by world slug).
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const worldDefs = [
  {
    domainSlug: 'english',
    name: 'Wordhaven',
    slug: 'wordhaven',
    description:
      'A living town built from stories, conversation, and words — where every new word you learn opens another door.',
    unlockCondition: 'Always unlocked — Wordhaven is a starting world.',
    order: 1,
  },
  {
    domainSlug: 'coding',
    name: 'Circuit City',
    slug: 'circuit-city',
    description:
      'A neon city of code and gadgets where you build things that actually run — from your first line to real working programs.',
    unlockCondition: 'Always unlocked — Circuit City is a starting world.',
    order: 2,
  },
  {
    domainSlug: 'ai-literacy',
    name: 'Mindspring',
    slug: 'mindspring',
    description:
      'A world of thinking machines where you learn how AI really works, where it gets things wrong, and how to create with it wisely.',
    unlockCondition: 'Unlocks after completing at least 1 mission in Wordhaven or Circuit City.',
    order: 3,
  },
  {
    domainSlug: 'entrepreneurship',
    name: 'Launch Bay',
    slug: 'launch-bay',
    description:
      'A harbor of big ideas where you spot a real problem, build a solution, test it, and pitch it to the world.',
    unlockCondition: 'Unlocks after completing at least 2 missions across any world.',
    order: 4,
  },
];

async function main() {
  console.log('Seeding Worlds...');
  let created = 0;
  for (const w of worldDefs) {
    const domain = await prisma.domain.findUnique({ where: { slug: w.domainSlug } });
    if (!domain) {
      console.warn(`Skipping world "${w.name}" — domain slug "${w.domainSlug}" not found.`);
      continue;
    }
    await prisma.world.upsert({
      where: { slug: w.slug },
      update: {
        name: w.name,
        description: w.description,
        domainId: domain.id,
        unlockCondition: w.unlockCondition,
        order: w.order,
      },
      create: {
        name: w.name,
        slug: w.slug,
        description: w.description,
        domainId: domain.id,
        unlockCondition: w.unlockCondition,
        order: w.order,
      },
    });
    created += 1;
  }
  console.log(`Seeded ${created} World rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
