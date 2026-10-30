import { apiClient } from './client'
import type { ApiResponse, NotificationList, Notification } from '@/types'

export const notificationsApi = {
  list: (onlyUnread = false) =>
    apiClient.get<ApiResponse<NotificationList>>('/notifications', {
      params: onlyUnread ? { unread: 'true' } : undefined,
    }),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.patch<ApiResponse<{ updated: number }>>('/notifications/read-all'),
}
