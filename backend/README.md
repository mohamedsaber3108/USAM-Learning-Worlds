# USAM Learning Worlds Backend

AI-native learning platform backend for children aged 8-14.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env

# 3. Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run database migrations
npm run prisma:migrate

# 6. Seed initial data
npm run prisma:seed

# 7. Start the API
npm run start:dev
```

The API will be running at [http://localhost:3001](http://localhost:3001)

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get domains
curl http://localhost:3001/api/domains
```

### Test Accounts

Created by seed script:
- **Learner**: learner@test.com / password123
- **Guardian**: parent@test.com / password123

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (81 tables)
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Migration history
├── src/
│   ├── database/
│   │   ├── prisma.service.ts  # Database service
│   │   └── database.module.ts # Database module
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Health check controller
│   ├── app.service.ts         # App service
│   └── main.ts                # Application entry point
├── docker-compose.yml         # Docker services
├── package.json               # Dependencies
└── .env.example               # Environment template
```

## 🗄️ Database

### Access Tools

- **Prisma Studio**: `npm run prisma:studio` → [http://localhost:5555](http://localhost:5555)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050) (admin@usam.local / admin)

### Database Operations

```bash
# Create new migration
npm run prisma:migrate

# Reset database (dev only!)
npx prisma migrate reset

# View data
npm run prisma:studio

# Generate Prisma Client
npm run prisma:generate
```

## 🔧 Development

```bash
# Start in development mode (watch)
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## 📊 Implementation Status

### ✅ Phase 1: Foundation (Complete)
- Docker Compose setup (PostgreSQL, Redis, pgAdmin)
- Prisma schema foundation
- Database module
- Health check endpoint
- Seed data

### 🚧 Next Steps

Refer to [docs/backend](../docs/backend/) for complete implementation guides:

1. **Phase 2**: Authentication & Authorization (JWT, OAuth)
2. **Phase 3**: Learning Core (Mastery algorithm) ⭐
3. **Phase 4**: Missions & Activities
4. **Phase 5**: AI Gateway & Safety ⭐
5. **Phase 6**: Adaptive Engine
6. **Phase 7**: Projects & Portfolio
7. **Phase 8**: Gamification
8. **Phase 9**: Community & Moderation ⭐
9. **Phase 10**: Parent System
10. **Phase 11**: Analytics & Observability
11. **Phase 12**: Production Hardening

## 🔐 Environment Variables

Required variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://usam:usam_password@localhost:5432/usam_learning_worlds"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# JWT
JWT_ACCESS_SECRET="change-in-production"
JWT_REFRESH_SECRET="change-in-production"

# AWS (for Bedrock AI)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"

# Application
NODE_ENV="development"
PORT="3001"
```

## 🐳 Docker Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## 📚 Documentation

Complete implementation guides available in:
- [docs/backend/QUICK_START_GUIDE.md](../docs/backend/QUICK_START_GUIDE.md)
- [docs/backend/README.md](../docs/backend/README.md)
- Phase-specific guides (Phases 1-12)

## 🆘 Troubleshooting

### Database connection fails
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Port already in use
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change PORT in .env
```

### Prisma errors
```bash
# Clear cache and regenerate
npx prisma generate --clear-cache
npx prisma generate
```

## 🏗️ Tech Stack

- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis 7
- **AI**: AWS Bedrock (Claude 3)
- **Storage**: AWS S3

## 📄 License

UNLICENSED - Private project

---

**Ready to build!** Start with Phase 2 (Authentication) after completing Phase 1.
