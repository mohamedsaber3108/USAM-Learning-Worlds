# TESTING GUIDE — USAM FOR KIDS

**Date:** 2026-08-13  
**Purpose:** Comprehensive testing guide for newly implemented features

---

## PREREQUISITES

### 1. Database Setup

```bash
cd "m:/USAM Learning Worlds/backend"

# Ensure PostgreSQL is running
# Check connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Generate Prisma Client (if not done)
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Seed database content
npx ts-node prisma/seeds/seed-english-strands.ts
npx ts-node prisma/seeds/seed-coding-concepts.ts
npx ts-node prisma/seeds/seed-arabic.ts
```

### 2. Backend Server

```bash
cd "m:/USAM Learning Worlds/backend"

# Install dependencies (if needed)
npm install

# Start development server
npm run start:dev

# Should see:
# [Nest] INFO [NestFactory] Starting Nest application...
# [Nest] INFO [InstanceLoader] AppModule dependencies initialized
# [Nest] INFO Application is running on: http://[::1]:3000
```

### 3. Frontend Server

```bash
cd "m:/USAM Learning Worlds"

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

---

## TEST SUITE 1: DATABASE CONTENT

### 1.1 English Strands

```bash
cd "m:/USAM Learning Worlds/backend"

# Open Prisma Studio
npx prisma studio

# Navigate to: english_strands table
# Verify:
# - 14 records exist
# - CEFR levels: A1 (7), A2 (2), B1 (3), B2 (2)
# - Order field: 1-14
# - All have isActive = true
```

**Expected Records:**
1. Reading Comprehension (A1)
2. Writing Skills (A1)
3. Speaking & Conversation (A1)
4. Listening Skills (A1)
5. Grammar Fundamentals (A1)
6. Vocabulary Building (A1)
7. Pronunciation & Phonics (A1)
8. Fluency Development (A2)
9. Storytelling (A2)
10. Presentation Skills (B1)
11. Academic English (B1)
12. Business English (B2)
13. Creative Writing (B1)
14. Critical Reading (B2)

### 1.2 Coding Concepts

```bash
# In Prisma Studio, navigate to: coding_concepts table
# Verify:
# - 18 records exist
# - Categories: BASICS (3), LOGIC (4), DATA (3), ALGORITHMS (3), DESIGN (5)
# - Difficulty: 1-5 stars
# - All have isActive = true
```

**Expected Records by Category:**

**BASICS (3):**
- Variables (difficulty: 1)
- Data Types (difficulty: 1)
- Operators (difficulty: 1)

**LOGIC (4):**
- Conditionals (difficulty: 2)
- Loops (difficulty: 2)
- Functions (difficulty: 2)
- Boolean Logic (difficulty: 2)

**DATA (3):**
- Arrays & Lists (difficulty: 3)
- Objects & Dictionaries (difficulty: 3)
- String Manipulation (difficulty: 2)

**ALGORITHMS (3):**
- Sorting (difficulty: 3)
- Searching (difficulty: 3)
- Recursion (difficulty: 4)

**DESIGN (5):**
- Classes & Objects (difficulty: 4)
- Modules & Imports (difficulty: 3)
- Events & Callbacks (difficulty: 4)
- Async Programming (difficulty: 5)
- APIs & Web Requests (difficulty: 4)

### 1.3 Arabic Translations

```bash
# In Prisma Studio, navigate to: translations table
# Verify:
# - ~20 records exist
# - Languages: ar, ar-EG
# - entityType: DOMAIN (18), CHARACTER (1), SYSTEM (1)
# - Domains translated: Mathematics, Science, Language, Technology, etc.
```

**Expected Translations:**
- 9 domains × 2 languages = 18 domain translations
- 1 Azouz character system prompt (ar-EG)
- 1 Egyptian Arabic phrase bank (SYSTEM entity)

---

## TEST SUITE 2: API ENDPOINTS

### 2.1 English API

#### List All Strands
```bash
curl http://localhost:3000/api/english/strands

# Expected: JSON array of 14 strands
# Verify fields: id, name, slug, description, cefrLevel, order, isActive
```

#### Filter by CEFR Level
```bash
curl "http://localhost:3000/api/english/strands?cefrLevel=A1"

# Expected: 7 strands (Reading, Writing, Speaking, Listening, Grammar, Vocabulary, Pronunciation)
```

#### Get Specific Strand
```bash
curl http://localhost:3000/api/english/strands/reading-comprehension

# Expected: Single strand object
```

#### Start Conversation (Requires Auth)
```bash
# First, login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Use token in Authorization header
curl -X POST http://localhost:3000/api/english/conversation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"animals","cefrLevel":"A1"}'

# Expected: Conversation response with AI-generated content
```

### 2.2 Coding API

#### List All Concepts
```bash
curl http://localhost:3000/api/coding/concepts

# Expected: JSON array of 18 concepts
```

#### Filter by Category
```bash
curl "http://localhost:3000/api/coding/concepts?category=BASICS"

# Expected: 3 concepts (Variables, Data Types, Operators)
```

#### Filter by Max Difficulty
```bash
curl "http://localhost:3000/api/coding/concepts?maxDifficulty=2"

# Expected: 10 concepts (all BASICS + LOGIC + String Manipulation)
```

#### Get Categories
```bash
curl http://localhost:3000/api/coding/categories

# Expected: ["BASICS", "LOGIC", "DATA", "ALGORITHMS", "DESIGN"]
```

#### Get Debug Help (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/coding/debug \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "x = 5\nprint(y)",
    "language": "python",
    "error": "NameError: name '\''y'\'' is not defined"
  }'

# Expected: Debug assistance with diagnosis and fix
```

### 2.3 Character API

#### List Characters
```bash
curl http://localhost:3000/api/characters

# Expected: Array of characters (including Azouz)
```

#### Get Character in Arabic
```bash
curl "http://localhost:3000/api/characters?language=ar-EG"

# Expected: Characters with Arabic translations
```

#### Chat with Azouz (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/characters/azouz/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Azouz!"}'

# Expected: Character response
```

---

## TEST SUITE 3: FRONTEND INTEGRATION

### 3.1 API Client Test

Open browser console and test API client:

```javascript
// Test English strands
api.english.listStrands().then(console.log);
// Expected: Array of 14 strands

// Test Coding concepts
api.coding.listConcepts().then(console.log);
// Expected: Array of 18 concepts

// Test Characters
api.characters.list().then(console.log);
// Expected: Array of characters
```

### 3.2 English Learning Page

1. Navigate to: `http://localhost:5173/english`
2. Open browser console
3. Verify:
   - Console shows: "✅ Loaded real English strands from backend: [...]"
   - No errors in console
   - Mock data still displays (integration in progress)

### 3.3 Azouz Panel (Real Backend)

1. Navigate to any page with Azouz panel
2. Send a message: "Hello Azouz!"
3. Verify:
   - Message appears in chat immediately (optimistic update)
   - Loading indicator shows (thinking animation)
   - Response appears from backend
   - No console errors

**Expected Behavior:**
- First message: Loads character and creates conversation
- Subsequent messages: Uses existing conversation
- Error handling: Shows error message if backend is down

### 3.4 Translation System

Test Arabic translation retrieval:

```javascript
// In browser console
api.translations.get('DOMAIN', 'domain-id', 'name', 'ar-EG')
  .then(console.log);

// Expected: Translation object with Arabic text
```

---

## TEST SUITE 4: ERROR HANDLING

### 4.1 Backend Down

1. Stop backend server
2. Navigate to English Learning page
3. Verify:
   - Loading state shows initially
   - Error message appears: "Failed to load strands"
   - Retry button available
   - Fallback to mock data in console warning

### 4.2 Authentication Required

1. Try to send message without login:
```bash
curl -X POST http://localhost:3000/api/english/conversation \
  -H "Content-Type: application/json" \
  -d '{"topic":"test"}'

# Expected: 401 Unauthorized
```

### 4.3 Invalid Concept/Strand

```bash
curl http://localhost:3000/api/coding/concepts/invalid-slug

# Expected: null or 404
```

---

## TEST SUITE 5: PERFORMANCE

### 5.1 Load Times

**Database Queries:**
- English strands: < 50ms
- Coding concepts: < 50ms
- Translations: < 100ms

**API Endpoints:**
- List endpoints: < 200ms
- Chat endpoints: 2-5s (AI generation)
- Debug endpoints: 2-5s (AI generation)

### 5.2 Frontend Load

1. Open DevTools → Network tab
2. Navigate to English Learning page
3. Verify:
   - API call to `/api/english/strands` completes < 500ms
   - No redundant API calls
   - Page interactive < 1s

---

## TEST SUITE 6: DATA INTEGRITY

### 6.1 Idempotent Seeds

Run seed scripts multiple times:

```bash
# Run twice
npx ts-node prisma/seeds/seed-english-strands.ts
npx ts-node prisma/seeds/seed-english-strands.ts

# Verify in Prisma Studio:
# - Still 14 records (not 28)
# - Data updated, not duplicated
```

### 6.2 Translation Consistency

Check that all domain translations match:

```bash
# In Prisma Studio
# 1. Count domains: should be ~12
# 2. Count domain translations: should be ~18-24 (domains × 2 languages)
# 3. Verify no orphaned translations
```

---

## DEBUGGING COMMON ISSUES

### Issue: "Failed to load strands"

**Causes:**
1. Backend not running
2. Database not seeded
3. Wrong API URL in `.env`

**Solution:**
```bash
# Check backend
curl http://localhost:3000/api/english/strands

# If fails, restart backend
cd backend && npm run start:dev

# Check .env
cat .env | grep VITE_API_URL
# Should be: VITE_API_URL=http://localhost:3000/api
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
cd backend
npx prisma generate
npm run start:dev
```

### Issue: "Empty database"

**Solution:**
```bash
cd backend
npx ts-node prisma/seeds/seed-english-strands.ts
npx ts-node prisma/seeds/seed-coding-concepts.ts
npx ts-node prisma/seeds/seed-arabic.ts
```

### Issue: "CORS error"

**Check backend CORS configuration:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:5173'],
  credentials: true,
});
```

---

## SUCCESS CRITERIA

### ✅ Database
- [ ] 14 English strands seeded
- [ ] 18 Coding concepts seeded
- [ ] ~20 Arabic translations seeded
- [ ] All records have correct data

### ✅ Backend API
- [ ] English endpoints return real data
- [ ] Coding endpoints return real data
- [ ] Character endpoints work with Arabic
- [ ] Authentication works
- [ ] Error handling works

### ✅ Frontend
- [ ] API client loads data successfully
- [ ] English page logs real strands
- [ ] Azouz panel sends/receives messages
- [ ] Error states display correctly
- [ ] Loading states display correctly

### ✅ Integration
- [ ] End-to-end English conversation works
- [ ] End-to-end Coding debug works
- [ ] Arabic translations retrievable
- [ ] No console errors in happy path

---

## NEXT STEPS AFTER TESTING

1. Replace remaining mock data in frontend
2. Complete UI integration for English/Coding pages
3. Add voice features (STT/TTS)
4. Implement full Arabic UI support
5. Add comprehensive error logging
6. Write automated tests

---

**Testing Complete:** Mark date when all tests pass  
**Issues Found:** Document in GitHub Issues  
**Performance Benchmarks:** Record in separate performance log
