import pino, { Logger as PinoLogger } from 'pino';

/**
 * Observability Engine v1 — shared structured (JSON) logger.
 *
 * Previously the app only had NestJS's built-in console `Logger`
 * (unstructured, non-JSON text lines) — no request IDs, no consistent
 * field names, nothing a log aggregator (Loki/ELK/CloudWatch Insights)
 * could actually query. This gives every part of the app one pino
 * instance that emits structured JSON in production and pretty-printed
 * output in local dev.
 *
 * Deliberately NOT nestjs-pino: that package requires NestJS 11+
 * (`@nestjs/common@^11.0.8 || ^12.0.0`) and this codebase is pinned to
 * NestJS 10, so pulling it in would force a breaking peer-dep bump
 * touching the entire app. Plain `pino` + `pino-http` have no such
 * constraint and give the same structured-logging outcome.
 */
const isProd = process.env.NODE_ENV === 'production';

export const rootLogger: PinoLogger = pino({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  base: { service: 'usam-backend' },
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      },
});

/** Per-module child logger, e.g. `createLogger('AnalyticsService')`. */
export function createLogger(context: string): PinoLogger {
  return rootLogger.child({ context });
}
