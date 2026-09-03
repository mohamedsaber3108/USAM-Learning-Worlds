import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import { httpLoggerMiddleware } from './common/logging/http-logger.middleware';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CRITICAL: trust the nginx reverse proxy in front of this app so
  // Express/NestJS reads the REAL client IP from X-Forwarded-For (set by
  // nginx: proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for)
  // instead of seeing every request as coming from the proxy's own IP.
  //
  // Without this, ThrottlerGuard (rate limiting on /api/auth/login,
  // /api/auth/register) buckets ALL users behind nginx into ONE shared
  // IP — meaning a handful of login attempts from ANY user exhausts the
  // limit for EVERY user on the site (confirmed real-world symptom:
  // widespread "can't sign in" reports, 429 Too Many Requests on login).
  // '1' = trust exactly one hop (our own nginx), not an open-ended chain.
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // Observability Engine v1: structured (JSON) request/response access
  // log via pino-http, correlated by x-request-id. Placed after helmet
  // (so security headers are set first) but before compression/static
  // so every request — including static assets — gets logged.
  app.use(httpLoggerMiddleware);

  // Serve synthesized voice-turn audio (Voice Pipeline v1). Not under the
  // /api prefix — plain static files, same pattern as any other public
  // asset directory.
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Response compression
  app.use(compression());

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
    🚀 USAM Learning Worlds Backend
    📡 Server running on: http://localhost:${port}
    🏥 Health check: http://localhost:${port}/api/health
    📊 Environment: ${process.env.NODE_ENV || 'development'}
  `);
  logger.log(`Server started on port ${port} (env=${process.env.NODE_ENV || 'development'})`);
}

bootstrap();
