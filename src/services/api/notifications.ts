import { Notification } from '../../types/api';
import apiClient from './client';

export const notificationsApi = {
  mine: () =>
    apiClient.get<Notification[]>('/notifications/me'),

  unreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/me/unread-count'),

  markRead: (id: string) =>
    apiClient.patch<Notification>(`/notifications/${id}/read`),

  registerPushToken: (token: string) =>
    apiClient.post('/notifications/push-token', { token }),
};
