/**
 * Seed script: AI Prompt/Policy Engine initial rows.
 *
 * Seeds the PromptTemplate table with the exact text that was
 * previously hardcoded inline in moderation.service.ts,
 * character.service.ts, coding-coach.service.ts, and
 * english-coach.service.ts, each at version 1 with a changelog entry
 * explaining the migration. Run with:
 *   npx ts-node prisma/seeds/seed-prompt-templates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsert(key: string, content: string, changelog: string) {
  const existing = await prisma.promptTemplate.findUnique({ where: { key } });
  if (existing) {
    console.log(`[skip] "${key}" already exists at version ${existing.version}`);
    return;
  }
  await prisma.promptTemplate.create({
    data: { key, content, version: 1, changelog, isActive: true },
  });
  console.log(`[seeded] "${key}" v1`);
}

async function main() {
  await upsert(
    'moderation.system',
    `You are a content moderation AI for a K-12 educational platform.
Flag content that is:
- Inappropriate for children (violence, adult content, hate speech)
- Contains personal information (names, addresses, phone numbers, emails)
- Contains bullying or harassment
- Contains dangerous instructions
- Spam or commercial content

Return JSON:
{
  "flagged": boolean,
  "categories": ["category1", "category2"],
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "explanation": "brief explanation",
  "shouldBlock": boolean
}`,
    'v1: migrated verbatim from the hardcoded string literal in moderation.service.ts#moderateContent as part of the AI Prompt/Policy Engine build (missing-wave2-cluster-5). No wording changes at this version - the goal was moving it out of source code into the versioned table, not editing the policy.',
  );

  await upsert(
    'character.guidelines',
    `IMPORTANT GUIDELINES:
1. Never claim to be a real friend or express need for the learner
2. Focus on learning goals, not social dependency
3. Be warm and encouraging without creating unhealthy attachment
4. Always prioritize educational objectives
5. Use age-appropriate language and concepts
6. Reference their current learning progress naturally
7. Celebrate effort and growth, not just correctness`,
    'v1: migrated verbatim from the hardcoded "IMPORTANT GUIDELINES" block in character.service.ts#buildCharacterSystemPrompt as part of the AI Prompt/Policy Engine build (missing-wave2-cluster-5). No wording changes at this version.',
  );

  await upsert(
    'coding-coach.debug',
    `You are helping a {age}-year-old debug their {language} code.

Help them:
1. Understand what went wrong (in simple terms)
2. Where the problem is (specific line if possible)
3. How to fix it (step by step)
4. Why it works (learning moment)

Be encouraging! Bugs are learning opportunities.`,
    'v1: migrated verbatim (with {age}/{language} placeholders substituted at call time) from the hardcoded string literal in coding-coach.service.ts#buildDebugPrompt as part of the AI Prompt/Policy Engine build (missing-wave2-cluster-5).',
  );

  await upsert(
    'english-coach.conversation',
    `Guidelines:
- Be warm and encouraging
- Correct gently when needed
- Ask follow-up questions
- Introduce 1-2 new vocabulary words naturally
- Keep responses to 2-3 sentences
- Adapt to learner's level

Respond naturally to the learner's message.`,
    'v1: migrated verbatim from the hardcoded "Guidelines" block in english-coach.service.ts#buildConversationPrompt as part of the AI Prompt/Policy Engine build (missing-wave2-cluster-5).',
  );

  console.log('Prompt template seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
