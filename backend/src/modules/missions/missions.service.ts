import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MasteryService } from '../mastery/mastery.service';
import { ActivityEvaluator } from './evaluators/activity-evaluator';
import { CognitiveLoadService } from '../adaptive/cognitive-load.service';
import { MisconceptionService } from '../misconceptions/misconception.service';
import { InterventionService } from '../interventions/intervention.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProgressionService } from '../gamification/progression.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

@Injectable()
export class MissionsService {
  constructor(
    private prisma: PrismaService,
    private masteryService: MasteryService,
    private activityEvaluator: ActivityEvaluator,
    private cognitiveLoadService: CognitiveLoadService,
    private misconceptionService: MisconceptionService,
    private interventionService: InterventionService,
    private notificationsService: NotificationsService,
    private progressionService: ProgressionService,
    private entitlementsService: EntitlementsService,
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
      // Resume existing run — resuming never counts against the daily cap.
      return this.getMissionRun(existingRun.id);
    }

    // Entitlement gate (G-4): enforce the plan's missionsPerDay cap before
    // creating a NEW run. Paid tiers set missionsPerDay: null (unlimited) so
    // this is a no-op for them; FREE is capped. Throws ForbiddenException when
    // the cap is reached.
    await this.entitlementsService.assertCanStartMission(learnerId);

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
   * Get mission run with progress and activities.
   *
   * SECURITY (audit T-P0-2 / GAP-S2): when called on behalf of a learner
   * request, `ownerLearnerId` MUST be passed so we can verify the run
   * belongs to that learner. Previously this method took only `runId` and
   * was exposed directly at GET /missions/runs/:runId with no ownership
   * check — any authenticated learner could read any other learner's run,
   * attempts, and responses (IDOR). Internal callers that already own the
   * run (e.g. startMission right after creating it) may omit the arg.
   */
  async getMissionRun(runId: string, ownerLearnerId?: string) {
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

    // Ownership enforcement: do not leak another learner's run. Returns the
    // same NotFoundException (not Forbidden) so run IDs can't be probed for
    // existence by a non-owner.
    if (ownerLearnerId && run.learnerId !== ownerLearnerId) {
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
    cognitiveLoadInput?: { hintCount?: number; timeOnTaskSeconds?: number; pauseCount?: number },
  ) {
    // Verify run ownership
    const run = await this.prisma.missionRun.findUnique({
      where: { id: runId },
    });

    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    if (run.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Mission is not in progress');
    }

    // INTEGRITY (audit T-P0-4 / GAP-S2/BE-M2): verify the submitted activity
    // actually belongs to this run's mission before evaluating it. Without
    // this, a learner could submit arbitrary activityIds against any run and
    // inject off-mission mastery evidence.
    const missionActivity = await this.prisma.missionActivity.findUnique({
      where: {
        missionId_activityId: { missionId: run.missionId, activityId },
      },
    });
    if (!missionActivity) {
      throw new BadRequestException(
        'This activity is not part of the mission for this run.',
      );
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
        throw new BadRequestException('This is a summative assessment — it has already been submitted and cannot be retaken in this run.');
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

    // Cognitive Load Engine: best-effort fatigue/pacing signal, never
    // blocks or fails the submission itself.
    if (cognitiveLoadInput) {
      void this.cognitiveLoadService.recordSignal({
        learnerId,
        activityId,
        missionRunId: runId,
        attemptId: attempt.id,
        hintCount: cognitiveLoadInput.hintCount,
        timeOnTaskSeconds: cognitiveLoadInput.timeOnTaskSeconds,
        pauseCount: cognitiveLoadInput.pauseCount,
      });
    }

    // Misconception Engine: on a wrong answer, record the pattern for later
    // review/insight surfacing. Best-effort, never blocks submission.
    if (!evaluation.correct) {
      const wrongAnswerValue =
        typeof response === 'object' && response !== null
          ? (response as any).answer ?? (response as any).value ?? JSON.stringify(response)
          : response;
      void this.misconceptionService.recordWrongAnswer(
        wrongAnswerValue,
        {
          questionTemplateId: activity.generatedFromTemplateId ?? null,
          activityId,
        },
        [activity.title, activity.objective?.name, activity.objective?.competency?.name].filter(
          Boolean,
        ) as string[],
      );
    }

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

      // Intervention Engine: best-effort reactive struggle-pattern check,
      // never blocks submission. Runs AFTER evidence is recorded so the
      // low-mastery trigger sees the just-updated MasteryRecord.
      void this.interventionService.evaluateAfterAttempt(
        learnerId,
        activity.objective.competencyId,
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
      include: {
        mission: {
          include: {
            missionActivities: { include: { activity: true } },
          },
        },
        attempts: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!run || run.learnerId !== learnerId) {
      throw new NotFoundException('Mission run not found');
    }

    if (run.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Mission is not in progress');
    }

    // OUTCOME (audit T-P0-4 / BE-M3): completion is no longer a bare status
    // flip. We verify every REQUIRED activity in the mission has at least one
    // attempt, compute a real score from the best attempt per activity, and
    // decide pass/fail against a mastery threshold. A run cannot be
    // "completed" with required activities left unattempted.
    const requiredActivities = run.mission.missionActivities.filter((ma) => ma.isRequired);

    // Best (highest-score, success-preferred) attempt per activity.
    const bestByActivity = new Map<string, { success: boolean; score: number }>();
    for (const attempt of run.attempts) {
      const prev = bestByActivity.get(attempt.activityId);
      const score = attempt.score ?? (attempt.success ? 100 : 0);
      if (!prev || score > prev.score) {
        bestByActivity.set(attempt.activityId, { success: attempt.success, score });
      }
    }

    const missingRequired = requiredActivities.filter(
      (ma) => !bestByActivity.has(ma.activityId),
    );
    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Cannot complete mission: ${missingRequired.length} required activit${
          missingRequired.length === 1 ? 'y has' : 'ies have'
        } not been attempted yet.`,
      );
    }

    // Final score = mean of best scores across all attempted activities.
    const scores = Array.from(bestByActivity.values()).map((b) => b.score);
    const finalScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const passed = finalScore >= 60; // mastery threshold for a mission pass

    // Persist the computed outcome on the run.
    await this.prisma.missionRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Award XP idempotently (awardXP is a no-op if already granted for this
    // run). XP scales with score; only on a pass.
    let xpAward: any = { awarded: false };
    if (passed) {
      const xpAmount = 50 + Math.round(finalScore / 2); // 80–100 for a pass
      try {
        xpAward = await this.progressionService.awardXP(
          learnerId,
          xpAmount,
          'MISSION_COMPLETE',
          runId,
          `Completed mission: ${run.mission.title}`,
        );
      } catch {
        xpAward = { awarded: false, error: true };
      }
    }

    // Notification Engine: real mission-count milestone trigger.
    // Best-effort — never blocks mission completion.
    void this.prisma.missionRun
      .count({ where: { learnerId, status: 'COMPLETED' } })
      .then((completedCount) => this.notificationsService.emitMissionMilestone(learnerId, completedCount))
      .catch(() => undefined);

    return {
      success: true,
      message: passed ? 'Mission completed!' : 'Mission finished — keep practicing to master it!',
      outcome: {
        finalScore,
        passed,
        requiredActivities: requiredActivities.length,
        activitiesAttempted: bestByActivity.size,
        xp: xpAward,
      },
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
      throw new BadRequestException(`Invalid assessment purpose: ${purpose}`);
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
   * Bloom Engine v1 (manual-tagging slice — see gap matrix "Bloom Engine"
   * row). Filters activities by the manually-tagged `bloomLevel` column.
   * This is the real, small, honest read half that the schema comment
   * next to `Activity.bloomLevel` promised but the API never shipped
   * until this pass — data existed, this endpoint did not.
   */
  async getActivitiesByBloomLevel(level: string) {
    const normalized = level.toUpperCase();
    const validLevels = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];
    if (!validLevels.includes(normalized)) {
      throw new BadRequestException(`Invalid Bloom level: ${level}`);
    }

    return this.prisma.activity.findMany({
      where: { bloomLevel: normalized as any, isActive: true },
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

  // ============================================
  // Admin CRUD (CMS/Authoring Engine v1 — Mission
  // content type only; see gap matrix CMS row).
  // Thin wrappers over the same Mission model the
  // learner-facing read paths above already use —
  // no separate business logic, just create/update/
  // delete so an admin can author Missions without a
  // seed script.
  // ============================================

  /**
   * List all missions for the admin authoring UI,
   * including inactive ones (unlike getMissions()
   * above, which filters isActive:true for learners).
   */
  async adminListMissions() {
    return this.prisma.mission.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async adminGetMission(missionId: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  async createMission(data: {
    title: string;
    description: string;
    type: string;
    estimatedMinutes?: number;
    order?: number;
    isActive?: boolean;
    worldId?: string;
  }) {
    return this.prisma.mission.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type as any,
        estimatedMinutes: data.estimatedMinutes,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
        worldId: data.worldId,
      },
    });
  }

  async updateMission(
    missionId: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      estimatedMinutes?: number;
      order?: number;
      isActive?: boolean;
      worldId?: string;
    },
  ) {
    await this.adminGetMission(missionId);
    return this.prisma.mission.update({
      where: { id: missionId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.estimatedMinutes !== undefined && {
          estimatedMinutes: data.estimatedMinutes,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.worldId !== undefined && { worldId: data.worldId }),
      },
    });
  }

  async deleteMission(missionId: string) {
    await this.adminGetMission(missionId);
    return this.prisma.mission.delete({ where: { id: missionId } });
  }
}
