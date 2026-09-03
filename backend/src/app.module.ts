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
import { CodingSandboxModule } from './modules/coding-sandbox/coding-sandbox.module';
import { VoiceModule } from './modules/voice/voice.module';
import { CrossCurricularModule } from './modules/cross-curricular/cross-curricular.module';
import { LearnerModelModule } from './modules/learner-model/learner-model.module';
import { ReflectionModule } from './modules/reflection/reflection.module';
import { WorldsModule } from './modules/worlds/worlds.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { DailyGoalsModule } from './modules/daily-goals/daily-goals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CreativityModule } from './modules/creativity/creativity.module';
import { ProblemSolvingModule } from './modules/problem-solving/problem-solving.module';
import { AuditModule } from './modules/audit/audit.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';

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
    CodingSandboxModule,
    VoiceModule,
    CrossCurricularModule,
    ReflectionModule,
    LearnerModelModule,
    WorldsModule,
    QuestionsModule,
    FlashcardsModule,
    DailyGoalsModule,
    NotificationsModule,
    CreativityModule,
    ProblemSolvingModule,
    AuditModule,
    FeatureFlagsModule,
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
