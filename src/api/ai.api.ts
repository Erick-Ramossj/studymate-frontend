import { apiClient } from './client'
import type { ApiResponse, ChatSession, ChatMessage } from '@/types'

export interface ChatPayload {
  message: string
  sessionId?: string
  subject?: string
}

export interface ChatApiResponse {
  sessionId: string
  message: ChatMessage
}

export const aiApi = {
  chat: (payload: ChatPayload) =>
    apiClient.post<ApiResponse<ChatApiResponse>>('/ai/chat', payload),

  getSessions: () => apiClient.get<ApiResponse<ChatSession[]>>('/ai/sessions'),

  getSessionMessages: (sessionId: string) =>
    apiClient.get<ApiResponse<ChatMessage[]>>(`/ai/sessions/${sessionId}/messages`),

  explain: (topic: string, subject?: string) =>
    apiClient.post<ApiResponse<{ explanation: string }>>('/ai/explain', { topic, subject }),

  generateExercise: (topic: string, subject?: string) =>
    apiClient.post<ApiResponse<{ exercise: string }>>('/ai/generate-exercise', { topic, subject }),
}
