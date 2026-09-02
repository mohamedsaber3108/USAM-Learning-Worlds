import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { MissionsBrowsePage } from '@/features/missions/pages/MissionsBrowsePage'
import { MissionDetailPage } from '@/features/missions/pages/MissionDetailPage'
import { MissionPlayerPage } from '@/features/missions/pages/MissionPlayerPage'
import { MissionCompletePage } from '@/features/missions/pages/MissionCompletePage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import { CommunityPage } from '@/features/community/pages/CommunityPage'
import { AchievementsPage } from '@/features/gamification/pages/AchievementsPage'
import { LeaderboardPage } from '@/features/gamification/pages/LeaderboardPage'
import { ProgressPage } from '@/features/gamification/pages/ProgressPage'
import { CurriculumBrowsePage } from '@/features/learning/pages/CurriculumBrowsePage'
import { ConceptDetailPage } from '@/features/learning/pages/ConceptDetailPage'
import { LearningPathsPage } from '@/features/learning/pages/LearningPathsPage'
import { LearningPathDetailPage } from '@/features/learning/pages/LearningPathDetailPage'
import { ParentDashboardPage } from '@/features/parents/pages/ParentDashboardPage'
import { ParentTimeLimitsPage } from '@/features/parents/pages/ParentTimeLimitsPage'
import { VoiceChatPage } from '@/features/voice/pages/VoiceChatPage'
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

      {/* Learning / Curriculum */}
      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <CurriculumBrowsePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/concepts/:id"
        element={
          <ProtectedRoute>
            <ConceptDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/paths"
        element={
          <ProtectedRoute>
            <LearningPathsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/paths/:id"
        element={
          <ProtectedRoute>
            <LearningPathDetailPage />
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

      {/* Community */}
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        }
      />

      {/* Gamification */}
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        }
      />

      {/* Parents (guardian-only backend endpoints; no client role-gate yet — see followup) */}
      <Route
        path="/parents"
        element={
          <ProtectedRoute>
            <ParentDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parents/children/:learnerId/time-limits"
        element={
          <ProtectedRoute>
            <ParentTimeLimitsPage />
          </ProtectedRoute>
        }
      />

      {/* Voice Chat (Voice Pipeline v1) */}
      <Route
        path="/voice-chat"
        element={
          <ProtectedRoute>
            <VoiceChatPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
