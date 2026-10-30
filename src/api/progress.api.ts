import { apiClient } from './client'
import type { ApiResponse, ProgressOverview, WeeklyDay, RiskScore, Enrollment } from '@/types'

export const progressApi = {
  overview: () => apiClient.get<ApiResponse<ProgressOverview>>('/progress/overview'),

  weekly: () => apiClient.get<ApiResponse<WeeklyDay[]>>('/progress/weekly'),

  courses: () => apiClient.get<ApiResponse<Enrollment[]>>('/progress/courses'),

  riskScore: () => apiClient.get<ApiResponse<RiskScore>>('/risk/score'),

  recalculateRisk: () => apiClient.post<ApiResponse<RiskScore>>('/risk/recalculate'),
}
