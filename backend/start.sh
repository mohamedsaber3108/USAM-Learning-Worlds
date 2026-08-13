#!/bin/bash
export NODE_ENV="production"
export PORT="3001"
export DATABASE_URL='postgresql://usam_user:USAM_SecurePass_2026!@localhost:5432/usam_learning_worlds?schema=public'
export JWT_ACCESS_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
export JWT_REFRESH_SECRET="z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1"
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export AWS_REGION="us-east-1"
export CORS_ORIGINS="http://16.16.128.228"

cd /home/ubuntu/USAM-Learning-Worlds/backend
node dist/src/main.js
