/**
 * Concept embedding backfill (audit T-P2-2 / pgvector RAG).
 *
 * WHAT THIS IS:
 * Populates `concepts.embedding` (vector(384)) for every active Concept that
 * doesn't yet have one, using the SAME local all-MiniLM-L6-v2 model
 * (EmbeddingService) that query-time semantic retrieval uses — so document
 * and query embeddings live in the same space. Until concepts are embedded,
 * LearnerContextService.semanticRetrieve returns nothing and grounding
 * transparently falls back to full-text search; this script "turns on" the
 * semantic path by filling the column.
 *
 * SAFE TO RE-RUN: only rows with a NULL embedding are processed, so running
 * it again after adding new curriculum concepts just embeds the new ones.
 * If the embedding model can't load (offline/native dep), the script reports
 * that and exits without touching the DB (retrieval keeps using full-text).
 *
 * HOW TO RUN:
 *   cd backend
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-concept-embeddings.ts
 * or:
 *   npm run embeddings:backfill
 *
 * The vector column is managed via raw SQL (not Prisma schema), so writes use
 * $executeRaw with a ::vector cast.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { EmbeddingService } from '../src/modules/ai/services/embedding.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const prisma = app.get(PrismaService);
    const embeddings = app.get(EmbeddingService);

    // Fetch active concepts missing an embedding. The vector column isn't in
    // the Prisma schema, so we select via raw SQL (embedding IS NULL filter).
    const rows = await prisma.$queryRaw<
      Array<{ id: string; name: string; description: string | null }>
    >`
      SELECT c.id, c.name, c.description
      FROM concepts c
      WHERE c."isActive" = true AND c."embedding" IS NULL
      ORDER BY c."createdAt" ASC
    `;

    if (rows.length === 0) {
      console.log('[backfill] No concepts need embedding. Nothing to do.');
      return;
    }

    console.log(`[backfill] ${rows.length} concept(s) to embed...`);

    let done = 0;
    let failed = 0;
    for (const row of rows) {
      const text = embeddings.conceptEmbeddingText(row.name, row.description);
      const vector = await embeddings.embed(text);

      if (!vector) {
        failed++;
        // If the very first embed returns null, the model is unavailable —
        // stop early rather than spinning through the whole table.
        if (done === 0) {
          console.error(
            '[backfill] Embedding model unavailable — aborting without changes. ' +
              'Semantic retrieval will keep falling back to full-text search.',
          );
          break;
        }
        continue;
      }

      const literal = embeddings.toSqlVector(vector);
      await prisma.$executeRaw`
        UPDATE concepts SET "embedding" = ${literal}::vector WHERE id = ${row.id}
      `;
      done++;
      if (done % 25 === 0) {
        console.log(`[backfill] ${done}/${rows.length} embedded...`);
      }
    }

    console.log(`[backfill] Complete. Embedded=${done} Failed=${failed}`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[backfill] Fatal error:', err);
  process.exit(1);
});
