import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { LearningController } from './learning.controller';

/**
 * Regression test for a real authorization gap found during the
 * owner-mandated reconciliation audit (2026-10-02): LearningController's
 * curriculum-graph mutation routes (prerequisite add/remove at both the
 * Concept and Competency level, plus age-variant authoring) were guarded
 * by class-level JwtAuthGuard only — ANY authenticated LEARNER could
 * rewrite the prerequisite graph or author age-adapted content, actions
 * with no legitimate learner use case (same risk class as a learner being
 * able to call admin-missions' create/update/delete).
 *
 * Fixed by adding method-level `@UseGuards(RolesGuard)` + `@Roles(ADMIN)`,
 * the same declarative pattern already used by every other authoring
 * controller (admin-missions.controller.ts, community.controller.ts's
 * moderation routes). This test asserts the 'roles' reflection metadata
 * is actually present on each previously-unguarded method, so a future
 * refactor cannot silently drop the decorator without a test failing.
 */
describe('LearningController — curriculum-authoring authorization (reconciliation audit)', () => {
  const reflector = new Reflector();

  const mutationMethods: Array<keyof LearningController> = [
    'addPrerequisite',
    'removePrerequisite',
    'addCompetencyPrerequisite',
    'removeCompetencyPrerequisite',
    'createAgeVariant',
  ];

  it.each(mutationMethods)('%s requires the ADMIN role via @Roles metadata', (methodName) => {
    const handler = LearningController.prototype[methodName];
    expect(handler).toBeDefined();
    const roles = reflector.get<Role[]>('roles', handler);
    expect(roles).toBeDefined();
    expect(roles).toContain(Role.ADMIN);
  });

  // Read-only learner-facing routes must NOT have been accidentally
  // locked behind ADMIN by an over-broad fix.
  const learnerReadMethods: Array<keyof LearningController> = [
    'getConcepts',
    'getConcept',
    'getPrerequisiteChain',
    'getUnlockStatus',
    'getCompetencyPrerequisiteChain',
    'getCompetencyUnlockStatus',
  ];

  it.each(learnerReadMethods)('%s remains open to any authenticated role (no @Roles restriction)', (methodName) => {
    const handler = LearningController.prototype[methodName];
    expect(handler).toBeDefined();
    const roles = reflector.get<Role[]>('roles', handler);
    expect(roles).toBeUndefined();
  });
});
