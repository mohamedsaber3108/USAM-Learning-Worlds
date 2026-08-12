import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MissionsBrowsePage } from '@/features/missions/pages/MissionsBrowsePage'
import { MissionDetailPage } from '@/features/missions/pages/MissionDetailPage'
import { MissionPlayerPage } from '@/features/missions/pages/MissionPlayerPage'
import { MissionCompletePage } from '@/features/missions/pages/MissionCompletePage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Missions */}
      <Route
        path="/missions"
        element={
          <ProtectedRoute>
            <MissionsBrowsePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/missions/:id"
        element={
          <ProtectedRoute>
            <MissionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/missions/play/:runId"
        element={
          <ProtectedRoute>
            <MissionPlayerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/missions/complete"
        element={
          <ProtectedRoute>
            <MissionCompletePage />
          </ProtectedRoute>
        }
      />

      {/* Projects */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
