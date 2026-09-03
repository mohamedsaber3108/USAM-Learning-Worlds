/**
 * Reflection Prompt Seeding — Metacognition Engine
 *
 * Seeds ReflectionPrompt with a small, reusable bank of quick-reflection
 * questions shown to learners after mission completion (see
 * MissionCompletePage.tsx). Kept deliberately short and kid-friendly —
 * this is a lightweight metacognition nudge, not a survey.
 */

import { PrismaClient, ReflectionPromptKind } from '@prisma/client';

const reflectionPrompts = [
  {
    text: 'How did that feel?',
    kind: ReflectionPromptKind.FEELING,
    order: 1,
  },
  {
    text: 'What was tricky?',
    kind: ReflectionPromptKind.DIFFICULTY,
    order: 2,
  },
  {
    text: 'What helped you get through it?',
    kind: ReflectionPromptKind.STRATEGY,
    order: 3,
  },
];

/**
 * Exported so it can be called from the main seed orchestrator
 * (backend/prisma/seed.ts) in addition to running standalone. Previously
 * this file only had a bare `main()` bottom-of-file invocation with no
 * export, so it was never actually wired into `npm run seed` /
 * `npm run prisma:seed` — a fresh database would have zero
 * ReflectionPrompt rows unless someone manually ran
 * `ts-node prisma/seeds/seed-reflection-prompts.ts` directly. Fixed here.
 */
export async function seedReflectionPrompts(prisma: PrismaClient) {
  console.log('Seeding ReflectionPrompt...');
  for (const prompt of reflectionPrompts) {
    const existing = await prisma.reflectionPrompt.findFirst({ where: { text: prompt.text } });
    if (existing) {
      await prisma.reflectionPrompt.update({ where: { id: existing.id }, data: prompt });
    } else {
      await prisma.reflectionPrompt.create({ data: prompt });
    }
  }
  console.log(`Seeded ${reflectionPrompts.length} ReflectionPrompt rows.`);
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedReflectionPrompts(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
