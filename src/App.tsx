import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { useAuthStore } from '@/store/auth.store'
import { AppLayout } from '@/components/layout/AppLayout'

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// App pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CoursesPage } from '@/pages/courses/CoursesPage'
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage'
import { TasksPage } from '@/pages/tasks/TasksPage'
import { AssessmentsPage } from '@/pages/assessments/AssessmentsPage'
import { AssessmentTakePage } from '@/pages/assessments/AssessmentTakePage'
import { ProgressPage } from '@/pages/progress/ProgressPage'
import { AiTutorPage } from '@/pages/ai-tutor/AiTutorPage'
import { LibraryPage } from '@/pages/library/LibraryPage'
import { CommunityPage } from '@/pages/community/CommunityPage'
import { AdminPage } from '@/pages/admin/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 min
    },
  },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected routes */}
          <Route
            path="/"
            element={<PrivateRoute><AppLayout /></PrivateRoute>}
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="assessments/:id/take" element={<AssessmentTakePage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="ai-tutor" element={<AiTutorPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1d27',
            color: '#f1f5f9',
            border: '1px solid #2e3245',
            borderRadius: '0.75rem',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  )
}
