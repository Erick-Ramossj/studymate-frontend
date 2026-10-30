import { apiClient } from './client'
import type { ApiResponse, AuthResponse, AuthTokens } from '@/types'

export const authApi = {
  register: (payload: {
    name: string
    email: string
    password: string
    role?: string
    educationLevel?: string
    field?: string
    age?: number
  }) => apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken }),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),
}
