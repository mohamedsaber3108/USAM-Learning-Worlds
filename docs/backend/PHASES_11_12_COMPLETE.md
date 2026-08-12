# PHASES 11-12: COMPLETE IMPLEMENTATION PROMPTS
## Full Platform Launch — Final Polish & Observability

**This document contains full implementation prompts for the optional final phases that take the platform from production-ready to fully hardened.**

**Phases covered:**
- Phase 11: Analytics & Observability (Week 20-22)
- Phase 12: Production Hardening (Week 22-24)

---

# PHASE 11: ANALYTICS & OBSERVABILITY (Week 20-22)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 11: ANALYTICS & OBSERVABILITY

## CONTEXT

Phases 1-10 complete and production-ready. Now add comprehensive observability so you can monitor, debug, and optimize the platform in production.

## CRITICAL REQUIREMENTS

**OpenTelemetry Stack:**
- Distributed tracing (Tempo)
- Metrics (Prometheus)
- Logs (Loki)
- Unified correlation (trace ID → logs → metrics)

**Key Metrics to Track:**
- Request latency (p50, p95, p99)
- Error rates by endpoint
- AI Gateway usage (tokens, cost)
- Database query performance
- Cache hit rates
- Job queue depth

**Analytics Events:**
- Learning events (evidence created, mastery updates)
- Engagement events (mission started, project created)
- Social events (message sent, guild joined)
- System events (errors, rate limits)

## PHASE 11 OBJECTIVES

1. Implement OpenTelemetry instrumentation
2. Set up Prometheus metrics
3. Set up Grafana dashboards
4. Implement structured logging (Loki)
5. Implement analytics event tracking
6. Set up error tracking (Sentry)
7. Create alerting rules

## KEY DELIVERABLES

### 1. Install Dependencies

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node
npm install @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/exporter-prometheus
npm install @opentelemetry/exporter-trace-otlp-http
npm install prom-client
npm install winston
npm install @sentry/node
```

### 2. OpenTelemetry Setup

```typescript
// src/config/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

export function setupTelemetry() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'usam-learning-worlds',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV
    }),

    // Prometheus metrics exporter (port 9464)
    metricReader: new PrometheusExporter({
      port: 9464,
      endpoint: '/metrics'
    }),

    // OTLP trace exporter (to Tempo via Grafana Agent)
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces'
    }),

    // Auto-instrument common libraries
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {},
        '@opentelemetry/instrumentation-express': {},
        '@opentelemetry/instrumentation-pg': {}, // PostgreSQL
        '@opentelemetry/instrumentation-redis': {}
      })
    ]
  })

  sdk.start()

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Telemetry terminated'))
      .catch((error) => console.log('Error terminating telemetry', error))
  })

  return sdk
}
```

### 3. Custom Metrics Service

```typescript
// src/modules/analytics/metrics.service.ts
import { Injectable } from '@nestjs/common'
import { Counter, Histogram, Gauge, register } from 'prom-client'

@Injectable()
export class MetricsService {
  // HTTP metrics
  private httpRequestDuration: Histogram
  private httpRequestTotal: Counter
  private httpRequestErrors: Counter

  // AI Gateway metrics
  private aiTokensUsed: Counter
  private aiRequestDuration: Histogram
  private aiCost: Counter

  // Mastery metrics
  private masteryUpdates: Counter
  private evidenceCreated: Counter

  // Cache metrics
  private cacheHits: Counter
  private cacheMisses: Counter

  // Job queue metrics
  private jobQueueDepth: Gauge
  private jobProcessingDuration: Histogram

  constructor() {
    this.initializeMetrics()
  }

  private initializeMetrics() {
    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    })

    // HTTP Request Total
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    })

    // HTTP Errors
    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'error_type']
    })

    // AI Tokens Used
    this.aiTokensUsed = new Counter({
      name: 'ai_tokens_used_total',
      help: 'Total AI tokens used',
      labelNames: ['model', 'operation']
    })

    // AI Request Duration
    this.aiRequestDuration = new Histogram({
      name: 'ai_request_duration_seconds',
      help: 'Duration of AI requests',
      labelNames: ['model', 'operation'],
      buckets: [0.5, 1, 2, 5, 10, 30]
    })

    // AI Cost (in cents)
    this.aiCost = new Counter({
      name: 'ai_cost_cents_total',
      help: 'Total AI cost in cents',
      labelNames: ['model', 'operation']
    })

    // Mastery Updates
    this.masteryUpdates = new Counter({
      name: 'mastery_updates_total',
      help: 'Total mastery record updates',
      labelNames: ['learner_id', 'new_state']
    })

    // Evidence Created
    this.evidenceCreated = new Counter({
      name: 'evidence_created_total',
      help: 'Total evidence records created',
      labelNames: ['type', 'success']
    })

    // Cache Hit/Miss
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Cache hits',
      labelNames: ['cache_key_prefix']
    })

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Cache misses',
      labelNames: ['cache_key_prefix']
    })

    // Job Queue Depth
    this.jobQueueDepth = new Gauge({
      name: 'job_queue_depth',
      help: 'Number of jobs in queue',
      labelNames: ['queue_name']
    })

    // Job Processing Duration
    this.jobProcessingDuration = new Histogram({
      name: 'job_processing_duration_seconds',
      help: 'Job processing duration',
      labelNames: ['queue_name', 'job_name'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    })
  }

  // Record HTTP request
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration)
    this.httpRequestTotal.inc({ method, route, status_code: statusCode })
  }

  // Record HTTP error
  recordHttpError(method: string, route: string, errorType: string) {
    this.httpRequestErrors.inc({ method, route, error_type: errorType })
  }

  // Record AI usage
  recordAIUsage(model: string, operation: string, tokens: number, costCents: number, duration: number) {
    this.aiTokensUsed.inc({ model, operation }, tokens)
    this.aiCost.inc({ model, operation }, costCents)
    this.aiRequestDuration.observe({ model, operation }, duration)
  }

  // Record mastery update
  recordMasteryUpdate(learnerId: string, newState: string) {
    this.masteryUpdates.inc({ learner_id: learnerId, new_state: newState })
  }

  // Record evidence
  recordEvidence(type: string, success: boolean) {
    this.evidenceCreated.inc({ type, success: success.toString() })
  }

  // Record cache hit/miss
  recordCacheHit(keyPrefix: string) {
    this.cacheHits.inc({ cache_key_prefix: keyPrefix })
  }

  recordCacheMiss(keyPrefix: string) {
    this.cacheMisses.inc({ cache_key_prefix: keyPrefix })
  }

  // Update queue depth
  updateQueueDepth(queueName: string, depth: number) {
    this.jobQueueDepth.set({ queue_name: queueName }, depth)
  }

  // Record job processing
  recordJobProcessing(queueName: string, jobName: string, duration: number) {
    this.jobProcessingDuration.observe({ queue_name: queueName, job_name: jobName }, duration)
  }

  // Expose metrics endpoint
  async getMetrics(): Promise<string> {
    return register.metrics()
  }
}
```

### 4. HTTP Metrics Middleware

```typescript
// src/common/middleware/metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { MetricsService } from '../../modules/analytics/metrics.service'

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000
      const route = req.route?.path || req.path

      this.metricsService.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration
      )

      if (res.statusCode >= 400) {
        this.metricsService.recordHttpError(
          req.method,
          route,
          res.statusCode >= 500 ? 'server_error' : 'client_error'
        )
      }
    })

    next()
  }
}
```

### 5. Structured Logging with Winston

```typescript
// src/config/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'usam-learning-worlds',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Console (for local development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // File (errors only)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),

    // File (all logs)
    new winston.transports.File({
      filename: 'logs/combined.log'
    })

    // In production, add Loki transport
    // new LokiTransport({
    //   host: process.env.LOKI_HOST,
    //   labels: { app: 'usam-learning-worlds' }
    // })
  ]
})
```

### 6. Analytics Events Service

```typescript
// src/modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackEvent(
    userId: string,
    eventType: string,
    eventName: string,
    properties?: any,
    context?: any
  ) {
    await this.prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        eventName,
        properties: properties || {},
        context: context || {},
        timestamp: new Date()
      }
    })
  }

  // Learning events
  async trackEvidenceCreated(learnerId: string, evidence: any) {
    await this.trackEvent(learnerId, 'learning', 'evidence_created', {
      evidenceId: evidence.id,
      type: evidence.type,
      success: evidence.success,
      competencyId: evidence.competencyId
    })
  }

  async trackMasteryUpdate(learnerId: string, mastery: any) {
    await this.trackEvent(learnerId, 'learning', 'mastery_updated', {
      competencyId: mastery.competencyId,
      oldState: mastery.oldState,
      newState: mastery.state,
      confidence: mastery.confidence
    })
  }

  // Engagement events
  async trackMissionStarted(learnerId: string, missionId: string) {
    await this.trackEvent(learnerId, 'engagement', 'mission_started', {
      missionId
    })
  }

  async trackMissionCompleted(learnerId: string, missionId: string, duration: number) {
    await this.trackEvent(learnerId, 'engagement', 'mission_completed', {
      missionId,
      durationMinutes: duration
    })
  }

  async trackProjectCreated(learnerId: string, projectId: string) {
    await this.trackEvent(learnerId, 'engagement', 'project_created', {
      projectId
    })
  }

  // Social events
  async trackMessageSent(senderId: string, recipientId: string) {
    await this.trackEvent(senderId, 'social', 'message_sent', {
      recipientId
    })
  }

  async trackGuildJoined(learnerId: string, guildId: string) {
    await this.trackEvent(learnerId, 'social', 'guild_joined', {
      guildId
    })
  }

  // System events
  async trackError(userId: string, error: any, context: any) {
    await this.trackEvent(userId, 'system', 'error', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context
    })
  }

  // Analytics queries
  async getUserActivity(learnerId: string, days: number = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['eventType', 'eventName'],
      where: {
        userId: learnerId,
        timestamp: { gte: since }
      },
      _count: true
    })

    return events
  }

  async getPlatformActivity(days: number = 7) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Daily active users
    const dau = await this.prisma.analyticsEvent.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: since }
      },
      _count: true
    })

    // Most popular events
    const topEvents = await this.prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: {
        timestamp: { gte: since }
      },
      _count: true,
      orderBy: {
        _count: {
          eventName: 'desc'
        }
      },
      take: 10
    })

    return {
      dailyActiveUsers: dau.length,
      topEvents
    }
  }
}
```

### 7. Sentry Error Tracking

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/node'
import '@sentry/tracing'

export function setupSentry(app: any) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions

      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app })
      ]
    })

    // Request handler (first middleware)
    app.use(Sentry.Handlers.requestHandler())

    // Tracing handler
    app.use(Sentry.Handlers.tracingHandler())
  }
}

export function setupSentryErrorHandler(app: any) {
  if (process.env.SENTRY_DSN) {
    // Error handler (last middleware)
    app.use(Sentry.Handlers.errorHandler())
  }
}
```

### 8. Grafana Dashboard (JSON)

```json
// grafana-dashboard.json
{
  "dashboard": {
    "title": "USAM Learning Worlds - Platform Health",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Request Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{route}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_request_errors_total[5m])",
            "legendFormat": "{{error_type}}"
          }
        ]
      },
      {
        "title": "AI Token Usage",
        "targets": [
          {
            "expr": "rate(ai_tokens_used_total[5m])",
            "legendFormat": "{{model}}"
          }
        ]
      },
      {
        "title": "AI Cost per Hour",
        "targets": [
          {
            "expr": "rate(ai_cost_cents_total[1h]) * 3600 / 100",
            "legendFormat": "{{model}}"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "targets": [
          {
            "expr": "rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))",
            "legendFormat": "{{cache_key_prefix}}"
          }
        ]
      },
      {
        "title": "Job Queue Depth",
        "targets": [
          {
            "expr": "job_queue_depth",
            "legendFormat": "{{queue_name}}"
          }
        ]
      }
    ]
  }
}
```

### 9. Alerting Rules (Prometheus)

```yaml
# prometheus-alerts.yml
groups:
  - name: usam_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_request_errors_total[5m]) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      # High latency
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency"
          description: "P95 latency is {{ $value }}s"

      # AI cost spike
      - alert: AICostSpike
        expr: rate(ai_cost_cents_total[1h]) * 3600 > 500
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "AI costs are high"
          description: "Projected ${{ $value }}/hour"

      # Job queue backed up
      - alert: JobQueueBackup
        expr: job_queue_depth > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Job queue is backed up"
          description: "{{ $value }} jobs pending"

      # Database connection pool exhausted
      - alert: DatabasePoolExhausted
        expr: pg_pool_size - pg_pool_available < 2
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"
```

### 10. Docker Compose Addition

```yaml
# Add to docker-compose.yml

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana-dashboard.json:/etc/grafana/provisioning/dashboards/dashboard.json
    depends_on:
      - prometheus

  # Loki (logs)
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  # Tempo (traces)
  tempo:
    image: grafana/tempo:latest
    ports:
      - "3200:3200"
      - "4318:4318"  # OTLP gRPC
    volumes:
      - tempo-data:/tmp/tempo

volumes:
  prometheus-data:
  grafana-data:
  loki-data:
  tempo-data:
```

## DEFINITION OF DONE

- ✅ OpenTelemetry tracing works end-to-end
- ✅ Prometheus metrics exposed at /metrics
- ✅ Grafana dashboards show key metrics
- ✅ Structured logs sent to Loki
- ✅ Analytics events tracked
- ✅ Sentry captures errors
- ✅ Alerting rules configured
- ✅ All services visible in Grafana

## VALIDATION

```bash
# Check metrics endpoint
curl http://localhost:9464/metrics

# View Grafana dashboards
open http://localhost:3000

# Check Prometheus targets
open http://localhost:9090/targets

# Trigger test event
curl -X POST http://localhost:3001/api/analytics/test \
  -H "Authorization: Bearer TOKEN"
```

## NEXT PHASE

**Phase 12: Production Hardening (Week 22-24)**

---

END OF PHASE 11 PROMPT
```

---

# PHASE 12: PRODUCTION HARDENING (Week 22-24)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 12: PRODUCTION HARDENING

## CONTEXT

Phases 1-11 complete. Final phase: harden the platform for production launch with security audits, performance optimization, and load testing.

## CRITICAL REQUIREMENTS

**Security Hardening:**
- Rate limiting (per-user, per-IP)
- Input validation (all endpoints)
- SQL injection prevention (already handled by Prisma)
- XSS prevention
- CSRF protection
- Helmet.js security headers
- Secrets management (AWS Secrets Manager)

**Performance Optimization:**
- Database query optimization
- N+1 query prevention
- Redis caching strategy
- Response compression
- Connection pooling

**Load Testing:**
- Simulate 1K concurrent users
- Test AI Gateway under load
- Test mastery calculation jobs
- Identify bottlenecks

## PHASE 12 OBJECTIVES

1. Implement comprehensive rate limiting
2. Add input validation to all endpoints
3. Set up security headers
4. Optimize database queries
5. Implement caching strategy
6. Run load tests
7. Fix performance bottlenecks
8. Complete security audit checklist

## KEY DELIVERABLES

### 1. Install Security Dependencies

```bash
npm install @nestjs/throttler
npm install helmet
npm install class-validator class-transformer
npm install compression
npm install @aws-sdk/client-secrets-manager
npm install --save-dev artillery  # Load testing
```

### 2. Rate Limiting (Per-User)

```typescript
// src/config/throttler.config.ts
import { ThrottlerModule } from '@nestjs/throttler'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import Redis from 'ioredis'

export const ThrottlerConfig = ThrottlerModule.forRootAsync({
  useFactory: () => ({
    ttl: 60, // 1 minute window
    limit: 100, // 100 requests per minute per user (default)
    storage: new ThrottlerStorageRedisService(
      new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
      })
    )
  })
})
```

### 3. Custom Rate Limit Guards

```typescript
// src/common/guards/ai-throttle.guard.ts
import { Injectable } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'

@Injectable()
export class AIThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit AI requests more aggressively
    return req.user?.id || req.ip
  }

  protected async getLimit(context: any): Promise<number> {
    // 10 AI requests per hour
    return 10
  }

  protected async getTtl(context: any): Promise<number> {
    // 1 hour window
    return 3600
  }
}
```

### 4. Global Validation Pipe

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security headers
  app.use(helmet())

  // Response compression
  app.use(compression())

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  // Enable CORS with restrictions
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
  })

  await app.listen(3001)
}
bootstrap()
```

### 5. Input Validation DTOs

```typescript
// Example: Mission DTOs with validation
import { IsString, IsUUID, IsEnum, IsOptional, MaxLength } from 'class-validator'
import { MissionType } from '@prisma/client'

export class StartMissionDto {
  @IsUUID()
  missionId: string
}

export class SubmitActivityDto {
  @IsUUID()
  activityId: string

  @IsString()
  @MaxLength(10000)
  response: string

  @IsOptional()
  metadata?: Record<string, any>
}

export class SendMessageDto {
  @IsUUID()
  recipientId: string

  @IsString()
  @MaxLength(500) // Limit message length
  content: string
}

export class CreateGuildDto {
  @IsString()
  @MaxLength(50)
  name: string

  @IsString()
  @MaxLength(200)
  description: string

  @IsEnum(['STUDY_GROUP', 'PROJECT_TEAM', 'SOCIAL'])
  type: string

  @IsOptional()
  @IsUUID()
  focusDomainId?: string
}
```

### 6. Database Query Optimization

```typescript
// src/modules/mastery/mastery.service.ts (optimized)
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class MasteryService {
  constructor(private prisma: PrismaService) {}

  async getMasteryOverview(learnerId: string) {
    // BEFORE: N+1 queries (bad)
    // const records = await this.prisma.masteryRecord.findMany({ where: { learnerId } })
    // for (const record of records) {
    //   const competency = await this.prisma.competency.findUnique({ where: { id: record.competencyId } })
    //   const skill = await this.prisma.skill.findUnique({ where: { id: competency.skillId } })
    // }

    // AFTER: Single query with includes (good)
    const records = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
      include: {
        competency: {
          include: {
            skill: {
              include: {
                domain: true
              }
            }
          }
        }
      }
    })

    return records
  }

  async getMasteryByDomain(learnerId: string) {
    // Use aggregation instead of fetching all records
    const result = await this.prisma.$queryRaw`
      SELECT 
        d.id as domain_id,
        d.name as domain_name,
        COUNT(*) as total_competencies,
        SUM(CASE WHEN m.state = 'MASTERED' THEN 1 ELSE 0 END) as mastered_count,
        AVG(m.confidence) as avg_confidence
      FROM mastery_records m
      JOIN competencies c ON m.competency_id = c.id
      JOIN skills s ON c.skill_id = s.id
      JOIN domains d ON s.domain_id = d.id
      WHERE m.learner_id = ${learnerId}
      GROUP BY d.id, d.name
    `

    return result
  }
}
```

### 7. Redis Caching Strategy

```typescript
// src/modules/cache/cache.service.ts
import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class CacheService {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT)
    })
  }

  // Cache learner profile (changes rarely)
  async getLearnerProfile(learnerId: string) {
    const key = `learner:${learnerId}:profile`
    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    const profile = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: { progression: true }
    })

    // Cache for 5 minutes
    await this.redis.setex(key, 300, JSON.stringify(profile))

    return profile
  }

  // Cache curriculum (changes very rarely)
  async getDomains() {
    const key = 'curriculum:domains'
    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    const domains = await this.prisma.domain.findMany({
      include: {
        skills: {
          include: {
            competencies: true
          }
        }
      }
    })

    // Cache for 1 hour
    await this.redis.setex(key, 3600, JSON.stringify(domains))

    return domains
  }

  // Invalidate cache
  async invalidateLearnerCache(learnerId: string) {
    await this.redis.del(`learner:${learnerId}:profile`)
  }

  async invalidateCurriculumCache() {
    await this.redis.del('curriculum:domains')
  }
}
```

### 8. Connection Pooling (Prisma)

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  // Format: postgresql://user:password@host:port/db?connection_limit=10&pool_timeout=20
}

// .env.production
DATABASE_URL="postgresql://user:password@host:5432/usam?connection_limit=20&pool_timeout=20&connect_timeout=10"
```

### 9. Load Testing Script (Artillery)

```yaml
# artillery-load-test.yml
config:
  target: "http://localhost:3001"
  phases:
    # Warm-up
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    
    # Ramp up
    - duration: 300
      arrivalRate: 50
      rampTo: 200
      name: "Ramp up to 200 users/sec"
    
    # Sustained load
    - duration: 600
      arrivalRate: 200
      name: "Sustained load"
    
    # Spike test
    - duration: 60
      arrivalRate: 500
      name: "Spike test"

  processor: "./load-test-processor.js"

scenarios:
  # Mission flow
  - name: "Complete Mission"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomEmail }}"
            password: "password123"
          capture:
            - json: "$.accessToken"
              as: "token"
      
      - get:
          url: "/api/missions"
          headers:
            Authorization: "Bearer {{ token }}"
          capture:
            - json: "$[0].id"
              as: "missionId"
      
      - post:
          url: "/api/missions/{{ missionId }}/start"
          headers:
            Authorization: "Bearer {{ token }}"
      
      - think: 5  # Simulate reading mission

      - post:
          url: "/api/activities/activity-1/submit"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            response: "Test answer"

  # AI conversation
  - name: "AI Chat"
    weight: 20
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomEmail }}"
            password: "password123"
          capture:
            - json: "$.accessToken"
              as: "token"
      
      - post:
          url: "/api/ai/chat"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            message: "Help me with this problem"

  # Browse content
  - name: "Browse Content"
    weight: 40
    flow:
      - get:
          url: "/api/domains"
      
      - get:
          url: "/api/missions?limit=10"
      
      - think: 2
      
      - get:
          url: "/api/leaderboard"
```

### 10. Security Audit Checklist

```markdown
# Security Audit Checklist

## Authentication & Authorization
- [x] JWT tokens expire (15 minutes access, 7 days refresh)
- [x] Refresh tokens can be revoked
- [x] Password hashing uses bcrypt (cost factor 10+)
- [x] Guardian-learner relationships verified
- [x] Role-based access control (RBAC) enforced

## Input Validation
- [x] All DTOs have class-validator decorators
- [x] Max length limits on text inputs
- [x] UUIDs validated
- [x] Enums validated
- [x] SQL injection prevented (Prisma ORM)

## Rate Limiting
- [x] Global rate limit (100 req/min per user)
- [x] AI endpoint rate limit (10 req/hour per user)
- [x] Messaging rate limit (20 msg/hour per user)
- [x] Registration rate limit (per IP)

## Content Moderation
- [x] All user content moderated (AI pre-screen)
- [x] Human moderation queue for flagged content
- [x] PII detection and blocking
- [x] Profanity filtering (age-appropriate)
- [x] Prompt injection detection

## Child Safety
- [x] No real names exposed (display names only)
- [x] Parental controls enforced
- [x] Public content requires guardian approval
- [x] Messaging can be disabled
- [x] Block functionality implemented
- [x] Report system functional

## Data Privacy
- [x] COPPA compliance (parental consent)
- [x] GDPR compliance (data export/deletion)
- [x] Session data encrypted
- [x] PII minimization
- [x] Data retention policy defined

## Infrastructure Security
- [x] HTTPS enforced (production)
- [x] Security headers (Helmet.js)
- [x] CORS restricted to known origins
- [x] Secrets stored in AWS Secrets Manager
- [x] Database credentials rotated
- [x] API keys never in code

## Monitoring & Incident Response
- [x] Error tracking (Sentry)
- [x] Audit logs for sensitive operations
- [x] Alert rules configured
- [x] Incident response plan documented
```

### 11. Performance Optimization Checklist

```markdown
# Performance Optimization Checklist

## Database
- [x] Indexes on foreign keys
- [x] Indexes on frequently queried fields
- [x] Connection pooling configured
- [x] N+1 queries eliminated
- [x] Aggregation queries optimized
- [x] Query timeout set (30s)

## Caching
- [x] Redis for session storage
- [x] Curriculum cached (1 hour TTL)
- [x] Learner profiles cached (5 min TTL)
- [x] Cache invalidation strategy
- [x] Cache hit rate monitored

## API
- [x] Response compression enabled
- [x] Pagination on list endpoints
- [x] Field selection (GraphQL-style)
- [x] ETags for conditional requests
- [x] API response time < 200ms (p95)

## AI Gateway
- [x] Prompt caching enabled (90% cost reduction)
- [x] Model routing (Haiku 80%, Sonnet 20%)
- [x] Request batching where possible
- [x] Timeout set (30s)
- [x] Rate limiting enforced

## Jobs
- [x] BullMQ for async processing
- [x] Job priority queues
- [x] Job retry logic (3 attempts)
- [x] Dead letter queue
- [x] Job concurrency limits
```

## DEFINITION OF DONE

- ✅ All endpoints have rate limiting
- ✅ All inputs validated
- ✅ Security headers configured
- ✅ Database queries optimized
- ✅ Caching strategy implemented
- ✅ Load test passed (1K concurrent users)
- ✅ Security audit checklist complete
- ✅ Performance targets met (p95 < 200ms)
- ✅ Zero critical vulnerabilities

## VALIDATION

```bash
# Run load test
artillery run artillery-load-test.yml

# Check for N+1 queries
npm run prisma:studio
# Enable query logging and watch for patterns

# Run security audit
npm audit
npm run lint:security

# Test rate limiting
for i in {1..150}; do
  curl http://localhost:3001/api/missions -H "Authorization: Bearer TOKEN"
done
# Should see 429 Too Many Requests after 100

# Verify Helmet headers
curl -I http://localhost:3001/api/health
# Should see: X-Content-Type-Options, X-Frame-Options, etc.
```

## PRODUCTION LAUNCH READY! 🚀

**All 12 phases complete. Platform is production-hardened and ready to scale.**

---

END OF PHASE 12 PROMPT
```

---

# FINAL SUMMARY: ALL 12 PHASES COMPLETE

**✅ Phase 1**: Foundation & Database (81 tables, Docker Compose)  
**✅ Phase 2**: Authentication & Authorization (JWT, OAuth, Guardian relationships)  
**✅ Phase 3**: Learning Core (Mastery confidence algorithm, FSRS-based)  
**✅ Phase 4**: Missions & Activities (Evidence flows, evaluation)  
**✅ Phase 5**: AI Gateway & Safety (Bedrock integration, moderation)  
**✅ Phase 6**: Adaptive Engine (ZPD targeting, recommendations)  
**✅ Phase 7**: Projects & Portfolio (S3 upload, visibility controls)  
**✅ Phase 8**: Gamification (XP/coins, achievements, privacy-first leaderboards)  
**✅ Phase 9**: Community & Moderation ⭐ (Human moderation queue, safe messaging)  
**✅ Phase 10**: Parent System (Dashboard, automated reports, controls)  
**✅ Phase 11**: Analytics & Observability (OpenTelemetry, Prometheus, Grafana)  
**✅ Phase 12**: Production Hardening (Security audit, load testing, optimization)

---

## MILESTONES

**MVP (Phases 1-6): 11 weeks, 2 developers**
- Core learning system functional
- AI-powered guidance
- Basic gamification

**Production-Ready (Phases 1-10): 20 weeks, 2 developers**
- Full platform features
- Community with safety
- Parent dashboard

**Full Platform (Phases 1-12): 24 weeks, 2 developers**
- Production-hardened
- Comprehensive observability
- Load-tested and optimized

---

## COSTS

**Development**: ~$75K (2 developers × 20 weeks × $50/hour)

**Infrastructure (Monthly)**:
- AWS Bedrock AI: $330/month (1K users, 80% Haiku + 20% Sonnet)
- PostgreSQL RDS: $50/month (db.t3.medium)
- Redis ElastiCache: $15/month (cache.t3.micro)
- S3 Storage: $5/month (50GB)
- Grafana Cloud: $50/month (observability stack)
- **Total**: ~$450/month for 1K users

---

## NEXT STEPS

1. **Set up development environment** (Phase 1)
2. **Implement foundation** (Phases 1-2, Week 1-3)
3. **Build learning core** (Phase 3, Week 3-5) — CRITICAL PATH
4. **Add AI integration** (Phase 5, Week 7-9) — CRITICAL PATH
5. **Iterate to production** (Phases 6-10, Week 9-20)
6. **Harden for launch** (Phases 11-12, Week 20-24)

---

**COMPLETE BACKEND IMPLEMENTATION ROADMAP DELIVERED.**

All 12 phases documented with full implementation prompts, code, validation, and definition of done.

**Ready to build.**

---

END OF PHASES 11-12 COMPLETE DOCUMENT
