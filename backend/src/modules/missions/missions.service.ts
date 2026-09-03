import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MasteryService } from '../mastery/mastery.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';

@Injectable()
export class MissionsService {
  constructor(
    private prisma: PrismaService,
    private masteryService: MasteryService,
    private activityEvaluator: ActivityEvaluator,
  ) {}

  /**
   * Browse available missions
   */
  async getMissions() {
    return this.prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get mission details with activities
   */
  async getMission(missionId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        missionActivities: {
          include: {
            activity: {
              include: {
                objective: {
                  include: {
                    competency: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const activities = mission.missionActivities.map((ma) => ({
      ...ma.activity,
      missionOrder: ma.order,
      isRequired: ma.isRequired,
    }));

    return { ...mission, activities };
  }

  /**
   * Start a mission (or resume if in progress)
   */
  async startMission(learnerId: string, missionId: string) {
    // Check if mission exists
    const mission = await this.getMission(missionId);

    // Check for existing run
    const existingRun = await this.prisma.missionRun.findFirst({
      where: {
        learnerId,
        missionId,
        status: 'IN_PROGRESS',
      },
    });

    if (existingRun) {
      // Resume existing run
      return this.getMissionRun(existingRun.id);
    }

    // Create new run
    const run = await this.prisma.missionRun.create({
      data: {
        learnerId,
        missionId,
        status: 'IN_PROGRESS',
        currentStageIndex: 0,
      },
    });

    return this.getMissionRun(run.id);
  }

  /**
   * Get mission run with progress and activities
   */
  async getMissionRun(runId: string) {
    const run = await this.prisma.missionRun.findUnique({
      where: { id: runId },
      include: {
        mission: {
          include: {
            missionActivities: {
              include: {
                activity: {
                  include: {
                    objective: {
                      include: {
                        competency: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        attempts: {
          include: {
            activity: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Mission run not found');
    }

    const activities = run.mission.missionActivities.map((ma) => ({
      ...ma.activity,
      missionOrder: ma.order,
      isRequired: ma.isRequired,
    }));

    return {
      ...run,
      mission: { ...run.mission, activities },
    };
  }

  /**
   * Submit activity response
   */
  async submitActivity(
    learnerId: string,
    runId: string,
    activityId: string,
    response: any,
  ) {
    // Verify run ownership
    const run = await this.prisma.missionRun.findUnique({
      where: { id: runId },
    });

    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    if (run.status !== 'IN_PROGRESS') {
      throw new Error('Mission is not in progress');
    }

    // Get activity
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        objective: {
          include: {
            competency: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // SUMMATIVE activities are a final graded check — once a learner has a
    // recorded attempt for this run+activity, they cannot resubmit and
    // overwrite it (closes the "no diagnostic/formative/summative typing"
    // gap: summative now behaves differently from formative, not just a
    // label).
    if (activity.assessmentPurpose === 'SUMMATIVE') {
      const existingSummativeAttempt = await this.prisma.activityAttempt.findFirst({
        where: { runId, activityId },
      });
      if (existingSummativeAttempt) {
        throw new Error('This is a summative assessment — it has already been submitted and cannot be retaken in this run.');
      }
    }

    // Evaluate response
    const evaluation = this.activityEvaluator.evaluate(
      activity.type,
      activity.content,
      response,
    );

    // Record attempt
    const attempt = await this.prisma.activityAttempt.create({
      data: {
        runId,
        activityId,
        response,
        success: evaluation.correct,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    });

    // DIAGNOSTIC activities inform placement/starting point but should not
    // themselves move a learner's mastery state — they establish where the
    // learner already is, not what they just learned. FORMATIVE and
    // SUMMATIVE both count as real evidence, but SUMMATIVE is weighted
    // higher since it's a final check of the objective.
    if (activity.assessmentPurpose !== 'DIAGNOSTIC') {
      const evidenceType = this.activityEvaluator.getEvidenceType(activity.type);
      const weightedScore =
        activity.assessmentPurpose === 'SUMMATIVE' && evaluation.score != null
          ? Math.min(100, evaluation.score * 1.15)
          : evaluation.score;

      await this.masteryService.recordEvidence(
        learnerId,
        activity.objective.competencyId,
        evidenceType as any,
        evaluation.correct,
        weightedScore,
        {
          activityId,
          attemptId: attempt.id,
          assessmentPurpose: activity.assessmentPurpose,
        },
        attempt.id,
      );
    }

    return {
      attempt,
      evaluation,
      activity: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        assessmentPurpose: activity.assessmentPurpose,
      },
      diagnosticOnly: activity.assessmentPurpose === 'DIAGNOSTIC',
    };
  }

  /**
   * Complete mission
   */
  async completeMission(learnerId: string, runId: string) {
    const run = await this.prisma.missionRun.findUnique({
      where: { id: runId },
    });

    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    if (run.status !== 'IN_PROGRESS') {
      throw new Error('Mission is not in progress');
    }

    // Update run status
    await this.prisma.missionRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Mission completed!',
    };
  }

  /**
   * Browse activities filtered by assessment purpose (diagnostic /
   * formative / summative) — closes the Assessment Engine gap: there was
   * no way to distinguish placement checks from graded final checks.
   */
  async getActivitiesByAssessmentPurpose(purpose: string) {
    const normalized = purpose.toUpperCase();
    if (!['DIAGNOSTIC', 'FORMATIVE', 'SUMMATIVE'].includes(normalized)) {
      throw new Error(`Invalid assessment purpose: ${purpose}`);
    }

    return this.prisma.activity.findMany({
      where: { assessmentPurpose: normalized as any, isActive: true },
      include: {
        objective: {
          include: { competency: { select: { id: true, name: true } } },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get learner's mission history
   */
  async getMissionHistory(learnerId: string) {
    return this.prisma.missionRun.findMany({
      where: { learnerId },
      include: {
        mission: true,
        attempts: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }
}
