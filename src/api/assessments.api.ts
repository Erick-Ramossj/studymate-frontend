import { apiClient } from './client'
import type { ApiResponse, Assessment, AssessmentStart, AssessmentResult, AssessmentStats, PaginatedResponse } from '@/types'

export const assessmentsApi = {
  history: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Assessment>>(`/assessments/history?page=${page}&limit=${limit}`),

  stats: () => apiClient.get<ApiResponse<AssessmentStats>>('/assessments/stats'),

  start: (subjectId: string, count = 5) =>
    apiClient.post<ApiResponse<AssessmentStart>>('/assessments/start', { subjectId, count }),

  submit: (assessmentId: string, answers: { questionId: string; answer: string }[]) =>
    apiClient.post<ApiResponse<AssessmentResult>>(`/assessments/${assessmentId}/submit`, { answers }),

  getResult: (id: string) =>
    apiClient.get<ApiResponse<Assessment>>(`/assessments/${id}/result`),
}
