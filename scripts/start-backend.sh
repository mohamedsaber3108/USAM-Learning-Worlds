#!/bin/bash

# Start Backend Development Server
# Ensures database is seeded before starting

echo "🚀 Starting USAM Backend..."
echo ""

cd "$(dirname "$0")/../backend" || exit 1

# Check if Prisma Client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "📦 Generating Prisma Client..."
  npx prisma generate
fi

# Check if database is seeded
echo "🌱 Checking database content..."
STRAND_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM english_strands;" 2>/dev/null | grep -oP '\d+' | tail -1)

if [ "$STRAND_COUNT" = "14" ]; then
  echo "✓ Database already seeded"
else
  echo "⚠️  Database not seeded, seeding now..."
  npx ts-node prisma/seeds/seed-english-strands.ts
  npx ts-node prisma/seeds/seed-coding-concepts.ts
  npx ts-node prisma/seeds/seed-arabic.ts
fi

echo ""
echo "🎯 Starting NestJS server..."
npm run start:dev
