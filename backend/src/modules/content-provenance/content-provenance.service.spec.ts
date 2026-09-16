import { ContentProvenanceService } from './content-provenance.service';

/**
 * Unit tests for content provenance compliance (audit T-P1-7).
 */
describe('ContentProvenanceService.checkCompliance', () => {
  function makeService(contentItem: any) {
    const prisma: any = {
      contentItem: { findUnique: jest.fn().mockResolvedValue(contentItem) },
    };
    return new ContentProvenanceService(prisma);
  }

  it('treats first-party AI content with no source as compliant', async () => {
    const svc = makeService({ id: 'c1', sourceType: 'AI_GENERATED', source: null });
    const r = await svc.checkCompliance('c1');
    expect(r.compliant).toBe(true);
    expect(r.issues).toHaveLength(0);
  });

  it('flags externally-sourced content with no license', async () => {
    const svc = makeService({
      id: 'c2',
      sourceType: 'HUMAN_AUTHORED',
      source: { attribution: 'X', license: null },
    });
    const r = await svc.checkCompliance('c2');
    expect(r.compliant).toBe(false);
    expect(r.issues[0]).toMatch(/no license/i);
  });

  it('flags a non-commercial license', async () => {
    const svc = makeService({
      id: 'c3',
      sourceType: 'HUMAN_AUTHORED',
      source: {
        attribution: 'Author X',
        license: { spdxId: 'CC-BY-NC-4.0', commercialUse: false, requiresAttribution: true },
      },
    });
    const r = await svc.checkCompliance('c3');
    expect(r.compliant).toBe(false);
    expect(r.issues.some((i) => /commercial use/i.test(i))).toBe(true);
  });

  it('requires attribution text when the license demands it', async () => {
    const svc = makeService({
      id: 'c4',
      sourceType: 'HUMAN_AUTHORED',
      source: {
        attribution: null,
        license: { spdxId: 'CC-BY-4.0', commercialUse: true, requiresAttribution: true },
      },
    });
    const r = await svc.checkCompliance('c4');
    expect(r.compliant).toBe(false);
    expect(r.issues.some((i) => /attribution/i.test(i))).toBe(true);
  });

  it('passes a commercial, properly-attributed source', async () => {
    const svc = makeService({
      id: 'c5',
      sourceType: 'HUMAN_AUTHORED',
      source: {
        attribution: 'From Project Gutenberg',
        license: { spdxId: 'CC0-1.0', commercialUse: true, requiresAttribution: true },
      },
    });
    const r = await svc.checkCompliance('c5');
    expect(r.compliant).toBe(true);
    expect(r.attributionText).toBe('From Project Gutenberg');
  });
});
