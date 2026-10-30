import { apiClient } from './client'
import type { ApiResponse, User, Profile, PaginatedResponse } from '@/types'

export const usersApi = {
  getMe: () => apiClient.get<ApiResponse<User>>('/users/me'),

  updateMe: (data: Partial<Pick<User, 'name' | 'educationLevel' | 'field' | 'age' | 'avatarUrl'>>) =>
    apiClient.put<ApiResponse<User>>('/users/me', data),

  getMyProfile: () => apiClient.get<ApiResponse<Profile>>('/users/me/profile'),

  updateMyProfile: (data: Partial<Pick<Profile, 'bio' | 'learningStyle' | 'weeklyHours' | 'strengths' | 'weaknesses'>>) =>
    apiClient.put<ApiResponse<Profile>>('/users/me/profile', data),

  // Admin only
  listUsers: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`),

  setUserStatus: (id: string, isActive: boolean) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}/status`, { isActive }),
}
