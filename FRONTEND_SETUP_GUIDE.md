# 🎨 Frontend Setup Guide

## ✅ What's Been Done

1. ✅ Created `frontend/` directory
2. ✅ Created `package.json` with all dependencies
3. ✅ Created `README.md` with documentation
4. ✅ Created architecture documentation

## 🚀 Next Steps to Complete Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install all the packages defined in `package.json`:
- React 18 + React DOM
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Axios
- Framer Motion
- Lucide Icons

### Step 2: Create Configuration Files

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

#### `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `.env`
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=USAM Learning Worlds
```

#### `.env.example`
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=USAM Learning Worlds
```

### Step 3: Create Source Structure

```bash
mkdir -p src/app/providers
mkdir -p src/app/router
mkdir -p src/app/store
mkdir -p src/components/ui
mkdir -p src/components/common
mkdir -p src/features/auth
mkdir -p src/features/dashboard
mkdir -p src/features/missions
mkdir -p src/features/activities
mkdir -p src/features/projects
mkdir -p src/features/gamification
mkdir -p src/features/community
mkdir -p src/features/parents
mkdir -p src/lib/api
mkdir -p src/lib/hooks
mkdir -p src/lib/utils
mkdir -p src/types
mkdir -p src/styles
mkdir -p public/icons
mkdir -p public/images
```

### Step 4: Create Core Files

#### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>USAM Learning Worlds</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### `src/main.tsx`
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `src/App.tsx`
```typescript
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from './app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

#### `src/styles/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

#### `src/app/router/index.tsx`
```typescript
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
```

#### `src/lib/api/client.ts`
```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### `src/lib/utils/cn.ts`
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### `src/types/index.ts`
```typescript
export interface User {
  id: string
  email: string
  displayName: string
  userType: 'LEARNER' | 'EDUCATOR' | 'GUARDIAN'
  learner?: Learner
}

export interface Learner {
  id: string
  displayName: string
  ageBand: string
  avatarUrl?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}
```

### Step 5: Create First Feature (Authentication)

#### `src/features/auth/pages/LoginPage.tsx`
```typescript
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api/client'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await apiClient.post('/auth/login', data)
      localStorage.setItem('token', response.data.accessToken)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
```

### Step 6: Test the Setup

```bash
# Start the development server
npm run dev
```

Visit: `http://localhost:5173`

You should see the login page!

## 📚 Next Development Steps

1. **Complete Authentication** (2-3 hours)
   - Registration page
   - Protected routes
   - Auth context/hooks

2. **Build Dashboard** (4-5 hours)
   - Layout components
   - Progress widgets
   - Navigation

3. **Implement Missions** (6-8 hours)
   - Mission browser
   - Activity player
   - Progress tracking

4. **Add Gamification** (3-4 hours)
   - XP display
   - Achievements
   - Leaderboard

5. **Create Projects Module** (4-5 hours)
   - Project CRUD
   - Portfolio view
   - Showcase

6. **Parent Dashboard** (3-4 hours)
   - Child monitoring
   - Activity logs
   - Controls

7. **Community Features** (3-4 hours)
   - Feed
   - Search
   - Trending

## 🎨 UI Component Library

Consider adding **shadcn/ui** for pre-built components:

```bash
npx shadcn-ui@latest init
```

Then add components as needed:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

## 📦 Total Estimated Time

- **Setup**: ✅ 1 hour (Done!)
- **Authentication**: 3 hours
- **Dashboard**: 5 hours
- **Missions**: 8 hours
- **Gamification**: 4 hours
- **Projects**: 5 hours
- **Parents**: 4 hours
- **Community**: 4 hours

**Total Frontend Development: ~35-40 hours**

---

**Your backend is complete. This guide gives you everything to build the frontend!** 🚀
