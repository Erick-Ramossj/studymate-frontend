import { apiClient } from './client'
import type { ApiResponse, Task, CreateTaskPayload, TaskStatus, PaginatedResponse } from '@/types'

export const tasksApi = {
  list: (params?: { status?: TaskStatus; priority?: string; subjectId?: string }) =>
    apiClient.get<PaginatedResponse<Task>>('/tasks', { params }),

  upcoming: () => apiClient.get<ApiResponse<Task[]>>('/tasks/upcoming'),

  overdue: () => apiClient.get<ApiResponse<Task[]>>('/tasks/overdue'),

  create: (data: CreateTaskPayload) => apiClient.post<ApiResponse<Task>>('/tasks', data),

  update: (id: string, data: Partial<CreateTaskPayload>) =>
    apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/tasks/${id}`),

  setStatus: (id: string, status: TaskStatus) =>
    apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status }),
}
