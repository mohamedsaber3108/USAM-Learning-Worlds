import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private prisma: PrismaService) {}

  async healthCheck() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  // Observability Engine v1 (see gap matrix deferral note): a real
  // health-detail endpoint, not a Prometheus/OTel stack. Reports:
  //  - DB reachability + round-trip latency as a lightweight pool-health
  //    proxy (Prisma doesn't expose pg-pool internals directly, so we
  //    report real query latency plus the configured connection_limit if
  //    present in DATABASE_URL, which is the honest signal available
  //    without adding a metrics library).
  //  - process uptime (real, from process.uptime()).
  //  - a count of ERROR-level lines in the last N lines of the PM2 error
  //    log file this process already writes via Nest's Logger, so no new
  //    logging backend is introduced. Falls back to null (not zero) when
  //    the log file isn't present, e.g. local dev without PM2.
  async healthDetailed() {
    const result: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    };

    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - dbStart;
      const connectionLimitMatch = (process.env.DATABASE_URL || '').match(
        /connection_limit=(\d+)/,
      );
      result.database = {
        connected: true,
        latencyMs,
        configuredConnectionLimit: connectionLimitMatch
          ? Number(connectionLimitMatch[1])
          : null,
      };
    } catch (error) {
      result.status = 'degraded';
      result.database = {
        connected: false,
        error: error.message,
      };
    }

    result.recentErrors = this.countRecentErrorsFromLog();

    return result;
  }

  private countRecentErrorsFromLog(): {
    windowLines: number;
    errorCount: number | null;
    source: string | null;
  } {
    const logPath =
      process.env.PM2_ERROR_LOG_PATH ||
      `${process.env.HOME || '/home/ubuntu'}/.pm2/logs/usam-backend-error.log`;
    const windowLines = 500;
    try {
      if (!fs.existsSync(logPath)) {
        return { windowLines, errorCount: null, source: null };
      }
      const raw = fs.readFileSync(logPath, 'utf-8');
      const lines = raw.split('\n');
      const tail = lines.slice(-windowLines);
      const errorCount = tail.filter((l) => /\bERROR\b/.test(l)).length;
      return { windowLines, errorCount, source: logPath };
    } catch (error) {
      this.logger.warn(`Could not read log file for health/detailed: ${error.message}`);
      return { windowLines, errorCount: null, source: logPath };
    }
  }

  async getDomains() {
    const domains = await this.prisma.domain.findMany({
      orderBy: { name: 'asc' },
    });
    return domains;
  }
}
