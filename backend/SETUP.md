# SETUP INSTRUCTIONS

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Setup Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update these values:
# - DATABASE_URL (default is fine for local development)
# - AWS credentials (if you want to test AI features)
# - JWT secrets (generate secure random strings)
```

## Step 3: Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps

# You should see:
# - usam-postgres (port 5432)
# - usam-redis (port 6379)
# - usam-pgadmin (port 5050)
```

## Step 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed initial data
npx prisma db seed
```

**Expected output:**
```
✅ Created test learner: learner@test.com
✅ Created test guardian: parent@test.com
✅ Created 12 domains
✅ Created sample skill: Number Sense
✅ Created Azouz character
🎉 Seed data complete!
```

## Step 5: Start the Server

```bash
npm run start:dev
```

**Expected output:**
```
✅ Database connected
🚀 USAM Learning Worlds Backend
📡 Server running on: http://localhost:3001
🏥 Health check: http://localhost:3001/api/health
📊 Environment: development
```

## Step 6: Test the API

Open a new terminal and run:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2026-08-12T...",
#   "database": "connected",
#   "version": "1.0.0",
#   "environment": "development"
# }

# Test domains endpoint
curl http://localhost:3001/api/domains

# Expected: JSON array with 12 domains
```

## Step 7: Explore the Database

```bash
# Open Prisma Studio
npx prisma studio
```

This opens a browser at [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Browse seeded data
- Run queries
- Edit records

## ✅ Verification Checklist

- [ ] Docker services running (`docker-compose ps`)
- [ ] PostgreSQL accessible on port 5432
- [ ] Redis accessible on port 6379
- [ ] Prisma migrations completed
- [ ] Seed data created (12 domains, 2 test users)
- [ ] API running on port 3001
- [ ] Health endpoint returns `status: "ok"`
- [ ] Domains endpoint returns 12 domains

## 🎉 Success!

You now have:
- ✅ PostgreSQL database with complete schema
- ✅ Redis cache
- ✅ Seeded test data (2 users, 12 domains, sample curriculum)
- ✅ Running NestJS API
- ✅ Health check working

## 🚀 Next Steps

1. **Review the codebase**:
   - `src/main.ts` - Application entry point
   - `src/app.module.ts` - Root module
   - `prisma/schema.prisma` - Database schema

2. **Start implementing Phase 2** (Authentication):
   - Follow [docs/backend/BACKEND_IMPLEMENTATION_PHASES.md](../docs/backend/BACKEND_IMPLEMENTATION_PHASES.md)
   - Implement JWT authentication
   - Add login/register endpoints

3. **Connect the frontend**:
   - Update frontend API base URL to `http://localhost:3001/api`
   - Test authentication flow

## 🆘 Common Issues

### "Port 5432 is already in use"
Another PostgreSQL instance is running. Either:
- Stop your local PostgreSQL: `brew services stop postgresql` (macOS)
- Change the port in `docker-compose.yml`

### "Cannot connect to database"
```bash
# Check Docker services
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### "Prisma Client not found"
```bash
# Regenerate Prisma Client
npx prisma generate
```

### "Migration failed"
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Re-run setup
npx prisma migrate dev
npx prisma db seed
```

## 📞 Need Help?

Refer to complete documentation:
- [backend/README.md](README.md) - Backend overview
- [docs/backend/QUICK_START_GUIDE.md](../docs/backend/QUICK_START_GUIDE.md) - Detailed setup
- [docs/backend/README.md](../docs/backend/README.md) - Complete documentation index
