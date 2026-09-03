/**
 * AI Memory Governance: manual purge queries (missing-wave2-cluster-5).
 *
 * `LearnerContext.retentionDays` (default 90) and
 * `ConversationMessage.retentionDays` (default 180) mark how long each
 * row may be retained before it is eligible for deletion. This file
 * documents the manual purge SQL; a scheduled job (e.g. a cron-invoked
 * `ts-node prisma/scripts/purge-expired-ai-memory.ts`, or a psql cron
 * entry running the same SQL) can run it periodically. Not wired into
 * an automatic in-process scheduler yet (no @nestjs/schedule dependency
 * exists in package.json today - adding a new runtime dependency for
 * this was judged out of scope for the "small, real" version of this
 * gap; the query below is the real, run-able retention mechanism).
 *
 * Run manually via:
 *   npx ts-node prisma/scripts/purge-expired-ai-memory.ts
 * or wire into a system cron / pm2 cron_restart calling this script.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const learnerContextResult = await prisma.$executeRawUnsafe(`
    DELETE FROM "learner_contexts"
    WHERE "generatedAt" < NOW() - ("retentionDays" || ' days')::interval
  `);

  const conversationMessageResult = await prisma.$executeRawUnsafe(`
    DELETE FROM "conversation_messages"
    WHERE "createdAt" < NOW() - ("retentionDays" || ' days')::interval
  `);

  console.log(`Purged ${learnerContextResult} expired learner_contexts row(s).`);
  console.log(`Purged ${conversationMessageResult} expired conversation_messages row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
