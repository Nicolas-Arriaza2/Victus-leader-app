import { Activity, ActivityDashboard, ActivityType, ActivityPricingModel } from '../../types/api';
import apiClient from './client';

export interface CreateActivityDto {
  slug: string;
  title: string;
  type: ActivityType;
  description?: string;
  interestIds?: string[];
  pricingModel?: ActivityPricingModel;
  monthlyPriceCents?: number;
}

export interface UpdateActivityDto {
  title?: string;
  description?: string;
  type?: ActivityType;
  isActive?: boolean;
  interestIds?: string[];
  pricingModel?: ActivityPricingModel;
  monthlyPriceCents?: number;
}

export const activitiesApi = {
  list: (params?: { type?: ActivityType; interestId?: string }) =>
    apiClient.get<Activity[]>('/activities', { params }),

  mine: () =>
    apiClient.get<Activity[]>('/activities/mine'),

  getById: (id: string) =>
    apiClient.get<Activity>(`/activities/${id}`),

  dashboard: (id: string) =>
    apiClient.get<ActivityDashboard>(`/activities/${id}/dashboard`),

  create: (dto: CreateActivityDto) =>
    apiClient.post<Activity>('/activities', dto),

  update: (id: string, dto: UpdateActivityDto) =>
    apiClient.patch<Activity>(`/activities/${id}`, dto),
};
