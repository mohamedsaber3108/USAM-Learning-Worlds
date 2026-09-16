import { ForbiddenException } from '@nestjs/common';
import { LegalComplianceService } from './legal-compliance.service';

/**
 * Unit tests for legal compliance (audit T-P1-13):
 *  - guardianship is enforced on every action
 *  - consent capture writes an audited record
 *  - effective consent reflects the latest record per purpose
 */
describe('LegalComplianceService', () => {
  function make(overrides: Partial<any> = {}) {
    const prisma: any = {
      guardianship: { findFirst: jest.fn() },
      consentRecord: { create: jest.fn(), findMany: jest.fn() },
      dataSubjectRequest: { create: jest.fn(), update: jest.fn() },
      ...overrides,
    };
    const audit = { record: jest.fn().mockResolvedValue(undefined) } as any;
    return { svc: new LegalComplianceService(prisma, audit), prisma, audit };
  }

  it('rejects actions when there is no active guardianship', async () => {
    const { svc, prisma } = make();
    prisma.guardianship.findFirst.mockResolvedValue(null);
    await expect(
      svc.captureConsent({
        guardianId: 'g1',
        learnerId: 'l1',
        purpose: 'AI_PROCESSING' as any,
        granted: true,
        policyVersion: 'v1',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('captures consent and writes an audit record', async () => {
    const { svc, prisma, audit } = make();
    prisma.guardianship.findFirst.mockResolvedValue({ id: 'rel1' });
    prisma.consentRecord.create.mockImplementation(({ data }: any) => ({ id: 'c1', ...data }));

    const rec = await svc.captureConsent({
      guardianId: 'g1',
      learnerId: 'l1',
      purpose: 'AI_PROCESSING' as any,
      granted: true,
      policyVersion: 'v2',
    });

    expect(rec.granted).toBe(true);
    expect(rec.revokedAt).toBeNull();
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CONSENT_GRANTED', targetId: 'l1' }),
    );
  });

  it('reports latest consent per purpose, defaulting missing ones to false', async () => {
    const { svc, prisma } = make();
    prisma.guardianship.findFirst.mockResolvedValue({ id: 'rel1' });
    prisma.consentRecord.findMany.mockResolvedValue([
      { purpose: 'AI_PROCESSING', granted: true, policyVersion: 'v2', grantedAt: new Date('2026-01-02') },
      { purpose: 'AI_PROCESSING', granted: false, policyVersion: 'v1', grantedAt: new Date('2026-01-01') },
    ]);

    const state = await svc.getEffectiveConsent('g1', 'l1');
    const ai = state.find((s) => s.purpose === 'AI_PROCESSING');
    const analytics = state.find((s) => s.purpose === 'ANALYTICS');
    expect(ai?.granted).toBe(true); // latest wins
    expect(ai?.policyVersion).toBe('v2');
    expect(analytics?.granted).toBe(false); // no record => not consented
  });
});
