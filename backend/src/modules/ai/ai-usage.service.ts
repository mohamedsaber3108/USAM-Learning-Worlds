import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AIUsageService {
  private readonly logger = new Logger(AIUsageService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log AI usage for analytics and cost tracking
   */
  async logUsage(
    userId: string,
    service: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.aIUsageLog.create({
        data: {
          userId,
          service,
          model,
          inputTokens,
          outputTokens,
          metadata,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI usage: ${error.message}`);
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUserUsage(userId: string, startDate: Date, endDate: Date) {
    const logs = await this.prisma.aIUsageLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalInputTokens = logs.reduce((sum, log) => sum + log.inputTokens, 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + log.outputTokens, 0);
    const totalRequests = logs.length;

    const byService: Record<string, number> = {};
    logs.forEach((log) => {
      byService[log.service] = (byService[log.service] || 0) + 1;
    });

    return {
      totalRequests,
      totalInputTokens,
      totalOutputTokens,
      byService,
    };
  }

  /**
   * Get platform-wide usage statistics
   */
  async getPlatformUsage(startDate: Date, endDate: Date) {
    const logs = await this.prisma.aIUsageLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalInputTokens = logs.reduce((sum, log) => sum + log.inputTokens, 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + log.outputTokens, 0);
    const totalRequests = logs.length;

    const byService: Record<string, number> = {};
    const byModel: Record<string, number> = {};

    logs.forEach((log) => {
      byService[log.service] = (byService[log.service] || 0) + 1;
      byModel[log.model] = (byModel[log.model] || 0) + 1;
    });

    const uniqueUsers = new Set(logs.map((log) => log.userId)).size;

    return {
      totalRequests,
      totalInputTokens,
      totalOutputTokens,
      uniqueUsers,
      byService,
      byModel,
    };
  }
}
