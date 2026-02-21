import { ActivityEnrollment } from '../../types/api';
import apiClient from './client';

export const enrollmentsApi = {
  listBySession: (sessionId: string) =>
    apiClient.get<ActivityEnrollment[]>('/enrollments', { params: { sessionId } }),

  mine: () =>
    apiClient.get<ActivityEnrollment[]>('/enrollments/mine'),

  updateStatus: (id: string, status: 'confirmed' | 'attended') =>
    apiClient.patch<ActivityEnrollment>(`/enrollments/${id}/status`, { status }),
};
