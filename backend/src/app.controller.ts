import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async health() {
    return this.appService.healthCheck();
  }

  // Observability Engine v1: one real health-detail endpoint beyond the
  // basic /api/health above. Returns DB reachability/latency, process
  // uptime, and a count of recent ERROR-level log lines (tail of the PM2
  // log file this process already writes via NestJS's Logger, no new
  // logging backend introduced). See docs/architecture/
  // USAM_KIDS_ENGINE_GAP_MATRIX.md for the honest scope note: this is NOT
  // Prometheus/Grafana/OpenTelemetry — that remains explicitly deferred.
  @Get('health/detailed')
  async healthDetailed() {
    return this.appService.healthDetailed();
  }

  @Get('domains')
  async getDomains() {
    return this.appService.getDomains();
  }
}
