#!/bin/bash

# Integration Test Script
# Tests complete flow: Database → Backend API → Frontend

echo "🧪 USAM Integration Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Backend Health
echo "📡 Testing Backend..."
if curl -s http://localhost:3000/api/characters > /dev/null 2>&1; then
  pass "Backend is running"
else
  fail "Backend is not responding"
  echo ""
  echo "❌ Backend must be running. Start it with:"
  echo "   cd backend && npm run start:dev"
  exit 1
fi

# Test 2: English Strands
echo ""
echo "📚 Testing English API..."
STRANDS=$(curl -s http://localhost:3000/api/english/strands)
STRAND_COUNT=$(echo "$STRANDS" | jq '. | length' 2>/dev/null)

if [ "$STRAND_COUNT" = "14" ]; then
  pass "English strands: 14 records loaded"
else
  fail "English strands: Expected 14, got $STRAND_COUNT"
  warn "Run: cd backend && npx ts-node prisma/seeds/seed-english-strands.ts"
fi

# Test 3: Coding Concepts
echo ""
echo "💻 Testing Coding API..."
CONCEPTS=$(curl -s http://localhost:3000/api/coding/concepts)
CONCEPT_COUNT=$(echo "$CONCEPTS" | jq '. | length' 2>/dev/null)

if [ "$CONCEPT_COUNT" = "18" ]; then
  pass "Coding concepts: 18 records loaded"
else
  fail "Coding concepts: Expected 18, got $CONCEPT_COUNT"
  warn "Run: cd backend && npx ts-node prisma/seeds/seed-coding-concepts.ts"
fi

# Test 4: Coding Categories
echo ""
echo "🗂️  Testing Coding Categories..."
CATEGORIES=$(curl -s http://localhost:3000/api/coding/categories)
CATEGORY_COUNT=$(echo "$CATEGORIES" | jq '. | length' 2>/dev/null)

if [ "$CATEGORY_COUNT" = "5" ]; then
  pass "Coding categories: 5 categories found"
else
  fail "Coding categories: Expected 5, got $CATEGORY_COUNT"
fi

# Test 5: English Strand Details
echo ""
echo "📖 Testing English Strand Details..."
READING=$(curl -s http://localhost:3000/api/english/strands/reading-comprehension)
READING_NAME=$(echo "$READING" | jq -r '.name' 2>/dev/null)

if [ "$READING_NAME" = "Reading Comprehension" ]; then
  pass "Strand details: Reading Comprehension found"
else
  fail "Strand details: Could not load reading-comprehension"
fi

# Test 6: Coding Concept Details
echo ""
echo "🔍 Testing Coding Concept Details..."
VARIABLES=$(curl -s http://localhost:3000/api/coding/concepts/variables)
VARIABLES_NAME=$(echo "$VARIABLES" | jq -r '.name' 2>/dev/null)

if [ "$VARIABLES_NAME" = "Variables" ]; then
  pass "Concept details: Variables found"
else
  fail "Concept details: Could not load variables concept"
fi

# Test 7: Characters API
echo ""
echo "🤖 Testing Characters API..."
CHARACTERS=$(curl -s http://localhost:3000/api/characters)
HAS_AZOUZ=$(echo "$CHARACTERS" | jq 'any(.name == "Azouz")' 2>/dev/null)

if [ "$HAS_AZOUZ" = "true" ]; then
  pass "Characters: Azouz character found"
else
  fail "Characters: Azouz not found in character list"
fi

# Test 8: Arabic Translation
echo ""
echo "🌍 Testing Arabic Translation..."
CHARACTERS_AR=$(curl -s "http://localhost:3000/api/characters?language=ar-EG")
if echo "$CHARACTERS_AR" | jq -e '.' > /dev/null 2>&1; then
  pass "Arabic API: Returns valid JSON with language parameter"
else
  fail "Arabic API: Failed to load with language=ar-EG"
fi

# Test 9: Frontend Build
echo ""
echo "🎨 Testing Frontend..."
if [ -d "node_modules" ] && [ -f "package.json" ]; then
  pass "Frontend: Dependencies installed"
else
  warn "Frontend: node_modules missing, run 'npm install'"
fi

# Test 10: Environment Config
echo ""
echo "⚙️  Testing Configuration..."
if [ -f ".env" ]; then
  pass "Configuration: .env file exists"
  API_URL=$(grep VITE_API_URL .env | cut -d '=' -f2)
  if [ "$API_URL" = "http://localhost:3000/api" ]; then
    pass "Configuration: API URL correctly set"
  else
    warn "Configuration: API URL is $API_URL (expected http://localhost:3000/api)"
  fi
else
  fail "Configuration: .env file missing"
  warn "Copy .env.example to .env"
fi

# Summary
echo ""
echo "================================"
echo "📊 Test Results"
echo "================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "🚀 Ready to start frontend:"
  echo "   npm run dev"
  echo ""
  echo "📍 Navigate to:"
  echo "   http://localhost:5173/english-learning"
  echo "   http://localhost:5173/coding-learning"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo ""
  echo "🔧 Fix the issues above and run again"
  exit 1
fi
