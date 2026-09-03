/**
 * World Engine / World State Engine Seeding
 *
 * Seeds `World` with 7 real worlds (one per major learning Domain, out of
 * the 13 live `domains` rows) — a genuine step up from the previous
 * `Mission.worldId` free-string-with-no-model state
 * (USAM_KIDS_ENGINE_GAP_MATRIX.md Part 7b: "no World model, no FK, no
 * relation, no seed data").
 *
 * Each World's `domainId` is looked up live by the real domain `slug`
 * (backend/prisma/seed.ts), not hardcoded, so this seed is safe to re-run
 * against any environment with the standard domain set.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const worldDefs = [
  {
    domainSlug: 'mathematics',
    name: 'Numeria',
    slug: 'numeria',
    description:
      'A world built from numbers, shapes, and puzzles — where every problem has a satisfying "click" the moment it clicks into place.',
    unlockCondition: 'Always unlocked — Numeria is one of the starting worlds.',
    order: 1,
  },
  {
    domainSlug: 'science',
    name: 'Verdantia',
    slug: 'verdantia',
    description:
      'A living laboratory of plants, planets, and tiny creatures, where curiosity is the only tool you need to start exploring.',
    unlockCondition: 'Always unlocked — Verdantia is one of the starting worlds.',
    order: 2,
  },
  {
    domainSlug: 'technology',
    name: 'Circuit City',
    slug: 'circuit-city',
    description:
      'A neon-lit city of code and gadgets, where you build things that actually run — from your first "Hello World" to real working programs.',
    unlockCondition: 'Unlocks after completing at least 1 mission in Numeria or Verdantia.',
    order: 3,
  },
  {
    domainSlug: 'arts',
    name: 'Prisma Isles',
    slug: 'prisma-isles',
    description:
      'A chain of colorful islands where painters, sculptors, and designers gather to turn imagination into something you can see.',
    unlockCondition: 'Unlocks after completing at least 1 mission in Numeria or Verdantia.',
    order: 4,
  },
  {
    domainSlug: 'language',
    name: 'Wordhaven',
    slug: 'wordhaven',
    description:
      'A cozy town built from stories, letters, and conversation, where every word you learn opens a new door.',
    unlockCondition: 'Always unlocked — Wordhaven is one of the starting worlds.',
    order: 5,
  },
  {
    domainSlug: 'engineering',
    name: 'Gearhollow',
    slug: 'gearhollow',
    description:
      'A workshop-world of gears, bridges, and machines, where you design, build, and test your own inventions.',
    unlockCondition: 'Unlocks after completing at least 2 missions across any world.',
    order: 6,
  },
  {
    domainSlug: 'critical-thinking',
    name: 'The Riddle Reach',
    slug: 'the-riddle-reach',
    description:
      'A misty archipelago of logic puzzles and brain-teasers, where the fastest way through is always to think, not guess.',
    unlockCondition: 'Unlocks after completing at least 2 missions across any world.',
    order: 7,
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
