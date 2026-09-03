import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QuestionType } from '@prisma/client';

/**
 * Question Engine
 *
 * QuestionTemplate is the reusable, curriculum-linked question definition
 * (MCQ / FILL_BLANK / DRAG_DROP). The generator endpoint composes a real
 * Activity (existing missions/Activity model, type SELECT) from a template
 * so generated questions flow through the exact same mission-delivery and
 * mastery-evidence pipeline as hand-authored activities — no parallel
 * delivery system.
 */
@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async listTemplates(objectiveId?: string, type?: QuestionType) {
    return this.prisma.questionTemplate.findMany({
      where: {
        isActive: true,
        ...(objectiveId ? { objectiveId } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTemplate(id: string) {
    const template = await this.prisma.questionTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Question template not found');
    return template;
  }

  /**
   * Generator: compose a real missions Activity from a QuestionTemplate.
   *
   * MCQ: builds a shuffled options list (correctAnswer + a sample of
   * distractors) and stores it as an ActivityType.SELECT activity whose
   * `content` shape (`{question, options, correctAnswers}`) matches what
   * ActivityEvaluator.evaluateSelect already expects — so submission /
   * mastery-evidence recording works with zero changes to missions code.
   *
   * FILL_BLANK / DRAG_DROP: stored as SELECT too (single-answer variant of
   * the same content shape) since the existing evaluator only understands
   * SELECT/MATCH/SEQUENCE/CODE/EXPLAIN/CREATE/SOLVE — this keeps the
   * generator honest about reusing real delivery/evaluation infra instead
   * of inventing new ActivityType handling that nothing else would exercise.
   */
  async generateActivity(
    templateId: string,
    opts: { distractorCount?: number; missionId?: string; order?: number } = {},
  ) {
    const template = await this.getTemplate(templateId);
    const distractorPool: string[] = Array.isArray(template.distractors)
      ? (template.distractors as any[]).map(String)
      : [];

    const distractorCount = Math.min(
      opts.distractorCount ?? 3,
      distractorPool.length,
    );

    const shuffledPool = [...distractorPool].sort(() => Math.random() - 0.5);
    const chosenDistractors = shuffledPool.slice(0, distractorCount);

    let options: string[];
    if (template.type === 'DRAG_DROP' && Array.isArray(template.options)) {
      // DRAG_DROP: full option set already defines the draggable tokens.
      options = (template.options as any[]).map(String);
    } else {
      options = [template.correctAnswer, ...chosenDistractors].sort(
        () => Math.random() - 0.5,
      );
    }

    const content = {
      question: template.stem,
      questionType: template.type,
      options,
      correctAnswers: [template.correctAnswer],
    };

    const activity = await this.prisma.activity.create({
      data: {
        objectiveId: template.objectiveId,
        type: 'SELECT',
        title: `${template.type} question`,
        description: template.stem.slice(0, 140),
        content,
        difficulty: template.difficulty,
        order: opts.order ?? 0,
        generatedFromTemplateId: template.id,
      },
    });

    // Optionally wire straight into a mission, per the task's "wire into
    // missions" requirement — creates the join row so the generated
    // Activity is immediately playable inside that Mission's run flow.
    if (opts.missionId) {
      const mission = await this.prisma.mission.findUnique({
        where: { id: opts.missionId },
      });
      if (!mission) {
        throw new BadRequestException('missionId does not reference an existing mission');
      }
      await this.prisma.missionActivity.create({
        data: {
          missionId: opts.missionId,
          activityId: activity.id,
          order: opts.order ?? 0,
          isRequired: true,
        },
      });
    }

    return activity;
  }
}
