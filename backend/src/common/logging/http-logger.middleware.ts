import { randomUUID } from 'crypto';
import pinoHttp from 'pino-http';
import { rootLogger } from './logger';

/**
 * Structured request/response access log (Observability Engine v1).
 *
 * Wraps every HTTP request with a pino-http middleware instance so each
 * request/response pair is logged as one structured JSON line: method,
 * path, status, response time, and an `x-request-id` (generated if the
 * proxy didn't already set one) that can be correlated with any
 * app-level logs emitted from `createLogger()` during that request.
 */
export const httpLoggerMiddleware = pinoHttp({
  logger: rootLogger,
  genReqId: (req, res) => {
    const existing = req.headers['x-request-id'];
    const id = (Array.isArray(existing) ? existing[0] : existing) || randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // Never let response/request bodies (which can carry learner answers,
  // JWTs, etc.) land in logs — only method/url/status/timing are recorded
  // by pino-http's default serializers.
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
