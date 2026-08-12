# 🎨 Frontend Architecture

## Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (fast HMR)
- **React Router 6** - Navigation

### Styling
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library

### State Management
- **TanStack Query (React Query)** - Server state
- **Zustand** - Client state
- **React Hook Form** - Form state

### API & Data
- **Axios** - HTTP client
- **Zod** - Schema validation
- **date-fns** - Date utilities

### Development
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Folder Structure

```
frontend/
├── public/                    # Static assets
│   ├── icons/
│   └── images/
├── src/
│   ├── app/                   # App configuration
│   │   ├── providers/         # Context providers
│   │   ├── router/            # Route configuration
│   │   └── store/             # Global state
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── common/            # Shared components
│   │   ├── layouts/           # Layout components
│   │   └── features/          # Feature-specific components
│   ├── features/              # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── dashboard/         # Learner dashboard
│   │   ├── missions/          # Mission system
│   │   ├── activities/        # Activity player
│   │   ├── projects/          # Project portfolio
│   │   ├── gamification/      # XP, achievements, etc.
│   │   ├── community/         # Community feed
│   │   └── parents/           # Parent dashboard
│   ├── lib/                   # Utilities
│   │   ├── api/               # API client
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Helper functions
│   │   └── constants/         # Constants
│   ├── types/                 # TypeScript types
│   ├── styles/                # Global styles
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
├── .env.example               # Environment variables template
├── tailwind.config.js         # Tailwind configuration
├── vite.config.ts             # Vite configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Features Architecture

### 1. Authentication Flow
```
LoginPage → API → JWT Token → Store in localStorage
         → Set Axios interceptor
         → Redirect to Dashboard
```

### 2. API Client Setup
```typescript
// Axios instance with interceptors
- Base URL from env
- Auto-attach JWT token
- Auto-refresh on 401
- Error handling
- Loading states
```

### 3. Protected Routes
```typescript
<ProtectedRoute>
  - Check if authenticated
  - Verify user role
  - Redirect to login if not
</ProtectedRoute>
```

### 4. Data Fetching Pattern
```typescript
// Using TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['missions'],
  queryFn: () => api.missions.getAll()
})
```

## Design System

### Color Palette
```css
Primary: Blue (#3B82F6)
Secondary: Purple (#8B5CF6)
Success: Green (#10B981)
Warning: Yellow (#F59E0B)
Error: Red (#EF4444)
Neutral: Gray shades
```

### Typography
```css
Font Family: Inter
Headings: 700 (Bold)
Body: 400 (Regular)
Small: 300 (Light)
```

### Spacing Scale
```css
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

## Component Patterns

### 1. Feature Component Structure
```typescript
features/missions/
├── components/
│   ├── MissionCard.tsx
│   ├── MissionList.tsx
│   └── MissionDetails.tsx
├── hooks/
│   ├── useMissions.ts
│   └── useMissionRun.ts
├── api/
│   └── missions.api.ts
├── types/
│   └── mission.types.ts
└── index.ts
```

### 2. API Hook Pattern
```typescript
export const useMissions = () => {
  return useQuery({
    queryKey: ['missions'],
    queryFn: () => api.get('/missions')
  })
}

export const useStartMission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.post(`/missions/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries(['missions'])
    }
  })
}
```

### 3. Form Pattern
```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

## State Management Strategy

### Server State (TanStack Query)
- API data
- Caching & synchronization
- Automatic refetching
- Optimistic updates

### Client State (Zustand)
- UI state (modals, sidebars)
- User preferences
- Theme settings
- Temporary form data

### Form State (React Hook Form)
- Form inputs
- Validation
- Submission

## Performance Optimization

### Code Splitting
```typescript
const Dashboard = lazy(() => import('./features/dashboard'))
const Missions = lazy(() => import('./features/missions'))
```

### Image Optimization
- WebP format
- Lazy loading
- Blur placeholders
- Responsive images

### Bundle Optimization
- Tree shaking
- Minification
- Compression
- CDN delivery

## Accessibility (a11y)

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast (WCAG AA)

## Responsive Design

### Breakpoints
```css
sm: 640px   (Mobile)
md: 768px   (Tablet)
lg: 1024px  (Laptop)
xl: 1280px  (Desktop)
2xl: 1536px (Large Desktop)
```

### Mobile-First Approach
- Design for mobile first
- Progressive enhancement
- Touch-friendly targets
- Optimized performance

## Testing Strategy

### Unit Tests (Vitest)
- Components
- Hooks
- Utils
- API functions

### Integration Tests
- User flows
- Form submissions
- API interactions

### E2E Tests (Playwright)
- Critical paths
- Authentication
- Mission completion
- Project creation

## Deployment

### Build Process
```bash
npm run build
npm run preview  # Test production build
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
VITE_AWS_REGION=us-east-1
```

### Hosting Options
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront
- Render

## Development Workflow

1. **Feature Branch**: Create from `main`
2. **Development**: Build feature with tests
3. **Code Review**: PR with description
4. **Testing**: Run all tests
5. **Merge**: Squash and merge
6. **Deploy**: Automatic deployment

## Next Steps

1. ✅ Setup Vite + React + TypeScript
2. ⏳ Install dependencies (TailwindCSS, shadcn/ui)
3. ⏳ Configure routing
4. ⏳ Setup API client
5. ⏳ Implement authentication
6. ⏳ Build core layouts
7. ⏳ Create feature modules
8. ⏳ Add testing
9. ⏳ Deploy to production

---

**Architecture Goal**: Scalable, maintainable, performant, accessible web application
