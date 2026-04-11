import { ActivitySession, SessionStats } from '../../types/api';
import apiClient from './client';

export interface CreateSessionDto {
  activityId: string;
  startsAt: string;
  endsAt: string;
  capacity?: number | null;
  priceCents?: number | null;
  locationName?: string;
  latitude?: number;
  longitude?: number;
}

export type UpdateSessionDto = Omit<Partial<CreateSessionDto>, 'activityId'>;

export const sessionsApi = {
  list: (activityId: string) =>
    apiClient.get<ActivitySession[]>('/sessions', { params: { activityId } }),

  getById: (id: string) =>
    apiClient.get<ActivitySession>(`/sessions/${id}`),

  stats: (id: string) =>
    apiClient.get<SessionStats>(`/sessions/${id}/stats`),

  create: (dto: CreateSessionDto) =>
    apiClient.post<ActivitySession>('/sessions', dto),

  update: (id: string, dto: UpdateSessionDto) =>
    apiClient.patch<ActivitySession>(`/sessions/${id}`, dto),

  notifyPaymentReminder: (id: string) =>
    apiClient.post<{ notified: number }>(`/sessions/${id}/notify-payment-reminder`),
};
