import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { MasteryModule } from './modules/mastery/mastery.module';
import { MissionsModule } from './modules/missions/missions.module';
import { AIModule } from './modules/ai/ai.module';
import { AdaptiveModule } from './modules/adaptive/adaptive.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { CommunityModule } from './modules/community/community.module';
import { ParentsModule } from './modules/parents/parents.module';
import { LearningModule } from './modules/learning/learning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        // Global default: generous, applies to all routes not overridden
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    MasteryModule,
    MissionsModule,
    AIModule,
    AdaptiveModule,
    ProjectsModule,
    GamificationModule,
    CommunityModule,
    ParentsModule,
    LearningModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
