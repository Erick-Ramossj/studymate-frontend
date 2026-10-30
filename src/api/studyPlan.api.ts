import { apiClient } from './client'
import type { ApiResponse, StudyPlan, PlanItemStatus } from '@/types'

export const studyPlanApi = {
  get: () => apiClient.get<ApiResponse<StudyPlan | null>>('/study-plan'),

  generate: (weeklyHours?: number) =>
    apiClient.post<ApiResponse<StudyPlan>>('/study-plan/generate', { weeklyHours }),

  updateItem: (itemId: string, status: PlanItemStatus) =>
    apiClient.patch<ApiResponse<StudyPlan>>(`/study-plan/items/${itemId}`, { status }),
}
