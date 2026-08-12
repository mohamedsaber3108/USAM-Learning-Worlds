# USAM Learning Worlds — Backend Documentation
## Complete Implementation & Deployment Guide

**Welcome to the complete backend documentation for USAM Learning Worlds, an AI-native learning platform for children aged 8-14.**

---

## 📚 DOCUMENTATION INDEX

### 🎯 Start Here

1. **[BACKEND_GAP_ANALYSIS.md](BACKEND_GAP_ANALYSIS.md)** — 100+ missing features identified
   - Current state assessment
   - Feature categorization (Infrastructure, Learning, AI, Community, Safety, Parent, Analytics)
   - Priority classification (P0 = Critical, P1 = High, P2 = Medium, P3 = Low)
   - Risk register

2. **[FINAL_BACKEND_ROADMAP.md](FINAL_BACKEND_ROADMAP.md)** — Strategic overview & planning
   - Architecture decisions & rationale
   - Technology stack (NestJS, PostgreSQL, Redis, AWS Bedrock)
   - 12-phase implementation plan
   - Timeline & resource requirements
   - Cost breakdown ($75K dev + $450/month infrastructure)
   - Database schema overview (81 tables)

### 🛠️ Implementation Phases (Detailed)

3. **[BACKEND_IMPLEMENTATION_PHASES.md](BACKEND_IMPLEMENTATION_PHASES.md)** — Phases 1-2
   - Phase 1: Foundation & Database (Week 1-2)
   - Phase 2: Authentication & Authorization (Week 2-3)
   - Complete TypeScript code with validation

4. **[PHASES_3_12_DETAILED.md](PHASES_3_12_DETAILED.md)** — Phases 3-5
   - Phase 3: Learning Core — Mastery Confidence Algorithm ⭐ (Week 3-5)
   - Phase 4: Missions & Activities (Week 5-7)
   - Phase 5: AI Gateway & Safety ⭐ (Week 7-9)
   - Complete TypeScript implementations

5. **[PHASES_6_10_COMPLETE.md](PHASES_6_10_COMPLETE.md)** — Phases 6-7
   - Phase 6: Adaptive Engine & Recommendations (Week 9-11)
   - Phase 7: Projects & Portfolio (Week 11-13)
   - Full code with S3 integration

6. **[PHASES_8_10_COMPLETE.md](PHASES_8_10_COMPLETE.md)** — Phases 8-10
   - Phase 8: Gamification & Progression (Week 13-15)
   - Phase 9: Community & Moderation ⭐ CRITICAL (Week 15-18)
   - Phase 10: Parent System & Reports (Week 18-20)
   - Complete safety implementations

7. **[PHASES_11_12_COMPLETE.md](PHASES_11_12_COMPLETE.md)** — Phases 11-12
   - Phase 11: Analytics & Observability (Week 20-22)
   - Phase 12: Production Hardening (Week 22-24)
   - OpenTelemetry, Prometheus, Grafana, Security audit

### 🚀 Getting Started

8. **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** — Zero to running in 30 minutes
   - Prerequisites & dependencies
   - Docker Compose setup (PostgreSQL, Redis, pgAdmin)
   - Prisma schema & migrations
   - Seed data creation
   - First API endpoint
   - Troubleshooting

9. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** — Production deployment on AWS
   - Architecture overview
   - AWS CDK infrastructure as code
   - ECS Fargate + RDS + ElastiCache + S3 + Bedrock
   - CI/CD pipeline (GitHub Actions)
   - Monitoring & alerting
   - Cost estimation
   - Production checklist

---

## 🏗️ ARCHITECTURE OVERVIEW

### Technology Stack

**Backend Framework:**
- Node.js 18+ with NestJS (TypeScript)
- Modular architecture (17 service modules)

**Database:**
- PostgreSQL 16 (81 tables, 10 categories)
- Prisma ORM (type-safe queries)
- Read replicas for scaling

**Cache & Jobs:**
- Redis 7 (session storage, rate limiting)
- BullMQ (async job processing)

**Storage:**
- AWS S3 (avatars, projects, portfolios)
- CloudFront CDN

**AI:**
- AWS Bedrock (Claude 3 Haiku + Sonnet)
- Cost-optimized: 80% Haiku ($0.25/$1.25 per 1M tokens) + 20% Sonnet ($3/$15 per 1M tokens)
- Prompt caching enabled (90% cost reduction on system prompts)

**Observability:**
- OpenTelemetry (distributed tracing)
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (structured logs)
- Sentry (error tracking)

**Security:**
- JWT authentication (15min access, 7 days refresh)
- Role-based access control (RBAC)
- Rate limiting (per-user, per-IP)
- Content moderation (AI + human queue)
- AWS WAF + Shield (DDoS protection)

### Database Schema (81 Tables)

**Categories:**
1. **Identity** (8 tables) — Users, Learners, Guardians, Guardianships
2. **Curriculum** (15 tables) — Domains, Skills, Competencies, Objectives, Activities
3. **Mastery** (6 tables) — MasteryRecords, Evidence, ReviewSchedule
4. **Missions** (12 tables) — Missions, Stages, MissionRuns, ActivityAttempts
5. **Projects** (8 tables) — Projects, Milestones, Artifacts, Feedback
6. **Progression** (10 tables) — XP, Coins, Achievements, Inventory, Streaks
7. **Community** (12 tables) — Guilds, Messages, Showcases, Moderation, Reports
8. **Characters & AI** (8 tables) — Characters, Conversations, ConversationTurns
9. **Content** (6 tables) — ContentBlocks, Templates
10. **Analytics** (6 tables) — Events, Reports

**Key Features:**
- UUID primary keys (distributed-friendly)
- JSONB for flexible metadata
- Soft deletes where needed
- Audit timestamps (createdAt, updatedAt)
- Strategic indexes on foreign keys & query fields

### Service Modules (17)

1. **AuthService** — Registration, login, JWT, OAuth
2. **LearnerService** — Learner profiles, preferences
3. **CurriculumService** — Domains, skills, competencies (read-only)
4. **MissionService** — Mission browsing, MissionRun execution
5. **MasteryService** — Confidence algorithm, evidence collection ⭐
6. **ProjectService** — CRUD, S3 uploads, portfolio
7. **ProgressionService** — XP, coins, levels, achievements
8. **CommunityService** — Guilds, messaging, showcases
9. **ModerationService** — AI pre-screen, human queue ⭐
10. **ParentService** — Dashboard, reports, controls
11. **AIGatewayService** — Bedrock integration, model routing ⭐
12. **AdaptiveService** — Difficulty decisions, ZPD targeting
13. **VoiceService** — TTS/STT (future)
14. **ContentService** — Dynamic content generation
15. **AnalyticsService** — Event tracking, reporting
16. **SafetyService** — PII detection, profanity, prompt injection
17. **NotificationService** — Email, push, in-app

---

## 📋 IMPLEMENTATION MILESTONES

### MVP (Phases 1-6): 11 weeks, 2 developers

**Features:**
- ✅ Database foundation (81 tables)
- ✅ Authentication & authorization
- ✅ Mastery confidence algorithm (evidence-based)
- ✅ Mission execution & activity evaluation
- ✅ AI-powered conversation (Azouz)
- ✅ Content moderation (child safety)
- ✅ Adaptive difficulty (ZPD targeting)

**Deliverable:** Core learning system functional

---

### Production-Ready (Phases 1-10): 20 weeks, 2 developers

**Additional Features:**
- ✅ Projects & portfolio (S3 uploads)
- ✅ Gamification (XP, coins, achievements)
- ✅ Community (guilds, safe messaging, moderation queue)
- ✅ Parent dashboard (reports, controls)

**Deliverable:** Full platform features, ready for beta launch

---

### Full Platform (Phases 1-12): 24 weeks, 2 developers

**Additional Features:**
- ✅ Analytics & observability (OpenTelemetry, Grafana)
- ✅ Production hardening (security audit, load testing)
- ✅ Performance optimization (caching, query optimization)

**Deliverable:** Production-hardened, can scale to 10K+ users

---

## 💰 COST BREAKDOWN

### Development Costs

**Team:** 2 Full-Stack Developers @ $50/hour
- MVP (11 weeks): ~$44K
- Production-Ready (20 weeks): ~$80K
- Full Platform (24 weeks): ~$96K

### Infrastructure Costs (Monthly)

**For 1,000 Users:**

| Service | Configuration | Cost |
|---------|--------------|------|
| AWS Bedrock (AI) | 10M tokens/month (80% Haiku, 20% Sonnet) | $330 |
| RDS PostgreSQL | db.t3.medium, Multi-AZ | $85 |
| ElastiCache Redis | cache.t3.micro | $15 |
| ECS Fargate | 2 tasks (0.5 vCPU, 1GB each) | $35 |
| S3 + CloudFront | 50GB storage, 100GB transfer | $10 |
| ALB | 2 Load Capacity Units | $25 |
| NAT Gateway | 1 gateway | $32 |
| Secrets Manager | 10 secrets | $4 |
| CloudWatch | Logs + metrics | $20 |
| Grafana Cloud (optional) | Basic tier | $50 |
| **Total** | | **~$556/month** |

**For 10,000 Users:** ~$1,200/month (primarily AI cost scaling)

**Cost Optimization:**
- Prompt caching: 90% reduction on system prompts
- Model routing: 80% Haiku (cheap) + 20% Sonnet (accurate)
- Rate limiting: 10-20 messages/hour per learner
- Result: $0.33-0.56/learner/month AI cost

---

## 🔒 CRITICAL SAFETY FEATURES

**Child Safety is Priority #1 across all phases:**

### Content Moderation (Phase 5 & 9)
- **AI Pre-screening**: All user content (messages, comments, descriptions)
- **PII Detection**: Block names, emails, phone numbers, addresses
- **Profanity Filtering**: Age-appropriate word lists (8-9, 10-11, 12-14)
- **Prompt Injection Detection**: Prevent LLM manipulation
- **Human Moderation Queue**: Flagged content reviewed by humans
- **Zero Tolerance**: Unsafe content never reaches children

### Privacy Controls (Phase 2 & 10)
- **Display Names Only**: No real names exposed
- **Parental Consent**: COPPA-compliant guardian relationships
- **Parental Controls**: Disable messaging, community, projects
- **Approval Workflows**: Public content requires guardian approval
- **Block Functionality**: Prevent unwanted interactions
- **Report System**: Easy reporting of unsafe behavior

### AI Safety (Phase 5)
- **AWS Bedrock Guardrails**: Built-in content filters
- **System Prompts**: Age-appropriate, educational focus
- **Rate Limiting**: 10-20 messages/hour (prevent abuse)
- **Output Moderation**: AI responses checked before display
- **Fallback Messages**: Safe defaults when AI blocked

---

## 🎯 CRITICAL PATH (Must-Do Features)

**These features are required for MVP launch:**

### P0 — Cannot Launch Without

1. **Mastery Confidence Algorithm** (Phase 3) — Core learning engine
   - Evidence-based mastery calculation
   - 7 mastery states (NOT_STARTED → MASTERED)
   - 8 evidence types (KNOWLEDGE, APPLICATION, CREATION, etc.)
   - Spaced repetition scheduling (FSRS-based)

2. **AI Gateway** (Phase 5) — Bedrock integration
   - Claude 3 Haiku + Sonnet model routing
   - Prompt caching for cost optimization
   - Error handling & retries

3. **Content Moderation** (Phase 5 & 9) — Child safety
   - AI pre-screening (PII, profanity, prompt injection)
   - Human moderation queue
   - Report system

4. **Authentication** (Phase 2) — Secure access
   - JWT tokens (access + refresh)
   - Guardian-learner relationships
   - Parental consent workflow

5. **Database Foundation** (Phase 1) — Data persistence
   - 81-table Prisma schema
   - Migrations & seed data

---

## 📊 KEY METRICS TO TRACK

### Learning Metrics
- Evidence created per learner per day
- Mastery confidence distribution (by domain, skill)
- Competencies mastered per month
- Time to mastery per competency
- Review adherence (spaced repetition)

### Engagement Metrics
- Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- Session duration & frequency
- Missions completed per learner
- Projects created & completed
- Practice streaks

### AI Metrics
- AI requests per hour
- Token usage (Haiku vs Sonnet split)
- Cost per learner per month
- AI response latency (p95, p99)
- Cache hit rate (prompt caching)

### Safety Metrics
- Content flagged for moderation
- Human review queue depth
- False positive rate (safe content blocked)
- Reports submitted per 1K users
- Time to moderate (SLA)

### Performance Metrics
- API response time (p50, p95, p99)
- Database query latency
- Cache hit rate (Redis)
- Error rate by endpoint
- Job queue depth (BullMQ)

---

## 🚦 DECISION FRAMEWORK

### Why NestJS (Not Express)?
- TypeScript-first (matches frontend)
- Modular architecture (17 services)
- Built-in dependency injection
- Robust decorator system
- Easy testing & mocking

### Why PostgreSQL (Not MongoDB)?
- Relational curriculum graph (domains → skills → competencies)
- ACID transactions (critical for XP/coins)
- Complex joins (mastery by domain, evidence aggregation)
- Mature ecosystem (RDS, backups, replicas)
- JSONB for flexibility when needed

### Why Prisma (Not TypeORM)?
- Type-safe queries (catch errors at compile time)
- Auto-generated types from schema
- Migration system (version control for DB)
- Excellent DX (developer experience)
- Growing community

### Why Redis (Not Memcached)?
- Data structures (lists, sets, sorted sets for leaderboards)
- Pub/sub (real-time notifications)
- BullMQ job queue (async processing)
- Session storage with TTL
- Persistence (AOF, RDB)

### Why AWS Bedrock (Not OpenAI)?
- **Cost**: Claude 3 Haiku $0.25/$1.25 vs GPT-3.5-turbo $0.50/$1.50
- **Safety**: Built-in Guardrails for content filtering
- **Compliance**: AWS infrastructure, easier compliance
- **Prompt Caching**: 90% cost reduction on system prompts
- **No API keys**: IAM roles, more secure

---

## 🛠️ DEVELOPMENT WORKFLOW

### Local Development

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Run migrations
npx prisma migrate dev

# 4. Seed data
npx prisma db seed

# 5. Start API (watch mode)
npm run start:dev

# 6. View database
npx prisma studio
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Load testing
artillery run load-test.yml
```

### Database Operations

```bash
# Create migration
npx prisma migrate dev --name add_feature

# Reset database (dev only!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View data
npx prisma studio
```

---

## 📞 SUPPORT & RESOURCES

### Internal Documentation
- Phase-specific implementation guides (Phases 1-12)
- Quick Start Guide (30-minute setup)
- Deployment Guide (AWS production)
- API documentation (generated from NestJS)

### External Resources
- **NestJS Docs**: [https://docs.nestjs.com](https://docs.nestjs.com)
- **Prisma Docs**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **AWS Bedrock**: [https://aws.amazon.com/bedrock](https://aws.amazon.com/bedrock)
- **PostgreSQL**: [https://www.postgresql.org/docs](https://www.postgresql.org/docs)

### Community
- NestJS Discord: [https://discord.gg/nestjs](https://discord.gg/nestjs)
- Prisma Slack: [https://slack.prisma.io](https://slack.prisma.io)

---

## ✅ FINAL CHECKLIST

### Before Starting Development
- [ ] Read Gap Analysis (understand scope)
- [ ] Read Final Roadmap (architecture decisions)
- [ ] Complete Quick Start Guide (running locally)
- [ ] AWS account setup (Bedrock access)
- [ ] Frontend codebase reviewed (type contracts)

### Before MVP Launch (Phases 1-6)
- [ ] All P0 features implemented
- [ ] Mastery algorithm validated with test data
- [ ] AI moderation tested (child safety)
- [ ] Database migrations tested (rollback plan)
- [ ] Load testing passed (100 concurrent users)

### Before Production Launch (Phases 1-10)
- [ ] Security audit complete (checklist in Phase 12)
- [ ] COPPA compliance verified
- [ ] Parent dashboard functional
- [ ] Human moderation queue operational
- [ ] Monitoring & alerting configured
- [ ] Disaster recovery tested

### Before Scaling (Phases 1-12)
- [ ] Load testing passed (1K concurrent users)
- [ ] Cost optimization validated
- [ ] Performance benchmarks met (p95 < 200ms)
- [ ] Auto-scaling configured
- [ ] Observability stack deployed

---

## 🎉 YOU'RE READY TO BUILD!

**This documentation set contains everything needed to build USAM Learning Worlds backend from scratch to production.**

**Start with**: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

**Questions?** Refer to phase-specific documentation for detailed implementations.

**Good luck! 🚀**

---

**Documentation Version**: 1.0  
**Last Updated**: 2026-08-12  
**Status**: Complete (All 12 phases documented)

---

END OF README
