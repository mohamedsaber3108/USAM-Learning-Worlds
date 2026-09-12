import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MissionsService } from './missions.service';

/**
 * Regression tests for the mission-run ownership (IDOR) fix (T-P0-2) and the
 * mission-completion integrity/outcome fix (T-P0-4). Prisma is stubbed; these
 * assert the ownership/outcome LOGIC, not the database.
 */
function makeService(prisma: any, progression?: any) {
  return new MissionsService(
    prisma,
    {} as any, // masteryService
    {} as any, // activityEvaluator
    {} as any, // cognitiveLoadService
    {} as any, // misconceptionService
    {} as any, // interventionService
    { emitMissionMilestone: jest.fn() } as any, // notificationsService
    progression ?? ({ awardXP: jest.fn().mockResolvedValue({ awarded: true }) } as any),
  );
}

describe('MissionsService.getMissionRun — ownership (T-P0-2)', () => {
  it('throws NotFound when the run belongs to another learner', async () => {
    const prisma = {
      missionRun: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'run1',
          learnerId: 'OTHER_LEARNER',
          mission: { missionActivities: [] },
          attempts: [],
        }),
      },
    } as any;
    const service = makeService(prisma);
    await expect(service.getMissionRun('run1', 'ME')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns the run when the owner matches', async () => {
    const prisma = {
      missionRun: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'run1',
          learnerId: 'ME',
          mission: { missionActivities: [] },
          attempts: [],
        }),
      },
    } as any;
    const service = makeService(prisma);
    const run = await service.getMissionRun('run1', 'ME');
    expect(run.id).toBe('run1');
  });
});

describe('MissionsService.completeMission — outcome integrity (T-P0-4)', () => {
  it('blocks completion when a required activity has no attempt', async () => {
    const prisma = {
      missionRun: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'run1',
          learnerId: 'ME',
          status: 'IN_PROGRESS',
          mission: {
            title: 'M',
            missionActivities: [
              { activityId: 'a1', isRequired: true, activity: { id: 'a1' } },
            ],
          },
          attempts: [], // nothing attempted
        }),
      },
    } as any;
    const service = makeService(prisma);
    await expect(service.completeMission('ME', 'run1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('completes, computes finalScore, and awards XP when required activities passed', async () => {
    const awardXP = jest.fn().mockResolvedValue({ awarded: true, amount: 90 });
    const prisma = {
      missionRun: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'run1',
          learnerId: 'ME',
          status: 'IN_PROGRESS',
          missionId: 'm1',
          mission: {
            title: 'M',
            missionActivities: [
              { activityId: 'a1', isRequired: true, activity: { id: 'a1' } },
            ],
          },
          attempts: [{ activityId: 'a1', success: true, score: 100 }],
        }),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(1),
      },
    } as any;
    const service = makeService(prisma, { awardXP });
    const result = await service.completeMission('ME', 'run1');
    expect(result.success).toBe(true);
    expect(result.outcome.finalScore).toBe(100);
    expect(result.outcome.passed).toBe(true);
    expect(awardXP).toHaveBeenCalledWith('ME', expect.any(Number), 'MISSION_COMPLETE', 'run1', expect.any(String));
  });
});
