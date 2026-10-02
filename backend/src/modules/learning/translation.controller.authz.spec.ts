import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { TranslationController } from './translation.controller';

/**
 * Regression test for a real authorization gap found during the
 * owner-mandated reconciliation audit (2026-10-02): TranslationController's
 * write/approve routes (upsert, batch upsert, human-approval toggle) were
 * guarded by class-level JwtAuthGuard only — ANY authenticated learner
 * could rewrite arbitrary entity translations or mark one human-approved,
 * a content-authoring/QA action with no legitimate learner use case.
 *
 * Fixed with the same declarative RolesGuard + @Roles(ADMIN) pattern used
 * by every other authoring controller. This test pins the 'roles'
 * reflection metadata on each previously-unguarded method.
 */
describe('TranslationController — write/approve authorization (reconciliation audit)', () => {
  const reflector = new Reflector();

  const mutationMethods: Array<keyof TranslationController> = [
    'upsertTranslation',
    'batchUpsertTranslations',
    'setApproval',
  ];

  it.each(mutationMethods)('%s requires the ADMIN role via @Roles metadata', (methodName) => {
    const handler = TranslationController.prototype[methodName];
    expect(handler).toBeDefined();
    const roles = reflector.get<Role[]>('roles', handler);
    expect(roles).toBeDefined();
    expect(roles).toContain(Role.ADMIN);
  });

  const readMethods: Array<keyof TranslationController> = [
    'getSupportedLanguages',
    'getApprovalStats',
    'getEntityTranslations',
    'getTranslation',
  ];

  it.each(readMethods)('%s remains open to any authenticated role (no @Roles restriction)', (methodName) => {
    const handler = TranslationController.prototype[methodName];
    expect(handler).toBeDefined();
    const roles = reflector.get<Role[]>('roles', handler);
    expect(roles).toBeUndefined();
  });
});
