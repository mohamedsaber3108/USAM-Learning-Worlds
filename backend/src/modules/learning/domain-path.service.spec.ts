import { DomainPathService } from './services/domain-path.service';

/**
 * DomainPathService is the GENERIC path projection shared by every domain
 * (backing GET /learning/domains/:slug/path and the /english/path shim).
 * These tests prove it is domain-agnostic: it derives the first reachable
 * mission per competency, merges the learner's mastery, and decorates CEFR
 * from a linked strand ONLY when present — with no English-specific branching.
 */
describe('DomainPathService — generic canonical-spine projection', () => {
  function makeDomain(slug: string, opts: { withStrand?: boolean } = {}) {
    return {
      id: `dom-${slug}`,
      name: slug,
      slug,
      skills: [
        {
          id: 'skill1',
          name: 'Skill One',
          slug: `${slug}-skill-one`,
          competencies: [
            {
              id: `${slug}-comp-1`,
              name: 'Competency One',
              description: 'desc',
              strand: opts.withStrand ? { cefrLevel: 'A1', strandType: 'VOCABULARY' } : null,
              objectives: [
                {
                  activities: [
                    { missionActivities: [{ mission: { id: `${slug}-mission-1`, title: 'Mission One' } }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  function makeService(domain: any, mastery: any[] = []) {
    const prisma: any = {
      domain: { findUnique: jest.fn().mockResolvedValue(domain) },
      masteryRecord: { findMany: jest.fn().mockResolvedValue(mastery) },
    };
    return { svc: new DomainPathService(prisma), prisma };
  }

  it('projects skills → competencies → first reachable mission for ANY domain slug', async () => {
    const { svc } = makeService(makeDomain('coding'));
    const path = await svc.getPath('coding', 'LEARNER');

    expect(path.domain?.slug).toBe('coding');
    const comp = path.skills[0].competencies[0];
    expect(comp.missionId).toBe('coding-mission-1');
    expect(comp.missionTitle).toBe('Mission One');
    // No strand → no CEFR decoration (generic, not English-only).
    expect(comp.cefrLevel).toBeNull();
    expect(comp.strandType).toBeNull();
  });

  it('decorates CEFR/strandType from a linked strand when present (English)', async () => {
    const { svc } = makeService(makeDomain('english', { withStrand: true }));
    const path = await svc.getPath('english', 'LEARNER');
    const comp = path.skills[0].competencies[0];
    expect(comp.cefrLevel).toBe('A1');
    expect(comp.strandType).toBe('VOCABULARY');
  });

  it('merges the learner mastery state and defaults missing to NOT_STARTED', async () => {
    const { svc } = makeService(makeDomain('coding'), [
      { competencyId: 'coding-comp-1', state: 'DEVELOPING', confidence: 0.72 },
    ]);
    const path = await svc.getPath('coding', 'LEARNER');
    expect(path.skills[0].competencies[0].masteryState).toBe('DEVELOPING');
    expect(path.skills[0].competencies[0].confidence).toBeCloseTo(0.72);
  });

  it('returns NOT_STARTED / 0 confidence for an anonymous (no learner) request', async () => {
    const { svc, prisma } = makeService(makeDomain('coding'));
    const path = await svc.getPath('coding', null);
    // No mastery lookup when there is no learner.
    expect(prisma.masteryRecord.findMany).not.toHaveBeenCalled();
    expect(path.skills[0].competencies[0].masteryState).toBe('NOT_STARTED');
    expect(path.skills[0].competencies[0].confidence).toBe(0);
  });

  it('returns an empty path for an unknown domain slug', async () => {
    const { svc } = makeService(null);
    const path = await svc.getPath('does-not-exist', 'LEARNER');
    expect(path.domain).toBeNull();
    expect(path.skills).toEqual([]);
  });
});
