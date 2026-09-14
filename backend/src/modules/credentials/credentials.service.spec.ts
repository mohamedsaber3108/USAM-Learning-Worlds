import { CredentialsService } from './credentials.service';

/**
 * Unit tests for the evidence->credential chain (audit T-P1-6):
 *  - threshold gating (confidence + evidence count)
 *  - idempotency (already-held credential isn't reissued)
 *  - Open Badges 3.0 document shape
 */
describe('CredentialsService', () => {
  function makeService(overrides: Partial<any> = {}) {
    const prisma: any = {
      credentialDefinition: { findUnique: jest.fn() },
      credential: { findUnique: jest.fn(), create: jest.fn() },
      learner: { findUnique: jest.fn() },
      ...overrides,
    };
    return { svc: new CredentialsService(prisma), prisma };
  }

  const definition = {
    id: 'def-1',
    competencyId: 'comp-1',
    name: 'Loops Explorer',
    description: 'Understands loops',
    criteria: 'Complete 3 loop missions',
    imageUrl: null,
    minConfidence: 0.85,
    minEvidence: 3,
    isActive: true,
  };

  it('does not issue below the confidence threshold', async () => {
    const { svc, prisma } = makeService();
    prisma.credentialDefinition.findUnique.mockResolvedValue(definition);
    const out = await svc.maybeIssueForMastery('learner-1', 'comp-1', 0.5, 10);
    expect(out).toBeNull();
    expect(prisma.credential.create).not.toHaveBeenCalled();
  });

  it('does not issue below the evidence-count threshold', async () => {
    const { svc, prisma } = makeService();
    prisma.credentialDefinition.findUnique.mockResolvedValue(definition);
    const out = await svc.maybeIssueForMastery('learner-1', 'comp-1', 0.95, 1);
    expect(out).toBeNull();
    expect(prisma.credential.create).not.toHaveBeenCalled();
  });

  it('does not reissue an already-held credential', async () => {
    const { svc, prisma } = makeService();
    prisma.credentialDefinition.findUnique.mockResolvedValue(definition);
    prisma.credential.findUnique.mockResolvedValue({ id: 'existing' });
    const out = await svc.maybeIssueForMastery('learner-1', 'comp-1', 0.95, 5);
    expect(out).toBeNull();
    expect(prisma.credential.create).not.toHaveBeenCalled();
  });

  it('issues a valid Open Badges 3.0 credential when thresholds are met', async () => {
    const { svc, prisma } = makeService();
    prisma.credentialDefinition.findUnique.mockResolvedValue(definition);
    prisma.credential.findUnique.mockResolvedValue(null);
    prisma.learner.findUnique.mockResolvedValue({
      id: 'learner-1',
      displayName: 'Nova',
    });
    prisma.credential.create.mockImplementation(({ data }: any) => ({ id: 'cred-1', ...data }));

    const out: any = await svc.maybeIssueForMastery('learner-1', 'comp-1', 0.95, 5);

    expect(prisma.credential.create).toHaveBeenCalledTimes(1);
    expect(out.confidence).toBe(0.95);
    expect(out.evidenceCount).toBe(5);

    const badge = out.assertionJson;
    expect(badge.type).toContain('OpenBadgeCredential');
    expect(badge['@context'][0]).toContain('w3.org/ns/credentials');
    expect(badge.credentialSubject.achievement.name).toBe('Loops Explorer');
    expect(badge.credentialSubject.name).toBe('Nova');
    expect(badge.credentialSubject.achievement.criteria.narrative).toBe(
      'Complete 3 loop missions',
    );
  });
});
