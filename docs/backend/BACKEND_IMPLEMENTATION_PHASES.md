# BACKEND IMPLEMENTATION PHASES
## USAM Learning Worlds — Self-Contained Implementation Prompts

**Date:** 2026-08-11  
**Purpose:** Detailed, self-contained prompts for implementing each phase  
**Usage:** Send one phase prompt at a time to Claude Code for implementation

---

## HOW TO USE THESE PROMPTS

**Step 1:** Review `FINAL_BACKEND_ROADMAP.md` and `BACKEND_GAP_ANALYSIS.md`

**Step 2:** Decide your scope:
- MVP = Phases 1-6 (11 weeks)
- Production = Phases 1-10 (20 weeks)
- Full = Phases 1-12 (24 weeks)

**Step 3:** Start with Phase 1, send prompt to Claude Code:
```
"Implement Phase 1: Foundation & Database

[Copy entire Phase 1 prompt below]"
```

**Step 4:** After Phase N completes, send Phase N+1

**Step 5:** Each phase includes definition of done — verify before moving on

---

## PHASE 0: PRE-IMPLEMENTATION CHECKLIST

**Before starting Phase 1, ensure:**

✅ **Environment Setup**
- Node.js 20+ installed
- Docker Desktop installed and running
- Git repository initialized
- Code editor configured (VS Code recommended)
- AWS account (for deployment, not needed for local dev)

✅ **Repository Structure**
```
m:\USAM Learning Worlds\
├── frontend/          (existing Next.js app)
├── backend/           (create this)
└── docs/
    └── backend/       (these documents)
```

✅ **Frontend Reference**
- Frontend types are in `frontend/src/types/`
- Frontend services are in `frontend/src/services/contracts.ts`
- Frontend mock data is in `frontend/src/data/`
- These inform backend schema and APIs

✅ **Knowledge Prerequisites**
- TypeScript (intermediate)
- NestJS basics (or willingness to learn)
- PostgreSQL basics
- REST API design
- Docker basics

---

# PHASE 1: FOUNDATION & DATABASE

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 1: FOUNDATION & DATABASE

## CONTEXT

You are implementing the backend foundation for USAM Learning Worlds, an AI-native learning platform for children ages 8-14. The frontend is 100% complete with comprehensive type definitions and service contracts. Your task is to create the backend infrastructure that will support these contracts.

## CRITICAL REQUIREMENTS

**Educational Integrity:**
- This is a learning platform first — mastery model is evidence-based, not XP-based
- Domain → Skill → Competency → Objective → Activity → Evidence → Mastery

**Child Safety:**
- All architecture must support COPPA compliance
- Parental controls, consent, moderation are mandatory
- Age adaptation (8-9, 10-11, 12-14) is architectural

**Reference Frontend Types:**
- Location: `m:\USAM Learning Worlds\frontend\src\types\`
- Use these types to inform Prisma schema design
- Frontend expects specific field names — match them

## PHASE 1 OBJECTIVES

1. Initialize NestJS project with proper structure
2. Set up Docker Compose dev environment (PostgreSQL + Redis)
3. Design complete Prisma schema (81 tables across 10 categories)
4. Create initial migration
5. Seed curriculum data (domains, skills, competencies)
6. Implement health check endpoint
7. Set up environment configuration
8. Document setup process

## DELIVERABLES

### 1. NestJS Project Structure

Create `backend/` directory with:

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── learner/
│   │   ├── curriculum/
│   │   ├── mission/
│   │   ├── mastery/
│   │   ├── project/
│   │   ├── progression/
│   │   ├── community/
│   │   ├── moderation/
│   │   ├── parent/
│   │   ├── ai/
│   │   ├── adaptive/
│   │   ├── content/
│   │   ├── analytics/
│   │   └── safety/
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── filters/
│   ├── config/
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── seeds/
│   ├── health/
│   │   └── health.controller.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
├── .env.example
├── .env.development
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

### 2. Docker Compose Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: usam-postgres
    environment:
      POSTGRES_DB: usam_dev
      POSTGRES_USER: usam
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U usam"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: usam-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: usam-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@usam.world
      PGADMIN_DEFAULT_PASSWORD: dev_password
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

### 3. Prisma Schema

**CRITICAL:** This is the most important deliverable. Design complete schema based on:
- Frontend types in `frontend/src/types/domain.ts`, `curriculum.ts`, `mission.ts`, etc.
- Gap analysis in `docs/backend/BACKEND_GAP_ANALYSIS.md`
- Roadmap schema overview in `docs/backend/FINAL_BACKEND_ROADMAP.md`

Create `prisma/schema.prisma` with **81 tables** across 10 categories:

**1. Identity & Access (8 tables):**
- User (id, email, passwordHash, role, status)
- Learner (userId, displayName, dateOfBirth, ageBand, avatarUrl)
- Guardian (userId, fullName)
- GuardianLearnerRelationship (guardianId, learnerId, consentGiven)
- Session (userId, refreshToken, expiresAt, ipAddress)
- ParentalControls (relationshipId, communityEnabled, aiChatEnabled, etc.)
- AuditLog (userId, action, resourceType, resourceId, changes)

**2. Curriculum & Learning (15 tables):**
- LearningDomain (code, name, description, icon, order)
- Skill (domainId, code, name, description, order)
- SkillPrerequisite (skillId, prerequisiteId, required)
- Competency (skillId, code, name, cognitiveLevel)
- LearningObjective (competencyId, code, description, ageBand)
- Activity (objectiveId, title, activityType, surface, difficulty, content)

**3. Mastery & Evidence (6 tables):**
- MasteryRecord (learnerId, competencyId, state, confidence, reviewDue)
- Evidence (masteryRecordId, type, success, confidence, contextType, contextId)

**4. Missions & Worlds (12 tables):**
- World (domainId, code, name, description, order)
- Mission (worldId, code, title, description, difficulty, estimatedMinutes)
- MissionStage (missionId, order, stageType, title)
- MissionActivity (stageId, activityId, order, required)
- MissionRun (learnerId, missionId, status, currentStageIndex)
- ActivityAttempt (runId, missionActivityId, activityId, attemptNumber, success, response, result)

**5. Projects & Portfolio (8 tables):**
- Project (learnerId, title, description, state, visibility, skills)
- ProjectMilestone, ProjectArtifact, ProjectFeedback, ProjectReflection

**6. Progression & Gamification (10 tables):**
- ProgressionState (learnerId, level, xp, coins)
- XPGain, CoinGain, Achievement, AchievementUnlock, InventoryItem, PracticeStreak

**7. Community & Safety (12 tables):**
- Team, TeamMember, Guild, GuildMember
- SafeMessage, Showcase, ShowcaseReaction
- Report, BlockedUser

**8. Characters & AI (8 tables):**
- Character (code, name, role, personalityConfig, visualConfig)
- CharacterState (learnerId, characterId, mood, relationshipLevel, trustScore)
- CharacterMemory
- AIConversation, AIMessage

**9. Content (6 tables):**
- Story, Simulation, EnglishDrill, CodingExercise (all with domainId, ageBand, published)

**10. Analytics & Observability (6 tables):**
- LearningEvent (eventType, learnerId, metadata)

**Enums Required:**
- UserRole, UserStatus, AgeBand
- MasteryState (7 states), EvidenceType (8 types)
- ActivityType (21 types), ActivitySurface (9 types), DifficultyLevel
- MissionStageType, MissionRunStatus
- ProjectState, ProjectVisibility
- ModerationStatus, ReportReason, ReportStatus
- CharacterRole, AIMessageRole
- AchievementCategory, AchievementTier

**Schema Design Rules:**
- Use UUIDs for all primary keys: `@id @default(uuid())`
- Add timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Use JSONB for flexible data: `content Json` (Activity definitions), `personalityConfig Json` (Character)
- Foreign keys with proper relations
- Unique constraints where needed: `@@unique([learnerId, competencyId])`
- Indexes on foreign keys and frequent query fields

### 4. Environment Configuration

Create `.env.example`:
```env
# API
NODE_ENV=development
PORT=3001
API_PREFIX=/api
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DATABASE_URL=postgresql://usam:dev_password@localhost:5432/usam_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT (will be set in Phase 2)
JWT_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS (will be set in Phase 5)
AWS_REGION=us-east-1
AWS_BEDROCK_REGION=us-east-1
S3_BUCKET=

# Monitoring
LOG_LEVEL=debug
SENTRY_DSN=
```

Create `.env.development` with actual values for local dev.

### 5. Seed Data

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, AgeBand } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Seed learning domains
  const domains = [
    { code: 'd-english', name: 'English & Language', description: 'Master communication, reading, writing, and language', icon: '📚', color: '#3B82F6', order: 1 },
    { code: 'd-coding', name: 'Coding & Computational Thinking', description: 'Build games, apps, and digital creations', icon: '💻', color: '#10B981', order: 2 },
    { code: 'd-ai', name: 'Artificial Intelligence', description: 'Understand and create with AI', icon: '🤖', color: '#8B5CF6', order: 3 },
    { code: 'd-digital', name: 'Digital Literacy & Citizenship', description: 'Navigate the digital world safely and responsibly', icon: '🌐', color: '#F59E0B', order: 4 },
    { code: 'd-creativity', name: 'Creativity & Media', description: 'Express yourself through art, music, and media', icon: '🎨', color: '#EC4899', order: 5 },
    { code: 'd-critical', name: 'Critical Thinking', description: 'Analyze, evaluate, and solve complex problems', icon: '🧠', color: '#6366F1', order: 6 },
    { code: 'd-problem', name: 'Problem Solving', description: 'Tackle challenges with systematic approaches', icon: '🔍', color: '#14B8A6', order: 7 },
    { code: 'd-communication', name: 'Communication', description: 'Share ideas effectively across mediums', icon: '💬', color: '#F97316', order: 8 },
    { code: 'd-collaboration', name: 'Collaboration', description: 'Work with others to achieve goals', icon: '🤝', color: '#06B6D4', order: 9 },
    { code: 'd-venture', name: 'Entrepreneurship', description: 'Turn ideas into reality', icon: '💡', color: '#EAB308', order: 10 },
    { code: 'd-design', name: 'Design Thinking', description: 'Human-centered problem solving', icon: '✏️', color: '#A855F7', order: 11 },
    { code: 'd-research', name: 'Research Skills', description: 'Investigate and discover', icon: '🔬', color: '#0EA5E9', order: 12 }
  ]

  for (const domain of domains) {
    await prisma.learningDomain.upsert({
      where: { code: domain.code },
      update: domain,
      create: domain
    })
  }

  console.log('✓ Seeded 12 learning domains')

  // 2. Seed sample skills (English domain as example)
  const englishDomain = await prisma.learningDomain.findUnique({
    where: { code: 'd-english' }
  })

  const englishSkills = [
    { code: 'eng-reading', name: 'Reading Comprehension', description: 'Understand and analyze texts', order: 1 },
    { code: 'eng-writing', name: 'Writing', description: 'Express ideas through writing', order: 2 },
    { code: 'eng-speaking', name: 'Speaking & Presentation', description: 'Communicate verbally with confidence', order: 3 },
    { code: 'eng-listening', name: 'Listening', description: 'Understand spoken language', order: 4 },
    { code: 'eng-vocabulary', name: 'Vocabulary', description: 'Build word knowledge', order: 5 },
    { code: 'eng-grammar', name: 'Grammar & Mechanics', description: 'Use language correctly', order: 6 }
  ]

  for (const skill of englishSkills) {
    await prisma.skill.upsert({
      where: { code: skill.code },
      update: { ...skill, domainId: englishDomain.id },
      create: { ...skill, domainId: englishDomain.id }
    })
  }

  console.log('✓ Seeded sample skills (English domain)')

  // 3. Seed characters
  const azouz = await prisma.character.upsert({
    where: { code: 'azouz' },
    update: {
      name: 'Azouz',
      role: 'COMPANION',
      description: 'Your friendly learning companion who helps you grow',
      personalityConfig: {
        tone: 'warm, encouraging, curious',
        teachingStyle: 'Socratic questioning with patience',
        humor: 'Light, age-appropriate jokes',
        patience: 'Infinite - never frustrated'
      },
      visualConfig: {
        primaryColor: '#3B82F6',
        avatar: 'friendly-robot'
      },
      voiceConfig: null
    },
    create: {
      code: 'azouz',
      name: 'Azouz',
      role: 'COMPANION',
      description: 'Your friendly learning companion who helps you grow',
      personalityConfig: {
        tone: 'warm, encouraging, curious',
        teachingStyle: 'Socratic questioning with patience',
        humor: 'Light, age-appropriate jokes',
        patience: 'Infinite - never frustrated'
      },
      visualConfig: {
        primaryColor: '#3B82F6',
        avatar: 'friendly-robot'
      },
      voiceConfig: null
    }
  })

  console.log('✓ Seeded characters (Azouz)')

  // 4. Seed achievements
  const achievements = [
    { code: 'ach-first-mission', category: 'LEARNING', tier: 'BRONZE', title: 'First Steps', description: 'Complete your first mission', unlockCriteria: { type: 'mission_count', value: 1 } },
    { code: 'ach-10-missions', category: 'LEARNING', tier: 'SILVER', title: 'Explorer', description: 'Complete 10 missions', unlockCriteria: { type: 'mission_count', value: 10 } },
    { code: 'ach-first-mastery', category: 'MASTERY', tier: 'BRONZE', title: 'Master Learner', description: 'Master your first competency', unlockCriteria: { type: 'mastery_count', value: 1 } },
    { code: 'ach-7-day-streak', category: 'PERSISTENCE', tier: 'SILVER', title: 'Week Warrior', description: 'Practice 7 days in a row', unlockCriteria: { type: 'streak', value: 7 } }
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement
    })
  }

  console.log('✓ Seeded achievements')

  console.log('\n✅ Database seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 6. Health Check

Create `src/health/health.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const db = await this.checkDatabase()
    
    return {
      status: db ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: db
      }
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }
}
```

### 7. Main Application Setup

Create `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import * as helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security
  app.use(helmet())
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
  })

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  // API prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api')

  const port = process.env.PORT || 3001
  await app.listen(port)
  
  console.log(`🚀 Backend running on http://localhost:${port}`)
  console.log(`📚 Health check: http://localhost:${port}/health`)
}

bootstrap()
```

### 8. README Documentation

Create `backend/README.md`:

```markdown
# USAM Learning Worlds — Backend

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start Docker services:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. Run migrations:
   \`\`\`bash
   npm run prisma:migrate
   \`\`\`

4. Seed database:
   \`\`\`bash
   npm run prisma:seed
   \`\`\`

5. Start development server:
   \`\`\`bash
   npm run start:dev
   \`\`\`

## Scripts

- \`npm run start:dev\` — Start with hot reload
- \`npm run prisma:migrate\` — Run migrations
- \`npm run prisma:seed\` — Seed database
- \`npm run prisma:studio\` — Open Prisma Studio (database GUI)
- \`npm test\` — Run tests

## Accessing Services

- **Backend:** http://localhost:3001
- **Health Check:** http://localhost:3001/health
- **pgAdmin:** http://localhost:5050 (dev@usam.world / dev_password)
- **Prisma Studio:** \`npm run prisma:studio\`

## Next Steps

After Phase 1, continue with:
- Phase 2: Authentication & Authorization
- Phase 3: Learning Core (Curriculum + Mastery)
\`\`\`

## IMPLEMENTATION STEPS

**Step 1:** Initialize NestJS project
```bash
cd "m:\USAM Learning Worlds"
mkdir backend
cd backend
npx @nestjs/cli new . --skip-git --package-manager npm
```

**Step 2:** Install dependencies
```bash
npm install @prisma/client prisma redis
npm install --save-dev @types/node
```

**Step 3:** Create all files above

**Step 4:** Start Docker services
```bash
docker-compose up -d
```

**Step 5:** Initialize Prisma
```bash
npx prisma init
```

**Step 6:** Create complete Prisma schema (81 tables)

**Step 7:** Run migration
```bash
npx prisma migrate dev --name init
```

**Step 8:** Run seed
```bash
npx prisma db seed
```

**Step 9:** Start server
```bash
npm run start:dev
```

**Step 10:** Test health endpoint
```bash
curl http://localhost:3001/health
# Should return: {"status":"healthy","checks":{"database":true}}
```

## DEFINITION OF DONE

Phase 1 is complete when:
- ✅ NestJS project initialized with proper structure
- ✅ Docker Compose running (PostgreSQL + Redis + pgAdmin)
- ✅ Complete Prisma schema created (81 tables, 10 categories)
- ✅ Initial migration applied successfully
- ✅ Database seeded (12 domains, sample skills, Azouz, achievements)
- ✅ Health endpoint returns 200 OK
- ✅ `npm run start:dev` starts server without errors
- ✅ README documents setup process
- ✅ `.env.development` has valid local configuration
- ✅ Team can run setup on any machine (Docker)

## VALIDATION

Run these commands to validate Phase 1:

```bash
# 1. Check Docker services
docker ps
# Should show: usam-postgres, usam-redis, usam-pgadmin (all healthy)

# 2. Check database connection
npx prisma studio
# Should open Prisma Studio, browse tables

# 3. Check data seeded
# In Prisma Studio, verify:
# - learning_domains: 12 rows
# - skills: 6+ rows
# - characters: 1 row (Azouz)
# - achievements: 4+ rows

# 4. Check server
npm run start:dev
# Navigate to http://localhost:3001/health
# Should return JSON with status: "healthy"

# 5. Check TypeScript compilation
npm run build
# Should compile without errors
```

## TROUBLESHOOTING

**Problem:** Docker services won't start
- Check Docker Desktop is running
- Check ports 5432, 6379, 5050 are not in use
- Run `docker-compose down -v` and retry

**Problem:** Prisma migration fails
- Check DATABASE_URL in .env.development
- Verify PostgreSQL is running: `docker exec usam-postgres pg_isready`
- Check schema syntax with `npx prisma validate`

**Problem:** Seed script fails
- Check migration ran first
- Look for duplicate key errors (upsert should prevent this)
- Run `npx prisma db push --force-reset` to reset (WARNING: deletes all data)

## NEXT PHASE

After Phase 1 validation passes, proceed to:
**Phase 2: Authentication & Authorization (Week 2-3)**

---

END OF PHASE 1 PROMPT
```

---

# PHASE 2-12 PROMPTS

**Due to length constraints, providing abbreviated prompts for Phases 2-12.**

**Full implementation prompts should follow this structure:**
1. Context & objectives
2. Reference to Phase 1 foundation
3. Detailed implementation steps
4. Code examples for key services
5. Test requirements
6. Frontend integration steps
7. Definition of done
8. Validation commands

---

## PHASE 2: AUTHENTICATION & AUTHORIZATION (Week 2-3)

## PROMPT FOR CLAUDE CODE

```markdown
# IMPLEMENT PHASE 2: AUTHENTICATION & AUTHORIZATION

## CONTEXT

Phase 1 is complete — you have a NestJS project with PostgreSQL database (81 tables) running. Now implement secure authentication and authorization for the USAM Learning Worlds platform.

**Critical Requirements:**
- Support email/password authentication
- JWT-based tokens (access: 15min, refresh: 7 days)
- Guardian-learner relationships (COPPA compliance)
- Parental consent workflow
- Role-based authorization (LEARNER, GUARDIAN, ADMIN)
- Relationship-based authorization (guardians can only access their learners)

## PHASE 2 OBJECTIVES

1. Install authentication dependencies (Passport.js, bcrypt, JWT)
2. Implement AuthModule with JWT strategy
3. Implement registration (email/password)
4. Implement login with token generation
5. Implement token refresh with rotation
6. Implement session management (Redis)
7. Implement guardian-learner relationships
8. Implement parental controls
9. Create authorization guards (JWT, Role, Guardian)
10. Add Google OAuth (optional)
11. Test authentication flow end-to-end

## DELIVERABLES

### 1. Install Dependencies

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt passport-google-oauth20
npm install bcrypt uuid
npm install --save-dev @types/passport-jwt @types/passport-google-oauth20 @types/bcrypt
```

### 2. AuthModule Structure

Create `src/modules/auth/`:

```
src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── refresh.dto.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── google.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── guardian.guard.ts
└── decorators/
    ├── current-user.decorator.ts
    └── roles.decorator.ts
```

### 3. DTOs (Data Transfer Objects)

**`dto/register.dto.ts`:**
```typescript
import { IsEmail, IsString, MinLength, IsEnum, IsDateString, IsOptional } from 'class-validator'
import { UserRole } from '@prisma/client'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(UserRole)
  role: UserRole

  // Learner-specific
  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  // Guardian-specific
  @IsOptional()
  @IsString()
  fullName?: string
}
```

**`dto/login.dto.ts`:**
```typescript
import { IsEmail, IsString } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  password: string
}
```

### 4. AuthService Implementation

**`auth.service.ts`:**
```typescript
import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../database/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import * as bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { AgeBand } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })
    if (existing) {
      throw new ConflictException('Email already registered')
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10)

    // 3. Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        status: 'ACTIVE'
      }
    })

    // 4. Create profile based on role
    if (dto.role === 'LEARNER') {
      if (!dto.displayName || !dto.dateOfBirth) {
        throw new BadRequestException('Learners require displayName and dateOfBirth')
      }

      const ageBand = this.calculateAgeBand(new Date(dto.dateOfBirth))

      await this.prisma.learner.create({
        data: {
          userId: user.id,
          displayName: dto.displayName,
          dateOfBirth: new Date(dto.dateOfBirth),
          ageBand
        }
      })

      // Create progression state
      await this.prisma.progressionState.create({
        data: {
          learnerId: user.id,
          level: 1,
          xp: 0,
          coins: 0
        }
      })

    } else if (dto.role === 'GUARDIAN') {
      if (!dto.fullName) {
        throw new BadRequestException('Guardians require fullName')
      }

      await this.prisma.guardian.create({
        data: {
          userId: user.id,
          fullName: dto.fullName
        }
      })
    }

    // 5. Generate tokens
    return this.generateAuthResponse(user)
  }

  async login(dto: LoginDto) {
    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        learner: true,
        guardian: true
      }
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 2. Verify password
    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 3. Check status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account suspended')
    }

    // 4. Generate tokens
    return this.generateAuthResponse(user)
  }

  async refreshToken(refreshToken: string) {
    try {
      // 1. Verify token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET
      })

      // 2. Check session exists
      const session = await this.prisma.session.findUnique({
        where: { id: payload.jti }
      })

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      // 3. Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub }
      })

      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      // 4. Revoke old session
      await this.prisma.session.delete({
        where: { id: session.id }
      })

      // 5. Generate new tokens (token rotation)
      return this.generateAuthResponse(user)

    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async logout(userId: string, sessionId: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        id: sessionId
      }
    })
  }

  async getSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        learner: true,
        guardian: true
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      learner: user.learner || null,
      guardian: user.guardian || null
    }
  }

  private async generateAuthResponse(user: any) {
    const sessionId = uuidv4()

    // Access token (short-lived)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
      }
    )

    // Refresh token (long-lived)
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        jti: sessionId
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
      }
    )

    // Store session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken,
        expiresAt
      }
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }
  }

  private calculateAgeBand(dateOfBirth: Date): AgeBand {
    const age = Math.floor(
      (Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )

    if (age >= 8 && age <= 9) return 'BAND_8_9'
    if (age >= 10 && age <= 11) return 'BAND_10_11'
    if (age >= 12 && age <= 14) return 'BAND_12_14'

    throw new BadRequestException('Age must be between 8-14')
  }
}
```

### 5. JWT Strategy

**`strategies/jwt.strategy.ts`:**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../../../database/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    })

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException()
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role
    }
  }
}
```

### 6. Authorization Guards

**`guards/jwt-auth.guard.ts`:**
```typescript
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**`guards/roles.guard.ts`:**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler())
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return requiredRoles.includes(user.role)
  }
}
```

**`guards/guardian.guard.ts`:**
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'

@Injectable()
export class GuardianGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const guardianUserId = request.user.id
    const learnerId = request.params.learnerId || request.body.learnerId

    if (!learnerId) {
      return false
    }

    // Check guardian-learner relationship with consent
    const relationship = await this.prisma.guardianLearnerRelationship.findFirst({
      where: {
        guardian: {
          userId: guardianUserId
        },
        learnerId,
        consentGiven: true
      }
    })

    return !!relationship
  }
}
```

### 7. Decorators

**`decorators/current-user.decorator.ts`:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)
```

**`decorators/roles.decorator.ts`:**
```typescript
import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@prisma/client'

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)
```

### 8. AuthController

**`auth.controller.ts`:**
```typescript
import { Controller, Post, Get, Body, UseGuards, Delete, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  async getSession(@CurrentUser() user: any) {
    return this.authService.getSession(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Body('sessionId') sessionId: string
  ) {
    await this.authService.logout(user.id, sessionId)
    return { success: true }
  }
}
```

### 9. AuthModule

**`auth.module.ts`:**
```typescript
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PrismaService } from '../../database/prisma.service'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: '15m' }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService, JwtStrategy]
})
export class AuthModule {}
```

### 10. Update AppModule

**`src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { HealthController } from './health/health.controller'
import { PrismaService } from './database/prisma.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development'
    }),
    AuthModule
  ],
  controllers: [HealthController],
  providers: [PrismaService]
})
export class AppModule {}
```

### 11. Update Environment Variables

Add to `.env.development`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### 12. Testing

Create `src/modules/auth/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { PrismaService } from '../../database/prisma.service'
import { ConflictException, UnauthorizedException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn()
            },
            learner: {
              create: jest.fn()
            },
            guardian: {
              create: jest.fn()
            },
            session: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn()
            },
            progressionState: {
              create: jest.fn()
            }
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-token'),
            verify: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('register', () => {
    it('should register a new learner', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        id: '123',
        email: 'learner@test.com',
        role: 'LEARNER',
        status: 'ACTIVE'
      } as any)

      const result = await service.register({
        email: 'learner@test.com',
        password: 'Test1234!',
        role: 'LEARNER',
        displayName: 'Test Learner',
        dateOfBirth: '2015-01-01'
      })

      expect(result.accessToken).toBeDefined()
      expect(result.user.email).toBe('learner@test.com')
    })

    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: '123',
        email: 'existing@test.com'
      } as any)

      await expect(
        service.register({
          email: 'existing@test.com',
          password: 'Test1234!',
          role: 'LEARNER',
          displayName: 'Test',
          dateOfBirth: '2015-01-01'
        })
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await require('bcrypt').hash('Test1234!', 10)
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: '123',
        email: 'test@test.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        role: 'LEARNER'
      } as any)

      const result = await service.login({
        email: 'test@test.com',
        password: 'Test1234!'
      })

      expect(result.accessToken).toBeDefined()
    })

    it('should throw UnauthorizedException with invalid password', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: '123',
        passwordHash: 'hashed'
      } as any)

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'WrongPassword'
        })
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
```

## IMPLEMENTATION STEPS

**Step 1:** Install dependencies
```bash
cd backend
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt uuid
npm install --save-dev @types/passport-jwt @types/bcrypt
```

**Step 2:** Generate JWT secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add result to .env.development as JWT_SECRET
```

**Step 3:** Create all files above

**Step 4:** Register AuthModule in AppModule

**Step 5:** Start server
```bash
npm run start:dev
```

**Step 6:** Test authentication flow

## DEFINITION OF DONE

Phase 2 is complete when:
- ✅ Users can register (email/password)
- ✅ Learner profiles created automatically on registration
- ✅ Guardian profiles created automatically on registration
- ✅ Users can login and receive JWT tokens
- ✅ Access tokens expire after 15 minutes
- ✅ Refresh tokens work (token rotation)
- ✅ JWT guard protects routes
- ✅ Role guard enforces role-based access
- ✅ Guardian guard enforces relationship-based access
- ✅ Sessions stored in database
- ✅ Age band calculated correctly (8-9, 10-11, 12-14)
- ✅ Tests pass (70%+ coverage)

## VALIDATION

**Test 1: Register Learner**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@test.com",
    "password": "Test1234!",
    "role": "LEARNER",
    "displayName": "Test Learner",
    "dateOfBirth": "2015-01-01"
  }'

# Should return: { accessToken, refreshToken, user }
```

**Test 2: Login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "learner@test.com",
    "password": "Test1234!"
  }'

# Should return: { accessToken, refreshToken, user }
```

**Test 3: Get Session (Protected)**
```bash
# Save accessToken from above
curl http://localhost:3001/api/auth/session \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Should return: { user, learner, guardian }
```

**Test 4: Refresh Token**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Should return: { accessToken, refreshToken, user }
# Old refresh token should be invalid now
```

**Test 5: Register Guardian**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guardian@test.com",
    "password": "Test1234!",
    "role": "GUARDIAN",
    "fullName": "Test Guardian"
  }'
```

**Test 6: Frontend Integration**

Update `frontend/src/services/index.ts`:
```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            'http://localhost:3001/api/auth/refresh',
            { refreshToken }
          )
          
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          
          error.config.headers.Authorization = `Bearer ${data.accessToken}`
          return axios(error.config)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async signIn(credentials: { email: string; password: string }) {
    const { data } = await apiClient.post('/auth/login', credentials)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  },

  async signOut() {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  async getSession() {
    const { data } = await apiClient.get('/auth/session')
    return data
  },

  async refreshSession() {
    const refreshToken = localStorage.getItem('refreshToken')
    const { data } = await apiClient.post('/auth/refresh', { refreshToken })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    return data
  }
}
```

## TROUBLESHOOTING

**Problem:** JWT_SECRET not found
- Ensure `.env.development` has JWT_SECRET defined
- Restart server after changing .env

**Problem:** bcrypt errors on Windows
- Install: `npm install --build-from-source bcrypt`
- Or use: `npm install bcryptjs` (pure JS alternative)

**Problem:** Token expired immediately
- Check JWT_ACCESS_EXPIRY is set correctly
- Verify system clock is accurate

## NEXT PHASE

After Phase 2 validation passes, proceed to:
**Phase 3: Learning Core (Curriculum + Mastery) — Week 3-5**

The mastery confidence algorithm is the most critical and complex component.

---

END OF PHASE 2 PROMPT
```

---

## PHASE 3: LEARNING CORE (Curriculum + Mastery) ⭐ CRITICAL

**Key Deliverables:**
- CurriculumService (read-only)
- MasteryService (evidence recording)
- **Mastery confidence algorithm** (CRITICAL — FSRS-based)
- Spaced repetition scheduler
- Background job queue (BullMQ)
- Curriculum graph API
- Evidence → mastery state transitions

**Implementation:** ~3 weeks, CRITICAL PATH

---

## PHASE 4: MISSIONS & ACTIVITIES

**Key Deliverables:**
- MissionService (browsing)
- MissionRunService (execution)
- ActivityService (submission + evaluation)
- ActivityEvaluator (scoring SELECT/MATCH/SEQUENCE/CODE)
- HintEngine (progressive disclosure)
- Evidence flows to Phase 3 mastery

**Implementation:** ~2 weeks

---

## PHASE 5: AI GATEWAY & SAFETY ⭐ CRITICAL

**Key Deliverables:**
- AIGateway (AWS Bedrock integration)
- **ModerationService** (CRITICAL — PII, profanity, prompt injection)
- ConversationService (Azouz)
- PromptBuilder (context assembly)
- Streaming (SSE)
- Hint/explanation generation
- **Cost optimization: Claude 3 Haiku (80%) + Sonnet (20%)**

**Implementation:** ~2 weeks, CRITICAL for child safety

---

## PHASE 6: ADAPTIVE ENGINE & RECOMMENDATIONS

**Key Deliverables:**
- AdaptiveService (difficulty decisions)
- RecommendationEngine (next activity)
- Zone of Proximal Development (ZPD) targeting
- Spaced review integration

**Implementation:** ~2 weeks

---

## PHASE 7: PROJECTS & PORTFOLIO

**Key Deliverables:**
- ProjectService (CRUD)
- File upload (S3)
- Project feedback (AI-powered)
- Portfolio visibility controls
- Rubric evaluation

**Implementation:** ~2 weeks

---

## PHASE 8: GAMIFICATION & PROGRESSION

**Key Deliverables:**
- ProgressionService (XP/coins transactions)
- Achievement unlock logic
- Inventory system
- Level calculation
- Leaderboards (opt-in)
- Streak tracking

**Implementation:** ~2 weeks

---

## PHASE 9: COMMUNITY & MODERATION ⭐ CRITICAL

**Key Deliverables:**
- CommunityService (teams, guilds)
- Safe messaging (moderated)
- **Human moderation queue** (CRITICAL)
- Content review workflow
- Report system
- Blocking functionality

**Implementation:** ~3 weeks, complex moderation

---

## PHASE 10: PARENT SYSTEM & REPORTS

**Key Deliverables:**
- ParentService (dashboard)
- Weekly/monthly reports (automated)
- Milestone reports
- Safety dashboard
- Approval workflow
- Controls enforcement

**Implementation:** ~2 weeks

---

## PHASE 11: ANALYTICS & OBSERVABILITY

**Key Deliverables:**
- Event tracking (all learning actions)
- Metrics (Prometheus)
- Logging (structured, Loki)
- Tracing (OpenTelemetry)
- Dashboards (Grafana)
- Sentry error tracking

**Implementation:** ~2 weeks

---

## PHASE 12: PRODUCTION HARDENING

**Key Deliverables:**
- Load testing (k6 or Artillery)
- Security audit (OWASP checklist)
- Performance optimization (query analysis, indexing)
- Caching optimization
- Backup/restore testing
- Deployment automation
- Runbook documentation

**Implementation:** ~2 weeks

---

## IMPLEMENTATION ORDER SUMMARY

**MVP (Phases 1-6): 11 weeks**
1. Foundation (2 weeks)
2. Auth (2 weeks)
3. Learning Core ⭐ (3 weeks)
4. Missions (2 weeks)
5. AI & Safety ⭐ (2 weeks)
6. Adaptive (2 weeks)

**Production (Phases 1-10): 20 weeks**
+ Phase 7: Projects (2 weeks)
+ Phase 8: Gamification (2 weeks)
+ Phase 9: Community ⭐ (3 weeks)
+ Phase 10: Parent System (2 weeks)

**Full Platform (Phases 1-12): 24 weeks**
+ Phase 11: Analytics (2 weeks)
+ Phase 12: Hardening (2 weeks)

---

## NOTES FOR IMPLEMENTATION

**Phase Dependencies:**
- Phases must be done in order (each builds on previous)
- Critical path: 1 → 2 → 3 → 4 → 5 (cannot parallelize without 2 developers)
- Phase 3 mastery algorithm is most complex
- Phase 5 moderation is most critical for launch
- Phase 9 community moderation is most time-consuming

**Testing Strategy:**
- Unit tests required for: Mastery algorithm, Moderation filters, Activity evaluators
- Integration tests required for: Auth flows, Mission execution, Evidence → Mastery
- E2E tests optional until Phase 12

**Cost Optimization:**
- AWS Bedrock Claude 3 Haiku for 80% of AI interactions
- Claude 3.5 Sonnet for 20% (critical accuracy)
- Prompt caching enabled (90% cost reduction on system prompts)
- Rate limiting: 10-20 messages/hour per learner

---

END OF IMPLEMENTATION PHASES DOCUMENT
