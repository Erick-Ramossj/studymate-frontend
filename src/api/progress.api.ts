import { apiClient } from './client'
import type {
  ApiResponse,
  ProgressOverview,
  WeeklyDay,
  RiskScore,
  Enrollment,
  AtRiskStudent,
  AbandonmentAlert,
} from '@/types'

export const progressApi = {
  overview: () => apiClient.get<ApiResponse<ProgressOverview>>('/progress/overview'),

  weekly: () => apiClient.get<ApiResponse<WeeklyDay[]>>('/progress/weekly'),

  courses: () => apiClient.get<ApiResponse<Enrollment[]>>('/progress/courses'),

  riskScore: () => apiClient.get<ApiResponse<RiskScore>>('/risk/score'),

  recalculateRisk: () => apiClient.post<ApiResponse<RiskScore>>('/risk/recalculate'),

  // Advisor / teacher / admin: at-risk students they are responsible for.
  atRiskStudents: (scope?: 'advisees' | 'all') =>
    apiClient.get<ApiResponse<AtRiskStudent[]>>('/risk/students', {
      params: scope ? { scope } : undefined,
    }),

  resolveAlert: (alertId: string, note?: string) =>
    apiClient.patch<ApiResponse<AbandonmentAlert>>(
      `/risk/alerts/${alertId}/resolve`,
      { note },
    ),
}
