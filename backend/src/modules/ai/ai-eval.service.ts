/**
 * AI Evaluation Harness — read service backing the admin history
 * endpoint (GET /api/admin/ai-eval/runs). Pure read of AIEvalRun /
 * AIEvalResult, populated by backend/scripts/run-ai-eval.ts.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AIEvalService {
  constructor(private prisma: PrismaService) {}

  async listRuns(limit = 20) {
    const runs = await this.prisma.aIEvalRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
      select: {
        id: true,
        startedAt: true,
        finishedAt: true,
        datasetVersion: true,
        totalCases: true,
        passedCases: true,
        averageScore: true,
        status: true,
        notes: true,
        _count: { select: { results: true } },
      },
    });

    return {
      runs: runs.map((r) => ({
        id: r.id,
        startedAt: r.startedAt,
        finishedAt: r.finishedAt,
        datasetVersion: r.datasetVersion,
        totalCases: r.totalCases,
        passedCases: r.passedCases,
        passRate: r.totalCases > 0 ? r.passedCases / r.totalCases : 0,
        averageScore: r.averageScore,
        status: r.status,
        notes: r.notes,
        resultCount: r._count.results,
      })),
    };
  }

  async getRun(id: string) {
    const run = await this.prisma.aIEvalRun.findUnique({
      where: { id },
      include: {
        results: { orderBy: { caseId: 'asc' } },
      },
    });

    if (!run) {
      throw new NotFoundException(`AIEvalRun ${id} not found`);
    }

    return run;
  }
}
