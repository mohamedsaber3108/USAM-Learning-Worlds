import { LearnerContextService } from './learner-context.service';
import { EmbeddingService } from './services/embedding.service';
import { RetrievedContextItem } from './interfaces/learner-context.interface';

/**
 * Unit tests for the RAG retrieval layer (audit T-P2-2):
 *  - semantic-first with graceful fall-through to full-text
 *  - server-side citation validation (rejects fabricated sourceTags)
 */

function makePrisma(): any {
  return { $queryRaw: jest.fn() };
}

describe('LearnerContextService retrieval (RAG)', () => {
  it('falls back to full-text when embeddings are disabled', async () => {
    const prisma = makePrisma();
    // full-text path issues Promise.all([conceptRows, contentItemRows])
    prisma.$queryRaw
      .mockResolvedValueOnce([
        { id: 'c1', title: 'Photosynthesis', snippet: 'plants make food', rank: 0.9 },
      ])
      .mockResolvedValueOnce([]);

    const embeddings = { isEnabled: false } as unknown as EmbeddingService;
    const svc = new LearnerContextService(prisma, embeddings);

    const out = await svc.retrieveGroundingContext('how do plants make food');
    expect(out).toHaveLength(1);
    expect(out[0].sourceTag).toBe('concept:c1');
    // embeddings disabled => no embed() attempt, went straight to full-text
  });

  it('uses semantic results when embeddings return close matches', async () => {
    const prisma = makePrisma();
    // semantic path issues a single $queryRaw returning distance-ranked rows
    prisma.$queryRaw.mockResolvedValueOnce([
      { id: 'c9', title: 'Photosynthesis', snippet: 'how plants eat', distance: 0.12 },
      { id: 'c8', title: 'Unrelated', snippet: 'noise', distance: 0.95 }, // beyond threshold
    ]);

    const embeddings = {
      isEnabled: true,
      embed: jest.fn().mockResolvedValue(new Array(384).fill(0.01)),
      toSqlVector: (v: number[]) => `[${v.join(',')}]`,
    } as unknown as EmbeddingService;

    const svc = new LearnerContextService(prisma, embeddings);
    const out = await svc.retrieveGroundingContext('how do plants eat');

    // only the close match (distance <= 0.6) is kept; full-text never queried
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('c9');
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('validateCitations separates real from fabricated sourceTags', () => {
    const prisma = makePrisma();
    const embeddings = { isEnabled: false } as unknown as EmbeddingService;
    const svc = new LearnerContextService(prisma, embeddings);

    const retrieved: RetrievedContextItem[] = [
      { type: 'concept', id: 'abc-1', title: 'X', snippet: 's', sourceTag: 'concept:abc-1' },
    ];
    const response =
      'As shown in concept:abc-1 this works. See also concept:fake-9 for more.';

    const { valid, fabricated } = svc.validateCitations(response, retrieved);
    expect(valid).toEqual(['concept:abc-1']);
    expect(fabricated).toEqual(['concept:fake-9']);
  });
});
