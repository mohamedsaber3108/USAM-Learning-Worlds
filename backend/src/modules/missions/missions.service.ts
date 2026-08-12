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
   * Get mission details
   */
  async getMission(missionId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    return mission;
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
   * Get mission run with progress
   */
  async getMissionRun(runId: string) {
    const run = await this.prisma.missionRun.findUnique({
      where: { id: runId },
      include: {
        mission: true,
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

    return run;
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

    // Record evidence for mastery tracking
    const evidenceType = this.activityEvaluator.getEvidenceType(activity.type);
    await this.masteryService.recordEvidence(
      learnerId,
      activity.objective.competencyId,
      evidenceType as any,
      evaluation.correct,
      evaluation.score,
      { activityId, attemptId: attempt.id },
      attempt.id,
    );

    return {
      attempt,
      evaluation,
      activity: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
      },
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
