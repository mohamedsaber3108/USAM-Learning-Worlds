/**
 * Reflection Prompt Seeding — Metacognition Engine
 *
 * Seeds ReflectionPrompt with a small, reusable bank of quick-reflection
 * questions shown to learners after mission completion (see
 * MissionCompletePage.tsx). Kept deliberately short and kid-friendly —
 * this is a lightweight metacognition nudge, not a survey.
 */

import { PrismaClient, ReflectionPromptKind } from '@prisma/client';

const prisma = new PrismaClient();

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

async function main() {
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
