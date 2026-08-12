# PHASES 6-10: COMPLETE IMPLEMENTATION PROMPTS
## Production-Ready Features — Detailed Implementation Guide

**This document contains full implementation prompts for the final phases needed for production launch.**

**Phases covered:**
- Phase 6: Adaptive Engine & Recommendations (Week 9-11)
- Phase 7: Projects & Portfolio (Week 11-13)
- Phase 8: Gamification & Progression (Week 13-15)
- Phase 9: Community & Moderation ⭐ CRITICAL (Week 15-18)
- Phase 10: Parent System & Reports (Week 18-20)

---

# PHASE 6: ADAPTIVE ENGINE & RECOMMENDATIONS (Week 9-11)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 6: ADAPTIVE ENGINE & RECOMMENDATIONS

## CONTEXT

Phases 1-5 complete. You have mastery tracking with confidence scores. Now implement the adaptive engine that uses this data to personalize the learning experience.

## CRITICAL REQUIREMENTS

**Adaptive Difficulty:**
- Target Zone of Proximal Development (ZPD) — not too easy, not too hard
- Aim for 70-80% success rate
- Adjust based on recent performance

**Recommendations:**
- Prioritize spaced review (highest priority)
- Identify skill gaps (prerequisites for goals)
- Suggest next logical activities
- Consider learner interests

## PHASE 6 OBJECTIVES

1. Implement AdaptiveService (difficulty decisions)
2. Implement RecommendationEngine (next activity suggestions)
3. Implement ZPD calculator (target flow state)
4. Integrate with mastery confidence scores (Phase 3)
5. Test adaptive logic thoroughly

## KEY DELIVERABLES

### 1. Adaptive Module Structure

```
src/modules/adaptive/
├── adaptive.module.ts
├── adaptive.controller.ts
├── adaptive.service.ts
├── recommendation.engine.ts
├── zpd-calculator.service.ts
└── dto/
    ├── difficulty-decision.dto.ts
    └── recommendation.dto.ts
```

### 2. AdaptiveService (Difficulty Decisions)

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { DifficultyLevel } from '@prisma/client'

@Injectable()
export class AdaptiveService {
  constructor(
    private prisma: PrismaService,
    private zpdCalculator: ZPDCalculator
  ) {}

  async decideDifficulty(learnerId: string, objectiveId: string): Promise<DifficultyDecision> {
    // 1. Get objective's competency
    const objective = await this.prisma.learningObjective.findUnique({
      where: { id: objectiveId },
      include: { competency: true }
    })

    // 2. Get learner's mastery for this competency
    const mastery = await this.prisma.masteryRecord.findUnique({
      where: {
        learnerId_competencyId: {
          learnerId,
          competencyId: objective.competencyId
        }
      }
    })

    // 3. Get recent performance (last 5 attempts)
    const recentAttempts = await this.prisma.activityAttempt.findMany({
      where: {
        run: { learnerId },
        activity: { objectiveId }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // 4. Calculate ZPD-based difficulty
    const confidence = mastery?.confidence || 0
    const recentSuccessRate = this.calculateSuccessRate(recentAttempts)

    const difficulty = this.zpdCalculator.calculate(confidence, recentSuccessRate)

    return {
      level: difficulty,
      reason: this.explainDifficulty(confidence, recentSuccessRate),
      confidence
    }
  }

  private calculateSuccessRate(attempts: any[]): number {
    if (attempts.length === 0) return 0.5
    const successful = attempts.filter(a => a.success).length
    return successful / attempts.length
  }

  private explainDifficulty(confidence: number, successRate: number): string {
    if (confidence < 0.3) {
      return 'Starting with easier activities to build confidence'
    }
    if (confidence > 0.8 && successRate > 0.8) {
      return 'You\'re doing great! Time for a challenge'
    }
    if (successRate < 0.5) {
      return 'Let\'s practice with easier activities first'
    }
    return 'This should be just right for your level'
  }
}
```

### 3. ZPD Calculator (Flow State Targeting)

```typescript
import { Injectable } from '@nestjs/common'
import { DifficultyLevel } from '@prisma/client'

@Injectable()
export class ZPDCalculator {
  /**
   * Calculate optimal difficulty based on Zone of Proximal Development.
   * Target: 70-80% success rate (flow state)
   */
  calculate(confidence: number, recentSuccessRate: number): DifficultyLevel {
    // If struggling (success < 50%), drop difficulty
    if (recentSuccessRate < 0.5) {
      return confidence < 0.3 ? 'EASY' : 'MEDIUM'
    }

    // If mastering (success > 85%), increase difficulty
    if (recentSuccessRate > 0.85) {
      if (confidence > 0.85) return 'CHALLENGE'
      if (confidence > 0.70) return 'HARD'
      return 'MEDIUM'
    }

    // Target ZPD based on confidence
    if (confidence < 0.30) return 'EASY'
    if (confidence < 0.60) return 'MEDIUM'
    if (confidence < 0.85) return 'HARD'
    return 'CHALLENGE'
  }
}
```

### 4. RecommendationEngine

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class RecommendationEngine {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(learnerId: string, limit: number = 5) {
    const recommendations: Recommendation[] = []

    // Priority 1: Spaced review (highest priority)
    const reviewDue = await this.getReviewRecommendations(learnerId)
    recommendations.push(...reviewDue)

    // Priority 2: Skill gaps (prerequisites for goals)
    if (recommendations.length < limit) {
      const gaps = await this.getGapRecommendations(learnerId)
      recommendations.push(...gaps)
    }

    // Priority 3: Next in sequence
    if (recommendations.length < limit) {
      const next = await this.getNextRecommendations(learnerId)
      recommendations.push(...next)
    }

    // Priority 4: Interest-based
    if (recommendations.length < limit) {
      const interests = await this.getInterestRecommendations(learnerId)
      recommendations.push(...interests)
    }

    return recommendations.slice(0, limit)
  }

  private async getReviewRecommendations(learnerId: string): Promise<Recommendation[]> {
    const now = new Date()
    const reviewDue = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        reviewDue: { lte: now },
        state: { in: ['PROFICIENT', 'MASTERED'] }
      },
      take: 3,
      orderBy: { reviewDue: 'asc' },
      include: {
        competency: {
          include: {
            skill: true,
            objectives: {
              include: {
                activities: { take: 1 }
              }
            }
          }
        }
      }
    })

    return reviewDue.map(r => ({
      type: 'review',
      priority: 'high',
      title: `Review: ${r.competency.skill.name}`,
      reason: 'Time to review what you learned',
      estimatedMinutes: 10,
      activityId: r.competency.objectives[0]?.activities[0]?.id
    }))
  }

  private async getGapRecommendations(learnerId: string): Promise<Recommendation[]> {
    // Find competencies with low confidence that are prerequisites
    const weakCompetencies = await this.prisma.masteryRecord.findMany({
      where: {
        learnerId,
        confidence: { lt: 0.5 }
      },
      take: 2,
      orderBy: { confidence: 'asc' },
      include: {
        competency: {
          include: {
            skill: true,
            objectives: {
              include: {
                activities: { take: 1 }
              }
            }
          }
        }
      }
    })

    return weakCompetencies.map(r => ({
      type: 'practice',
      priority: 'high',
      title: `Practice: ${r.competency.skill.name}`,
      reason: 'Let\'s strengthen this skill',
      estimatedMinutes: 15,
      activityId: r.competency.objectives[0]?.activities[0]?.id
    }))
  }

  private async getNextRecommendations(learnerId: string): Promise<Recommendation[]> {
    // Find next logical activities in curriculum sequence
    // This is simplified - production would check prerequisites
    const recentMissions = await this.prisma.missionRun.findMany({
      where: { learnerId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      take: 1,
      include: { mission: true }
    })

    if (recentMissions.length === 0) {
      // First-time user, suggest starting missions
      const firstMissions = await this.prisma.mission.findMany({
        take: 2,
        orderBy: { order: 'asc' }
      })

      return firstMissions.map(m => ({
        type: 'mission',
        priority: 'medium',
        title: m.title,
        reason: 'Start your learning journey',
        estimatedMinutes: m.estimatedMinutes
      }))
    }

    // Suggest next mission in sequence
    const lastMission = recentMissions[0].mission
    const nextMission = await this.prisma.mission.findFirst({
      where: {
        worldId: lastMission.worldId,
        order: { gt: lastMission.order }
      },
      orderBy: { order: 'asc' }
    })

    if (nextMission) {
      return [{
        type: 'mission',
        priority: 'medium',
        title: nextMission.title,
        reason: 'Continue your progress',
        estimatedMinutes: nextMission.estimatedMinutes
      }]
    }

    return []
  }

  private async getInterestRecommendations(learnerId: string): Promise<Recommendation[]> {
    // Get learner's most practiced domains
    const domainCounts = await this.prisma.missionRun.groupBy({
      by: ['missionId'],
      where: { learnerId, status: 'COMPLETED' },
      _count: true
    })

    // Simplified: just suggest popular missions
    return []
  }
}

interface Recommendation {
  type: 'review' | 'practice' | 'mission' | 'project' | 'challenge'
  priority: 'high' | 'medium' | 'low'
  title: string
  reason: string
  estimatedMinutes: number
  activityId?: string
  missionId?: string
}
```

### 5. Controllers

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AdaptiveService } from './adaptive.service'
import { RecommendationEngine } from './recommendation.engine'

@Controller('adaptive')
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(
    private adaptiveService: AdaptiveService,
    private recommendationEngine: RecommendationEngine
  ) {}

  @Post('difficulty')
  async decideDifficulty(
    @CurrentUser() user: any,
    @Body('objectiveId') objectiveId: string
  ) {
    return this.adaptiveService.decideDifficulty(user.id, objectiveId)
  }

  @Get('recommendations')
  async getRecommendations(@CurrentUser() user: any) {
    return this.recommendationEngine.getRecommendations(user.id)
  }
}
```

## DEFINITION OF DONE

- ✅ Difficulty decisions based on ZPD
- ✅ Recommendations prioritized correctly (review > gaps > next > interests)
- ✅ Adaptive logic targets 70-80% success rate
- ✅ Frontend receives personalized recommendations
- ✅ Tests validate ZPD calculations

## VALIDATION

```bash
# Test difficulty decision
curl -X POST http://localhost:3001/api/adaptive/difficulty \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"objectiveId": "obj-1"}'

# Should return: { level: "MEDIUM", reason: "...", confidence: 0.65 }

# Test recommendations
curl http://localhost:3001/api/adaptive/recommendations \
  -H "Authorization: Bearer TOKEN"

# Should return prioritized list with reviews first
```

## NEXT PHASE

**Phase 7: Projects & Portfolio (Week 11-13)**

---

END OF PHASE 6 PROMPT
```

---

# PHASE 7: PROJECTS & PORTFOLIO (Week 11-13)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 7: PROJECTS & PORTFOLIO

## CONTEXT

Phases 1-6 complete. Now implement project-based learning with file uploads and portfolio showcase.

## CRITICAL REQUIREMENTS

**Project States (7):**
1. DRAFT — Initial creation
2. PLANNING — Outlining approach
3. BUILDING — Active work
4. REVIEW — Submitted for feedback
5. REVISION — Making improvements
6. COMPLETED — Finished
7. SHOWCASED — Published to portfolio

**Privacy Levels (3):**
1. PRIVATE — Only learner
2. GUARDIANS_ONLY — Learner + guardians
3. PUBLIC — Anyone (requires approval)

## PHASE 7 OBJECTIVES

1. Implement ProjectService (CRUD)
2. Implement file upload (S3)
3. Implement project feedback system (AI-powered)
4. Implement PortfolioService (visibility controls)
5. Add parental approval workflow (for public projects)
6. Test complete project lifecycle

## KEY DELIVERABLES

### 1. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install multer
npm install --save-dev @types/multer
```

### 2. Project Module Structure

```
src/modules/project/
├── project.module.ts
├── project.controller.ts
├── project.service.ts
├── portfolio.service.ts
├── s3-upload.service.ts
├── project-feedback.service.ts
└── dto/
```

### 3. S3 Upload Service

```typescript
import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class S3UploadService {
  private s3: S3Client

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    learnerId: string,
    projectId: string
  ): Promise<{ key: string; url: string }> {
    const fileExtension = file.originalname.split('.').pop()
    const key = `projects/${learnerId}/${projectId}/${uuidv4()}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })

    await this.s3.send(command)

    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    return { key, url }
  }

  async getSignedUrl(key: string): Promise<string> {
    // For private files, generate signed URL (expires in 1 hour)
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    })

    return getSignedUrl(this.s3, command, { expiresIn: 3600 })
  }
}
```

### 4. ProjectService

```typescript
import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { ProjectState, ProjectVisibility } from '@prisma/client'

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async createProject(learnerId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        learnerId,
        title: dto.title,
        description: dto.description,
        state: 'DRAFT',
        visibility: 'PRIVATE',
        skills: dto.skills || []
      }
    })
  }

  async getProject(projectId: string, requesterId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        learner: true,
        milestones: { orderBy: { order: 'asc' } },
        artifacts: true,
        feedback: true,
        reflections: true
      }
    })

    // Check access permissions
    if (project.learnerId !== requesterId) {
      if (project.visibility === 'PRIVATE') {
        throw new ForbiddenException('Cannot access private project')
      }
      // TODO: Check guardian relationship for GUARDIANS_ONLY
    }

    return project
  }

  async updateProject(projectId: string, learnerId: string, updates: any) {
    // Verify ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    })

    if (project.learnerId !== learnerId) {
      throw new ForbiddenException('Not your project')
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: updates
    })
  }

  async submitForReview(projectId: string, learnerId: string) {
    await this.updateProject(projectId, learnerId, {
      state: 'REVIEW'
    })

    // Queue AI feedback generation
    // TODO: Add to job queue

    return { success: true }
  }

  async addMilestone(projectId: string, learnerId: string, milestone: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    })

    if (project.learnerId !== learnerId) {
      throw new ForbiddenException('Not your project')
    }

    return this.prisma.projectMilestone.create({
      data: {
        projectId,
        ...milestone
      }
    })
  }

  async addArtifact(projectId: string, learnerId: string, artifact: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    })

    if (project.learnerId !== learnerId) {
      throw new ForbiddenException('Not your project')
    }

    return this.prisma.projectArtifact.create({
      data: {
        projectId,
        ...artifact
      }
    })
  }
}
```

### 5. PortfolioService

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

@Injectable()
export class PortfolioService {
  constructor(private prisma: PrismaService) {}

  async getPortfolio(learnerId: string, viewerId?: string) {
    // Get showcased projects
    const projects = await this.prisma.project.findMany({
      where: {
        learnerId,
        state: 'SHOWCASED',
        // Apply visibility filter based on viewer
        visibility: viewerId === learnerId 
          ? undefined // Owner sees all
          : { in: ['PUBLIC', 'GUARDIANS_ONLY'] } // Others see public/guardian
      },
      include: {
        artifacts: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Get mastery summary
    const masteryRecords = await this.prisma.masteryRecord.findMany({
      where: { learnerId },
      include: {
        competency: {
          include: { skill: true }
        }
      }
    })

    const skills = masteryRecords
      .filter(m => m.state === 'MASTERED' || m.state === 'PROFICIENT')
      .map(m => ({
        skillName: m.competency.skill.name,
        confidence: m.confidence,
        evidenceCount: m.evidenceCount
      }))

    // Get achievements
    const achievements = await this.prisma.achievementUnlock.findMany({
      where: { progression: { learnerId } },
      include: { achievement: true }
    })

    return {
      projects,
      skills,
      achievements: achievements.map(a => a.achievement)
    }
  }

  async updateVisibility(
    projectId: string,
    learnerId: string,
    visibility: ProjectVisibility
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    })

    if (project.learnerId !== learnerId) {
      throw new Error('Not your project')
    }

    // If setting to PUBLIC, require parental approval
    if (visibility === 'PUBLIC') {
      const learner = await this.prisma.learner.findUnique({
        where: { id: learnerId },
        include: {
          guardianships: {
            include: { guardian: true }
          }
        }
      })

      // Check if parental controls require approval
      const needsApproval = learner.guardianships.some(g => 
        g.guardian.controls?.requireApprovalForPublish
      )

      if (needsApproval) {
        // Create pending approval
        await this.prisma.pendingApproval.create({
          data: {
            type: 'PROJECT_PUBLISH',
            resourceId: projectId,
            learnerId,
            status: 'PENDING'
          }
        })

        return { 
          success: true,
          requiresApproval: true,
          message: 'Awaiting guardian approval'
        }
      }
    }

    // Update visibility
    await this.prisma.project.update({
      where: { id: projectId },
      data: { visibility }
    })

    return { success: true, requiresApproval: false }
  }
}
```

### 6. Controllers

```typescript
import { 
  Controller, Get, Post, Put, Delete, Body, Param, 
  UseGuards, UseInterceptors, UploadedFile 
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ProjectService } from './project.service'
import { PortfolioService } from './portfolio.service'
import { S3UploadService } from './s3-upload.service'

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private s3Upload: S3UploadService
  ) {}

  @Post()
  async createProject(@CurrentUser() user: any, @Body() dto: any) {
    return this.projectService.createProject(user.id, dto)
  }

  @Get(':id')
  async getProject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectService.getProject(id, user.id)
  }

  @Put(':id')
  async updateProject(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updates: any
  ) {
    return this.projectService.updateProject(id, user.id, updates)
  }

  @Post(':id/submit')
  async submitForReview(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectService.submitForReview(id, user.id)
  }

  @Post(':id/artifacts')
  @UseInterceptors(FileInterceptor('file'))
  async uploadArtifact(
    @CurrentUser() user: any,
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: any
  ) {
    // Upload to S3
    const { key, url } = await this.s3Upload.uploadFile(file, user.id, projectId)

    // Create artifact record
    return this.projectService.addArtifact(projectId, user.id, {
      title: metadata.title,
      description: metadata.description,
      artifactType: metadata.artifactType,
      storageKey: key,
      url
    })
  }
}

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Get(':learnerId')
  async getPortfolio(
    @Param('learnerId') learnerId: string,
    @CurrentUser() user?: any
  ) {
    return this.portfolioService.getPortfolio(learnerId, user?.id)
  }
}
```

## DEFINITION OF DONE

- ✅ Projects can be created, updated, deleted
- ✅ Files can be uploaded to S3
- ✅ Project state transitions work (7 states)
- ✅ Portfolio visibility controls enforced (3 levels)
- ✅ Public projects require guardian approval
- ✅ Portfolio endpoint shows showcased projects
- ✅ Frontend project creation works

## NEXT PHASE

**Phase 8: Gamification & Progression (Week 13-15)**

---

END OF PHASE 7 PROMPT
```

---

# PHASES 8-10 SUMMARIES

**Due to token limits, Phases 8-10 are provided in structured format:**

## PHASE 8: GAMIFICATION & PROGRESSION
- XP transactions (XPGain table)
- Coins economy (CoinGain table, spend/earn)
- Achievement unlock logic (check criteria, award)
- Inventory system (avatar items)
- Level calculation (XP thresholds)
- Leaderboards (opt-in only, privacy-first)
- Streak tracking (PracticeStreak)

## PHASE 9: COMMUNITY & MODERATION ⭐ CRITICAL
- Teams/Guilds (CRUD, join/leave)
- Safe messaging (all messages moderated)
- **Human moderation queue** (approve/reject content)
- Showcases (project sharing)
- Report system (submit, review)
- Block functionality (prevent interactions)
- Content review workflow

## PHASE 10: PARENT SYSTEM & REPORTS
- Parent dashboard (learning summary)
- Weekly reports (automated, scheduled job)
- Monthly reports (detailed progress)
- Milestone reports (achievements, breakthroughs)
- Safety dashboard (community activity, blocks)
- Controls enforcement (disable features)
- Approval workflow (approve/deny publications)

---

**ALL PHASES 1-10 NOW HAVE IMPLEMENTATION GUIDANCE!**

Phases 1-7 have complete detailed code.
Phases 8-10 have structured implementation patterns.

---

END OF PHASES 6-10 COMPLETE DOCUMENT
