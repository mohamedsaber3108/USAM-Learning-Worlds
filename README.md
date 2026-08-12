# 🎓 USAM Learning Worlds

**An AI-powered adaptive learning platform for K-12 education**

[![Backend](https://img.shields.io/badge/Backend-Complete-success)](./backend)
[![Database](https://img.shields.io/badge/Database-81%20Tables-blue)](./backend/prisma/schema.prisma)
[![API Endpoints](https://img.shields.io/badge/API-70%2B%20Endpoints-brightgreen)](./docs/backend)

## 📋 Project Status

**Backend Implementation: ✅ COMPLETE** (All 10 phases finished)

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Database Foundation (81-table schema, Docker) |
| **Phase 2** | ✅ Complete | Authentication & Authorization |
| **Phase 3** | ✅ Complete | Mastery Algorithm |
| **Phase 4** | ✅ Complete | Missions & Activities |
| **Phase 5** | ✅ Complete | AI Gateway & Safety |
| **Phase 6** | ✅ Complete | Adaptive Engine |
| **Phase 7** | ✅ Complete | Projects & Portfolio |
| **Phase 8** | ✅ Complete | Gamification |
| **Phase 9** | ✅ Complete | Community & Moderation |
| **Phase 10** | ✅ Complete | Parent System |

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
docker-compose up -d
npm run prisma:push
npm run seed
npm run start:dev
```

Server: `http://localhost:3001` | Docs: [Backend Setup Guide](./backend/SETUP.md)

### Frontend Setup (Coming Soon)

```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Architecture

### Tech Stack

- **Backend**: NestJS, PostgreSQL, Prisma, Redis, BullMQ, AWS Bedrock
- **Frontend**: React, TypeScript, TailwindCSS (Planned)
- **Database**: 81 tables, 10 logical groups
- **AI**: Claude 3.5 Sonnet via AWS Bedrock

### API Modules (70+ Endpoints)

✅ Auth (4) | ✅ Mastery (5) | ✅ Missions (7) | ✅ AI (7) | ✅ Adaptive (7)  
✅ Projects (8) | ✅ Gamification (8) | ✅ Community (7) | ✅ Parents (6)

## 📚 Key Features

### 🧠 Mastery Algorithm
- 4-factor confidence calculation
- 7 mastery states (NOT_STARTED → EXPERT)
- FSRS-inspired spaced repetition
- 8 evidence types

### 🎯 Adaptive Learning
- ZPD-based difficulty adjustment
- Personalized recommendations
- Growth velocity tracking

### 🤖 AI Integration
- Smart feedback & hints
- Auto-moderation
- Response analysis

### 🎮 Gamification
- XP & Levels
- 18 Achievements
- Practice Streaks
- Leaderboards

### 👨‍👩‍👧‍👦 Parent Dashboard
- Child monitoring
- Activity logs
- Time limits

## 📖 Documentation

- [Backend Docs](./docs/backend/README.md) - Complete API reference
- [Setup Guide](./backend/SETUP.md) - Installation
- [Deployment](./docs/backend/DEPLOYMENT_GUIDE.md) - Production
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Progress

## 🧪 Testing

All 70+ endpoints tested ✅

```bash
cd backend
npm run test:e2e
```

## 📊 Database Schema

**81 tables in 10 groups:**  
Users & Auth | Learning Structure | Mastery System | Missions | Projects  
Gamification | Social | Parent System | AI & Analytics | Content & Moderation

See: [Schema Documentation](./backend/prisma/schema.prisma)

## 🔐 Security

- JWT authentication
- Role-based access control
- Password hashing (bcrypt)
- AI content moderation
- Parent verification

## 🤝 Contributing

Proprietary project. Contact owner for collaboration.

## 📄 License

Copyright © 2024 USAM Learning Worlds. All rights reserved.

---

**Status**: Backend Complete ✅ | **API Endpoints**: 70+ | **Database Tables**: 81