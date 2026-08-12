# 🎨 USAM Learning Worlds - Frontend

**Modern React + TypeScript frontend for the USAM Learning Worlds platform**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **React Router 6** - Client-side routing

### Styling
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide Icons** - Beautiful icon set

### State Management
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form state

### API & Validation
- **Axios** - HTTP client
- **Zod** - Schema validation
- **date-fns** - Date utilities

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                   # App configuration
│   │   ├── providers/         # Context providers
│   │   ├── router/            # Route configuration
│   │   └── store/             # Global state
│   ├── components/            # Reusable components
│   │   ├── ui/                # UI components
│   │   └── common/            # Shared components
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Learner dashboard
│   │   ├── missions/          # Mission system
│   │   ├── activities/        # Activity player
│   │   ├── projects/          # Project portfolio
│   │   ├── gamification/      # XP, achievements
│   │   ├── community/         # Community feed
│   │   └── parents/           # Parent dashboard
│   ├── lib/                   # Utilities
│   │   ├── api/               # API client
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Helper functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=USAM Learning Worlds
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter
- **Headings**: 700 (Bold)
- **Body**: 400 (Regular)

## 📱 Features to Build

### Phase 1: Authentication (Priority 1)
- [ ] Login page
- [ ] Registration page
- [ ] Password reset
- [ ] Protected routes

### Phase 2: Learner Dashboard (Priority 1)
- [ ] Overview widget
- [ ] Progress cards
- [ ] Recent activity
- [ ] Quick actions

### Phase 3: Missions System (Priority 2)
- [ ] Mission browser
- [ ] Mission details
- [ ] Activity player
- [ ] Progress tracking

### Phase 4: Gamification (Priority 2)
- [ ] XP display
- [ ] Achievement badges
- [ ] Streak calendar
- [ ] Leaderboard

### Phase 5: Projects (Priority 3)
- [ ] Project creation
- [ ] Portfolio view
- [ ] Project showcase
- [ ] Community browse

### Phase 6: Parent Dashboard (Priority 3)
- [ ] Child selector
- [ ] Progress overview
- [ ] Activity log
- [ ] Time controls

### Phase 7: Community (Priority 4)
- [ ] Feed view
- [ ] Search
- [ ] Trending projects
- [ ] Content reporting

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Architecture Guide](../docs/frontend/FRONTEND_ARCHITECTURE.md)
- [Component Guide](../docs/frontend/COMPONENTS.md) (Coming soon)
- [API Integration](../docs/frontend/API.md) (Coming soon)
- [State Management](../docs/frontend/STATE.md) (Coming soon)

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy Options
- **Vercel** (Recommended) - Connect GitHub repo
- **Netlify** - Drag & drop `dist/` folder
- **AWS S3** - Upload to S3 bucket
- **Render** - Connect GitHub repo

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all files
- Use functional components with hooks
- Keep components small and focused
- Write tests for critical paths

### Naming Conventions
- Components: PascalCase (`UserCard.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: PascalCase (`User.ts`)

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Submit PR
5. Code review
6. Merge to main

## 🤝 Contributing

See root [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

Copyright © 2024 USAM Learning Worlds. All rights reserved.

---

**Status**: 🏗️ Initial setup complete | Ready for development  
**Backend API**: http://localhost:3001/api
