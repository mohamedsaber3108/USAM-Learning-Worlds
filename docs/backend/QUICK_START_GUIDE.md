# QUICK START GUIDE: USAM Learning Worlds Backend
## From Zero to Running in 30 Minutes

**This guide will get you from nothing to a running backend with seeded data.**

---

## PREREQUISITES

**Required:**
- Node.js 18+ ([https://nodejs.org](https://nodejs.org))
- Docker Desktop ([https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))
- Git
- Code editor (VS Code recommended)

**AWS Account Setup:**
- AWS Account with Bedrock access
- AWS CLI configured (`aws configure`)
- IAM user with Bedrock permissions

---

## STEP 1: CLONE & SETUP (5 minutes)

```bash
# Create project directory
mkdir usam-learning-worlds-backend
cd usam-learning-worlds-backend

# Initialize Node.js project
npm init -y

# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create NestJS project
nest new . --skip-git

# Install all dependencies
npm install @nestjs/config @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
npm install @prisma/client prisma
npm install @nestjs/bull bull
npm install ioredis
npm install class-validator class-transformer
npm install @aws-sdk/client-bedrock-runtime @aws-sdk/client-s3
npm install helmet compression
npm install @nestjs/throttler

# Dev dependencies
npm install --save-dev @types/passport-jwt @types/bcrypt @types/node
```

---

## STEP 2: ENVIRONMENT CONFIGURATION (5 minutes)

Create `.env` file in project root:

```bash
# Database
DATABASE_URL="postgresql://usam:usam_password@localhost:5432/usam_learning_worlds?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
JWT_ACCESS_SECRET="your-super-secret-access-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_BUCKET="usam-learning-worlds-dev"

# AWS Bedrock Models
BEDROCK_HAIKU_MODEL="anthropic.claude-3-haiku-20240307-v1:0"
BEDROCK_SONNET_MODEL="anthropic.claude-3-5-sonnet-20240620-v1:0"

# Application
NODE_ENV="development"
PORT="3001"
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"

# Observability (Optional for MVP)
SENTRY_DSN=""
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces"
LOG_LEVEL="debug"
```

---

## STEP 3: DOCKER SERVICES (5 minutes)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: usam-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: usam_learning_worlds
      POSTGRES_USER: usam
      POSTGRES_PASSWORD: usam_password
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U usam"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: usam-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: usam-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@usam.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    depends_on:
      - postgres

volumes:
  postgres-data:
  redis-data:
  pgadmin-data:
```

**Start services:**

```bash
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f postgres
```

---

## STEP 4: PRISMA SETUP (5 minutes)

### Initialize Prisma

```bash
npx prisma init
```

### Create Complete Schema

Copy the complete Prisma schema from **Phase 1** documentation into `prisma/schema.prisma`.

**Quick version** (simplified, refer to Phase 1 for complete 81-table schema):

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Identity
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  learner  Learner?
  guardian Guardian?
}

enum Role {
  LEARNER
  GUARDIAN
  MODERATOR
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
}

model Learner {
  id          String   @id @default(uuid())
  userId      String   @unique
  firstName   String
  displayName String
  ageBand     AgeBand
  avatarUrl   String?
  status      LearnerStatus @default(ACTIVE)
  
  user        User     @relation(fields: [userId], references: [id])
  
  // Relations (add as you implement phases)
  progression    Progression?
  masteryRecords MasteryRecord[]
  evidence       Evidence[]
  
  @@index([userId])
}

enum AgeBand {
  AGE_8_9
  AGE_10_11
  AGE_12_14
}

enum LearnerStatus {
  ACTIVE
  INACTIVE
  GRADUATED
}

// Add remaining models from Phase 1 documentation...
```

### Run Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name init

# Verify database
npx prisma studio
# Opens browser at http://localhost:5555
```

---

## STEP 5: SEED DATA (3 minutes)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create test learner
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'learner@test.com',
      passwordHash,
      role: 'LEARNER',
      learner: {
        create: {
          firstName: 'Alex',
          displayName: 'AlexTheExplorer',
          ageBand: 'AGE_10_11'
        }
      }
    },
    include: { learner: true }
  })

  // Create progression record
  await prisma.progression.create({
    data: {
      learnerId: user.learner.id,
      level: 1,
      totalXP: 0,
      coins: 100
    }
  })

  // Create test guardian
  const guardianUser = await prisma.user.create({
    data: {
      email: 'parent@test.com',
      passwordHash,
      role: 'GUARDIAN',
      guardian: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    },
    include: { guardian: true }
  })

  // Link guardian to learner
  await prisma.guardianship.create({
    data: {
      guardianId: guardianUser.guardian.id,
      learnerId: user.learner.id,
      relationship: 'PARENT',
      status: 'ACTIVE'
    }
  })

  // Seed domains (12 domains)
  const domains = [
    { name: 'Mathematics', slug: 'mathematics', icon: '🔢', color: '#3B82F6' },
    { name: 'Science', slug: 'science', icon: '🔬', color: '#10B981' },
    { name: 'Engineering', slug: 'engineering', icon: '⚙️', color: '#F59E0B' },
    { name: 'Technology', slug: 'technology', icon: '💻', color: '#8B5CF6' },
    { name: 'Arts', slug: 'arts', icon: '🎨', color: '#EC4899' },
    { name: 'Language', slug: 'language', icon: '📚', color: '#EF4444' },
    { name: 'Social Studies', slug: 'social-studies', icon: '🌍', color: '#14B8A6' },
    { name: 'Health', slug: 'health', icon: '❤️', color: '#F43F5E' },
    { name: 'Music', slug: 'music', icon: '🎵', color: '#A855F7' },
    { name: 'Physical Education', slug: 'physical-education', icon: '⚽', color: '#22C55E' },
    { name: 'Critical Thinking', slug: 'critical-thinking', icon: '🧠', color: '#6366F1' },
    { name: 'Creativity', slug: 'creativity', icon: '✨', color: '#F472B6' }
  ]

  for (const domain of domains) {
    await prisma.domain.create({ data: domain })
  }

  // Seed Azouz character
  await prisma.character.create({
    data: {
      name: 'Azouz',
      role: 'GUIDE',
      personality: {
        traits: ['curious', 'encouraging', 'wise', 'playful'],
        style: 'Socratic questioning with warmth'
      },
      systemPrompt: 'You are Azouz, a friendly AI guide helping children learn...',
      avatarUrl: '/characters/azouz.png',
      isActive: true
    }
  })

  console.log('✅ Seed data created')
  console.log('📧 Test learner: learner@test.com / password123')
  console.log('📧 Test guardian: parent@test.com / password123')
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

**Run seed:**

```bash
# Add to package.json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}

# Install ts-node
npm install --save-dev ts-node

# Run seed
npx prisma db seed
```

---

## STEP 6: BASIC NESTJS SETUP (5 minutes)

### Update `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

### Create Prisma Service:

```bash
mkdir -p src/database
```

Create `src/database/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
    console.log('✅ Database connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

Create `src/database/database.module.ts`:

```typescript
import { Module, Global } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class DatabaseModule {}
```

### Update `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule
  ]
})
export class AppModule {}
```

---

## STEP 7: HEALTH CHECK ENDPOINT (2 minutes)

Update `src/app.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common'
import { PrismaService } from './database/prisma.service'

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    // Check database connection
    await this.prisma.$queryRaw`SELECT 1`
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    }
  }

  @Get('api/domains')
  async getDomains() {
    const domains = await this.prisma.domain.findMany()
    return domains
  }
}
```

---

## STEP 8: RUN THE APPLICATION (1 minute)

```bash
# Start in development mode
npm run start:dev

# Application should start on http://localhost:3001
```

### Test the endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Get domains (seeded data)
curl http://localhost:3001/api/domains
```

**Expected response:**

```json
{
  "status": "ok",
  "timestamp": "2026-08-12T10:00:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## STEP 9: VERIFY COMPLETE SETUP

### ✅ Checklist:

- [ ] Docker services running (`docker-compose ps`)
- [ ] PostgreSQL accessible (port 5432)
- [ ] Redis accessible (port 6379)
- [ ] Prisma schema migrated
- [ ] Seed data created
- [ ] NestJS app running (port 3001)
- [ ] Health endpoint returns 200
- [ ] Domains endpoint returns 12 domains

### Access Points:

- **Backend API**: [http://localhost:3001](http://localhost:3001)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555) (run `npx prisma studio`)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050) (admin@usam.local / admin)
- **API Health**: [http://localhost:3001/health](http://localhost:3001/health)

---

## NEXT STEPS

**You now have a working foundation! Proceed with phases:**

1. ✅ **Phase 1 Complete** — Foundation & Database
2. **Phase 2** — Implement authentication ([BACKEND_IMPLEMENTATION_PHASES.md](BACKEND_IMPLEMENTATION_PHASES.md))
3. **Phase 3** — Implement mastery algorithm ([PHASES_3_12_DETAILED.md](PHASES_3_12_DETAILED.md))
4. Continue through Phase 12...

---

## TROUBLESHOOTING

### Database connection fails

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or change port in .env
PORT="3002"
```

### Prisma generate fails

```bash
# Clear Prisma cache
npx prisma generate --clear-cache

# Regenerate
npx prisma generate
```

### AWS Bedrock access denied

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Bedrock service availability in region
aws bedrock list-foundation-models --region us-east-1

# Request Bedrock model access (if needed)
# Go to AWS Console → Bedrock → Model access → Request access
```

---

## DEVELOPMENT WORKFLOW

```bash
# Start all services
docker-compose up -d

# Start backend in watch mode
npm run start:dev

# Run database migrations
npx prisma migrate dev

# View database
npx prisma studio

# Run tests (once implemented)
npm run test

# Stop all services
docker-compose down
```

---

**🎉 You're ready to build! Refer to phase-specific documentation for detailed implementation.**

---

END OF QUICK START GUIDE
