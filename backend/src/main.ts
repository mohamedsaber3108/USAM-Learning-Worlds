import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers
  app.use(helmet());

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
