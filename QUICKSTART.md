# USAM FOR KIDS — QUICK START GUIDE

**Last Updated:** 2026-08-13  
**Status:** Sessions 1-3 Complete (60% MVP)

---

## 🚀 GET STARTED IN 5 MINUTES

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 16 running
- ✅ Git repository cloned

### Option 1: Automated Start (Recommended)

```bash
# Terminal 1: Start Backend
./scripts/start-backend.sh

# Terminal 2: Start Frontend
./scripts/start-frontend.sh

# Terminal 3: Run Integration Tests
./scripts/test-integration.sh
```

### Option 2: Manual Start

#### Backend
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run database migrations
npx prisma migrate dev

# 4. Seed database
npx ts-node prisma/seeds/seed-english-strands.ts
npx ts-node prisma/seeds/seed-coding-concepts.ts
npx ts-node prisma/seeds/seed-arabic.ts

# 5. Start server
npm run start:dev

# Backend running at: http://localhost:3000
```

#### Frontend
```bash
# In project root

# 1. Install dependencies
npm install

# 2. Create .env
cp .env.example .env

# 3. Start development server
npm run dev

# Frontend running at: http://localhost:5173
```

---

## 🎯 WHAT TO TEST

### 1. English Learning
**URL:** http://localhost:5173/english-learning

**What You'll See:**
- 14 English learning strands
- Grouped by CEFR level (A1, A2, B1, B2)
- Practice buttons (UI placeholders)

**Backend API:**
```bash
curl http://localhost:3000/api/english/strands
```

### 2. Coding Concepts
**URL:** http://localhost:5173/coding-learning

**What You'll See:**
- 18 coding concepts
- Grouped by 5 categories (BASICS, LOGIC, DATA, ALGORITHMS, DESIGN)
- Difficulty stars (1-5)
- Challenge buttons (UI placeholders)

**Backend API:**
```bash
curl http://localhost:3000/api/coding/concepts
```

### 3. Azouz Character (Arabic Support)
**URL:** Any page with Azouz panel

**What You'll See:**
- Chat interface with Azouz
- Egyptian Arabic welcome message
- Real-time AI responses

**Backend API:**
```bash
# List characters
curl http://localhost:3000/api/characters

# Get Azouz in Arabic
curl "http://localhost:3000/api/characters?language=ar-EG"
```

---

## 📊 VERIFY EVERYTHING WORKS

### Database Check
```bash
cd backend

# Open Prisma Studio
npx prisma studio

# Verify tables:
# - english_strands: 14 records
# - coding_concepts: 18 records
# - translations: ~20 records
```

### API Check
```bash
# English strands (should return 14)
curl http://localhost:3000/api/english/strands | jq 'length'

# Coding concepts (should return 18)
curl http://localhost:3000/api/coding/concepts | jq 'length'

# Coding categories (should return 5)
curl http://localhost:3000/api/coding/categories | jq 'length'
```

### Frontend Check

Open browser console on any page:

```javascript
// Test API client
api.english.listStrands().then(console.log);
// Expected: Array of 14 strands

api.coding.listConcepts().then(console.log);
// Expected: Array of 18 concepts

api.characters.list().then(console.log);
// Expected: Array with Azouz character
```

---

## 🔧 COMMON ISSUES

### Issue: Backend won't start
**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
cd backend
npx prisma generate
npm run start:dev
```

---

### Issue: Empty database
**Error:** API returns empty arrays `[]`

**Solution:**
```bash
cd backend
npx ts-node prisma/seeds/seed-english-strands.ts
npx ts-node prisma/seeds/seed-coding-concepts.ts
npx ts-node prisma/seeds/seed-arabic.ts
```

---

### Issue: Frontend can't connect to backend
**Error:** `Failed to fetch` in console

**Solution:**
1. Check backend is running: `curl http://localhost:3000/api/characters`
2. Check .env file: `VITE_API_URL=http://localhost:3000/api`
3. Restart frontend: `npm run dev`

---

### Issue: Port already in use
**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # or: netstat -ano | findstr :3000 (Windows)

# Kill the process
kill -9 <PID>  # or: taskkill /PID <PID> /F (Windows)
```

---

### Issue: TypeScript errors in frontend
**Error:** `Cannot find module '@/services/api'`

**Solution:**
```bash
# Restart TypeScript server in VS Code
# Or restart dev server
npm run dev
```

---

## 📚 NEXT STEPS

### Explore the Code

**Backend Services:**
- `backend/src/modules/ai/services/english-coach.service.ts` — English learning
- `backend/src/modules/ai/services/coding-coach.service.ts` — Coding education
- `backend/src/modules/learning/services/translation.service.ts` — Arabic translations

**Frontend Pages:**
- `src/pages/EnglishLearning.tsx` — English strands page
- `src/pages/CodingLearning.tsx` — Coding concepts page
- `src/components/character/AzouzPanel.tsx` — Azouz chat interface

**API Integration:**
- `src/services/api.ts` — Complete API client
- `src/hooks/useAzouz.ts` — Real-time character hook

### Test API Endpoints

See [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for comprehensive test suite.

**Quick tests:**
```bash
# English API
curl http://localhost:3000/api/english/strands
curl http://localhost:3000/api/english/strands/reading-comprehension

# Coding API
curl http://localhost:3000/api/coding/concepts
curl http://localhost:3000/api/coding/concepts/variables
curl http://localhost:3000/api/coding/categories

# Characters
curl http://localhost:3000/api/characters
curl "http://localhost:3000/api/characters?language=ar-EG"
```

### Review Documentation

- [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) — Complete testing guide
- [SESSION_3_COMPLETE.md](docs/SESSION_3_COMPLETE.md) — Latest implementation details
- [SESSIONS_1-3_MASTER_SUMMARY.md](docs/SESSIONS_1-3_MASTER_SUMMARY.md) — Complete overview
- [FINAL_MASTER_AUDIT.md](docs/FINAL_MASTER_AUDIT.md) — Project audit

---

## 🎮 DEMO SCENARIOS

### Scenario 1: English Conversation Practice

1. Navigate to http://localhost:5173/english-learning
2. Click "Practice" on "Speaking & Conversation"
3. (Coming soon: Conversation UI)

**Current Status:** API ready, UI in development

### Scenario 2: Coding Debug Help

1. Navigate to http://localhost:5173/coding-learning
2. Click "Challenge" on "Variables"
3. (Coming soon: Code editor + Debug interface)

**Current Status:** API ready, UI in development

### Scenario 3: Chat with Azouz in Arabic

1. Navigate to any page with Azouz panel
2. Type: "أهلا يا عزوز" (Hello Azouz)
3. Receive response in Egyptian Arabic

**Current Status:** ✅ Fully operational

---

## 🏗️ PROJECT STRUCTURE

```
USAM Learning Worlds/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── ai/            # AI services & controllers
│   │   │   └── learning/      # Learning services & controllers
│   │   └── prisma/
│   │       └── seeds/          # Database seed scripts
│   └── prisma/
│       └── schema.prisma       # Database schema
├── src/                        # React frontend
│   ├── pages/                  # Page components
│   │   ├── EnglishLearning.tsx
│   │   └── CodingLearning.tsx
│   ├── components/             # UI components
│   │   └── character/
│   │       └── AzouzPanel.tsx
│   ├── services/               # API clients
│   │   └── api.ts
│   ├── hooks/                  # React hooks
│   │   └── useAzouz.ts
│   └── routes/                 # TanStack Router routes
├── docs/                       # Documentation
│   ├── TESTING_GUIDE.md
│   ├── SESSION_3_COMPLETE.md
│   └── SESSIONS_1-3_MASTER_SUMMARY.md
├── scripts/                    # Utility scripts
│   ├── start-backend.sh
│   ├── start-frontend.sh
│   └── test-integration.sh
├── .env                        # Environment variables
└── QUICKSTART.md              # This file
```

---

## 📞 SUPPORT

### Issues?

1. Check [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) for detailed troubleshooting
2. Review console logs (both backend and frontend)
3. Verify database has seeded content (Prisma Studio)
4. Check all services are running

### Want to Contribute?

1. Read [SESSIONS_1-3_MASTER_SUMMARY.md](docs/SESSIONS_1-3_MASTER_SUMMARY.md) for project overview
2. Review [FINAL_MASTER_AUDIT.md](docs/FINAL_MASTER_AUDIT.md) for architecture details
3. Check [SESSION_3_COMPLETE.md](docs/SESSION_3_COMPLETE.md) for latest changes

---

## ✅ SUCCESS CHECKLIST

After running the quick start, you should have:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Database with 52 records (14 strands + 18 concepts + 20 translations)
- [ ] English Learning page showing 14 strands
- [ ] Coding Learning page showing 18 concepts
- [ ] Azouz chat working with real AI responses
- [ ] All API endpoints responding correctly

If all boxes are checked: **🎉 You're ready to develop!**

---

## 🚀 READY TO BUILD?

You now have a working AI-powered learning platform with:
- ✅ Real backend APIs
- ✅ Database-driven content
- ✅ Arabic translation support
- ✅ CEFR-aware English learning
- ✅ Multi-language coding education
- ✅ AI character conversations

**Next Steps:**
1. Build conversation practice UI
2. Build code editor + debug UI
3. Add authentication flow
4. Integrate voice (STT/TTS)
5. Complete Arabic content translations

---

**Happy Coding! 🎓**

*For detailed implementation history, see [SESSIONS_1-3_MASTER_SUMMARY.md](docs/SESSIONS_1-3_MASTER_SUMMARY.md)*
