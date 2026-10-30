import { apiClient } from './client'
import type { ApiResponse, Course, PaginatedResponse, Subject } from '@/types'

export const coursesApi = {
  list: (params?: { page?: number; limit?: number; level?: string; subjectId?: string; search?: string }) =>
    apiClient.get<PaginatedResponse<Course>>('/courses', { params }),

  getById: (id: string) => apiClient.get<ApiResponse<Course>>(`/courses/${id}`),

  create: (data: Partial<Course>) => apiClient.post<ApiResponse<Course>>('/courses', data),

  update: (id: string, data: Partial<Course>) =>
    apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data),

  delete: (id: string) => apiClient.delete<ApiResponse<null>>(`/courses/${id}`),

  enroll: (id: string) => apiClient.post<ApiResponse<null>>(`/courses/${id}/enroll`),

  unenroll: (id: string) => apiClient.delete<ApiResponse<null>>(`/courses/${id}/enroll`),

  completeLesson: (courseId: string, lessonId: string) =>
    apiClient.post<ApiResponse<null>>(`/courses/${courseId}/lessons/${lessonId}/complete`),

  getSubjects: () => apiClient.get<ApiResponse<Subject[]>>('/subjects'),
}
