import { apiClient } from './client'
import type { ApiResponse, StudentDashboard, TeacherDashboard, AdminDashboard } from '@/types'

export const dashboardApi = {
  get: () =>
    apiClient.get<ApiResponse<StudentDashboard | TeacherDashboard | AdminDashboard>>('/dashboard'),
}
