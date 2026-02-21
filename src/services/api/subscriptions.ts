import { Subscription } from '../../types/api';
import apiClient from './client';

export interface ActivitySubscriber {
  id: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    profile: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  };
  billings: Array<{
    id: string;
    status: string;
    totalAmount: string;
    dueDate: string;
    paidAt: string | null;
  }>;
}

export const subscriptionsApi = {
  mine: () => apiClient.get<Subscription[]>('/subscriptions/mine'),

  getActivitySubscribers: (activityId: string) =>
    apiClient.get<ActivitySubscriber[]>(`/subscriptions/activity/${activityId}`),
};
