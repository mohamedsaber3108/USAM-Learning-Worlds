#!/bin/bash

# Start Frontend Development Server

echo "🎨 Starting USAM Frontend..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found, copying from .env.example..."
  cp .env.example .env
  echo "✓ Created .env"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "🎯 Starting Vite development server..."
npm run dev
